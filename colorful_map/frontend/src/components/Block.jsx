import React, { memo } from 'react';
import { motion } from 'framer-motion';

const Block = memo(({ x, y, color, onClick }) => {
    return (
        <motion.div
            className={`block ${color ? 'owned' : ''}`}
            initial={false}
            animate={{
                backgroundColor: color || '#ffffff',
                scale: [null, 1.2, 1]
            }}
            transition={{ duration: 0.3 }}
            style={{
                gridColumnStart: x + 1,
                gridRowStart: y + 1,
            }}
            onClick={() => onClick(x, y)}
            whileHover={{
                scale: 1.3,
                zIndex: 100,
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                transition: { duration: 0.1 }
            }}
        />
    );
}, (prev, next) => {
    return prev.color === next.color && prev.x === next.x && prev.y === next.y;
});

export default Block;
