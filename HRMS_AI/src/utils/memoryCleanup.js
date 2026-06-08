// Memory cleanup utilities for preventing memory leaks

export const cleanupTimers = () => {
  // Get the highest timeout id
  let id = window.setTimeout(() => {}, 0);
  
  // Clear all timeouts up to that id
  while (id--) {
    window.clearTimeout(id);
  }
};

export const cleanupIntervals = () => {
  // Get the highest interval id
  let id = window.setInterval(() => {}, 9999);
  
  // Clear all intervals up to that id
  while (id--) {
    window.clearInterval(id);
  }
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Monitor memory usage (for development)
export const logMemoryUsage = () => {
  if (performance.memory) {
    console.log({
      usedJSHeapSize: `${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      totalJSHeapSize: `${(performance.memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      jsHeapSizeLimit: `${(performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
    });
  }
};

// Cleanup function to be called on app unmount or route changes
export const performCleanup = () => {
  // Clear all pending timers
  cleanupTimers();
  
  // Clear all intervals
  cleanupIntervals();
  
  // Force garbage collection if available (only in dev mode with --expose-gc flag)
  if (window.gc && import.meta.env.DEV) {
    window.gc();
  }
};
