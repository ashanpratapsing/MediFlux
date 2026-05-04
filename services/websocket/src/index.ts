type EventHandler = (data: unknown) => void;

class MockWebSocket {
  private listeners: Record<string, EventHandler[]> = {};
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    this.startSimulation();
  }

  public on(event: string, handler: EventHandler) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(handler);
    return () => {
      this.listeners[event] = this.listeners[event].filter(h => h !== handler);
    };
  }

  private emit(event: string, data: unknown) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(handler => handler(data));
    }
  }

  private startSimulation() {
    this.timer = setInterval(() => {
      const types = ['CRITICAL_ALERT', 'NEW_PATIENT'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      switch (type) {
        case 'CRITICAL_ALERT':
          this.emit('notification', { 
            id: Date.now(), 
            type: 'CRITICAL_ALERT', 
            title: 'Critical Alert', 
            message: 'Patient #1024 vitals unstable.' 
          });
          break;
        case 'NEW_PATIENT':
          this.emit('notification', { 
            id: Date.now(), 
            type: 'NEW_PATIENT', 
            title: 'New Admission', 
            message: 'Patient #1249 admitted to ER.' 
          });
          break;
      }
    }, 12000); // Simulate event every 12 seconds for faster demo
  }
}

export const wsClient = new MockWebSocket();
