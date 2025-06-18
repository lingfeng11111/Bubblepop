import React, { useState, useEffect, useCallback, useRef } from 'react';
import Bubble from './Bubble';

const BubbleContainer = ({ handPositions = [] }) => {
  const [bubbles, setBubbles] = useState([]);
  const [nextId, setNextId] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const maxBubbles = 15; // 减少最大泡泡数量以提高性能
  const bubblesRef = useRef(bubbles);
  const handPositionsRef = useRef(handPositions);
  const [showDebug, setShowDebug] = useState(false); // 调试模式开关
  
  // 更新引用
  useEffect(() => {
    bubblesRef.current = bubbles;
  }, [bubbles]);
  
  // 更新手部位置引用
  useEffect(() => {
    handPositionsRef.current = handPositions;
  }, [handPositions]);

  // 随机颜色生成
  const getRandomColor = () => {
    const colors = [
      '#FF6B6B', // 红色
      '#4ECDC4', // 青色
      '#FFD166', // 黄色
      '#6A0572', // 紫色
      '#1A535C', // 深绿色
      '#F9C80E', // 橙色
      '#FF9F1C', // 橙黄色
      '#5BC0EB', // 蓝色
      '#9BC53D', // 绿色
      '#E55934', // 橘红色
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // 创建新泡泡 - 更大的尺寸
  const createBubble = useCallback(() => {
    // 如果当前泡泡数量已达上限，则不创建新泡泡
    if (bubblesRef.current.length >= maxBubbles) return;
    
    // 更大的泡泡尺寸 (70-150px)
    const size = Math.random() * 80 + 70; 
    const newBubble = {
      id: nextId,
      x: Math.random() * (window.innerWidth - size),
      y: window.innerHeight + size,
      size: size,
      color: getRandomColor(),
      speed: Math.random() * 2 + 1.5, // 1.5-3.5，适中的速度
      popping: false
    };
    
    setBubbles(prev => [...prev, newBubble]);
    setNextId(prev => prev + 1);
  }, [nextId]);

  // 初始化泡泡 - 更大的尺寸
  useEffect(() => {
    if (!isInitialized) {
      // 一次性创建10个泡泡（减少初始数量以提高性能）
      const initialBubbles = [];
      for (let i = 0; i < 10; i++) {
        const size = Math.random() * 80 + 70; // 70-150px
        initialBubbles.push({
          id: i,
          x: Math.random() * (window.innerWidth - size),
          y: window.innerHeight + Math.random() * window.innerHeight, // 分布在屏幕下方
          size: size,
          color: getRandomColor(),
          speed: Math.random() * 2 + 1.5,
          popping: false
        });
      }
      setBubbles(initialBubbles);
      setNextId(10);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // 移除泡泡
  const removeBubble = useCallback((id) => {
    setBubbles(prev => prev.filter(bubble => bubble.id !== id));
  }, []);

  // 开始泡泡破裂动画
  const startPoppingBubble = useCallback((id) => {
    setBubbles(prev => 
      prev.map(bubble => 
        bubble.id === id ? { ...bubble, popping: true } : bubble
      )
    );
  }, []);

  // 定期创建泡泡（控制生成速度）
  useEffect(() => {
    const bubbleInterval = setInterval(() => {
      createBubble();
    }, 800); // 每800ms创建一个新泡泡，降低生成频率提高性能
    
    return () => clearInterval(bubbleInterval);
  }, [createBubble]);

  // 检查手部是否与泡泡碰撞 - 更精确的碰撞检测
  const checkHandBubbleCollision = (hand, bubbleX, bubbleY, bubbleSize) => {
    if (!hand || !hand.isOpen) return false;
    
    // 泡泡中心坐标
    const bubbleCenterX = bubbleX + bubbleSize / 2;
    const bubbleCenterY = bubbleY + bubbleSize / 2;
    
    // 计算手掌与泡泡中心的距离
    const distance = Math.sqrt(
      Math.pow(hand.x - bubbleCenterX, 2) + 
      Math.pow(hand.y - bubbleCenterY, 2)
    );
    
    // 使用更大的碰撞半径，泡泡尺寸的90%
    const collisionRadius = bubbleSize * 0.9;
    
    return distance < collisionRadius;
  };

  // 使用requestAnimationFrame优化碰撞检测和泡泡移动
  useEffect(() => {
    let animationFrameId;
    
    const updateBubblesAndCheckCollisions = () => {
      // 更新泡泡位置
      setBubbles(prev => {
        // 如果没有泡泡，直接返回
        if (prev.length === 0) return prev;
        
        // 获取当前手部位置
        const currentHandPositions = handPositionsRef.current;
        
        return prev.map(bubble => {
          // 如果泡泡正在破裂，不更新位置
          if (bubble.popping) return bubble;
          
          // 更新泡泡位置
          const newX = bubble.x + (Math.random() - 0.5) * bubble.speed;
          const newY = bubble.y - bubble.speed * 0.8;
          
          // 检查是否超出屏幕
          if (newY < -bubble.size || newX < -bubble.size || newX > window.innerWidth + bubble.size) {
            return { ...bubble, toRemove: true };
          }
          
          // 检查是否与手部碰撞
          let isPopping = false;
          
          if (currentHandPositions && currentHandPositions.length > 0) {
            for (const hand of currentHandPositions) {
              if (checkHandBubbleCollision(hand, newX, newY, bubble.size)) {
                isPopping = true;
                console.log('泡泡破裂:', bubble.id);
                break;
              }
            }
          }
          
          return { 
            ...bubble, 
            x: newX, 
            y: newY,
            popping: isPopping || bubble.popping,
            toRemove: (newY < -bubble.size || newX < -bubble.size || newX > window.innerWidth + bubble.size)
          };
        }).filter(bubble => !bubble.toRemove);
      });
      
      animationFrameId = requestAnimationFrame(updateBubblesAndCheckCollisions);
    };
    
    animationFrameId = requestAnimationFrame(updateBubblesAndCheckCollisions);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // 切换调试模式
  const toggleDebug = useCallback(() => {
    setShowDebug(prev => !prev);
  }, []);

  // 添加键盘事件监听，按D键切换调试模式
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'd' || e.key === 'D') {
        toggleDebug();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleDebug]);

  // 调试用 - 显示手部位置和碰撞区域
  const renderDebugInfo = () => {
    if (!showDebug) return null;
    
    return (
      <>
        {/* 显示手部位置 */}
        {handPositions.map((hand, index) => {
          if (!hand) return null;
          return (
            <div 
              key={`hand-${index}`}
              style={{
                position: 'absolute',
                left: `${hand.x - 20}px`,
                top: `${hand.y - 20}px`,
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: hand.isOpen ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)',
                border: '2px solid white',
                zIndex: 15,
                pointerEvents: 'none'
              }}
            />
          );
        })}
        
        {/* 显示泡泡碰撞区域 */}
        {bubbles.map(bubble => {
          if (bubble.popping) return null;
          const collisionRadius = bubble.size * 0.9;
          return (
            <div
              key={`collision-${bubble.id}`}
              style={{
                position: 'absolute',
                left: `${bubble.x + bubble.size/2 - collisionRadius}px`,
                top: `${bubble.y + bubble.size/2 - collisionRadius}px`,
                width: `${collisionRadius * 2}px`,
                height: `${collisionRadius * 2}px`,
                borderRadius: '50%',
                border: '1px dashed rgba(255, 255, 255, 0.5)',
                zIndex: 14,
                pointerEvents: 'none'
              }}
            />
          );
        })}
        
        {/* 调试信息 */}
        <div className="debug-info">
          <p>调试模式: 开启</p>
          <p>手部数量: {handPositions.length}</p>
          <p>泡泡数量: {bubbles.length}</p>
          <p>按D键关闭调试</p>
        </div>
      </>
    );
  };

  return (
    <div className="bubble-container" style={{ width: '100%', height: '100%', position: 'absolute' }}>
      {/* 显示调试信息 */}
      {renderDebugInfo()}
      
      {/* 渲染泡泡 */}
      {bubbles.map(bubble => (
        <Bubble
          key={bubble.id}
          id={bubble.id}
          initialX={bubble.x}
          initialY={bubble.y}
          size={bubble.size}
          color={bubble.color}
          onPop={removeBubble}
          speed={bubble.speed}
          isPopping={bubble.popping}
          position={{ x: bubble.x, y: bubble.y }}
        />
      ))}
    </div>
  );
};

export default BubbleContainer; 