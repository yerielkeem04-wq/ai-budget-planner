import { createClient } from '@supabase/supabase-js'

// .env 파일에 정의된 변수명을 그대로 가져옵니다. 
// 보통 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 식으로 명명합니다.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase 환경 변수가 설정되지 않았습니다. .env 파일을 확인해주세요.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)