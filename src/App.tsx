import React, { useState, useEffect } from 'react';
import { SnbHeader, AppView } from './components/SnbHeader';
import { CpfValidationSurveyView } from './components/CpfValidationSurveyView';
import { SurveyIntroView } from './components/SurveyIntroView';
import { QuestionCard } from './components/QuestionCard';
import { SubmissionSuccessView } from './components/SubmissionSuccessView';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { QUESTIONS } from './data/questions';
import { EmployeeData } from './types';

type SurveyStep = 'intro' | 'question' | 'success';

export default function App() {
  // Navigation View State
  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        return 'admin';
      }
      if (path.startsWith('/survey-general') || path.startsWith('/general')) {
        return 'survey';
      }
    }
    // Default to the new CPF Validation Survey as requested
    return 'cpf-validation';
  });

  // Admin Auth State
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('snb_admin_token');
    }
    return null;
  });

  // General Survey State (Preserved 100%)
  const [surveyStep, setSurveyStep] = useState<SurveyStep>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [employeeData, setEmployeeData] = useState<EmployeeData>({
    employeeName: '',
    department: '',
    jobTitle: '',
    stages: [],
    products: []
  });
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResponseId, setSubmissionResponseId] = useState<string>('');
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Sync route with browser history
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        setCurrentView('admin');
      } else if (path.startsWith('/survey-general') || path.startsWith('/general')) {
        setCurrentView('survey');
      } else {
        setCurrentView('cpf-validation');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    let newPath = '/';
    if (view === 'admin') {
      newPath = '/admin';
    } else if (view === 'survey') {
      newPath = '/survey-general';
    } else {
      newPath = '/cpf-validation';
    }

    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // General Survey Handlers
  const handleStartSurvey = (data: EmployeeData) => {
    setEmployeeData(data);
    setCurrentQuestionIndex(0);
    setSurveyStep('question');
  };

  const handleSelectAnswer = (answer: string) => {
    const currentQ = QUESTIONS[currentQuestionIndex];
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else {
      setSurveyStep('intro');
    }
  };

  const handleSubmitSurvey = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const payload = {
        employeeName: employeeData.employeeName.trim(),
        department: employeeData.department.trim(),
        jobTitle: employeeData.jobTitle.trim(),
        stages: employeeData.stages,
        products: employeeData.products,
        question1: answers[1],
        question2: answers[2],
        question3: answers[3],
        question4: answers[4],
        question5: answers[5],
        question6: (answers[6] || '').trim()
      };

      const res = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmissionResponseId(data.id);
        setSurveyStep('success');
      } else {
        setSubmissionError(data.error || 'حدث خطأ أثناء إرسال الاستبيان، يرجى المحاولة ثانية.');
      }
    } catch (err) {
      console.error(err);
      setSubmissionError('تعذر الاتصال بالخادم، يرجى التحقق من الاتصال وإعادة المحاولة.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSurvey = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setSurveyStep('intro');
    setSubmissionResponseId('');
    setSubmissionError(null);
  };

  // Admin Logout
  const handleAdminLogout = async () => {
    if (adminToken) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        });
      } catch (e) {
        // ignore
      }
    }
    localStorage.removeItem('snb_admin_token');
    setAdminToken(null);
  };

  return (
    <div className="min-h-screen text-slate-900 flex flex-col font-sans selection:bg-[#005A36] selection:text-white relative overflow-x-hidden" dir="rtl">
      {/* Professional Background: Off-white canvas with subtle translucent emerald lines */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Base subtle off-white to ivory gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAFBF8] via-[#F4F6F1] to-[#F8FAF6]" />

        {/* Subtle translucent green geometric grid lines */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 90, 54, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 90, 54, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Elegant translucent diagonal accent lines */}
        <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="emeraldLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#005A36" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#005A36" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#005A36" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="10%" y1="0" x2="40%" y2="100%" stroke="url(#emeraldLineGrad)" strokeWidth="1.5" strokeDasharray="6 6" />
          <line x1="25%" y1="0" x2="55%" y2="100%" stroke="url(#emeraldLineGrad)" strokeWidth="1" />
          <line x1="60%" y1="0" x2="90%" y2="100%" stroke="url(#emeraldLineGrad)" strokeWidth="1.5" strokeDasharray="8 8" />
          <line x1="75%" y1="0" x2="105%" y2="100%" stroke="url(#emeraldLineGrad)" strokeWidth="1" />
        </svg>

        {/* Soft subtle ambient emerald glow */}
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-[#005A36]/[0.035] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-10 w-96 h-96 bg-[#005A36]/[0.025] rounded-full blur-3xl" />
      </div>

      {/* Global Header */}
      <div className="relative z-10">
        <SnbHeader
          currentView={currentView}
          onNavigate={navigateTo}
          isAdminLoggedIn={Boolean(adminToken)}
        />
      </div>

      {/* Main View Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-start py-2 sm:py-6">
        {/* View 1: Collection Persona Framework (CPF™) Validation Survey */}
        {currentView === 'cpf-validation' && (
          <CpfValidationSurveyView onGoToAdmin={() => navigateTo('admin')} />
        )}

        {/* View 2: General Survey */}
        {currentView === 'survey' && (
          <>
            {surveyStep === 'intro' && (
              <SurveyIntroView
                initialData={employeeData}
                onStartSurvey={handleStartSurvey}
              />
            )}

            {surveyStep === 'question' && (
              <>
                {submissionError && (
                  <div className="max-w-xl mx-auto px-2 sm:px-4 mb-2 sm:mb-3">
                    <div className="p-2 sm:p-3 bg-red-50 border border-red-200 text-red-700 text-[12px] rounded-lg">
                      {submissionError}
                    </div>
                  </div>
                )}
                <QuestionCard
                  question={QUESTIONS[currentQuestionIndex]}
                  currentIndex={currentQuestionIndex}
                  totalQuestions={QUESTIONS.length}
                  selectedAnswer={answers[QUESTIONS[currentQuestionIndex].id]}
                  onSelectAnswer={handleSelectAnswer}
                  onNext={handleNextQuestion}
                  onPrev={handlePrevQuestion}
                  onSubmit={handleSubmitSurvey}
                  isSubmitting={isSubmitting}
                  employeeData={employeeData}
                />
              </>
            )}

            {surveyStep === 'success' && (
              <SubmissionSuccessView
                responseId={submissionResponseId}
                employeeData={employeeData}
                onReset={handleResetSurvey}
                onGoToAdmin={() => navigateTo('admin')}
              />
            )}
          </>
        )}

        {/* View 3: Admin Portal */}
        {currentView === 'admin' && (
          <>
            {!adminToken ? (
              <AdminLogin
                onLoginSuccess={(token) => setAdminToken(token)}
                onBackToSurvey={() => navigateTo('cpf-validation')}
              />
            ) : (
              <AdminDashboard
                token={adminToken}
                onLogout={handleAdminLogout}
                onGoToSurvey={() => navigateTo('cpf-validation')}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
