import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  getAllResponses,
  saveResponse,
  calculateStatistics,
  createAdminToken,
  isValidAdminToken,
  revokeAdminToken
} from './server/db.ts';
import {
  getAllCpfValidationResponses,
  saveCpfValidationResponse,
  calculateCpfValidationStatistics,
  CpfValidationRecord
} from './server/cpfValidationDb.ts';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Survey Submission API
  app.post('/api/survey/submit', (req, res) => {
    try {
      const {
        employeeName,
        department,
        jobTitle,
        stages,
        products,
        employeeId,
        question1,
        question2,
        question3,
        question4,
        question5,
        question6
      } = req.body;

      if (!employeeName || typeof employeeName !== 'string' || !employeeName.trim()) {
        return res.status(400).json({ error: 'الاسم مطلوب' });
      }
      if (!department || typeof department !== 'string' || !department.trim()) {
        return res.status(400).json({ error: 'الادارة / الوكالة مطلوبة' });
      }
      if (!jobTitle || typeof jobTitle !== 'string' || !jobTitle.trim()) {
        return res.status(400).json({ error: 'المسمى الوظيفي مطلوب' });
      }
      if (!Array.isArray(stages) || stages.length === 0) {
        return res.status(400).json({ error: 'يرجى اختيار مرحلة واحدة على الأقل' });
      }
      if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: 'يرجى اختيار منتج واحد على الأقل' });
      }

      if (!question1 || !['نعم', 'لا'].includes(question1)) {
        return res.status(400).json({ error: 'إجابة السؤال الأول مطلوبة' });
      }
      if (!question2 || !['نعم، سيساعدني', 'لا، لن يساعدني'].includes(question2)) {
        return res.status(400).json({ error: 'إجابة السؤال الثاني مطلوبة' });
      }
      if (!question3 || !['نعم', 'لا'].includes(question3)) {
        return res.status(400).json({ error: 'إجابة السؤال الثالث مطلوبة' });
      }
      if (!question4 || !['نعم', 'لا'].includes(question4)) {
        return res.status(400).json({ error: 'إجابة السؤال الرابع مطلوبة' });
      }
      if (!question5 || typeof question5 !== 'string' || !question5.trim()) {
        return res.status(400).json({ error: 'إجابة السؤال الخامس مطلوبة' });
      }

      const saved = saveResponse({
        employeeName,
        department,
        jobTitle,
        stages,
        products,
        employeeId,
        question1,
        question2,
        question3,
        question4,
        question5,
        question6: typeof question6 === 'string' ? question6.trim() : ''
      });

      return res.status(201).json({
        success: true,
        id: saved.id,
        submittedAt: saved.submittedAt
      });
    } catch (err) {
      console.error('Submission error:', err);
      return res.status(500).json({ error: 'حدث خطأ أثناء حفظ الاستبيان' });
    }
  });

  // CPF Validation Survey Submission API
  app.post('/api/cpf-validation/submit', (req, res) => {
    try {
      const {
        q1Score, q1Text,
        q2Score, q2Text,
        q3Score, q3Text,
        q4Score, q4Text,
        q5Score, q5Text,
        q6Score, q6Text,
        q7Score, q7Text,
        q8Score, q8Text,
        q9Score, q9Text,
        q10Score, q10Text,
        experienceYears,
        portfolioType,
        region
      } = req.body;

      // Validate all 10 questions are present and scored 1-5
      const scores = [
        q1Score, q2Score, q3Score, q4Score, q5Score,
        q6Score, q7Score, q8Score, q9Score, q10Score
      ];

      for (let i = 0; i < scores.length; i++) {
        const sc = Number(scores[i]);
        if (!sc || sc < 1 || sc > 5) {
          return res.status(400).json({ error: `إجابة السؤال ${i + 1} مطلوبة بقيمة بين 1 و 5` });
        }
      }

      if (!experienceYears || typeof experienceYears !== 'string' || !experienceYears.trim()) {
        return res.status(400).json({ error: 'يرجى تحديد سنوات الخبرة في مجال التحصيل' });
      }
      if (!portfolioType || typeof portfolioType !== 'string' || !portfolioType.trim()) {
        return res.status(400).json({ error: 'يرجى تحديد نوع المحفظة التي تتعامل معها' });
      }

      const saved = saveCpfValidationResponse({
        q1Score: Number(q1Score),
        q1Text: String(q1Text || ''),
        q2Score: Number(q2Score),
        q2Text: String(q2Text || ''),
        q3Score: Number(q3Score),
        q3Text: String(q3Text || ''),
        q4Score: Number(q4Score),
        q4Text: String(q4Text || ''),
        q5Score: Number(q5Score),
        q5Text: String(q5Text || ''),
        q6Score: Number(q6Score),
        q6Text: String(q6Text || ''),
        q7Score: Number(q7Score),
        q7Text: String(q7Text || ''),
        q8Score: Number(q8Score),
        q8Text: String(q8Text || ''),
        q9Score: Number(q9Score),
        q9Text: String(q9Text || ''),
        q10Score: Number(q10Score),
        q10Text: String(q10Text || ''),
        experienceYears: String(experienceYears).trim(),
        portfolioType: String(portfolioType).trim(),
        region: region && typeof region === 'string' ? String(region).trim() : ''
      });

      return res.status(201).json({
        success: true,
        id: saved.id,
        submittedAt: saved.submittedAt
      });
    } catch (err) {
      console.error('CPF Validation Submission error:', err);
      return res.status(500).json({ error: 'حدث خطأ أثناء حفظ استبيان التحقق المبدئي' });
    }
  });

  // Admin Login API
  app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const expectedUser = process.env.ADMIN_USERNAME || 'admin';
    const expectedPass = process.env.ADMIN_PASSWORD || 'SNB@CPF2026';

    if (username === expectedUser && password === expectedPass) {
      const token = createAdminToken();
      return res.json({ success: true, token });
    }

    return res.status(401).json({
      success: false,
      message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
    });
  });

  // Helper auth middleware
  function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
    const authHeader = req.headers.authorization;
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.query.token && typeof req.query.token === 'string') {
      token = req.query.token;
    }

    if (!token || !isValidAdminToken(token)) {
      return res.status(401).json({ error: 'غير مصرح بالوصول إلى لوحة الإدارة' });
    }
    next();
  }

  // Verify Admin Session
  app.get('/api/admin/verify', requireAdmin, (req, res) => {
    res.json({ success: true });
  });

  // Admin Data & Statistics API
  app.get('/api/admin/responses', requireAdmin, (req, res) => {
    const responses = getAllResponses();
    const statistics = calculateStatistics(responses);
    res.json({
      responses,
      statistics
    });
  });

  // Admin Export CSV API
  app.get('/api/admin/export', requireAdmin, (req, res) => {
    const responses = getAllResponses();
    
    // Format as CSV with UTF-8 BOM so Microsoft Excel handles Arabic characters properly
    const bom = '\uFEFF';
    const headers = [
      'رقم الاستجابة',
      'الاسم',
      'الادارة / الوكالة',
      'المسمى الوظيفي',
      'المرحلة',
      'المنتج',
      'السؤال الأول (اختلاف أنماط واستجابة المتعثرين)',
      'السؤال الثاني (تصنيف العملاء وتحديد أسلوب التواصل والإجراء)',
      'السؤال الثالث (توضيح نمط وحالة العميل لاختيار القناة والتعامل)',
      'السؤال الرابع (ربط النمط بإجراء تحصيلي مقترح)',
      'السؤال الخامس (مستوى مساهمة CPF في دعم القرارات)',
      'السؤال السادس (ملاحظات ومقترحات تطوير الفكرة عمليًا)',
      'تاريخ ووقت الإرسال'
    ];

    const escapeCsv = (val: string) => {
      const sanitized = (val || '').replace(/"/g, '""');
      return `"${sanitized}"`;
    };

    const rows = responses.map(r => [
      escapeCsv(r.id),
      escapeCsv(r.employeeName),
      escapeCsv(r.department || ''),
      escapeCsv(r.jobTitle || ''),
      escapeCsv(Array.isArray(r.stages) ? r.stages.join(' ، ') : ''),
      escapeCsv(Array.isArray(r.products) ? r.products.join(' ، ') : ''),
      escapeCsv(r.question1),
      escapeCsv(r.question2),
      escapeCsv(r.question3),
      escapeCsv(r.question4),
      escapeCsv(r.question5),
      escapeCsv(r.question6 || ''),
      escapeCsv(new Date(r.submittedAt).toLocaleString('ar-SA'))
    ]);

    const csvContent = bom + [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="cpf_responses_${Date.now()}.csv"`);
    res.send(csvContent);
  });

  // CPF Validation Admin Data & Statistics API
  app.get('/api/cpf-validation/admin/responses', requireAdmin, (req, res) => {
    const responses = getAllCpfValidationResponses();
    const statistics = calculateCpfValidationStatistics(responses);
    res.json({
      responses,
      statistics
    });
  });

  // CPF Validation Admin Export CSV API
  app.get('/api/cpf-validation/admin/export-csv', requireAdmin, (req, res) => {
    const responses = getAllCpfValidationResponses();
    const bom = '\uFEFF';
    const headers = [
      'معرف الاستجابة',
      'تاريخ ووقت الإرسال',
      'سنوات الخبرة في التحصيل',
      'نوع المحفظة الأساسية',
      'المنطقة الجغرافية',
      'س1 (درجة)',
      'س1 (إجابة)',
      'س2 (درجة)',
      'س2 (إجابة)',
      'س3 (درجة)',
      'س3 (إجابة)',
      'س4 (درجة)',
      'س4 (إجابة)',
      'س5 (درجة)',
      'س5 (إجابة)',
      'س6 (درجة)',
      'س6 (إجابة)',
      'س7 (درجة)',
      'س7 (إجابة)',
      'س8 (درجة)',
      'س8 (إجابة)',
      'س9 (درجة)',
      'س9 (إجابة)',
      'س10 (درجة)',
      'س10 (إجابة)'
    ];

    const escapeCsv = (val: string | number) => {
      const sanitized = String(val ?? '').replace(/"/g, '""');
      return `"${sanitized}"`;
    };

    const rows = responses.map(r => [
      escapeCsv(r.id),
      escapeCsv(new Date(r.submittedAt).toLocaleString('ar-SA')),
      escapeCsv(r.experienceYears),
      escapeCsv(r.portfolioType),
      escapeCsv(r.region),
      escapeCsv(r.q1Score),
      escapeCsv(r.q1Text),
      escapeCsv(r.q2Score),
      escapeCsv(r.q2Text),
      escapeCsv(r.q3Score),
      escapeCsv(r.q3Text),
      escapeCsv(r.q4Score),
      escapeCsv(r.q4Text),
      escapeCsv(r.q5Score),
      escapeCsv(r.q5Text),
      escapeCsv(r.q6Score),
      escapeCsv(r.q6Text),
      escapeCsv(r.q7Score),
      escapeCsv(r.q7Text),
      escapeCsv(r.q8Score),
      escapeCsv(r.q8Text),
      escapeCsv(r.q9Score),
      escapeCsv(r.q9Text),
      escapeCsv(r.q10Score),
      escapeCsv(r.q10Text)
    ]);

    const csvContent = bom + [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="cpf_validation_survey_${Date.now()}.csv"`);
    res.send(csvContent);
  });

  // CPF Validation Admin Export Excel (.xls SpreadsheetML) API
  app.get('/api/cpf-validation/admin/export-excel', requireAdmin, (req, res) => {
    const responses = getAllCpfValidationResponses();

    const escapeXml = (str: string | number) => {
      return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const headers = [
      'معرف الاستجابة',
      'تاريخ الإرسال',
      'سنوات الخبرة',
      'نوع المحفظة',
      'المنطقة',
      'س1 (درجة)',
      'س1 (نص)',
      'س2 (درجة)',
      'س2 (نص)',
      'س3 (درجة)',
      'س3 (نص)',
      'س4 (درجة)',
      'س4 (نص)',
      'س5 (درجة)',
      'س5 (نص)',
      'س6 (درجة)',
      'س6 (نص)',
      'س7 (درجة)',
      'س7 (نص)',
      'س8 (درجة)',
      'س8 (نص)',
      'س9 (درجة)',
      'س9 (نص)',
      'س10 (درجة)',
      'س10 (نص)'
    ];

    let rowsXml = `<Row ss:StyleID="HeaderStyle">` +
      headers.map(h => `<Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`).join('') +
      `</Row>\n`;

    responses.forEach(r => {
      rowsXml += `<Row>` +
        `<Cell><Data ss:Type="String">${escapeXml(r.id)}</Data></Cell>` +
        `<Cell><Data ss:Type="String">${escapeXml(new Date(r.submittedAt).toLocaleString('ar-SA'))}</Data></Cell>` +
        `<Cell><Data ss:Type="String">${escapeXml(r.experienceYears)}</Data></Cell>` +
        `<Cell><Data ss:Type="String">${escapeXml(r.portfolioType)}</Data></Cell>` +
        `<Cell><Data ss:Type="String">${escapeXml(r.region)}</Data></Cell>` +
        `<Cell><Data ss:Type="Number">${r.q1Score}</Data></Cell>` +
        `<Cell><Data ss:Type="String">${escapeXml(r.q1Text)}</Data></Cell>` +
        `<Cell><Data ss:Type="Number">${r.q2Score}</Data></Cell>` +
        `<Cell><Data ss:Type="String">${escapeXml(r.q2Text)}</Data></Cell>` +
        `<Cell><Data ss:Type="Number">${r.q3Score}</Data></Cell>` +
        `<Cell><Data ss:Type="String">${escapeXml(r.q3Text)}</Data></Cell>` +
        `<Cell><Data ss:Type="Number">${r.q4Score}</Data></Cell>` +
        `<Cell><Data ss:Type="String">${escapeXml(r.q4Text)}</Data></Cell>` +
        `<Cell><Data ss:Type="Number">${r.q5Score}</Data></Cell>` +
        `<Cell><Data ss:Type="String">${escapeXml(r.q5Text)}</Data></Cell>` +
        `<Cell><Data ss:Type="Number">${r.q6Score}</Data></Cell>` +
        `<Cell><Data ss:Type="String">${escapeXml(r.q6Text)}</Data></Cell>` +
        `<Cell><Data ss:Type="Number">${r.q7Score}</Data></Cell>` +
        `<Cell><Data ss:Type="String">${escapeXml(r.q7Text)}</Data></Cell>` +
        `<Cell><Data ss:Type="Number">${r.q8Score}</Data></Cell>` +
        `<Cell><Data ss:Type="String">${escapeXml(r.q8Text)}</Data></Cell>` +
        `<Cell><Data ss:Type="Number">${r.q9Score}</Data></Cell>` +
        `<Cell><Data ss:Type="String">${escapeXml(r.q9Text)}</Data></Cell>` +
        `<Cell><Data ss:Type="Number">${r.q10Score}</Data></Cell>` +
        `<Cell><Data ss:Type="String">${escapeXml(r.q10Text)}</Data></Cell>` +
        `</Row>\n`;
    });

    const excelXml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center" ss:ReadingOrder="RightToLeft"/>
   <Font ss:FontName="IBM Plex Sans Arabic, Tahoma" x:CharSet="1" ss:Size="11"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:ReadingOrder="RightToLeft"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#005A36"/>
   </Borders>
   <Font ss:FontName="IBM Plex Sans Arabic, Tahoma" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#005A36" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="نتائج استبيان CPF" ss:RightToLeft="1">
  <Table ss:DefaultColumnWidth="120" ss:DefaultRowHeight="22">
   ${rowsXml}
  </Table>
 </Worksheet>
</Workbook>`;

    res.setHeader('Content-Type', 'application/vnd.ms-excel; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="cpf_validation_survey_${Date.now()}.xls"`);
    res.send(excelXml);
  });

  // Admin Logout API
  app.post('/api/admin/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      revokeAdminToken(token);
    }
    res.json({ success: true });
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
