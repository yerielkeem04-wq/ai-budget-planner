import React, { useEffect, useState } from 'react';
import './index.css';
import MainHome from './components/MainHome';
import ExpenseList from './components/ExpenseList';
import ReceiptScanner from './components/ReceiptScanner';
import Login from './components/Login';
import { supabase } from './supabaseClient';

function App() {
  const [activeTab, setActiveTab] = useState('main');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // 1. 인증 세션 감지 및 관리
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
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

  // 3. 서버에서 데이터 불러오기 (내 데이터만!)
  const fetchExpenses = async () => {
    if (!session) return;
    setLoading(true);
    try {
      // 💡 URL 뒤에 ?user_id=... 를 붙여서 내 데이터만 요청합니다.
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

  const totalAmount = expenses.reduce((sum, item) => sum + item.displayAmount, 0);

  if (!session) {
    return <Login />;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-0 sm:p-4 font-sans text-slate-900">
      <div className="relative flex flex-col w-full max-w-[420px] h-screen sm:h-[840px] bg-white shadow-xl overflow-hidden sm:rounded-[2rem]">
        
        {/* 상단 헤더 */}
        <header className="flex items-center justify-between px-8 h-20 bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <button 
            onClick={() => setActiveTab('main')}
            className={`text-[11px] font-black tracking-[0.2em] uppercase transition-colors ${
              activeTab === 'main' ? 'text-black' : 'text-gray-200 hover:text-gray-400'
            }`}
          >
            Home
          </button>
          <div className="h-[1px] w-6 bg-gray-100 rounded-full"></div>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
          >
            Logout
          </button>
        </header>

        {/* 중앙 콘텐츠 */}
        <div className="flex-1 overflow-y-auto px-8 pb-32">
          {activeTab === 'main' && (
            <MainHome totalAmount={totalAmount} onNavigate={setActiveTab} />
          )}

          {activeTab === 'home' && (
            <ExpenseList expenses={expenses} loading={loading} onRefresh={fetchExpenses} />
          )}

          {activeTab === 'scan' && (
            <ReceiptScanner 
              session={session} // 💡 세션 정보 전달 추가
              onSaveSuccess={() => {
                fetchExpenses();
                setActiveTab('home');
              }} 
            />
          )}

          {activeTab === 'report' && (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.4em]">Analysis</p>
              <div className="h-[1px] w-4 bg-gray-200"></div>
              <p className="text-gray-400 text-[11px] font-medium">데이터 수집 중입니다.</p>
            </div>
          )}
        </div>

        {/* 하단 네비게이션 */}
        <nav className="fixed bottom-0 left-0 w-full h-20 bg-white/95 backdrop-blur-md border-t border-gray-100 flex items-center justify-around z-50 px-6 pb-safe">
          <button 
            onClick={() => setActiveTab('home')} 
            className={`flex-1 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'home' ? 'text-black' : 'text-gray-200'}`}
          >
            History
          </button>
          <button 
            onClick={() => setActiveTab('scan')} 
            className={`flex-1 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'scan' ? 'text-black' : 'text-gray-200'}`}
          >
            Scan
          </button>
          <button 
            onClick={() => setActiveTab('report')} 
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