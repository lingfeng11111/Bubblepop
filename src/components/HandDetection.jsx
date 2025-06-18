import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';

const HandDetection = ({ onHandMove }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [mirrored, setMirrored] = useState(true); 
  const lastHandPositionsRef = useRef([]);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const detectRef = useRef(null);
  const loadHandposeModel = async () => {
    try {
      setIsModelLoading(true);
      console.log('开始加载手部检测模型...');
      
      await tf.ready();
      const loadedModel = await handpose.load({
        detectionConfidence: 0.6, 
        scoreThreshold: 0.6
      });
      
      setModel(loadedModel);
      setIsModelLoading(false);
      console.log('手部检测模型已加载成功');
    } catch (error) {
      console.error('无法加载手部检测模型:', error);
      setIsModelLoading(false);
    }
  };

  const detect = async () => {
    if (
      model &&
      webcamRef.current && 
      webcamRef.current.video && 
      webcamRef.current.video.readyState === 4
    ) {

      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      try {
        
        const hands = await model.estimateHands(video);
        
        
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        const handsToProcess = hands.slice(0, 3);
        if (handsToProcess.length > 0) {
          const handPositions = [];
          
          handsToProcess.forEach((hand, index) => {

            const landmarks = hand.landmarks;
            let sumX = 0, sumY = 0;
            landmarks.forEach(point => {
              sumX += point[0];
              sumY += point[1];
            });
            
            let palmX = sumX / landmarks.length; 
            const palmY = sumY / landmarks.length; 
            if (mirrored) {
              palmX = videoWidth - palmX;
            }
            const isHandOpen = calculateHandOpenness(landmarks);
            const screenX = (palmX / videoWidth) * window.innerWidth;
            const screenY = (palmY / videoHeight) * window.innerHeight;

            handPositions.push({
              x: screenX,
              y: screenY,
              isOpen: isHandOpen
            });
            
            // 在canvas上绘制手部关键点和手掌区域
            drawHand(landmarks, canvasRef.current, mirrored, videoWidth, index, isHandOpen);
          });
          
          // 更新手部位置引用
          lastHandPositionsRef.current = handPositions;
          
          // 回调函数传递所有手部信息
          onHandMove(handPositions);
        } else {
          // 如果没有检测到手，传递空数组
          if (lastHandPositionsRef.current.length > 0) {
            lastHandPositionsRef.current = [];
            onHandMove([]);
          }
        }
      } catch (error) {
        console.error('手部检测出错:', error);
      }
      
      // 使用requestAnimationFrame继续下一帧检测
      detectRef.current = requestAnimationFrame(detect);
    } else {
      // 如果模型或视频还未准备好，延迟一段时间后重试
      detectRef.current = setTimeout(() => {
        detectRef.current = requestAnimationFrame(detect);
      }, 100);
    }
  };

  const calculateHandOpenness = (landmarks) => {
   
    const palmBase = landmarks[0];
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    const thumbDist = distance(palmBase, thumbTip);
    const indexDist = distance(palmBase, indexTip);
    const middleDist = distance(palmBase, middleTip);
    const ringDist = distance(palmBase, ringTip);
    const pinkyDist = distance(palmBase, pinkyTip);
    const handSize = Math.max(
      distance(landmarks[0], landmarks[5]),
      distance(landmarks[0], landmarks[9]),
      distance(landmarks[0], landmarks[13]),
      distance(landmarks[0], landmarks[17])
    );
  
    const threshold = handSize * 0.6;
    
    const openFingers = [thumbDist, indexDist, middleDist, ringDist, pinkyDist].filter(d => d > threshold).length;
    
    return openFingers >= 2; 
  };

  const distance = (point1, point2) => {
    return Math.sqrt(
      Math.pow(point2[0] - point1[0], 2) + 
      Math.pow(point2[1] - point1[1], 2)
    );
  };

  const drawHand = (landmarks, canvas, mirrored, videoWidth, handIndex = 0, isOpen = false) => {
    const ctx = canvas.getContext('2d');
 
    if (mirrored) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
    }

    const colors = ['#00FF00', '#00FFFF', '#FFFF00'];
    const handColor = colors[handIndex % colors.length];
    const lineColor = ['#FF0000', '#FF00FF', '#FF8800'][handIndex % 3];
    

    let sumX = 0, sumY = 0;
    landmarks.forEach(point => {
      sumX += point[0];
      sumY += point[1];
    });
    const centerX = sumX / landmarks.length;
    const centerY = sumY / landmarks.length;
    

    let maxDist = 0;
    landmarks.forEach(point => {
      const dist = Math.sqrt(Math.pow(point[0] - centerX, 2) + Math.pow(point[1] - centerY, 2));
      if (dist > maxDist) maxDist = dist;
    });
    
    if (isOpen) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxDist * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = `${handColor}33`; 
      ctx.fill();
      ctx.strokeStyle = handColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    for (let i = 0; i < landmarks.length; i++) {
      const [x, y] = landmarks[i];
      
      if (i === 0 || i === 4 || i === 8 || i === 12 || i === 16 || i === 20) {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = handColor;
        ctx.fill();
      }
    }
  
    ctx.beginPath();
    ctx.moveTo(landmarks[0][0], landmarks[0][1]); // 手掌基部
    
    // 拇指
    ctx.lineTo(landmarks[4][0], landmarks[4][1]);
    
    // 食指
    ctx.moveTo(landmarks[0][0], landmarks[0][1]);
    ctx.lineTo(landmarks[8][0], landmarks[8][1]);
    
    // 中指
    ctx.moveTo(landmarks[0][0], landmarks[0][1]);
    ctx.lineTo(landmarks[12][0], landmarks[12][1]);
    
    // 无名指
    ctx.moveTo(landmarks[0][0], landmarks[0][1]);
    ctx.lineTo(landmarks[16][0], landmarks[16][1]);
    
    // 小指
    ctx.moveTo(landmarks[0][0], landmarks[0][1]);
    ctx.lineTo(landmarks[20][0], landmarks[20][1]);
    
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    if (mirrored) {
      ctx.restore();
    }
  };

  const toggleMirror = () => {
    setMirrored(!mirrored);
  };

  // 初始化模型
  useEffect(() => {
    loadHandposeModel();
    
    return () => {
      // 清理检测循环
      if (detectRef.current) {
        cancelAnimationFrame(detectRef.current);
        clearTimeout(detectRef.current);
      }
    };
  }, []);

  // 启动检测循环
  useEffect(() => {
    if (model) {
      detectRef.current = requestAnimationFrame(detect);
    }
    
    return () => {
      if (detectRef.current) {
        cancelAnimationFrame(detectRef.current);
        clearTimeout(detectRef.current);
      }
    };
  }, [model, mirrored]);

  return (
    <div className="hand-detection">
      <Webcam
        ref={webcamRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 9,
          opacity: 0.3,
          transform: mirrored ? 'scaleX(-1)' : 'scaleX(1)'
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 9
        }}
      />
      {isModelLoading && (
        <div className="loading-overlay">
          <p>正在加载手部检测模型，请稍候...</p>
        </div>
      )}
      <button 
        className="mirror-toggle" 
        onClick={toggleMirror}
      >
        {mirrored ? '关闭镜像' : '开启镜像'}
      </button>
    </div>
  );
};

export default HandDetection; 