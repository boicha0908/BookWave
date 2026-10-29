// 학생이 문구나 예시 내용을 바꾸고 싶다면 이 파일의 SAMPLE_REVIEW 부분을 수정해 보세요.
const SAMPLE_REVIEW = {
  bookTitle: '어린 왕자',
  characters: '어린 왕자, 여우, 장미\n서로를 이해하려고 노력하는 모습이 인상 깊었다.',
  scenes: '여우와 친구가 되어가는 장면이 따뜻했다.\n장미를 다시 바라보며 책임을 깨닫는 장면은 조금 뭉클했다.',
  mood: '따뜻하고 조금은 쓸쓸한 느낌',
  style: 'ballad',
  thoughts: '정말 중요한 것은 눈에 보이지 않는다는 말을 오래 기억하고 싶다.'
};

const $ = (selector) => document.querySelector(selector);
const form = $('#reviewForm');
const SHARED_KEY = 'bookwave-shared-lyrics-v1';

// 사이트 이름은 안내 문구에만 쓰고, 실제 노래 가사에는 절대 들어가지 않게 합니다.
function cleanBrandReferences(text) {
  return String(text || '').replace(/북웨이브/g, '이 노래');
}

function getReview() {
  return {
    bookTitle: $('#bookTitle').value.trim(),
    characters: $('#characters').value.trim(),
    scenes: $('#scenes').value.trim(),
    mood: $('#mood').value.trim(),
    style: $('#style').value,
    thoughts: $('#thoughts').value.trim()
  };
}

