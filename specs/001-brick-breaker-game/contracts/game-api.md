# 遊戲邏輯 API 契約：gameState.js

**分支**：`001-brick-breaker-game`  
**日期**：2026-02-25  
**用途**：定義 `src/gameState.js` 對外暴露的純函式介面契約，供測試與實作雙方遵守

---

## 概述

`gameState.js` 是遊戲的唯一邏輯層，所有函式為純函式或以狀態物件為唯一副作用目標的函式。此模組不依賴 `window`、`document` 或 Canvas API，可在 Node.js（Jest）環境中直接測試。

---

## 型別定義

```typescript
type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

interface Ball {
  x: number;         // 球心 X（像素）
  y: number;         // 球心 Y（像素）
  radius: number;    // 半徑（像素）
  vx: number;        // X 軸速度（像素/秒）
  vy: number;        // Y 軸速度（像素/秒）
}

interface Paddle {
  x: number;         // 左邊緣 X（像素）
  y: number;         // 上邊緣 Y（像素）
  width: number;     // 寬度（像素）
  height: number;    // 高度（像素）
  speed: number;     // 移動速度（像素/秒）
}

interface Brick {
  x: number;         // 左邊緣 X（像素）
  y: number;         // 上邊緣 Y（像素）
  width: number;     // 寬度（像素）
  height: number;    // 高度（像素）
  alive: boolean;    // true = 完好；false = 已摧毀
  points: number;    // 摧毀後得分
}

interface GameState {
  status: GameStatus;
  score: number;
  ball: Ball;
  paddle: Paddle;
  bricks: Brick[];
}
```

---

## 函式契約

### `createInitialState(): GameState`

建立並返回全新的初始遊戲狀態。

**前置條件**：無  
**後置條件**：
- `status === 'idle'`
- `score === 0`
- 所有磚頭 `alive === true`
- 球位於擋板中央上方，`vx` 與 `vy` 為初始值（球靜止等待開始）
- 擋板置於畫布水平中央

---

### `startGame(state: GameState): void`

將遊戲從 `idle` 切換為 `playing`，釋放球開始移動。

**前置條件**：`state.status === 'idle'`  
**後置條件**：
- `state.status === 'playing'`
- 球開始以初始速度向量移動

**副作用**：直接修改 `state` 物件。

---

### `resetGame(state: GameState): void`

將遊戲狀態完全重設至初始值，效果等同於重新呼叫 `createInitialState()` 後覆蓋 `state`。

**前置條件**：無（任何 `status` 均可呼叫）  
**後置條件**：
- `state.status === 'idle'`
- `state.score === 0`
- 所有磚頭 `alive === true`
- 球回到初始位置與速度
- 擋板回到中央

---

### `update(state: GameState, deltaTime: number): void`

執行一幀的遊戲更新：移動球、偵測碰撞、更新分數、判定勝負。

**前置條件**：`state.status === 'playing'`；`0 < deltaTime <= 0.05`  
**後置條件**：
- 球位置依 `vx * deltaTime`、`vy * deltaTime` 更新
- 碰撞偵測（牆壁、擋板、磚頭）後速度向量正確反轉
- 被擊中的磚頭 `alive` 設為 `false`，`score` 增加對應 `points`
- 若所有磚頭 `alive === false` → `state.status === 'won'`
- 若球 Y 座標超出畫布底部 → `state.status === 'lost'`

**副作用**：直接修改 `state` 物件。

---

### `movePaddle(state: GameState, direction: 'left' | 'right', deltaTime: number): void`

依鍵盤輸入方向與時間移動擋板，限制於畫布邊界內。

**前置條件**：`state.status === 'playing'`  
**後置條件**：
- 向左：`state.paddle.x` 減少 `paddle.speed * deltaTime`，最小值為 `0`
- 向右：`state.paddle.x` 增加 `paddle.speed * deltaTime`，最大值為 `CANVAS_WIDTH - paddle.width`

**副作用**：直接修改 `state.paddle.x`。

---

### `setPaddleX(state: GameState, x: number): void`

以滑鼠游標絕對 X 座標設定擋板位置（將擋板中心對齊游標）。

**前置條件**：`state.status === 'playing'`  
**後置條件**：
- `state.paddle.x = clamp(x - paddle.width / 2, 0, CANVAS_WIDTH - paddle.width)`

**副作用**：直接修改 `state.paddle.x`。

---

## 邊界與常數

| 常數 | 值 | 說明 |
|------|-----|------|
| `CANVAS_WIDTH` | 480 | 畫布寬度（像素） |
| `CANVAS_HEIGHT` | 600 | 畫布高度（像素） |
| `BALL_RADIUS` | 8 | 球半徑（像素） |
| `BALL_SPEED` | 300 | 球初始速率（像素/秒） |
| `PADDLE_WIDTH` | 80 | 擋板寬度（像素） |
| `PADDLE_HEIGHT` | 12 | 擋板高度（像素） |
| `PADDLE_SPEED` | 400 | 擋板鍵盤移動速率（像素/秒） |
| `BRICK_ROWS` | 6 | 磚頭列數 |
| `BRICK_COLS` | 10 | 磚頭行數 |
| `BRICK_POINTS` | 10 | 每塊磚頭得分 |

---

## 測試覆蓋要求

以下情境 **MUST** 在 Jest 測試中被覆蓋（TDD：測試先於實作）：

1. `createInitialState()` 返回正確的初始值
2. `startGame()` 將 `status` 改為 `playing`
3. `resetGame()` 重設所有欄位至初始值
4. `update()` 正確更新球位置
5. `update()` 偵測並反轉牆壁碰撞（左、右、上）
6. `update()` 偵測並正確反轉擋板碰撞，球不卡入擋板
7. `update()` 偵測磚頭碰撞，將 `alive` 設為 `false` 並增加分數
8. `update()` 球穿過底部時設 `status = 'lost'`
9. `update()` 所有磚頭摧毀時設 `status = 'won'`
10. `movePaddle()` 擋板左右移動，且不超出邊界
11. `setPaddleX()` 正確 clamp 擋板位置

---

*本文件依據專案憲法以繁體中文撰寫。*
