# 북웨이브 Gemini AI 버전

## 실행 방법

1. Google AI Studio에서 Gemini API 키를 발급합니다.
2. PowerShell을 열고 이 폴더로 이동합니다.
3. 아래처럼 키를 등록합니다.

```powershell
$env:GEMINI_API_KEY = "발급받은_API_키"
node server.js
```

4. 브라우저에서 `http://localhost:8000`을 엽니다.

API 키는 `index.html`이나 `script.js`에 넣지 마세요. 브라우저에 공개되면 다른 사람이 사용할 수 있습니다.

현재 기본 모델은 `gemini-3.6-flash`이며, 필요하면 `GEMINI_MODEL` 환경변수로 바꿀 수 있습니다.
