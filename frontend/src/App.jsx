import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [inputText, setInputText] = useState(""); // 입력창 상태
  const [data, setData] = useState("아래 입력창에 소설 아이디어를 적어보세요.");
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      // 백엔드로 사용자의 입력을 쿼리 파라미터로 보냅니다.
      const response = await axios.get(`${API_URL}/api/data?prompt=${encodeURIComponent(inputText)}`);
      setData(response.data.message);
    } catch (error) {
      console.error("에러:", error);
      setData("데이터를 불러오는 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reader-container">
      <header className="reader-header">
        <h1>PROJECT: VACCINE</h1>
        <div className="status-badge">실험 기록 #20260308</div>
      </header>

      <main className="reader-main">
        {loading ? (
          <div className="loading-screen">
            <div className="spinner"></div>
            <p>제미나이가 다음 장면을 구상 중입니다...</p>
          </div>
        ) : (
          <article className="novel-content">
            {data}
          </article>
        )}
      </main>

      {/* 하단 고정 입력창 영역 */}
      <footer className="input-area">
        <form onSubmit={handleSubmit} className="input-form">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="주인공의 다음 행동을 입력하세요..."
            disabled={loading}
          />
          <button type="submit" disabled={loading}>전송</button>
        </form>
      </footer>
    </div>
  );
}

export default App;