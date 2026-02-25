'use strict';

const {
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
} = require('../../src/gameState');

// T008: createInitialState() 測試
describe('createInitialState()', () => {
  test('應返回 status === "idle"', () => {
    const state = createInitialState();
    expect(state.status).toBe('idle');
  });

  test('應返回 score === 0', () => {
    const state = createInitialState();
    expect(state.score).toBe(0);
  });

  test('所有磚頭 alive === true', () => {
    const state = createInitialState();
    expect(state.bricks.every(b => b.alive)).toBe(true);
  });

  test(`應有 ${BRICK_ROWS * BRICK_COLS} 塊磚頭`, () => {
    const state = createInitialState();
    expect(state.bricks.length).toBe(BRICK_ROWS * BRICK_COLS);
  });

  test('擋板應水平置中', () => {
    const state = createInitialState();
    const expectedX = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
    expect(state.paddle.x).toBe(expectedX);
  });

  test('擋板應有正確尺寸', () => {
    const state = createInitialState();
    expect(state.paddle.width).toBe(PADDLE_WIDTH);
    expect(state.paddle.height).toBe(PADDLE_HEIGHT);
  });

  test('球應在擋板中央上方', () => {
    const state = createInitialState();
    const paddle = state.paddle;
    expect(state.ball.x).toBeCloseTo(paddle.x + paddle.width / 2);
    expect(state.ball.y).toBeLessThan(paddle.y);
  });

  test('idle 狀態球速應為 0', () => {
    const state = createInitialState();
    expect(state.ball.vx).toBe(0);
    expect(state.ball.vy).toBe(0);
  });

  test('球半徑應為 BALL_RADIUS', () => {
    const state = createInitialState();
    expect(state.ball.radius).toBe(BALL_RADIUS);
  });
});

// T009: update() 球位置更新測試
describe('update() — 球位置更新', () => {
  test('應依 vx * deltaTime 更新球 x 座標', () => {
    const state = createInitialState();
    startGame(state);
    const initialX = state.ball.x;
    const vx = state.ball.vx;
    const dt = 0.016;
    // 讓球遠離邊界
    state.ball.x = CANVAS_WIDTH / 2;
    state.ball.y = CANVAS_HEIGHT / 2;
    state.ball.vx = 100;
    state.ball.vy = -100;
    update(state, dt);
    expect(state.ball.x).toBeCloseTo(CANVAS_WIDTH / 2 + 100 * dt, 5);
  });

  test('應依 vy * deltaTime 更新球 y 座標', () => {
    const state = createInitialState();
    startGame(state);
    state.ball.x = CANVAS_WIDTH / 2;
    state.ball.y = CANVAS_HEIGHT / 2;
    state.ball.vx = 0;
    state.ball.vy = -200;
    update(state, 0.016);
    expect(state.ball.y).toBeCloseTo(CANVAS_HEIGHT / 2 + (-200) * 0.016, 5);
  });

  test('status 非 playing 時不應更新位置', () => {
    const state = createInitialState();
    state.ball.x = 100;
    state.ball.y = 200;
    state.ball.vx = 100;
    state.ball.vy = -100;
    update(state, 0.016);
    expect(state.ball.x).toBe(100);
    expect(state.ball.y).toBe(200);
  });

  test('deltaTime 應被上限至 0.05 秒', () => {
    const state = createInitialState();
    startGame(state);
    state.ball.x = CANVAS_WIDTH / 2;
    state.ball.y = CANVAS_HEIGHT / 2;
    state.ball.vx = 100;
    state.ball.vy = -100;
    update(state, 1.0); // 大 deltaTime
    // 位移應基於 0.05s 計算
    expect(state.ball.x).toBeCloseTo(CANVAS_WIDTH / 2 + 100 * 0.05, 4);
  });
});

// T013: 勝負判定測試
describe('update() — 勝負判定', () => {
  test('球穿過底部時應設 status = "lost"', () => {
    const state = createInitialState();
    startGame(state);
    state.ball.x = CANVAS_WIDTH / 2;
    state.ball.y = CANVAS_HEIGHT + 10;
    state.ball.vx = 0;
    state.ball.vy = 100;
    update(state, 0.016);
    expect(state.status).toBe('lost');
  });

  test('所有磚頭消滅時應設 status = "won"', () => {
    const state = createInitialState();
    startGame(state);
    // 消滅所有磚頭（只留一塊）
    state.bricks.forEach((b, i) => { if (i < state.bricks.length - 1) b.alive = false; });
    const lastBrick = state.bricks[state.bricks.length - 1];
    // 讓球直接命中最後一塊磚頭
    state.ball.x = lastBrick.x + lastBrick.width / 2;
    state.ball.y = lastBrick.y + lastBrick.height / 2;
    state.ball.vx = 0;
    state.ball.vy = -100;
    update(state, 0.001);
    expect(state.status).toBe('won');
  });
});