function showStage(stage) {
  const isHome = stage === 0;
  document.body.classList.toggle('flow-mode', !isHome);
  $('#maker').classList.toggle('active', stage === 1 || stage === 2);
  $('#shared').classList.toggle('active', stage === 3);
  $('#reviewForm').classList.toggle('active', stage === 1);
  $('#lyricsPanel').classList.toggle('active', stage === 2);
  document.querySelectorAll('.step-chip').forEach((chip) => {
    chip.classList.toggle('active', Number(chip.dataset.step) === stage);
    chip.classList.toggle('completed', Number(chip.dataset.step) < stage);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

$('#startButton').addEventListener('click', (event) => { event.preventDefault(); showStage(1); });
document.querySelector('.nav-links a[href="#maker"]').addEventListener('click', (event) => { event.preventDefault(); showStage(1); });
document.querySelector('.nav-links a[href="#shared"]').addEventListener('click', (event) => { event.preventDefault(); showStage(3); });
document.querySelector('.nav-links a[href="#guide"]').addEventListener('click', (event) => { event.preventDefault(); showStage(0); document.querySelector('#guide').scrollIntoView({ behavior: 'smooth' }); });
document.querySelector('a[href="#top"]').addEventListener('click', (event) => { event.preventDefault(); showStage(0); });

// 감상평을 그대로 붙이지 않고, 핵심 단어와 의미만 골라 노래의 흐름으로 다시 엮습니다.
function meaningfulLines(text, fallback) {
  const lines = text.split(/[\n.!?。！？]+/).map((line) => line.trim()).filter(Boolean);
  return lines.length ? lines : [fallback];
}

function firstCharacter(text) {
  const first = meaningfulLines(text, '주인공').at(0);
  return first.split(',')[0].split('，')[0].split(':')[0].trim().slice(0, 18) || '주인공';
}

function lyricLine(text, fallback, max = 34) {
  const clean = (text || fallback).replace(/[.!?。！？]+$/g, '').trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

function sceneSubject(text) {
  const clean = (text || '').replace(/[.!?。！？]+$/g, '').trim();
  const match = clean.match(/^(.{1,22}?)(?:이|가|은|는|을|를)\s/);
  return match ? match[1].trim() : clean.slice(0, 12) || '두 사람';
}

function insightToLyric(text) {
  const clean = text || '';
  if (/우정|친구|친밀/.test(clean)) return '우정의 의미를 다시 배웠어';
  if (/사랑|마음/.test(clean)) return '서로의 마음을 더 깊이 알게 됐어';
  if (/용기|두려움| courage/i.test(clean)) return '두려움 너머로 한 걸음 내디뎠어';
  if (/성장|변화|달라/.test(clean)) return '조금 더 자란 나를 만나게 됐어';
  if (/가족|부모|형제/.test(clean)) return '곁에 있는 마음의 소중함을 배웠어';
  if (/꿈|희망|미래/.test(clean)) return '작은 희망 하나를 품게 됐어';
  return '마음에 남은 뜻을 오래 따라가게 됐어';
}

function moodToLyric(text) {
  const clean = text || '';
  if (/따뜻|포근/.test(clean) && /쓸쓸|외롭/.test(clean)) return '따스함과 쓸쓸함 사이';
  if (/따뜻|포근/.test(clean)) return '따스한 빛처럼';
  if (/쓸쓸|외롭/.test(clean)) return '조용한 외로움처럼';
  if (/신나|즐겁|밝/.test(clean)) return '밝은 멜로디처럼';
  if (/슬프|먹먹/.test(clean)) return '잔잔한 빗소리처럼';
  return '새로운 마음처럼';
}

// 학생이 새로운 스타일을 추가하고 싶다면 아래 스타일 이름과 가사 구조를 바꿔볼 수 있어요.
const STYLE_NAMES = {
  ballad: '감성 발라드', pop: '청량 팝', indie: '몽환 인디', hiphop: '리드미컬 힙합', acoustic: '어쿠스틱'
};

function detectStoryType(review) {
  const text = `${review.characters} ${review.scenes} ${review.thoughts}`;
  if (/시간|회색 신사|빼앗|바쁘게|현재를|소중한 사람의 이야기를/.test(text)) return 'reflection';
  if (/비밀|진실|발견|질문|알게|찾아/.test(text)) return 'discovery';
  if (/갈등|전쟁|싸움|문제|두려|상처|위기|오해/.test(text)) return 'conflict';
  if (/친구|우정|만나|이별|사랑|관계|서로/.test(text)) return 'relationship';
  if (/성장|변화|깨달|배우|달라|극복/.test(text)) return 'growth';
  if (/꿈|희망|여행|모험|떠나|길|미래/.test(text)) return 'journey';
  return 'reflection';
}

function makeLyrics(review) {
  const character = firstCharacter(review.characters);
  const sceneLines = meaningfulLines(review.scenes, '기억에 남은 한 장면');
  const subjectOne = sceneSubject(sceneLines[0]);
  const subjectTwo = sceneSubject(sceneLines[1] || sceneLines[0]);
  const mood = moodToLyric(review.mood);
  const thought = insightToLyric(review.thoughts);
  const storyType = detectStoryType(review);
  const narratives = {
    relationship: `[Verse 1]\n처음엔 서로 다른 곳을 바라봤지\n${character}의 이름이 조용히 번지고\n${subjectOne}가 마주 앉던 그날\n낯선 마음에 작은 문이 열렸어\n\n[Chorus]\n${thought}\n${mood} 우리 사이에 남아\n잡을 수 없던 마음을 이제는 알아\n한 번의 만남이 나를 바꿔 놓았어\n\n[Verse 2]\n${subjectTwo}의 마음을 알아 가는 동안\n가까워진 만큼 더 선명해진 말\n서로의 속도로 걸어온 시간이\n지금의 우리를 노래하게 해\n\n[Bridge]\n멀어져도 사라지지 않는 것\n마음은 기억보다 오래 남아\n\n[Outro]\n다음 페이지에도 네가 있다면\n나는 다시 그 장면으로 돌아갈게`,
    growth: `[Verse 1]\n처음의 나는 작은 질문 앞에 서서\n${character}의 길을 따라 천천히 걸었어\n${subjectOne} 앞에서 멈춰 선 순간\n몰랐던 나의 얼굴을 만났어\n\n[Pre-Chorus]\n넘어질 때마다 달라진 발자국\n어제의 답은 오늘의 문이 되고\n\n[Chorus]\n${thought}\n${mood} 속에서 자라나\n조금 늦어도 괜찮아, 나는 변해 가\n한 장의 이야기가 내 걸음을 만들었어\n\n[Verse 2]\n${subjectTwo}를 지나 다시 길을 보니\n두려움도 나와 함께 걷고 있었어\n완벽하지 않은 마음 그대로\n새로운 페이지를 펼쳐 들었어\n\n[Outro]\n어제의 나에게 인사를 건네\n오늘의 나는 앞으로 가`,
    journey: `[Intro]\n지도를 펴고, 숨을 크게 쉬어\n\n[Verse 1]\n${character}의 발자국이 길을 만들고\n${subjectOne} 너머로 바람이 불어\n끝을 알 수 없는 장면들 사이\n나는 내 이름을 크게 불렀어\n\n[Hook]\n${thought}\n${mood}처럼 번지는 horizon\n한 걸음, 또 한 걸음, 멈추지 않아\n이야기가 나를 데려가는 곳으로\n\n[Verse 2]\n${subjectTwo}를 지나 돌아본 거리\n처음과 다른 눈으로 세상을 봐\n길을 잃은 순간도 이유가 되어\n다음 장면을 향해 나를 밀어\n\n[Outro]\n아직 쓰이지 않은 마지막 줄\n내가 직접 그 끝을 찾아갈게`,
    discovery: `[Verse 1]\n왜일까, 한 문장이 마음에 걸려\n${character}의 시선이 머문 곳을 따라\n${subjectOne} 안에 숨은 작은 단서\n닫혀 있던 생각이 깨어났어\n\n[Chorus]\n${thought}\n${mood} 너머로 답이 보여\n보이지 않던 마음의 이름을 부르면\n책 속의 질문이 나의 노래가 돼\n\n[Verse 2]\n${subjectTwo}에서 마주친 새로운 빛\n알고 있다고 믿었던 나를 지나\n끝까지 읽고서야 알게 된 것은\n정답보다 깊은 하나의 마음\n\n[Bridge]\n모든 비밀이 풀리지 않아도\n질문을 품은 채 걸어갈 수 있어\n\n[Outro]\n페이지 끝에 남은 한 줄\n이제는 내가 이어 써`,
    conflict: `[Verse 1]\n검은 구름처럼 마음을 가린 날\n${character}의 발걸음이 잠시 흔들려\n${subjectOne} 앞에서 부딪힌 마음\n말하지 못한 상처가 번져 갔어\n\n[Pre-Chorus]\n무너진 조각을 하나씩 모아\n끝나지 않을 것 같던 밤을 건너\n\n[Chorus]\n${thought}\n${mood} 지나 다시 일어나\n상처가 남긴 선을 따라 걸어도\n나는 나의 목소리를 잃지 않아\n\n[Verse 2]\n${subjectTwo}를 지나 알게 된 것\n이기는 것보다 놓아주는 용기\n아픈 장면까지 품어 안으면\n조용한 평화가 내게 와\n\n[Outro]\n새벽은 반드시 문을 열어\n나는 다시 빛을 향해 가`,
    reflection: `[Verse 1]\n창가에 머문 조용한 오후\n${character}의 이야기가 천천히 번져\n${subjectOne}의 장면을 지나온 뒤\n내 안의 목소리를 듣게 됐어\n\n[Chorus]\n${thought}\n${mood}처럼 오래 남아\n말로 다 적지 못한 마음까지\n한 곡의 멜로디가 되어 흘러가\n\n[Verse 2]\n${subjectTwo}를 다시 떠올리는 밤\n흐릿한 기억도 온기를 품고\n읽고 느낀 그 모든 순간이\n오늘의 나를 조용히 감싸\n\n[Bridge]\n눈에 보이지 않아도 느낄 수 있어\n소중한 마음은 사라지지 않아\n\n[Outro]\n책장을 덮고 불을 끄면\n내 안에 남은 노래가 깨어나`
  };
  let lyrics = narratives[storyType];
  if (review.style === 'hiphop') lyrics = lyrics.replace(/\[Verse 1\]/g, '[Rap Verse]').replace(/\[Verse 2\]/g, '[Second Verse]').replace(/\[Chorus\]|\[Hook\]/g, '[Hook]');
  if (review.style === 'pop') lyrics = `[Intro]\nHey, 이 이야기를 따라와\n\n${lyrics}\n\n[Post-Chorus]\nLa-la-la, 마음은 계속 뛰어`;
  if (review.style === 'indie') lyrics = lyrics.replace('[Chorus]', '[Dreamy Hook]').replace('[Outro]', '[Fade Out]');
  if (review.style === 'acoustic') lyrics = lyrics.replace('[Chorus]', '[Refrain]').replace('[Outro]', '[Last Whisper]');
  return lyrics;
}

function songTitle(review) {
  const storyType = detectStoryType(review);
  const titles = {
    relationship: ['마주 앉던 그날', '우리 사이에 남은 말', '서로의 계절'],
    growth: ['어제의 나에게 인사를', '조금 더 자란 마음', '다음 페이지의 나'],
    journey: ['아직 쓰이지 않은 마지막 줄', '바람이 가리킨 길', '한 걸음 더 멀리'],
    discovery: ['질문을 품은 채', '숨겨진 빛을 찾아서', '한 줄 뒤의 진실'],
    conflict: ['새벽은 문을 열어', '부서진 마음의 조각', '다시 빛을 향해'],
    reflection: ['내 안의 목소리', '책장을 덮은 뒤', '오래 남은 한 문장']
  };
  const candidates = titles[storyType] || titles.reflection;
  const seed = `${review.bookTitle}${review.thoughts}${review.scenes}`;
  const index = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0) % candidates.length;
  return `《${review.bookTitle}》 — ${candidates[index]}`;
}

function sceneSpark(text) {
  const clean = String(text || '').replace(/[.!?。！？]+$/g, '').trim();
  if (/편지/.test(clean) && /진실|오해/.test(clean)) return '편지 속 진실을 마주한 밤';
  if (/시간/.test(clean) && /되찾|빼앗|돌려/.test(clean)) return '잃어버린 시간을 되찾은 순간';
  if (/친구/.test(clean) && /이해|만나|다시/.test(clean)) return '서로의 마음을 이해한 순간';
  if (/청혼|고백|사랑/.test(clean)) return '마음을 고백하던 순간';
  if (/실패|다시 일어나|극복/.test(clean)) return '다시 일어선 순간';
  if (/떠나|여행|길/.test(clean)) return '새로운 길을 떠난 순간';
  return lyricLine(clean, '기억에 남은 장면', 24);
}

// 같은 형식을 반복하지 않도록, 독후감의 내용과 문장 길이로 4가지 전개 중 하나를 고릅니다.
function makeLyrics(review) {
  const scenes = meaningfulLines(review.scenes, '기억에 남은 장면');
  const character = firstCharacter(review.characters);
  const sceneOne = sceneSpark(scenes[0]);
  const sceneTwo = sceneSpark(scenes[1] || scenes[0]);
  const storyType = detectStoryType(review);
  const mood = moodToLyric(review.mood);
  const moodLine = mood.endsWith('사이') ? `${mood}를 지나` : mood.endsWith('처럼') ? mood : `${mood}처럼`;
  const thought = insightToLyric(review.thoughts);
  const seed = `${review.bookTitle}|${review.characters}|${review.scenes}|${review.thoughts}|${review.style}`;
  const variant = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 4;
  const story = {
    relationship: {
      opening: `${character}의 마음이 ${sceneOne}을 지나`, turn: '서로 다른 마음이 천천히 가까워져', ending: '마주 본 시간은 쉽게 사라지지 않아'
    },
    growth: {
      opening: `${character}가 ${sceneOne} 앞에 서서`, turn: '넘어지고 다시 일어나며 답을 찾아', ending: '어제보다 단단해진 내가 여기 있어'
    },
    journey: {
      opening: `${character}의 발걸음이 ${sceneOne}을 지나`, turn: '길을 잃은 순간도 다음 장면이 되어', ending: '아직 쓰이지 않은 길을 향해 가'
    },
    discovery: {
      opening: `${character}가 ${sceneOne}을 바라보다`, turn: '질문 뒤에 숨은 마음을 하나씩 찾아', ending: '알게 된 것보다 더 깊은 뜻이 남아'
    },
    conflict: {
      opening: `${character}가 ${sceneOne} 앞에서 멈춰`, turn: '흔들리는 마음을 품고 밤을 건너', ending: '상처를 지나 다시 빛을 향해 가'
    },
    reflection: {
      opening: `${character}의 이야기를 따라 ${sceneOne}에 닿아`, turn: '조용히 나의 마음을 들여다보게 해', ending: '책장을 덮어도 여운은 남아'
    }
  }[storyType] || {
    opening: `${character}의 이야기를 따라 ${sceneOne}에 닿아`, turn: '조용히 나의 마음을 들여다보게 해', ending: '책장을 덮어도 여운은 남아'
  };

  const arrangements = [
    `[Verse 1]\n${story.opening}\n${sceneTwo}, 그날의 공기\n말하지 못한 마음까지 들려와\n\n[Pre-Chorus]\n${story.turn}\n한 줄의 문장이 나를 깨워\n\n[Chorus]\n${thought}\n${moodLine} 내 안에 오래 남아\n${story.ending}\n\n[Verse 2]\n처음과 다른 눈으로 장면을 바라봐\n이야기 속 마음이 나에게 건넨 말\n오늘의 나는 조금 달라졌어\n\n[Outro]\n다음 페이지로 넘어가도\n이 노래는 계속될 거야`,
    `[Intro]\n한 장면, 한 문장, 아직 남은 마음\n\n[Verse 1]\n${sceneOne}을 지나 ${character}를 따라가\n낯선 감정이 리듬처럼 번져 와\n${story.turn}\n\n[Hook]\n${thought}\n${moodLine} 번져\n끝난 줄 알았던 이야기가\n내 안에서 다시 시작돼\n\n[Verse 2]\n${sceneTwo}를 오래 바라본 뒤\n내가 믿어 온 답을 잠시 내려놔\n${story.ending}\n\n[Bridge]\n보이지 않는 마음의 모양을\n이제는 조금 알 것 같아\n\n[Outro]\n조용히, 다음 장면으로`,
    `[Verse 1]\n${story.opening}\n한 번도 같은 적 없던 오늘의 마음\n${thought}\n\n[Verse 2]\n${sceneTwo}, 그 장면을 다시 떠올려\n좋았던 순간과 아팠던 순간 모두\n나를 여기까지 데려왔어\n\n[Chorus]\n${story.turn}\n${moodLine}\n이야기가 끝나는 순간에도\n나는 그 의미를 품고 있어\n\n[Bridge]\n마지막 문장 너머에 남은 것\n내가 직접 이어 갈 한 줄\n\n[Final Chorus]\n${story.ending}\n오늘의 나로 다시 노래해`,
    `[Spoken Intro]\n이 이야기를 읽고 난 뒤\n나는 한참 동안 같은 장면을 떠올렸어\n\n[Verse]\n${character}, ${sceneOne}\n${sceneTwo}가 남긴 작은 흔적\n${story.turn}\n말로 다 설명할 수 없는 마음이\n멜로디가 되어 흘러가\n\n[Refrain]\n${thought}\n${moodLine} 천천히\n지나간 장면들이 서로 이어져\n하나의 이야기가 되어\n\n[Verse 2]\n처음의 나와 지금의 나는 달라\n${story.ending}\n이 책이 남긴 질문을 안고서\n다음 나를 만나러 가\n\n[Last Line]\n책장을 덮은 뒤에도\n마음은 아직 그곳에 있어`
  ];
  let lyrics = arrangements[variant];
  if (review.style === 'hiphop') lyrics = lyrics.replace(/\[Verse 1\]|\[Verse\]/g, '[Rap Verse]').replace(/\[Chorus\]|\[Hook\]/g, '[Hook]');
  if (review.style === 'pop') lyrics = `[Intro]\nHey, 이 이야기를 따라와\n\n${lyrics}\n\n[Post-Chorus]\nLa-la-la, 마음은 계속 뛰어`;
  if (review.style === 'indie') lyrics = lyrics.replace('[Chorus]', '[Dreamy Hook]').replace('[Outro]', '[Fade Out]');
  if (review.style === 'acoustic') lyrics = lyrics.replace('[Chorus]', '[Refrain]').replace('[Outro]', '[Last Whisper]');
  return lyrics;
}

function showMessage(text, type = 'error') {
  const message = $('#formMessage');
  message.textContent = text;
  message.style.color = type === 'success' ? '#5794a5' : '#d66b6b';
  window.setTimeout(() => { message.textContent = ''; }, 4000);
}

async function generateLyricsWithAI(review) {
  const response = await fetch('/api/generate-lyrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'AI 가사를 만들지 못했어요.');
  if (!data.title || !data.lyrics) throw new Error('AI가 올바른 가사 형식으로 답하지 않았어요. 다시 시도해 주세요.');
  return data;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const review = getReview();
  if (!review.bookTitle || !review.thoughts) {
    showMessage('책 제목과 한 줄 감상은 꼭 적어주세요.');
    (!review.bookTitle ? $('#bookTitle') : $('#thoughts')).focus();
    return;
  }
  const generateButton = form.querySelector('button[type="submit"]');
  generateButton.disabled = true;
  generateButton.innerHTML = 'Gemini가 가사를 쓰는 중… <span>✦</span>';
  showMessage('독후감의 내용을 읽고 가사를 만들고 있어요.', 'success');
  try {
    const result = await generateLyricsWithAI(review);
    $('#resultTitle').textContent = cleanBrandReferences(result.title);
    $('#resultMood').textContent = `♪ ${review.mood || '당신의 독서 감정'} · Gemini 3.6 Flash`;
    $('#resultLyrics').textContent = cleanBrandReferences(result.lyrics);
    $('#emptyState').classList.add('hidden');
    $('#lyricsResult').classList.remove('hidden');
    $('#shareMessage').textContent = '';
    showStage(2);
  } catch (error) {
    showMessage(error.message || 'AI 가사를 만들지 못했어요. 서버와 API 키를 확인해 주세요.');
  } finally {
    generateButton.disabled = false;
    generateButton.innerHTML = '가사 만들기 <span>✦</span>';
  }
});

$('#sampleButton').addEventListener('click', () => {
  Object.entries(SAMPLE_REVIEW).forEach(([key, value]) => { $(`#${key}`).value = value; });
  showMessage('예시 감상을 채웠어요. 가사 만들기를 눌러보세요.', 'success');
});

function resetAll() {
  form.reset();
  $('#emptyState').classList.remove('hidden');
  $('#lyricsResult').classList.add('hidden');
  $('#formMessage').textContent = '';
  $('#shareMessage').textContent = '';
  showStage(0);
}

$('#resetButton').addEventListener('click', resetAll);
$('#againButton').addEventListener('click', () => { showStage(1); $('#bookTitle').focus(); });

function getSharedSongs() {
  try {
    return JSON.parse(localStorage.getItem(SHARED_KEY) || '[]').map((song) => ({
      ...song,
      title: cleanBrandReferences(song.title),
      lyrics: cleanBrandReferences(song.lyrics)
    }));
  }
  catch { return []; }
}

function renderSharedSongs() {
  const list = $('#sharedList');
  const songs = getSharedSongs();
  list.replaceChildren();
  if (!songs.length) {
    const empty = document.createElement('p');
    empty.className = 'shared-empty';
    empty.innerHTML = '아직 공유된 가사가 없어요.<br />첫 번째 가사를 만들어 사이트에 공유해 보세요.';
    list.append(empty);
    return;
  }
  songs.forEach((song) => {
    const card = document.createElement('article');
    card.className = 'shared-song';
    card.innerHTML = '<div class="shared-song-head"><span>BOOKWAVE COMMUNITY</span><span class="shared-date"></span></div><h3></h3><p class="shared-mood"></p><pre></pre><div class="shared-song-actions"><button type="button" class="copy-shared">이 가사 복사</button><a class="suno-button" href="https://suno.com/discover?utm_source=google&utm_medium=cpc&utm_campaign=24046512688&utm_term=%EC%88%98%EB%85%B8&utm_content=817333098617&wpsrc=Google+AdWords&wpcid=24046512688&wpscid=196227491737&wpcrid=817333098617&wpkwid=kwd-1409981877482&wpkwn=%EC%88%98%EB%85%B8&wpkmatch=e&wpsnetn=g&gad_source=1&gad_campaignid=24046512688&gbraid=0AAAAA9pWpdsXLcT-IqwCk6cIcvNFmJ4e4&gclid=CjwKCAjwi-zWBhAdEiwAqlRf-J3oDhIbpMVR7O9ueAh5NJOKsCJZc0rKU8WO5aScVl6f5mg8sOOcWxoCN44QAvD_BwE" target="_blank" rel="noopener noreferrer">수노에서 노래 만들기 ↗</a></div>';
    card.querySelector('.shared-date').textContent = song.date;
    card.querySelector('h3').textContent = song.title;
    card.querySelector('.shared-mood').textContent = `♪ ${song.mood}`;
    card.querySelector('pre').textContent = song.lyrics;
    card.querySelector('.copy-shared').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(`북웨이브 | ${song.title}\n\n${song.lyrics}`);
        $('#shareMessage').textContent = '공유된 가사를 복사했어요!';
      } catch { $('#shareMessage').textContent = '브라우저에서 복사가 제한되어 있어요.'; }
    });
    list.append(card);
  });
}

