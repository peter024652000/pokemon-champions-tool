# 開發進度

## 已完成

### 核心架構
- [x] React 19 + Vite 5 + Tailwind CSS v3 建置
- [x] 繁中 / 英文語言切換（LangContext）
- [x] 寶可夢列表（Champions 名單篩選）
- [x] 屬性篩選器（TypeFilter）

### 資料層
- [x] `scripts/build-data.js`：從 PokeAPI GitHub CSV 一次性產生本地 JSON
  - 寶可夢名稱（1025 筆，繁中 + 英文）
  - 招式名稱 + effectId + effectChance（937 筆）
  - 特性名稱 + 繁中/英文說明（371 筆，267 筆有繁中說明）
- [x] `src/data/move-effects.json`：雙語招式效果說明靜態表（428 種效果類型）

### 詳細頁面（PokemonModal + PokemonCard）
- [x] 右側滑入面板（取代彈窗，空間更大）
- [x] 寶可夢名稱繁中顯示（本地 pokemon-names.json）
- [x] 種族值 BP 分配器
- [x] 速度計算機
- [x] 特性欄位 hover tooltip（繁中 / 英文說明）
- [x] 屬性相剋表

### 招式列表（MoveList）
- [x] 批次預載招式資料（批次大小 8，最多 60 招）
- [x] 搜尋（招式名稱，繁中 / 英文 / slug 均可）
- [x] 每行常駐顯示：名稱、屬性、分類（物理/特殊/變化）、威力、命中、PP
- [x] Hover 顯示效果說明（使用 move-effects.json，帶入實際機率數值）
- [x] 無附加效果的招式（純傷害）不顯示說明

---

## 進行中

### move-effects.json 繁中翻譯校訂
- 已完成初版翻譯（428 種效果）
- 已比對官方繁中 flavor text 進行用詞修正（後座力、Rest、Shadow Force 等）
- **尚未完整校訂**：部分語感、用詞可能仍與官方慣用說法有出入

---

## 已知問題 / 待辦

### 資料準確性
- [ ] **`effectChance` 數值與 Champions 不符**：`move-data.json` 的機率來自 PokeAPI 主線資料，但 Champions 有調整部分招式。例如：
  - Moonblast：主線 30% 特攻↓ → Champions 10%
  - Iron Head：主線 30% 畏縮 → Champions 20%
  - 需逐一對照 serebii/game8 的 Champions 招式表校正

- [ ] **`move-effects.json` 繁中翻譯待持續校訂**：翻譯為 Claude 手動產出，非官方文本，語感和細節仍有改善空間

- [ ] **部分地區形態遺漏**：`src/utils/championsIds.js` 手動維護，可能未涵蓋所有 Champions 中可用的地區形態

### 功能
- [ ] 招式列表上限 60 招（效能考量），超過的招式無法顯示

---

## 技術備注

- Pokemon Champions 是任天堂官方獨立遊戲（非主線競技格式），有獨立的招式平衡調整
- 繁中招式效果說明無公開 API，官方文本僅存在於遊戲檔案中
- PokeAPI 只涵蓋主線遊戲資料，不包含 Champions 的平衡改動
