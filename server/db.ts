import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface StoredResponse {
  id: string;
  employeeName: string;
  department: string;
  jobTitle: string;
  stages: string[];
  products: string[];
  employeeId?: string;
  question1: 'نعم' | 'لا';
  question2: 'نعم، سيساعدني' | 'لا، لن يساعدني';
  question3: 'نعم' | 'لا';
  question4: 'نعم' | 'لا';
  question5: string;
  question6?: string;
  submittedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'responses.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    // Initialize with empty array
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

export function getAllResponses(): StoredResponse[] {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed: StoredResponse[] = JSON.parse(raw);
    return parsed.map((item) => ({
      ...item,
      employeeName: item.employeeName || '',
      department: item.department || '',
      jobTitle: item.jobTitle || '',
      stages: Array.isArray(item.stages) ? item.stages : [],
      products: Array.isArray(item.products) ? item.products : []
    }));
  } catch (err) {
    console.error('Error reading responses file:', err);
    return [];
  }
}

export function saveResponse(data: Omit<StoredResponse, 'id' | 'submittedAt'>): StoredResponse {
  ensureDataFile();
  const responses = getAllResponses();
  
  // Generate unique response ID
  const timestamp = new Date();
  const dateStr = timestamp.toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const id = `CPF-${dateStr}-${randomSuffix}`;
  
  const newRecord: StoredResponse = {
    id,
    employeeName: data.employeeName.trim(),
    department: (data.department || '').trim(),
    jobTitle: (data.jobTitle || '').trim(),
    stages: Array.isArray(data.stages) ? data.stages : [],
    products: Array.isArray(data.products) ? data.products : [],
    employeeId: data.employeeId ? data.employeeId.trim() : undefined,
    question1: data.question1,
    question2: data.question2,
    question3: data.question3,
    question4: data.question4,
    question5: data.question5,
    question6: (data.question6 || '').trim(),
    submittedAt: timestamp.toISOString()
  };

  responses.unshift(newRecord);
  
  // Write atomically
  const tempFile = `${DATA_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(responses, null, 2), 'utf-8');
  fs.renameSync(tempFile, DATA_FILE);

  return newRecord;
}

export function calculateStatistics(responses: StoredResponse[]) {
  const total = responses.length;
  if (total === 0) {
    return {
      totalParticipants: 0,
      q1YesPercentage: 0,
      q1YesCount: 0,
      q1NoCount: 0,
      q2YesPercentage: 0,
      q2YesCount: 0,
      q2NoCount: 0,
      q3YesPercentage: 0,
      q3YesCount: 0,
      q3NoCount: 0,
      q4YesPercentage: 0,
      q4YesCount: 0,
      q4NoCount: 0,
      q5AverageScore: 0,
      q5Distribution: [
        { score: 1, label: '١ — لا أتوقع أن يساهم', count: 0, percentage: 0 },
        { score: 2, label: '٢ — مساهمة محدودة', count: 0, percentage: 0 },
        { score: 3, label: '٣ — مساهمة متوسطة', count: 0, percentage: 0 },
        { score: 4, label: '٤ — مساهمة كبيرة', count: 0, percentage: 0 },
        { score: 5, label: '٥ — مساهمة كبيرة جدًا', count: 0, percentage: 0 }
      ]
    };
  }

  const q1Yes = responses.filter(r => r.question1 === 'نعم').length;
  const q1No = total - q1Yes;

  const q2Yes = responses.filter(r => r.question2 === 'نعم، سيساعدني').length;
  const q2No = total - q2Yes;

  const q3Yes = responses.filter(r => r.question3 === 'نعم').length;
  const q3No = total - q3Yes;

  const q4Yes = responses.filter(r => r.question4 === 'نعم').length;
  const q4No = total - q4Yes;

  const q5Options = [
    { score: 1, label: '١ — لا أتوقع أن يساهم', prefix: '١' },
    { score: 2, label: '٢ — مساهمة محدودة', prefix: '٢' },
    { score: 3, label: '٣ — مساهمة متوسطة', prefix: '٣' },
    { score: 4, label: '٤ — مساهمة كبيرة', prefix: '٤' },
    { score: 5, label: '٥ — مساهمة كبيرة جدًا', prefix: '٥' }
  ];

  let totalQ5Score = 0;
  const q5Distribution = q5Options.map(opt => {
    const count = responses.filter(r => {
      const val = (r.question5 || '').trim();
      return (
        val === opt.label ||
        val.startsWith(opt.prefix) ||
        val.startsWith(opt.score.toString())
      );
    }).length;
    totalQ5Score += count * opt.score;
    return {
      score: opt.score,
      label: opt.label,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    };
  });

  const q5AverageScore = total > 0 ? Number((totalQ5Score / total).toFixed(2)) : 0;

  return {
    totalParticipants: total,
    q1YesPercentage: Math.round((q1Yes / total) * 100),
    q1YesCount: q1Yes,
    q1NoCount: q1No,
    q2YesPercentage: Math.round((q2Yes / total) * 100),
    q2YesCount: q2Yes,
    q2NoCount: q2No,
    q3YesPercentage: Math.round((q3Yes / total) * 100),
    q3YesCount: q3Yes,
    q3NoCount: q3No,
    q4YesPercentage: Math.round((q4Yes / total) * 100),
    q4YesCount: q4Yes,
    q4NoCount: q4No,
    q5AverageScore,
    q5Distribution
  };
}

// In-memory token management
const activeTokens = new Set<string>();

export function createAdminToken(): string {
  const token = crypto.randomBytes(32).toString('hex');
  activeTokens.add(token);
  return token;
}

export function isValidAdminToken(token?: string): boolean {
  if (!token) return false;
  return activeTokens.has(token);
}

export function revokeAdminToken(token?: string): void {
  if (token) {
    activeTokens.delete(token);
  }
}
