import { useState, useEffect, useRef, useCallback } from 'react';
import type { TrackerData } from '../types';

export const useWebsocket = (url: string) => {
  const [data, setData] = useState<TrackerData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      ws.current = new WebSocket(url);
      ws.current.onopen = () => setIsConnected(true);
      ws.current.onclose = () => {
        setIsConnected(false);
        // Auto-reconnect after 3 seconds
        reconnectTimeout = setTimeout(connect, 3000);
      };
      ws.current.onmessage = (event) => setData(JSON.parse(event.data));
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (ws.current) {
        ws.current.onclose = null; // Prevent reconnect on explicit unmount
        ws.current.close();
      }
    };
  }, [url]);

  const sendMessage = useCallback((action: string, params: unknown = {}) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ action, params }));
    }
  }, []);

  return { data, isConnected, sendMessage };
};
