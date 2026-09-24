import React, { useState, useEffect } from 'react';
import { SurveyCountdownTimer } from './SurveyCountdownTimer';
import {
  CPF_DIMENSIONS,
  CPF_QUESTIONS,
  EXPERIENCE_YEARS_OPTIONS,
  PORTFOLIO_TYPE_OPTIONS,
  CpfDimensionDefinition,
  CpfQuestionItem
} from '../data/cpfValidationQuestions';
import {
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Send,
  RotateCcw
} from 'lucide-react';

interface CpfValidationSurveyViewProps {
  onGoToAdmin?: () => void;
}

interface FormState {
  answers: Record<number, { score: number; label: string }>;
  experienceYears: string;
  portfolioType: string;
}

type FlowStep =
  | { type: 'demographics' }
  | { type: 'dimension-intro'; dimensionId: number }
  | { type: 'question'; questionId: number };

const SURVEY_FLOW: FlowStep[] = [
  { type: 'demographics' },
  { type: 'dimension-intro', dimensionId: 1 },
  { type: 'question', questionId: 1 },
  { type: 'question', questionId: 2 },
  { type: 'question', questionId: 3 },
  { type: 'dimension-intro', dimensionId: 2 },
  { type: 'question', questionId: 4 },
  { type: 'question', questionId: 5 },
  { type: 'dimension-intro', dimensionId: 3 },
  { type: 'question', questionId: 6 },
  { type: 'question', questionId: 7 },
  { type: 'dimension-intro', dimensionId: 4 },
  { type: 'question', questionId: 8 },
  { type: 'question', questionId: 9 },
  { type: 'question', questionId: 10 }
];

const STORAGE_KEY = 'snb_cpf_validation_survey_draft_v3';
const FLOW_INDEX_STORAGE_KEY = 'snb_cpf_validation_survey_flow_v3';

const DIMENSION_CARD_IMAGES: Record<number, string | null> = {
  1: '/images/dimension-1.jpg',
  2: '/images/dimension-2.jpg',
  3: '/images/dimension-3.jpg',
  4: '/images/dimension-4.jpg'
};

