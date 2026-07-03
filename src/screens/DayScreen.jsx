import { useEffect, useRef, useState } from 'react';
import { speechEngine } from '../speechEngine';
import { resolveVotes } from '../gameLogic';

/**
 * DayScreen — Morning announcement + Tribunal voting.
 * subPhase: 'announce' | 'vote' | 'exile'
 */
export default function DayScreen({
  players,
  nightResult,  // { killed: player|null, saved: boolean, target: player }
  round,
  onDayDone,   // (exiledId: number|null) => void
}) {
  const [subPhase, setSubPhase] = useState('announce');
  const [votes, setVotes] = useState({});
  const [exiledId, setExiledId] = useState(null);
  const spokenRef = useRef(false);

  const alivePlayers = players.filter((p) => p.alive && !p.exiled);
  const voterCount = alivePlayers.length;

  // Tally votes for display
  const tally = {};
  Object.values(votes).forEach((id) => {
    tally[id] = (tally[id] || 0) + 1;
  });

  useEffect(() => {
    if (spokenRef.current) return;
    spokenRef.current = true;

    const morningText = "The sun rises. Wake up, village. Open your eyes.";

    if (nightResult.killed) {
      speechEngine.speakQueue(
        [
          morningText,
          `Regrettably... ${nightResult.killed.name} was targeted by the Mafia and has perished. The village mourns.`,
        ],
        () => setTimeout(() => setSubPhase('vote'), 2000)
      );
    } else {
      speechEngine.speakQueue(
        [
          morningText,
          nightResult.target
            ? "A miracle has occurred. The Doctor saved the target. No one died tonight."
            : "The night passed in silence. No one was harmed.",
        ],
        () => setTimeout(() => setSubPhase('vote'), 2000)
      );
    }
  }, []);

  useEffect(() => {
    if (subPhase === 'vote') {
      speechEngine.speak(
        "Now the village must deliberate. Debate among yourselves, then cast your votes. Who do you suspect?"
      );
    }
  }, [subPhase]);

  const handleVote = (voterId, targetId) => {
    setVotes((prev) => ({ ...prev, [voterId]: targetId }));
  };

  const submitVotes = () => {
    const resolved = resolveVotes(votes);
    setExiledId(resolved);

    if (resolved !== null) {
      const exiledPlayer = players.find((p) => p.id === resolved);
      speechEngine.speak(
        `The village has spoken. ${exiledPlayer.name} has been cast out. Their true identity was... ${exiledPlayer.role}.`,
        () => setTimeout(() => onDayDone(resolved), 1800)
      );
    } else {
      speechEngine.speak(
        "The vote is tied. No one is exiled today. The village remains divided.",
        () => setTimeout(() => onDayDone(null), 1800)
      );
    }
    setSubPhase('exile');
  };

  const allVoted = Object.keys(votes).length === voterCount;

  return (
    <section className="screen flex-col gap-lg" style={{ paddingTop: '3rem' }}>
      {/* Header */}
      <div className="flex-col gap-sm text-center" style={{ alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span className="round-pill">☀️ Round {round} — Day</span>
        </div>
        <h2 className="display-sm" style={{ marginTop: '0.5rem' }}>
          {subPhase === 'announce' ? 'The Village Wakes' : subPhase === 'exile' ? 'Judgment Rendered' : 'The Tribunal'}
        </h2>
        <div className="divider" />
      </div>

      {/* Announce */}
      {subPhase === 'announce' && (
        <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          {nightResult.killed ? (
            <div className="announcement death">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>☠️</div>
              <div className="heading">{nightResult.killed.name}</div>
              <div style={{ marginTop: '0.5rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--crimson)' }}>
                has perished in the night
              </div>
            </div>
          ) : (
            <div className="announcement safe">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✨</div>
              <div className="heading">
                {nightResult.target ? "The Doctor Saved Someone!" : "A Peaceful Night"}
              </div>
              <div style={{ marginTop: '0.5rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: '#1E6E64' }}>
                No one died tonight
              </div>
            </div>
          )}
        </div>
      )}

      {/* Voting Phase */}
      {subPhase === 'vote' && (
        <div className="card flex-col gap-md" style={{ maxWidth: 520, width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="heading">Cast Your Votes</h3>
            <span className="label muted">
              {Object.keys(votes).length}/{voterCount} voted
            </span>
          </div>

          {/* Player voting list — each alive player votes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {alivePlayers.map((voter) => (
              <div key={voter.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span className="label muted">{voter.name} votes against:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {alivePlayers
                    .filter((p) => p.id !== voter.id)
                    .map((target) => (
                      <button
                        key={target.id}
                        className={`player-chip ${votes[voter.id] === target.id ? 'mafia-selected' : ''}`}
                        onClick={() => handleVote(voter.id, target.id)}
                        id={`vote-${voter.id}-for-${target.id}`}
                      >
                        {target.name}
                        {tally[target.id] ? (
                          <span
                            style={{
                              background: 'rgba(139,38,53,0.15)',
                              color: 'var(--crimson)',
                              borderRadius: '999px',
                              padding: '0 0.4rem',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                            }}
                          >
                            {tally[target.id]}
                          </span>
                        ) : null}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <button
            className="btn btn-crimson btn-full btn-lg"
            style={{ marginTop: '0.5rem' }}
            disabled={!allVoted}
            onClick={submitVotes}
            id="submit-votes-btn"
          >
            {allVoted ? 'Deliver the Verdict' : `Waiting for ${voterCount - Object.keys(votes).length} more vote(s)`}
          </button>
        </div>
      )}

      {/* Exile Announcement */}
      {subPhase === 'exile' && (
        <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          {exiledId !== null ? (() => {
            const exiled = players.find((p) => p.id === exiledId);
            return (
              <div className="announcement exile flex-col gap-sm" style={{ alignItems: 'center', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem' }}>⚖️</div>
                <div className="heading">{exiled.name}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--muted)' }}>
                  has been cast out of the village
                </div>
                <div className="divider" />
                <div className="label muted">Their true identity was</div>
                <span className={`role-badge ${exiled.role}`} style={{ fontSize: '0.85rem', padding: '0.4rem 1.1rem' }}>
                  {exiled.role === 'Mafia' ? '🔪' : exiled.role === 'Doctor' ? '🩺' : '🏘️'} {exiled.role}
                </span>
              </div>
            );
          })() : (
            <div className="announcement exile text-center">
              <div style={{ fontSize: '2.5rem' }}>🤝</div>
              <div className="heading" style={{ marginTop: '0.5rem' }}>Tied Vote</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--muted)', marginTop: '0.5rem' }}>
                No one is exiled today
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
