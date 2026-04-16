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

// Speed benchmarks — Champions roster only
export const SPEED_BENCHMARKS = [
  { name: '烏龜爐 (20)',    base: 20  },
  { name: '呆呆獸 (30)',    base: 30  },
  { name: '嚇嚇糖 (60)',    base: 60  },
  { name: '火焰雞 (65)',    base: 65  },
  { name: '九尾 (76)',      base: 76  },
  { name: '土地雲 (79)',    base: 79  },
  { name: '風速狗 (95)',    base: 95  },
  { name: '烈咬陸鯊 (102)', base: 102 },
  { name: '甲賀忍蛙 (122)', base: 122 },
  { name: '斬擊鬼蝠 (125)', base: 125 },
  { name: '火焰鳥 (126)',   base: 126 },
  { name: '化石翼龍 (130)', base: 130 },
  { name: '幽靈龍 (142)',   base: 142 },
];

// 25 natures with stat effects
// increased/decreased use PokeAPI stat key names
export const NATURES = [
  { zh: '勤奮', en: 'Hardy',    increased: null,               decreased: null },
  { zh: '孤獨', en: 'Lonely',   increased: 'attack',           decreased: 'defense' },
  { zh: '勇敢', en: 'Brave',    increased: 'attack',           decreased: 'speed' },
  { zh: '固執', en: 'Adamant',  increased: 'attack',           decreased: 'special-attack' },
  { zh: '頑皮', en: 'Naughty',  increased: 'attack',           decreased: 'special-defense' },
  { zh: '大膽', en: 'Bold',     increased: 'defense',          decreased: 'attack' },
  { zh: '溫順', en: 'Docile',   increased: null,               decreased: null },
  { zh: '悠閒', en: 'Relaxed',  increased: 'defense',          decreased: 'speed' },
  { zh: '淘氣', en: 'Impish',   increased: 'defense',          decreased: 'special-attack' },
  { zh: '鬆懈', en: 'Lax',      increased: 'defense',          decreased: 'special-defense' },
  { zh: '膽小', en: 'Timid',    increased: 'speed',            decreased: 'attack' },
  { zh: '急躁', en: 'Hasty',    increased: 'speed',            decreased: 'defense' },
  { zh: '認真', en: 'Serious',  increased: null,               decreased: null },
  { zh: '爽朗', en: 'Jolly',    increased: 'speed',            decreased: 'special-attack' },
  { zh: '天真', en: 'Naive',    increased: 'speed',            decreased: 'special-defense' },
  { zh: '內斂', en: 'Modest',   increased: 'special-attack',   decreased: 'attack' },
  { zh: '溫和', en: 'Mild',     increased: 'special-attack',   decreased: 'defense' },
  { zh: '沉著', en: 'Quiet',    increased: 'special-attack',   decreased: 'speed' },
  { zh: '害羞', en: 'Bashful',  increased: null,               decreased: null },
  { zh: '馬虎', en: 'Rash',     increased: 'special-attack',   decreased: 'special-defense' },
  { zh: '穩重', en: 'Calm',     increased: 'special-defense',  decreased: 'attack' },
  { zh: '溫厚', en: 'Gentle',   increased: 'special-defense',  decreased: 'defense' },
  { zh: '自大', en: 'Sassy',    increased: 'special-defense',  decreased: 'speed' },
  { zh: '慎重', en: 'Careful',  increased: 'special-defense',  decreased: 'special-attack' },
  { zh: '浮躁', en: 'Quirky',   increased: null,               decreased: null },
];
