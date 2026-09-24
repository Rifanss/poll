import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

// End date: 26/09/2026 at 11:59 PM (23:59:00) Saudi Arabia Time (Asia/Riyadh, UTC+3)
const TARGET_DEADLINE_MS = new Date('2026-09-26T23:59:00+03:00').getTime();

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

const calculateTimeRemaining = (): TimeRemaining => {
  const now = Date.now();
  const diff = TARGET_DEADLINE_MS - now;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false
  };
};

export const SurveyCountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(calculateTimeRemaining);

  useEffect(() => {
    setTimeLeft(calculateTimeRemaining());

    const timer = setInterval(() => {
      const updated = calculateTimeRemaining();
      setTimeLeft(updated);
      if (updated.isExpired) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  const timerUnits = [
    { label: 'الأيام', value: formatNumber(timeLeft.days) },
    { label: 'الساعات', value: formatNumber(timeLeft.hours) },
    { label: 'الدقائق', value: formatNumber(timeLeft.minutes) },
    { label: 'الثواني', value: formatNumber(timeLeft.seconds) }
  ];

  return (
    <section aria-label="الوقت المتبقي للمشاركة في الاستبيان" className="w-full">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden relative">
        {/* Subtle Top Brand Accent Line */}
        <div className="h-1.5 bg-gradient-to-r from-[#003620] via-[#005A36] to-[#C5A059]" />

        <div className="p-4 sm:p-5">
          {/* Header Row: Title & Subtitle */}
          <div className="pb-3 mb-3 border-b border-slate-100">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
              الوقت المتبقي للمشاركة في الاستبيان
            </h2>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500">
              ينتهي في 26/09/2026 الساعة 11:59 مساءً (توقيت السعودية)
            </span>
          </div>

          {/* Countdown Boxes: 4 Equal Units (RTL: Days -> Hours -> Minutes -> Seconds) */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {timerUnits.map((unit) => (
              <div
                key={unit.label}
                className="bg-slate-50/90 hover:bg-slate-50 border border-slate-200/80 rounded-xl py-2.5 sm:py-3.5 px-1 sm:px-2 text-center flex flex-col items-center justify-center shadow-2xs transition-colors"
              >
                {/* English Numbers (0-9), large and clear font */}
                <span className="font-mono text-xl sm:text-3xl font-extrabold text-[#005A36] leading-none mb-1 sm:mb-1.5 tracking-tight">
                  {unit.value}
                </span>
                {/* Arabic Unit Name */}
                <span className="text-[10px] sm:text-xs font-bold text-slate-600 leading-none">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>

          {/* Expired Message State */}
          {timeLeft.isExpired && (
            <div className="mt-3.5 p-2.5 sm:p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs sm:text-sm font-bold text-center flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>انتهت فترة المشاركة في الاستبيان.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
