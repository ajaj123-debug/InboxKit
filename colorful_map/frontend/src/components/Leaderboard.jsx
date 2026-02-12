import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function Leaderboard({ refreshTrigger }) {
    const [leaders, setLeaders] = useState([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await axios.get('https://colorfulmap.onrender.com/api/leaderboard/');
                setLeaders(res.data);
            } catch (e) {
                console.error(e);
            }
        };

        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, 5000);
        return () => clearInterval(interval);
    }, [refreshTrigger]);

    return (
        <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="leaderboard"
            style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'rgba(0,0,0,0.8)',
                padding: '1rem',
                borderRadius: '10px',
                color: 'white',
                backdropFilter: 'blur(5px)',
                border: '1px solid rgba(255,255,255,0.1)',
                minWidth: '200px'
            }}
        >
            <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #555', paddingBottom: '5px' }}>Leaderboard</h3>
            {leaders.map((l, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>{i + 1}. {l.owner_name}</span>
                    <span style={{ color: '#00ff88' }}>{l.count}</span>
                </div>
            ))}
        </motion.div>
    );
}
