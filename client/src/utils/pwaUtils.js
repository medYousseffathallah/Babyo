// PWA utility functions

/**
 * Check if the app is running as a PWA (installed)
 */
export const isPWA = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
};

/**
 * Check if the device is online
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * Add event listeners for online/offline status
 */
export const addNetworkListeners = (onOnline, onOffline) => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

/**
 * Show a local notification
 */
export const showNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/logo192.png',
      badge: '/favicon.ico',
      ...options
    });
    
    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
    
    return notification;
  }
};

/**
 * Cache emotion detection data for offline use
 */
export const cacheEmotionData = (data) => {
  try {
    const existingData = JSON.parse(localStorage.getItem('cachedEmotionData') || '[]');
    const newData = {
      ...data,
      timestamp: Date.now(),
      synced: false
    };
    existingData.push(newData);
    localStorage.setItem('cachedEmotionData', JSON.stringify(existingData));
    return true;
  } catch (error) {
    console.error('Error caching emotion data:', error);
    return false;
  }
};

/**
 * Get cached emotion data
 */
export const getCachedEmotionData = () => {
  try {
    return JSON.parse(localStorage.getItem('cachedEmotionData') || '[]');
  } catch (error) {
    console.error('Error retrieving cached emotion data:', error);
    return [];
  }
};

/**
 * Clear synced cached data
 */
export const clearSyncedData = () => {
  try {
    const cachedData = getCachedEmotionData();
    const unsyncedData = cachedData.filter(item => !item.synced);
    localStorage.setItem('cachedEmotionData', JSON.stringify(unsyncedData));
    return true;
  } catch (error) {
    console.error('Error clearing synced data:', error);
    return false;
  }
};

/**
 * Mark cached data as synced
 */
export const markDataAsSynced = (timestamps) => {
  try {
    const cachedData = getCachedEmotionData();
    const updatedData = cachedData.map(item => {
      if (timestamps.includes(item.timestamp)) {
        return { ...item, synced: true };
      }
      return item;
    });
    localStorage.setItem('cachedEmotionData', JSON.stringify(updatedData));
    return true;
  } catch (error) {
    console.error('Error marking data as synced:', error);
    return false;
  }
};

/**
 * Get app installation prompt
 */
export const getInstallPrompt = () => {
  return window.deferredPrompt;
};

/**
 * Set app installation prompt
 */
export const setInstallPrompt = (prompt) => {
  window.deferredPrompt = prompt;
};

/**
 * Check if app can be installed
 */
export const canInstall = () => {
  return !!window.deferredPrompt && !isPWA();
};

/**
 * Get device type for PWA optimization
 */
export const getDeviceType = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/tablet|ipad|playbook|silk/.test(userAgent)) {
    return 'tablet';
  }
  
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(userAgent)) {
    return 'mobile';
  }
  
  return 'desktop';
};

/**
 * Check if device supports camera
 */
export const supportsCameraAPI = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

/**
 * PWA analytics helper
 */
export const trackPWAEvent = (eventName, data = {}) => {
  // This can be extended to integrate with analytics services
  console.log('PWA Event:', eventName, {
    ...data,
    isPWA: isPWA(),
    isOnline: isOnline(),
    deviceType: getDeviceType(),
    timestamp: new Date().toISOString()
  });
};

const pwaUtils = {
  isPWA,
  isOnline,
  addNetworkListeners,
  requestNotificationPermission,
  showNotification,
  cacheEmotionData,
  getCachedEmotionData,
  clearSyncedData,
  markDataAsSynced,
  getInstallPrompt,
  setInstallPrompt,
  canInstall,
  getDeviceType,
  supportsCameraAPI,
  trackPWAEvent
};

export default pwaUtils;