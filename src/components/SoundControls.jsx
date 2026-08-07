import React, { useState } from 'react';
import { Volume2, VolumeX, Settings2, Sliders } from 'lucide-react';
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
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all shadow-sm ${
          enabled
            ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
        title={enabled ? 'Mute Audio Sonification' : 'Enable Audio Sonification'}
      >
        {enabled ? <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        <span>{enabled ? 'Audio ON' : 'Audio OFF'}</span>
      </button>

      {enabled && (
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
          title="Sound Instrument Settings"
        >
          <Sliders className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        </button>
      )}

      {enabled && showOptions && (
        <div className="absolute top-full right-0 mt-2 w-48 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-2">
            Instrument Timbre
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
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  profile === p.id
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
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
