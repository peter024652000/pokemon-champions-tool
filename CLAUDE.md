# Pokemon Champions Tool — Claude 開發指南

## 專案概述

**Pokemon Champions Tool** 是一個給 [Pokemon Champions](https://champions.pokemon.com/)（任天堂官方遊戲，Switch/Switch 2，手機版 2026 年）玩家使用的雙語（繁中 / 英文）查詢工具。

功能包含：寶可夢列表與篩選、種族值 BP 分配、速度計算、特性說明、可學招式列表（含效果說明）、屬性相剋查詢。

---

## Tech Stack

- **React 19** + **Vite 5** + **Tailwind CSS v3**
- 純前端 SPA，無後端
- 資料來源：PokeAPI（主線遊戲資料）+ 本地靜態 JSON

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
       ├─ src/data/move-data.json       # 937 筆，{ slug: { zh, en, effectId, effectChance } }
       ├─ src/data/ability-data.json    # 371 筆，{ slug: { zh, en, zhDesc, enDesc } }
       ├─ src/data/move-names.json      # 相容用，勿依賴
       ├─ src/data/ability-names.json   # 相容用，勿依賴
       └─ src/data/move-effects-en.json # 翻譯參考用，未被任何元件 import

src/data/move-effects.json  ← 手動維護的雙語招式效果表，{ effectId: { en, zh } }
src/utils/championsIds.js   ← 手動維護的 Champions 可用寶可夢名單
```

### 重要規則

| 檔案 | 是否可手動編輯 |
|------|--------------|
| `src/data/pokemon-names.json` | ❌ build-data.js 產出，手改會被覆蓋 |
| `src/data/move-data.json` | ❌ build-data.js 產出 |
| `src/data/ability-data.json` | ❌ build-data.js 產出 |
| `src/data/move-effects.json` | ✅ 手動維護，rebuild 不會覆蓋 |
| `src/utils/championsIds.js` | ✅ 手動維護 |

如需重新產生資料（例如 PokeAPI 有更新）：
```bash
node scripts/build-data.js
```

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
