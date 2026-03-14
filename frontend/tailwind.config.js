/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // 이 경로가 정확해야 스타일을 생성합니다.
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}