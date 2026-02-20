import React from 'react';
import { motion } from 'framer-motion';

const BrandLogo = ({ size = 'medium', showText = true, className = '' }) => {
    const iconSizes = {
        small: '32px',
        medium: '48px',
        large: '64px'
    };

    const textSizes = {
        small: '1.2rem',
        medium: '1.5rem',
        large: '2rem'
    };

    return (
        <div className={`brand-logo-container ${className}`} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: size === 'large' ? '16px' : '10px'
        }}>
            <motion.div
                className="logo-icon"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    width: iconSizes[size],
                    height: iconSizes[size],
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                    borderRadius: size === 'large' ? '16px' : '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 900,
                    fontSize: size === 'large' ? '2rem' : size === 'medium' ? '1.5rem' : '1rem',
                    boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.4)',
                    flexShrink: 0
                }}
            >
                B
            </motion.div>

            {showText && (
                <h1 style={{
                    color: 'white',
                    fontSize: textSizes[size],
                    fontWeight: 800,
                    margin: 0,
                    letterSpacing: '-0.02em',
                    background: 'linear-gradient(to right, #ffffff, #94a3b8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    BayZenit
                </h1>
            )}
        </div>
    );
};

export default BrandLogo;
