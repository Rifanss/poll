import React from 'react';
import { CheckCircle2, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { EmployeeData } from '../types';

interface SubmissionSuccessViewProps {
  responseId: string;
  employeeData: EmployeeData;
  onReset: () => void;
  onGoToAdmin?: () => void;
}

export const SubmissionSuccessView: React.FC<SubmissionSuccessViewProps> = ({
  responseId,
  employeeData,
  onReset,
  onGoToAdmin
}) => {
  return (
    <div id="survey-success-screen" className="w-full max-w-lg mx-auto px-2 sm:px-4 py-4 sm:py-8" dir="rtl">
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-center p-4 sm:p-8">
        {/* Success Icon */}
        <div className="w-14 h-14 sm:w-20 sm:h-20 bg-emerald-50 border-3 sm:border-4 border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-5 text-[#005A36] shadow-xs">
          <CheckCircle2 className="w-7 h-7 sm:w-10 sm:h-10 stroke-[2.5]" />
        </div>

        {/* Headings */}
        <h1 className="text-lg sm:text-2xl font-bold text-slate-900 mb-1.5 sm:mb-3 tracking-tight">
          تم إرسال الاستبيان بنجاح
        </h1>

        <p className="text-slate-600 text-[14px] sm:text-base leading-relaxed mb-4 sm:mb-6 font-normal max-w-md mx-auto">
          شكرًا لمشاركتكم ووقتكم، ونقدّر خبراتكم وملاحظاتكم المهنية.
        </p>

        {/* Reference & Confirmation Card */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-lg sm:rounded-xl p-3 sm:p-4 text-right mb-4 text-[13px] sm:text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 sm:pb-2">
            <span className="text-slate-500 font-medium">رقم الاستجابة المرجعي:</span>
            <span className="font-mono font-bold text-[#005A36] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[12px] sm:text-xs">
              {responseId || 'CPF-CONFIRMED'}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 sm:pb-2">
            <span className="text-slate-500 font-medium">الاسم:</span>
            <span className="font-semibold text-slate-800">{employeeData.employeeName}</span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 sm:pb-2">
            <span className="text-slate-500 font-medium">الادارة / الوكالة:</span>
            <span className="text-slate-800 font-medium">{employeeData.department}</span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 sm:pb-2">
            <span className="text-slate-500 font-medium">المسمى الوظيفي:</span>
            <span className="bg-[#005A36]/10 text-[#005A36] font-semibold px-2 py-0.5 rounded text-[11px]">
              {employeeData.jobTitle}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 sm:pb-2">
            <span className="text-slate-500 font-medium">المرحلة:</span>
            <div className="flex flex-wrap gap-1 justify-end">
              {employeeData.stages.map((stg) => (
                <span key={stg} className="bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                  {stg}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 sm:pb-2">
            <span className="text-slate-500 font-medium">المنتج:</span>
            <div className="flex flex-wrap gap-1 justify-end">
              {employeeData.products.map((prd) => (
                <span key={prd} className="bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                  {prd}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-slate-500 pt-0.5">
            <span>حالة السجل:</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-[12px] sm:text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              تم التوثيق في قاعدة البيانات
            </span>
          </div>
        </div>

        {/* Guidance Note */}
        <div className="p-2.5 sm:p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-lg text-emerald-800 text-[13px] sm:text-xs mb-4 text-right flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#005A36] mt-0.5" />
          <p className="leading-relaxed">
            سيتم تضمين مرئياتكم ضمن تقرير دراسة الجدوى وتطوير نموذج ومصفوفة (CPF™️) لإدارة حالات التعثر بقطاع التحصيل.
          </p>
        </div>

        {/* Action Button */}
        <div className="space-y-2">
          <button
            id="btn-new-survey-response"
            type="button"
            onClick={onReset}
            className="w-full h-10 sm:h-11 flex items-center justify-center gap-1.5 px-3 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[13px] sm:text-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>تعبئة استجابة جديدة</span>
          </button>
        </div>
      </div>
    </div>
  );
};
