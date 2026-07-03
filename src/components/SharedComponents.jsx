import { useState } from 'react';

/**
 * Stars background for night mode.
 */
function Stars() {
  const stars = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 3,
  }));

  return (
    <div className="stars">
      {stars.map((s) => (
        <div
          key={s.id}
          className="star"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * SelectableList — renders a list of alive players for selection.
 */
export function SelectableList({ players, selected, onSelect, variant = 'mafia' }) {
  const getSelectedClass = (id) => {
    if (selected !== id) return '';
    if (variant === 'doctor')  return 'doctor-selected';
    if (variant === 'police')  return 'police-selected';
    return 'selected'; // mafia
  };

  return (
    <div className="scroll-list" style={{ width: '100%', maxWidth: 400 }}>
      {players
        .filter((p) => p.alive && !p.exiled)
        .map((p) => (
          <button
            key={p.id}
            className={`target-btn ${getSelectedClass(p.id)}`}
            onClick={() => onSelect(p.id)}
          >
            <div className="t-avatar">{p.name[0].toUpperCase()}</div>
            <span className="t-name">{p.name}</span>
          </button>
        ))}
    </div>
  );
}

export { Stars };
