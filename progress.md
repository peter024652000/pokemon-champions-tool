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
- [x] PokemonDetailPage `/pokemon/:apiName`：全頁（已移除 Modal overlay）
- [x] TeamListPage `/team`：隊伍清單，新增/刪除隊伍
- [x] TeamDetailPage `/team/:id`：組隊詳細頁（能力 / 狀態雙 tab）

### 設計系統（Clay Design）
- [x] **字型**：Plus Jakarta Sans（英文）+ Noto Sans TC（中文），Google Fonts 免費載入
- [x] **色盤**：Clay token 全套（cream / oat / border / silver / charcoal / blue / blue-light / blue-mid）
- [x] **陰影**：三層系統（shadow-clay / shadow-clay-md / shadow-clay-nav）
- [x] **圓角**：卡片 16px、小格子 12px、CTA rounded-full
- [x] **全站套用**：所有頁面與元件統一替換（TypeBadge 型別色 / priority 色 / Mega purple 保留語義色）
- [x] **DESIGN.md** 建立（設計系統文件，含色板、字型、元件規範）

### 詳細頁面（PokemonDetailPage + PokemonCard）
- [x] 全頁設計：Hero（深色漸層，`#334155 → #1e293b`）+ Sticky Tab Bar + 內容區
- [x] Tab bar sticky 定位於 nav + 回列表列下方（top-[100px]）
- [x] 回列表按鈕 sticky top-14
- [x] 寶可夢名稱繁中顯示（本地 pokemon-names.json）
- [x] Mega 型態：sigil badge 顯示在名稱旁
- [x] 特性欄位 hover tooltip（`bg-clay-charcoal/95`，繁中 / 英文說明）

### 種族值
- [x] 種族值純 base stat 顯示（BaseStats，已移除性格 / BP 計算）
- [x] SpeedCalculator 保留備用

### 詳細頁 Tab 結構
- [x] 三 tab：種族值 / 屬性相剋 / 招式列表

### 屬性相剋（TypeEffectiveness）
- [x] 弱點 / 普通 / 抵抗 / 無效果四區設計
- [x] TypeChartPage 攻擊/防守面板（六倍率等級）

### 招式列表（MoveList）
- [x] 全部 Champions 可學招式（無數量上限）
- [x] 表格欄位：名稱 / 先制 / 屬性 / 類別 / 威力 / 命中 / PP
- [x] 先制度欄位（+n 綠色、-n 紅色）
- [x] 招式 hover tooltip（`bg-clay-charcoal/95`，固定定位，預設顯示上方）
- [x] 屬性多選 + 類別單選篩選（互斥禁用邏輯）
- [x] 類別篩選按鈕 active 色：`bg-clay-border text-clay-charcoal`（暖米棕，圖示可見）

### 組隊工具（Team Builder）
- [x] `useTeams` hook + localStorage 持久化
- [x] 隊伍 CRUD：新增、命名、刪除、6 格寶可夢槽位
- [x] TeamSlot：能力（AbilityView）/ 狀態（StatusView）雙 tab
- [x] AbilityView：特性 + 道具 + 4 招式（2×2 格，帶屬性色邊線）
- [x] StatusView：種族值 + BP 分配後的計算值 + 個性加成條
- [x] **ConfigPanel 大改版**（詳見下方）

### ConfigPanel 改版
- [x] 置中 modal（`max-w-2xl max-h-[90vh]`），點外部黑色遮罩關閉
- [x] ✕ 按鈕固定在右上角（絕對定位），移除「← 取消」文字按鈕
- [x] 確認按鈕移到最底部置中（`rounded-full`，`bg-clay-blue`）
- [x] **招式選擇改為 inline slide 動畫**：點招式欄位 → Screen A 向左滑出，Screen B（招式選擇）從右滑入；選完自動返回；不再開第二層 modal
- [x] 招式 Screen B 含：搜尋 + 屬性篩選（圓形按鈕）+ 類別篩選 + 列表（hover clay-blue-light）
- [x] Stat icon（♥✦✤等符號）移除
- [x] Stat bar 移除 `opacity: 0.35`，bp=0 時顏色全程完整顯示

### PokemonPicker 改版
- [x] 行動版：全螢幕（避免內容太小）
- [x] 桌面：置中 card（`max-w-4xl max-h-[90vh]`），左右留白可見背景
- [x] 格線：行動版 3 欄（原 2 欄），更緊湊
- [x] 點外部關閉

### 資料層
- [x] `scripts/build-data.js`：從 PokeAPI GitHub CSV 產生本地 JSON
- [x] `src/data/move-data.json`：937 招，每招直接存 enEffect / zhEffect
  - 666 招有繁中效果說明
  - 無效果招式清為 null
- [x] ~~`src/data/move-effects.json`~~：已整合進 move-data.json，不再 import

### Sprite 策略
- [x] 優先順序：`front_default`（像素）→ Showdown `dex.png` → `official-artwork`
- [x] 詳細頁 Hero：`official-artwork` 優先（getSpriteUrl）

### 速度排行頁（SpeedPage）
- [x] 速度計算：Lv50・31 IV・0 EV・無性格加成
- [x] 鼓面捲動效果（CSS mask-image + transform scale）
- [x] 搜尋 + Enter 循環跳轉 + 高亮

### 響應式
- [x] Layout Nav：Logo 手機版縮短，連結間距縮小
- [x] TypeFilter：grid-cols-6 sm:grid-cols-9

---

## 進行中

### zhEffect 繁中校訂
- 666 招有繁中效果說明（Claude 手動翻譯，非官方文本）
- **尚未完整校訂**：語感、用詞可能仍有改善空間

---

## 已知問題 / 待辦

### 資料準確性
- [ ] **`effectChance` 與 Champions 不符**：來自 PokeAPI 主線，Champions 有調整
  - Moonblast：主線 30% 特攻↓ → Champions 10%
  - Iron Head：主線 30% 畏縮 → Champions 20%
- [ ] zhEffect 繁中翻譯待持續校訂
- [ ] 部分地區形態可能遺漏（`championsIds.js` 手動維護）

### 功能 / UX
- [ ] 手機版詳細頁 Hero 排版待確認
- [ ] 招式列表在手機上表格欄位可能過窄

---

## 技術備注

- Pokemon Champions 是任天堂官方獨立遊戲（非主線競技格式），有獨立招式平衡
- 繁中招式效果說明無公開 API，官方文本僅存在遊戲檔案
- PokeAPI 只涵蓋主線資料，不包含 Champions 平衡改動
- Mega form 在 PokeAPI 的 `/pokemon/{mega-name}` endpoint moves 為空，需另 fetch base form
- Clay blue = `#3b5fe2`（`clay-blue` token），是 Clay 設計系統的 primary 色，無需更改
- Hero 深色漸層（`#334155 → #1e293b`）刻意保留，不套用 Clay light 風格
- 部署平台：Vercel（git push main 自動觸發重新部署）
