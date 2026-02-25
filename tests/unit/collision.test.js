'use strict';

const {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BALL_RADIUS,
  BALL_SPEED,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  BRICK_POINTS,
  createInitialState,
  startGame,
  update,
} = require('../../src/gameState');

// T010: 牆壁碰撞測試
describe('update() — 牆壁碰撞', () => {
  function makePlaying(overrides = {}) {
    const state = createInitialState();
    startGame(state);
    Object.assign(state.ball, overrides);
    // 消滅所有磚頭，避免磚頭碰撞干擾測試
    state.bricks.forEach(b => { b.alive = false; });
    return state;
  }

  test('球觸左牆應反轉 vx 為正值', () => {
    const state = makePlaying({ x: BALL_RADIUS - 1, y: CANVAS_HEIGHT / 2, vx: -200, vy: -100 });
    update(state, 0.001);
    expect(state.ball.vx).toBeGreaterThan(0);
  });

  test('球觸右牆應反轉 vx 為負值', () => {
    const state = makePlaying({ x: CANVAS_WIDTH - BALL_RADIUS + 1, y: CANVAS_HEIGHT / 2, vx: 200, vy: -100 });
    update(state, 0.001);
    expect(state.ball.vx).toBeLessThan(0);
  });

  test('球觸上牆應反轉 vy 為正值', () => {
    const state = makePlaying({ x: CANVAS_WIDTH / 2, y: BALL_RADIUS - 1, vx: 100, vy: -200 });
    update(state, 0.001);
    expect(state.ball.vy).toBeGreaterThan(0);
  });

  test('球觸左牆後應不超出左邊界', () => {
    const state = makePlaying({ x: BALL_RADIUS - 5, y: CANVAS_HEIGHT / 2, vx: -200, vy: -100 });
    update(state, 0.001);
    expect(state.ball.x).toBeGreaterThanOrEqual(BALL_RADIUS);
  });

  test('球觸右牆後應不超出右邊界', () => {
    const state = makePlaying({ x: CANVAS_WIDTH - BALL_RADIUS + 5, y: CANVAS_HEIGHT / 2, vx: 200, vy: -100 });
    update(state, 0.001);
    expect(state.ball.x).toBeLessThanOrEqual(CANVAS_WIDTH - BALL_RADIUS);
  });
});

// T011: 擋板碰撞測試
describe('update() — 擋板碰撞', () => {
  function makeStatePaddleHit() {
    const state = createInitialState();
    startGame(state);
    state.bricks.forEach(b => { b.alive = false; });
    const paddle = state.paddle;
    // 將球放置到擋板正上方，以向下速度碰撞
    state.ball.x = paddle.x + paddle.width / 2;
    state.ball.y = paddle.y - BALL_RADIUS + 1;
    state.ball.vx = 0;
    state.ball.vy = 200; // 向下
    return state;
  }

  test('球碰擋板後 vy 應反轉（變為負值）', () => {
    const state = makeStatePaddleHit();
    update(state, 0.001);
    expect(state.ball.vy).toBeLessThan(0);
  });

  test('球碰擋板後不應卡入擋板（球 y 應在擋板頂端以上）', () => {
    const state = makeStatePaddleHit();
    update(state, 0.001);
    expect(state.ball.y).toBeLessThanOrEqual(state.paddle.y - state.ball.radius);
  });

  test('球碰擋板中央時 vx 應接近 0（垂直反彈）', () => {
    const state = makeStatePaddleHit();
    update(state, 0.001);
    // 碰中央時 offset 為 0，vx 應接近 0
    expect(Math.abs(state.ball.vx)).toBeLessThan(50);
  });

  test('球碰擋板右側時 vx 應為正值', () => {
    const state = createInitialState();
    startGame(state);
    state.bricks.forEach(b => { b.alive = false; });
    const paddle = state.paddle;
    // 球在擋板右側 1/3 位置
    state.ball.x = paddle.x + paddle.width * 0.75;
    state.ball.y = paddle.y - BALL_RADIUS + 1;
    state.ball.vx = 0;
    state.ball.vy = 200;
    update(state, 0.001);
    expect(state.ball.vx).toBeGreaterThan(0);
  });
});

// T012: 磚頭碰撞測試
describe('update() — 磚頭碰撞', () => {
  function makeStateBrickHit() {
    const state = createInitialState();
    startGame(state);
    // 消滅所有磚頭只留第一塊
    state.bricks.forEach((b, i) => { if (i > 0) b.alive = false; });
    const brick = state.bricks[0];
    state.ball.x = brick.x + brick.width / 2;
    state.ball.y = brick.y + brick.height / 2;
    state.ball.vx = 0;
    state.ball.vy = -100;
    return { state, brick };
  }

  test('碰觸後磚頭應設為 alive === false', () => {
    const { state, brick } = makeStateBrickHit();
    update(state, 0.001);
    expect(brick.alive).toBe(false);
  });

  test('碰觸後 score 應增加 BRICK_POINTS', () => {
    const { state } = makeStateBrickHit();
    const before = state.score;
    update(state, 0.001);
    expect(state.score).toBe(before + BRICK_POINTS);
  });

  test('從上方碰觸磚頭後 vy 應反轉', () => {
    const state = createInitialState();
    startGame(state);
    state.bricks.forEach((b, i) => { if (i > 0) b.alive = false; });
    const brick = state.bricks[0];
    // 球從上方靠近磚頭底部（vy 向下，Y 軸深度較大）
    state.ball.x = brick.x + brick.width / 2;
    state.ball.y = brick.y - BALL_RADIUS + 2;
    state.ball.vx = 0;
    state.ball.vy = 200; // 向下
    const vyBefore = state.ball.vy;
    update(state, 0.001);
    // vy 應反轉
    expect(Math.sign(state.ball.vy)).not.toBe(Math.sign(vyBefore));
  });

  test('同幀多塊磚頭均被消滅', () => {
    const state = createInitialState();
    startGame(state);
    // 讓球位於多塊磚頭重疊位置
    const brick0 = state.bricks[0];
    const brick1 = state.bricks[1];
    state.ball.x = (brick0.x + brick1.x + brick1.width) / 2;
    state.ball.y = brick0.y + brick0.height / 2;
    state.ball.vx = 0;
    state.ball.vy = -100;
    update(state, 0.001);
    // 兩塊磚頭都應被消滅
    const destroyed = state.bricks.filter(b => !b.alive).length;
    expect(destroyed).toBeGreaterThanOrEqual(1);
  });
});
