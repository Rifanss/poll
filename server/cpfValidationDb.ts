import fs from 'fs';
import path from 'path';

export interface CpfValidationRecord {
  id: string;
  submittedAt: string;
  // Dimensions 1-4, Questions 1-10
  q1Score: number; // 1-5
  q1Text: string;
  q2Score: number;
  q2Text: string;
  q3Score: number;
  q3Text: string;
  q4Score: number;
  q4Text: string;
  q5Score: number;
  q5Text: string;
  q6Score: number;
  q6Text: string;
  q7Score: number;
  q7Text: string;
  q8Score: number;
  q8Text: string;
  q9Score: number;
  q9Text: string;
  q10Score: number;
  q10Text: string;
  // Demographics
  experienceYears: string;
  portfolioType: string;
  region: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const CPF_DATA_FILE = path.join(DATA_DIR, 'cpf_validation_responses.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(CPF_DATA_FILE)) {
    fs.writeFileSync(CPF_DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

export function getAllCpfValidationResponses(): CpfValidationRecord[] {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(CPF_DATA_FILE, 'utf-8');
    const parsed: CpfValidationRecord[] = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading CPF validation responses file:', err);
    return [];
  }
}

export function saveCpfValidationResponse(
  data: Omit<CpfValidationRecord, 'id' | 'submittedAt'>
): CpfValidationRecord {
  ensureDataFile();
  const responses = getAllCpfValidationResponses();

  const timestamp = new Date();
  const dateStr = timestamp.toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const id = `CPF-VAL-${dateStr}-${randomSuffix}`;

  const newRecord: CpfValidationRecord = {
    id,
    submittedAt: timestamp.toISOString(),
    q1Score: Number(data.q1Score) || 1,
    q1Text: data.q1Text || '',
    q2Score: Number(data.q2Score) || 1,
    q2Text: data.q2Text || '',
    q3Score: Number(data.q3Score) || 1,
    q3Text: data.q3Text || '',
    q4Score: Number(data.q4Score) || 1,
    q4Text: data.q4Text || '',
    q5Score: Number(data.q5Score) || 1,
    q5Text: data.q5Text || '',
    q6Score: Number(data.q6Score) || 1,
    q6Text: data.q6Text || '',
    q7Score: Number(data.q7Score) || 1,
    q7Text: data.q7Text || '',
    q8Score: Number(data.q8Score) || 1,
    q8Text: data.q8Text || '',
    q9Score: Number(data.q9Score) || 1,
    q9Text: data.q9Text || '',
    q10Score: Number(data.q10Score) || 1,
    q10Text: data.q10Text || '',
    experienceYears: data.experienceYears,
    portfolioType: data.portfolioType,
    region: data.region
  };

  responses.unshift(newRecord);

  const tempFile = `${CPF_DATA_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(responses, null, 2), 'utf-8');
  fs.renameSync(tempFile, CPF_DATA_FILE);

  return newRecord;
}

export interface QuestionStatItem {
  id: number;
  title: string;
  dimensionId: number;
  totalAnswers: number;
  averageScore: number;
  distribution: {
    score: number;
    label: string;
    count: number;
    percentage: number;
  }[];
}

export interface DimensionStatItem {
  id: number;
  title: string;
  questions: number[];
  averageScore: number;
  description: string;
}

export interface CpfValidationAnalytics {
  totalParticipants: number;
  completionRate: number;
  overallAverage: number;
  lastResponseDate: string | null;
  dimensions: DimensionStatItem[];
  questions: QuestionStatItem[];
  comparativeByExperience: {
    group: string;
    count: number;
    dim1Avg: number;
    dim2Avg: number;
    dim3Avg: number;
    dim4Avg: number;
    overallAvg: number;
  }[];
  comparativeByPortfolio: {
    group: string;
    count: number;
    dim1Avg: number;
    dim2Avg: number;
    dim3Avg: number;
    dim4Avg: number;
    overallAvg: number;
  }[];
  comparativeByRegion: {
    group: string;
    count: number;
    dim1Avg: number;
    dim2Avg: number;
    dim3Avg: number;
    dim4Avg: number;
    overallAvg: number;
  }[];
}

const QUESTION_META: { id: number; title: string; dimensionId: number; options: { score: number; label: string }[] }[] = [
  {
    id: 1,
    title: 'إلى أي مدى تلاحظ أن العملاء المتعثرين ذوي المديونيات أو مدد التعثر المتقاربة يختلفون في قدرتهم الفعلية على السداد؟',
    dimensionId: 1,
    options: [
      { score: 1, label: 'لا ألاحظ إطلاقًا' },
      { score: 2, label: 'بدرجة قليلة' },
      { score: 3, label: 'بدرجة متوسطة' },
      { score: 4, label: 'بدرجة كبيرة' },
      { score: 5, label: 'بدرجة كبيرة جدًا' }
    ]
  },
  {
    id: 2,
    title: 'إلى أي مدى تختلف حالات العملاء المتعثرين في الالتزام بوعود السداد، حتى عندما تكون بيانات المديونية والتعثر متشابهة؟',
    dimensionId: 1,
    options: [
      { score: 1, label: 'لا تختلف إطلاقًا' },
      { score: 2, label: 'تختلف قليلًا' },
      { score: 3, label: 'تختلف بدرجة متوسطة' },
      { score: 4, label: 'تختلف بدرجة كبيرة' },
      { score: 5, label: 'تختلف بدرجة كبيرة جدًا' }
    ]
  },
  {
    id: 3,
    title: 'إلى أي مدى ترى أن مستوى تفاعل العميل وظروفه المالية الحالية يوفران معلومات مهمة لاختيار الإجراء التحصيلي المناسب، إلى جانب البيانات الأساسية مثل مبلغ المديونية ومدة التعثر؟',
    dimensionId: 1,
    options: [
      { score: 1, label: 'غير مهمة إطلاقًا' },
      { score: 2, label: 'قليلة الأهمية' },
      { score: 3, label: 'متوسطة الأهمية' },
      { score: 4, label: 'مهمة' },
      { score: 5, label: 'مهمة جدًا' }
    ]
  },
  {
    id: 4,
    title: 'كم مرة تواجه حالات يصعب فيها تحديد الإجراء التحصيلي الأنسب اعتمادًا على المعلومات المتاحة في ملف العميل وحدها؟',
    dimensionId: 2,
    options: [
      { score: 1, label: 'أبدًا' },
      { score: 2, label: 'نادرًا' },
      { score: 3, label: 'أحيانًا' },
      { score: 4, label: 'غالبًا' },
      { score: 5, label: 'دائمًا تقريبًا' }
    ]
  },
  {
    id: 5,
    title: 'إلى أي مدى ترى أن تطبيق إجراء تحصيلي متشابه على عملاء تختلف قدرتهم على السداد أو مستوى تفاعلهم أو التزامهم قد يؤدي إلى تفاوت في النتائج التحصيلية؟',
    dimensionId: 2,
    options: [
      { score: 1, label: 'لا يؤدي إطلاقًا' },
      { score: 2, label: 'بدرجة قليلة' },
      { score: 3, label: 'بدرجة متوسطة' },
      { score: 4, label: 'بدرجة كبيرة' },
      { score: 5, label: 'بدرجة كبيرة جدًا' }
    ]
  },
  {
    id: 6,
    title: 'عند التعامل مع العملاء المتعثرين، إلى أي مدى تقوم فعليًا بتغيير أسلوب التواصل أو الإجراء التحصيلي بناءً على استجابة العميل وسلوكه وظروفه؟',
    dimensionId: 3,
    options: [
      { score: 1, label: 'أبدًا' },
      { score: 2, label: 'نادرًا' },
      { score: 3, label: 'أحيانًا' },
      { score: 4, label: 'غالبًا' },
      { score: 5, label: 'دائمًا تقريبًا' }
    ]
  },
  {
    id: 7,
    title: 'إلى أي مدى تعتمد حاليًا على خبرتك وتقديرك الشخصي لفهم حالة العميل وتحديد الإجراء التحصيلي الأنسب له؟',
    dimensionId: 3,
    options: [
      { score: 1, label: 'لا أعتمد عليها إطلاقًا' },
      { score: 2, label: 'بدرجة قليلة' },
      { score: 3, label: 'بدرجة متوسطة' },
      { score: 4, label: 'بدرجة كبيرة' },
      { score: 5, label: 'بدرجة كبيرة جدًا' }
    ]
  },
  {
    id: 8,
    title: 'إلى أي مدى ترى أن وجود تصنيف واضح للعملاء المتعثرين إلى أنماط مختلفة، استنادًا إلى عوامل مثل القدرة على السداد، والالتزام بوعود السداد، ومستوى التفاعل، والظروف المالية، يمكن أن يساعدك في فهم حالة العميل بصورة أسرع؟',
    dimensionId: 4,
    options: [
      { score: 1, label: 'لا يساعد إطلاقًا' },
      { score: 2, label: 'يساعد بدرجة قليلة' },
      { score: 3, label: 'بدرجة متوسطة' },
      { score: 4, label: 'بدرجة كبيرة' },
      { score: 5, label: 'بدرجة كبيرة جدًا' }
    ]
  },
  {
    id: 9,
    title: 'إلى أي مدى سيكون مفيدًا لك أن يظهر أمام كل عميل نمطه التحصيلي مع الإجراء أو مجموعة الإجراءات المقترحة للتعامل معه، بدلًا من الاعتماد على البيانات الأساسية للملف فقط؟',
    dimensionId: 4,
    options: [
      { score: 1, label: 'غير مفيد إطلاقًا' },
      { score: 2, label: 'قليل الفائدة' },
      { score: 3, label: 'متوسط الفائدة' },
      { score: 4, label: 'مفيد' },
      { score: 5, label: 'مفيد جدًا' }
    ]
  },
  {
    id: 10,
    title: 'إذا تم تطبيق Collection Persona Framework™ (CPF™) بحيث يصنف العملاء وفق خصائص كل حالة ويقترح الإجراء التحصيلي الأكثر ملاءمة، إلى أي مدى تتوقع أن يدعم ذلك جودة واتساق قراراتك التحصيلية؟',
    dimensionId: 4,
    options: [
      { score: 1, label: 'لا يدعمها إطلاقًا' },
      { score: 2, label: 'بدرجة قليلة' },
      { score: 3, label: 'بدرجة متوسطة' },
      { score: 4, label: 'بدرجة كبيرة' },
      { score: 5, label: 'بدرجة كبيرة جدًا' }
    ]
  }
];

export function calculateCpfValidationStatistics(
  records: CpfValidationRecord[]
): CpfValidationAnalytics {
  const total = records.length;
  const lastResponseDate = total > 0 ? records[0].submittedAt : null;

  if (total === 0) {
    return {
      totalParticipants: 0,
      completionRate: 100,
      overallAverage: 0,
      lastResponseDate: null,
      dimensions: [
        { id: 1, title: 'تقييم العميل', questions: [1, 2, 3], averageScore: 0, description: 'قياس إدراك تباين قدرة العملاء على السداد والتزامهم وأهمية تفاعلهم' },
        { id: 2, title: 'التحديات التحصيلية', questions: [4, 5], averageScore: 0, description: 'صعوبة تحديد الإجراءات من ملف العميل التقليدي ومخاطر الإجراءات المتماثلة' },
        { id: 3, title: 'الاستراتيجيات المتبعة', questions: [6, 7], averageScore: 0, description: 'مدى تعديل أسلوب التواصل واعتماد المحصل على تقديره وخبرته الشخصية' },
        { id: 4, title: 'ملاءمة التصنيف وفعالية الإجراءات', questions: [8, 9, 10], averageScore: 0, description: 'جدوى CPF في تسريع فهم الحالة واقتراح الإجراء ودعم جودة واتساق القرارات' }
      ],
      questions: QUESTION_META.map((q) => ({
        id: q.id,
        title: q.title,
        dimensionId: q.dimensionId,
        totalAnswers: 0,
        averageScore: 0,
        distribution: q.options.map((opt) => ({
          score: opt.score,
          label: opt.label,
          count: 0,
          percentage: 0
        }))
      })),
      comparativeByExperience: [],
      comparativeByPortfolio: [],
      comparativeByRegion: []
    };
  }

  // Calculate per question
  let sumAllScores = 0;
  let countAllScores = 0;

  const questionStats: QuestionStatItem[] = QUESTION_META.map((meta) => {
    const key = `q${meta.id}Score` as keyof CpfValidationRecord;
    let sumScore = 0;
    const distCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    records.forEach((r) => {
      const score = Number(r[key]) || 1;
      sumScore += score;
      distCounts[score] = (distCounts[score] || 0) + 1;
      sumAllScores += score;
      countAllScores += 1;
    });

    const averageScore = Number((sumScore / total).toFixed(2));
    const distribution = meta.options.map((opt) => {
      const count = distCounts[opt.score] || 0;
      return {
        score: opt.score,
        label: opt.label,
        count,
        percentage: Math.round((count / total) * 100)
      };
    });

    return {
      id: meta.id,
      title: meta.title,
      dimensionId: meta.dimensionId,
      totalAnswers: total,
      averageScore,
      distribution
    };
  });

  // Calculate dimension averages
  const calcDimAvg = (qIds: number[]) => {
    let sum = 0;
    let count = 0;
    qIds.forEach((qid) => {
      const q = questionStats.find((qs) => qs.id === qid);
      if (q) {
        sum += q.averageScore;
        count++;
      }
    });
    return count > 0 ? Number((sum / count).toFixed(2)) : 0;
  };

  const dimensions: DimensionStatItem[] = [
    {
      id: 1,
      title: 'تقييم العميل',
      questions: [1, 2, 3],
      averageScore: calcDimAvg([1, 2, 3]),
      description: 'قياس إدراك تباين قدرة العملاء على السداد والالتزام وأهمية مؤشرات التفاعل والظروف المالية'
    },
    {
      id: 2,
      title: 'التحديات التحصيلية',
      questions: [4, 5],
      averageScore: calcDimAvg([4, 5]),
      description: 'صعوبة تحديد الإجراء الأمثل من ملف العميل وتفاوت النتائج عند توحيد الإجراءات'
    },
    {
      id: 3,
      title: 'الاستراتيجيات المتبعة',
      questions: [6, 7],
      averageScore: calcDimAvg([6, 7]),
      description: 'مدى ملاءمة وتكييف أسلوب التواصل واعتماد المحصل على التقدير الشخصي'
    },
    {
      id: 4,
      title: 'ملاءمة التصنيف وفعالية الإجراءات',
      questions: [8, 9, 10],
      averageScore: calcDimAvg([8, 9, 10]),
      description: 'جدوى إطار CPF™ في سرعة فهم الحالة وتلقي إجراء مقترح ودعم جودة واتساق القرارات'
    }
  ];

  const overallAverage = countAllScores > 0 ? Number((sumAllScores / countAllScores).toFixed(2)) : 0;

  // Helper for comparative segments
  const buildComparativeGroup = (field: 'experienceYears' | 'portfolioType' | 'region') => {
    const groups: Record<string, CpfValidationRecord[]> = {};
    records.forEach((r) => {
      const val = r[field] || 'غير محدد';
      if (!groups[val]) groups[val] = [];
      groups[val].push(r);
    });

    return Object.entries(groups).map(([group, groupRecords]) => {
      const gTotal = groupRecords.length;
      const getAvg = (qIds: number[]) => {
        let sum = 0;
        let count = 0;
        groupRecords.forEach((r) => {
          qIds.forEach((qid) => {
            const k = `q${qid}Score` as keyof CpfValidationRecord;
            sum += Number(r[k]) || 1;
            count++;
          });
        });
        return count > 0 ? Number((sum / count).toFixed(2)) : 0;
      };

      const dim1Avg = getAvg([1, 2, 3]);
      const dim2Avg = getAvg([4, 5]);
      const dim3Avg = getAvg([6, 7]);
      const dim4Avg = getAvg([8, 9, 10]);
      const overallAvg = getAvg([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

      return {
        group,
        count: gTotal,
        dim1Avg,
        dim2Avg,
        dim3Avg,
        dim4Avg,
        overallAvg
      };
    });
  };

  return {
    totalParticipants: total,
    completionRate: 100,
    overallAverage,
    lastResponseDate,
    dimensions,
    questions: questionStats,
    comparativeByExperience: buildComparativeGroup('experienceYears'),
    comparativeByPortfolio: buildComparativeGroup('portfolioType'),
    comparativeByRegion: buildComparativeGroup('region')
  };
}
