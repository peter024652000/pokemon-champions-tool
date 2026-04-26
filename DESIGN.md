# Design System — Pokemon Champions Tool

Inspired by the **Clay** design language. Adapted for bilingual (繁中 / EN) context with free Google Fonts.

---

## Typography

### Fonts

| Role | Font | Weight |
|------|------|--------|
| Latin / UI | Plus Jakarta Sans | 400, 500, 600, 700 |
| Chinese | Noto Sans TC | 400, 500, 700 |
| Fallback | system-ui, sans-serif | — |

Loaded via Google Fonts in `index.html`. Applied globally through `tailwind.config.js` `fontFamily.sans`.

Antialiasing: `-webkit-font-smoothing: antialiased` + `-moz-osx-font-smoothing: grayscale` on `body`.

---

### Text Scale

This scale applies across **all pages and modals**. Do not deviate — inconsistency between pages defeats the purpose of a design system.

| Tier | Tailwind | Size | Weight | Usage |
|------|----------|------|--------|-------|
| display-lg | `text-5xl` | 48px | `font-black` | Hero numbers (speed display) |
| display | `text-4xl` | 36px | `font-black` | Pokémon primary name |
| heading-1 | `text-2xl` | 24px | `font-black` | Page title, editable section name |
| heading-2 | `text-2xl` | 24px | `font-bold` | Section heading inside a card or modal panel (「種族值」「招式」「能力分配」) |
| heading-3 | `text-lg` | 18px | `font-bold` | Modal primary label (Pokémon name in ConfigPanel header) |
| body | `text-base` | 16px | 400–600 | Stat values, input text, sub-section labels (「對手速度比較」) |
| secondary | `text-sm` | 14px | 400–600 | Tab labels, button text, secondary descriptions |
| label | `text-xs` | 12px | `font-semibold` | Table column headers, form field labels, badge text, Pokémon ID |

> **Rule:** Each tier must be visually distinguishable from adjacent tiers without relying on colour alone. If two elements look the same size, at least one of them has the wrong tier.

### Compact context (split-panel modals)

When a modal is split into side-by-side columns (e.g. ConfigPanel: BP left / Moves right), use **`text-sm font-bold`** for all section labels — including both the column headings and the sub-section labels below. All labels at the same functional level must use the same size class.

Do **not** apply `text-2xl` inside split-panel modals — it is disproportionate in a ~350px column and creates misalignment when adjacent columns have different content heights. `text-2xl` is reserved for full-width section headings (BaseStats, MoveList, TeamListPage).

When a component is **embedded inside** an already-titled panel (e.g. TypeEffectiveness inside PokemonCard), drop **one tier** for its internal headings to avoid competing with the parent heading.

### Anti-patterns to avoid

```
❌ text-xs for a section heading  — indistinguishable from label text
❌ text-2xl for a table column header — too dominant, breaks hierarchy
❌ mixing text-gray-* with clay tokens — use clay-charcoal / clay-silver only
```

---

## Navigation

### Top Nav button style (all nav links share identical classes)

```
px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap
inactive: text-clay-silver hover:bg-clay-oat hover:text-clay-charcoal
active:   bg-clay-blue-mid text-clay-blue
```

### Nav spacing rule

All top-nav buttons (page links **and** dropdowns) must live in a **single** flex container with a **single** gap value (`gap-0.5 sm:gap-1`). Never nest a sub-group inside the nav row — it creates a different gap between the sub-group and adjacent items.

```
❌ <div flex gap-4>  <div flex gap-1> A B C </div>  D  </div>  ← D has 4× the gap
✅ <div flex gap-1>  A  B  C  D  </div>
```

---

## Color Palette

Defined under `theme.extend.colors.clay` in `tailwind.config.js`.

| Token | Hex | Usage |
|-------|-----|-------|
| `clay-cream` | `#faf9f7` | Page background, app shell |
| `clay-oat` | `#f0ece6` | Card inset, input backgrounds, empty states |
| `clay-border` | `#dad4c8` | All borders, dividers, skeleton loaders |
| `clay-silver` | `#9f9b93` | Secondary text, labels, placeholders |
| `clay-charcoal` | `#333333` | Primary text, headings |
| `clay-blue` | `#3b5fe2` | Primary CTA, active states, links |
| `clay-blue-light` | `#eef1fd` | Hover backgrounds for blue actions |
| `clay-blue-mid` | `#c7d2fa` | Active nav indicator, blue mid-fill |

