/**
 * gameLogic.js — Pure game state utilities (no React, no side effects).
 */

/**
 * Fisher-Yates shuffle (in-place).
 */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Calculate Mafia count based on player count.
 * 4–6   → 1 Mafia
 * 7–10  → 2 Mafia
 * 11–16 → 3 Mafia
 */
export function getMafiaCount(total) {
  if (total <= 6) return 1;
  if (total <= 10) return 2;
  return 3;
}

/**
 * Special role counts (always fixed regardless of player count).
 */
export const SPECIAL_COUNTS = { doctor: 1, police: 1 };

/**
 * Assign roles to players.
 * Returns array of { name, role: 'Mafia'|'Doctor'|'Police'|'Civilian', alive: true }
 */
export function assignRoles(names) {
  const total = names.length;
  const mafiaCount = getMafiaCount(total);
  const { doctor: doctorCount, police: policeCount } = SPECIAL_COUNTS;
  const civilianCount = total - mafiaCount - doctorCount - policeCount;

  const roles = [
    ...Array(mafiaCount).fill('Mafia'),
    ...Array(doctorCount).fill('Doctor'),
    ...Array(policeCount).fill('Police'),
    ...Array(Math.max(0, civilianCount)).fill('Civilian'),
  ];

  const shuffledRoles = shuffle(roles);

  return names.map((name, i) => ({
    id: i,
    name,
    role: shuffledRoles[i],
    alive: true,
    exiled: false,
  }));
}

/**
 * Check win conditions.
 * Returns 'mafia' | 'civilians' | null
 */
export function checkWin(players) {
  const alive = players.filter((p) => p.alive && !p.exiled);
  const aliveMafia = alive.filter((p) => p.role === 'Mafia');
  const aliveCivilians = alive.filter((p) => p.role !== 'Mafia');

  if (aliveMafia.length === 0) return 'civilians';
  if (aliveMafia.length >= aliveCivilians.length) return 'mafia';
  return null;
}

/**
 * Resolve night actions.
 * Returns { killed: player|null, saved: boolean }
 */
export function resolveNight(players, mafiaTargetId, doctorSaveId) {
  const target = players.find((p) => p.id === mafiaTargetId);
  const saved = target && target.id === doctorSaveId;

  return {
    killed: saved ? null : target,
    saved,
    target,
  };
}

/**
 * Apply votes — the player with the most votes is exiled.
 * Returns exiled player or null (tie = no exile).
 */
export function resolveVotes(votes) {
  const tally = {};
  for (const votedId of Object.values(votes)) {
    tally[votedId] = (tally[votedId] || 0) + 1;
  }
  if (Object.keys(tally).length === 0) return null;

  const max = Math.max(...Object.values(tally));
  const topIds = Object.keys(tally).filter((id) => tally[id] === max);

  // Tie = no exile
  if (topIds.length > 1) return null;
  return parseInt(topIds[0]);
}
