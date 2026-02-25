# 資料模型：簡單球反彈磚頭遊戲

**分支**：`001-brick-breaker-game`  
**日期**：2026-02-25  
**來源**：從 spec.md「關鍵實體」與「功能需求」萃取

---

## 實體定義

### 1. Ball（球）

| 欄位 | 型別 | 說明 |
|------|------|------|
| `x` | `number` | 球心 X 座標（像素） |
| `y` | `number` | 球心 Y 座標（像素） |
| `radius` | `number` | 球的半徑（像素，固定值，建議 8） |
| `vx` | `number` | X 軸速度（像素/秒） |
| `vy` | `number` | Y 軸速度（像素/秒） |

**驗證規則**：
- `radius > 0`
- 初始速度向量長度 > 0（球必須移動）
- `vx` 與 `vy` 的絕對值在遊戲進行中不得為 0（避免球水平或垂直飛行永遠不碰磚）

**狀態轉換**：
- `idle` → 球靜止，附著於擋板上方，等待開始
- `moving` → 球持續移動，每幀依 `vx`、`vy` 更新位置

---

### 2. Paddle（擋板）

| 欄位 | 型別 | 說明 |
|------|------|------|
| `x` | `number` | 擋板左邊緣 X 座標（像素） |
| `y` | `number` | 擋板上邊緣 Y 座標（像素，固定） |
| `width` | `number` | 擋板寬度（像素，建議 80） |
| `height` | `number` | 擋板高度（像素，固定值，建議 12） |
| `speed` | `number` | 鍵盤移動速度（像素/秒，建議 400） |

**驗證規則**：
- `x >= 0` 且 `x + width <= CANVAS_WIDTH`（擋板不得超出左右邊界，對應 FR-004）
- `width > 0`、`height > 0`

---

### 3. Brick（磚頭）

| 欄位 | 型別 | 說明 |
|------|------|------|
| `x` | `number` | 磚頭左邊緣 X 座標（像素） |
| `y` | `number` | 磚頭上邊緣 Y 座標（像素） |
| `width` | `number` | 磚頭寬度（像素） |
| `height` | `number` | 磚頭高度（像素，建議 20） |
| `alive` | `boolean` | `true` = 完好；`false` = 已摧毀 |
| `points` | `number` | 摧毀後加入的分數（初始版本統一為 10） |

**驗證規則**：
- 初始化時所有磚頭 `alive = true`
- 球碰觸後立即設為 `alive = false`，不再參與碰撞偵測

---

### 4. GameState（遊戲狀態）

| 欄位 | 型別 | 說明 |
|------|------|------|
| `status` | `'idle' \| 'playing' \| 'won' \| 'lost'` | 遊戲目前階段 |
| `score` | `number` | 玩家目前分數（非負整數） |
| `ball` | `Ball` | 球的狀態 |
| `paddle` | `Paddle` | 擋板的狀態 |
| `bricks` | `Brick[]` | 磚頭陣列（列 × 行） |

**驗證規則**：
- `score >= 0`
- `status` 只能為上述四種值之一

**狀態機（status 轉換）**：

```
idle ──[玩家按「開始」]──► playing
playing ──[所有磚頭消滅]──► won
playing ──[球穿過底部]──► lost
won ──[玩家按「重新開始」]──► idle
lost ──[玩家按「重新開始」]──► idle
```

---

## 磚頭陣列佈局

- **列數（rows）**：6（可調整，建議 5–8）
- **行數（cols）**：10（可調整，建議 8–12）
- 磚頭間距（padding）：5px
- 陣列起始 Y 偏移：60px（距頂部）
- 磚頭寬度：由 `(CANVAS_WIDTH - padding * (cols + 1)) / cols` 動態計算

---

## Canvas 尺寸常數

| 常數 | 值 | 說明 |
|------|-----|------|
| `CANVAS_WIDTH` | 480 | 遊戲區域寬度（像素） |
| `CANVAS_HEIGHT` | 600 | 遊戲區域高度（像素） |

---

## 純函式介面摘要（gameState.js 對外 API）

以下函式為核心邏輯層，均為純函式或以狀態物件為參數的可測試函式（詳細契約見 `contracts/game-api.md`）：

| 函式 | 說明 |
|------|------|
| `createInitialState()` | 建立初始遊戲狀態 |
| `startGame(state)` | 將 `status` 從 `idle` 改為 `playing`，釋放球 |
| `resetGame()` | 重設所有狀態至初始值 |
| `update(state, deltaTime)` | 更新球位置、偵測碰撞、更新分數、判定勝負 |
| `movePaddle(state, direction, deltaTime)` | 依方向與時間移動擋板，限制於邊界內 |
| `setPaddleX(state, x)` | 以絕對 X 座標設定擋板位置（滑鼠輸入用） |

---

*本文件依據專案憲法以繁體中文撰寫。*
