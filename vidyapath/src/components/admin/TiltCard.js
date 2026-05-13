'use client';
import { useRef, useState } from 'react';

export default function TiltCard({ children, className, style, priorityScore = 0 }) {
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation (-5 to 5 degrees)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotate({ x: 0, y: 0 });
  };

  // Determine glow color based on priority
  let glowColor = 'rgba(255, 255, 255, 0)';
  if (isHovering) {
    if (priorityScore >= 75) glowColor = 'rgba(16, 185, 129, 0.4)'; // Green glow
    else if (priorityScore >= 50) glowColor = 'rgba(245, 158, 11, 0.4)'; // Orange glow
    else glowColor = 'rgba(239, 68, 68, 0.4)'; // Red glow
  }

  const defaultStyle = {
    transition: isHovering ? 'none' : 'all 0.4s ease',
    transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(${isHovering ? 1.02 : 1}, ${isHovering ? 1.02 : 1}, 1)`,
    boxShadow: isHovering ? `0 20px 40px -10px ${glowColor}, 0 0 20px 0 ${glowColor} inset` : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    willChange: 'transform, box-shadow',
    position: 'relative',
    transformStyle: 'preserve-3d',
    zIndex: isHovering ? 10 : 1,
  };

  return (
    <div
      ref={cardRef}
      className={className}
      style={{ ...defaultStyle, ...style }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glossy reflection layer */}
      {isHovering && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.1) 25%, transparent 30%)',
          borderRadius: 'inherit',
          pointerEvents: 'none',
          zIndex: 1,
        }} />
      )}
      <div style={{ transform: 'translateZ(20px)' }}>
        {children}
      </div>
    </div>
  );
}
