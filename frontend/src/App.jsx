import React, { useState, useEffect } from 'react'; // 1. useEffect 추가

function App() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [history, setHistory] = useState([]); // 2. 내역을 저장할 상태 변수

  // 3. 데이터를 불러오는 함수
  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/history');
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error("내역 불러오기 에러:", error);
    }
  };

  // 4. 화면이 처음 켜질 때 실행
  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSubmit = async () => {
    if (!description || !amount) return;

    try {
      const response = await fetch(`http://localhost:8000/api/data?prompt=${description} ${amount}원 지출했어. 카테고리 분류해서 저장해줘.`);
      if (response.ok) {
        setDescription('');
        setAmount('');
        fetchHistory(); // 5. 저장 성공 후 내역 다시 불러오기!
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 스타일 객체
  const styles = {
    container: { minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', margin: '30px 0' },
    title: { fontSize: '28px', color: '#2563eb', fontWeight: 'bold' },
    card: { width: '100%', maxWidth: '400px', backgroundColor: 'white', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '20px' },
    inputGroup: { marginBottom: '15px' },
    label: { display: 'block', fontSize: '14px', color: '#4b5563', marginBottom: '5px' },
    input: { width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '10px', boxSizing: 'border-box' },
    button: { width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
    summary: { display: 'flex', justifyContent: 'space-around', textAlign: 'center' },
    listItem: { backgroundColor: 'white', padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Smart 가계부 💰</h1>
        <p style={{color: '#6b7280'}}>Gemini가 분석하는 나의 소비</p>
      </div>

      <div style={styles.card}>
        <div style={styles.summary}>
          <div><p style={{fontSize: '12px', color: '#9ca3af'}}>이번 달 지출</p><p style={{fontSize: '20px', fontWeight: 'bold', color: '#ef4444'}}>₩ 0</p></div>
          <div style={{borderRight: '1px solid #f3f4f6'}}></div>
          <div><p style={{fontSize: '12px', color: '#9ca3af'}}>남은 예산</p><p style={{fontSize: '20px', fontWeight: 'bold', color: '#10b981'}}>₩ 1,000,000</p></div>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={{fontSize: '18px', marginBottom: '15px'}}>새 내역 추가</h2>
        <div style={styles.inputGroup}>
          <label style={styles.label}>무엇을 하셨나요?</label>
          <input style={styles.input} type="text" placeholder="예: 점심 마라탕" value={description} onChange={(e)=>setDescription(e.target.value)} />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>얼마를 쓰셨나요?</label>
          <input style={styles.input} type="number" placeholder="0" value={amount} onChange={(e)=>setAmount(e.target.value)} />
        </div>
        <button style={styles.button} onClick={handleSubmit}>기록하기</button>
      </div>

      <div style={{width: '100%', maxWidth: '400px'}}>
        <h2 style={{fontSize: '18px', marginBottom: '10px'}}>최근 내역</h2>
        
        {/* 6. 실제 데이터(history)를 화면에 뿌려주는 부분 */}
        {history.map((item) => (
          <div key={item.id} style={{...styles.listItem, marginBottom: '10px'}}>
            <div style={{flex: 1}}>
              {/* Gemini의 답변(answer)이나 질문(question) 중 원하는 걸 보여줍니다 */}
              <p style={{fontWeight: '600', fontSize: '14px'}}>{item.question.split(' ')[0]}</p> 
              <p style={{fontSize: '11px', color: '#9ca3af'}}>
                {new Date(item.created_at).toLocaleString()}
              </p>
            </div>
            <p style={{color: '#2563eb', fontWeight: 'bold'}}>
              {item.answer.includes('식비') ? '🛒 식비' : '💰 지출'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;