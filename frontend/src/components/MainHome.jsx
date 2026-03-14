import React from 'react';

function MainHome({ totalAmount, onNavigate }) {
  return (
    <div className="flex flex-col space-y-10 py-4 animate-in fade-in duration-500">
      {/* 웰컴 섹션 */}
      <div className="space-y-1">
        <p className="text-gray-400 text-xs font-semibold tracking-wider uppercase">Finance Manager</p>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">
          지출 관리
        </h1>
      </div>

      {/* 요약 카드 */}
      <div 
        onClick={() => onNavigate('home')}
        className="bg-gray-900 p-8 rounded-2xl text-white shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
      >
        <p className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-tight">Monthly Spending</p>
        <div className="flex justify-between items-end">
          <h2 className="text-4xl font-extrabold tracking-tighter">{(totalAmount || 0).toLocaleString()}<span className="text-xl font-normal ml-1">KRW</span></h2>
          <span className="text-[10px] text-gray-400 border-b border-gray-700 pb-0.5">VIEW DETAILS</span>
        </div>
      </div>

      {/* 액션 버튼 그룹 */}
      <div className="flex flex-col gap-3">
        <button 
          onClick={() => onNavigate('scan')}
          className="w-full bg-white py-5 rounded-xl border border-gray-200 text-gray-800 font-bold text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors uppercase tracking-widest"
        >
          Scan Receipt
        </button>
        <button 
          onClick={() => onNavigate('report')}
          className="w-full bg-white py-5 rounded-xl border border-gray-200 text-gray-800 font-bold text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors uppercase tracking-widest"
        >
          AI Analytics
        </button>
      </div>

      {/* 하단 팁 (텍스트 위주) */}
      <div className="pt-4 border-t border-gray-50">
        <p className="text-[11px] text-gray-400 leading-relaxed">
          영수증을 촬영하면 인공지능이 상호명과 결제 금액을 <br/>자동으로 추출하여 장부에 기록합니다.
        </p>
      </div>
    </div>
  );
}

export default MainHome;