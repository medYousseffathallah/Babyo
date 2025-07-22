from flask import Flask, jsonify, Response, request
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import time
import threading
import socket
from supabase import create_client
from datetime import datetime
import base64
import numpy as np


app = Flask(__name__)
CORS(app)

model = YOLO("best.pt")

last_crying_time = time.time() - 61



def send_alert_to_supabase():
    try:
        supabase.table("alerts").insert({
            "type": "crying",
            "timestamp": datetime.now().isoformat()
        }).execute()
    except Exception as e:
        print("Error sending alert to Supabase:", e)



# ---------------------- Routes API Flask ----------------------



@app.route('/detect_emotion', methods=['POST'])
def detect_emotion():
    data = request.json
    image_base64 = data.get('image')
    if not image_base64:
        return jsonify({'error': 'No image provided'}), 400
    img_data = base64.b64decode(image_base64)
    nparr = np.frombuffer(img_data, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if frame is None:
        return jsonify({'error': 'Invalid image'}), 400
    results = model(frame)
    img_height, img_width = frame.shape[:2]
    predictions = []
    detected_classes = []
    class_ids = results[0].boxes.cls.cpu().numpy().astype(int) if results[0].boxes is not None else []
    detected_classes = [model.names[class_id] for class_id in class_ids]
    cry_detected = 'Cry' in detected_classes or 'crying' in detected_classes
    global last_crying_time
    current_time = time.time()
    if cry_detected:
        if current_time - last_crying_time > 60:
            last_crying_time = current_time
            print("Crying detected! Sending alert...")
            send_alert_to_supabase()
    if results and results[0].boxes:
        for box in results[0].boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            pred = {
                'x': ((x1 + x2) / 2) / img_width,
                'y': ((y1 + y2) / 2) / img_height,
                'width': (x2 - x1) / img_width,
                'height': (y2 - y1) / img_height,
                'confidence': box.conf.item(),
                'class': model.names[int(box.cls.item())]
            }
            predictions.append(pred)
    # Supabase update
    try:
        supabase.table("status").upsert({
            "id": 1,
            "classes_detectees": detected_classes,
            "alerte_pleurs": cry_detected,
            "timestamp": '{' + "'" + datetime.now().isoformat() + "'" + '}' 
        }).execute()
    except Exception as e:
        print("Erreur Supabase DB:", e)
    return jsonify({
        'predictions': predictions,
        'classes_detectees': detected_classes,
        'alerte_pleurs': cry_detected,
        'timestamp': datetime.now().isoformat(),
        'image': {'width': img_width, 'height': img_height}
    })

# ---------------------- Fonction IP locale ----------------------
def get_ip_address():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

# Remove entire Firebase initialization block
# ---------------------- Flask + YOLO ----------------------
# Supabase configuration already present
SUPABASE_URL = ('https://ktawufettcizhwcwsktz.supabase.co')
SUPABASE_KEY = ('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0YXd1ZmV0dGNpemh3Y3dza3R6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjc2MjU4MiwiZXhwIjoyMDY4MzM4NTgyfQ.Yf9H0s4149rzp01EQ3JL-4zVL-UiAsvr_fcRU0mPiIc')
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ---------------------- Lancement ----------------------
if __name__ == '__main__':
    # Envoi IP à Supabase
    try:
        ip_address = get_ip_address()
        supabase.table("server").upsert({
            "id": 1,  # Assuming a single row, adjust as needed
            "ip": ip_address,
            "port": 5002,
            "url_video_feed": f"http://{ip_address}:5002/video_feed",
            "timestamp": '{' + "'" + datetime.now().isoformat() + "'" + '}' 
        }).execute()
        print("Adresse IP du serveur envoyée à Supabase :", ip_address)
    except Exception as e:
        print("Erreur lors de l'envoi de l'adresse IP à Supabase :", e)


    app.run(host='0.0.0.0', port=5002, threaded=True)
