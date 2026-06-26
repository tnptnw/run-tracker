import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  Radio, 
  Flame, 
  TrendingUp, 
  MapPin, 
  Zap, 
  Compass,
  CheckCircle,
  Clock
} from "lucide-react";
import { formatDuration, formatDistance, calculatePace, estimateCalories } from "../utils";
import { Lap, RunSession, NotificationAlert } from "../types";

interface LiveDashboardProps {
  onSessionComplete: (session: RunSession) => void;
  activeAlerts: NotificationAlert[];
  addAlert: (alert: NotificationAlert) => void;
}

export default function LiveDashboard({ onSessionComplete, activeAlerts, addAlert }: LiveDashboardProps) {
  // App states
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTimeMs, setElapsedTimeMs] = useState(0);
  const [currentLapNumber, setCurrentLapNumber] = useState(1);
  const [currentLapTimeMs, setCurrentLapTimeMs] = useState(0);
  const [totalDistanceMeters, setTotalDistanceMeters] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // 1x, 5x, 15x, 30x

  // Simulated metrics
  const [heartRate, setHeartRate] = useState(135);
  const [cadence, setCadence] = useState(165);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [lastWsPacket, setLastWsPacket] = useState<any>(null);

  // Simulation settings
  const lapTargetMeters = 400; // Track lap or shorter target for fast testing

  // References for timing
  const lastTickRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTriggeredLapRef = useRef<number>(0);
  const lastLapEndTimeMsRef = useRef<number>(0);

  // WebSocket Simulation Feed - changes status and pulses packets
  useEffect(() => {
    if (isRunning) {
      setWsStatus('connected');
      const wsInterval = setInterval(() => {
        // Mock a packet sent over simulated WebSocket
        const hrFluctuation = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const cadFluctuation = Math.floor(Math.random() * 7) - 3; // -3 to +3
        
        setHeartRate(prev => {
          const next = prev + hrFluctuation;
          return Math.max(110, Math.min(185, next));
        });
        
        setCadence(prev => {
          const next = prev + cadFluctuation;
          return Math.max(150, Math.min(195, next));
        });

        const packet = {
          eventId: Math.random().toString(36).substring(7),
          heartRate: heartRate,
          cadence: cadence,
          timestamp: new Date().toLocaleTimeString(),
          rssi: "-64dBm"
        };
        setLastWsPacket(packet);
      }, 1500);

      return () => clearInterval(wsInterval);
    } else {
      setWsStatus('disconnected');
    }
  }, [isRunning, heartRate, cadence]);

  // Main high-precision clock loop (using timestamps to handle multipliers and minimize drift)
  useEffect(() => {
    if (isRunning) {
      lastTickRef.current = performance.now();
      
      const tick = () => {
        const now = performance.now();
        if (lastTickRef.current !== null) {
          const delta = now - lastTickRef.current;
          // Apply simulation speed multiplier
          const simulatedDelta = delta * speedMultiplier;

          let currentElapsed = 0;
          setElapsedTimeMs(prev => {
            currentElapsed = prev + simulatedDelta;
            return currentElapsed;
          });
          
          setCurrentLapTimeMs(prev => prev + simulatedDelta);

          // Simulate runner progress: average running speed of ~4:15 per km (approx 3.92 m/s)
          // Add minor noise to speed
          const baseSpeedMetersPerSec = 3.92;
          const randomFactor = 0.85 + Math.random() * 0.3; // 85% to 115% speed variation
          const simulatedSpeed = baseSpeedMetersPerSec * randomFactor;
          
          // Distance delta in meters
          const distanceDelta = (simulatedSpeed * (simulatedDelta / 1000));
          
          setTotalDistanceMeters(prev => {
            const nextDistance = prev + distanceDelta;
            
            // Auto check if current lap distance exceeded lapTargetMeters using synchronous ref
            const completedLapsCount = Math.floor(nextDistance / lapTargetMeters);
            if (completedLapsCount > lastTriggeredLapRef.current) {
              const lapToTrigger = lastTriggeredLapRef.current + 1;
              lastTriggeredLapRef.current = lapToTrigger;
              
              // Trigger automated RFID checkpoint scan!
              setTimeout(() => {
                triggerCheckpointScanForLap(lapToTrigger, currentElapsed);
              }, 0);
            }
            
            return nextDistance;
          });
        }
        
        lastTickRef.current = now;
        animationFrameRef.current = requestAnimationFrame(tick);
      };

      animationFrameRef.current = requestAnimationFrame(tick);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastTickRef.current = null;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, speedMultiplier]);

  // Handle a lap-crossing scan (either auto-detected or manually triggered)
  const [completedLaps, setCompletedLaps] = useState<Lap[]>([]);

  const triggerCheckpointScanForLap = (lapNumber: number, currentElapsed: number) => {
    // Calculate current lap data based on currentElapsed time
    const lapTime = currentElapsed - lastLapEndTimeMsRef.current;
    lastLapEndTimeMsRef.current = currentElapsed;
    const lapDist = lapTargetMeters;
    
    // Calculate lap pace
    const lapPace = calculatePace(lapTime, lapDist);

    const newLap: Lap = {
      id: Date.now() + lapNumber,
      lapNumber: lapNumber,
      timeMs: lapTime,
      distanceMeters: lapDist,
      averagePace: lapPace,
      timestamp: new Date().toLocaleTimeString()
    };

    setCompletedLaps(prev => [...prev, newLap]);
    
    // Add toast notification
    const alertId = (Date.now() + lapNumber).toString();
    const formattedLapTime = formatDuration(lapTime, true);
    addAlert({
      id: alertId,
      message: `⚡ Lap ${lapNumber} Completed!`,
      subMessage: `Time: ${formattedLapTime}  |  Pace: ${lapPace}`,
      type: 'lap_complete',
      timestamp: new Date().toLocaleTimeString()
    });

    // Reset current lap metrics & increment lap number
    setCurrentLapNumber(lapNumber + 1);
    setCurrentLapTimeMs(0);
  };

  const triggerManualCheckpointScan = () => {
    if (!isRunning) return;
    
    const lapToTrigger = lastTriggeredLapRef.current + 1;
    lastTriggeredLapRef.current = lapToTrigger;
    
    let currentElapsed = 0;
    setElapsedTimeMs(prev => {
      currentElapsed = prev;
      return prev;
    });

    // Sync total distance exactly to the completed lap checkpoint boundary
    setTotalDistanceMeters(lapToTrigger * lapTargetMeters);

    triggerCheckpointScanForLap(lapToTrigger, currentElapsed);
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to discard this live run?")) {
      setIsRunning(false);
      setIsPaused(false);
      setElapsedTimeMs(0);
      setCurrentLapNumber(1);
      setCurrentLapTimeMs(0);
      setTotalDistanceMeters(0);
      setCompletedLaps([]);
      lastTriggeredLapRef.current = 0;
      lastLapEndTimeMsRef.current = 0;
    }
  };

  const handleFinishSession = () => {
    // Finish active session and save it
    if (elapsedTimeMs < 5000) {
      alert("Run is too short! Keep running to log a session.");
      return;
    }

    // Capture final incomplete lap as a lap if it has significant progress
    let allLaps = [...completedLaps];
    const finalLapProgressDist = totalDistanceMeters - (completedLaps.length * lapTargetMeters);
    if (finalLapProgressDist > 10) {
      const finalLap: Lap = {
        id: Date.now() + 1,
        lapNumber: currentLapNumber,
        timeMs: currentLapTimeMs,
        distanceMeters: finalLapProgressDist,
        averagePace: calculatePace(currentLapTimeMs, finalLapProgressDist),
        timestamp: new Date().toLocaleTimeString()
      };
      allLaps.push(finalLap);
    }

    const calculatedAvgPace = calculatePace(elapsedTimeMs, totalDistanceMeters);
    
    const newSession: RunSession = {
      id: `session_${Date.now()}`,
      name: `Morning Park Run #${Math.floor(Math.random() * 80) + 10}`,
      date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      totalTimeMs: elapsedTimeMs,
      totalDistanceMeters: totalDistanceMeters,
      averagePace: calculatedAvgPace,
      laps: allLaps,
      caloriesBurned: estimateCalories(totalDistanceMeters)
    };

    onSessionComplete(newSession);

    // Reset fields
    setIsRunning(false);
    setIsPaused(false);
    setElapsedTimeMs(0);
    setCurrentLapNumber(1);
    setCurrentLapTimeMs(0);
    setTotalDistanceMeters(0);
    setCompletedLaps([]);
    lastTriggeredLapRef.current = 0;
    lastLapEndTimeMsRef.current = 0;

    addAlert({
      id: Date.now().toString(),
      message: "🏃‍♂️ Workout Logged Successfully!",
      subMessage: `Distance: ${formatDistance(newSession.totalDistanceMeters)} | Pace: ${newSession.averagePace}`,
      type: 'milestone',
      timestamp: new Date().toLocaleTimeString()
    });
  };

  // Calculations for current lap progress ring
  const currentLapDistance = totalDistanceMeters - ((currentLapNumber - 1) * lapTargetMeters);
  const lapProgressPercent = Math.min(100, Math.round((currentLapDistance / lapTargetMeters) * 100));

  // Circular progress math (Radius r = 80, Circumference = 2 * PI * r = ~502.65)
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (lapProgressPercent / 100) * circumference;

  // Render Live Telemetry WebSocket Packet
  const renderPacketInfo = () => {
    if (!lastWsPacket) return "Waiting for telemetry...";
    return `Event: ${lastWsPacket.eventId} | HR: ${lastWsPacket.heartRate}bpm | Cad: ${lastWsPacket.cadence}spm | Latency: 12ms`;
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-white font-sans overflow-y-auto pb-4">
      {/* Active Run Status Badge & Stopwatch Header */}
      <div className="px-6 pt-5 pb-4 bg-linear-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800 flex flex-col items-center shrink-0">
        <div className="flex items-center justify-between w-full mb-3">
          <div className="flex items-center gap-2">
            <span className={`relative flex h-2 w-2 ${isRunning ? "block" : "hidden"}`}>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
            </span>
            <span className={`text-[10px] font-bold tracking-widest uppercase ${isRunning ? 'text-lime-400' : isPaused ? 'text-amber-400' : 'text-zinc-400'}`}>
              {isRunning ? "ACTIVE RUN ⚡" : isPaused ? "RUN PAUSED" : "READY FOR TAKEOFF 🏃"}
            </span>
          </div>
          
          {/* Simulated WebSocket Pill */}
          <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-800">
            <Radio size={11} className={wsStatus === 'connected' ? "text-lime-400 animate-pulse" : "text-zinc-500"} />
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider">
              WS: {wsStatus === 'connected' ? "LIVE" : "OFFLINE"}
            </span>
          </div>
        </div>

        {/* Stopwatch digits display - Geometric Balance: Big, bold lime-400 */}
        <div className="text-center py-1" id="live-stopwatch-display">
          <div className="text-5xl font-mono font-black tracking-tighter text-lime-400">
            {formatDuration(elapsedTimeMs, true)}
          </div>
        </div>
      </div>

      {/* Main Panel Content Scrollable */}
      <div className="px-5 py-3 flex-1 flex flex-col gap-4">
        
        {/* Live Lap View Section (with Circle Ring) */}
        <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center relative shadow-xl shadow-black/40">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-1.5 self-start">
            <Compass size={13} className="text-lime-400" />
            Live Lap Telemetry
          </h3>

          <div className="relative flex items-center justify-center w-40 h-40 mb-3">
            {/* SVG Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Background Circle */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="stroke-zinc-950"
                strokeWidth="11"
                fill="transparent"
              />
              {/* Progress Circle with neon gradient */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="stroke-lime-400 transition-all duration-300 ease-out"
                strokeWidth="11"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>

            {/* Inner Dashboard Core */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                Current
              </span>
              <span className="text-3xl font-black italic text-white leading-none mt-0.5">
                LAP {currentLapNumber}
              </span>
              <span className="text-[11px] font-bold text-zinc-400 mt-1">
                {lapProgressPercent}% Complete
              </span>
            </div>

            {/* Simulated Live Runner Marker on Ring */}
            <div className="absolute top-1 right-1">
              <span className="flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-lime-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-lime-400"></span>
              </span>
            </div>
          </div>

          {/* Lap info summary */}
          <div className="w-full grid grid-cols-2 divide-x divide-zinc-800 border-t border-zinc-800 pt-2 text-center">
            <div>
              <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider mb-0.5">Lap Distance</p>
              <p className="text-xs font-semibold text-zinc-300 font-mono">
                {Math.round(currentLapDistance)}m / {lapTargetMeters}m
              </p>
            </div>
            <div>
              <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider mb-0.5">Lap Pace</p>
              <p className="text-xs font-semibold text-zinc-300 font-mono">
                {calculatePace(currentLapTimeMs, currentLapDistance)}
              </p>
            </div>
          </div>
        </div>

        {/* Real-time Metrics Grid */}
        <div className="grid grid-cols-3 gap-2">
          
          {/* Metric 1: Current Lap Time */}
          <div className="bg-zinc-900 p-3 rounded-2xl flex flex-col items-center border border-zinc-800 text-center">
            <span className="text-[9px] uppercase font-bold text-zinc-500 mb-1">Lap Time</span>
            <span className="text-sm font-mono font-bold text-white truncate w-full">
              {formatDuration(currentLapTimeMs, false)}
            </span>
          </div>

          {/* Metric 2: Total Distance */}
          <div className="bg-zinc-900 p-3 rounded-2xl flex flex-col items-center border border-zinc-800 text-center">
            <span className="text-[9px] uppercase font-bold text-zinc-500 mb-1">Distance</span>
            <span className="text-sm font-mono font-bold text-white">
              {formatDistance(totalDistanceMeters).replace(' km', '')}<span className="text-[9px] ml-0.5 text-zinc-400">km</span>
            </span>
          </div>

          {/* Metric 3: Average Pace */}
          <div className="bg-zinc-900 p-3 rounded-2xl flex flex-col items-center border border-zinc-800 text-center">
            <span className="text-[9px] uppercase font-bold text-zinc-500 mb-1">Avg Pace</span>
            <span className="text-sm font-mono font-bold text-lime-400">
              {calculatePace(elapsedTimeMs, totalDistanceMeters).split(' ')[0]}
            </span>
          </div>

        </div>

        {/* Heart Rate / Cadence Micro stats from WS simulation */}
        <AnimatePresence>
          {isRunning && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-zinc-900 rounded-2xl px-4 py-2.5 border border-zinc-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Activity className="text-lime-400 animate-pulse shrink-0" size={15} />
                <div>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">WS Biometrics</p>
                  <p className="text-[10px] text-zinc-400 font-mono mt-0.5 leading-none">
                    Telemetry Live Feed
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-lime-400 font-mono">
                  💓 {heartRate} BPM | 👣 {cadence} SPM
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Simulation Controls panel */}
        <div className="bg-zinc-900/60 rounded-2xl p-3 border border-zinc-800 mt-0.5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Radio size={11} className="text-lime-400 animate-pulse" />
              Simulation Controls
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* RFID Scanner Trigger Button */}
            <button
              onClick={triggerManualCheckpointScan}
              disabled={!isRunning}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border text-[10px] font-bold tracking-wide transition-all ${
                isRunning 
                  ? "bg-zinc-950 border-lime-500/30 text-lime-400 hover:bg-zinc-900 cursor-pointer shadow-md active:scale-95" 
                  : "bg-zinc-950/50 border-zinc-900 text-zinc-600 cursor-not-allowed"
              }`}
            >
              <Radio size={11} className="shrink-0" />
              Scan RFID Chip 📡
            </button>

            {/* Speed Multiplier Button */}
            <div className="flex items-center bg-zinc-950 rounded-xl p-0.5 border border-zinc-850">
              <div className="flex-1 grid grid-cols-4 text-[9px] font-bold font-mono">
                {[1, 5, 15, 30].map(mult => (
                  <button
                    key={mult}
                    onClick={() => setSpeedMultiplier(mult)}
                    className={`py-1 text-center rounded-lg transition-all cursor-pointer ${
                      speedMultiplier === mult 
                        ? "bg-lime-400 text-zinc-950 font-black" 
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {mult}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls Deck */}
        <div className="mt-auto pt-1 grid grid-cols-2 gap-3">
          {!isRunning && !isPaused ? (
            // Ready state: Start button spanning both columns
            <button
              onClick={handleStart}
              className="col-span-2 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-black text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-xl shadow-lime-950/20 active:scale-98"
            >
              <Play fill="currentColor" size={14} />
              START ACTIVE PARKRUN
            </button>
          ) : (
            // Running/Paused state: Multi control actions
            <>
              {isRunning ? (
                <button
                  onClick={handlePause}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-black text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer shadow-md"
                >
                  <Pause fill="currentColor" size={12} />
                  PAUSE RUN
                </button>
              ) : (
                <button
                  onClick={handleStart}
                  className="bg-lime-400 hover:bg-lime-300 text-zinc-950 font-black text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer shadow-md"
                >
                  <Play fill="currentColor" size={12} />
                  RESUME
                </button>
              )}

              <button
                onClick={handleFinishSession}
                className="bg-white hover:bg-zinc-200 text-zinc-950 font-black text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer shadow-md"
              >
                <CheckCircle size={12} />
                SAVE WORKOUT
              </button>

              <button
                onClick={handleReset}
                className="col-span-2 bg-zinc-950 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-zinc-850 text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 transition-all duration-150 cursor-pointer mt-0.5"
              >
                <RotateCcw size={11} />
                Discard Active Session
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
