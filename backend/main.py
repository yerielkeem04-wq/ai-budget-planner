import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from google.genai import types 
from google import genai
from database import supabase

# .env 파일의 환경 변수를 로드합니다.
load_dotenv()

app = FastAPI()

# CORS 설정 (리액트 연결용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(
    api_key=api_key,
    http_options={'api_version': 'v1'}
)

@app.get("/")
def read_root():
    return {"status": "서버가 아주 잘 돌아가고 있어요! 🚀"}

@app.get("/api/data")
def get_gemini_response(prompt: str):
    try:
        # 2. 핵심 수정: 모델 이름에서 'models/'를 완전히 제거합니다.
        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=prompt
        )
        answer = response.text

        # 5. Supabase DB에 저장 (추가된 부분)
        # 테이블 이름이 'chat_history'이고 컬럼이 'question', 'answer'라고 가정
        db_data = {
            "question": prompt,
            "answer": answer
        }
        supabase.table("chat_history").insert(db_data).execute()

        return {"message": answer, "db_status": "saved"}
        
    except Exception as e:
        return {"message": f"에러 발생: {str(e)}"}

@app.get("/api/history")
def get_history():
    try:
        # Supabase의 'chat_history' 테이블에서 모든 데이터를 가져옵니다.
        # .order()를 써서 최신 데이터가 위로 오게 정렬합니다.
        response = supabase.table("chat_history").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        return {"error": str(e)}