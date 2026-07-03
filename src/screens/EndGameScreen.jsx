import { useEffect, useRef } from 'react';
import { speechEngine } from '../speechEngine';

export default function EndGameScreen({ winner, players, onPlayAgain }) {
  const spokenRef = useRef(false);

  const isMafiaWin = winner === 'mafia';

  useEffect(() => {
    if (spokenRef.current) return;
    spokenRef.current = true;

    const verdict = isMafiaWin
      ? "The game is over. The Mafia have conquered the village. Fear the shadows."
      : "The game is over. The Civilians have triumphed. Peace returns to the village.";

    speechEngine.speak(verdict);
  }, []);

  const aliveMafia = players.filter((p) => p.role === 'Mafia');
  const aliveDoc = players.filter((p) => p.role === 'Doctor');

  return (
    <section
      className="screen flex-col gap-lg text-center"
      style={{
        background: isMafiaWin
          ? 'linear-gradient(160deg, #1A0608 0%, #3D0A12 50%, #1A1A1A 100%)'
          : 'linear-gradient(160deg, #F5F2EB 0%, #EDE9DF 100%)',
        color: isMafiaWin ? '#F5F0E8' : 'var(--charcoal)',
        minHeight: '100dvh',
      }}
    >
      {/* Winner Display */}
      <div className="winner-display">
        <div className="winner-icon">{isMafiaWin ? '🔪' : '🏘️'}</div>

        <div>
          <span
            className="label"
            style={{ color: isMafiaWin ? 'rgba(245,240,232,0.55)' : 'var(--muted)' }}
          >
            {isMafiaWin ? 'The Mafia Wins' : 'Civilians Win'}
          </span>
          <h1
            className="display"
            style={{
              marginTop: '0.4rem',
              color: isMafiaWin ? '#fff' : 'var(--charcoal)',
            }}
          >
            {isMafiaWin ? (
              <>The Shadows<br /><em style={{ color: '#C04060' }}>Prevail</em></>
            ) : (
              <>Peace<br /><em style={{ color: 'var(--crimson)' }}>Returns</em></>
            )}
          </h1>
        </div>

        <div
          style={{
            width: 48,
            height: 2,
            background: isMafiaWin ? '#8B2635' : 'var(--crimson)',
            borderRadius: 2,
            margin: '0 auto',
          }}
        />
      </div>

      {/* Role Reveal — all players */}
      <div
        style={{
          background: isMafiaWin ? 'rgba(255,255,255,0.05)' : 'rgba(26,26,26,0.05)',
          border: `1px solid ${isMafiaWin ? 'rgba(255,255,255,0.1)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          maxWidth: 480,
          width: '100%',
        }}
      >
        <div
          className="label"
          style={{
            color: isMafiaWin ? 'rgba(245,240,232,0.55)' : 'var(--muted)',
            marginBottom: '1rem',
            textAlign: 'left',
          }}
        >
          The Truth Revealed
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {players.map((p) => (
            <div
              key={p.id}
              className="stat-row"
              style={{
                borderBottomColor: isMafiaWin ? 'rgba(255,255,255,0.08)' : 'var(--border)',
                opacity: p.alive && !p.exiled ? 1 : 0.5,
              }}
            >
              <div style={{ display: 'flex', align: 'center', gap: '0.5rem', alignItems: 'center' }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: isMafiaWin ? 'rgba(255,255,255,0.1)' : 'var(--cream)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: isMafiaWin ? '#E8E4DC' : 'var(--charcoal)',
                    flexShrink: 0,
                  }}
                >
                  {p.name[0].toUpperCase()}
                </div>
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    color: isMafiaWin ? '#E8E4DC' : 'var(--charcoal)',
                    textDecoration: !p.alive || p.exiled ? 'line-through' : 'none',
                  }}
                >
                  {p.name}
                </span>
                {(!p.alive || p.exiled) && (
                  <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>
                    {p.exiled ? '⚖️' : '☠️'}
                  </span>
                )}
              </div>
              <span className={`role-badge ${p.role}`}>
                {p.role === 'Mafia' ? '🔪' : p.role === 'Doctor' ? '🩺' : '🏘️'} {p.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          className={`btn btn-lg ${isMafiaWin ? 'btn-ghost-dark' : 'btn-ghost'}`}
          onClick={() => onPlayAgain(true)}
          id="play-again-keep-names-btn"
        >
          🔄 &nbsp; Play Again (Same Players)
        </button>
        <button
          className={`btn btn-lg ${isMafiaWin ? 'btn-ghost-dark' : 'btn-primary'}`}
          onClick={() => onPlayAgain(false)}
          id="new-game-btn"
        >
          ✦ &nbsp; New Game
        </button>
      </div>
    </section>
  );
}
