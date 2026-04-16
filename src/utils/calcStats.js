// Pokemon Champions stat system
// BP (Base Points): 66 total distributable, max 32 per stat
// Formula is approximate — each BP ≈ 2 EV points in traditional formula
const LEVEL = 50;
const IV = 31;

export function calcStat(base, bp, natureMod, isHP) {
  if (isHP) {
    return Math.floor((2 * base + IV + bp * 2) * LEVEL / 100) + LEVEL + 10;
  }
  return Math.floor(
    Math.floor((2 * base + IV + bp * 2) * LEVEL / 100 + 5) * natureMod
  );
}

export function calcSpeed(base, bp, natureMod) {
  return calcStat(base, bp, natureMod, false);
}

export const BP_MAX_PER_STAT = 32;
export const BP_TOTAL = 66;
