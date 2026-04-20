# 開發進度

## 已完成

### 核心架構
- [x] React 19 + Vite 5 + Tailwind CSS v3 建置
- [x] 繁中 / 英文語言切換（LangContext）
- [x] React Router v7（SPA 多頁路由）
- [x] Layout + TopNav（sticky，響應式手機版）
- [x] **部署至 Vercel**（git push 自動同步上線）

### 頁面架構
- [x] LandingPage `/`：說明頁，CTA 連結
- [x] PokedexPage `/pokedex`：搜尋 + 屬性篩選 + Mega 篩選
- [x] TypeChartPage `/types`：18 屬性選擇器 + 攻擊/防守面板
- [x] SpeedPage `/speed`：速度排行鼓面捲動
- [x] PokemonDetailPage `/pokemon/:apiName`：**全頁（已移除 Modal overlay）**

### 詳細頁面（PokemonDetailPage + PokemonCard）
- [x] 全頁設計：Hero（漸層全寬）+ Sticky Tab Bar + 內容區
- [x] Tab bar sticky 定位於 nav + 回列表列下方（top-[100px]）
- [x] 回列表按鈕 sticky top-14（貼在 Layout navbar 正下方）
- [x] 寶可夢名稱繁中顯示（本地 pokemon-names.json）
- [x] Mega 型態：sigil badge 顯示在名稱旁，bg-white/20
- [x] Mega 招式：從 base form fetch moves（PokeAPI mega endpoint moves 為空）
- [x] 特性欄位 hover tooltip（繁中 / 英文說明）

### 種族值 / 速度
- [x] 種族值 BP 分配器（BaseStats）
- [x] 速度計算機（SpeedCalculator）

### 屬性相剋（TypeEffectiveness）
- [x] 詳細頁內：弱點 / 普通 / 抵抗 / 無效果 四區 box row 設計
- [x] 分區標題雙語（Weak to / Normal / Resistant to / Immune）
- [x] 分區標題 text-base，倍率 text-sm，兩層字級統一
- [x] TypeChartPage 攻擊/防守面板（六倍率等級）

### 招式列表（MoveList）
- [x] **顯示全部 Champions 可學招式**（已移除 60 招上限）
- [x] 表格欄位：名稱 / 先制 / 屬性 / 類別 / 威力 / 命中 / PP
- [x] **先制度欄位**（+n 綠色、-n 紅色、0 灰色破折號）
- [x] 類別 icon：PokemonDB Gen6+ 風格（physical / special / status）
- [x] 預設依屬性排序（ALL_TYPES 順序），次要排序類別、威力
- [x] 屬性多選篩選（互斥禁用邏輯）
- [x] 類別單選篩選（互斥禁用邏輯）
- [x] 招式名稱搜尋（繁中 / 英文 / slug）
- [x] Hover 招式名稱顯示效果 tooltip（position: fixed，預設顯示上方）
- [x] 無附加效果招式不顯示說明（null）

### 資料層
- [x] `scripts/build-data.js`：從 PokeAPI GitHub CSV 產生本地 JSON
  - 寶可夢名稱（1025 筆，繁中 + 英文）
  - 招式（937 筆）：名稱、屬性、分類、威力、PP、命中、**先制度**、enEffect、zhEffect、effectChance
  - 特性（371 筆，267 筆有繁中說明）
  - rebuild 時保留手動維護的 zhEffect（不覆蓋）
- [x] `src/data/move-data.json`：每招式直接存 enEffect / zhEffect（已廢棄 effectId 間接方式）
  - 937 招，666 招有繁中效果說明，666 招有英文
  - 無效果招式（"Inflicts regular damage" 等）清為 null
- [x] ~~`src/data/move-effects.json`~~：**已整合進 move-data.json，此檔案不再被 import**

### UI 元件
- [x] TypeBadge：xs / sm / md / lg 四種尺寸，pokesprite icon + 文字
- [x] TypeFilter：grid-cols-6 sm:grid-cols-9（響應式），Mega toggle
- [x] PokemonGridItem：Mega sigil 右上角 badge

### 速度排行頁（SpeedPage）
- [x] 路由：`/speed`
- [x] 速度計算：Lv50・31 IV・0 EV・無性格加成
- [x] 鼓面捲動效果（CSS mask-image + transform scale）
- [x] 搜尋 + Enter 循環跳轉 + 高亮（黃色漸層光暈）
- [x] Mega 型態支援

### 響應式（手機）
- [x] Layout Nav：Logo 手機版縮短（隱藏「Tool」），連結文字 / 間距縮小
- [x] TypeFilter / TypeChartPage 屬性選擇器：grid-cols-6 sm:grid-cols-9

---

## 進行中

### zhEffect 繁中校訂
- 666 招有繁中效果說明（來自舊 move-effects.json 遷移）
- 翻譯為 Claude 手動產出，非官方文本
- **尚未完整校訂**：語感、用詞可能仍有改善空間

---

## 已知問題 / 待辦

### 資料準確性
- [ ] **`effectChance` 數值與 Champions 不符**：`move-data.json` 的機率來自 PokeAPI 主線，Champions 有調整。例如：
  - Moonblast：主線 30% 特攻↓ → Champions 10%
  - Iron Head：主線 30% 畏縮 → Champions 20%
  - 需逐一對照 Champions 官方招式表校正

- [ ] **zhEffect 繁中翻譯待持續校訂**

- [ ] **部分地區形態可能遺漏**：`championsIds.js` 手動維護

### 功能 / UX
- [ ] 手機版詳細頁 Hero 排版待確認（sprite + 文字 flex-wrap 在小螢幕的表現）
- [ ] 招式列表在手機上表格欄位可能過窄（目前尚未針對手機版調整欄寬）

---

## 技術備注

- Pokemon Champions 是任天堂官方獨立遊戲（非主線競技格式），有獨立招式平衡
- 繁中招式效果說明無公開 API，官方文本僅存在於遊戲檔案中
- PokeAPI 只涵蓋主線資料，不包含 Champions 的平衡改動
- Mega form 在 PokeAPI 的 `/pokemon/{mega-name}` endpoint moves 為空，需另 fetch base form
- 部署平台：Vercel（git push 自動觸發重新部署）
