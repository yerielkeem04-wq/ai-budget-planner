import React, { useState, useEffect } from 'react';

function App() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. 데이터 불러오기 (Render 주소로 변경하세요!)
  const API_URL = "https://ai-budget-planner-6ga5.onrender.com"; 

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/history`);
      const data = await response.json();
      setHistory(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleSubmit = async () => {
    if (!description || !amount) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/data?prompt=${description} ${amount}원 지출`);
      if (response.ok) {
        setDescription(''); setAmount('');
        fetchHistory();
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // --- 디자인 시스템 (Java의 Constant 변수처럼 관리) ---
  const theme = {
    primary: '#4F46E5', // 인디고 블루
    danger: '#EF4444',
    success: '#10B981',
    bg: '#F9FAFB',
    card: '#FFFFFF',
    text: '#1F2937',
    subText: '#6B7280'
  };

  const styles = {
    container: { maxWidth: '480px', margin: '0 auto', backgroundColor: theme.bg, minHeight: '100vh', padding: '20px', fontFamily: '"Pretendard", sans-serif' },
    card: { backgroundColor: theme.card, borderRadius: '24px', padding: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', marginBottom: '20px' },
    header: { fontSize: '22px', fontWeight: '800', color: theme.text, marginBottom: '4px', textAlign: 'center' },
    totalLabel: { fontSize: '14px', color: theme.subText, textAlign: 'center', marginBottom: '8px' },
    amountBig: { fontSize: '32px', fontWeight: '800', color: theme.primary, textAlign: 'center', marginBottom: '24px' },
    input: { width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E5E7EB', marginBottom: '12px', fontSize: '16px', outline: 'none', boxSizing: 'border-box' },
    btn: { width: '100%', padding: '16px', borderRadius: '16px', border: 'none', backgroundColor: theme.primary, color: 'white', fontSize: '16px', fontWeight: '700', cursor: 'pointer', transition: '0.2s' },
    listHeader: { fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' },
    item: { display: 'flex', alignItems: 'center', padding: '16px', backgroundColor: 'white', borderRadius: '20px', marginBottom: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
    iconBox: { width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', fontSize: '20px' }
  };

  return (
    <div style={styles.container}>
      <p style={styles.header}>Smart 가계부 💰</p>
      <p style={styles.totalLabel}>이번 달 총 지출</p>
      <p style={styles.amountBig}>
        ₩ {history.reduce((acc, cur) => acc + (parseInt(cur.question.match(/\d+/)) || 0), 0).toLocaleString()}
      </p>

      {/* 입력 섹션 */}
      <div style={styles.card}>
        <input style={styles.input} placeholder="어디에 쓰셨나요? (예: 점심 마라탕)" value={description} onChange={(e)=>setDescription(e.target.value)} />
        <input style={styles.input} type="number" placeholder="금액을 입력하세요" value={amount} onChange={(e)=>setAmount(e.target.value)} />
        <button style={styles.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? 'AI 분석 중...' : '기록하기'}
        </button>
      </div>

      {/* 내역 섹션 */}
      <div style={styles.listHeader}>
        <span>최근 내역</span>
        <span style={{color: theme.primary, fontSize: '14px'}}>전체보기</span>
      </div>

      {history.map((item) => (
        <div key={item.id} style={styles.item}>
          <div style={styles.iconBox}>
            {item.answer.includes('식비') ? '🍔' : item.answer.includes('교통') ? '🚌' : '💳'}
          </div>
          <div style={{flex: 1}}>
            <p style={{fontWeight: '700', fontSize: '16px', marginBottom: '2px'}}>{item.question.split(' ')[0]}</p>
            <p style={{fontSize: '12px', color: theme.subText}}>{new Date(item.created_at).toLocaleDateString()}</p>
          </div>
          <div style={{textAlign: 'right'}}>
            <p style={{fontWeight: '700', color: theme.danger}}>- {item.question.match(/\d+/)?.toLocaleString()}원</p>
            <p style={{fontSize: '11px', color: theme.primary}}>{item.answer.split(' ')[0]}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;