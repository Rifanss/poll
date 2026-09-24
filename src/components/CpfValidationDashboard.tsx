import React, { useState, useEffect, useMemo } from 'react';
import {
  CpfValidationResponse,
  CpfValidationStatistics,
  CpfValidationDimensionStat,
  CpfValidationQuestionStat
} from '../types';
import {
  CPF_DIMENSIONS,
  CPF_QUESTIONS,
  EXPERIENCE_YEARS_OPTIONS,
  PORTFOLIO_TYPE_OPTIONS,
  REGION_OPTIONS
} from '../data/cpfValidationQuestions';
import {
  Users,
  Percent,
  Star,
  Clock,
  Calendar,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Layers,
  Sparkles,
  Award,
  SlidersHorizontal,
  Info,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface CpfValidationDashboardProps {
  token: string;
}

export const CpfValidationDashboard: React.FC<CpfValidationDashboardProps> = ({ token }) => {
  const [responses, setResponses] = useState<CpfValidationResponse[]>([]);
  const [stats, setStats] = useState<CpfValidationStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterExperience, setFilterExperience] = useState<string>('all');
  const [filterPortfolio, setFilterPortfolio] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Mobile expanded row
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/cpf-validation/admin/responses', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('فشل في تحميل بيانات استبيان CPF');
      }

      const data = await res.json();
      setResponses(data.responses || []);
      setStats(data.statistics || null);
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء تحميل البيانات من الخادم');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Export handlers
  const handleExportCsv = () => {
    window.open(`/api/cpf-validation/admin/export-csv?token=${encodeURIComponent(token)}`, '_blank');
  };

  const handleExportExcel = () => {
    window.open(`/api/cpf-validation/admin/export-excel?token=${encodeURIComponent(token)}`, '_blank');
  };

  // Filtered responses based on selected filters
  const filteredResponses = useMemo(() => {
    return responses.filter((r) => {
      if (filterExperience !== 'all' && r.experienceYears !== filterExperience) return false;
      if (filterPortfolio !== 'all' && r.portfolioType !== filterPortfolio) return false;
      if (filterRegion !== 'all' && r.region !== filterRegion) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = r.id.toLowerCase().includes(q);
        const matchExp = r.experienceYears.toLowerCase().includes(q);
        const matchPort = r.portfolioType.toLowerCase().includes(q);
        const matchReg = r.region ? r.region.toLowerCase().includes(q) : false;
        if (!matchId && !matchExp && !matchPort && !matchReg) return false;
      }

      return true;
    });
  }, [responses, filterExperience, filterPortfolio, filterRegion, searchQuery]);

  // Dynamically recomputed statistics based on filtered responses
  const activeStats = useMemo(() => {
    const total = filteredResponses.length;
    if (total === 0) {
      return {
        totalParticipants: 0,
        completionRate: 0,
        overallAverage: 0,
        lastResponseDate: null,
        dimensions: CPF_DIMENSIONS.map((d) => ({
          id: d.id,
          title: d.title,
          questions: d.id === 1 ? [1, 2, 3] : d.id === 2 ? [4, 5] : d.id === 3 ? [6, 7] : [8, 9, 10],
          averageScore: 0,
          description: d.subtitle
        })),
        questions: CPF_QUESTIONS.map((q) => ({
          id: q.id,
          title: q.question,
          dimensionId: q.dimensionId,
          totalAnswers: 0,
          averageScore: 0,
          distribution: q.options.map((opt) => ({
            score: opt.score,
            label: opt.label,
            count: 0,
            percentage: 0
          }))
        }))
      };
    }

    let sumAll = 0;
    let countAll = 0;

    const questionStats: CpfValidationQuestionStat[] = CPF_QUESTIONS.map((q) => {
      const key = `q${q.id}Score` as keyof CpfValidationResponse;
      let qSum = 0;
      const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      filteredResponses.forEach((r) => {
        const score = Number(r[key]) || 1;
        qSum += score;
        counts[score] = (counts[score] || 0) + 1;
        sumAll += score;
        countAll += 1;
      });

      const averageScore = Number((qSum / total).toFixed(2));
      const distribution = q.options.map((opt) => {
        const count = counts[opt.score] || 0;
        return {
          score: opt.score,
          label: opt.label,
          count,
          percentage: Math.round((count / total) * 100)
        };
      });

      return {
        id: q.id,
        title: q.question,
        dimensionId: q.dimensionId,
        totalAnswers: total,
        averageScore,
        distribution
      };
    });

    const getDimAvg = (qIds: number[]) => {
      const qs = questionStats.filter((q) => qIds.includes(q.id));
      if (qs.length === 0) return 0;
      const sum = qs.reduce((acc, q) => acc + q.averageScore, 0);
      return Number((sum / qs.length).toFixed(2));
    };

    const dimensions: CpfValidationDimensionStat[] = [
      {
        id: 1,
        title: 'تقييم العميل',
        questions: [1, 2, 3],
        averageScore: getDimAvg([1, 2, 3]),
        description: 'قياس إدراك تباين قدرة العملاء على السداد والالتزام وأهمية مؤشرات التفاعل والظروف المالية'
      },
      {
        id: 2,
        title: 'التحديات التحصيلية',
        questions: [4, 5],
        averageScore: getDimAvg([4, 5]),
        description: 'صعوبة تحديد الإجراء الأمثل من ملف العميل وتفاوت النتائج عند توحيد الإجراءات'
      },
      {
        id: 3,
        title: 'الاستراتيجيات المتبعة',
        questions: [6, 7],
        averageScore: getDimAvg([6, 7]),
        description: 'مدى ملاءمة وتكييف أسلوب التواصل واعتماد المحصل على التقدير الشخصي'
      },
      {
        id: 4,
        title: 'ملاءمة التصنيف وفعالية الإجراءات',
        questions: [8, 9, 10],
        averageScore: getDimAvg([8, 9, 10]),
        description: 'جدوى إطار CPF™ في سرعة فهم الحالة وتلقي إجراء مقترح ودعم جودة واتساق القرارات'
      }
    ];

    const overallAverage = countAll > 0 ? Number((sumAll / countAll).toFixed(2)) : 0;
    const lastResponseDate = filteredResponses.length > 0 ? filteredResponses[0].submittedAt : null;

    return {
      totalParticipants: total,
      completionRate: 100,
      overallAverage,
      lastResponseDate,
      dimensions,
      questions: questionStats
    };
  }, [filteredResponses]);

  const resetFilters = () => {
    setFilterExperience('all');
    setFilterPortfolio('all');
    setFilterRegion('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    filterExperience !== 'all' ||
    filterPortfolio !== 'all' ||
    filterRegion !== 'all' ||
    Boolean(searchQuery.trim());

  return (
    <div id="cpf-validation-dashboard-container" className="space-y-6 text-slate-800" dir="rtl">
      {/* Top Banner & Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#005A36]/10 text-[#005A36] text-xs font-bold mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>نتائج التحقق الميداني المباشر</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900">
              نتائج استبيان CPF™
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              تحليل آراء وخبرات العاملين في مجال التحصيل حول ملاءمة Collection Persona Framework™ وأبعاده الأربعة
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={fetchData}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#005A36]' : ''}`} />
              <span>تحديث</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#005A36] hover:bg-[#00482B] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              title="تصدير إلى Microsoft Excel (.xls)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير Excel</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              title="تصدير إلى CSV"
            >
              <Download className="w-4 h-4" />
              <span>تصدير CSV</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={fetchData} className="font-bold underline cursor-pointer">
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Top 4 Key Performance Indicators (Required Section 7) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Participants */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">إجمالي عدد المشاركين</span>
            <div className="w-8 h-8 rounded-lg bg-[#005A36]/10 flex items-center justify-center text-[#005A36]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
            {activeStats.totalParticipants}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {hasActiveFilters ? `من إجمالي ${responses.length} استجابة` : 'مشارك معتمد في الاستبيان'}
          </div>
        </div>

        {/* Metric 2: Completion Rate */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">نسبة اكتمال الاستبيان</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#005A36] font-mono">
            {activeStats.totalParticipants > 0 ? '100%' : '0%'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            جميع الأسئلة الـ 10 مكتملة
          </div>
        </div>

        {/* Metric 3: Overall Average Rating */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">متوسط التقييم العام</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600 font-mono">
            {activeStats.totalParticipants > 0 ? `${activeStats.overallAverage}` : '—'}
            <span className="text-xs text-slate-400 font-normal mr-1">/ 5</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            معدل مقياس 1 إلى 5
          </div>
        </div>

        {/* Metric 4: Last Response Date */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">تاريخ آخر استجابة</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-900 mt-1">
            {activeStats.lastResponseDate ? (
              new Date(activeStats.lastResponseDate).toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            ) : (
              'لا توجد استجابات'
            )}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            {activeStats.lastResponseDate ? (
              new Date(activeStats.lastResponseDate).toLocaleTimeString('ar-SA', {
                hour: '2-digit',
                minute: '2-digit'
              })
            ) : (
              '—'
            )}
          </div>
        </div>
      </div>

      {/* Section 9: Filters Bar for Comparative Analysis */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#005A36]" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              فلاتر التحليل المقارن (تحديث لحظي لكافة النتائج)
            </h3>
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

        <div className={`grid grid-cols-1 sm:grid-cols-2 ${REGION_OPTIONS.length > 0 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-3`}>
          {/* Filter 1: Experience */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              سنوات الخبرة في التحصيل:
            </label>
            <select
              value={filterExperience}
              onChange={(e) => setFilterExperience(e.target.value)}
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white outline-hidden text-slate-800"
            >
              <option value="all">جميع سنوات الخبرة ({responses.length})</option>
              {EXPERIENCE_YEARS_OPTIONS.map((exp) => (
                <option key={exp} value={exp}>
                  {exp}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 2: Portfolio Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              نوع المحفظة الأساسية:
            </label>
            <select
              value={filterPortfolio}
              onChange={(e) => setFilterPortfolio(e.target.value)}
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white outline-hidden text-slate-800"
            >
              <option value="all">جميع المحافظ ({responses.length})</option>
              {PORTFOLIO_TYPE_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 3: Region (if applicable) */}
          {REGION_OPTIONS.length > 0 && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                المنطقة الجغرافية:
              </label>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white outline-hidden text-slate-800"
              >
                <option value="all">جميع المناطق ({responses.length})</option>
                {REGION_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search Query */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              بحث في السجلات:
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="رقم الاستجابة أو المحفظة..."
                className="w-full pr-8 pl-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white outline-hidden text-slate-900"
              />
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Section 8: Analysis of the 4 Dimensions (تحليل الأبعاد الأربعة بشكل مستقل) */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#005A36]" />
            <span>تحليل الأبعاد الأربعة المستقلة لـ CPF™</span>
          </h2>
          <span className="text-[11px] text-slate-500">
            يُحسب متوسط كل بُعد بصورة مستقلة لقياس أوجه الكفاءة المختلفة
          </span>
        </div>

        {/* Note on dimensions */}
        <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-xl text-blue-950 text-xs flex items-start gap-2 mb-4">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            <strong>تنويه تحليلي منهجي:</strong> لا يُعتبر المتوسط العام لجميع الأسئلة تلقائيًا "درجة نجاح CPF"، لأن الأسئلة تقيس أبعادًا مختلفة تشمل إدراك التباين، صعوبة الأدوات الحالية، السلوك الفعلي، وجدوى الإطار المقترح.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeStats.dimensions.map((dim) => (
            <div
              key={dim.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-md bg-[#005A36]/10 text-[#005A36] font-mono font-bold text-xs flex items-center justify-center">
                    {dim.id}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    الأسئلة: {dim.questions.join(' ، ')}
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">
                  {dim.title}
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3 mb-3">
                  {dim.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-600 font-semibold">متوسط البعد:</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono text-[#005A36]">
                    {dim.averageScore > 0 ? dim.averageScore : '—'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">/ 5</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparative Insights Matrix (Section 9) */}
      {stats && stats.comparativeByExperience.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                مصفوفة المقارنة المتقاطعة (Cross-Segment Comparison)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                مقارنة متوسطات الأبعاد الأربعة حسب فئات سنوات الخبرة ونوع المحفظة المسندة
              </p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
              تحليل إحصائي مقارن
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs" dir="rtl">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">فئة الخبرة</th>
                  <th className="py-2.5 px-3 text-center">العدد</th>
                  <th className="py-2.5 px-3 text-center">بُعد تقييم العميل (1)</th>
                  <th className="py-2.5 px-3 text-center">بُعد التحديات (2)</th>
                  <th className="py-2.5 px-3 text-center">بُعد الاستراتيجيات (3)</th>
                  <th className="py-2.5 px-3 text-center">بُعد ملاءمة CPF™ (4)</th>
                  <th className="py-2.5 px-3 text-center">المتوسط</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {stats.comparativeByExperience.map((row) => (
                  <tr key={row.group} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{row.group}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{row.count}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-[#005A36]">{row.dim1Avg}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-700">{row.dim2Avg}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-700">{row.dim3Avg}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">{row.dim4Avg}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">{row.overallAvg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 7: Detailed Results & Visual Charts for all 10 Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#005A36]" />
            <span>النتائج التفصيلية والرسوم البيانية للأسئلة الـ 10</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {activeStats.totalParticipants} إجابة معتمدة
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeStats.questions.map((q) => {
            const dim = CPF_DIMENSIONS.find((d) => d.id === q.dimensionId);

            return (
              <div
                key={q.id}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#005A36] text-white font-mono font-bold text-xs flex items-center justify-center">
                        {q.id}
                      </span>
                      <span className="text-[11px] font-semibold text-[#005A36] bg-[#005A36]/10 px-2 py-0.5 rounded">
                        {dim?.title.split(':')[1]?.trim() || ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-500">المتوسط:</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#005A36] font-mono font-bold text-xs border border-emerald-200">
                        {q.averageScore > 0 ? `${q.averageScore} / 5` : '—'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug mb-4">
                    {q.title}
                  </h3>

                  {/* 5 Options Distribution Bars */}
                  {activeStats.totalParticipants > 0 ? (
                    <div className="space-y-2.5 mb-2">
                      {q.distribution.map((item) => (
                        <div key={item.score} className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 font-mono font-bold flex items-center justify-center text-[10px]">
                                {item.score}
                              </span>
                              <span className="font-medium text-slate-700">{item.label}</span>
                            </div>
                            <div className="font-mono text-slate-600 flex items-center gap-1.5">
                              <span>{item.count}</span>
                              <span className="text-slate-400">({item.percentage}%)</span>
                            </div>
                          </div>
                          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
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
                      لا توجد استجابات مسجلة بعد لهذا التحديد
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                  <span>إجمالي الإجابات: {q.totalAnswers}</span>
                  <span className="font-mono text-slate-400">سؤال {q.id} من 10</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Raw Responses Data Table with Search & Expandable Mobile View */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#005A36]" />
              <span>جدول الاستجابات الفردية</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              عرض {filteredResponses.length} من أصل {responses.length} استجابة مسجلة (مجهولة الهوية وفق المعايير)
            </p>
          </div>
          <span className="text-xs font-semibold text-[#005A36] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
            {filteredResponses.length} سجل
          </span>
        </div>

        {filteredResponses.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">
            لا توجد استجابات تطابق الفلاتر المحددة حاليًا.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-right text-xs" dir="rtl">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">رقم الاستجابة</th>
                    <th className="py-3 px-3">سنوات الخبرة</th>
                    <th className="py-3 px-3">نوع المحفظة</th>
                    <th className="py-3 px-3">المنطقة</th>
                    <th className="py-3 px-1.5 text-center">س1</th>
                    <th className="py-3 px-1.5 text-center">س2</th>
                    <th className="py-3 px-1.5 text-center">س3</th>
                    <th className="py-3 px-1.5 text-center">س4</th>
                    <th className="py-3 px-1.5 text-center">س5</th>
                    <th className="py-3 px-1.5 text-center">س6</th>
                    <th className="py-3 px-1.5 text-center">س7</th>
                    <th className="py-3 px-1.5 text-center">س8</th>
                    <th className="py-3 px-1.5 text-center">س9</th>
                    <th className="py-3 px-1.5 text-center">س10</th>
                    <th className="py-3 px-3 text-left">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredResponses.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        {r.id}
                      </td>
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                        {r.experienceYears}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="bg-[#005A36]/10 text-[#005A36] px-2 py-0.5 rounded text-[11px] font-semibold">
                          {r.portfolioType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                        {r.region || '-'}
                      </td>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                        const sc = Number(r[`q${num}Score` as keyof CpfValidationResponse]) || 0;
                        return (
                          <td key={num} className="py-3 px-1.5 text-center font-mono">
                            <span
                              className={`inline-block w-6 h-6 leading-6 rounded-md text-[11px] font-bold ${
                                sc >= 4
                                  ? 'bg-[#005A36]/10 text-[#005A36]'
                                  : sc === 3
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {sc}
                            </span>
                          </td>
                        );
                      })}
                      <td className="py-3 px-3 text-left font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(r.submittedAt).toLocaleDateString('ar-SA')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Expandable List */}
            <div className="lg:hidden divide-y divide-slate-100">
              {filteredResponses.map((r) => {
                const isExpanded = expandedRowId === r.id;
                return (
                  <div key={r.id} className="p-3.5">
                    <div
                      onClick={() => setExpandedRowId(isExpanded ? null : r.id)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="font-mono font-bold text-xs text-slate-900">{r.id}</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <span>{r.experienceYears}</span>
                          <span>•</span>
                          <span className="text-[#005A36] font-medium">{r.portfolioType}</span>
                          {r.region && (
                            <>
                              <span>•</span>
                              <span>{r.region}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Date(r.submittedAt).toLocaleDateString('ar-SA')}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
                        <div className="grid grid-cols-5 gap-1.5 pt-1">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                            const sc = Number(r[`q${num}Score` as keyof CpfValidationResponse]) || 0;
                            return (
                              <div
                                key={num}
                                className="p-1.5 rounded bg-slate-50 border border-slate-200 text-center"
                              >
                                <div className="text-[10px] text-slate-500 font-mono">س{num}</div>
                                <div className="font-bold text-xs font-mono text-[#005A36]">{sc}</div>
                              </div>
                            );
                          })}
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
    </div>
  );
};