// T024: startGame() 測試
describe('startGame()', () => {
  test('應將 status 從 idle 改為 playing', () => {
    const state = createInitialState();
    expect(state.status).toBe('idle');
    startGame(state);
    expect(state.status).toBe('playing');
  });

  test('球速度向量應有效（非零）', () => {
    const state = createInitialState();
    startGame(state);
    const speed = Math.sqrt(state.ball.vx ** 2 + state.ball.vy ** 2);
    expect(speed).toBeGreaterThan(0);
  });

  test('非 idle 狀態下不應改變 status', () => {
    const state = createInitialState();
    startGame(state);
    startGame(state); // 再次呼叫
    expect(state.status).toBe('playing');
  });
});

// T025: resetGame() 測試
describe('resetGame()', () => {
  test('任意 status 下重設後 status 應為 idle', () => {
    const state = createInitialState();
    startGame(state);
    state.status = 'won';
    resetGame(state);
    expect(state.status).toBe('idle');
  });

  test('重設後 score 應為 0', () => {
    const state = createInitialState();
    state.score = 500;
    resetGame(state);
    expect(state.score).toBe(0);
  });

  test('重設後所有磚頭應為 alive', () => {
    const state = createInitialState();
    state.bricks.forEach(b => { b.alive = false; });
    resetGame(state);
    expect(state.bricks.every(b => b.alive)).toBe(true);
  });

  test('重設後球應回到初始位置', () => {
    const state = createInitialState();
    const initialBall = { ...state.ball };
    startGame(state);
    state.ball.x = 999;
    state.ball.y = 999;
    resetGame(state);
    expect(state.ball.x).toBeCloseTo(initialBall.x);
    expect(state.ball.y).toBeCloseTo(initialBall.y);
  });

  test('重設後擋板應回到中央', () => {
    const state = createInitialState();
    state.paddle.x = 0;
    resetGame(state);
    const expectedX = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
    expect(state.paddle.x).toBe(expectedX);
  });
});

// T014: movePaddle() 與 setPaddleX() 測試
describe('movePaddle()', () => {
  test('向左移動應減少 paddle.x', () => {
    const state = createInitialState();
    startGame(state);
    const initialX = state.paddle.x;
    movePaddle(state, 'left', 0.1);
    expect(state.paddle.x).toBeLessThan(initialX);
  });

  test('向右移動應增加 paddle.x', () => {
    const state = createInitialState();
    startGame(state);
    const initialX = state.paddle.x;
    movePaddle(state, 'right', 0.1);
    expect(state.paddle.x).toBeGreaterThan(initialX);
  });

  test('向左移動不應超出左邊界（x < 0）', () => {
    const state = createInitialState();
    startGame(state);
    state.paddle.x = 1;
    movePaddle(state, 'left', 1.0); // 大步移動
    expect(state.paddle.x).toBeGreaterThanOrEqual(0);
  });

  test('向右移動不應超出右邊界', () => {
    const state = createInitialState();
    startGame(state);
    state.paddle.x = CANVAS_WIDTH - PADDLE_WIDTH - 1;
    movePaddle(state, 'right', 1.0);
    expect(state.paddle.x).toBeLessThanOrEqual(CANVAS_WIDTH - PADDLE_WIDTH);
  });

  test('移動量應與 deltaTime 成比例', () => {
    const state = createInitialState();
    startGame(state);
    state.paddle.x = CANVAS_WIDTH / 2;
    const dt = 0.05;
    movePaddle(state, 'right', dt);
    expect(state.paddle.x).toBeCloseTo(CANVAS_WIDTH / 2 + PADDLE_SPEED * dt, 4);
  });
});

describe('setPaddleX()', () => {
  test('應將擋板中心對齊游標 X 座標', () => {
    const state = createInitialState();
    startGame(state);
    const mouseX = 240;
    setPaddleX(state, mouseX);
    expect(state.paddle.x).toBeCloseTo(mouseX - PADDLE_WIDTH / 2, 4);
  });

  test('應 clamp 不超出左邊界', () => {
    const state = createInitialState();
    startGame(state);
    setPaddleX(state, -100);
    expect(state.paddle.x).toBe(0);
  });

  test('應 clamp 不超出右邊界', () => {
    const state = createInitialState();
    startGame(state);
    setPaddleX(state, CANVAS_WIDTH + 100);
    expect(state.paddle.x).toBe(CANVAS_WIDTH - PADDLE_WIDTH);
  });
});

// T030/T031: 分數追蹤測試
describe('score 追蹤', () => {
  test('磚頭被摧毀時 score 應增加 brick.points', () => {
    const state = createInitialState();
    startGame(state);
    // 消滅所有磚頭只留一塊
    state.bricks.forEach((b, i) => { if (i < state.bricks.length - 1) b.alive = false; });
    const lastBrick = state.bricks[state.bricks.length - 1];
    state.ball.x = lastBrick.x + lastBrick.width / 2;
    state.ball.y = lastBrick.y + lastBrick.height / 2;
    state.ball.vx = 0;
    state.ball.vy = -100;
    const scoreBefore = state.score;
    update(state, 0.001);
    expect(state.score).toBe(scoreBefore + BRICK_POINTS);
  });

  test('resetGame 後 score 應歸零', () => {
    const state = createInitialState();
    state.score = 300;
    resetGame(state);
    expect(state.score).toBe(0);
  });
});