function shareInsideSite() {
  const songs = getSharedSongs();
  const newSong = {
    title: $('#resultTitle').textContent,
    mood: $('#resultMood').textContent.replace(/^♪\s*/, '') || '독서 감정',
    lyrics: cleanBrandReferences($('#resultLyrics').textContent),
    date: new Date().toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
  };
  const withoutSameTitle = songs.filter((song) => song.title !== newSong.title);
  try {
    localStorage.setItem(SHARED_KEY, JSON.stringify([newSong, ...withoutSameTitle].slice(0, 12)));
    renderSharedSongs();
    $('#shareMessage').textContent = '사이트 안에 가사를 공유했어요! 아래 공유된 가사에서 확인해 보세요.';
    showStage(3);
  } catch { $('#shareMessage').textContent = '이 브라우저에서는 공유 가사를 저장할 수 없어요.'; }
}

renderSharedSongs();
$('#newLyricsButton').addEventListener('click', () => { showStage(1); $('#bookTitle').focus(); });

function lyricsToShareText() {
  return `북웨이브 | ${$('#resultTitle').textContent}\n\n${$('#resultLyrics').textContent}\n\n— 북웨이브에서 만든 가사`;
}

async function copyLyrics() {
  try {
    await navigator.clipboard.writeText(lyricsToShareText());
    $('#shareMessage').textContent = '가사를 클립보드에 복사했어요! 친구에게 붙여넣어 보세요.';
  } catch {
    $('#shareMessage').textContent = '복사가 제한된 브라우저예요. 가사를 직접 드래그해서 복사해 주세요.';
  }
}

$('#copyButton').addEventListener('click', copyLyrics);
$('#shareButton').addEventListener('click', shareInsideSite);
