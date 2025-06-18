import React, { useEffect, useState, useRef } from 'react';
const Bubble = ({ id, initialX, initialY, size, color, onPop, speed, isPopping, position }) => {
  const [opacity, setOpacity] = useState(0.7); 
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const bubbleRef = useRef(null);
  const animationFrameRef = useRef(null);
  const fragmentsCreated = useRef(false);
  const currentX = position ? position.x : initialX;
  const currentY = position ? position.y : initialY;
  useEffect(() => {
    if (!isPopping) return;
    
    let startTime = null;
    const duration = 300; 
    
    const animatePop = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentScale = 1 + progress * 0.4 * (1 - progress * 2); 
      const currentOpacity = 0.7 * (1 - progress);
      const currentRotation = progress * 15; 
      
      setScale(currentScale);
      setOpacity(currentOpacity);
      setRotation(currentRotation);
      
      if (progress > 0.2 && bubbleRef.current && !fragmentsCreated.current) {
        createBubbleFragments(bubbleRef.current, 3);
        fragmentsCreated.current = true;
      }
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animatePop);
      } else {
        onPop(id);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animatePop);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPopping, id, onPop]);

  const createBubbleFragments = (element, count) => {
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < count; i++) {
      const fragmentElement = document.createElement('div');
      fragmentElement.className = 'bubble-fragment';
      
      const fragmentSize = size * 0.15; 
      const angle = Math.random() * Math.PI * 2;
      const distance = size * 0.3;
      
      const fragmentX = centerX + Math.cos(angle) * distance;
      const fragmentY = centerY + Math.sin(angle) * distance;
      
      Object.assign(fragmentElement.style, {
        position: 'absolute',
        left: `${fragmentX}px`,
        top: `${fragmentY}px`,
        width: `${fragmentSize}px`,
        height: `${fragmentSize}px`,
        borderRadius: '50%',
        backgroundColor: color,
        opacity: 0.7,
        boxShadow: `0 0 5px ${color}`,
        zIndex: 11,
        pointerEvents: 'none',
        animation: `fragment-animation 0.3s forwards` 
      });
      
      fragment.appendChild(fragmentElement);
    }
    
    document.body.appendChild(fragment);
    
    setTimeout(() => {
      const fragments = document.querySelectorAll('.bubble-fragment');
      fragments.forEach(el => {
        if (document.body.contains(el)) {
          document.body.removeChild(el);
        }
      });
    }, 300);
  };

  const popBubble = () => {
    if (isPopping) return;
    onPop(id);
  };

 
  const getRainbowReflectionStyle = () => {
    return {
      background: `radial-gradient(circle at 30% 30%, 
        rgba(255, 255, 255, 0.5) 0%, 
        ${color}33 60%, 
        transparent 100%)`,
      boxShadow: `inset 0 0 10px rgba(255, 255, 255, 0.3), 0 0 8px ${color}88`,
      border: `1px solid rgba(255, 255, 255, 0.2)`
    };
  };

  return (
    <div
      ref={bubbleRef}
      className="bubble"
      onClick={popBubble}
      style={{
        position: 'absolute',
        left: `${currentX}px`,
        top: `${currentY}px`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: `${color}33`, 
        opacity: opacity,
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        transition: isPopping ? 'none' : 'transform 0.2s ease-out',
        cursor: 'pointer',
        zIndex: 10,
        pointerEvents: isPopping ? 'none' : 'auto',
        willChange: 'transform, opacity',
        ...getRainbowReflectionStyle()
      }}
    />
  );
};

export default Bubble; 