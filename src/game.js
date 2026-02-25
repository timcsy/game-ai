/**
 * game.js — 遊戲主控
 * 組合 gameState + renderer，掌管遊戲迴圈與事件監聽
 * 依賴 gameState.js 與 renderer.js 以 <script> 標籤在瀏覽器全域載入
 */

/* global createInitialState, startGame, resetGame, update, movePaddle, setPaddleX, draw */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const overlay = document.getElementById('overlay');
const overlayMessage = document.getElementById('overlay-message');
const overlayScore = document.getElementById('overlay-score');

let state = createInitialState();
let lastTimestamp = 0;
const keysDown = {};

// 遊戲主迴圈
function gameLoop(timestamp) {
  const deltaTime = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
  lastTimestamp = timestamp;

  if (state.status === 'playing') {
    if (keysDown['ArrowLeft']) movePaddle(state, 'left', deltaTime);
    if (keysDown['ArrowRight']) movePaddle(state, 'right', deltaTime);
    update(state, deltaTime);
  }

  draw(state, ctx);
  updateUI();

  requestAnimationFrame(gameLoop);
}

function updateUI() {
  const scoreEl = document.getElementById('score');
  if (scoreEl) scoreEl.textContent = state.score;

  if (state.status === 'won' || state.status === 'lost') {
    overlay.classList.remove('hidden');
    overlayMessage.textContent = state.status === 'won' ? '🎉 勝利！' : '💔 遊戲結束';
    overlayScore.textContent = `最終分數：${state.score}`;
    startBtn.style.display = 'none';
  } else {
    overlay.classList.add('hidden');
    startBtn.style.display = state.status === 'idle' ? 'inline-block' : 'none';
  }
}

// 按鈕事件
startBtn.addEventListener('click', () => {
  startGame(state);
  updateUI();
});

restartBtn.addEventListener('click', () => {
  resetGame(state);
  startBtn.style.display = 'inline-block';
  updateUI();
});

// 鍵盤事件
document.addEventListener('keydown', (e) => {
  keysDown[e.key] = true;
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') e.preventDefault();
});

document.addEventListener('keyup', (e) => {
  keysDown[e.key] = false;
});

// 滑鼠事件
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  setPaddleX(state, mouseX);
});

// 啟動遊戲迴圈
requestAnimationFrame(gameLoop);
