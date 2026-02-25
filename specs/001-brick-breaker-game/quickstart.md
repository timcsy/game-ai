# 快速上手指南：簡單球反彈磚頭遊戲

**分支**：`001-brick-breaker-game`  
**日期**：2026-02-25

---

## 前置需求

- **Node.js**（建議 18+）：用於執行測試
- 現代瀏覽器（Chrome / Firefox / Safari / Edge）：用於執行遊戲
- 不需要後端伺服器或資料庫

---

## 專案結構

```
/
├── index.html              # 遊戲入口頁面（GitHub Pages 部署目標）
├── style.css               # 遊戲樣式
├── .nojekyll               # 跳過 GitHub Pages Jekyll 處理
├── src/
│   ├── gameState.js        # 遊戲邏輯（純函式，可測試）
│   ├── renderer.js         # Canvas 渲染層
│   └── game.js             # 遊戲主控（組合邏輯與渲染）
├── tests/
│   └── unit/
│       ├── gameState.test.js
│       └── collision.test.js
└── package.json            # 測試依賴設定（Jest）
```

---

## 本地執行遊戲

### 方法一：直接用瀏覽器開啟（最簡單）

1. 複製儲存庫：
   ```bash
   git clone https://github.com/timcsy/game-ai.git
   cd game-ai
   ```
2. 直接用瀏覽器開啟 `index.html`：
   ```bash
   open index.html      # macOS
   start index.html     # Windows
   xdg-open index.html  # Linux
   ```

### 方法二：使用本地靜態伺服器（建議，避免部分 CORS 問題）

```bash
# 使用 Python（Python 3 已內建）
python -m http.server 8080
# 然後開啟 http://localhost:8080

# 或使用 Node.js npx
npx serve .
# 然後開啟顯示的網址
```

---

## 執行測試

```bash
# 安裝測試依賴
npm install

# 執行所有單元測試
npm test

# 執行測試並顯示覆蓋率報告
npm run test:coverage
```

---

## 遊戲操作說明

| 操作 | 說明 |
|------|------|
| 點擊「開始」按鈕 | 開始新一局遊戲 |
| **← →** 方向鍵 | 左右移動擋板 |
| 滑鼠在遊戲區域移動 | 擋板跟隨滑鼠水平位置 |
| 點擊「重新開始」 | 遊戲結束後重設並開始新一局 |

---

## 部署至 GitHub Pages

1. 推送至 `main` 分支
2. 前往 GitHub 儲存庫 → **Settings → Pages**
3. Source 選擇 **Deploy from a branch**
4. Branch 選擇 `main`，目錄選擇 `/ (root)`
5. 儲存後等待部署完成（通常 1–2 分鐘）
6. 遊戲網址：`https://timcsy.github.io/game-ai/`

---

## 開發工作流程（TDD）

依照專案憲法，所有功能 MUST 遵守 Red → Green → Refactor：

1. **Red**：在 `tests/unit/` 中撰寫測試，確認測試失敗
   ```bash
   npm test  # 應該看到 FAIL
   ```
2. **Green**：在 `src/gameState.js` 中實作最簡邏輯，使測試通過
   ```bash
   npm test  # 應該看到 PASS
   ```
3. **Refactor**：在不破壞測試的前提下改善程式碼品質
4. 完成後執行 `report_progress` 提交進度

---

## 技術架構一覽

```
index.html
  └── 載入 game.js

game.js（遊戲主控）
  ├── 建立並持有 GameState
  ├── 監聽鍵盤／滑鼠事件
  ├── requestAnimationFrame 迴圈
  │   ├── update(state, deltaTime)   ← gameState.js
  │   └── draw(state, ctx)           ← renderer.js
  └── 按鈕事件 → startGame / resetGame
```

---

*本文件依據專案憲法以繁體中文撰寫。*