export const CpfValidationSurveyView: React.FC<CpfValidationSurveyViewProps> = ({
  onGoToAdmin
}) => {
  // Current step in the flow
  const [currentFlowIndex, setCurrentFlowIndex] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedIndex = localStorage.getItem(FLOW_INDEX_STORAGE_KEY);
        if (savedIndex !== null) {
          const parsed = parseInt(savedIndex, 10);
          if (!isNaN(parsed) && parsed >= 0 && parsed < SURVEY_FLOW.length) {
            return parsed;
          }
        }
      } catch (e) {
        // ignore
      }
    }
    return 0;
  });

  // Survey Form State
  const [formState, setFormState] = useState<FormState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            answers: parsed.answers || {},
            experienceYears: parsed.experienceYears || '',
            portfolioType: parsed.portfolioType || ''
          };
        }
      } catch (e) {
        console.error('Failed to parse local draft:', e);
      }
    }
    return {
      answers: {},
      experienceYears: '',
      portfolioType: ''
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    id: string;
    submittedAt: string;
  } | null>(null);

  // Validation error for current step
  const [currentStepError, setCurrentStepError] = useState<string | null>(null);

  // Auto-save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && !submissionSuccess) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formState));
        localStorage.setItem(FLOW_INDEX_STORAGE_KEY, currentFlowIndex.toString());
      } catch (e) {
        // ignore
      }
    }
  }, [formState, currentFlowIndex, submissionSuccess]);

  // Answer selection handler
  const handleSelectOption = (questionId: number, score: number, label: string) => {
    setFormState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: { score, label }
      }
    }));
    setCurrentStepError(null);
    setSubmissionError(null);
  };

  const handleDemographicChange = (
    field: 'experienceYears' | 'portfolioType',
    value: string
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value
    }));
    setCurrentStepError(null);
    setSubmissionError(null);
  };

  const navigateToFlowIndex = (targetIndex: number) => {
    setCurrentStepError(null);
    setSubmissionError(null);
    setCurrentFlowIndex(targetIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 0 validation: proceed to Dimension 1
  const handleNextFromDemographics = () => {
    if (!formState.experienceYears) {
      setCurrentStepError('يرجى اختيار سنوات الخبرة في مجال التحصيل للمتابعة.');
      return;
    }
    if (!formState.portfolioType) {
      setCurrentStepError('يرجى اختيار نوع المحفظة الأساسية للمتابعة.');
      return;
    }

    navigateToFlowIndex(1);
  };

  // Next from Dimension Card
  const handleNextFromDimensionIntro = () => {
    navigateToFlowIndex(currentFlowIndex + 1);
  };

  // Next from a Question Card
  const handleNextFromQuestion = (questionId: number) => {
    if (!formState.answers[questionId]) {
      setCurrentStepError('يرجى اختيار إجابة للسؤال للمتابعة إلى الخطوة التالية.');
      return;
    }

    navigateToFlowIndex(currentFlowIndex + 1);
  };

  // Final Submit Handler (on Question 10)
  const handleSubmitSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate Q10
    if (!formState.answers[10]) {
      setCurrentStepError('يرجى اختيار إجابة للسؤال الأخير لإتمام إرسال الاستبيان.');
      return;
    }

    // Verify all 10 questions and demographics
    for (const q of CPF_QUESTIONS) {
      if (!formState.answers[q.id]) {
        setSubmissionError(`يرجى استكمال السؤال رقم ${q.id} قبل إرسال الاستبيان.`);
        return;
      }
    }

    if (!formState.experienceYears || !formState.portfolioType) {
      setSubmissionError('يرجى التأكد من استكمال كافة بيانات الخبرة المهنية.');
      return;
    }

    setCurrentStepError(null);
    setSubmissionError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        q1Score: formState.answers[1].score,
        q1Text: formState.answers[1].label,
        q2Score: formState.answers[2].score,
        q2Text: formState.answers[2].label,
        q3Score: formState.answers[3].score,
        q3Text: formState.answers[3].label,
        q4Score: formState.answers[4].score,
        q4Text: formState.answers[4].label,
        q5Score: formState.answers[5].score,
        q5Text: formState.answers[5].label,
        q6Score: formState.answers[6].score,
        q6Text: formState.answers[6].label,
        q7Score: formState.answers[7].score,
        q7Text: formState.answers[7].label,
        q8Score: formState.answers[8].score,
        q8Text: formState.answers[8].label,
        q9Score: formState.answers[9].score,
        q9Text: formState.answers[9].label,
        q10Score: formState.answers[10].score,
        q10Text: formState.answers[10].label,
        experienceYears: formState.experienceYears,
        portfolioType: formState.portfolioType
      };

      const res = await fetch('/api/cpf-validation/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(FLOW_INDEX_STORAGE_KEY);
        setSubmissionSuccess({
          id: data.id,
          submittedAt: data.submittedAt
        });
      } else {
        setSubmissionError(data.error || 'حدث خطأ أثناء حفظ الاستبيان. يرجى إعادة المحاولة.');
      }
    } catch (err) {
      console.error(err);
      setSubmissionError('تعذر الاتصال بالخادم، يرجى التأكد من الاتصال بالإنترنت والمحاولة مجددًا.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartNewSurvey = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(FLOW_INDEX_STORAGE_KEY);
    setFormState({
      answers: {},
      experienceYears: '',
      portfolioType: ''
    });
    setCurrentFlowIndex(0);
    setSubmissionSuccess(null);
    setSubmissionError(null);
    setCurrentStepError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Success view
  if (submissionSuccess) {
    return (
      <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-8" dir="rtl">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center">
          <div className="w-16 h-16 bg-[#005A36]/10 text-[#005A36] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            تم إرسال الاستبيان بنجاح
          </h2>
          <p className="text-slate-600 text-sm max-w-lg mx-auto leading-relaxed mb-6">
            شكرًا جزيلاً على مشاركتك ومساهمتك بخبرتك العملية في التحقق المبدئي من إطار
            <span className="font-semibold text-[#005A36]"> Collection Persona Framework™ (CPF™)</span>.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md mx-auto mb-6 text-right space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">رقم الاستجابة المعتمد:</span>
              <span className="font-mono font-bold text-[#005A36] bg-white px-2.5 py-1 rounded border border-slate-200">
                {submissionSuccess.id}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">تاريخ ووقت الإرسال:</span>
              <span className="font-mono text-slate-700">
                {new Date(submissionSuccess.submittedAt).toLocaleString('ar-SA')}
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleStartNewSurvey}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#005A36] hover:bg-[#00482B] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>تعبئة استجابة جديدة</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentFlowStep = SURVEY_FLOW[currentFlowIndex] || SURVEY_FLOW[0];

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6" dir="rtl">
      {/* Alert Error Messages */}
      {(currentStepError || submissionError) && (
        <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm flex items-start gap-2.5 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1 leading-relaxed font-medium">
            <span>{currentStepError || submissionError}</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CASE 1: DEMOGRAPHICS (Step 0) */}
      {/* ========================================================================= */}
      {currentFlowStep.type === 'demographics' && (
        <div className="space-y-4">
          {/* Section: Survey Expiry Countdown Timer (الوقت المتبقي للمشاركة في الاستبيان) */}
          <SurveyCountdownTimer />

          {/* Main Intro Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Banner */}
            <div className="bg-[#005A36] text-white p-5 sm:p-7 relative">
              <div className="absolute top-0 left-0 w-40 h-full bg-white/5 skew-x-12 pointer-events-none" />
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white leading-snug">
                <span className="block mb-1 text-white">استبيان التحقق المبدئي من :</span>
                <span className="block text-emerald-100 font-bold text-base sm:text-xl">
                  Collection Persona Framework™ (CPF™)
                </span>
              </h1>
            </div>

            {/* Intro Body Text */}
            <div className="p-5 sm:p-6 bg-slate-50/70 text-slate-800 text-xs sm:text-sm font-bold leading-relaxed space-y-3.5">
              <p className="text-slate-800 leading-relaxed font-bold">
                ضمن العمل على تطوير Collection Persona Framework (CPF)، نشارككم هذا الاستبيان للاستفادة من خبراتكم العملية في التحصيل، كمتطلب للتحقق المبدئي من مدى ملاءمة مفهوم الفكرة لواقع التعامل مع العملاء المتعثرين واحتياجات العمل التحصيلي.
              </p>
              <p className="text-slate-800 leading-relaxed font-bold">
                تقوم الفكرة على أن حالات التعثر قد تتشابه في بعض المؤشرات، مثل قيمة المديونية أو مدة التعثر، بينما تختلف في عوامل أخرى مؤثرة في التعامل التحصيلي، وهو ما تسعى فكرة CPF إلى دراسته والاستفادة منه بصورة أكثر تنظيمًا في عملية التحصيل.
              </p>
              <p className="text-slate-800 leading-relaxed font-bold">
                يهدف هذا الاستبيان إلى الاستفادة من خبرتك العملية في التحصيل، والتحقق من مدى ملاءمة فكرة تصنيف محفظة العملاء المتعثرين إلى أنماط مختلفة بناءً على خصائص كل حالة، مثل القدرة على السداد، والالتزام بوعود السداد، ومستوى التفاعل، والظروف المالية، ثم الاستفادة من هذا التصنيف في تحديد الإجراء التحصيلي الأكثر ملاءمة لكل عميل، ومدى توافق ذلك مع واقع عملك وتواصلك مع العملاء ضمن المحفظة المسندة إليك، ودوره في دعم قراراتك كمحصّل عند التعامل مع كل حالة.
              </p>
              <p className="text-slate-800 font-bold leading-relaxed pt-1.5 border-t border-slate-200/80">
                مشاركتك وخبرتك العملية ستسهم في تقييم الفكرة وتطويرها بما يتوافق مع واقع واحتياجات العمل التحصيلي.
              </p>
            </div>
          </div>

          {/* Compact Demographics Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-[#005A36] px-4 sm:px-5 py-3 border-b border-[#00482B]">
              <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                بيانات الخبرة المهنية
              </h2>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              {/* Question 1: Years of experience (Dropdown) */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold text-slate-800">
                  سنوات الخبرة في مجال التحصيل:
                  <span className="text-red-500 mr-1">*</span>
                </label>
                <div className="relative w-full sm:max-w-xs">
                  <select
                    value={formState.experienceYears}
                    onChange={(e) => handleDemographicChange('experienceYears', e.target.value)}
                    className="w-full appearance-none px-4 py-3 bg-white border-2 border-slate-200 hover:border-[#005A36]/60 focus:border-[#005A36] text-slate-800 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer focus:outline-hidden focus:ring-4 focus:ring-[#005A36]/10 pl-10"
                  >
                    <option value="">اختر...</option>
                    {EXPERIENCE_YEARS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Question 2: Portfolio type (Dropdown) */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold text-slate-800">
                  نوع المحفظة التي تتعامل معها بشكل أساسي:
                  <span className="text-red-500 mr-1">*</span>
                </label>
                <div className="relative w-full sm:max-w-xs">
                  <select
                    value={formState.portfolioType}
                    onChange={(e) => handleDemographicChange('portfolioType', e.target.value)}
                    className="w-full appearance-none px-4 py-3 bg-white border-2 border-slate-200 hover:border-[#005A36]/60 focus:border-[#005A36] text-slate-800 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer focus:outline-hidden focus:ring-4 focus:ring-[#005A36]/10 pl-10"
                  >
                    <option value="">اختر...</option>
                    {PORTFOLIO_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Action Button: Navigate to Dimension 1 */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextFromDemographics}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-[#005A36] hover:bg-[#00482B] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                >
                  <span>الانتقال إلى البعد الأول</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CASE 2: LARGE DIMENSION CARD (صور عناوين الأبعاد بالحجم الكبير وبدون بطاقة خلفها) */}
      {/* ========================================================================= */}
      {currentFlowStep.type === 'dimension-intro' && (() => {
        const dimension = CPF_DIMENSIONS.find((d) => d.id === currentFlowStep.dimensionId);
        if (!dimension) return null;

        const cardImage = DIMENSION_CARD_IMAGES[dimension.id];

        return (
          <div className="w-full flex flex-col items-center justify-center space-y-4 sm:space-y-6">
            {/* Attached Graphic Dimension Card - Large & Standalone */}
            {cardImage ? (
              <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-md sm:shadow-lg border border-slate-200/90 transition-all duration-300 bg-white">
                <img
                  src={cardImage}
                  alt={dimension.title}
                  className="w-full h-auto object-contain block mx-auto"
                  loading="eager"
                />
              </div>
            ) : (
              <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-md sm:shadow-lg bg-gradient-to-br from-[#003620] via-[#005A36] to-[#00482B] p-10 sm:p-16 text-white relative flex flex-col items-center justify-center min-h-[300px] sm:min-h-[360px] border border-emerald-800 text-center">
                <div className="absolute top-0 left-0 right-0 h-2 bg-[#C5A059]" />
                <span className="inline-block px-4 py-1.5 bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] rounded-full text-xs sm:text-sm font-mono font-bold mb-5">
                  البعد الرابع
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 leading-tight tracking-tight">
                  البعد الرابع
                </h2>
                <p className="text-base sm:text-xl font-bold text-emerald-100 max-w-md leading-relaxed">
                  ملاءمة التصنيف وفعالية الإجراءات
                </p>
              </div>
            )}

            {/* Navigation Buttons: Previous and Next (التالي) */}
            <div className="flex items-center justify-center gap-3 w-full max-w-md">
              <button
                type="button"
                onClick={() => navigateToFlowIndex(currentFlowIndex - 1)}
                className="inline-flex items-center justify-center gap-1.5 px-6 py-3 text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-xs rounded-xl transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
                <span>السابق</span>
              </button>

              <button
                type="button"
                onClick={handleNextFromDimensionIntro}
                className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#005A36] hover:bg-[#00482B] text-white text-sm sm:text-base font-bold rounded-xl shadow-sm transition-all hover:shadow-md cursor-pointer"
              >
                <span>التالي</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* CASE 3: SINGLE QUESTION CARD */}
      {/* ========================================================================= */}
      {currentFlowStep.type === 'question' && (() => {
        const question = CPF_QUESTIONS.find((q) => q.id === currentFlowStep.questionId);
        if (!question) return null;

        const currentAnswer = formState.answers[question.id];
        const isLastQuestion = question.id === 10;
        const currentDimension = CPF_DIMENSIONS.find((d) => d.id === question.dimensionId);

        return (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Dimension Small Header Bar */}
            <div className="bg-slate-50/90 px-4 sm:px-6 py-2.5 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-[#005A36] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#005A36]" />
                {currentDimension?.title}
              </span>
              <span className="text-xs font-mono font-semibold text-slate-400">
                سؤال {question.id} من 10
              </span>
            </div>

            {/* Question Card Header */}
            <div className="p-5 sm:p-7 border-b border-slate-100">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                {question.question}
              </h3>
            </div>

            {/* Scale Options (1 to 5) */}
            <div className="p-4 sm:p-7 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-2.5">
                {question.options.map((opt) => {
                  const isSelected = currentAnswer?.score === opt.score;
                  return (
                    <button
                      key={opt.score}
                      type="button"
                      onClick={() => handleSelectOption(question.id, opt.score, opt.label)}
                      className={`group relative py-1.5 sm:py-2 px-3 sm:px-2 rounded-xl border-2 transition-all duration-200 cursor-pointer flex sm:flex-col items-center justify-between sm:justify-center gap-2 sm:gap-1.5 active:scale-[0.98] ${
                        isSelected
                          ? 'bg-[#005A36] border-[#005A36] text-white shadow-md ring-2 ring-[#005A36]/25 font-bold'
                          : 'bg-white hover:bg-emerald-50/20 border-slate-200 hover:border-[#005A36]/50 text-slate-800 shadow-xs hover:shadow-sm'
                      }`}
                    >
                      <div className="flex sm:flex-col items-center gap-2.5 sm:gap-1.5 sm:text-center w-full">
                        {/* Score Number on the Right (First in RTL flex-row) */}
                        <span
                          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-all ${
                            isSelected
                              ? 'bg-[#C5A059] text-slate-950 ring-2 ring-white/50 shadow-xs'
                              : 'bg-slate-100 text-slate-700 border border-slate-200 group-hover:bg-[#005A36]/10 group-hover:text-[#005A36] group-hover:border-[#005A36]/30'
                          }`}
                        >
                          {opt.score}
                        </span>

                        {/* Option Label */}
                        <span
                          className={`text-xs sm:text-sm font-bold leading-snug transition-colors ${
                            isSelected
                              ? 'text-white'
                              : 'text-slate-800 group-hover:text-[#005A36]'
                          }`}
                        >
                          {opt.label}
                        </span>
                      </div>

                      {/* Checkmark Indicator When Selected */}
                      {isSelected && (
                        <div className="sm:absolute sm:top-2 sm:left-2 text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Action Buttons: Previous & Next / Submit */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => navigateToFlowIndex(currentFlowIndex - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
                <span>السابق</span>
              </button>

              {!isLastQuestion ? (
                <button
                  type="button"
                  onClick={() => handleNextFromQuestion(question.id)}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#005A36] hover:bg-[#00482B] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <span>التالي</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitSurvey}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#005A36] to-[#00482B] hover:from-[#00482B] hover:to-[#003620] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جارٍ الإرسال...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 rotate-180" />
                      <span>إرسال الاستبيان</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
