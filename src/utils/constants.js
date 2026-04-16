export const TYPE_COLORS = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

export const TYPE_NAMES_ZH = {
  normal: '一般',
  fire: '火',
  water: '水',
  electric: '電',
  grass: '草',
  ice: '冰',
  fighting: '格鬥',
  poison: '毒',
  ground: '地面',
  flying: '飛行',
  psychic: '超能力',
  bug: '蟲',
  rock: '岩石',
  ghost: '幽靈',
  dragon: '龍',
  dark: '惡',
  steel: '鋼',
  fairy: '妖精',
};

export const STAT_NAMES_ZH = {
  hp: 'HP',
  attack: '攻擊',
  defense: '防禦',
  'special-attack': '特攻',
  'special-defense': '特防',
  speed: '速度',
};

export const STAT_COLORS = {
  hp: '#FF5959',
  attack: '#F5AC78',
  defense: '#FAE078',
  'special-attack': '#9DB7F5',
  'special-defense': '#A7DB8D',
  speed: '#FA92B2',
};

// Defensive type chart: what attacking types are super-effective / resisted / immune
export const TYPE_CHART = {
  normal:   { weakTo: ['fighting'],                                           resistantTo: [],                                                              immuneTo: ['ghost'] },
  fire:     { weakTo: ['water', 'ground', 'rock'],                            resistantTo: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'],               immuneTo: [] },
  water:    { weakTo: ['electric', 'grass'],                                  resistantTo: ['fire', 'water', 'ice', 'steel'],                               immuneTo: [] },
  electric: { weakTo: ['ground'],                                             resistantTo: ['electric', 'flying', 'steel'],                                 immuneTo: [] },
  grass:    { weakTo: ['fire', 'ice', 'poison', 'flying', 'bug'],             resistantTo: ['water', 'electric', 'grass', 'ground'],                       immuneTo: [] },
  ice:      { weakTo: ['fire', 'fighting', 'rock', 'steel'],                  resistantTo: ['ice'],                                                         immuneTo: [] },
  fighting: { weakTo: ['flying', 'psychic', 'fairy'],                         resistantTo: ['bug', 'rock', 'dark'],                                         immuneTo: [] },
  poison:   { weakTo: ['ground', 'psychic'],                                  resistantTo: ['grass', 'fighting', 'poison', 'bug', 'fairy'],                 immuneTo: [] },
  ground:   { weakTo: ['water', 'grass', 'ice'],                              resistantTo: ['poison', 'rock'],                                              immuneTo: ['electric'] },
  flying:   { weakTo: ['electric', 'ice', 'rock'],                            resistantTo: ['grass', 'fighting', 'bug'],                                    immuneTo: ['ground'] },
  psychic:  { weakTo: ['bug', 'ghost', 'dark'],                               resistantTo: ['fighting', 'psychic'],                                         immuneTo: [] },
  bug:      { weakTo: ['fire', 'flying', 'rock'],                             resistantTo: ['grass', 'fighting', 'ground'],                                 immuneTo: [] },
  rock:     { weakTo: ['water', 'grass', 'fighting', 'ground', 'steel'],      resistantTo: ['normal', 'fire', 'poison', 'flying'],                          immuneTo: [] },
  ghost:    { weakTo: ['ghost', 'dark'],                                      resistantTo: ['poison', 'bug'],                                               immuneTo: ['normal', 'fighting'] },
  dragon:   { weakTo: ['ice', 'dragon', 'fairy'],                             resistantTo: ['fire', 'water', 'electric', 'grass'],                          immuneTo: [] },
  dark:     { weakTo: ['fighting', 'bug', 'fairy'],                           resistantTo: ['ghost', 'dark'],                                               immuneTo: ['psychic'] },
  steel:    { weakTo: ['fire', 'fighting', 'ground'],                         resistantTo: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'], immuneTo: ['poison'] },
  fairy:    { weakTo: ['poison', 'steel'],                                    resistantTo: ['fighting', 'bug', 'dark'],                                     immuneTo: ['dragon'] },
};

export const ALL_TYPES = Object.keys(TYPE_CHART);

export const SPEED_NATURES = [
  { label: '+速度', value: 1.1 },
  { label: '中性',  value: 1.0 },
  { label: '-速度', value: 0.9 },
];

// Common speed benchmarks for VGC reference (base speed, zh name)
export const SPEED_BENCHMARKS = [
  { name: '土地雲 (79)',          base: 79 },
  { name: '水君 (80)',            base: 80 },
  { name: '拳魔/武道熊師 (90)',   base: 90 },
  { name: '盔甲鳥 (93)',          base: 93 },
  { name: '熊徒弟 (95)',          base: 95 },
  { name: '鋼鐵葉冠 (100)',       base: 100 },
  { name: '噴火龍 (100)',         base: 100 },
  { name: '甲賀忍蛙 (122)',       base: 122 },
  { name: '飄浮曼 (125)',         base: 125 },
  { name: '闘将虎鲸王 (130)',     base: 130 },
  { name: '鬼斯通 (130)',         base: 130 },
  { name: '雷鳴鴿 (135)',         base: 135 },
  { name: '帝牙盧卡 (150)',       base: 150 },
  { name: '雷電王 (200)',         base: 200 },
];
