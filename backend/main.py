import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from google.genai import types 
from google import genai

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
        return {"message": response.text}
    except Exception as e:
        # 에러가 발생하면 상세 내용을 리턴하여 원인을 파악합니다.
        return {"message": f"에러 발생: {str(e)}"}