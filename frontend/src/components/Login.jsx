import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 1. 기존 이메일 로그인 로직
  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  // 2. 구글 로그인 로직 추가
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // 로그인 성공 후 다시 돌아올 주소
        redirectTo: window.location.origin 
      }
    });
    if (error) alert(error.message);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-[420px] h-screen sm:h-[840px] bg-white p-12 flex flex-col justify-center sm:rounded-[2rem] shadow-xl">
        <div className="space-y-2 mb-12">
          <h1 className="text-4xl font-black tracking-tighter uppercase">Sign In</h1>
          <p className="text-gray-400 text-xs font-bold tracking-widest uppercase">Finance Manager v1.0</p>
        </div>

        {/* 기존 이메일 폼 */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b-2 border-gray-100 py-2 focus:border-black outline-none transition-colors"
              placeholder="example@mail.com"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b-2 border-gray-100 py-2 focus:border-black outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button className="w-full bg-black text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] mt-8 active:scale-95 transition-transform shadow-sm">
            Continue
          </button>
        </form>

        {/* --- 소셜 로그인 구분선 --- */}
        <div className="relative my-10 flex items-center">
          <div className="flex-grow border-t border-gray-100"></div>
          <span className="flex-shrink mx-4 text-[9px] font-black text-gray-300 uppercase tracking-widest">OR</span>
          <div className="flex-grow border-t border-gray-100"></div>
        </div>

        {/* 구글 로그인 버튼 */}
        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white border-2 border-gray-100 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-gray-50 active:scale-95 transition-all"
        >
          {/* 구글 아이콘 (SVG) */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>

        <div className="mt-auto pt-8">
          <p className="text-[10px] text-gray-300 uppercase tracking-widest leading-loose">
            Private & Secure <br/>
            Your data is encrypted.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;