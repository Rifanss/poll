import React, { useState } from 'react';
import { QuestionDefinition, EmployeeData } from '../types';
import { ChevronRight, ChevronLeft, Check, AlertCircle, Send, CheckCircle2 } from 'lucide-react';

interface QuestionCardProps {
  question: QuestionDefinition;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer?: string;
  onSelectAnswer: (answer: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  employeeData?: EmployeeData;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  onNext,
  onPrev,
  onSubmit,
  isSubmitting = false
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const isOptional = question.isOptional ?? false;
  const isTextarea = question.type === 'textarea' || question.options.length === 0;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const handleProceed = () => {
    if (!isOptional && !selectedAnswer) {
      setErrorMessage('يرجى اختيار إجابة للمتابعة.');
      return;
    }
    setErrorMessage(null);
    if (isLastQuestion) {
      onSubmit();
    } else {
      onNext();
    }
  };

  const handleOptionClick = (option: string) => {
    onSelectAnswer(option);
    if (errorMessage) setErrorMessage(null);
  };

  return (
    <div id="survey-question-container" className="w-full max-w-xl mx-auto px-2 sm:px-4 py-2 sm:py-6" dir="rtl">
      {/* Main Question Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Progress Header */}
        <div className="p-2.5 sm:p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between text-[14px] sm:text-xs font-semibold mb-1.5 sm:mb-2">
            <span className="text-[#005A36] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#005A36]"></span>
              السؤال {currentIndex + 1} من {totalQuestions}
            </span>
            <span className="text-slate-500 font-mono">{progressPercent}%</span>
          </div>

          {/* Progress Bar */}
          <div
            className="w-full h-1.5 sm:h-2 bg-slate-200 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-gradient-to-l from-[#005A36] to-[#007A48] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question Text Body */}
        <div className="p-2.5 sm:p-5 space-y-2.5 sm:space-y-3.5">
          <h2 className="text-[14px] sm:text-base font-semibold text-slate-900 leading-snug sm:leading-relaxed">
            {question.question}
          </h2>

          {/* Optional Bullet Points (For Question 4) */}
          {question.bulletPoints && question.bulletPoints.length > 0 && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 sm:p-3 space-y-1">
              <span className="text-[12px] sm:text-[11px] font-semibold text-[#005A36] block">يشمل الإجراء المقترح:</span>
              <ul className="space-y-1 text-[13px] sm:text-xs text-slate-700">
                {question.bulletPoints.map((point, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Optional Subtext */}
          {question.subText && (
            <p className="text-[14px] sm:text-sm font-medium text-slate-700 leading-relaxed">
              {question.subText}
            </p>
          )}

          {/* Error Message if user attempted to proceed without selecting */}
          {errorMessage && (
            <div
              id="question-error-alert"
              className="flex items-center gap-2 p-2 sm:p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[14px] sm:text-xs font-semibold animate-shake"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Input Area: Either Textarea for open-ended question or Options List */}
          {isTextarea ? (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="inline-flex items-center gap-1 text-[#005A36] font-medium bg-[#005A36]/8 px-2.5 py-0.5 rounded-full text-[11px]">
                  مربع نص • إجابة اختيارية
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {(selectedAnswer || '').length} حرف
                </span>
              </div>
              <textarea
                id={`textarea-question-${question.id}`}
                rows={4}
                value={selectedAnswer || ''}
                onChange={(e) => {
                  onSelectAnswer(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={question.placeholder || 'اكتب ملاحظاتك أو مقترحاتك هنا (اختياري)...'}
                className="w-full p-3 text-[14px] sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005A36]/30 focus:border-[#005A36] outline-hidden text-slate-900 transition-all resize-none placeholder:text-slate-400 leading-relaxed"
              />
              <p className="text-[11px] text-slate-400 leading-tight">
                يمكنك كتابة مقترحاتك وتجاربك المهنية، أو الضغط على «إرسال الاستبيان» مباشرة للمتابعة دون كتابة.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 sm:space-y-2 pt-0.5 sm:pt-1">
              {question.options.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                return (
                  <button
                    key={idx}
                    id={`option-btn-${question.id}-${idx}`}
                    type="button"
                    onClick={() => handleOptionClick(option)}
                    className={`w-full min-h-[38px] sm:min-h-[48px] py-2 px-2.5 sm:p-3.5 text-right rounded-lg sm:rounded-xl border-2 transition-all flex items-center justify-between gap-2.5 text-[14px] sm:text-sm font-medium cursor-pointer select-none active:scale-[0.99] ${
                      isSelected
                        ? 'border-[#005A36] bg-[#005A36]/8 text-[#003620] shadow-xs ring-1 ring-[#005A36]'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <span className="leading-snug">{option}</span>
                    <div
                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'border-[#005A36] bg-[#005A36] text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigation Actions Footer */}
        <div className="p-2.5 sm:p-5 bg-slate-50/90 border-t border-slate-200 mt-auto flex items-center gap-2 sm:gap-3">
          {/* Previous Button */}
          <button
            id="btn-prev-question"
            type="button"
            onClick={onPrev}
            disabled={isSubmitting}
            className="flex-1 h-9 sm:h-12 flex items-center justify-center gap-1 px-2.5 sm:px-4 rounded-lg sm:rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-[13px] sm:text-sm hover:bg-slate-100 active:bg-slate-200 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{isFirstQuestion ? 'بيانات الموظف' : 'السابق'}</span>
          </button>

          {/* Next / Submit Button */}
          <button
            id={isLastQuestion ? 'btn-submit-survey' : 'btn-next-question'}
            type="button"
            onClick={handleProceed}
            disabled={isSubmitting}
            className="flex-2 h-9 sm:h-12 flex items-center justify-center gap-1.5 px-3 sm:px-5 rounded-lg sm:rounded-xl font-semibold text-[13px] sm:text-sm transition-all shadow-xs cursor-pointer active:scale-[0.99] bg-[#005A36] hover:bg-[#00482B] text-white disabled:bg-slate-400"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>جاري الإرسال...</span>
              </span>
            ) : isLastQuestion ? (
              <>
                <span>إرسال الاستبيان</span>
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </>
            ) : (
              <>
                <span>التالي</span>
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Helpful Guidance Tip */}
      <div className="mt-2 text-center text-[10px] sm:text-xs text-slate-500">
        يتم حفظ إجاباتك تلقائيًا أثناء التنقل بين الأسئلة
      </div>
    </div>
  );
};
