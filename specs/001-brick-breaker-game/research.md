# 技術研究報告：簡單球反彈磚頭遊戲

**分支**：`001-brick-breaker-game`  
**日期**：2026-02-25  
**目的**：解決 plan.md Technical Context 中所有「NEEDS CLARIFICATION」項目，並確立技術決策

---

## 主題一：HTML5 Canvas vs DOM 元素

### 決策
使用 **HTML5 Canvas API** 作為唯一的渲染層。

### 理由
Canvas 以單一 `<canvas>` 元素作為畫布，每幀呼叫 `clearRect` 後重繪所有物件，不需要操作 DOM 樹。對於打磚頭這類需要每秒 60 幀持續更新的遊戲，Canvas 的優勢明顯：

- **效能**：避免瀏覽器的 layout／reflow 計算；磚頭數量達 ~80 顆同時更新時，Canvas 直接寫入 GPU 管線，代價遠低於 DOM 操作。
- **像素精確控制**：碰撞偵測基於座標數學，不依賴 `getBoundingClientRect()` 等 DOM API。
- **簡潔的遊戲迴圈**：`ctx.clearRect → update → draw` 是業界標準，學習資源豐富。
- **GitHub Pages 相容性**：Canvas 為瀏覽器原生 API，純靜態 HTML 即可執行，零依賴、零建置步驟。

### 替代方案評估

| 方案 | 評估 | 結論 |
|------|------|------|
| DOM 元素（`<div>` 定位） | 磚頭數量達 ~80 顆時 reflow 代價明顯；CSS transition 與遊戲迴圈難以同步 | 不採用 |
| WebGL / Three.js | 效能極佳但對 2D 打磚頭屬過度設計；引入外部依賴違反 YAGNI | 不採用 |
| SVG | 向量渲染清晰，但動態更新大量節點效能不如 Canvas | 不採用 |

---

## 主題二：Vanilla JavaScript 遊戲迴圈（requestAnimationFrame）

### 決策
使用 **`requestAnimationFrame`（rAF）+ Delta Time** 的標準遊戲迴圈，目標 60 FPS。

### 理由
`requestAnimationFrame` 由瀏覽器排程，與螢幕更新同步（通常 60 Hz），並在分頁不可見時自動暫停以節省資源。配合 Delta Time 可確保遊戲速度與幀率無關：

```javascript
let lastTimestamp = 0;

function gameLoop(timestamp) {
  const deltaTime = Math.min((timestamp - lastTimestamp) / 1000, 0.05); // 秒，上限 50ms
  lastTimestamp = timestamp;
  update(deltaTime);
  draw();
  requestAnimationFrame(gameLoop);
}
```

**關鍵實踐**：
- `deltaTime` 設上限（50ms），避免分頁切換後恢復時出現大跳幀導致球穿牆。
- 遊戲狀態為 `idle` 或 `paused` 時，繼續呼叫 rAF 但跳過 `update`，保持迴圈活躍。
- 以 `isRunning` 旗標控制暫停，而非 `cancelAnimationFrame`，簡化狀態管理。

### 替代方案評估

| 方案 | 評估 | 結論 |
|------|------|------|
| `setInterval` / `setTimeout` | 不與螢幕同步，可能撕裂；分頁隱藏時仍耗資源；計時精度較低 | 不採用 |
| 固定步長（Fixed Timestep） | 物理準確性更高，適合複雜物理引擎；打磚頭過度複雜 | 不採用 |
| 外部框架（Phaser、Pixi.js） | 封裝良好但引入大型依賴；違反 YAGNI | 不採用 |

---

## 主題三：碰撞偵測（球-磚頭、球-擋板）

### 決策
使用 **AABB（Axis-Aligned Bounding Box）重疊檢測** 搭配 **碰撞面深度比較**，處理同幀多碰撞與角落命中。

### 理由
AABB 以矩形邊界框為基礎，計算量極小，對打磚頭的矩形物件完全適用。

**球與磚頭碰撞流程**：
1. 找出當前幀所有與球重疊的磚頭（過濾已摧毀者）。
2. 取重疊面積最大者作為「主要碰撞磚」（處理同幀多碰撞）。
3. 比較 X 軸重疊深度 vs Y 軸重疊深度：
   - X 深度 < Y 深度 → 水平碰撞 → 反轉 `vx`
   - Y 深度 < X 深度 → 垂直碰撞 → 反轉 `vy`
   - 兩者相等（角落命中） → 同時反轉 `vx` 與 `vy`
