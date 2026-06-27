import { useState } from "react";
import { motion } from "motion/react";
import { 
  Activity, 
  History, 
  User, 
  Radio, 
  Info, 
  Flame, 
  Zap, 
  Award, 
  MapPin, 
  Clock,
  Compass
} from "lucide-react";
import LiveDashboard from "./components/LiveDashboard";
import HistoryTab from "./components/HistoryTab";
import ProfileTab from "./components/ProfileTab";
import NotificationToast from "./components/NotificationToast";
import { RunSession, AthleteProfile, NotificationAlert } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<'live' | 'history' | 'profile'>('live');
  const [activeAlerts, setActiveAlerts] = useState<NotificationAlert[]>([]);

  // Pre-seed mock data for completed workouts
  const [sessions, setSessions] = useState<RunSession[]>([
    {
      id: "sess_1",
      name: "Benchakitti Lake Sunrise Loop",
      date: "Thu, Jun 25, 2026",
      totalTimeMs: 16 * 60 * 1000 + 12 * 1000 + 450, // 16:12.45
      totalDistanceMeters: 4000,
      averagePace: "04:03 /km",
      caloriesBurned: 272,
      laps: [
        { id: 101, lapNumber: 1, timeMs: 4 * 60 * 1000 + 8 * 1000, distanceMeters: 1000, averagePace: "04:08 /km", timestamp: "06:12 AM" },
        { id: 102, lapNumber: 2, timeMs: 4 * 60 * 1000 + 5 * 1000, distanceMeters: 1000, averagePace: "04:05 /km", timestamp: "06:16 AM" },
        { id: 103, lapNumber: 3, timeMs: 4 * 60 * 1000 + 2 * 1000, distanceMeters: 1000, averagePace: "04:02 /km", timestamp: "06:20 AM" },
        { id: 104, lapNumber: 4, timeMs: 3 * 60 * 1000 + 57 * 1000 + 450, distanceMeters: 1000, averagePace: "03:57 /km", timestamp: "06:24 AM" }
      ]
    },
    {
      id: "sess_2",
      name: "Lumphini Park Afternoon Tempo",
      date: "Sun, Jun 21, 2026",
      totalTimeMs: 12 * 60 * 1000 + 48 * 1000 + 210, // 12:48.21
      totalDistanceMeters: 3000,
      averagePace: "04:16 /km",
      caloriesBurned: 204,
      laps: [
        { id: 201, lapNumber: 1, timeMs: 4 * 60 * 1000 + 20 * 1000, distanceMeters: 1000, averagePace: "04:20 /km", timestamp: "05:32 PM" },
        { id: 202, lapNumber: 2, timeMs: 4 * 60 * 1000 + 15 * 1000, distanceMeters: 1000, averagePace: "04:15 /km", timestamp: "05:36 PM" },
        { id: 203, lapNumber: 3, timeMs: 4 * 60 * 1000 + 13 * 1000 + 210, distanceMeters: 1000, averagePace: "04:13 /km", timestamp: "05:40 PM" }
      ]
    }
  ]);

  // Pre-seed Athlete profile
  const [athleteProfile, setAthleteProfile] = useState<AthleteProfile>({
    name: "Thanatawee T.",
    level: "CLUB PRO",
    homeParkrun: "Benchakitti Park Run",
    totalRuns: 34,
    totalDistanceKm: 154.2,
    vo2Max: 54.8,
    personalBests: [
      { distance: "1,000m Sprint", time: "03:08", pace: "03:08 /km", date: "Jan 12, 2026" },
      { distance: "5K Parkrun", time: "18:24", pace: "03:40 /km", date: "Apr 05, 2026" },
      { distance: "10K Classic", time: "39:12", pace: "03:55 /km", date: "Jun 02, 2026" }
    ]
  });

  // Helper to append notification alerts
  const addAlert = (alert: NotificationAlert) => {
    setActiveAlerts(prev => [...prev, alert]);
  };

  const dismissAlert = (id: string) => {
    setActiveAlerts(prev => prev.filter(item => item.id !== id));
  };

  // Callback when a workout session is finalized and saved
  const handleSessionComplete = (newSession: RunSession) => {
    // Add to history list at the top
    setSessions(prev => [newSession, ...prev]);

    // Update athlete profile statistics
    const kmAdded = newSession.totalDistanceMeters / 1000;
    setAthleteProfile(prev => ({
      ...prev,
      totalRuns: prev.totalRuns + 1,
      totalDistanceKm: prev.totalDistanceKm + kmAdded
    }));

    // Auto navigate to History Tab to view the log
    setActiveTab('history');
  };

  const handleClearHistory = () => {
    setSessions([]);
    setAthleteProfile(prev => ({
      ...prev,
      totalRuns: 0,
      totalDistanceKm: 0
    }));
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex flex-col lg:flex-row items-center justify-center p-0 lg:p-8 font-sans antialiased text-white selection:bg-lime-400 selection:text-zinc-950 overflow-x-hidden">
      
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-lime-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-lime-500/2 rounded-full blur-[120px]" />
      </div>

      {/* Main Container Wrapper */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center">

        {/* Center: Smartphone Device Mockup Shell */}
        <div className="w-[375px] h-[760px] bg-black rounded-[48px] border-[8px] border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col shrink-0">
          
          {/* Smartphone Hardware Notch (Dynamic Island) / Notch Placeholder */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-50 flex items-center justify-center">
            <div className="w-16 h-1.5 bg-zinc-900 rounded-full" />
          </div>

          {/* Toast Notification Mount point (inside the frame!) */}
          <NotificationToast 
            alerts={activeAlerts} 
            onDismiss={dismissAlert} 
          />

          {/* Native Smartphone Screen Inner Canvas */}
          <div className="flex-1 w-full pt-10 pb-20 relative overflow-hidden flex flex-col bg-zinc-950">
            {activeTab === 'live' && (
              <LiveDashboard 
                onSessionComplete={handleSessionComplete}
                activeAlerts={activeAlerts}
                addAlert={addAlert}
              />
            )}

            {activeTab === 'history' && (
              <HistoryTab 
                sessions={sessions}
                onClearHistory={handleClearHistory}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileTab 
                profile={athleteProfile}
              />
            )}
          </div>

          {/* Premium Bottom Navigation bar (fixed inside mobile bezel) */}
          <div className="absolute bottom-0 left-0 w-full h-20 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 flex items-center justify-around px-8 pb-4 z-40">
            {/* Live tab button */}
            <button
              id="nav-tab-live"
              onClick={() => setActiveTab('live')}
              className={`flex flex-col items-center gap-1 transition-all relative cursor-pointer ${
                activeTab === 'live' ? "text-lime-400 scale-105 font-bold" : "text-zinc-500 opacity-60 hover:opacity-100"
              }`}
            >
              <Activity size={18} />
              <span className="text-[10px] font-bold tracking-wider font-display uppercase">Live</span>
              {activeTab === 'live' && (
                <motion.div 
                  layoutId="activeGlow" 
                  className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-lime-400 shadow-sm shadow-lime-400" 
                />
              )}
            </button>

            {/* History tab button */}
            <button
              id="nav-tab-history"
              onClick={() => setActiveTab('history')}
              className={`flex flex-col items-center gap-1 transition-all relative cursor-pointer ${
                activeTab === 'history' ? "text-lime-400 scale-105 font-bold" : "text-zinc-500 opacity-60 hover:opacity-100"
              }`}
            >
              <History size={18} />
              <span className="text-[10px] font-bold tracking-wider font-display uppercase">History</span>
              {activeTab === 'history' && (
                <motion.div 
                  layoutId="activeGlow" 
                  className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-lime-400 shadow-sm shadow-lime-400" 
                />
              )}
            </button>

            {/* Profile tab button */}
            <button
              id="nav-tab-profile"
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center gap-1 transition-all relative cursor-pointer ${
                activeTab === 'profile' ? "text-lime-400 scale-105 font-bold" : "text-zinc-500 opacity-60 hover:opacity-100"
              }`}
            >
              <User size={18} />
              <span className="text-[10px] font-bold tracking-wider font-display uppercase">Profile</span>
              {activeTab === 'profile' && (
                <motion.div 
                  layoutId="activeGlow" 
                  className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-lime-400 shadow-sm shadow-lime-400" 
                />
              )}
            </button>
          </div>

          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-zinc-800 rounded-full pointer-events-none z-50"></div>
        </div>

        {/* Micro mobile support: simple instruction tip visible ONLY on mobile screens */}
        <div className="flex lg:hidden flex-col text-center px-6 pb-6 gap-3 max-w-sm mt-3">
          <p className="text-xs text-zinc-500 leading-relaxed">
            💡 Tap <strong className="text-lime-400">Live</strong> to start, adjust simulation speeds to fast-forward progress, and tap <strong className="text-white">Profile</strong> or <strong className="text-white">History</strong> to see logs and specs.
          </p>
          <span className="text-[9px] font-mono text-zinc-600">
            Runner Account: t.thanatawee@gmail.com
          </span>
        </div>

      </div>
    </div>
  );
}
