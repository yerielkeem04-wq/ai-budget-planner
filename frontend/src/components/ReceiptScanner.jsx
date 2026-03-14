import React, { useState } from 'react';

function ReceiptScanner({ session }) { // 💡 session prop 수신
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
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

    // 💡 분석 결과에 user_id를 병합하여 전송
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Scan Receipt</h2>
      
      <div className="group relative border-2 border-dashed border-gray-100 hover:border-black p-8 rounded-3xl bg-gray-50/50 transition-all text-center">
        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        {preview ? (
          <div className="flex justify-center items-center h-48 overflow-hidden rounded-xl bg-white shadow-inner"> 
            <img src={preview} alt="미리보기" className="max-h-full max-w-full object-contain" />
          </div>
        ) : (
          <div className="space-y-2 py-8">
            <div className="text-4xl grayscale">📸</div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Click to upload</p>
          </div>
        )}
      </div>

      <button onClick={handleAnalyze} disabled={loading || !file} className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-sm transition-all active:scale-95 ${loading ? 'bg-gray-100 text-gray-400' : 'bg-black text-white'}`}>
        {loading ? "Analyzing..." : "Analyze with Gemini"}
      </button>

      {result && (
        <div className="bg-white border border-gray-100 p-8 rounded-[2rem] space-y-6 shadow-xl animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <span className="font-black text-black text-xs uppercase tracking-widest">Result</span>
            <span className="text-[10px] font-bold text-gray-300 uppercase">Verified</span>
          </div>
          <div className="flex flex-col space-y-6">
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Item</p>
              <p className="font-bold text-gray-900 text-xl tracking-tight">{result.상호명 || result.item || "Unknown"}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Amount</p>
              <p className="font-black text-gray-900 text-2xl tracking-tighter">
                {result.금액 || result.amount ? Number(String(result.금액 || result.amount).replace(/[^0-9]/g, '')).toLocaleString() : "0"} <span className="text-sm font-bold">KRW</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Date</p>
              <p className="font-bold text-gray-900 text-sm">{result.날짜 || result.date || "Unknown"}</p>
            </div>
          </div>
          <button onClick={handleSave} className="w-full bg-black text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-gray-900 transition-all shadow-lg">Save to Ledger</button>
        </div>
      )}
    </div>
  );
}

export default ReceiptScanner;