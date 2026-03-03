// Performance utility functions

/**
 * Debounce function to limit how often a function can fire
 */
export const debounce = (func, wait = 300) => {
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

/**
 * Throttle function to ensure a function is called at most once in a specified time period
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Batch localStorage updates to reduce I/O operations
 */
export class LocalStorageBatcher {
  constructor(delay = 500) {
    this.delay = delay;
    this.queue = new Map();
    this.timeoutId = null;
  }

  set(key, value) {
    this.queue.set(key, value);
    this.scheduleFlush();
  }

  scheduleFlush() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => this.flush(), this.delay);
  }

  flush() {
    this.queue.forEach((value, key) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error(`Failed to save ${key} to localStorage:`, e);
      }
    });
    this.queue.clear();
    this.timeoutId = null;
  }

  get(key) {
    if (this.queue.has(key)) {
      return this.queue.get(key);
    }
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error(`Failed to read ${key} from localStorage:`, e);
      return null;
    }
  }
}

export const storageBatcher = new LocalStorageBatcher();
