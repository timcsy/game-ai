// 全域常數
const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 600;
const BALL_RADIUS = 8;
const BALL_SPEED = 300;
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 12;
const PADDLE_SPEED = 400;
const BRICK_ROWS = 6;
const BRICK_COLS = 10;
const BRICK_POINTS = 10;

// 磚頭佈局常數
const BRICK_PADDING = 5;
const BRICK_OFFSET_Y = 60;
const BRICK_HEIGHT = 20;
const BRICK_WIDTH = (CANVAS_WIDTH - BRICK_PADDING * (BRICK_COLS + 1)) / BRICK_COLS;

/**
 * 建立磚頭陣列
 */
function _createBricks() {
  const bricks = [];
  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      const x = BRICK_PADDING + col * (BRICK_WIDTH + BRICK_PADDING);
      const y = BRICK_OFFSET_Y + row * (BRICK_HEIGHT + BRICK_PADDING);
      bricks.push({ x, y, width: BRICK_WIDTH, height: BRICK_HEIGHT, alive: true, points: BRICK_POINTS });
    }
  }
  return bricks;
}

/**
 * 建立初始擋板
 */
function _createPaddle() {
  return {
    x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
    y: CANVAS_HEIGHT - 40,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: PADDLE_SPEED,
  };
}

/**
 * 建立初始球（靜止於擋板中央上方）
 */
function _createBall(paddle) {
  return {
    x: paddle.x + paddle.width / 2,
    y: paddle.y - BALL_RADIUS - 1,
    radius: BALL_RADIUS,
    vx: 0,
    vy: 0,
  };
}

/**
 * createInitialState(): GameState
 * 建立全新的初始遊戲狀態
 */
function createInitialState() {
  const paddle = _createPaddle();
  const ball = _createBall(paddle);
  return {
    status: 'idle',
    score: 0,
    ball,
    paddle,
    bricks: _createBricks(),
  };
}

/**
 * startGame(state): void
 * 將遊戲從 idle 切換為 playing，釋放球開始移動
 */
function startGame(state) {
  if (state.status !== 'idle') return;
  state.status = 'playing';
  // 設定初始球速向量（斜 45 度向右上方）
  state.ball.vx = BALL_SPEED * 0.6;
  state.ball.vy = -BALL_SPEED * 0.8;
}

/**
 * resetGame(state): void
 * 將遊戲狀態完全重設至初始值
 */
function resetGame(state) {
  const initial = createInitialState();
  state.status = initial.status;
  state.score = initial.score;
  state.ball = initial.ball;
  state.paddle = initial.paddle;
  state.bricks = initial.bricks;
}

/**
 * movePaddle(state, direction, deltaTime): void
 * 依鍵盤輸入方向與時間移動擋板
 */
function movePaddle(state, direction, deltaTime) {
  if (state.status !== 'playing') return;
  const paddle = state.paddle;
  if (direction === 'left') {
    paddle.x = Math.max(0, paddle.x - paddle.speed * deltaTime);
  } else if (direction === 'right') {
    paddle.x = Math.min(CANVAS_WIDTH - paddle.width, paddle.x + paddle.speed * deltaTime);
  }
}

/**
 * setPaddleX(state, x): void
 * 以滑鼠游標絕對 X 座標設定擋板位置
 */
function setPaddleX(state, x) {
  if (state.status !== 'playing') return;
  const paddle = state.paddle;
  paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - paddle.width, x - paddle.width / 2));
}

/**
 * update(state, deltaTime): void
 * 執行一幀的遊戲更新
 */
function update(state, deltaTime) {
  if (state.status !== 'playing') return;

  // deltaTime 上限 0.05 秒
  const dt = Math.min(deltaTime, 0.05);

  const ball = state.ball;
  const paddle = state.paddle;

  // 更新球位置
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // 牆壁碰撞 — 左右牆
  if (ball.x - ball.radius < 0) {
    ball.x = ball.radius;
    ball.vx = Math.abs(ball.vx);
  } else if (ball.x + ball.radius > CANVAS_WIDTH) {
    ball.x = CANVAS_WIDTH - ball.radius;
    ball.vx = -Math.abs(ball.vx);
  }

  // 牆壁碰撞 — 上牆
  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.vy = Math.abs(ball.vy);
  }

  // 下邊界 — 遊戲失敗
  if (ball.y - ball.radius > CANVAS_HEIGHT) {
    state.status = 'lost';
    return;
  }

  // 擋板碰撞
  _handlePaddleCollision(ball, paddle);

  // 磚頭碰撞
  _handleBrickCollisions(ball, state);
}

/**
 * 擋板碰撞邏輯
 */
function _handlePaddleCollision(ball, paddle) {
  // AABB overlap check
  const overlapX = (ball.x + ball.radius) > paddle.x &&
                   (ball.x - ball.radius) < (paddle.x + paddle.width);
  const overlapY = (ball.y + ball.radius) > paddle.y &&
                   (ball.y - ball.radius) < (paddle.y + paddle.height);

  if (overlapX && overlapY && ball.vy > 0) {
    // 反轉 vy
    ball.vy = -Math.abs(ball.vy);
    // 修正球 Y 座標至擋板頂端外側
    ball.y = paddle.y - ball.radius;
    // 依碰觸位置相對擋板中心調整 vx
    const paddleCenter = paddle.x + paddle.width / 2;
    const offset = (ball.x - paddleCenter) / (paddle.width / 2); // -1 to 1
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    ball.vx = offset * speed * 0.75;
    // 確保 vy 有足夠速度（避免接近水平飛行）
    const minVy = speed * 0.3;
    if (Math.abs(ball.vy) < minVy) {
      ball.vy = -minVy;
    }
  }
}

/**
 * 磚頭碰撞邏輯（AABB 深度比較）
 */
function _handleBrickCollisions(ball, state) {
  let flipVx = false;
  let flipVy = false;

  for (const brick of state.bricks) {
    if (!brick.alive) continue;

    const overlapX = (ball.x + ball.radius) > brick.x &&
                     (ball.x - ball.radius) < (brick.x + brick.width);
    const overlapY = (ball.y + ball.radius) > brick.y &&
                     (ball.y - ball.radius) < (brick.y + brick.height);

    if (overlapX && overlapY) {
      brick.alive = false;
      state.score += brick.points;

      // 計算 X 與 Y 軸重疊深度，決定反彈方向
      const depthX = Math.min(
        (ball.x + ball.radius) - brick.x,
        (brick.x + brick.width) - (ball.x - ball.radius)
      );
      const depthY = Math.min(
        (ball.y + ball.radius) - brick.y,
        (brick.y + brick.height) - (ball.y - ball.radius)
      );

      if (depthX < depthY) {
        flipVx = true;
      } else if (depthY < depthX) {
        flipVy = true;
      } else {
        flipVx = true;
        flipVy = true;
      }
    }
  }

  if (flipVx) ball.vx = -ball.vx;
  if (flipVy) ball.vy = -ball.vy;

  // 判定勝利
  if (state.bricks.every(b => !b.alive)) {
    state.status = 'won';
  }
}

const _exports = {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BALL_RADIUS,
  BALL_SPEED,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_SPEED,
  BRICK_ROWS,
  BRICK_COLS,
  BRICK_POINTS,
  createInitialState,
  startGame,
  resetGame,
  update,
  movePaddle,
  setPaddleX,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = _exports;
}
