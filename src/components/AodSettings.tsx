import React, { useState } from 'react';
import { Settings2, Play, X } from 'lucide-react';
import { AodConfig } from '../App';

interface SettingsProps {
  config: AodConfig;
  onUpdate: (config: AodConfig) => void;
  onTestAod: () => void;
}

export function Settings({ config, onUpdate, onTestAod }: SettingsProps) {
  const [showAppSettings, setShowAppSettings] = useState(false);

  const update = (key: keyof AodConfig, value: any) => {
    onUpdate({ ...config, [key]: value });
  };

  return (
    <div 
      className="h-full flex flex-col w-full mx-auto bg-[#0A0A0A] sm:border-x sm:border-[#222] font-sans text-[#E0E0E0] relative overflow-hidden"
      style={{ '--theme-color': config.appThemeColor } as React.CSSProperties}
    >
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col pt-0">
        <header className="p-8 border-b border-[#222] flex flex-col relative">
            <button 
              onClick={() => setShowAppSettings(true)}
              className="absolute top-8 right-8 text-[#666] hover:text-[var(--theme-color)] transition-colors p-2 -m-2"
            >
              <Settings2 className="w-5 h-5" />
            </button>
            <h1 className="text-xs tracking-[0.3em] uppercase text-[#666] font-semibold mb-2">
              Project Lumina
            </h1>
            <p className="text-xl font-serif italic text-white">AOD Configurator</p>
            <div className="mt-4 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-[var(--theme-color)] shadow-[0_0_8px_var(--theme-color)]"></span>
               <span className="text-[10px] uppercase tracking-wider text-[#999]">Device: Galaxy A17 5G</span>
            </div>
        </header>

      <div className="space-y-8 flex-1 px-8 py-4">
        {/* Behavior Section */}
        <section>
           <label className="text-[10px] uppercase tracking-widest text-[#444] block mb-4">Trigger Mechanism</label>
           <div className="space-y-4">
              {(['Single Tap', 'Always', 'Timeout', 'Scheduled'] as const).map((mode) => (
                <div 
                  key={mode}
                  onClick={() => update('mode', mode)}
                  className="flex justify-between items-center cursor-pointer group"
                >
                  <span className={"text-sm transition-colors " + (config.mode === mode ? "text-[#E0E0E0]" : "text-[#888] group-hover:text-[#AAA]")}>
                    {mode === 'Always' ? 'Always On' : mode === 'Timeout' ? `Timeout (${config.timeoutDuration} Min)` : mode === 'Scheduled' ? 'Scheduled Window' : 'Single Tap to Wake'}
                  </span>
                  <div className={"w-8 h-4 rounded-full flex items-center px-1 transition-colors " + (config.mode === mode ? 'bg-[var(--theme-color)] justify-end' : 'bg-[#222]')}>
                    <div className={"w-2 h-2 rounded-full " + (config.mode === mode ? 'bg-white' : 'bg-[#444]')}></div>
                  </div>
                </div>
              ))}
           </div>
        </section>

        {/* Timeout Duration Picker (Only visible if Timeout selected) */}
        {config.mode === 'Timeout' && (
          <section>
             <label className="text-[10px] uppercase tracking-widest text-[#444] block mb-4">Timeout Duration</label>
             <input 
               type="range" 
               min="1" max="10" 
               value={config.timeoutDuration}
               onChange={(e) => update('timeoutDuration', parseInt(e.target.value))}
               className="w-full accent-[var(--theme-color)]"
             />
          </section>
        )}

        {/* Schedule Time Pickers (Only visible if Scheduled selected) */}
        {config.mode === 'Scheduled' && (
          <section>
             <label className="text-[10px] uppercase tracking-widest text-[#444] block mb-4">Schedule Window</label>
             <div className="flex gap-4">
               <div className="flex-1 space-y-2">
                 <label className="text-[10px] uppercase tracking-widest text-[#444] block">Start Time</label>
                 <input 
                   type="time" 
                   value={config.startTime}
                   onChange={(e) => update('startTime', e.target.value)}
                   className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-sm text-[#E0E0E0] outline-none focus:border-[var(--theme-color)] transition-colors"
                 />
               </div>
               <div className="flex-1 space-y-2">
                 <label className="text-[10px] uppercase tracking-widest text-[#444] block">End Time</label>
                 <input 
                   type="time" 
                   value={config.endTime}
                   onChange={(e) => update('endTime', e.target.value)}
                   className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-sm text-[#E0E0E0] outline-none focus:border-[var(--theme-color)] transition-colors"
                 />
               </div>
             </div>
          </section>
        )}

        {/* Display Style */}
        <section>
          <label className="text-[10px] uppercase tracking-widest text-[#444] block mb-4">Display Mode</label>
          <div>
             <div className="grid grid-cols-1 gap-2 mb-6">
               {(['Clock', 'Text', 'Image'] as const).map(type => (
                 <button
                   key={type}
                   onClick={() => update('displayType', type)}
                   className={"w-full text-left p-3 rounded flex justify-between items-center transition-colors border " + (config.displayType === type ? 'bg-white/5 border-white/10' : 'border-transparent hover:bg-white/5')}
                 >
                   <span className={"text-sm " + (config.displayType === type ? "text-[#E0E0E0]" : "text-[#888]")}>
                     {type === 'Clock' ? 'Digital Clock' : type === 'Text' ? 'Custom Text Overlay' : 'Monochrome Image'}
                   </span>
                   {config.displayType === type && (
                     <span className="text-[10px] text-[var(--theme-color)] uppercase tracking-widest">Active</span>
                   )}
                 </button>
               ))}
             </div>

             {config.displayType === 'Text' && (
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#444] block mb-2">Custom Text</label>
                  <input 
                    type="text" 
                    value={config.customText}
                    onChange={(e) => update('customText', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-sm placeholder:text-[#666] text-[#E0E0E0] outline-none focus:border-[var(--theme-color)] transition-colors"
                  />
                </div>
             )}

             {config.displayType === 'Image' && (
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#444] block mb-2">Image Asset URL</label>
                  <input 
                    type="url" 
                    value={config.customImageUrl}
                    onChange={(e) => update('customImageUrl', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-sm placeholder:text-[#666] text-[#E0E0E0] outline-none focus:border-[var(--theme-color)] transition-colors"
                  />
                </div>
             )}
          </div>
        </section>

         {/* Colors */}
         <section>
          <label className="text-[10px] uppercase tracking-widest text-[#444] block mb-4">Display Screen Color</label>
          <div className="flex gap-4 items-center overflow-x-auto no-scrollbar py-1">
             <div className="relative w-8 h-8 flex-shrink-0 rounded-full overflow-hidden border border-[var(--theme-color)] flex items-center justify-center p-0 transition-transform">
                <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none z-10" />
                <input 
                  type="color" 
                  value={config.displayColor}
                  onChange={(e) => update('displayColor', e.target.value)}
                  className="absolute inset-[-10px] w-12 h-12 cursor-pointer border-0 bg-transparent p-0 m-0"
                />
             </div>
             
             <div className="w-[1px] h-6 bg-[#333]"></div>

             {['#FFFFFF', '#f97316', '#A9D1FF', '#FFB4AB', '#E8DEF8', '#E6F4D8'].map(color => (
               <button
                 key={color}
                 onClick={() => update('displayColor', color)}
                 className={"flex-shrink-0 w-8 h-8 rounded-full border transition-transform " + (config.displayColor === color ? 'border-[var(--theme-color)] scale-110 shadow-[0_0_8px_var(--theme-color)]' : 'border-[#333] hover:border-[#666]')}
                 style={{ backgroundColor: color }}
               />
             ))}
          </div>
        </section>



        <section>
          <label className="text-[10px] uppercase tracking-widest text-[#444] block mb-4">AMOLED Protection</label>
          <div className="p-4 rounded border border-dashed border-[#333] bg-[#0d0d0d]">
            <p className="text-[11px] text-[#777] leading-relaxed">
              Burn-in protection is active. Elements shift by <span className="text-white">up to 10px</span> every <span className="text-white">60s</span> using dynamic raster algorithms.
            </p>
          </div>
        </section>

      </div>
      </div>

      <footer className="p-8 border-t border-[#222] bg-[#080808] shrink-0">
        <button 
          onClick={onTestAod}
          className="w-full py-4 border border-white/20 text-xs tracking-widest text-white uppercase font-medium hover:bg-[var(--theme-color)] hover:border-[var(--theme-color)] hover:text-white transition-all bg-transparent"
        >
          Flash to Device
        </button>
      </footer>

      {showAppSettings && (
        <div className="absolute inset-0 z-50 bg-[#0A0A0A] flex flex-col pt-12 animate-in slide-in-from-bottom duration-300">
           <header className="px-8 pb-8 border-b border-[#222] flex items-center justify-between">
              <h2 className="text-sm tracking-[0.2em] uppercase text-[#E0E0E0] font-semibold">App Settings</h2>
              <button onClick={() => setShowAppSettings(false)} className="text-[#666] hover:text-[var(--theme-color)] transition-colors">
                <X className="w-6 h-6" />
              </button>
           </header>
           <div className="p-8 flex-1 space-y-8 overflow-y-auto">
              <section>
                <label className="text-[10px] uppercase tracking-widest text-[#444] block mb-4">App Theme</label>
                <div className="space-y-4">
                   <div className="py-4 space-y-4">
                     <label className="text-xs text-[#AAA] block">Theme Primary Color</label>
                     <div className="flex gap-4 items-center overflow-x-auto no-scrollbar py-1">
                       <div className="relative w-8 h-8 flex-shrink-0 rounded-full overflow-hidden border border-[#555] flex items-center justify-center p-0 transition-transform">
                          <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none z-10" />
                          <input 
                            type="color" 
                            value={config.appThemeColor}
                            onChange={(e) => update('appThemeColor', e.target.value)}
                            className="absolute inset-[-10px] w-12 h-12 cursor-pointer border-0 bg-transparent p-0 m-0"
                          />
                       </div>
                       
                       <div className="w-[1px] h-6 bg-[#333]"></div>

                       {['#f97316', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#eab308'].map(color => (
                         <button
                           key={color}
                           onClick={() => update('appThemeColor', color)}
                           className={"flex-shrink-0 w-8 h-8 rounded-full border transition-transform " + (config.appThemeColor === color ? 'border-[var(--theme-color)] scale-110 shadow-[0_0_8px_var(--theme-color)]' : 'border-[#333] hover:border-[#666]')}
                           style={{ backgroundColor: color }}
                         />
                       ))}
                     </div>
                   </div>
                </div>
              </section>
           </div>
        </div>
      )}
    </div>
  );
}
