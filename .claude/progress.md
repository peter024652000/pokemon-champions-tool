# Pokemon Champions Tool — 工作進度

> 最後更新：2026-04-17

---

## 專案概覽

React 19 + Vite 5 + Tailwind CSS v3 的寶可夢雙打查詢工具。
目標使用者：Pokemon Champions（任天堂官方遊戲，Switch/Switch 2）玩家，用於查詢種族值、速度、招式、特性等對戰資料。

- GitHub：`peter024652000/pokemon-champions-tool`
- 詳細開發指南：`CLAUDE.md`（專案根目錄）

---

## ✅ 已完成

### 核心架構
- React 19 + Vite 5 + Tailwind CSS v3 建置
- 繁中 / 英文語言切換（LangContext）
- 寶可夢列表（Champions 名單篩選）、屬性篩選器（TypeFilter）
- **修正：Vite 8→5 降版**（Vite 8 rolldown-vite 在 dev mode 下 PostCSS/Tailwind 失效）
- **修正：網格渲染改用 `filtered`**（不需先篩選即可點擊寶可夢）

### 資料層
- `scripts/build-data.js`：從 PokeAPI GitHub CSV 一次性產生本地 JSON
  - `src/data/pokemon-names.json`：1025 筆寶可夢名稱（繁中 + 英文）
  - `src/data/move-data.json`：937 筆招式（名稱、effectId、effectChance）
  - `src/data/ability-data.json`：371 筆特性（名稱 + 繁中/英文說明）
- `src/data/move-effects.json`：手動維護的雙語招式效果說明表（428 種效果類型）
- 所有 JSON 已 commit，新機器 pull 後不需重跑 build-data.js

### 詳細頁面（PokemonModal + PokemonCard）
- 右側滑入面板（取代原本的 overlay 彈窗，空間更大）
- 寶可夢名稱繁中顯示（本地 pokemon-names.json）
- 種族值 BP 分配器（input type="number" + ▲/✕ 按鈕）
- 速度計算機（Champions 名單 13 隻速度基準）
- 個性選擇：可收合 5×5 矩陣（欄=↑屬性，列=↓屬性），選後自動收合
- 特性欄位 hover tooltip（繁中 / 英文說明，來自本地 ability-data.json）
- 屬性相剋表
- **UI 調整**：header 改中性深色（`#334155 → #1e293b`），隱藏特性標籤樣式統一（不再半透明）

### 招式列表（MoveList）
- 批次預載招式資料（批次大小 8，最多 60 招）
- 搜尋（招式名稱，繁中 / 英文 / slug 均可）
- 每行常駐：名稱、屬性、分類（物理/特殊/變化）、威力、命中、PP
- Hover 顯示效果說明（move-effects.json，帶入實際機率數值）
- 無附加效果的招式（純傷害）不顯示說明

### 寶可夢名單（championsIds.js）
- 新增 7 隻 Z-A Mega：鈴鐘（#358）、雪妖女（#478）、龍頭地鼠（#530）、布里卡隆（#652）、妖火紅狐（#655）、甲賀忍蛙（#658）、摔角鷹人（#701）
- 新增地區形態：洗翠風速狗（#59）、永恆之花花葉蒂（#670）、雌超能妙喵（#678）、南瓜怪人三尺寸（#711）、洗翠冰岩怪（#713）、洗翠決決大蔥（#724）、洗翠端帝納（#503）、洗翠幽尾玄魚（#571）…等
- 修正肯泰羅帕底亞 API 名稱（補 `-breed` 後綴）
- Mega 名稱統一顯示：標籤統一為「Mega」，全名顯示為「超級[名稱][ X/Y]」
- 鬃岩狼人基底形態標記為白晝型（`BASE_FORM_LABELS`）
- **修正：移除誤加的南瓜精 #710**（非 Champions 可用寶可夢）

### 開發工具
- `.claude/progress.md`：工作進度紀錄（本檔案），已 commit 至 Git
- `.claude/commands/progress.md`：`/progress` 指令定義
- `C:\Users\yun.chuang\.claude\skills\progress\SKILL.md`：使用者層級技能，輸入「更新進度」觸發

