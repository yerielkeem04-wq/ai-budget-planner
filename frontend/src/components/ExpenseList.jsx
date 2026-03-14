import React from 'react';

function ExpenseList({ expenses, loading, onRefresh }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-800">지출 기록</h2>
        <button 
          onClick={onRefresh}
          className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600 hover:bg-gray-200"
        >
          새로고침
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400">기록을 불러오는 중...</div>
      ) : expenses.length === 0 ? (
        <div className="py-20 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
          아직 등록된 지출이 없어요.
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div className="space-y-1">
                <p className="font-bold text-gray-800 text-lg">{item.displayTitle}</p>
                <p className="text-xs text-gray-400 font-medium">{item.displayDate}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-red-500 text-lg">
                  -{item.displayAmount.toLocaleString()}원
                </p>
              </div>
            </div>
          ))}
          
          <div className="mt-8 p-6 bg-gray-900 rounded-[2rem] text-white shadow-xl">
            <p className="text-xs text-gray-400 mb-1 font-bold">합계 지출</p>
            <p className="text-2xl font-black">
              {expenses.reduce((sum, item) => sum + item.displayAmount, 0).toLocaleString()}원
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpenseList;