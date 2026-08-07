import React, { useState } from 'react';
import { Volume2, VolumeX, Music, Settings2 } from 'lucide-react';
import soundEngine from '../utils/soundEngine';

const SoundControls = () => {
  const [enabled, setEnabled] = useState(soundEngine.isEnabled);
  const [profile, setProfile] = useState(soundEngine.soundProfile);
  const [showOptions, setShowOptions] = useState(false);

  const handleToggle = () => {
    const newState = soundEngine.toggle();
    setEnabled(newState);
    if (newState) {
      soundEngine.playSuccess();
    }
  };

  const handleProfileChange = (p) => {
    setProfile(p);
    soundEngine.setProfile(p);
    if (enabled) {
      soundEngine.playNote(50, 0, 100, 0.15, 'swap');
    }
  };

  return (
    <div className="relative inline-flex items-center gap-2">
      <button
        onClick={handleToggle}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
          enabled
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-sm'
            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
        }`}
        title={enabled ? 'Mute Sonification' : 'Enable Audio Sonification'}
      >
        {enabled ? <Volume2 className="w-4 h-4 text-emerald-500 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
        <span>{enabled ? 'Sound ON' : 'Sound OFF'}</span>
      </button>

      {enabled && (
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          title="Sound Instrument Settings"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      )}

      {enabled && showOptions && (
        <div className="absolute top-full right-0 mt-2 w-48 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-2 flex items-center gap-1">
            <Music className="w-3 h-3" /> Timbre / Instrument
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'marimba', name: 'Marimba' },
              { id: 'synth', name: 'Synth' },
              { id: 'arcade', name: '8-Bit' },
              { id: 'sine', name: 'Pure Sine' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handleProfileChange(p.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  profile === p.id
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
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
};

export default SoundControls;
