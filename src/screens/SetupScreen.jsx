import { useState, useEffect } from 'react';

export default function SetupScreen({ onStart }) {
  const [count, setCount] = useState(6);
  const [names, setNames] = useState(Array(6).fill(''));

  // Adjust names array when count changes
  useEffect(() => {
    setNames((prev) => {
      const next = [...prev];
      if (next.length < count) {
        while (next.length < count) next.push('');
      } else {
        next.length = count;
      }
      return next;
    });
  }, [count]);

  const handleName = (i, val) => {
    setNames((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
  };

  const canStart = names.every((n) => n.trim().length > 0);

  return (
    <section className="screen text-center flex-col gap-lg" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div className="flex-col gap-sm text-center" style={{ alignItems: 'center' }}>
        <span className="label muted">The God Awaits</span>
        <h1 className="display" style={{ maxWidth: 520 }}>
          Who plays<br />
          <em style={{ color: 'var(--crimson)' }}>tonight?</em>
        </h1>
        <div className="divider" />
        <p className="subheading muted">Choose your fate wisely.</p>
      </div>

      {/* Slider */}
      <div className="card flex-col gap-md" style={{ maxWidth: 440, width: '100%' }}>
        <div className="flex-col gap-sm">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span className="label">Mortals Playing Tonight</span>
            <span
              className="display-sm"
              style={{ color: 'var(--crimson)', lineHeight: 1 }}
            >
              {count}
            </span>
          </div>
          <input
            id="player-count-slider"
            type="range"
            min={4}
            max={16}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="player-slider"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="label muted">4</span>
            <span className="label muted">16</span>
          </div>
        </div>

        {/* Role count hint */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: '0.25rem',
          }}
        >
          <span className="role-badge Mafia">
            🔪 {count <= 6 ? 1 : count <= 10 ? 2 : 3} Mafia
          </span>
          <span className="role-badge Doctor">🩺 1 Doctor</span>
          <span className="role-badge Police">🔵 1 Police</span>
          <span className="role-badge Civilian">
            🏘️ {count - (count <= 6 ? 1 : count <= 10 ? 2 : 3) - 2} Civilians
          </span>
        </div>
      </div>

      {/* Name Inputs */}
      <div className="card flex-col gap-md" style={{ maxWidth: 440, width: '100%' }}>
        <h2 className="heading" style={{ textAlign: 'left' }}>Enter Names</h2>
        <div className="name-list">
          {names.map((name, i) => (
            <div key={i} className="name-row">
              <span className="name-number">{i + 1}.</span>
              <input
                id={`player-name-${i}`}
                type="text"
                className="input-field"
                placeholder={`Player ${i + 1}`}
                value={name}
                onChange={(e) => handleName(i, e.target.value)}
                maxLength={20}
                autoComplete="off"
                autoCorrect="off"
              />
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        className="btn btn-primary btn-lg"
        style={{ maxWidth: 320, width: '100%' }}
        disabled={!canStart}
        onClick={() => onStart(names.map((n) => n.trim()))}
        id="summon-god-btn"
      >
        ☽ &nbsp; Summon the God
      </button>

      {!canStart && (
        <p className="muted" style={{ fontSize: '0.8rem', marginTop: '-0.5rem' }}>
          All players must enter a name to begin.
        </p>
      )}
    </section>
  );
}
