import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  History, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Timer, 
  Flame, 
  TrendingUp, 
  Clock, 
  Map, 
  Activity,
  Compass
} from "lucide-react";
import { formatDuration, formatDistance } from "../utils";
import { RunSession, Lap } from "../types";

interface HistoryTabProps {
  sessions: RunSession[];
  onClearHistory?: () => void;
}

export default function HistoryTab({ sessions, onClearHistory }: HistoryTabProps) {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedSessionId(prev => prev === id ? null : id);
  };

  // Calculate high-level summaries
  const totalKm = sessions.reduce((acc, s) => acc + (s.totalDistanceMeters / 1000), 0);
  const totalSecs = sessions.reduce((acc, s) => acc + (s.totalTimeMs / 1000), 0);
  const totalHrs = totalSecs / 3600;
  const totalCalories = sessions.reduce((acc, s) => acc + s.caloriesBurned, 0);

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-white font-sans overflow-y-auto pb-4">
      {/* Tab Header & Overall Summary */}
      <div className="px-6 pt-5 pb-5 bg-linear-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800 shrink-0">
        <h2 className="text-lg font-extrabold font-display tracking-tight flex items-center gap-2 mb-3">
          <History className="text-lime-400" size={20} />
          Running History
        </h2>

        {/* Weekly Summary Card */}
        <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800/80 mb-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase text-lime-400 tracking-wider font-mono">
              ⚡ Weekly Summary
            </span>
            <span className="text-[9px] text-zinc-500 font-mono">Current Cycle</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Total Time</p>
              <p className="text-base font-black text-white font-mono mt-0.5">
                {formatDuration(sessions.reduce((acc, s) => acc + s.totalTimeMs, 0), false)}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Total Laps Completed</p>
              <p className="text-base font-black text-lime-400 font-mono mt-0.5">
                {sessions.reduce((acc, s) => acc + (s.laps ? s.laps.length : 0), 0)} <span className="text-xs text-zinc-500 font-normal font-sans">laps</span>
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex justify-between items-center text-[9px] text-zinc-400 font-mono">
            <span>Total Distance: {totalKm.toFixed(2)} km</span>
            <span>Avg Speed: {sessions.length > 0 ? (totalKm / (totalSecs / 3600)).toFixed(1) : "0.0"} km/h</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 flex flex-col gap-4">
        {sessions.length === 0 ? (
          <div className="text-center py-12 px-6 bg-zinc-900 rounded-2xl border border-zinc-800 my-4">
            <p className="text-zinc-400 font-semibold text-xs mb-1">No logged runs found</p>
            <p className="text-[10px] text-zinc-500 leading-relaxed">Go to the Live Tracker, click Start, and complete a run to view logged sessions here!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                Past Completed Runs ({sessions.length})
              </span>
              {onClearHistory && (
                <button
                  onClick={() => {
                    if (window.confirm("Delete all session history? This action is permanent.")) {
                      onClearHistory();
                    }
                  }}
                  className="text-[9px] text-red-400 hover:text-red-300 transition-colors uppercase font-bold tracking-wider cursor-pointer"
                >
                  Reset Log
                </button>
              )}
            </div>

            {sessions.map((session, index) => {
              const isExpanded = expandedSessionId === session.id;
              
              // Calculate fastest lap in this session (minimum timeMs)
              const fastestLap = session.laps && session.laps.length > 0
                ? [...session.laps].sort((a, b) => a.timeMs - b.timeMs)[0]
                : null;
              
              return (
                <div 
                  key={session.id}
                  className={`bg-zinc-900 rounded-2xl border transition-all ${
                    isExpanded ? "border-zinc-700 bg-zinc-900" : "border-zinc-800/80 hover:border-zinc-750"
                  }`}
                >
                  {/* Collapsed/Primary Header */}
                  <div 
                    onClick={() => toggleExpand(session.id)}
                    className="p-4 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar size={11} className="text-lime-400" />
                        <span className="text-[9px] font-bold text-zinc-500 font-mono tracking-wider">{session.date}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white tracking-tight truncate">
                        {session.name}
                      </h3>
                      {/* Short summary horizontal grid */}
                      <div className="flex items-center gap-3 mt-1.5 text-xs font-mono text-zinc-400">
                        <span>{formatDistance(session.totalDistanceMeters)}</span>
                        <span className="text-zinc-800">•</span>
                        <span>{formatDuration(session.totalTimeMs)}</span>
                        <span className="text-zinc-800">•</span>
                        <span className="text-lime-400 font-bold">{session.averagePace}</span>
                      </div>
                    </div>

                    <div className="ml-4 pl-3 border-l border-zinc-800 text-zinc-500">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {/* Expandable Lap Splits & Charts Drawer */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-zinc-800/80 bg-zinc-950/40 rounded-b-2xl"
                      >
                        <div className="p-4 flex flex-col gap-4">
                          
                          {/* Mini Details Blocks */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-800/80 flex items-center gap-3">
                              <Flame className="text-lime-400 shrink-0" size={15} />
                              <div>
                                <p className="text-[8px] text-zinc-500 uppercase font-bold tracking-wider">Calories Burned</p>
                                <p className="text-xs font-mono font-bold text-zinc-200">{session.caloriesBurned} kcal</p>
                              </div>
                            </div>
                            <div className="bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-800/80 flex items-center gap-3">
                              <Compass className="text-lime-400 shrink-0" size={15} />
                              <div>
                                <p className="text-[8px] text-zinc-500 uppercase font-bold tracking-wider">Average Speed</p>
                                <p className="text-xs font-mono font-bold text-zinc-200">
                                  {((session.totalDistanceMeters / (session.totalTimeMs / 1000)) * 3.6).toFixed(1)} km/h
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Laps List Header */}
                          <div>
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                              <Timer size={11} className="text-lime-400" />
                              Recorded Lap Splits
                            </p>
                            
                            <div className="flex flex-col gap-1.5">
                              {/* Table Header */}
                              <div className="grid grid-cols-4 px-3 py-1 text-[8px] text-zinc-500 uppercase font-bold tracking-wider font-mono">
                                <span>LAP</span>
                                <span className="text-right">TIME</span>
                                <span className="text-right">DIST</span>
                                <span className="text-right">PACE</span>
                              </div>

                              {/* Laps rows */}
                              {session.laps && session.laps.map((lap, i) => {
                                const isFastest = fastestLap && lap.id === fastestLap.id;
                                return (
                                  <div 
                                    key={lap.id} 
                                    className={`grid grid-cols-4 px-3 py-1.5 rounded-lg text-xs font-mono border ${
                                      isFastest 
                                        ? "bg-lime-950/20 border-lime-500/30 shadow-xs shadow-lime-950/50" 
                                        : i === session.laps.length - 1 
                                        ? "bg-zinc-900 border-zinc-800" 
                                        : "bg-zinc-950/20 border-zinc-900"
                                    }`}
                                  >
                                    <span className="font-bold text-white flex items-center gap-1">
                                      Lap {lap.lapNumber}
                                      {isFastest && (
                                        <span className="inline-flex items-center gap-0.5 bg-lime-400 text-zinc-950 text-[7px] px-1 py-0.2 rounded font-black tracking-tighter uppercase shrink-0">
                                          🏆 PB
                                        </span>
                                      )}
                                    </span>
                                    <span className="text-right text-zinc-200">{formatDuration(lap.timeMs, true)}</span>
                                    <span className="text-right text-zinc-400">{(lap.distanceMeters).toFixed(0)}m</span>
                                    <span className="text-right text-lime-400 font-bold">{lap.averagePace}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
