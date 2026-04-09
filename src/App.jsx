import { useState, useRef, useEffect } from 'react';
import './App.css';

const BEAD_SIZE = 80;
const BEAD_GAP = 15;
const STEP = BEAD_SIZE + BEAD_GAP; // 95

const getTasbeehCount = (p) => {
  const cycle = Math.floor(p / 102);
  const rem = p % 102;
  let offset = 0;
  if (rem === 0) offset = 0;
  else if (rem <= 33) offset = rem;
  else if (rem === 34) offset = 33;
  else if (rem <= 67) offset = rem - 1;
  else if (rem === 68) offset = 66;
  else if (rem <= 101) offset = rem - 2;
  return cycle * 100 + offset;
};

const getDisplayCount = (p, currentMode) => {
  if (currentMode === 'tasbeeh') {
    return getTasbeehCount(p);
  }
  return p;
};

function App({ allowMaala = false }) {
  const [mode, setMode] = useState("tasbeeh"); // "tasbeeh" or "maala"
  const [position, setPosition] = useState(0);
  const [maxCount, setMaxCount] = useState(100);
  const [animating, setAnimating] = useState(false);
  const containerRef = useRef(null);
  const threadGroupRef = useRef(null);
  const [permissionRequested, setPermissionRequested] = useState(false);

  useEffect(() => {
    const handleOrientation = (event) => {
      let tilt = event.gamma;
      if (tilt === null) return;
      // clamp tilt safely
      tilt = Math.max(-45, Math.min(45, tilt));
      
      // Update global CSS variable for the tassel to swing
      document.documentElement.style.setProperty('--swing', `${tilt}deg`);
    };
    
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  const displayCount = getDisplayCount(position, mode);

  const handleChant = () => {
    if (!permissionRequested) {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().catch(console.error);
      }
      setPermissionRequested(true);
    }
    
    if (animating || displayCount >= maxCount) return;
    
    // Optionally trigger a subtle vibration if supported
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    setAnimating(true);
    setTimeout(() => {
      setPosition((p) => p + 1);
      setAnimating(false);
    }, 200);
  };

  const handleReset = (e) => {
    e.stopPropagation(); // prevent chanting
    setPosition(0);
  };

  const toggleMode = (newMode, e) => {
    e.stopPropagation();
    if (mode === newMode) return;
    setMode(newMode);
    setPosition(0);
    setMaxCount(newMode === 'tasbeeh' ? 100 : 108);
  };

  // We render 8 slots. Slot 5 is the "active" position around 475px down.
  const slots = [0, 1, 2, 3, 4, 5, 6, 7];

  const getBeadClass = (beadIndex) => {
    let classes = "bead ";
    
    if (mode === "tasbeeh") {
      const rem = beadIndex % 102;
      if (rem === 0) {
        classes += " imam"; 
      } else if (rem === 34 || rem === 68) {
        classes += " mini-yellow";
      }
    } else if (mode === "maala") {
      if (beadIndex === 0 || beadIndex === maxCount) {
        classes += " imam"; 
      } else if (beadIndex % 108 === 0) {
        classes += " marker";
      }
    }

    if (beadIndex === position) {
      classes += " glow";
    }
    return classes;
  };

  return (
    <div className={`w-full max-w-[480px] h-[100dvh] mx-auto flex flex-col relative bg-[radial-gradient(circle_at_50%_30%,#2A2522_0%,#12100E_70%)] theme-${mode}`} onClick={handleChant}>
      <div className="pt-6 px-5 pb-4 text-center z-10 glass-panel mt-4 flex-shrink-0 mx-4">
        <h1 className="text-2xl text-accent tracking-[2px] uppercase mb-1">Chant</h1>
        {allowMaala && (
          <div className="flex justify-center gap-4 mt-4">
            <button 
              className={`px-4 py-2 rounded-[20px] text-sm font-medium transition-all duration-300 border border-transparent ${mode === 'tasbeeh' ? 'text-text bg-panel-bg !border-panel-border shadow-md' : 'text-[#888]'}`}
              onClick={(e) => toggleMode('tasbeeh', e)}
            >
              Tasbeeh
            </button>
            <button 
              className={`px-4 py-2 rounded-[20px] text-sm font-medium transition-all duration-300 border border-transparent ${mode === 'maala' ? 'text-text bg-panel-bg !border-panel-border shadow-md' : 'text-[#888]'}`}
              onClick={(e) => toggleMode('maala', e)}
            >
              Maala
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center mt-3 z-10 flex-shrink-0">
        <div className="text-[70px] font-light leading-none text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">{displayCount}</div>
        <div className="flex items-center gap-2 mt-1 text-accent opacity-80 text-base tracking-widest relative z-20" onClick={(e) => e.stopPropagation()}>
          <label>Max:</label>
          <input 
            type="number" 
            className="bg-transparent border border-white/20 text-text w-[60px] p-1 rounded text-center text-base focus:outline-none focus:border-accent"
            value={maxCount} 
            onChange={(e) => setMaxCount(Number(e.target.value) || 1)} 
            min="1"
          />
        </div>
      </div>

      <div 
        className="flex-1 relative overflow-hidden flex justify-center items-center cursor-pointer touch-manipulation"
        style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}
      >
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-[#3a2b21] z-[1] shadow-[inset_0_0_2px_rgba(0,0,0,0.8)]"></div>
        <div className={`relative z-[2] h-[450px] w-[120px] flex flex-col items-center ${animating ? 'sliding-down' : ''}`} ref={containerRef}>
          {slots.map((slot) => {
            const beadIndex = position + (5 - slot);
            // Hide beads that are "before" the start of the string
            if (beadIndex < 0) return null;

            // Calculate current top position shifted up so active bead is better centered
            const offset = 180;
            let currentTop = slot * STEP - offset;
            if (animating) {
               currentTop = (slot + 1) * STEP - offset;
            }

            // A simple fading out for top/bottom beads to make it look smooth
            const opacity = (currentTop < -150 || currentTop > 500) ? 0 : 1;
            const scale = (currentTop > 500) ? 0.8 : 1; // scale down the bead that falls off

            return (
              <div 
                key={slot} 
                className="bead-wrap absolute left-1/2 w-[80px] h-[80px] will-change-transform flex justify-center items-center" 
                style={{ 
                  top: `${currentTop}px`,
                  opacity,
                  transform: `translateX(-50%) scale(${scale})`,
                  transition: animating ? 'top 0.2s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s, transform 0.2s' : 'none'
                }}
              >
                <div className={`rounded-full relative flex justify-center items-center ${getBeadClass(beadIndex)}`}></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 text-center text-white/30 text-sm pointer-events-none animate-pulse">
        Tap anywhere to count
      </div>

      <button className="absolute bottom-6 right-6 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] p-3 rounded-full text-accent opacity-70 transition-opacity duration-300 hover:opacity-100 flex items-center justify-center backdrop-blur-md z-[50]" onClick={handleReset} aria-label="Reset Counter">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  );
}

export default App;
