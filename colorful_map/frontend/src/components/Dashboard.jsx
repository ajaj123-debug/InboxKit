import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';

export default function Dashboard({ username, selectedColor, onColorChange, colors, refreshTrigger }) {
    const [leaders, setLeaders] = useState([]);

    // Calculate user's rank/score if they are in the list
    const userStats = leaders.find(l => l.owner_name === username) || { count: 0 };

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/leaderboard/');
                setLeaders(res.data);
            } catch (e) {
                console.error(e);
            }
        };

        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, 3000); // 3s update
        return () => clearInterval(interval);
    }, [refreshTrigger]);

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-title">Dashboard</div>
                <div style={{ cursor: 'pointer', opacity: 0.5 }}><Settings size={20} /></div>
            </div>

            <div className="user-card">
                <div className="user-status">
                    <div className="status-dot" style={{ width: 12, height: 12 }}></div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>Playing as</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{username}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2c3e50' }}>{userStats.count}</div>
                        <div style={{ fontSize: '0.7rem', color: '#95a5a6' }}>TILES</div>
                    </div>
                </div>

                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#95a5a6', marginTop: 15 }}>YOUR COLOR</div>
                <div className="color-picker-row">
                    {colors.map(c => (
                        <div
                            key={c}
                            className={`color-dot ${selectedColor === c ? 'active' : ''}`}
                            style={{ backgroundColor: c }}
                            onClick={() => onColorChange(c)}
                        />
                    ))}
                </div>
            </div>

            <div style={{ padding: '15px 20px 5px', fontSize: '0.85rem', fontWeight: 'bold', color: '#95a5a6', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Leaderboard
            </div>

            <div className="leaderboard-list">
                <AnimatePresence>
                    {leaders.map((l, i) => (
                        <motion.div
                            key={l.owner_name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="leaderboard-item"
                        >
                            <div className={`rank rank-${i + 1}`}>{i + 1}</div>
                            {/* Placeholder Avatar */}
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#eee', marginRight: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#7f8c8d', fontWeight: 'bold' }}>
                                {l.owner_name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="player-info">
                                <div className="player-name">
                                    {l.owner_name}
                                    {l.owner_name === username && <span style={{ fontSize: '0.7rem', color: '#27ae60', marginLeft: 6 }}>(You)</span>}
                                </div>
                            </div>
                            <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>{l.count}</div>
                            {/* We don't have user color in leaderboard API yet, maybe add later? */}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div style={{ padding: 15, textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
                <a href="#" style={{ textDecoration: 'none', color: '#646cff', fontSize: '0.9rem', fontWeight: 600 }}>View All</a>
            </div>
        </div>
    );
}
