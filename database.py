import os
from dotenv import load_dotenv
from supabase import create_client, Client

# .env 파일에 저장한 환경 변수들을 불러옵니다.
load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

# Supabase와 통신할 수 있는 클라이언트 객체를 생성합니다.
# 이제 다른 파일(main.py 등)에서 이 supabase 객체를 불러와 DB 작업을 할 수 있습니다.
supabase: Client = create_client(url, key)