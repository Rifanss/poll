import React, { useState } from 'react';
import { Lock, User, KeyRound, AlertCircle, ShieldAlert, ArrowLeft } from 'lucide-react';
import { SnbLogo } from './SnbLogo';

interface AdminLoginProps {
  onLoginSuccess: (token: string) => void;
  onBackToSurvey: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToSurvey
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim()
        })
      });

      const data = await res.json();

      if (res.ok && data.success && data.token) {
        // Save token in memory/localStorage for session
        localStorage.setItem('snb_admin_token', data.token);
        onLoginSuccess(data.token);
      } else {
        setErrorMessage(data.message || 'اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage('حدث خطأ أثناء الاتصال بالخادم، يرجى المحاولة لاحقًا');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="admin-login-screen" className="w-full max-w-md mx-auto px-2 sm:px-4 py-4 sm:py-12" dir="rtl">
      {/* Return link */}
      <div className="mb-3">
        <button
          type="button"
          onClick={onBackToSurvey}
          className="inline-flex items-center gap-1.5 text-[12px] sm:text-xs text-slate-500 hover:text-[#063720] font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3 h-3 rotate-180" />
          <span>العودة إلى واجهة الاستبيان</span>
        </button>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Top Header */}
        <div className="bg-[#063720] p-4 sm:p-6 text-white text-center relative">
          <div className="flex justify-center mb-2 sm:mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-[#C5A059]" />
            </div>
          </div>
          <h1 className="text-base sm:text-xl font-bold tracking-tight">تسجيل الدخول</h1>
          <p className="text-[12px] text-emerald-200/80 mt-1">
            لوحة تحكم نتائج الاستبيان • الدخول مخصص للمشرفين المصرح لهم فقط
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-6 space-y-3 sm:space-y-4">
          {errorMessage && (
            <div
              id="admin-login-error"
              className="flex items-center gap-2 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[12px] font-medium"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Username */}
          <div>
            <label
              htmlFor="admin-username"
              className="block text-[12px] sm:text-xs font-semibold text-slate-700 mb-1"
            >
              اسم المستخدم
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-2.5 sm:pr-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <input
                id="admin-username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="أدخل اسم المستخدم"
                className="w-full pr-8 sm:pr-9 pl-3 py-1.5 sm:py-2.5 text-[12px] sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#063720]/30 focus:border-[#063720] outline-hidden text-slate-900 transition-all font-mono"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="admin-password"
              className="block text-[12px] sm:text-xs font-semibold text-slate-700 mb-1"
            >
              كلمة المرور
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-2.5 sm:pr-3 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="أدخل كلمة المرور"
                className="w-full pr-8 sm:pr-9 pl-3 py-1.5 sm:py-2.5 text-[12px] sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#063720]/30 focus:border-[#063720] outline-hidden text-slate-900 transition-all font-mono"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-1">
            <button
              id="btn-admin-login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full h-9 sm:h-11 flex items-center justify-center gap-1.5 bg-[#063720] hover:bg-[#042516] active:bg-[#031d11] text-white font-semibold text-[12px] sm:text-sm rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <span className="flex items-center gap-1.5">
                  <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>جاري التحقق...</span>
                </span>
              ) : (
                <span>دخول</span>
              )}
            </button>
          </div>

          {/* Internal Access Notice */}
          <div className="mt-3 p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-lg text-[10px] sm:text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <ShieldAlert className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#063720]" />
              <span>ملاحظة أمنية داخلية:</span>
            </div>
            <p>
              يتم التحقق من الصلاحيات وتوليد رمز الجلسة الآمن مباشرة عبر خادم البنك لحماية سرية بيانات المشاركين.
            </p>
            <p className="text-slate-500 font-mono text-[10px] pt-0.5">
              (بيانات الدخول التجريبية للمشرف: admin / SNB@CPF2026)
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
