import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle, Zap, ShieldAlert, Award } from "lucide-react";
import { NotificationAlert } from "../types";

interface NotificationToastProps {
  alerts: NotificationAlert[];
  onDismiss: (id: string) => void;
}

export default function NotificationToast({ alerts, onDismiss }: NotificationToastProps) {
  // Take only the 3 most recent active alerts to avoid cluttering the screen
  const visibleAlerts = alerts.slice(-3);

  return (
    <div className="absolute top-4 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {visibleAlerts.map((alert) => (
          <ToastCard 
            key={alert.id} 
            alert={alert} 
            onDismiss={() => onDismiss(alert.id)} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ alert, onDismiss }: { alert: NotificationAlert; onDismiss: () => void; key?: string }) {
  // Auto-dismiss after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);

    return () => clearTimeout(timer);
  }, [alert.id, onDismiss]);

  const getIconAndColors = () => {
    switch (alert.type) {
      case 'lap_complete':
        return {
          icon: <Zap size={16} className="text-lime-400" />,
          borderColor: "border-lime-500/30",
          glowColor: "shadow-lime-950/20",
          badgeColor: "bg-lime-500/10 text-lime-400"
        };
      case 'milestone':
        return {
          icon: <Award size={16} className="text-cyan-400" />,
          borderColor: "border-cyan-500/30",
          glowColor: "shadow-cyan-950/20",
          badgeColor: "bg-cyan-500/10 text-cyan-400"
        };
      case 'info':
      default:
        return {
          icon: <CheckCircle size={16} className="text-slate-400" />,
          borderColor: "border-slate-800",
          glowColor: "shadow-black/20",
          badgeColor: "bg-slate-800 text-slate-300"
        };
    }
  };

  const { icon, borderColor, glowColor, badgeColor } = getIconAndColors();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={`pointer-events-auto w-full bg-slate-900/95 backdrop-blur-md border ${borderColor} rounded-2xl p-3.5 shadow-xl ${glowColor} flex items-start gap-3 relative overflow-hidden`}
    >
      {/* Dynamic Progress indicator bar at bottom of toast */}
      <motion.div 
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 4.5, ease: "linear" }}
        className="absolute bottom-0 left-0 h-1 bg-lime-400"
      />

      {/* Alert Icon */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${badgeColor}`}>
        {icon}
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0 pr-4">
        <h4 className="text-xs font-black text-white tracking-wide uppercase font-display leading-tight">
          {alert.message}
        </h4>
        {alert.subMessage && (
          <p className="text-[11px] font-mono text-slate-300 mt-1 leading-snug">
            {alert.subMessage}
          </p>
        )}
      </div>

      {/* Manual Dismiss Cross */}
      <button 
        onClick={onDismiss}
        className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800 cursor-pointer shrink-0"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}
