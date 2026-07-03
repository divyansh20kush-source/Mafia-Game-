import { useState, useCallback } from 'react';
import './index.css';

import { assignRoles, resolveNight, checkWin } from './gameLogic';
import { speechEngine } from './speechEngine';

import SpeakerToggle from './components/SpeakerToggle';
import SetupScreen from './screens/SetupScreen';
import RoleRevealScreen from './screens/RoleRevealScreen';
import NightScreen from './screens/NightScreen';
import DayScreen from './screens/DayScreen';
import EndGameScreen from './screens/EndGameScreen';

/**
 * Game phases:
 * 'setup' → 'reveal' → 'night' → 'day' → ('night' | 'ended')
 */

export default function App() {
  const [phase, setPhase] = useState('setup');
  const [players, setPlayers] = useState([]);
  const [round, setRound] = useState(1);
  const [nightResult, setNightResult] = useState(null);
  const [winner, setWinner] = useState(null);

  // ── Setup → Reveal ──────────────────────────────────────────
  const handleStart = useCallback((names) => {
    // Unlock audio context via user gesture (the button click that calls this)
    speechEngine.cancel();
    const assigned = assignRoles(names);
    setPlayers(assigned);
    setRound(1);
    setWinner(null);
    setNightResult(null);
    setPhase('reveal');
  }, []);

  // ── Reveal → Night ──────────────────────────────────────────
  const handleRevealDone = useCallback(() => {
    setPhase('night');
  }, []);

  // ── Night → Day ─────────────────────────────────────────────
  const handleNightDone = useCallback(
    (mafiaTargetId, doctorSaveId) => {
      const result = resolveNight(players, mafiaTargetId, doctorSaveId);
      setNightResult(result);

      // Apply kill
      let updatedPlayers = players.map((p) =>
        p.id === result.killed?.id ? { ...p, alive: false } : p
      );

      // Check win after kill
      const winAfterKill = checkWin(updatedPlayers);
      if (winAfterKill) {
        setPlayers(updatedPlayers);
        setWinner(winAfterKill);
        setPhase('ended');
        return;
      }

      setPlayers(updatedPlayers);
      setPhase('day');
    },
    [players]
  );

  // ── Day → Night (or End) ────────────────────────────────────
  const handleDayDone = useCallback(
    (exiledId) => {
      let updatedPlayers = players.map((p) =>
        p.id === exiledId ? { ...p, exiled: true } : p
      );

      const winAfterExile = checkWin(updatedPlayers);
      if (winAfterExile) {
        setPlayers(updatedPlayers);
        setWinner(winAfterExile);
        setPhase('ended');
        return;
      }

      setPlayers(updatedPlayers);
      setRound((r) => r + 1);
      setPhase('night');
    },
    [players]
  );

  // ── Play Again ───────────────────────────────────────────────
  const handlePlayAgain = useCallback(
    (keepNames) => {
      speechEngine.cancel();
      if (keepNames) {
        // Re-assign roles for same players
        const names = players.map((p) => p.name);
        const reassigned = assignRoles(names);
        setPlayers(reassigned);
        setRound(1);
        setWinner(null);
        setNightResult(null);
        setPhase('reveal');
      } else {
        // Full reset
        setPlayers([]);
        setRound(1);
        setWinner(null);
        setNightResult(null);
        setPhase('setup');
      }
    },
    [players]
  );

  const isNight = phase === 'night';

  return (
    <>
      <SpeakerToggle isNight={isNight} />

      {phase === 'setup' && <SetupScreen onStart={handleStart} />}

      {phase === 'reveal' && (
        <RoleRevealScreen
          key={`reveal-${round}`}
          players={players}
          onDone={handleRevealDone}
        />
      )}

      {phase === 'night' && (
        <NightScreen
          key={`night-${round}`}
          players={players}
          round={round}
          onNightDone={handleNightDone}
        />
      )}

      {phase === 'day' && nightResult && (
        <DayScreen
          key={`day-${round}`}
          players={players}
          nightResult={nightResult}
          round={round}
          onDayDone={handleDayDone}
        />
      )}

      {phase === 'ended' && winner && (
        <EndGameScreen
          winner={winner}
          players={players}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </>
  );
}
