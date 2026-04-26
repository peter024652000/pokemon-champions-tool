# Pokemon Champions Tool — Claude 開發指南

## 專案概述

**Pokemon Champions Tool** 是一個給 [Pokemon Champions](https://champions.pokemon.com/)（任天堂官方遊戲，Switch/Switch 2，手機版 2026 年）玩家使用的雙語（繁中 / 英文）查詢工具。

功能包含：寶可夢列表與篩選、種族值 BP 分配、速度計算、特性說明、可學招式列表（含效果說明）、屬性相剋查詢。

---

## Tech Stack

- **React 19** + **Vite 5** + **Tailwind CSS v3**
- 純前端 SPA，無後端
- 資料來源：PokeAPI（寶可夢基礎資料）+ [projectpokemon/champout](https://github.com/projectpokemon/champout)（MIT）+ 本地靜態 JSON

---

## 啟動方式

```bash
npm install
npm run dev   # http://localhost:5173
```

---

## 資料架構

```
PokeAPI GitHub CSV
  └─ scripts/build-data.js  ← 一次性腳本，需連網
       ├─ src/data/pokemon-names.json   # 1025 筆，{ id: { zh, en } }
       ├─ src/data/ability-data.json    # 371 筆，{ slug: { zh, en, zhDesc, enDesc } }
       ├─ src/data/move-names.json      # 相容用，勿依賴
       ├─ src/data/ability-names.json   # 相容用，勿依賴
       └─ src/data/move-effects-en.json # 翻譯參考用，未被任何元件 import

projectpokemon/champout (MIT License)
  └─ scripts/build-moves.js ← 一次性腳本，需連網
       └─ src/data/move-data.json  # 495 筆 Champions 招式，{ slug: { zh, en, type, category, power, accuracy, pp, zhEffect, enEffect } }
  └─ scripts/build-items.js ← 一次性腳本，需連網
       └─ src/data/item-data.json  # 117 筆 Champions 道具，{ slug: { zh, en, category } }

src/utils/championsIds.js   ← 手動維護的 Champions 可用寶可夢名單
```

### 重要規則

| 檔案 | 是否可手動編輯 | 來源 |
|------|--------------|------|
| `src/data/pokemon-names.json` | ❌ build-data.js 產出 | PokeAPI |
| `src/data/ability-data.json` | ❌ build-data.js 產出 | PokeAPI |
| `src/data/move-data.json` | ❌ build-moves.js 產出 | champout (MIT) |
| `src/data/item-data.json` | ❌ build-items.js 產出 | champout (MIT) |
| `src/utils/championsIds.js` | ✅ 手動維護 | — |

如需重新產生資料：
```bash
node scripts/build-data.js   # pokemon-names, ability-data（需連網，PokeAPI）
node scripts/build-moves.js  # move-data（需連網，champout）
node scripts/build-items.js  # item-data（需連網，champout）
```

### 版權聲明
招式與道具資料來自 [projectpokemon/champout](https://github.com/projectpokemon/champout)，以 MIT License 授權。底層遊戲內容版權屬任天堂 / 寶可夢公司所有。

---

## 重要元件

| 元件 / 工具 | 職責 |
|------------|------|
| `src/components/PokemonModal.jsx` | 右側滑入面板，顯示詳細資訊 |
| `src/components/PokemonCard.jsx` | 寶可夢詳細卡片（名稱、種族值、特性、招式） |
| `src/components/MoveList.jsx` | 招式列表，hover 顯示效果說明 |
| `src/utils/abilityCache.js` | 特性名稱 + 說明快取（純本地 JSON） |
| `src/hooks/usePokemonList.js` | 主列表資料 hook |
| `src/context/LangContext.jsx` | 語言切換（zh / en） |

---

## 注意事項

### Pokemon Champions 與主線差異
Pokemon Champions **不是**主線遊戲的競技格式，而是獨立的官方新遊戲，有自己的招式數值調整。PokeAPI 的資料是主線（朱紫等）資料，部分 `effectChance` 與 Champions 不同，例如：
- Moonblast：主線 30% 特攻↓ → Champions 10%
- Iron Head：主線 30% 畏縮 → Champions 20%

目前 `move-data.json` 的 `effectChance` 仍是主線數值，尚未逐一校正為 Champions 數值。

### move-effects.json 繁中翻譯
繁中說明為 Claude 手動翻譯，並非來自官方文本（官方繁中文本在遊戲檔案中，無公開 API）。翻譯尚未完整校訂，部分語感或用詞可能有待改善。詳見 progress.md。

### effectChance 替換
MoveList.jsx 在 render 時將 `$effect_chance%` 替換為實際數值：
```js
effectText.replace(/\$effect_chance%/g, (d.effectChance || '?') + '%')
```

---

## 部署

- **正式網址**：https://pokemon-champions-tool.vercel.app/
- Vercel 與 GitHub main branch 連動，`git push` 自動觸發重新部署

## UI 改動規則

### JSX 結構
凡涉及 flex/grid 巢狀層（Screen A/B、split-panel、`absolute inset-0`）的改動，edit 的 `old_string` 必須涵蓋完整邏輯區塊（從父層開標籤到對應閉標籤）。動手前先計算受影響區塊的 `<div>` opens 與 `</div>` closes 數量確認平衡，再提交。

### 視覺布局
Layout 類需求（空白分配、對齊、置中）動手前，先用 ASCII 示意確認理解：
- 「置中」→ 先問是水平/垂直/相對誰
- 「間隔大一點」→ 先問是 margin/padding/哪個方向

有歧義先問，不猜測。

### 設計系統應用
套用文字 scale 前，先確認元件情境：
- 全版元件（BaseStats、MoveList、TeamListPage）→ `text-2xl font-bold` 作區塊標題
- Split-panel compact（ConfigPanel）→ `text-sm font-bold` 作所有區塊標題

對照 `DESIGN.md` 的 Compact context 規則再下 class。

### 改完後的說明方式
改完後用文字描述「預期看到的結果」，讓使用者對照確認，有問題再請使用者截圖。不主動呼叫截圖 MCP 工具。

### Preview 驗證規則
**不要用 preview_screenshot / preview_click 反覆嘗試。** 每一次 screenshot 都消耗 token，重複猜測按鈕 selector 是最大的浪費。

允許使用 preview 工具的情境（最多 2–3 次截圖）：
- 確認頁面有無 console error
- 一次性截圖確認視覺大方向正確
- 邏輯層已無法從 code 推斷結果時才截圖

不允許的用法：
- 用截圖代替讀 code 去理解 DOM 結構
- 反覆 click / eval 嘗試找對的 CSS selector
- 用 preview 做「測試」— 測試邏輯應靠讀 code + 推理解決

**正確作法：** 改完後直接用文字說明預期結果，若使用者發現問題才回頭看截圖或 console log。

---

## Git Commit 規則

**執行 `git commit` 前，必須先告知使用者將要提交的內容，並等待使用者明確確認後才能執行。不得在未經確認的情況下自動 commit。**

同樣地，`git push` 也必須等待使用者明確指示後才能執行。

## 工作進度更新規則

每完成一項功能或修正後，**主動更新 `.claude/progress.md`**，記錄：
1. 剛做了什麼（簡短一行）
2. 下一步打算做什麼

對話 /clear 前，也必須先更新 `.claude/progress.md`，確保下一個 session 能接續進度。

---

## Git / 開發環境

- Remote: `git@github.com:peter024652000/pokemon-champions-tool.git`（SSH）
- 新電腦需自行設定 SSH key 才能 push
- 所有資料 JSON 已 commit，新電腦 pull 後不需重跑 build-data.js

---

## 待辦（詳見 progress.md）

- [ ] `move-effects.json` 繁中翻譯持續校訂
- [ ] `championsIds.js` 部分地區形態可能遺漏
- [ ] `effectChance` 對照 Champions 官方數值逐一校正
