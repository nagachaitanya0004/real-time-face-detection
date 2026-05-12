/**
 * Purpose: Custom hook for managing WebSocket connections with auto-reconnect and exponential backoff.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { ConnectionStatus } from '../types';

/**
 * Manages a WebSocket connection for streaming binary data.
 * @param url The WebSocket endpoint URL.
 * @returns An object containing the current status and the latest received binary frame.
 */
export const useWebSocket = (url: string) => {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [lastFrame, setLastFrame] = useState<Blob | null>(null);
  const reconnectCount = useRef(0);
  const maxReconnects = 5;
  const ws = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    const socket = new WebSocket(url);
    socket.binaryType = 'blob';

    socket.onopen = () => {
      setStatus('open');
      reconnectCount.current = 0;
      console.log('WebSocket Connected');
    };

    socket.onmessage = async (event) => {
      if (event.data instanceof Blob) {
        setLastFrame(event.data);
      }
    };

    socket.onclose = () => {
      setStatus('closed');
      if (reconnectCount.current < maxReconnects) {
        const timeout = Math.pow(2, reconnectCount.current) * 1000;
        reconnectCount.current += 1;
        setTimeout(connect, timeout);
        console.log(`Reconnecting in ${timeout}ms...`);
      }
    };

    socket.onerror = () => {
      setStatus('error');
    };

    ws.current = socket;
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      ws.current?.close();
    };
  }, [connect]);

  return { status, lastFrame };
};
