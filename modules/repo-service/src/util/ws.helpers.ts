import { createNotification } from "./notification.helpers";
import { randomUUID } from 'node:crypto';

interface JobMessage {
    jobId: string;
    message?: any;
}

export class WebSocketClient {
    private ws: WebSocket | null = null;
    private serverUrl: string;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectInterval: number = 3000; // 3 seconds

    constructor(_serverUrl: string) {
        this.serverUrl = _serverUrl;
    }

    connect(): void {
        console.log("Connecting to WebSocket server at:", this.serverUrl);
        try {
            this.ws = new WebSocket(this.serverUrl);

            this.ws.onopen = (e: Event) => {
                console.log("WebSocket connection opened:", e);
                this.reconnectAttempts = 0; // Reset attempts on successful connection
            };

            this.ws.onmessage = async (e: MessageEvent) => {
                try {
                    const message = JSON.parse(e.data.toString()) as JobMessage;

                    const notificationId = await createNotification(message.jobId, JSON.stringify(message), "NEW");
                    console.log("Notification created with ID:", notificationId);
                } catch (err) {
                    console.error("Error parsing WebSocket message:", err);
                }
            };

            this.ws.onerror = (e: Event) => {
                console.error("WebSocket error:", e);   
            }

            this.ws.onclose = (e: CloseEvent) => {
                console.log("WebSocket connection closed:", e);
                this.attemptReconnect();
            }
        } catch (err) {
            console.error("WebSocket connection error:", err);
            this.attemptReconnect();
        }
    }

    private attemptReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error("Max reconnect attempts reached. Not trying again.");
            return;
        }

        this.reconnectAttempts++;
        console.log(`Attempting to reconnect in ${this.reconnectInterval / 1000} seconds... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(() => {
            console.log("Reconnecting...");
            this.connect();
        }, this.reconnectInterval);
    }

    private getReadyStateString(): string {
        if (!this.ws) return 'No WebSocket instance';
        
        switch (this.ws.readyState) {
          case WebSocket.CONNECTING: return 'CONNECTING (0)';
          case WebSocket.OPEN: return 'OPEN (1)';
          case WebSocket.CLOSING: return 'CLOSING (2)';
          case WebSocket.CLOSED: return 'CLOSED (3)';
          default: return `Unknown (${this.ws.readyState})`;
        }
    }

    private async waitForConnection(): Promise<void> {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          return Promise.resolve();
        }
        
        return new Promise((resolve, reject) => {
          const maxWaitTime = 10000; // 10 seconds timeout
          const checkInterval = 100; // Check every 100ms
          let elapsedTime = 0;
          
          // Store current ws reference to detect if it changes
          const initialWs = this.ws;
          
          const intervalId = setInterval(() => {
            // If ws instance changed or we've waited too long, reject
            if (initialWs !== this.ws || elapsedTime >= maxWaitTime) {
              clearInterval(intervalId);
              reject(new Error('Connection timeout or websocket instance changed'));
              return;
            }
            console.log("Checking WebSocket connection status...", this.getReadyStateString());
            
            elapsedTime += checkInterval;
            
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
              clearInterval(intervalId);
              resolve();
            }
          }, checkInterval);
        });
      }


    async sendJobMessage(payload?:any): Promise<void> {
        await this.waitForConnection();
        const jobId = randomUUID();
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error("WebSocket is not connected");
        }

        this.ws.send(JSON.stringify({jobId, ...payload}));
    }
}