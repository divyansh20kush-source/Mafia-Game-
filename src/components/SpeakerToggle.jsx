import { useState } from 'react';
import { speechEngine } from '../speechEngine';

export default function SpeakerToggle({ isNight }) {
  const [enabled, setEnabled] = useState(true);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    speechEngine.setEnabled(next);
    if (next) speechEngine.speak('Voice enabled.');
  };

  return (
    <button
      className={`speaker-toggle ${isNight ? 'dark' : ''}`}
      onClick={toggle}
      title={enabled ? 'Mute God' : 'Unmute God'}
    >
      <span>{enabled ? '🔊' : '🔇'}</span>
      <span>{enabled ? 'Voice On' : 'Voice Off'}</span>
    </button>
  );
}
