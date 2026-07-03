import { useEffect, useRef, useState } from 'react';
import { speechEngine } from '../speechEngine';
import RoleCard from '../components/RoleCard';

/**
 * RoleRevealScreen — Pass-the-phone loop.
 * For each player: show "Hand device to X" → tap → flip card → pass.
 */
export default function RoleRevealScreen({ players, onDone }) {
  const [step, setStep] = useState('pass'); // 'pass' | 'reveal'
  const [index, setIndex] = useState(0);
  const [hasSaidWelcome, setHasSaidWelcome] = useState(false);
  const spokenRef = useRef(false);

  const currentPlayer = players[index];

  useEffect(() => {
    if (spokenRef.current) return;
    spokenRef.current = true;
    speechEngine.speak(
      "Welcome. I am your God tonight. Let us assign your fates.",
      () => {
        setHasSaidWelcome(true);
        speakPassPrompt(players[0].name);
      }
    );
  }, []);

  const speakPassPrompt = (name) => {
    speechEngine.speak(`Hand the device to ${name}.`);
  };

  const handleReveal = () => {
    setStep('reveal');
    speechEngine.speak(
      "Look at your card. Memorize it. Keep it secret. Then pass the device."
    );
  };

  const handleReady = () => {
    const nextIndex = index + 1;
    if (nextIndex >= players.length) {
      // All players revealed — begin night
      speechEngine.speak("All fates have been assigned. The game begins.", () => {
        onDone();
      });
    } else {
      setStep('pass');
      setIndex(nextIndex);
      speakPassPrompt(players[nextIndex].name);
    }
  };

  return (
    <section className="screen flex-col gap-lg text-center" style={{ paddingTop: '4rem' }}>
      {/* Progress */}
      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap', maxWidth: 400 }}>
        {players.map((p, i) => (
          <div
            key={p.id}
            style={{
              width: 28,
              height: 4,
              borderRadius: 2,
              background:
                i < index
                  ? 'var(--charcoal)'
                  : i === index
                  ? 'var(--crimson)'
                  : 'var(--border)',
              transition: 'background 0.3s ease',
            }}
          />
        ))}
      </div>

      {step === 'pass' && (
        <div className="flex-col gap-md text-center" style={{ alignItems: 'center' }}>
          <span className="label muted">
            Player {index + 1} of {players.length}
          </span>
          <h2 className="display" style={{ maxWidth: 500 }}>
            Hand the device to
            <br />
            <em style={{ color: 'var(--crimson)' }}>{currentPlayer.name}</em>
          </h2>
          <div className="divider" />
          <p className="subheading muted">Everyone else, look away.</p>
          <button
            className="btn btn-primary btn-lg"
            style={{ marginTop: '2rem', maxWidth: 300, width: '100%' }}
            onClick={handleReveal}
            id={`reveal-btn-${index}`}
          >
            I am {currentPlayer.name} — Show My Role
          </button>
        </div>
      )}

      {step === 'reveal' && (
        <div className="flex-col gap-md" style={{ alignItems: 'center', width: '100%' }}>
          <span className="label muted">
            {currentPlayer.name}'s Fate
          </span>
          <RoleCard player={currentPlayer} onReady={handleReady} />
        </div>
      )}
    </section>
  );
}
