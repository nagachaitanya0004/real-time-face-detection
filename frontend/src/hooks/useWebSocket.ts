import { useState, useEffect, useRef, useCallback } from 'react';

export const useWebSocket = (url: string) => {
  const [lastFrame, setLastFrame] = useState<Blob | null>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);
  const [retryCount, setRetryCount] = useState(0);
  const ws = useRef<WebSocket | null>(null);
  const backoff = [500, 1000, 2000, 4000, 8000];

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    const socket = new WebSocket(url);
    socket.binaryType = 'blob';

    socket.onopen = () => {
      setReadyState(WebSocket.OPEN);
      setRetryCount(0);
      console.log('WebSocket Connected');
    };

    socket.onmessage = (event) => {
      if (event.data instanceof Blob) {
        setLastFrame(event.data);
      }
    };

    socket.onclose = () => {
      setReadyState(WebSocket.CLOSED);
      if (retryCount < backoff.length) {
        const timeout = backoff[retryCount];
        console.log(`WebSocket closed. Retrying in ${timeout}ms...`);
        setTimeout(() => {
          setRetryCount((c) => c + 1);
          connect();
        }, timeout);
      }
    };

    socket.onerror = () => {
      setReadyState(WebSocket.CLOSED);
    };

    ws.current = socket;
  }, [url, retryCount]);

  useEffect(() => {
    connect();
    return () => {
      ws.current?.close();
    };
  }, [connect]);

  return { lastFrame, readyState, retryCount };
};
