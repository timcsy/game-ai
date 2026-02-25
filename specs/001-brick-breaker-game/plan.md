# 實作計畫：簡單球反彈磚頭遊戲

**分支**：`001-brick-breaker-game` | **日期**：2026-02-25 | **規格**：[spec.md](spec.md)
**輸入**：功能規格來自 `/specs/001-brick-breaker-game/spec.md`

## 摘要

實作一款可在瀏覽器執行的單人打磚頭遊戲，以 Vanilla HTML5 Canvas + JavaScript 為技術核心，不依賴任何外部框架，可直接部署至 GitHub Pages。遊戲包含球、擋板、磚頭陣列，支援鍵盤／滑鼠控制、分數計算、勝負判定與重新開始功能。所有遊戲邏輯以可測試的純函式設計，並以 Jest 進行單元測試。

## Technical Context

**Language/Version**: HTML5 + CSS3 + JavaScript（ES2020）  
**Primary Dependencies**: 無（Vanilla JS，零外部依賴）；開發期 Jest（測試用）  
**Storage**: N/A（無資料持久化需求）  
**Testing**: Jest + jsdom（單元測試純遊戲邏輯）  
**Target Platform**: 現代瀏覽器（Chrome / Firefox / Safari / Edge）；GitHub Pages 靜態托管  
**Project Type**: 靜態網頁遊戲（web game）  
**Performance Goals**: 60 FPS 流暢遊戲畫面  
**Constraints**: 離線可用；零後端依賴；可直接部署至 GitHub Pages  
**Scale/Scope**: 單一頁面；磚頭陣列約 5–8 列 × 8–12 行；單人遊玩

## Constitution Check

*GATE：Phase 0 研究前必須通過。Phase 1 設計後重新確認。*

- [x] **繁體中文**：spec.md 以繁體中文撰寫；plan.md、tasks.md 亦將以繁體中文撰寫
- [x] **不過度設計**：採 Vanilla JS + Canvas，無框架、無後端，符合 YAGNI；Complexity Tracking 無需填寫
- [x] **TDD**：遊戲邏輯以純函式設計，Jest 測試將在實作前建立並確認失敗後才進行實作
- [x] **網站類型確認**：交付物為靜態 HTML/CSS/JS，可直接部署至 GitHub Pages，無後端伺服器依賴

*Phase 1 設計後複查結果：所有原則均符合，無違規。*

## Project Structure

### Documentation（本功能）

```text
specs/001-brick-breaker-game/
├── plan.md              # 本檔案（/speckit.plan 輸出）
├── research.md          # Phase 0 輸出（/speckit.plan）
├── data-model.md        # Phase 1 輸出（/speckit.plan）
├── quickstart.md        # Phase 1 輸出（/speckit.plan）
├── contracts/           # Phase 1 輸出（/speckit.plan）
│   └── game-api.md
└── tasks.md             # Phase 2 輸出（/speckit.tasks，非本指令產生）
```

### Source Code（儲存庫根目錄）

```text
/
├── index.html           # 遊戲入口頁面，GitHub Pages 部署目標
├── style.css            # 遊戲樣式
├── .nojekyll            # 跳過 GitHub Pages Jekyll 處理
├── src/
│   ├── gameState.js     # 純函式：遊戲狀態、物理更新、碰撞邏輯（可單元測試）
│   ├── renderer.js      # Canvas 渲染層（依賴 Canvas Context）
│   └── game.js          # 遊戲主控：組合 gameState + renderer，掌管迴圈
└── tests/
    └── unit/
        ├── gameState.test.js
        └── collision.test.js
```

**Structure Decision**：採用靜態網頁單一專案結構。遊戲邏輯與渲染分離（`gameState.js` vs `renderer.js`），使核心邏輯可獨立進行單元測試，而無需瀏覽器環境或 Canvas mock。`index.html` 置於根目錄以配合 GitHub Pages 預設發布設定。

## Complexity Tracking

> **僅在 Constitution Check 有需說明的違規時填寫**

*無違規，此區塊保留空白。*
