import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // 경로 수정 완료

function SignUp({ onGoLogin, onCancel }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      alert("가입 확인 이메일이 발송되었습니다!");
      onGoLogin();
    } catch (error) {
      alert("회원가입 에러: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">Join Us</h2>
      <form className="mt-8 space-y-4 w-full max-w-sm" onSubmit={handleSignUp}>
        <input 
          type="email" placeholder="EMAIL" 
          className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-black"
          value={email} onChange={(e) => setEmail(e.target.value)} required 
        />
        <input 
          type="password" placeholder="PASSWORD" 
          className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-black"
          value={password} onChange={(e) => setPassword(e.target.value)} required 
        />
        <button className="w-full py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em]">
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
      <div className="mt-6 flex flex-col items-center space-y-4">
        <button onClick={onGoLogin} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Login</button>
        <button onClick={onCancel} className="text-[10px] font-bold text-gray-200 uppercase tracking-widest">Cancel</button>
      </div>
    </div>
  );
}

export default SignUp;