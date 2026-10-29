// 북웨이브 Gemini 서버
// API 키는 같은 폴더의 .env 파일에 한 번만 입력하면 됩니다.
// 그 다음 실행: node server.js
const http = require('http');
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && !process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

const PORT = Number(process.env.PORT || 8000);
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const ROOT = __dirname;

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

const systemInstruction = `너는 한국어 독후감을 바탕으로 완전히 새로운 노래 가사를 쓰는 작사가야.
반드시 사용자가 적은 독후감의 책 내용, 등장인물, 장면, 분위기, 감상을 중심으로 써.
사이트 이름이나 브랜드 이름은 절대 가사와 제목에 넣지 마.
독후감 문장을 그대로 복사하지 말고, 핵심 감정과 사건을 자연스럽고 시적인 가사로 재창작해.
정해진 템플릿을 반복하지 말고, 독후감의 이야기 흐름에 맞춰 곡의 구조와 전개를 스스로 결정해.
등장인물과 장면 사이의 변화, 갈등, 깨달음 또는 여운이 가사에 드러나야 해.
선택한 노래 스타일의 분위기를 반영하되, 과한 영어 표현은 피하고 자연스러운 한국어를 사용해.
가사는 20~32줄 정도로 쓰고, 제목과 가사를 JSON으로만 반환해.`;

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 20000) reject(new Error('입력 내용이 너무 길어요.'));
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

async function generateLyrics(review) {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY가 설정되지 않았어요. 서버 실행 전에 API 키를 등록해 주세요.');
  const prompt = `다음 독후감 정보로 노래 제목과 가사를 만들어줘.\n${JSON.stringify(review, null, 2)}`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  const apiResponse = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: { title: { type: 'STRING' }, lyrics: { type: 'STRING' } },
          required: ['title', 'lyrics']
        }
      }
    })
  });
  const data = await apiResponse.json();
  if (!apiResponse.ok) throw new Error(data.error?.message || 'Gemini API 요청에 실패했어요.');
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
  if (!text) throw new Error('Gemini가 가사를 반환하지 않았어요.');
  try { return JSON.parse(text); }
  catch { throw new Error('Gemini의 응답 형식을 읽지 못했어요. 다시 시도해 주세요.'); }
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  if (request.method === 'POST' && requestUrl.pathname === '/api/generate-lyrics') {
    try {
      const review = JSON.parse(await readBody(request));
      if (!review.bookTitle || !review.thoughts) return sendJson(response, 400, { error: '책 제목과 한 줄 감상은 꼭 적어주세요.' });
      return sendJson(response, 200, await generateLyrics(review));
    } catch (error) {
      return sendJson(response, 500, { error: error.message || '서버 오류가 발생했어요.' });
    }
  }

  if (request.method !== 'GET') return sendJson(response, 405, { error: '허용되지 않은 요청이에요.' });
  const requestedPath = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname;
  const filePath = path.resolve(ROOT, `.${requestedPath}`);
  if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath)) return sendJson(response, 404, { error: '파일을 찾을 수 없어요.' });
  response.writeHead(200, { 'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(response);
});

server.listen(PORT, () => console.log(`북웨이브 서버 실행: http://localhost:${PORT} (모델: ${MODEL})`));
