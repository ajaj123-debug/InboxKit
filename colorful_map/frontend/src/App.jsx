import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import './index.css';
import { useGame } from './hooks/useGame';
import Block from './components/Block';
import Dashboard from './components/Dashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, Users, User } from 'lucide-react';

const GRID_WIDTH = 50;
const GRID_HEIGHT = 40;
// Vibrant but matte colors suitable for light theme
const COLORS = [
  '#3498db', // Blue
  '#9b59b6', // Purple
  '#f1c40f', // Yellow
  '#e91e63', // Pink
  '#2ecc71', // Green
  '#e74c3c', // Red
];

function App() {
  const { blocks, captureBlock, isConnected, userCount } = useGame();

  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  // Count blocks for dashboard
  // This is a naive count, ideally backend sends this info
  const userBlockCount = Object.values(blocks).filter(c => c === selectedColor).length;

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [scale, setScale] = useState(1);
  const colorRef = useRef(selectedColor);

  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  useEffect(() => {
    // ... existing username useEffect ...
    if (!username) {
      const name = window.prompt("Enter your username to play:") || `Player${Math.floor(Math.random() * 1000)}`;
      setUsername(name);
      localStorage.setItem('username', name);
    }
  }, [username]);

  useEffect(() => {
    colorRef.current = selectedColor;
  }, [selectedColor]);

  const handleCapture = useCallback((x, y) => {
    captureBlock(x, y, colorRef.current, username);
  }, [captureBlock, username]);

  const gridItems = useMemo(() => {
    // ... existing gridItems ...
    const items = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        items.push({ x, y, id: `${x},${y}` });
      }
    }
    return items;
  }, []);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));

  return (
    <>
      <AnimatePresence>
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0,
              background: '#e74c3c', color: 'white',
              padding: '15px', textAlign: 'center',
              zIndex: 9999, fontWeight: 'bold'
            }}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.3,
                  },
                },
              }}
              style={{ lineHeight: '1.8' }}
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 },
                }}
                transition={{ duration: 0.6 }}
              >
                ⚠️ Backend is sleeping...
              </motion.div>
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 },
                }}
                transition={{ duration: 0.6 }}
              >
                Please wait while it wakes up
              </motion.div>
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 },
                }}
                transition={{ duration: 0.6 }}
              >
                This may take a few seconds...
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Header Bar */}
        <div className="header-bar">
          <div className="header-stat" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} />
            <span>Online Users: {userCount}</span>
          </div>
          <div className="live-pill" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={16} />
            <span>LIVE BOARD {currentTime}</span>
          </div>
          <div className="header-stat" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={18} />
            <span>{username}</span>
          </div>
        </div>

        {/* Map Viewport */}
        <div
          className="map-viewport"
        >
          <div
            className="game-grid"
            style={{
              gridTemplateColumns: `repeat(${GRID_WIDTH}, var(--block-size))`,
              gridTemplateRows: `repeat(${GRID_HEIGHT}, var(--block-size))`,
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
              pointerEvents: 'auto'
            }}
          >
            {gridItems.map(({ x, y, id }) => (
              <Block
                key={id}
                x={x}
                y={y}
                color={blocks[id]}
                onClick={() => handleCapture(x, y)}
              />
            ))}
          </div>

          {/* Zoom Controls Overlay */}
          <div className="zoom-overlay">
            <button className="zoom-btn" onClick={handleZoomOut}>-</button>
            <button className="zoom-btn" onClick={handleZoomIn}>+</button>
          </div>
        </div>

        {/* Footer */}
        <div className="map-footer">
          <div className="status-indicator">
            <div className="status-dot"></div>
            LIVE
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={16} fill="#f1c40f" color="#f1c40f" />
            <span>Instant Updates</span>
          </div>
          <div>Claim Your Tile!</div>
        </div>
      </div>

      {/* Sidebar */}
      <Dashboard
        username={username}
        selectedColor={selectedColor}
        onColorChange={setSelectedColor}
        colors={COLORS}
        refreshTrigger={blocks}
      />
    </>
  );
}

export default App;
