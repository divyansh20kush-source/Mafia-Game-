import { useEffect, useRef, useState } from 'react';
import { speechEngine } from '../speechEngine';
import { SelectableList, Stars } from '../components/SharedComponents';

const ROLE_ICONS = {
  Mafia: '🔪',
  Doctor: '🩺',
  Police: '🔵',
  Civilian: '🏘️',
};

/**
 * NightScreen — Night phase.
 * subPhase: 'intro' | 'mafia' | 'doctor' | 'police' | 'done'
 */
export default function NightScreen({ players, round, onNightDone }) {
  const [subPhase, setSubPhase] = useState('intro');
  const [mafiaTarget, setMafiaTarget] = useState(null);
  const [doctorSave, setDoctorSave] = useState(null);

  // Police state
  const [policeTarget, setPoliceTarget] = useState(null);   // id of suspect
  const [intelRevealed, setIntelRevealed] = useState(false); // show intel report?

  const spokenRef = useRef(false);

  const alivePlayers = players.filter((p) => p.alive && !p.exiled);
  const hasDoctor = players.some((p) => p.role === 'Doctor' && p.alive && !p.exiled);
  const hasPolice = players.some((p) => p.role === 'Police' && p.alive && !p.exiled);

  // Resolved intel: the actual role of the police target
  const intelPlayer = policeTarget !== null
    ? players.find((p) => p.id === policeTarget)
    : null;
  const isMafiaTarget = intelPlayer?.role === 'Mafia';

  // ── Night intro ──────────────────────────────────────────────
  useEffect(() => {
    if (spokenRef.current) return;
    spokenRef.current = true;

    speechEngine.speakQueue(
      [
        round === 1
          ? 'Night falls upon the village. Everyone, close your eyes. No peeking.'
          : 'Night falls once more. Close your eyes. The darkness hides all secrets.',
      ],
      () => setTimeout(() => startMafiaPhase(), 1200)
    );
  }, []);

  // ── Mafia ────────────────────────────────────────────────────
  const startMafiaPhase = () => {
    setSubPhase('mafia');
    speechEngine.speak('Mafia, open your eyes. Choose your victim for tonight.');
  };

  const submitMafiaTarget = () => {
    if (mafiaTarget === null) return;
    speechEngine.speak(
      'The Mafia has chosen. Mafia, close your eyes.',
      () => setTimeout(() => {
        if (hasDoctor) startDoctorPhase();
        else if (hasPolice) startPolicePhase();
        else finishNight();
      }, 1000)
    );
  };

  // ── Doctor ───────────────────────────────────────────────────
  const startDoctorPhase = () => {
    setSubPhase('doctor');
    speechEngine.speak('Mafia, sleep. Doctor, open your eyes. Who will you protect tonight?');
  };

  const submitDoctorSave = () => {
    if (doctorSave === null) return;
    speechEngine.speak(
      'Doctor, your choice is made. Close your eyes and rest.',
      () => setTimeout(() => {
        if (hasPolice) startPolicePhase();
        else finishNight();
      }, 1000)
    );
  };

  // ── Police ───────────────────────────────────────────────────
  const startPolicePhase = () => {
    setSubPhase('police');
    setPoliceTarget(null);
    setIntelRevealed(false);
    speechEngine.speak(
      'Mafia, sleep. Police, open your eyes. Choose a suspect to investigate.'
    );
  };

  // When police taps a suspect — immediately reveal intel
  const handlePoliceSelect = (id) => {
    setPoliceTarget(id);
    setIntelRevealed(true);
  };

  const submitPoliceTurn = () => {
    speechEngine.speak(
      'Now you know their truth. Police, close your eyes.',
      () => setTimeout(() => finishNight(), 1000)
    );
    setSubPhase('done');
  };

  // ── Finish ───────────────────────────────────────────────────
  const finishNight = () => {
    setSubPhase('done');
    speechEngine.speak('The night is over. The sun begins to rise.', () => {
      setTimeout(() => onNightDone(mafiaTarget, doctorSave), 800);
    });
  };

  return (
    <section
      className="screen night-mode flex-col gap-lg"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <Stars />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          width: '100%',
        }}
      >
        {/* Round pill */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span
            className="round-pill"
            style={{
              background: 'rgba(255,255,255,0.07)',
              color: 'rgba(232,228,220,0.6)',
              borderColor: 'rgba(255,255,255,0.12)',
            }}
          >
            🌙 Round {round}
          </span>
        </div>

        {/* ── Intro ── */}
        {subPhase === 'intro' && (
          <div className="text-center flex-col gap-md" style={{ alignItems: 'center' }}>
            <div style={{ fontSize: '4rem' }}>🌙</div>
            <h2 className="display-sm" style={{ color: '#E8E4DC' }}>Night Falls</h2>
            <p
              style={{
                color: 'rgba(232,228,220,0.6)',
                fontStyle: 'italic',
                fontFamily: 'var(--font-serif)',
                fontSize: '1.1rem',
              }}
            >
              Close your eyes. The God watches.
            </p>
          </div>
        )}

        {/* ── Mafia Phase ── */}
        {subPhase === 'mafia' && (
          <div className="card-dark flex-col gap-md" style={{ width: '100%', maxWidth: 440 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '1.6rem' }}>🔪</span>
              <div>
                <div className="label" style={{ color: 'var(--crimson)', letterSpacing: '0.12em' }}>
                  Mafia's Turn
                </div>
                <div style={{ color: 'rgba(232,228,220,0.75)', fontSize: '0.9rem', marginTop: '0.15rem' }}>
                  Choose your victim for tonight
                </div>
              </div>
            </div>
            <SelectableList
              players={alivePlayers}
              selected={mafiaTarget}
              onSelect={setMafiaTarget}
              variant="mafia"
            />
            <button
              className="btn btn-crimson btn-full"
              style={{ marginTop: '0.5rem' }}
              disabled={mafiaTarget === null}
              onClick={submitMafiaTarget}
              id="mafia-submit-btn"
            >
              Confirm Target
            </button>
          </div>
        )}

        {/* ── Doctor Phase ── */}
        {subPhase === 'doctor' && (
          <div className="card-dark flex-col gap-md" style={{ width: '100%', maxWidth: 440 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '1.6rem' }}>🩺</span>
              <div>
                <div className="label" style={{ color: '#1E8A7E', letterSpacing: '0.12em' }}>
                  Doctor's Turn
                </div>
                <div style={{ color: 'rgba(232,228,220,0.75)', fontSize: '0.9rem', marginTop: '0.15rem' }}>
                  Who will you protect tonight?
                </div>
              </div>
            </div>
            <SelectableList
              players={alivePlayers}
              selected={doctorSave}
              onSelect={setDoctorSave}
              variant="doctor"
            />
            <button
              className="btn btn-full"
              style={{
                marginTop: '0.5rem',
                background: '#1E6E64',
                color: '#fff',
                boxShadow: '0 4px 20px rgba(30,110,100,0.35)',
              }}
              disabled={doctorSave === null}
              onClick={submitDoctorSave}
              id="doctor-submit-btn"
            >
              Protect This Player
            </button>
          </div>
        )}

        {/* ── Police Phase ── */}
        {subPhase === 'police' && (
          <div className="card-dark flex-col gap-md" style={{ width: '100%', maxWidth: 440 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '1.6rem' }}>🔵</span>
              <div>
                <div className="label" style={{ color: '#4361EE', letterSpacing: '0.12em' }}>
                  Police Investigation
                </div>
                <div style={{ color: 'rgba(232,228,220,0.75)', fontSize: '0.9rem', marginTop: '0.15rem' }}>
                  {intelRevealed ? 'Intel secured. End your turn when ready.' : 'Tap a suspect to reveal their true identity.'}
                </div>
              </div>
            </div>

            {/* Suspect list — stays visible so they can change if not yet confirmed */}
            {!intelRevealed && (
              <SelectableList
                players={alivePlayers.filter(
                  (p) => p.role !== 'Police' // Police can't investigate themselves
                )}
                selected={policeTarget}
                onSelect={handlePoliceSelect}
                variant="police"
              />
            )}

            {/* ── Intel Report ── */}
            {intelRevealed && intelPlayer && (
              <div
                className={`intel-report ${isMafiaTarget ? 'mafia-result' : 'safe-result'}`}
              >
                {/* Classified header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="intel-label" style={{ color: isMafiaTarget ? 'var(--crimson)' : '#4361EE' }}>
                    🔒 Classified Intel
                  </span>
                </div>

                {/* Suspect name */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ color: 'rgba(232,228,220,0.55)', fontSize: '0.82rem', fontWeight: 500 }}>
                    Target:
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.35rem',
                      fontWeight: 600,
                      color: '#E8E4DC',
                    }}
                  >
                    {intelPlayer.name}
                  </span>
                </div>

                {/* Role result — big, dramatic */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginTop: '0.25rem',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: isMafiaTarget
                      ? 'rgba(139,38,53,0.25)'
                      : 'rgba(67,97,238,0.18)',
                    border: isMafiaTarget
                      ? '1px solid rgba(139,38,53,0.45)'
                      : '1px solid rgba(67,97,238,0.35)',
                  }}
                >
                  <span className="intel-icon">{ROLE_ICONS[intelPlayer.role]}</span>
                  <div>
                    <div className="intel-label" style={{ color: 'rgba(232,228,220,0.5)', marginBottom: '0.2rem' }}>
                      True Identity
                    </div>
                    <div
                      className="intel-role"
                      style={{
                        color: isMafiaTarget ? '#FF6B7A' : '#A0B4FF',
                      }}
                    >
                      {intelPlayer.role.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Verdict */}
                <div
                  style={{
                    fontSize: '0.82rem',
                    fontStyle: 'italic',
                    fontFamily: 'var(--font-serif)',
                    color: isMafiaTarget
                      ? 'rgba(255, 107, 122, 0.8)'
                      : 'rgba(160, 180, 255, 0.75)',
                    marginTop: '0.15rem',
                  }}
                >
                  {isMafiaTarget
                    ? '⚠️ Confirmed threat. This person is Mafia.'
                    : '✓ Not a threat. This person is not Mafia.'}
                </div>
              </div>
            )}

            {/* End Turn button — only show after intel revealed */}
            {intelRevealed && (
              <button
                className="btn btn-full"
                style={{
                  marginTop: '0.25rem',
                  background: 'linear-gradient(135deg, #1A2A8E 0%, #4361EE 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(67,97,238,0.35)',
                }}
                onClick={submitPoliceTurn}
                id="police-submit-btn"
              >
                End Turn — Close Your Eyes
              </button>
            )}
          </div>
        )}

        {/* ── Done / Dawn ── */}
        {subPhase === 'done' && (
          <div className="text-center flex-col gap-md" style={{ alignItems: 'center' }}>
            <div style={{ fontSize: '4rem' }}>🌅</div>
            <h2 className="display-sm" style={{ color: '#E8E4DC' }}>
              Dawn Approaches…
            </h2>
          </div>
        )}
      </div>
    </section>
  );
}