---

## 🚧 進行中

### move-effects.json 繁中翻譯校訂
- 已完成初版（428 種效果），已比對官方繁中 flavor text 修正部分用詞
- **尚未完整校訂**：語感、用詞可能仍與官方慣用說法有出入

---

## ⚠️ 已知問題 / 待辦

### 資料準確性
- [ ] **`effectChance` 數值與 Champions 不符**：move-data.json 機率來自主線 PokeAPI，Champions 有調整（例：Moonblast 主線 30% → Champions 10%；Iron Head 主線 30% → Champions 20%）。需逐一對照官方資料校正
- [ ] **`move-effects.json` 繁中翻譯持續校訂中**
- [ ] **部分地區形態可能遺漏**（`championsIds.js` 手動維護）
- [ ] **Z-A 新 Mega 形態無圖片**：PokeAPI 尚未收錄這批新 Mega 的圖檔，顯示為問號

### 功能
- [ ] 招式列表上限 60 招（效能考量），超過的招式無法顯示
- [ ] 介面固定文字中英切換（Tab 標籤等目前仍為中文）
- [ ] 速度計算 tab 的 BP 與種族值分配 BP 目前獨立，未互通
- [ ] 手機版自適應（目前無 sm:/md: 響應式前綴）
- [ ] 部署（Vercel / GitHub Pages）尚未設定，功能穩定後再處理

### 已解決的舊問題
- ~~中文名稱未顯示~~（改用本地 pokemon-names.json，不再依賴 PokeAPI 中文）
- ~~點擊無反應 / Modal 出現在頁面底部~~（Vite 降版 + filtered 渲染）
- ~~動態像素圖（Showdown sprites）~~（試用後回退，視覺干擾）

---

## 技術備注

- Pokemon Champions 是任天堂官方獨立遊戲（非主線競技格式），有獨立的招式平衡調整
- 繁中招式效果說明無公開 API，官方文本僅存在於遊戲檔案中，目前使用 Claude 手動翻譯版
- PokeAPI 只涵蓋主線遊戲資料，不包含 Champions 的平衡改動
- Vite 8 (rolldown-vite) 在 dev mode 下 PostCSS/Tailwind 失效，需鎖定 Vite 5

---

## 檔案結構

```
src/
├── App.jsx                     # 主框架，語言切換，搜尋，網格
├── context/
│   └── LangContext.jsx         # 語言 context（zh/en）
├── hooks/
│   └── usePokemonList.js       # 資料載入 hook（使用本地 pokemon-names.json）
├── data/                       # 本地靜態 JSON（build-data.js 產出，勿手改）
│   ├── pokemon-names.json
│   ├── move-data.json
│   ├── ability-data.json
│   ├── move-effects.json       # ✅ 手動維護，rebuild 不覆蓋
│   └── move-effects-en.json    # 翻譯參考用，未被元件 import
├── components/
│   ├── PokemonGridItem.jsx
│   ├── PokemonModal.jsx        # 右側滑入面板
│   ├── PokemonCard.jsx         # 詳細資料（4 tab + 個性矩陣）
│   ├── BaseStats.jsx           # 種族值 + BP 分配
│   ├── SpeedCalculator.jsx     # 速度計算
│   ├── TypeEffectiveness.jsx   # 屬性相剋
│   ├── TypeFilter.jsx          # 屬性多選篩選
│   ├── MoveList.jsx            # 招式列表
│   └── TypeBadge.jsx
└── utils/
    ├── championsIds.js         # ✅ 手動維護，Champions 名單
    ├── constants.js            # 屬性色彩、個性、速度基準
    ├── calcStats.js            # 種族值/速度計算公式
    ├── pokeapi.js              # fetchWithCache
    └── abilityCache.js         # 特性名稱（本地 ability-data.json）

scripts/
└── build-data.js               # 一次性資料產生腳本（需連網）
```
