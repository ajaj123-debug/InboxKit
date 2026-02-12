import { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';

const WS_URL = 'wss://colorfulmap.onrender.com/ws/game/';
const API_URL = 'https://colorfulmap.onrender.com/api/blocks/';

export function useGame() {
  const [blocks, setBlocks] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const ws = useRef(null);

  // Fetch initial state
  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const response = await axios.get(API_URL);
        const data = response.data;
        const initialBlocks = {};
        data.forEach(block => {
          initialBlocks[`${block.x},${block.y}`] = block.color;
        });
        setBlocks(initialBlocks);
      } catch (error) {
        console.error("Failed to fetch blocks:", error);
      }
    };
    fetchBlocks();
  }, []);

  // WebSocket connection
  useEffect(() => {
    const connect = () => {
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        setIsConnected(true);
        console.log("Connected to Game Server");
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        console.log("Disconnected. Reconnecting...");
        setTimeout(connect, 3000);
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'block_update' || data.type === 'update') {
          setBlocks(prev => ({
            ...prev,
            [`${data.x},${data.y}`]: data.color
          }));
        } else if (data.type === 'user_count') {
          setUserCount(data.count);
        } else if (data.type === 'error') {
          console.warn("Game Error:", data.message);
          alert(data.message);
          // Resync to revert optimistic update
          axios.get(API_URL).then(res => {
            const initialBlocks = {};
            res.data.forEach(block => {
              initialBlocks[`${block.x},${block.y}`] = block.color;
            });
            setBlocks(initialBlocks);
          });
        }
      };
    };

    connect();

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  const captureBlock = useCallback((x, y, color, username) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      // Optimistic update
      setBlocks(prev => ({
        ...prev,
        [`${x},${y}`]: color
      }));

      ws.current.send(JSON.stringify({
        action: 'capture',
        x,
        y,
        color,
        username
      }));
    }
  }, []);

  return { blocks, captureBlock, isConnected, userCount };
}
