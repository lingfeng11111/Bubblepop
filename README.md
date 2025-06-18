# 👋 你好，我是凌峰
## 👨‍💻 关于我
我是一名兼具设计与开发能力的全栈创意工作者。凭借对视觉美学和技术实现的双重热爱，我擅长将创意概念转化为引人入胜的数字体验。我热衷于探索新技术，并将其应用到创新项目中。
## 🚀 专业技能
<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://www.wkhub.com/wp-content/uploads/2018/12/TouchDesigner.png" height="48" />
    <img src="https://skillicons.dev/icons?i=react,js,nodejs,threejs,css,sass" />
    <img src="https://skillicons.dev/icons?i=figma,unity,ai,ps" />
  </a>
</p>

# 泡泡破裂游戏 (Bubble Pop)

这是一个基于网页的互动游戏，使用手势识别技术让玩家通过摄像头和手部动作来破解屏幕上的彩色泡泡。

## 项目特点

- 🖐️ **手势识别**：使用TensorFlow.js和Handpose模型实时检测用户手部位置
- 🫧 **互动泡泡**：彩色泡泡从屏幕底部上升，可以通过手掌触碰破裂
- 🎮 **多人游戏**：支持最多3只手同时互动
- 🌈 **视觉效果**：泡泡破裂时有动画和粒子效果
- 🔍 **调试模式**：按"D"键可以切换调试视图，显示手部位置和碰撞区域

## 技术栈

- React + Vite
- TensorFlow.js
- Handpose模型
- React Webcam
- 原生CSS动画

## 如何运行

1. 克隆仓库
```bash
git clone https://github.com/lingfeng11111/Bubblepop.git
cd Bubblepop
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 在浏览器中打开应用（通常是 http://localhost:5173）

## 使用说明

1. 允许浏览器访问摄像头
2. 将手掌放在摄像头前
3. 张开手掌可以破裂泡泡
4. 按"D"键可以切换调试模式

## 项目结构

- `src/components/HandDetection.jsx` - 手部检测和跟踪逻辑
- `src/components/BubbleContainer.jsx` - 泡泡生成和管理
- `src/components/Bubble.jsx` - 单个泡泡的渲染和动画
- `src/App.jsx` - 主应用组件

## 代码语言占比

```
JavaScript: 85%
CSS: 12%
HTML: 3%
```

## 注意事项

- 需要现代浏览器支持（Chrome, Firefox, Edge等）
- 需要摄像头权限
- 在光线充足的环境中效果最佳
- 手部检测模型首次加载可能需要几秒钟时间

## 许可证

MIT
