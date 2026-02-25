<!--
Sync Impact Report
==================
Version change: (new) → 1.0.0
Added sections: Core Principles, 開發流程規範, 網站專案規範, Governance
Templates updated:
  ✅ .specify/memory/constitution.md (this file)
  ✅ .specify/templates/plan-template.md (Constitution Check section aligned)
Deferred TODOs: none
-->

# game-ai Constitution

## 核心原則（Core Principles）

### I. 繁體中文優先（Traditional Chinese First）

所有規格文件（spec.md、plan.md、tasks.md）與 AI 回覆，MUST 以繁體中文撰寫。
程式碼內的識別字（變數名、函式名）維持英文，但注釋與文件一律使用繁體中文。

### II. 不過度設計（No Over-Engineering）

MUST 遵守 YAGNI 原則：只實作目前需求，不預先建立「未來可能用到」的抽象層。
新增任何架構層級（額外 package、service、abstraction）前，MUST 在 plan.md 的 Complexity Tracking 中說明其必要性。
設計決策以最簡單可行方案為預設選項。

### III. 測試驅動開發 TDD（NON-NEGOTIABLE）

MUST 先撰寫測試（確認測試失敗），再進行實作，最後重構（Red → Green → Refactor）。
任何新功能或 bug fix 均 MUST 有對應的自動化測試，且測試 MUST 在實作前建立並確認失敗。

### IV. tasks.md 打勾管理

在 implement 階段，MUST 在每個任務完成後立即於 tasks.md 中將對應項目打勾（`- [x]`）。
每完成一個邏輯工作單元後，MUST 執行 `report_progress` 進行 git commit，確保進度持續同步。

### V. 規格文件保護

在 implement 階段套用框架模板或初始化專案結構時，MUST 先確認 spec.md、plan.md、tasks.md 等規格文件不會被覆蓋或刪除。
若有衝突，MUST 保留規格文件，並在 tasks.md 中加入恢復步驟。

## 開發流程規範

- 不得建立額外的 Markdown 文件來記錄變更摘要或工作日誌，除非使用者明確要求。
- MUST 在每個開發階段結束時正確執行 git commit（透過 `report_progress`），確保版本歷史清晰。
- PR/Review 時 MUST 驗證上述所有原則均已遵守。

## 網站專案規範

凡被標記為網站（web）類型的專案，MUST 以靜態前端網站為主要交付物。
靜態網站 MUST 可直接部署至 GitHub Pages，不依賴後端伺服器執行。
若需要資料持久化，MUST 優先考慮 localStorage、靜態 JSON 檔案或第三方免費靜態服務（如 Firebase Realtime Database free tier）。

## Governance

本憲法優先於所有其他開發慣例。
修改憲法 MUST 提出明確理由，並更新版本號（遵循語意化版本規則）與 LAST_AMENDED_DATE。
所有 PR 在 merge 前 MUST 驗證符合本憲法各項原則。
複雜度超出原則範圍時，MUST 在 plan.md 的 Complexity Tracking 中記錄原因。

**Version**: 1.0.0 | **Ratified**: 2026-02-25 | **Last Amended**: 2026-02-25
