import { useEffect, useState } from 'react';

const ROLE_META = {
  Mafia: {
    icon: '🔪',
    desc: 'Kill silently at night. Stay hidden during the day.',
    gradient: 'Mafia',
  },
  Doctor: {
    icon: '🩺',
    desc: 'Save one life each night. Even your own.',
    gradient: 'Doctor',
  },
  Police: {
    icon: '🔵',
    desc: 'Investigate one suspect each night. Expose the truth.',
    gradient: 'Police',
  },
  Civilian: {
    icon: '🏘️',
    desc: 'Find the Mafia before they find you.',
    gradient: 'Civilian',
  },
};

export default function RoleCard({ player, onReady }) {
  const [flipped, setFlipped] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const meta = ROLE_META[player.role] || ROLE_META.Civilian;

  // Auto-flip on tap
  const handleFlip = () => {
    if (!flipped) {
      setFlipped(true);
      setRevealed(true);
    }
  };

  return (
    <div className="flex-col gap-md text-center" style={{ alignItems: 'center', width: '100%' }}>
      <div
        className={`flip-card ${flipped ? 'flipped' : ''}`}
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleFlip()}
        aria-label="Tap to reveal your role"
      >
        <div className="flip-card-inner">
          {/* FRONT */}
          <div className="flip-card-front">
            <div style={{ fontSize: '3rem' }}>🂠</div>
            <div className="heading" style={{ color: 'rgba(245,242,235,0.85)' }}>
              Your Card
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.55, marginTop: '0.5rem' }}>
              Tap to reveal
            </div>
            <div
              style={{
                marginTop: '1.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.08)',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Keep it secret
            </div>
          </div>

          {/* BACK */}
          <div className={`flip-card-back ${meta.gradient}`}>
            <div className="role-icon">{meta.icon}</div>
            <div className="role-name">{player.role}</div>
            <div className="role-desc">{meta.desc}</div>
          </div>
        </div>
      </div>

      {revealed && (
        <button
          className="btn btn-primary btn-lg"
          style={{ marginTop: '1.5rem', maxWidth: 300 }}
          onClick={onReady}
        >
          Got It — Pass the Phone
        </button>
      )}

      {!revealed && (
        <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Only <strong>{player.name}</strong> should see this screen.
        </p>
      )}
    </div>
  );
}
