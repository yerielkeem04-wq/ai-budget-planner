import os
import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File, HTTPException
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
    allow_origins=["*"],  # 테스트를 위해 모든 도메인 허용
    allow_credentials=True,
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
def get_history(user_id: str = None): # 쿼리 파라미터로 ID를 받을 수 있게 함
    try:
        query = supabase.table("chat_history").select("*")
        
        # user_id가 들어오면 해당 유저 데이터만 필터링
        if user_id:
            query = query.eq("user_id", user_id)
            
        response = query.order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        return {"error": str(e)}
    
@app.post("/analyze-receipt")
async def analyze_receipt(file: UploadFile = File(...)):
    try:
        # 파일 데이터 읽기
        image_bytes = await file.read()
        
        # 3. 새로운 SDK 방식으로 콘텐츠 생성
        image_part = types.Part.from_bytes(
            data=image_bytes,
            mime_type="image/jpeg"
        )
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                "이 영수증의 '상호명(item)', '금액(amount)', '날짜(date)'를 찾아줘. 반드시 JSON 형식만 출력해.",
                image_part  # 👈 수정된 부분
            ]
        )

        text = response.text
        # JSON 부분만 안전하게 추출
        start = text.find("{")
        end = text.rfind("}") + 1
        result = json.loads(text[start:end])
        
        print(f"✅ 분석 성공: {result}")
        return result
        
    except Exception as e:
        print(f"❌ 진짜 에러 내용: {str(e)}") # 서버 터미널에 찍히는 이 내용을 확인하세요!
        return {"item": "분석 에러", "amount": 0, "date": "0000-00-00"} # 에러 시 빈 데이터 반환

@app.post("/api/save-receipt")
async def save_receipt(data: dict):
    try:
        # 1. 기존 데이터 추출 로직 (유지)
        title = data.get("item") or data.get("상호명") or "이름 없는 항목"
        raw_amount = str(data.get("amount") or data.get("금액") or "0")
        clean_amount_str = raw_amount.replace(",", "").replace("원", "").strip()
        date = data.get("date") or data.get("날짜") or "2026-01-01"
        
        # 🌟 [추가] 프론트엔드에서 보낸 user_id 추출
        user_id = data.get("user_id") 

        # 2. Supabase 저장 데이터 구성
        db_data = {
            "question": f"{title}:{clean_amount_str}",
            "answer": f"영수증데이터/{date}/{title}",
            "user_id": user_id  # 🌟 [추가] DB 컬럼에 유저 ID 매핑
        }
        
        # 3. DB 실행
        response = supabase.table("chat_history").insert(db_data).execute()
        
        print(f"✅ DB 저장 성공 (User: {user_id}): {db_data}")
        return {"status": "success", "data": response.data}
        
    except Exception as e:
        print(f"❌ DB 저장 에러: {str(e)}")
        raise HTTPException(status_code=500, detail=f"저장 실패: {str(e)}")