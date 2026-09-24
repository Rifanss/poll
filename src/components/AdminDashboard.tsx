import React, { useState, useEffect, useMemo } from 'react';
import { SurveyResponse, SurveyStatistics } from '../types';
import {
  Users,
  Percent,
  Star,
  Download,
  RefreshCw,
  Search,
  Filter,
  LogOut,
  ChevronDown,
  ChevronUp,
  Clock,
  UserCheck,
  BarChart3,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Hash,
  MessageSquare
} from 'lucide-react';
import { CpfValidationDashboard } from './CpfValidationDashboard';

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
  onGoToSurvey: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  onLogout,
  onGoToSurvey
}) => {
  const [adminTab, setAdminTab] = useState<'cpf-validation' | 'general'>('cpf-validation');
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [stats, setStats] = useState<SurveyStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterQ1, setFilterQ1] = useState<string>('all');
  const [filterQ2, setFilterQ2] = useState<string>('all');
  const [filterQ3, setFilterQ3] = useState<string>('all');
  const [filterQ4, setFilterQ4] = useState<string>('all');
  const [filterQ5, setFilterQ5] = useState<string>('all');

  // Mobile Expanded Row state
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/responses', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        onLogout();
        return;
      }

      if (!res.ok) {
        throw new Error('فشل في استرجاع البيانات');
      }

      const data = await res.json();
      setResponses(data.responses || []);
      setStats(data.statistics || null);
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء تحميل بيانات الاستبيان من الخادم');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh periodically every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Export CSV handler
  const handleExport = () => {
    window.open(`/api/admin/export?token=${encodeURIComponent(token)}`, '_blank');
  };

  // Filtered responses logic
  const filteredResponses = useMemo(() => {
    return responses.filter((r) => {
      // Search
      const matchSearch =
        !searchQuery.trim() ||
        (r.employeeName && r.employeeName.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
        (r.department && r.department.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
        (r.jobTitle && r.jobTitle.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
        (Array.isArray(r.stages) && r.stages.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase().trim()))) ||
        (Array.isArray(r.products) && r.products.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase().trim()))) ||
        (r.employeeId && r.employeeId.toLowerCase().includes(searchQuery.toLowerCase().trim()));

      if (!matchSearch) return false;

      // Filter Q1
      if (filterQ1 !== 'all' && r.question1 !== filterQ1) return false;

      // Filter Q2
      if (filterQ2 !== 'all' && r.question2 !== filterQ2) return false;

      // Filter Q3
      if (filterQ3 !== 'all' && r.question3 !== filterQ3) return false;

      // Filter Q4
      if (filterQ4 !== 'all' && r.question4 !== filterQ4) return false;

      // Filter Q5
      if (filterQ5 !== 'all') {
        const matchesQ5 = r.question5.startsWith(filterQ5) || r.question5.includes(filterQ5);
        if (!matchesQ5) return false;
      }

      return true;
    });
  }, [responses, searchQuery, filterQ1, filterQ2, filterQ3, filterQ4, filterQ5]);

  const toggleExpandRow = (id: string) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilterQ1('all');
    setFilterQ2('all');
    setFilterQ3('all');
    setFilterQ4('all');
    setFilterQ5('all');
  };

  // Feedback list for Question 6
  const feedbackList = useMemo(() => {
    return responses.filter((r) => r.question6 && r.question6.trim().length > 0);
  }, [responses]);

  const hasActiveFilters =
    searchQuery ||
    filterQ1 !== 'all' ||
    filterQ2 !== 'all' ||
    filterQ3 !== 'all' ||
    filterQ4 !== 'all' ||
    filterQ5 !== 'all';

  return (
    <div id="admin-dashboard-root" className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-8" dir="rtl">
      {/* Top Header Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6 bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAdminTab('cpf-validation')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              adminTab === 'cpf-validation'
                ? 'bg-[#005A36] text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-[#C5A059]" />
            <span>نتائج استبيان CPF™ (التحقق المبدئي)</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('general')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              adminTab === 'general'
                ? 'bg-[#005A36] text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>نتائج استبيان الموظفين العام</span>
          </button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {adminTab === 'cpf-validation' ? (
        <CpfValidationDashboard token={token} />
      ) : (
        <>
          {/* Top Header Block */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3.5 sm:p-6 mb-4 sm:mb-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-[#C5A059] uppercase tracking-wider block mb-0.5 sm:mb-1">
              Collection Persona Framework™️
            </span>
            <h1 className="text-base sm:text-2xl font-bold text-slate-900">
              لوحة نتائج الاستبيان
            </h1>
            <p className="text-[12px] sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
              الرصد التحليلي الفعلي لاستجابات موظفي البنك الأهلي السعودي حول إطار تصنيف العملاء المتعثرين
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
            <button
              id="btn-admin-refresh"
              type="button"
              onClick={fetchData}
              disabled={isLoading}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-[12px] sm:text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#005A36]' : ''}`} />
              <span>تحديث</span>
            </button>

            <button
              id="btn-admin-export"
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 text-[12px] sm:text-xs font-semibold text-white bg-[#005A36] hover:bg-[#00482B] rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>تصدير النتائج (Excel / CSV)</span>
            </button>

            <button
              id="btn-admin-logout"
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-[12px] sm:text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchData}
            className="text-xs font-bold underline cursor-pointer"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* 6 Key Statistical Indicators (Section 16) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
        {/* KPI 1: Total Participants */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">إجمالي المشاركين</span>
            <div className="w-7 h-7 rounded-lg bg-[#005A36]/10 flex items-center justify-center text-[#005A36]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {stats ? stats.totalParticipants : '—'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            موظف أرسل الاستبيان
          </div>
        </div>

        {/* KPI 2: Q1 Yes Percentage */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">نسبة نعم (س1)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#005A36] font-mono">
            {stats && stats.totalParticipants > 0 ? `${stats.q1YesPercentage}%` : '—'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate" title="اختلاف استجابة المتعثرين">
            اختلاف استجابة المتعثرين
          </div>
        </div>

        {/* KPI 3: Q2 Yes Percentage */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">نسبة نعم (س2)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#005A36] font-mono">
            {stats && stats.totalParticipants > 0 ? `${stats.q2YesPercentage}%` : '—'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate" title="تسهيل تحديد أسلوب التواصل">
            تسهيل تحديد أسلوب التواصل
          </div>
        </div>

        {/* KPI 4: Q3 Yes Percentage */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">نسبة نعم (س3)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#005A36] font-mono">
            {stats && stats.totalParticipants > 0 ? `${stats.q3YesPercentage}%` : '—'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate" title="اختيار قناة التواصل المناسبة">
            اختيار قناة التواصل المناسبة
          </div>
        </div>

        {/* KPI 5: Q4 Yes Percentage */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">نسبة نعم (س4)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#005A36] font-mono">
            {stats && stats.totalParticipants > 0 ? `${stats.q4YesPercentage}%` : '—'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate" title="ربط النمط بإجراء مقترح">
            ربط النمط بإجراء مقترح
          </div>
        </div>

        {/* KPI 6: Q5 Average Score */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">متوسط تقييم (س5)</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 font-mono">
            {stats && stats.totalParticipants > 0 ? `${stats.q5AverageScore} / 5` : '—'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate" title="مستوى مساهمة CPF المتوقع">
            مساهمة CPF في القرارات
          </div>
        </div>
      </div>

      {/* Section 17: Interactive Visual Charts */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#005A36]" />
            <span>الرسوم البيانية التفاعلية للأسئلة</span>
          </h2>
          <span className="text-xs text-slate-500">
            محدثة تلقائيًا وفق الاستجابات الفعلية
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Question 1 Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                السؤال الأول: اختلاف استجابة وسلوك المتعثرين
              </h3>
              <span className="text-xs text-slate-400 font-mono">س1</span>
            </div>
            <p className="text-xs text-slate-600 mb-4 line-clamp-2">
              هل ترى أن العملاء المتعثرين يختلفون في طريقة استجابتهم لمحاولات التحصيل والتفاعل والالتزام؟
            </p>

            {/* Bars for Q1 */}
            {stats && stats.totalParticipants > 0 ? (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-[#005A36]">نعم</span>
                    <span className="font-mono text-slate-700">
                      {stats.q1YesCount} ({stats.q1YesPercentage}%)
                    </span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#005A36] rounded-full transition-all duration-500"
                      style={{ width: `${stats.q1YesPercentage}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">لا</span>
                    <span className="font-mono text-slate-700">
                      {stats.q1NoCount} ({100 - stats.q1YesPercentage}%)
                    </span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-400 rounded-full transition-all duration-500"
                      style={{ width: `${100 - stats.q1YesPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 text-center py-6">
                لا توجد استجابات مسجلة بعد
              </div>
            )}
          </div>

          {/* Question 2 Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                السؤال الثاني: تصنيف المحفظة إلى فئات وأنماط
              </h3>
              <span className="text-xs text-slate-400 font-mono">س2</span>
            </div>
            <p className="text-xs text-slate-600 mb-4 line-clamp-2">
              إلى أي مدى ترى أن تصنيف العملاء وتوضيح النمط يسهل عليك تحديد أسلوب التواصل والإجراء؟
            </p>

            {/* Bars for Q2 */}
            {stats && stats.totalParticipants > 0 ? (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-[#005A36]">نعم، سيساعدني</span>
                    <span className="font-mono text-slate-700">
                      {stats.q2YesCount} ({stats.q2YesPercentage}%)
                    </span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#005A36] rounded-full transition-all duration-500"
                      style={{ width: `${stats.q2YesPercentage}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">لا، لن يساعدني</span>
                    <span className="font-mono text-slate-700">
                      {stats.q2NoCount} ({100 - stats.q2YesPercentage}%)
                    </span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-400 rounded-full transition-all duration-500"
                      style={{ width: `${100 - stats.q2YesPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 text-center py-6">
                لا توجد استجابات مسجلة بعد
              </div>
            )}
          </div>

          {/* Question 3 Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                السؤال الثالث: اختيار طريقة وقناة التواصل
              </h3>
              <span className="text-xs text-slate-400 font-mono">س3</span>
            </div>
            <p className="text-xs text-slate-600 mb-4 line-clamp-2">
              هل ترى أن توضيح نمط وحالة كل عميل يساعدك على اختيار طريقة وقناة التواصل وأسلوب التعامل الأنسب؟
            </p>

            {/* Bars for Q3 */}
            {stats && stats.totalParticipants > 0 ? (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-[#005A36]">نعم</span>
                    <span className="font-mono text-slate-700">
                      {stats.q3YesCount} ({stats.q3YesPercentage}%)
                    </span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#005A36] rounded-full transition-all duration-500"
                      style={{ width: `${stats.q3YesPercentage}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">لا</span>
                    <span className="font-mono text-slate-700">
                      {stats.q3NoCount} ({100 - stats.q3YesPercentage}%)
                    </span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-400 rounded-full transition-all duration-500"
                      style={{ width: `${100 - stats.q3YesPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 text-center py-6">
                لا توجد استجابات مسجلة بعد
              </div>
            )}
          </div>

          {/* Question 4 Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                السؤال الرابع: ربط النمط بإجراء تحصيلي مقترح
              </h3>
              <span className="text-xs text-slate-400 font-mono">س4</span>
            </div>
            <p className="text-xs text-slate-600 mb-4 line-clamp-2">
              هل ترى أن ربط كل نمط بإجراء مقترح (قناة، توقيت، أسلوب، نوع المعالجة) يدعم اتخاذ القرار بدقة وسرعة؟
            </p>

            {/* Bars for Q4 */}
            {stats && stats.totalParticipants > 0 ? (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-[#005A36]">نعم</span>
                    <span className="font-mono text-slate-700">
                      {stats.q4YesCount} ({stats.q4YesPercentage}%)
                    </span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#005A36] rounded-full transition-all duration-500"
                      style={{ width: `${stats.q4YesPercentage}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">لا</span>
                    <span className="font-mono text-slate-700">
                      {stats.q4NoCount} ({100 - stats.q4YesPercentage}%)
                    </span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-400 rounded-full transition-all duration-500"
                      style={{ width: `${100 - stats.q4YesPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 text-center py-6">
                لا توجد استجابات مسجلة بعد
              </div>
            )}
          </div>
        </div>

        {/* Question 5 Full-Width Detailed Distribution Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mt-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                السؤال الخامس: توزيع تقييم مساهمة (CPF™️) في دعم القرارات
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                توزيع خيارات المقياس من 1 إلى 5 مع إظهار عدد الإجابات والنسب المئوية
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">المتوسط العام:</span>
              <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-mono font-bold text-xs border border-amber-200">
                {stats && stats.totalParticipants > 0 ? `${stats.q5AverageScore} من 5` : '—'}
              </span>
            </div>
          </div>

          {stats && stats.totalParticipants > 0 ? (
            <div className="space-y-3 pt-2">
              {stats.q5Distribution.map((item) => (
                <div key={item.score} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#005A36]/10 text-[#005A36] font-mono font-bold flex items-center justify-center text-[11px]">
                        {item.score}
                      </span>
                      <span className="font-semibold text-slate-800">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-slate-600">
                      <span>{item.count} استجابة</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-bold text-[#005A36]">{item.percentage}%</span>
                    </div>
                  </div>
                  <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.score >= 4
                          ? 'bg-[#005A36]'
                          : item.score === 3
                          ? 'bg-[#C5A059]'
                          : 'bg-slate-400'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 text-center py-6">
              لا توجد استجابات مسجلة بعد
            </div>
          )}
        </div>
      </div>

      {/* Section 19: Search & Filtering Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 mb-6 shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#005A36]" />
            <h3 className="text-sm font-bold text-slate-900">البحث والتصفية</h3>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-[#005A36] hover:underline font-semibold cursor-pointer"
            >
              إعادة تعيين الفلاتر
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Text Search */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              بحث عن موظف (الاسم، الإدارة، المسمى...)
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، الإدارة، المسمى الوظيفي..."
                className="w-full pr-8 pl-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#005A36] outline-hidden text-slate-900"
              />
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Filter Q1 */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              السؤال الأول (س1)
            </label>
            <select
              value={filterQ1}
              onChange={(e) => setFilterQ1(e.target.value)}
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white outline-hidden text-slate-800"
            >
              <option value="all">الكل</option>
              <option value="نعم">نعم</option>
              <option value="لا">لا</option>
            </select>
          </div>

          {/* Filter Q2 */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              السؤال الثاني (س2)
            </label>
            <select
              value={filterQ2}
              onChange={(e) => setFilterQ2(e.target.value)}
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white outline-hidden text-slate-800"
            >
              <option value="all">الكل</option>
              <option value="نعم، سيساعدني">نعم، سيساعدني</option>
              <option value="لا، لن يساعدني">لا، لن يساعدني</option>
            </select>
          </div>

          {/* Filter Q3 */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              السؤال الثالث (س3)
            </label>
            <select
              value={filterQ3}
              onChange={(e) => setFilterQ3(e.target.value)}
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white outline-hidden text-slate-800"
            >
              <option value="all">الكل</option>
              <option value="نعم">نعم</option>
              <option value="لا">لا</option>
            </select>
          </div>

          {/* Filter Q4 */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              السؤال الرابع (س4)
            </label>
            <select
              value={filterQ4}
              onChange={(e) => setFilterQ4(e.target.value)}
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white outline-hidden text-slate-800"
            >
              <option value="all">الكل</option>
              <option value="نعم">نعم</option>
              <option value="لا">لا</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section: Qualitative Feedback & Suggestions from Question 6 */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs mb-6">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#005A36]" />
              <span>مرئيات ومقترحات الزملاء لتطوير الفكرة (السؤال السادس)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ملاحظات الموظفين حول تصنيف العملاء المتعثرين وإجراءات التحصيل المقترحة ({feedbackList.length} مقترح مسجل)
            </p>
          </div>
          <span className="text-[11px] font-semibold text-[#005A36] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
            {feedbackList.length} مقترحات
          </span>
        </div>

        {feedbackList.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            لم يقم أي مشارك بكتابة ملاحظات أو مقترحات إضافية حتى الآن (الإجابة اختيارية).
          </div>
        ) : (
          <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {feedbackList.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 text-right flex flex-col justify-between hover:border-[#005A36]/40 transition-colors"
              >
                <p className="text-xs text-slate-800 leading-relaxed font-normal whitespace-pre-line mb-3">
                  "{item.question6}"
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#005A36]"></span>
                    <span>{item.employeeName}</span>
                    <span className="font-mono text-slate-400">({item.employeeId})</span>
                  </div>
                  <span className="font-mono text-slate-400">
                    {new Date(item.submittedAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 18: Participants Table & Responsive Mobile Records */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Table Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#005A36]" />
              <span>جدول جميع المشاركين</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              عرض {filteredResponses.length} من أصل {responses.length} استجابة مسجلة
            </p>
          </div>

          <span className="text-[11px] font-semibold text-[#005A36] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
            {responses.length} سجل معتمد
          </span>
        </div>

        {/* Empty State */}
        {filteredResponses.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            {responses.length === 0
              ? 'لم يتم تسجيل أي استجابات حتى الآن. سيتم عرض البيانات هنا بمجرد مشاركة الموظفين في الاستبيان.'
              : 'لا توجد نتائج تطابق معايير البحث والتصفية المحددة.'}
          </div>
        ) : (
          <>
            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right text-xs" dir="rtl">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">الاسم</th>
                    <th className="py-3 px-3">الادارة / الوكالة</th>
                    <th className="py-3 px-3">المسمى</th>
                    <th className="py-3 px-3">المرحلة</th>
                    <th className="py-3 px-3">المنتج</th>
                    <th className="py-3 px-2 text-center">س1</th>
                    <th className="py-3 px-2 text-center">س2</th>
                    <th className="py-3 px-2 text-center">س3</th>
                    <th className="py-3 px-2 text-center">س4</th>
                    <th className="py-3 px-3">س5</th>
                    <th className="py-3 px-3 max-w-xs">س6 (الملاحظات)</th>
                    <th className="py-3 px-3 text-left">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredResponses.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        {item.employeeName}
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap">
                        {item.department || '—'}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="bg-[#005A36]/10 text-[#005A36] px-2 py-0.5 rounded text-[11px] font-semibold">
                          {item.jobTitle || '—'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 max-w-[140px]">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(item.stages) && item.stages.length > 0 ? (
                            item.stages.map((stg) => (
                              <span key={stg} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                                {stg}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 max-w-[160px]">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(item.products) && item.products.length > 0 ? (
                            item.products.map((prd) => (
                              <span key={prd} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                                {prd}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                            item.question1 === 'نعم'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {item.question1}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                            item.question2 === 'نعم، سيساعدني'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {item.question2}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                            item.question3 === 'نعم'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {item.question3}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                            item.question4 === 'نعم'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {item.question4}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-medium text-slate-800 text-[11px]">
                          {item.question5}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 max-w-xs" title={item.question6 || ''}>
                        {item.question6 ? (
                          <span className="text-slate-800 text-[11px] truncate block" title={item.question6}>
                            {item.question6}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-left font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(item.submittedAt).toLocaleString('ar-SA', {
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Expandable List View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredResponses.map((item) => {
                const isExpanded = expandedRowId === item.id;
                return (
                  <div key={item.id} className="p-4 transition-colors">
                    {/* Header Row */}
                    <div
                      onClick={() => toggleExpandRow(item.id)}
                      className="flex items-center justify-between cursor-pointer select-none"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{item.employeeName}</h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                          {item.jobTitle && (
                            <span className="bg-[#005A36]/10 text-[#005A36] px-1.5 py-0.2 rounded font-semibold text-[11px]">
                              {item.jobTitle}
                            </span>
                          )}
                          {item.department && <span>{item.department}</span>}
                          <span>•</span>
                          <span>
                            {new Date(item.submittedAt).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-[#005A36] bg-emerald-50 px-2 py-0.5 rounded">
                          التفاصيل
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Expandable Details Card */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-700 bg-slate-50/70 p-3 rounded-lg animate-fadeIn">
                        <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                          <span className="text-slate-500 font-medium">الادارة / الوكالة:</span>
                          <span className="font-semibold text-slate-900">{item.department || '—'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                          <span className="text-slate-500 font-medium">المسمى الوظيفي:</span>
                          <span className="font-semibold text-[#005A36]">{item.jobTitle || '—'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                          <span className="text-slate-500 font-medium">المرحلة:</span>
                          <span className="text-slate-800">{Array.isArray(item.stages) ? item.stages.join(' ، ') : '—'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                          <span className="text-slate-500 font-medium">المنتج:</span>
                          <span className="text-slate-800">{Array.isArray(item.products) ? item.products.join(' ، ') : '—'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                          <span className="text-slate-500 font-medium">س1 (اختلاف المتعثرين):</span>
                          <span className="font-semibold text-slate-900">{item.question1}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                          <span className="text-slate-500 font-medium">س2 (تصنيف وتحديد الأسلوب):</span>
                          <span className="font-semibold text-slate-900">{item.question2}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                          <span className="text-slate-500 font-medium">س3 (اختيار القناة والتعامل):</span>
                          <span className="font-semibold text-slate-900">{item.question3}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                          <span className="text-slate-500 font-medium">س4 (ربط النمط بإجراء مقترح):</span>
                          <span className="font-semibold text-slate-900">{item.question4}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                          <span className="text-slate-500 font-medium">س5 (مستوى مساهمة CPF):</span>
                          <span className="font-semibold text-slate-900">{item.question5}</span>
                        </div>
                        <div className="border-b border-slate-200/60 pb-1.5">
                          <span className="text-slate-500 font-medium block mb-1">س6 (ملاحظات ومقترحات التطوير):</span>
                          {item.question6 ? (
                            <p className="font-normal text-slate-900 bg-white p-2.5 rounded border border-slate-200/80 leading-relaxed text-[11px] whitespace-pre-line">
                              {item.question6}
                            </p>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">لا توجد ملاحظات إضافية</span>
                          )}
                        </div>
                        <div className="flex justify-between pt-1 text-[11px] text-slate-400">
                          <span>رقم الاستجابة:</span>
                          <span className="font-mono">{item.id}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
        </>
      )}
    </div>
  );
};
