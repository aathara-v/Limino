import React, { useState, useEffect, useRef } from 'react';
import { Settings } from './components/AodSettings';

export interface AodConfig {
  mode: 'Always' | 'Timeout' | 'Single Tap' | 'Scheduled';
  displayType: 'Clock' | 'Text' | 'Image';
  timeoutDuration: number;
  customText: string;
  customImageUrl: string;
  displayColor: string;
  appThemeColor: string;
  startTime: string;
  endTime: string;
}

export default function App() {
  const [isActive, setIsActive] = useState(false);
  const [config, setConfig] = useState<AodConfig>(() => {
    const defaults: AodConfig = {
      mode: 'Always',
      displayType: 'Clock',
      timeoutDuration: 2,
      customText: 'Always On',
      customImageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80',
      displayColor: '#FFFFFF',
      appThemeColor: '#f97316',
      startTime: '22:00',
      endTime: '07:00'
    };
    
    const saved = localStorage.getItem('aod_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaults, ...parsed };
      } catch (e) {}
    }
    return defaults;
  });

  useEffect(() => {
    localStorage.setItem('aod_settings', JSON.stringify(config));
  }, [config]);

  // Handle Timeout Logic for AOD
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isActive && config.mode === 'Timeout') {
      timeout = setTimeout(() => {
        setIsActive(false);
      }, config.timeoutDuration * 60000);
    }
    return () => clearTimeout(timeout);
  }, [isActive, config]);

  // Handle Scheduled Logic for AOD
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (config.mode === 'Scheduled') {
      const checkSchedule = () => {
        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();
        
        const startParts = config.startTime.split(':').map(Number);
        const endParts = config.endTime.split(':').map(Number);
        
        if (startParts.length === 2 && endParts.length === 2) {
          const startMins = startParts[0] * 60 + startParts[1];
          const endMins = endParts[0] * 60 + endParts[1];

          let isInSchedule = false;
          if (startMins <= endMins) {
            isInSchedule = currentMins >= startMins && currentMins < endMins;
          } else {
            // Spans across midnight
            isInSchedule = currentMins >= startMins || currentMins < endMins;
          }

          setIsActive(prev => {
            if (isInSchedule && !prev) return true;
            if (!isInSchedule && prev) return false;
            return prev;
          });
        }
      };

      checkSchedule(); // Check immediately
      interval = setInterval(checkSchedule, 10000); // Check more frequently (every 10s) to be responsive
    }
    return () => clearInterval(interval);
  }, [config.mode, config.startTime, config.endTime]);

  return (
    <div className="w-full h-[100dvh] relative bg-[#050505] text-[#E0E0E0] overflow-hidden font-sans">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      <div className="mx-auto w-full h-full max-w-md relative bg-[#050505] border-x border-[#222] shadow-2xl flex flex-col z-10">
        {isActive ? (
          <AodActive config={config} onExit={() => setIsActive(false)} />
        ) : (
          <Settings 
            config={config} 
            onUpdate={setConfig} 
            onTestAod={() => setIsActive(true)} 
          />
        )}
      </div>
    </div>
  );
}

