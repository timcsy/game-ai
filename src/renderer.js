/**
 * renderer.js — Canvas 渲染層
 * 依賴 Canvas 2D Context，不含遊戲邏輯
 */

const COLORS = {
  ball: '#f5a623',
  paddle: '#e94560',
  brickRows: ['#e94560', '#c0392b', '#e67e22', '#f1c40f', '#2ecc71', '#3498db'],
  background: '#0f3460',
  text: '#ffffff',
  overlay: 'rgba(0,0,0,0.75)',
};

/**
 * draw(state, ctx): void
 * 清除畫布並依 state 重繪所有遊戲元素
 */
function draw(state, ctx) {
  const { ball, paddle, bricks, status, score } = state;
  const { canvas } = ctx;

  // 清除畫布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 背景
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 磚頭
  const cols = 10;
  bricks.forEach((brick, i) => {
    if (!brick.alive) return;
    const row = Math.floor(i / cols);
    ctx.fillStyle = COLORS.brickRows[row % COLORS.brickRows.length];
    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
  });

  // 擋板
  ctx.fillStyle = COLORS.paddle;
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

  // 球
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.ball;
  ctx.fill();
  ctx.closePath();

  // 分數 HUD
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`分數：${score}`, 10, 20);

  // 遊戲結束覆蓋層
  if (status === 'won' || status === 'lost') {
    ctx.fillStyle = COLORS.overlay;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = COLORS.text;
    ctx.textAlign = 'center';
    ctx.font = 'bold 36px Arial';
    const message = status === 'won' ? '🎉 勝利！' : '💔 遊戲結束';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2 - 40);

    ctx.font = '20px Arial';
    ctx.fillText(`最終分數：${score}`, canvas.width / 2, canvas.height / 2 + 10);

    ctx.font = '16px Arial';
    ctx.fillText('點擊「重新開始」再玩一次', canvas.width / 2, canvas.height / 2 + 50);
  }

  // idle 畫面提示
  if (status === 'idle') {
    ctx.fillStyle = COLORS.overlay;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = COLORS.text;
    ctx.textAlign = 'center';
    ctx.font = 'bold 28px Arial';
    ctx.fillText('球反彈磚頭遊戲', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '18px Arial';
    ctx.fillText('點擊「開始」按鈕開始遊戲', canvas.width / 2, canvas.height / 2 + 20);
  }
}

const _exports = { draw };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = _exports;
}
