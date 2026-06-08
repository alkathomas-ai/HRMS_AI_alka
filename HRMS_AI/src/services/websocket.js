class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.notificationCallback = null;
  }

  setNotificationCallback(callback) {
    this.notificationCallback = callback;
  }

  refreshNotificationCount() {
    if (this.notificationCallback) {
      this.notificationCallback();
    }
  }

  connect() {
    const token = sessionStorage.getItem('authToken');
    if (!token) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const wsUrl = baseUrl + '/ws/notification';
    
    try {
      this.ws = new WebSocket(`${wsUrl}?token=${token}`);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        console.log('WebSocket message:', event.data);
        try {
          const data = JSON.parse(event.data);
          if (data.notification === true && this.notificationCallback) {
            this.notificationCallback();
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && sessionStorage.getItem('authToken')) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), this.reconnectInterval);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = 0;
  }
}

export const websocketService = new WebSocketService();