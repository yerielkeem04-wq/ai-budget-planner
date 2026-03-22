import React, { useMemo, useState } from 'react';

function ExpenseList({ expenses, loading, onRefresh, session }) {
  // 모달 상태 및 입력 필드 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0], // 오늘 날짜 기본값
    amount: '',
    category: '식비',
    title: ''
  });

  // 1. 총 합계 계산 (item.displayAmount 기준)
  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, item) => {
      // 숫자가 아닐 경우를 대비해 Number() 처리
      const val = Number(item.displayAmount) || 0;
      return sum + val;
    }, 0);
  }, [expenses]);

  // 2. 날짜별 그룹화 로직
  const groupedExpenses = useMemo(() => {
    const groups = {};
    expenses.forEach((item) => {
      // displayDate가 없으면 trsn_date나 오늘 날짜로 대체
      const fullDate = item.displayDate || item.trsn_date || new Date().toISOString();
      const datePart = fullDate.split(' ')[0];
      
      if (!groups[datePart]) groups[datePart] = [];
      groups[datePart].push(item);
    });

    return Object.keys(groups)
      .sort()
      .reverse()
      .map(date => ({
        date,
        items: groups[date],
        dayTotal: groups[date].reduce((sum, item) => sum + (Number(item.displayAmount) || 0), 0)
      }));
  }, [expenses]);

  // 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense(prev => ({ ...prev, [name]: value }));
  };

  // 등록 실행
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newExpense.amount || !newExpense.title) {
      return alert("내용과 금액을 모두 입력해주세요!");
    }

    const userId = session?.user?.id;
    if (!userId) {
      return alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
    }
    
    try {
      // 🚀 백엔드 API 호출 (main.py의 save-minireceipt)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/save-minireceipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: newExpense.title,
          amount: newExpense.amount,
          date: newExpense.date,
          category: newExpense.category,
          user_id: userId 
        })
      });

      if (response.ok) {
        alert("지출이 성공적으로 등록되었습니다! 🎉");
        if (onRefresh) onRefresh(); // 부모 리스트 새로고침 호출
        setIsModalOpen(false); // 모달 닫기
        // 필드 초기화
        setNewExpense({ 
          date: new Date().toISOString().split('T')[0], 
          amount: '', 
          category: '식비', 
          title: '' 
        });
      } else {
        const err = await response.json();
        alert(`저장 실패: ${err.detail || '알 수 없는 에러'}`);
      }
    } catch (error) {
      console.error("저장 에러:", error);
      alert("서버와 통신 중 에러가 발생했습니다.");
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20 relative">
      {/* 🔝 상단 합계 블랙박스 */}
      <div className="p-6 bg-gray-950 rounded-[1.8rem] text-white shadow-2xl flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <p className="text-[10px] text-gray-500 mb-0.5 font-bold uppercase tracking-[0.15em]">Total Expense</p>
          <p className="text-2xl font-black tracking-tighter">
            -{totalAmount.toLocaleString()}<span className="text-sm ml-0.5 font-bold opacity-80">원</span>
          </p>
        </div>
        <button onClick={onRefresh} className="relative z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/20 transition-all active:scale-90 group">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:rotate-180 transition-all duration-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>

      {/* 💡 플러스(+) 버튼 */}
      <div className="flex justify-center -mt-6 relative z-20">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-950 text-white shadow-xl border-[3px] border-white hover:bg-gray-800 transition-all active:scale-95 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor" className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      {/* 📝 입력 모달 창 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white rounded-t-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-900 tracking-tighter">지출 내역 추가</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">날짜</label>
                <input type="date" name="date" value={newExpense.date} onChange={handleInputChange} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-gray-950 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">지출 내용</label>
                <input type="text" name="title" placeholder="어디에 쓰셨나요?" value={newExpense.title} onChange={handleInputChange} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-gray-950 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">금액</label>
                  <input type="number" name="amount" placeholder="0" value={newExpense.amount} onChange={handleInputChange} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-gray-950 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">분류</label>
                  <select name="category" value={newExpense.category} onChange={handleInputChange} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-gray-950 outline-none appearance-none">
                    <option>식비</option>
                    <option>마트/편의점</option>
                    <option>패션/미용</option>
                    <option>교통</option>
                    <option>취미</option>
                  </select>
                </div>
              </div>
              
              <button className="w-full bg-gray-950 text-white rounded-2xl py-4 mt-4 font-black text-sm hover:bg-gray-800 active:scale-[0.98] transition-all shadow-lg shadow-gray-200">
                지출 등록하기
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 📄 지출 리스트 영역 */}
      {loading ? (
        <div className="py-24 text-center text-gray-400 text-[11px] font-bold tracking-widest uppercase animate-pulse">Updating...</div>
      ) : (
        <div className="space-y-8 mt-6 px-1">
          {groupedExpenses.length === 0 ? (
            <div className="py-20 text-center text-gray-300 text-xs font-bold uppercase tracking-widest">No Expenses Found</div>
          ) : (
            groupedExpenses.map((group) => (
              <div key={group.date} className="group/date">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2 mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-gray-950 text-xl tracking-tighter">{new Date(group.date).getDate()}</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase">
                      {new Date(group.date).toLocaleDateString('ko-KR', { weekday: 'short' })}요일
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-gray-400">{group.dayTotal.toLocaleString()}원</span>
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <div key={item.id} className="py-3.5 flex items-center justify-between px-2 rounded-2xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <span className="text-[10px] font-black text-gray-300 min-w-[32px] flex-shrink-0 uppercase">{item.category || '기타'}</span>
                        <p className="font-bold text-gray-800 text-[14px] truncate leading-none">
                          {item.displayTitle || item['Merchant Name'] || '이름 없음'}
                        </p>
                        <span className="text-[9px] text-gray-200 font-bold flex-shrink-0 mt-0.5">CARD</span>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <p className="font-black text-gray-900 text-[15px] tracking-tighter whitespace-nowrap">
                          {(Number(item.displayAmount) || 0).toLocaleString()}<span className="text-[11px] ml-0.5 font-bold">원</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default ExpenseList;