// AOD Active Screen Component
function AodActive({ config, onExit }: { config: AodConfig, onExit: () => void }) {
  const [time, setTime] = useState(new Date());
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const touchStartRef = useRef<{ y: number, time: number } | null>(null);
  const [isAwake, setIsAwake] = useState(() => config.mode !== 'Single Tap');
  const [battery, setBattery] = useState<{ level: number, charging: boolean } | null>(null);

  // Clock interval
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Battery tracking
  useEffect(() => {
    let batteryManager: any = null;

    const updateBattery = () => {
      if (batteryManager) {
        setBattery({
          level: Math.round(batteryManager.level * 100),
          charging: batteryManager.charging
        });
      }
    };

    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((bm: any) => {
        batteryManager = bm;
        updateBattery();
        bm.addEventListener('levelchange', updateBattery);
        bm.addEventListener('chargingchange', updateBattery);
      });
    }

    return () => {
      if (batteryManager) {
        batteryManager.removeEventListener('levelchange', updateBattery);
        batteryManager.removeEventListener('chargingchange', updateBattery);
      }
    };
  }, []);

  // Handle single tap to wake logic
  useEffect(() => {
    if (config.mode === 'Single Tap') {
      if (isAwake) {
        const timer = setTimeout(() => setIsAwake(false), 10000); // Wake for 10s
        return () => clearTimeout(timer);
      }
    } else {
      setIsAwake(true);
    }
  }, [isAwake, config.mode]);

  const activeTimeRef = useRef({
    accumulated: 0,
    lastTick: Date.now(),
    threshold: Math.random() * 60000 + 60000 // 1 to 2 mins, max 2 mins
  });

  // Burn-in protection: Shift pixels dynamically based on elapsed active time
  useEffect(() => {
    activeTimeRef.current.lastTick = Date.now();
    
    const shiftInterval = setInterval(() => {
      const now = Date.now();
      const delta = now - activeTimeRef.current.lastTick;
      activeTimeRef.current.lastTick = now;

      if (isAwake) {
        activeTimeRef.current.accumulated += delta;
        if (activeTimeRef.current.accumulated >= activeTimeRef.current.threshold) {
          setOffset({
            x: Math.floor(Math.random() * 20) - 10,
            y: Math.floor(Math.random() * 20) - 10
          });
          // Reset and pick a new dynamic threshold up to 2 mins
          activeTimeRef.current.accumulated = 0;
          activeTimeRef.current.threshold = Math.random() * 60000 + 60000; 
        }
      }
    }, 1000); // Check every second

    return () => clearInterval(shiftInterval);
  }, [isAwake]);

  // 2-Finger Swipe Gesture Detection
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const avgY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      touchStartRef.current = { y: avgY, time: Date.now() };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.touches.length !== 2) return;
    
    const avgY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    const deltaY = avgY - touchStartRef.current.y;
    
    // If the user swiped down with 2 fingers by more than 100 pixels
    if (deltaY > 100) {
      if ('vibrate' in navigator) {
        navigator.vibrate([30, 50, 30]); // Haptic feedback pattern
      }
      onExit();
      touchStartRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  const handlePointerDown = () => {
    if (config.mode === 'Single Tap' && !isAwake) {
      setIsAwake(true);
    }
  };

  return (
    <div 
      className="absolute inset-0 bg-black z-50 flex items-center justify-center flex-col transition-opacity duration-700"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onPointerDown={handlePointerDown}
      style={{ touchAction: 'none' }}
    >
      <div 
        className={`transition-all duration-700 flex flex-col items-center justify-center space-y-6 w-full h-full ${isAwake ? 'opacity-100' : 'opacity-0'}`}
      >
        <div 
          className="transition-transform duration-[20000ms] ease-linear flex flex-col items-center justify-center space-y-6"
          style={{ transform: `translate(${offset.x}px, ${offset.y}px)`, color: config.displayColor }}
        >
          {config.displayType === 'Clock' && (
            <div className="flex flex-col items-center mt-12">
              <div className="text-7xl font-light tracking-tighter">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
              </div>
              <div className="text-sm tracking-[0.2em] uppercase text-[#666] mt-2">
                {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
          )}

          {config.displayType === 'Text' && (
            <div className="text-4xl font-light text-center px-8 max-w-sm break-words leading-relaxed animate-pulse tracking-[0.1em]" style={{ animationDuration: '4s' }}>
              {config.customText}
            </div>
          )}

          {config.displayType === 'Image' && (
            <img 
              src={config.customImageUrl} 
              alt="AOD Custom" 
              className="w-48 h-48 object-cover rounded-full opacity-70 grayscale border border-[#333]"
              onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80')}
            />
          )}
        </div>
      </div>

      <div className={`absolute bottom-4 flex flex-col items-center space-y-2 text-[10px] text-[#444] uppercase tracking-[0.2em] transition-opacity duration-700 ${isAwake ? 'opacity-100' : 'opacity-0'}`}>
        {battery && (
          <div className="flex items-center gap-2 text-[#555]">
            <span>{battery.level}%</span>
            <span className="opacity-50">•</span>
            <span>{battery.charging ? 'Charging' : 'Discharging'}</span>
          </div>
        )}
        <div>2-Finger Swipe Down to Exit</div>
      </div>
    </div>
  );
}
