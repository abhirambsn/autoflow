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
        try {
            this.ws = new WebSocket(this.serverUrl);

            this.ws.onopen = (e: Event) => {
                console.log("WebSocket connection opened:", e);
                this.reconnectAttempts = 0; // Reset attempts on successful connection
            };

            this.ws.onmessage = async (e: MessageEvent) => {
                try {
                    const message = JSON.parse(e.data.toString()) as JobMessage;
                    console.log("WebSocket message received:", message);

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


    sendJobMessage(payload?:any): void {
        const jobId = randomUUID();
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error("WebSocket is not connected");
        }

        this.ws.send(JSON.stringify({jobId, ...payload}));
        console.log("WebSocket message sent:", payload);
    }
}