All tokens are plain hex → Tailwind opacity modifiers work natively (`clay-blue/30`, `clay-border/40`, etc.).

### Preserved semantic colors (do NOT replace)
- **Type colors** — `TYPE_COLORS` map via inline `style={{ backgroundColor }}` in TypeBadge / TypeFilter
- **TypeChartPage** offense panel `border-red-300` / defense panel `border-blue-300`
- **Priority moves** `text-green-600` (positive) / `text-red-500` (negative)
- **Nature stat arrows** `text-red-500` (↑) / `text-blue-500` (↓)
- **Hidden ability badge** `bg-purple-100 text-purple-600`
- **Mega badge** `bg-purple-100`
- **SpeedPage** drum animation JS `el.style.backgroundColor`
- **Hero gradient** `linear-gradient(135deg, #334155, #1e293b)` (intentionally dark)

---

## Shadow System

Defined under `theme.extend.boxShadow` in `tailwind.config.js`.

| Token | Usage |
|-------|-------|
| `shadow-clay` | Standard cards, dropdowns, small elements |
| `shadow-clay-md` | Modals, elevated cards, hover state lift |
| `shadow-clay-nav` | Sticky nav bar, tab bar underline |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-[16px]` | 16 px | Cards, modals, inputs, buttons (inline) |
| `rounded-[12px]` | 12 px | Grid cells inside cards |
| `rounded-[24px]` | 24 px | Large section panels |
| `rounded-full` | 9999 px | CTAs, pill badges, avatar circles |

> Prefer inline `rounded-[16px]` over the alias `rounded-clay-card` for clarity.

---

## Component Conventions

### Cards
```
bg-white rounded-[16px] border border-clay-border shadow-clay
hover:shadow-clay-md hover:border-clay-blue/40 transition-all
```

### Empty / dashed slot
```
border-2 border-dashed border-clay-border
hover:border-clay-blue/50 hover:bg-clay-blue-light
```

### Primary CTA button
```
bg-clay-blue hover:opacity-90 text-white font-bold rounded-full shadow-clay transition-opacity
```

### Secondary / ghost button
```
bg-white border border-clay-border text-clay-silver
hover:bg-clay-oat hover:text-clay-charcoal transition-colors
```

### Active nav / tab
```
bg-clay-blue text-white   (pill nav)
border-b-2 border-clay-blue text-clay-blue   (underline tab)
```

### Text inputs / search
```
border border-clay-border rounded-[16px] px-4 py-2
focus:outline-none focus:ring-2 focus:ring-clay-blue/30
```

### Modals / overlays
```
bg-black/60   (backdrop)
bg-white rounded-[16px] shadow-clay-md   (panel)
border-b border-clay-border   (header divider)
```

### Breathing Room (呼吸感)

Interactive list items (move slots, build cards, table rows) need enough vertical padding to feel
tappable and visually distinct from each other.

| Context | Min vertical padding | Token |
|---------|---------------------|-------|
| Full-size clickable row (e.g. Screen A move slot) | 12 px top + bottom | `py-3` |
| Compact read-only row (e.g. Screen C mini move slot) | 4 px top + bottom | `py-1` |
| Card section metadata row | 6 px top + bottom | `py-1.5` |

> **Rule:** If two adjacent interactive rows touch without visible separation, increase `py` by one
> Tailwind step before adding margin or dividers. Padding is cheaper than extra markup.

---

## Future: Pokemon-Themed Palette

The current Clay swatch is a temporary placeholder. A custom palette tuned to the Pokemon Champions brand will replace or extend it later. Candidate approach:

- Keep `clay-cream` / `clay-oat` / `clay-border` for neutrals
- Replace `clay-blue` with a Champions-brand primary (TBD after official brand assets)
- Add type-color-aware accent tokens per type (e.g., `type-fire`, `type-water`, …) for team builder UI

---

## Reference

- Clay design system: https://getdesign.md/ (template: clay)
- Font: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) + [Noto Sans TC](https://fonts.google.com/noto/specimen/Noto+Sans+TC)
- Tailwind config: `tailwind.config.js`
- Token source: `src/index.css` (body defaults) + Tailwind custom theme
