import React, { useState } from 'react';
import { User, Building, Briefcase, ChevronLeft, AlertCircle } from 'lucide-react';
import { MultiSelectDropdown } from './MultiSelectDropdown';
import { EmployeeData } from '../types';

interface SurveyIntroViewProps {
  initialData: EmployeeData;
  onStartSurvey: (data: EmployeeData) => void;
}

const JOB_TITLE_OPTIONS = ['محصل', 'مشرف', 'مدير', 'غير ذلك'];
const STAGE_OPTIONS = ['المراحل المبكرة', 'الديون المعدومة'];
const PRODUCT_OPTIONS = [
  'التمويل العقاري',
  'التمويل الشخصي',
  'التمويل التأجيري',
  'البطاقات الإئتمانية'
];

export const SurveyIntroView: React.FC<SurveyIntroViewProps> = ({
  initialData,
  onStartSurvey
}) => {
  const [employeeName, setEmployeeName] = useState(initialData.employeeName || '');
  const [department, setDepartment] = useState(initialData.department || '');
  const [jobTitle, setJobTitle] = useState(initialData.jobTitle || '');
  const [customJobTitle, setCustomJobTitle] = useState('');
  const [stages, setStages] = useState<string[]>(initialData.stages || []);
  const [products, setProducts] = useState<string[]>(initialData.products || []);
  const [error, setError] = useState<string | null>(null);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();

    if (!employeeName.trim()) {
      setError('يرجى إدخال الاسم للمتابعة');
      return;
    }
    if (!department.trim()) {
      setError('يرجى إدخال الادارة / الوكالة للمتابعة');
      return;
    }
    if (!jobTitle) {
      setError('يرجى اختيار المسمى الوظيفي للمتابعة');
      return;
    }
    if (jobTitle === 'غير ذلك' && customJobTitle.trim()) {
      // Allow custom description
    }
    if (stages.length === 0) {
      setError('يرجى اختيار مرحلة واحدة على الأقل من قائمة المرحلة');
      return;
    }
    if (products.length === 0) {
      setError('يرجى اختيار منتج واحد على الأقل من قائمة المنتج');
      return;
    }

    setError(null);
    const finalJobTitle = jobTitle === 'غير ذلك' && customJobTitle.trim()
      ? `غير ذلك (${customJobTitle.trim()})`
      : jobTitle;

    onStartSurvey({
      employeeName: employeeName.trim(),
      department: department.trim(),
      jobTitle: finalJobTitle,
      stages,
      products
    });
  };

  return (
    <div id="survey-intro-screen" className="w-full max-w-xl mx-auto px-2 sm:px-4 py-2.5 sm:py-6" dir="rtl">
      {/* Top Banner Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm mb-4 sm:mb-6">
        {/* Header Ribbon */}
        <div className="bg-[#005A36] rounded-t-xl px-3.5 py-4 sm:px-5 sm:py-5 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-full bg-white/5 skew-x-12 pointer-events-none" />
          <h1 className="tracking-tight text-white leading-snug">
            <span className="block text-emerald-100 text-sm sm:text-base font-semibold mb-1">
              استبيان التحقق المبدئي من :
            </span>
            <span className="block text-white text-base sm:text-2xl font-bold tracking-tight">
              Collection Persona Framework™ (CPF™)
            </span>
          </h1>
        </div>

        {/* Introductory Message Text */}
        <div className="p-3.5 sm:p-6 text-slate-800 text-[14px] sm:text-sm leading-relaxed border-b border-slate-100 bg-slate-50/50 space-y-3.5">
          <p className="font-semibold text-slate-900">
            الإخوة والأخوات الزملاء،
          </p>

          <div className="space-y-1">
            <span className="block text-slate-800 font-medium">
              ضمن العمل على تطوير
            </span>
            <span className="block font-bold text-slate-950 text-[15px] sm:text-base tracking-tight text-[#005A36]">
              Collection Persona Framework™ (CPF™)
            </span>
            <p className="text-slate-700 pt-0.5 leading-relaxed">
              نشارككم هذا الاستبيان للاستفادة من خبراتكم العملية في التحصيل، والتحقق مبدئيًا من مدى ملاءمة مفهوم الفكرة لواقع التعامل مع العملاء المتعثرين واحتياجات العمل التحصيلي.
            </p>
          </div>

          <p className="text-slate-700 leading-relaxed">
            تقوم الفكرة على أن حالات التعثر قد تتشابه في بعض المؤشرات، مثل قيمة المديونية أو مدة التعثر، بينما تختلف في عوامل أخرى مؤثرة في التعامل التحصيلي، وهو ما تسعى فكرة CPF™ إلى دراسته والاستفادة منه بصورة أكثر تنظيمًا في عملية التحصيل.
          </p>

          {/* Featured Highlight Element */}
          <div className="bg-gradient-to-br from-emerald-50/90 via-emerald-50/50 to-white border-r-4 border-[#005A36] border-y border-l border-emerald-200/80 rounded-xl p-3.5 sm:p-4 shadow-2xs">
            <p className="text-slate-900 text-[14px] sm:text-sm font-semibold leading-relaxed">
              يهدف هذا الاستبيان إلى الاستفادة من خبرتك العملية في التحصيل، والتحقق من مدى ملاءمة فكرة تصنيف محفظة العملاء المتعثرين إلى أنماط مختلفة بناءً على خصائص كل حالة، مثل القدرة على السداد، والالتزام بوعود السداد، ومستوى التفاعل، والظروف المالية، ثم الاستفادة من هذا التصنيف في تحديد الإجراء التحصيلي الأكثر ملاءمة لكل عميل، ومدى توافق ذلك مع واقع عملك وتواصلك مع العملاء ضمن المحفظة المسندة إليك، ودوره في دعم قراراتك كمحصّل عند التعامل مع كل حالة.
            </p>
          </div>

          <p className="font-semibold text-[#005A36] pt-1">
            مشاركتكم تمثل جزءًا مهمًا من التحقق المبدئي للفكرة، ونقدّر وقتكم وخبرتكم المهنية
          </p>
        </div>

        {/* Employee Data Section */}
        <form onSubmit={handleStart} className="p-3.5 sm:p-6 bg-white space-y-4 sm:space-y-5">
          <div className="border-b border-slate-100 pb-2.5">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-[#005A36] rounded-xs inline-block" />
              بيانات الموظف
            </h2>
          </div>

          {error && (
            <div
              id="employee-form-error"
              className="flex items-center gap-2 p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[13px] sm:text-sm font-medium animate-shake"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3.5 sm:space-y-4">
            {/* الاسم : */}
            <div>
              <label
                htmlFor="input-employee-name"
                className="block text-[13px] sm:text-xs font-semibold text-slate-700 mb-1"
              >
                الاسم : <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="input-employee-name"
                  type="text"
                  required
                  value={employeeName}
                  onChange={(e) => {
                    setEmployeeName(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="أدخل الاسم"
                  className="w-full pr-9 pl-3 py-2 sm:py-2.5 text-[14px] sm:text-sm bg-slate-50 border border-slate-300 rounded-lg sm:rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005A36]/30 focus:border-[#005A36] outline-hidden transition-all text-slate-900"
                />
              </div>
            </div>

            {/* الادارة / الوكالة : */}
            <div>
              <label
                htmlFor="input-department"
                className="block text-[13px] sm:text-xs font-semibold text-slate-700 mb-1"
              >
                الادارة / الوكالة : <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  id="input-department"
                  type="text"
                  required
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="أدخل الإدارة أو الوكالة"
                  className="w-full pr-9 pl-3 py-2 sm:py-2.5 text-[14px] sm:text-sm bg-slate-50 border border-slate-300 rounded-lg sm:rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005A36]/30 focus:border-[#005A36] outline-hidden transition-all text-slate-900"
                />
              </div>
            </div>

            {/* المسمى الوظيفي : قائمة منسدلة ( محصل - مشرف - مدير - غير ذلك ) */}
            <div>
              <label
                htmlFor="select-job-title"
                className="block text-[13px] sm:text-xs font-semibold text-slate-700 mb-1"
              >
                المسمى الوظيفي : <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <select
                  id="select-job-title"
                  required
                  value={jobTitle}
                  onChange={(e) => {
                    setJobTitle(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pr-9 pl-3 py-2 sm:py-2.5 text-[14px] sm:text-sm bg-slate-50 border border-slate-300 rounded-lg sm:rounded-xl focus:bg-white focus:ring-2 focus:ring-[#005A36]/30 focus:border-[#005A36] outline-hidden transition-all text-slate-900 cursor-pointer"
                >
                  <option value="" disabled>
                    اختر المسمى الوظيفي...
                  </option>
                  {JOB_TITLE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* If "غير ذلك" is selected, optional input for specification */}
              {jobTitle === 'غير ذلك' && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={customJobTitle}
                    onChange={(e) => setCustomJobTitle(e.target.value)}
                    placeholder="حدد المسمى الوظيفي (اختياري)..."
                    className="w-full px-3 py-1.5 text-[13px] sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#005A36]/30 focus:border-[#005A36] outline-hidden text-slate-900"
                  />
                </div>
              )}
            </div>

            {/* المرحلة : المراحل المبكره - الديون المعدومة ( قائمة منسدله امكانية اختيار اكثر من مرحله ) */}
            <MultiSelectDropdown
              id="field-stages"
              label="المرحلة :"
              options={STAGE_OPTIONS}
              selectedValues={stages}
              onChange={(newStages) => {
                setStages(newStages);
                if (error) setError(null);
              }}
              placeholder="اختر المرحلة (يمكنك اختيار أكثر من مرحلة)..."
              required
            />

            {/* المنتج : التمويل العقاري - التمويل الشخصي - التمويل التأجيري - البطاقات الإئتمانية ( قائمة منسدله امكانية اختيار اكثر من منتج ) */}
            <MultiSelectDropdown
              id="field-products"
              label="المنتج :"
              options={PRODUCT_OPTIONS}
              selectedValues={products}
              onChange={(newProducts) => {
                setProducts(newProducts);
                if (error) setError(null);
              }}
              placeholder="اختر المنتج (يمكنك اختيار أكثر من منتج)..."
              required
            />
          </div>

          <div className="pt-2">
            <button
              id="btn-start-survey"
              type="submit"
              className="w-full h-10 sm:h-12 flex items-center justify-center gap-2 px-4 bg-[#005A36] hover:bg-[#00482B] active:bg-[#003820] text-white font-semibold text-[14px] sm:text-sm rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <span>بدء الاستبيان</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
