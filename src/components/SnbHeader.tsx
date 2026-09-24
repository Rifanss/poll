import React from 'react';
import { SnbLogo } from './SnbLogo';
import { ArrowRight } from 'lucide-react';

export type AppView = 'cpf-validation' | 'survey' | 'admin';

interface SnbHeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  isAdminLoggedIn?: boolean;
}

export const SnbHeader: React.FC<SnbHeaderProps> = ({
  currentView,
  onNavigate
}) => {
  return (
    <header
      id="snb-main-header"
      className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 shadow-xs safe-top"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-2">
        {/* Logo with clear spacing above the divider */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => onNavigate('cpf-validation')}
            className="cursor-pointer flex items-center gap-2"
          >
            <SnbLogo showText={false} />
          </div>
        </div>

        {/* Far Left in Header: Survey Presenter and Admin Navigation */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="text-[11px] sm:text-xs font-semibold text-slate-700 bg-slate-50/90 border border-slate-200/80 rounded-lg px-2.5 py-1 sm:py-1.5 shadow-2xs whitespace-nowrap select-none">
            <span>مقدم الإستبيان : </span>
            <span className="font-bold text-[#005A36]" dir="ltr">Majed Alsufyani</span>
          </div>

          {currentView === 'admin' && (
            <button
              id="btn-goto-survey"
              type="button"
              onClick={() => onNavigate('cpf-validation')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#005A36] bg-[#005A36]/10 hover:bg-[#005A36]/15 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              title="العودة للاستبيان"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة للاستبيان</span>
            </button>
          )}
        </div>
      </div>

      {/* Subtle SNB Brand Accent Stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-[#003620] via-[#005A36] to-[#C5A059]" />
    </header>
  );
};
