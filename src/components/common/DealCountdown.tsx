import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface DealCountdownProps {
  endDate: string; // YYYY-MM-DD
  endTime: string; // HH:mm
  className?: string;
  variant?: 'badge' | 'card' | 'banner';
}

export const DealCountdown: React.FC<DealCountdownProps> = ({
  endDate,
  endTime,
  className = '',
  variant = 'badge',
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      try {
        const [hours, minutes] = endTime.split(':').map(Number);
        const target = new Date(`${endDate}T${String(hours || 23).padStart(2, '0')}:${String(minutes || 59).padStart(2, '0')}:00`);
        const now = new Date();
        const diff = target.getTime() - now.getTime();

        if (diff <= 0) {
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
          return;
        }

        const totalSecs = Math.floor(diff / 1000);
        const h = Math.floor(totalSecs / 3600);
        const m = Math.floor((totalSecs % 3600) / 60);
        const s = totalSecs % 60;

        setTimeLeft({ hours: h, minutes: m, seconds: s, isExpired: false });
      } catch (err) {
        setTimeLeft({ hours: 4, minutes: 21, seconds: 36, isExpired: false });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [endDate, endTime]);

  if (timeLeft.isExpired) {
    return (
      <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
        Deal Expired
      </span>
    );
  }

  const format2 = (num: number) => String(num).padStart(2, '0');

  if (variant === 'card' || variant === 'banner') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <div className="flex items-center text-xs font-medium text-emerald-950 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
          <Clock className="w-3.5 h-3.5 mr-1.5 text-rose-500 animate-pulse" />
          <span className="text-[11px] font-bold text-emerald-900 mr-2 uppercase tracking-wider">Ends in:</span>
          <div className="flex items-center font-mono font-black text-emerald-950">
            <span className="bg-white px-2 py-0.5 rounded-md text-xs shadow-2xs border border-emerald-100">{format2(timeLeft.hours)}</span>
            <span className="mx-0.5 font-bold text-emerald-700">:</span>
            <span className="bg-white px-2 py-0.5 rounded-md text-xs shadow-2xs border border-emerald-100">{format2(timeLeft.minutes)}</span>
            <span className="mx-0.5 font-bold text-emerald-700">:</span>
            <span className="bg-white px-2 py-0.5 rounded-md text-xs shadow-2xs text-rose-600 border border-emerald-100">{format2(timeLeft.seconds)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1 text-xs font-medium text-emerald-950 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full ${className}`}>
      <Clock className="w-3 h-3 text-rose-500 animate-pulse" />
      <span className="text-[10px] font-bold uppercase text-emerald-800">Ends in</span>
      <span className="font-mono font-bold text-emerald-950">
        {format2(timeLeft.hours)}:{format2(timeLeft.minutes)}:{format2(timeLeft.seconds)}
      </span>
    </div>
  );
};