4. 移除所有重疊磚頭（同幀同時消滅）。

**球與擋板碰撞**（含方向控制，對應 FR-011）：
- 以球碰觸位置相對擋板中心的偏移比例計算反彈角度。
- 碰撞後立即將球 Y 座標修正至擋板頂端外側，防止球「卡入」擋板。

**邊牆碰撞**：
- 左右牆：反轉 `vx`
- 上牆：反轉 `vy`
- 下邊界：觸發遊戲失敗，不反彈

### 替代方案評估

| 方案 | 評估 | 結論 |
|------|------|------|
| 圓形碰撞 | 球作圓形更精確，但磚頭與擋板仍為矩形，混用增加複雜度 | 不採用 |
| 分離軸定理（SAT） | 支援旋轉物件；此遊戲無旋轉需求，過度設計 | 不採用 |
| 子步驟連續碰撞偵測 | 防高速穿透；若球速合理設定，AABB 已足夠 | 暫不採用 |

---

## 主題四：JavaScript 測試策略（Canvas 遊戲）

### 決策
使用 **Jest（搭配 jsdom）** 測試純遊戲邏輯，透過「邏輯與渲染分離」架構使核心邏輯可測試，不測試 Canvas 渲染輸出本身。

### 理由
Canvas 渲染像素在 CI 環境（無 GPU）中難以直接驗證。有效策略是將遊戲分為兩層：

- `gameState.js`：純函式，處理物理更新、碰撞邏輯、分數計算（**完整單元測試**）
- `renderer.js`：依賴 Canvas Context，僅接受 state 並繪製（略過或整合測試）
- `game.js`：組合兩者，掌管遊戲迴圈

**可測試範例**：
- `moveBall(state, deltaTime)` → 斷言位置更新正確
- `detectBrickCollision(ball, bricks)` → 斷言碰撞時返回正確磚頭與反彈方向
- `resetGame()` → 斷言分數歸零、磚頭全部復活
- `checkWinCondition(bricks)` → 斷言全部摧毀時返回 `true`

### 替代方案評估

| 方案 | 評估 | 結論 |
|------|------|------|
| Vitest | 速度更快、ESM 原生支援；同樣可行 | 可作替代，Jest 優先 |
| Mocha + Chai | 靈活但需手動組合多個工具；設定繁瑣 | 不採用 |
| Playwright／Cypress（E2E） | 可測試真實渲染；較重，適合補充而非取代單元測試 | 可作未來補充 |
| 不寫測試 | 違反專案憲法 TDD 原則（NON-NEGOTIABLE） | 絕對不採用 |

---

## 主題五：GitHub Pages 部署

### 決策
將 `index.html` 置於**儲存庫根目錄（`/`）**，透過 GitHub Pages 設定「Deploy from branch → `main` → `/ (root)`」直接發布。

### 理由
- 純靜態 HTML + CSS + JS，完全符合 GitHub Pages 靜態托管模型。
- 根目錄部署最簡單，無需額外資料夾結構或建置流程，符合 YAGNI。
- 於根目錄放置 `.nojekyll` 空檔案，跳過 Jekyll 處理，加快部署速度。
- 零後端依賴，完全符合憲法「靜態前端網站」規範。

### 替代方案評估

| 方案 | 評估 | 結論 |
|------|------|------|
| `/docs` 資料夾 | 同樣支援；適合文件與原始碼分開的專案；遊戲本身即交付物不需隔離 | 可行，不優先 |
| `gh-pages` 分支 | 適合有建置步驟的框架；Vanilla JS 無此需求 | 不採用 |
| Netlify / Vercel | 功能豐富但引入外部服務依賴；GitHub Pages 已足夠 | 不採用 |

---

## 技術決策摘要表

| 主題 | 決策 |
|------|------|
| 渲染方式 | HTML5 Canvas API（Vanilla JS） |
| 遊戲迴圈 | `requestAnimationFrame` + Delta Time（上限 50ms） |
| 碰撞偵測 | AABB 重疊 + 碰撞面深度比較 |
| 測試框架 | Jest（jsdom）+ 邏輯渲染分離架構 |
| 部署方式 | GitHub Pages，`index.html` 於根目錄，含 `.nojekyll` |

*本文件依據專案憲法以繁體中文撰寫，所有技術決策均遵循 YAGNI 原則。*
