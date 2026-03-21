import React, { useEffect, useState } from 'react';
import './index.css';
import MainHome from './components/MainHome';
import ExpenseList from './components/ExpenseList';
import ReceiptScanner from './components/ReceiptScanner';
import Login from './components/Login';
import SignUp from './components/SignUp'; // 💡 회원가입 컴포넌트 추가 필요
import { supabase } from './supabaseClient';

function App() {
  const [activeTab, setActiveTab] = useState('main');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  
  // 💡 'login', 'signup' 화면 전환을 위한 상태
  const [authMode, setAuthMode] = useState(null); 

  // 1. 인증 세션 감지 및 관리
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setAuthMode(null); // 로그인 성공 시 인증 화면 닫기
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. 데이터 가공 로직
  const parseExpenseData = (item) => {
    const hasColon = item.question?.includes(':');
    const displayTitle = hasColon ? item.question.split(':')[0] : (item.answer?.includes('/') ? item.answer.split('/')[2] : item.question);
    const rawAmount = hasColon ? item.question.split(':')[1] : item.question;
    const displayAmount = Number(String(rawAmount).replace(/[^0-9]/g, '')) || 0;
    const displayDate = item.created_at ? item.created_at.split('T')[0] : "날짜 미상";
    return { ...item, displayTitle, displayAmount, displayDate };
  };

  // 3. 서버에서 데이터 불러오기
  const fetchExpenses = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/history?user_id=${session.user.id}`);
      const data = await response.json();
      setExpenses(data.map(parseExpenseData));
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchExpenses();
    }
  }, [session]);

  // 💡 탭 전환 핸들러 (권한 체크)
  const handleTabChange = (tab) => {
    const protectedTabs = ['home', 'scan', 'report'];
    if (protectedTabs.includes(tab) && !session) {
      setAuthMode('login'); // 로그인이 필요한 탭 클릭 시 로그인 화면으로
      return;
    }
    setActiveTab(tab);
    setAuthMode(null);
  };

  const totalAmount = expenses.reduce((sum, item) => sum + item.displayAmount, 0);

  // --- 조건부 렌더링 시작 ---

  // 💡 로그인 화면 모드
  if (authMode === 'login') {
    return <Login onGoSignUp={() => setAuthMode('signup')} onCancel={() => setAuthMode(null)} />;
  }

  // 💡 회원가입 화면 모드
  if (authMode === 'signup') {
    return <SignUp onGoLogin={() => setAuthMode('login')} onCancel={() => setAuthMode(null)} />;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-0 sm:p-4 font-sans text-slate-900">
      <div className="relative flex flex-col w-full max-w-[420px] h-screen sm:h-[840px] bg-white shadow-xl overflow-hidden sm:rounded-[2rem]">
        
        {/* 상단 헤더 */}
        <header className="flex items-center justify-between px-8 h-20 bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <button 
            onClick={() => handleTabChange('main')}
            className={`text-[11px] font-black tracking-[0.2em] uppercase transition-colors ${
              activeTab === 'main' ? 'text-black' : 'text-gray-200 hover:text-gray-400'
            }`}
          >
            Home
          </button>
          
          <div className="flex items-center space-x-4">
            {session ? (
              <button 
                onClick={() => {
                  supabase.auth.signOut();
                  setActiveTab('main');
                }} 
                className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-black"
              >
                Logout
              </button>
            ) : (
              <button 
                onClick={() => setAuthMode('login')}
                className="text-[10px] font-bold text-black uppercase tracking-widest"
              >
                Login
              </button>
            )}
          </div>
        </header>

        {/* 중앙 콘텐츠 */}
        <div className="flex-1 overflow-y-auto px-8 pb-32">
          {activeTab === 'main' && (
            <MainHome totalAmount={totalAmount} onNavigate={handleTabChange} />
          )}

          {/* 로그인된 사용자만 접근 가능한 콘텐츠 */}
          {session && (
            <>
              {activeTab === 'home' && (
                <ExpenseList expenses={expenses} loading={loading} onRefresh={fetchExpenses} />
              )}
              {activeTab === 'scan' && (
                <ReceiptScanner 
                  session={session}
                  onSaveSuccess={() => {
                    fetchExpenses();
                    handleTabChange('home');
                  }} 
                />
              )}
              {activeTab === 'report' && (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.4em]">Analysis</p>
                  <p className="text-gray-400 text-[11px] font-medium">리포트 준비 중입니다.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* 하단 네비게이션 */}
        <nav className="fixed bottom-0 left-0 w-full h-20 bg-white/95 backdrop-blur-md border-t border-gray-100 flex items-center justify-around z-50 px-6 pb-safe">
          <button 
            onClick={() => handleTabChange('home')} 
            className={`flex-1 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'home' ? 'text-black' : 'text-gray-200'}`}
          >
            History
          </button>
          <button 
            onClick={() => handleTabChange('scan')} 
            className={`flex-1 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'scan' ? 'text-black' : 'text-gray-200'}`}
          >
            Scan
          </button>
          <button 
            onClick={() => handleTabChange('report')} 
            className={`flex-1 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'report' ? 'text-black' : 'text-gray-200'}`}
          >
            Report
          </button>
        </nav>
      </div>
    </div>
  );
}

export default App;