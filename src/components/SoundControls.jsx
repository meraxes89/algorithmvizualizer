import React, { useState, useCallback } from 'react';
import { Volume2, VolumeX, Sliders } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

const SOUND_PROFILES = [
  { id: 'marimba', name: 'Marimba' },
  { id: 'synth', name: 'Synth' },
  { id: 'arcade', name: '8-Bit' },
  { id: 'sine', name: 'Pure Sine' },
];

const SoundControls = React.memo(({ className = '' }) => {
  const [enabled, setEnabled] = useState(soundEngine.isEnabled);
  const [profile, setProfile] = useState(soundEngine.soundProfile);
  const [showOptions, setShowOptions] = useState(false);

  const handleToggle = useCallback(() => {
    const newState = soundEngine.toggle();
    setEnabled(newState);
    if (newState) {
      soundEngine.playSuccess();
    }
  }, []);

  const handleProfileChange = useCallback((p) => {
    setProfile(p);
    soundEngine.setProfile(p);
    if (soundEngine.isEnabled) {
      soundEngine.playNote(50, 0, 100, 0.15, 'swap');
    }
  }, []);

  return (
    <div className={`relative inline-flex items-center gap-2 ${className}`}>
      <button
        onClick={handleToggle}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all shadow-sm ${
          enabled
            ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
            : 'bg-paper-1 border-line-subtle text-ink hover:bg-paper-0/60 dark:hover:bg-paper-2/60'
        }`}
        title={enabled ? 'Mute Audio Sonification' : 'Enable Audio Sonification'}
      >
        {enabled ? <Volume2 className="w-4 h-4 text-emerald-800 dark:text-emerald-400" /> : <VolumeX className="w-4 h-4 text-ink-3" />}
        <span>{enabled ? 'Audio ON' : 'Audio OFF'}</span>
      </button>

      {enabled && (
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="p-2 rounded-lg bg-paper-1 border border-line-subtle text-ink hover:bg-paper-0/60 dark:hover:bg-paper-2/60 transition-colors shadow-sm"
          title="Sound Instrument Settings"
        >
          <Sliders className="w-4 h-4 text-ink-3" />
        </button>
      )}

      {enabled && showOptions && (
        <div className="absolute top-full right-0 mt-2 w-48 p-3 rounded-xl bg-paper-1 border border-line-subtle shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-[10px] font-bold tracking-wider uppercase text-ink-3 mb-2">
            Instrument Timbre
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {SOUND_PROFILES.map((p) => (
              <button
                key={p.id}
                onClick={() => handleProfileChange(p.id)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  profile === p.id
                    ? 'bg-accent text-accent-fg font-semibold shadow-sm'
                    : 'bg-paper-2/70 text-ink-2 hover:bg-line-subtle dark:hover:bg-paper-2/70'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default SoundControls;
