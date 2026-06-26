import { useState } from "react";
import { 
  User, 
  Award, 
  Footprints, 
  Activity, 
  Heart, 
  Trophy, 
  Percent, 
  Zap, 
  ShieldCheck,
  Dumbbell
} from "lucide-react";
import { AthleteProfile } from "../types";

interface ProfileTabProps {
  profile: AthleteProfile;
}

export default function ProfileTab({ profile }: ProfileTabProps) {
  const [shoeDistanceMeters, setShoeDistanceMeters] = useState(142600); // 142.6 km
  const shoeLimitMeters = 500000; // 500 km
  const shoePercentage = Math.round((shoeDistanceMeters / shoeLimitMeters) * 100);

  // Preference Toggles for notifications & feedback
  const [alertOnLap, setAlertOnLap] = useState(true);
  const [audioHud, setAudioHud] = useState(false);

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-white font-sans overflow-y-auto pb-4">
      {/* Profile Header Block */}
      <div className="px-6 pt-6 pb-6 bg-linear-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800 text-center shrink-0 flex flex-col items-center">
        
        {/* Avatar Shield */}
        <div className="relative mb-3 group">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-lime-400 to-lime-600 opacity-75 blur-md animate-pulse"></div>
          <div className="relative w-20 h-20 bg-zinc-950 rounded-full border-2 border-zinc-800 flex items-center justify-center overflow-hidden">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User size={36} className="text-zinc-400" />
            )}
          </div>
          <div className="absolute bottom-0 right-0 bg-lime-400 text-zinc-950 text-[9px] font-black font-mono px-2 py-0.5 rounded-full uppercase border border-zinc-950">
            {profile.level}
          </div>
        </div>

        <h2 className="text-lg font-extrabold font-display tracking-tight text-white">{profile.name}</h2>
        
        <div className="text-xs text-zinc-400 font-mono mt-1 flex flex-col items-center justify-center gap-1.5">
          <p className="flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-lime-400" />
            Home: {profile.homeParkrun}
          </p>
          <span className="inline-flex items-center gap-1 bg-zinc-900 px-2.5 py-0.5 rounded border border-zinc-800 text-[9px] text-zinc-300 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            NFC Wristband: Connected ✅
          </span>
        </div>
      </div>

      <div className="px-5 py-4 flex flex-col gap-4">
        
        {/* Athletic KPI Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 relative overflow-hidden">
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest font-mono">Aerobic Capacity</p>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-xl font-black text-white font-display">{profile.vo2Max}</span>
              <span className="text-[9px] text-zinc-400 font-mono">mL/kg/min</span>
            </div>
            
            {/* VO2 Max Rating bar */}
            <div className="w-full bg-zinc-950 h-1.5 rounded-full mt-3 overflow-hidden border border-zinc-800">
              <div className="bg-lime-400 h-full rounded-full" style={{ width: '82%' }}></div>
            </div>
            <div className="flex justify-between items-center mt-1 text-[8px] font-mono text-zinc-500">
              <span>Fair</span>
              <span className="text-lime-400 font-bold">Excellent ⚡</span>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 flex flex-col justify-between">
            <div>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest font-mono">Lifetime Stats</p>
              <div className="mt-1.5">
                <p className="text-base font-extrabold text-white font-mono leading-none">
                  {profile.totalRuns} <span className="text-[9px] text-zinc-400 font-normal">Runs Completed</span>
                </p>
                <p className="text-xs font-mono text-zinc-300 font-bold mt-1">
                  {profile.totalDistanceKm.toFixed(1)} <span className="text-[9px] text-zinc-500 font-normal">total km</span>
                </p>
              </div>
            </div>
            <div className="border-t border-zinc-800 pt-2 mt-2 flex items-center gap-1.5 text-[9px] text-zinc-400">
              <Dumbbell size={11} className="text-lime-400" />
              <span>Streak: 4 weeks live</span>
            </div>
          </div>
        </div>

        {/* Personal Records Trophy Deck */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 shadow-xl shadow-black/30">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-1.5 border-b border-zinc-800 pb-2">
            <Trophy size={13} className="text-lime-400" />
            Personal Best (PB) Milestones
          </h3>

          {/* Core Milestone Cards Grid as requested */}
          <div className="grid grid-cols-3 gap-2 mb-3 mt-1">
            <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-850 text-center flex flex-col justify-between">
              <span className="text-[7px] text-zinc-500 uppercase font-bold tracking-wider leading-tight">Fastest Lap</span>
              <span className="text-xs font-black text-lime-400 font-mono mt-1 leading-none">03:08</span>
              <span className="text-[6.5px] text-zinc-500 font-mono mt-1">Sprint Record</span>
            </div>
            <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-850 text-center flex flex-col justify-between">
              <span className="text-[7px] text-zinc-500 uppercase font-bold tracking-wider leading-tight">Most Laps</span>
              <span className="text-xs font-black text-white font-mono mt-1 leading-none">18 Laps</span>
              <span className="text-[6.5px] text-zinc-400 font-mono mt-1 font-bold">In One Run</span>
            </div>
            <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-850 text-center flex flex-col justify-between">
              <span className="text-[7px] text-zinc-500 uppercase font-bold tracking-wider leading-tight">Lifetime Laps</span>
              <span className="text-xs font-black text-lime-400 font-mono mt-1 leading-none">112 Laps</span>
              <span className="text-[6.5px] text-zinc-500 font-mono mt-1">Total Tracked</span>
            </div>
          </div>

          <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">
            Standard Distances
          </p>

          <div className="flex flex-col gap-2">
            {profile.personalBests.map((pb, idx) => (
              <div 
                key={idx}
                className="bg-zinc-950/50 rounded-xl p-2.5 border border-zinc-800/80 flex items-center justify-between hover:border-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-lime-500/10 border border-lime-500/20 flex items-center justify-center">
                    <Award size={14} className="text-lime-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-display">{pb.distance}</h4>
                    <p className="text-[8px] text-zinc-500 font-mono mt-0.5">{pb.date}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-black text-white font-mono">{pb.time}</p>
                  <p className="text-[8px] text-zinc-400 font-mono mt-0.5">⏱️ {pb.pace}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Settings Section for Notifications */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 shadow-xl shadow-black/30">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-1.5">
            <Zap size={13} className="text-lime-400" />
            Quick Settings
          </h3>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-800/80">
              <div className="flex-1 pr-3">
                <h4 className="text-xs font-bold text-zinc-200">Alert me on every lap completion</h4>
                <p className="text-[8.5px] text-zinc-500 font-mono leading-snug mt-0.5">Push popups and flash HUD when checkpoints trigger</p>
              </div>
              <button 
                onClick={() => setAlertOnLap(!alertOnLap)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer shrink-0 ${
                  alertOnLap ? "bg-lime-400" : "bg-zinc-800"
                }`}
              >
                <div 
                  className={`w-4 h-4 rounded-full bg-zinc-950 transition-transform duration-200 ${
                    alertOnLap ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-800/80">
              <div className="flex-1 pr-3">
                <h4 className="text-xs font-bold text-zinc-200">Enable HUD Voice updates</h4>
                <p className="text-[8.5px] text-zinc-500 font-mono leading-snug mt-0.5">Use ambient synthesized metrics broadcasts</p>
              </div>
              <button 
                onClick={() => setAudioHud(!audioHud)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer shrink-0 ${
                  audioHud ? "bg-lime-400" : "bg-zinc-800"
                }`}
              >
                <div 
                  className={`w-4 h-4 rounded-full bg-zinc-950 transition-transform duration-200 ${
                    audioHud ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Gear Wear Tracker */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 shadow-xl shadow-black/30">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-1.5">
            <Footprints size={13} className="text-lime-400" />
            Gear Wear Analytics
          </h3>

          <div className="flex items-center justify-between mb-1.5">
            <div>
              <h4 className="text-xs font-bold text-zinc-200">Nike Vaporfly Next% 3</h4>
              <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Racing Road Shoes</p>
            </div>
            <span className="text-[9px] font-bold font-mono text-lime-400 bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded">
              {shoePercentage}% Life
            </span>
          </div>

          <div className="w-full bg-zinc-950 h-1.5 rounded-full mt-2 overflow-hidden border border-zinc-850">
            <div className="bg-lime-400 h-full rounded-full" style={{ width: `${shoePercentage}%` }}></div>
          </div>

          <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400 mt-1.5">
            <span>{(shoeDistanceMeters / 1000).toFixed(1)} km logged</span>
            <span>{(shoeLimitMeters / 1000).toFixed(0)} km limit</span>
          </div>
        </div>

        {/* Biometrics List Card */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 shadow-xl shadow-black/30">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-1.5">
            <Activity size={13} className="text-lime-400" />
            Athlete Biometric Settings
          </h3>

          <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
            <div className="bg-zinc-950/40 p-2 rounded-xl border border-zinc-800">
              <span className="text-[8px] text-zinc-500 uppercase font-bold font-mono">Resting HR</span>
              <p className="text-xs font-black text-lime-400 font-mono mt-0.5">54 bpm</p>
            </div>
            <div className="bg-zinc-950/40 p-2 rounded-xl border border-zinc-800">
              <span className="text-[8px] text-zinc-500 uppercase font-bold font-mono">Weight</span>
              <p className="text-xs font-black text-white font-mono mt-0.5">68.2 kg</p>
            </div>
            <div className="bg-zinc-950/40 p-2 rounded-xl border border-zinc-800">
              <span className="text-[8px] text-zinc-500 uppercase font-bold font-mono">Height</span>
              <p className="text-xs font-black text-lime-400 font-mono mt-0.5">178 cm</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
