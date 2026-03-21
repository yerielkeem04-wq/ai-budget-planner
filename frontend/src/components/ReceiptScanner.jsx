import React, { useState, useRef, useEffect } from 'react';

function ReceiptScanner({ session }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  // 💡 결과창 포커스를 위한 Ref
  const resultRef = useRef(null);
  // 💡 숨겨진 파일 입력을 제어하기 위한 Ref
  const fileInputRef = useRef(null);

  // 분석 결과가 생기면 해당 위치로 스크롤
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null); // 새로운 사진 선택 시 이전 결과 초기화
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/analyze-receipt`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("에러 발생:", error);
      alert("AI 분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;

    const payload = {
      ...result,
      user_id: session?.user?.id 
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/save-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("장부에 성공적으로 저장되었습니다! 💰");
        // 저장 후 초기화 (선택 사항)
        setFile(null);
        setPreview(null);
        setResult(null);
      } else {
        const errorData = await response.json();
        alert(`저장 실패: ${errorData.detail}`);
      }
    } catch (error) {
      console.error("네트워크 에러:", error);
      alert("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Scan Receipt</h2>
      
      {/* 📸 업로드 섹션 */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => fileInputRef.current.click()}
          className="flex flex-col items-center justify-center p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl hover:border-black transition-all group"
        >
          <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📂</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black">Album</span>
        </button>
        
        <button 
          onClick={() => fileInputRef.current.setAttribute('capture', 'environment') || fileInputRef.current.click()}
          className="flex flex-col items-center justify-center p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl hover:border-black transition-all group"
        >
          <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📸</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black">Camera</span>
        </button>
      </div>

      {/* 실제 파일 input (숨김 처리) */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef}
        onChange={handleFileChange} 
        className="hidden" 
      />

      {/* 미리보기 영역 */}
      {preview && (
        <div className="relative rounded-3xl overflow-hidden bg-black aspect-[4/3] shadow-2xl animate-in zoom-in-95 duration-300">
          <img src={preview} alt="미리보기" className="w-full h-full object-contain" />
          <button 
            onClick={() => {setFile(null); setPreview(null); setResult(null);}}
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white w-10 h-10 rounded-full flex items-center justify-center font-bold hover:bg-white/40"
          >
            ✕
          </button>
        </div>
      )}

      {/* 분석 버튼 */}
      <button 
        onClick={handleAnalyze} 
        disabled={loading || !file} 
        className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-sm transition-all active:scale-95 ${loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-900'}`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
            Analyzing...
          </span>
        ) : "Analyze with Gemini"}
      </button>

      {/* 💡 분석 결과 섹션 (자동 포커스 대상) */}
      {result && (
        <div 
          ref={resultRef}
          className="bg-white border border-gray-100 p-8 rounded-[2rem] space-y-6 shadow-2xl animate-in slide-in-from-bottom-8 duration-500 border-t-4 border-t-black"
        >
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <span className="font-black text-black text-xs uppercase tracking-[0.2em]">Verified Data</span>
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Ready to Save</span>
            </div>
          </div>

          <div className="space-y-5">
            <div className="group">
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1 group-hover:text-black transition-colors">Merchant Name</p>
              <p className="font-bold text-gray-900 text-xl tracking-tight">{result.상호명 || result.item || "Unknown"}</p>
            </div>
            
            <div className="group">
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1 group-hover:text-black transition-colors">Amount</p>
              <div className="flex items-baseline gap-1">
                <p className="font-black text-gray-900 text-3xl tracking-tighter">
                  {result.금액 || result.amount ? Number(String(result.금액 || result.amount).replace(/[^0-9]/g, '')).toLocaleString() : "0"}
                </p>
                <span className="text-xs font-black text-gray-400 uppercase">KRW</span>
              </div>
            </div>

            <div className="group">
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1 group-hover:text-black transition-colors">Transaction Date</p>
              <p className="font-bold text-gray-900 text-sm tracking-widest">{result.날짜 || result.date || "Unknown"}</p>
            </div>
          </div>

          <button 
            onClick={handleSave} 
            className="w-full bg-black text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98]"
          >
            Confirm & Save to Ledger
          </button>
        </div>
      )}
    </div>
  );
}

export default ReceiptScanner;