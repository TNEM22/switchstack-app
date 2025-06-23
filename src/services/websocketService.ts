import { SERVER_URL } from '@/constants';
import { toast } from '@/components/ui/sonner';

type StatusHandler = (status: 'connected' | 'disconnected') => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private statusHandlers: StatusHandler[] = [];
  messageCallback: ((message: string) => void) | null = null;
  private currentStatus: 'connected' | 'disconnected' = 'disconnected';

  connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    // Clear any existing reconnect timer
    if (this.reconnectTimer) {
      toast.dismiss('ws-reconnect-toast'); // Dismiss any reconnecting toast
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    const wsUrl = SERVER_URL.replace('http', 'ws');
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = this.handleOpen.bind(this);
    this.socket.onclose = this.handleClose.bind(this);
    this.socket.onmessage = this.handleMessage.bind(this);
    // this.socket.onerror = this.handleError.bind(this);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.notifyStatusChange('disconnected');
      this.currentStatus = 'disconnected';

      // Clear any reconnect timer
      if (this.reconnectTimer) {
        toast.dismiss('ws-reconnect-toast'); // Dismiss any reconnecting toast
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    }
  }

  private handleOpen(): void {
    // console.log('WebSocket connection established');
    this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
    this.notifyStatusChange('connected');
    this.currentStatus = 'connected';
  }

  private handleClose(event: CloseEvent): void {
    // console.log('WebSocket connection closed:', event.code, event.reason);
    this.notifyStatusChange('disconnected');
    this.currentStatus = 'disconnected';
    this.attemptReconnect();
  }

  //   private handleError(event: Event): void {
  //     console.error('WebSocket error:', event);
  //     toast.error('WebSocket error occurred. Could not connect.');
  //     // We don't set disconnected here as the close handler will be called after an error
  //   }

  private handleMessage(event: MessageEvent): void {
    // const parsedData = JSON.parse(event.data);
    // console.log('WebSocket message received:', parsedData);
    if (this.messageCallback) {
      this.messageCallback(event.data);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      // console.log('Maximum reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempts - 1),
      16000
    );

    // console.log(
    //   `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts} of ${this.maxReconnectAttempts})`
    // );

    toast.loading(`Reconnecting...`, {
      duration: 0, // Keep the toast open until we reconnect or fail
      id: 'ws-reconnect-toast',
    });
    this.reconnectTimer = setTimeout(() => {
      // console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
      this.connect();
    }, delay);
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  sendWebSocketMessage(message: string): void {
    if (
      this.socket?.readyState === WebSocket.OPEN &&
      this.currentStatus === 'connected'
    ) {
      this.socket.send(message);
    } else {
      // console.error('WebSocket is not open. Unable to send message:', message);
      toast.error('WebSocket is not connected. Unable to send message.');
    }
  }
  // Add handler for connection status changes
  onStatusChange(handler: StatusHandler): void {
    // console.log('Adding status handler:', handler);
    this.statusHandlers.push(handler);
  }

  // Remove status handler
  removeStatusHandler(handler: StatusHandler): void {
    this.statusHandlers = this.statusHandlers.filter((h) => h !== handler);
  }

  // Notify all registered handlers of status change
  private notifyStatusChange(status: 'connected' | 'disconnected'): void {
    this.statusHandlers.forEach((handler) => handler(status));
  }
}

export const websocketService = new WebSocketService();
