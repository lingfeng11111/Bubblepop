import { useState, useEffect } from 'react'
import './App.css'
import HandDetection from './components/HandDetection'
import BubbleContainer from './components/BubbleContainer'

function App() {
  const [handPositions, setHandPositions] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);

  const handleHandMove = (handsData) => {
    setHandPositions(handsData);
  };

  // 使用useEffect正确处理5秒后自动隐藏说明
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstructions(false);
    }, 5000);
    
    // 清理函数
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app">
      {showInstructions && (
        <div className="instructions-overlay">
          <h1 className="title">泡泡破裂游戏</h1>
          <p className="instructions">张开手掌可以破裂泡泡！支持最多3只手同时互动！</p>
        </div>
      )}
      
      <HandDetection onHandMove={handleHandMove} />
      <BubbleContainer handPositions={handPositions} />
    </div>
  )
}

export default App
