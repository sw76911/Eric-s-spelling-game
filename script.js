// 1. 基本設定 (放在最上方)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwOiL-ScKXeJQSi4kFw8o5zUWSXjtSdJlQfkZlc7mZxhNgcgmuXCppJejFamm1pxF98/exec"; 
const MY_PRIVATE_PASSWORD = "0127"; 

const shopItems = {
    daily: [{id:'f1', name:'鮮魚', price:10, type:'fish'}, {id:'s1', name:'沐浴乳', price:10, type:'soap'}],
    toys: [{id:'t1', name:'皮球', price:20, type:'toy', icon:'⚽'}, {id:'t2', name:'逗貓棒', price:30, type:'toy', icon:'🪄'}],
    hats: [{id:'h1', name:'草帽', price:40, style:'#f0e68c', part:'head'}, {id:'h2', name:'飛行帽', price:90, style:'#8b4513', part:'head'}],
    clothes: [{id:'c1', name:'小T', price:60, style:'#98fb98', part:'suit'}, {id:'c2', name:'背心', price:120, style:'skyblue', part:'suit'}],
    socks: [{id:'k1', name:'白襪', price:15, style:'#ffffff', part:'socks'}, {id:'k2', name:'黑襪', price:15, style:'#333333', part:'socks'}]
};

let state = {
    coins: 100, hunger: 80, clean: 80, mood: 80, catName: '我的小貓',
    inventory: { fish: 2, soap: 1 }, bag: [], wrongList: [],
    equipped: { head:null, suit:null, socks:null, color:'#f39c12' },
    quizSet: [], quizIdx: 0, mode: '', currentLevelName: ''
};

let currentInputArr = []; 
let poolLetters = [];

// 2. 語音與基礎工具
function speakWord() { window.speechSynthesis.cancel(); const q = state.quizSet[state.quizIdx]; const msg = new SpeechSynthesisUtterance(q.en); msg.lang = 'en-US'; window.speechSynthesis.speak(msg); }
function speakSentence() { window.speechSynthesis.cancel(); const q = state.quizSet[state.quizIdx]; const msg = new SpeechSynthesisUtterance(q.sen); msg.lang = 'en-US'; msg.rate = 0.9; window.speechSynthesis.speak(msg); }
function formatWord(w) { return w; } // 補上遺漏的工具函數

// 3. 核心邏輯：開始關卡
function startLevel(t) {
    if (!themes[t]) return;
    state.hunger = Math.max(0, state.hunger - 5);
    state.clean = Math.max(0, state.clean - 5);
    state.currentLevelName = t;
    
    let all = [...themes[t]];
    const numToPick = Math.min(all.length, 15);
    state.quizSet = all.sort(() => Math.random() - 0.5).slice(0, numToPick);
    
    state.quizIdx = 0;
    showScreen('gameScreen');
    loadQuiz();
    updateUI();
    saveLocal();
}

// 4. 渲染關卡列表 (修正完畢)
function renderLevelSelect() {
    console.log("正在執行渲染函數...");
    const list = document.getElementById('level-list');
    if (!list) return;

    list.innerHTML = ""; 
    if (typeof themes === 'undefined') {
        console.error("錯誤：找不到 themes 資料庫");
        return;
    }

    Object.keys(themes).forEach(t => {
        const btn = document.createElement('button');
        btn.innerText = t;
        btn.style.padding = "15px 10px";
        btn.style.borderRadius = "12px";
        btn.style.border = "1px solid #ffccbc";
        btn.style.backgroundColor = "#fff";
        btn.style.cursor = "pointer";
        btn.onclick = () => startLevel(t);
        list.appendChild(btn);
    });
}

// 5. 密碼驗證 (修正完畢)
function verifyAccess() {
    const input = document.getElementById('authCodeInput').value;
    if (input === MY_PRIVATE_PASSWORD) {
        document.getElementById('lockOverlay').style.display = 'none';
        renderLevelSelect(); 
        updateUI();
        console.log("登入成功");
    } else {
        alert("密碼錯誤！");
    }
}

// 6. 其他遊戲功能 (補完所有函數)
function loadQuiz() {
    const q = state.quizSet[state.quizIdx];
    const formattedWord = q.en;
    document.getElementById('progressIdx').innerText = state.quizIdx + 1;
    document.getElementById('totalIdx').innerText = state.quizSet.length;
    document.getElementById('qPos').innerText = q.pos;
    const qCnText = document.getElementById('qCnText');
    const wordBtn = document.getElementById('wordVoiceBtn');
    const senBtn = document.getElementById('sentenceVoiceBtn');
    
    if (state.mode === 'sentence') {
        document.getElementById('quizModeLabel').innerText = "📖 例句挑戰";
        qCnText.style.display = "none"; wordBtn.style.display = "none"; senBtn.style.display = "inline-block";
    } else {
        document.getElementById('quizModeLabel').innerText = state.mode === 'scramble' ? "🧩 字母重組" : "✍️ 拼字練習";
        qCnText.innerText = q.cn; qCnText.style.display = "inline"; wordBtn.style.display = "inline-block"; senBtn.style.display = "none";
    }
    const maskedSentence = q.sen.replace(new RegExp(q.en, 'gi'), '______');
    document.getElementById('qSentence').innerText = maskedSentence;
    document.getElementById('qTrans').innerText = q.trans || "";
    document.getElementById('wordSlots').innerHTML = "";
    currentInputArr = []; const area = document.getElementById('inputArea'); area.innerHTML = "";
    
    if(state.mode === 'scramble') {
        poolLetters = formattedWord.split('').sort(() => Math.random() - 0.5);
        // 如果你有 renderPool 函數請保留
        for(let i=0; i<formattedWord.length; i++) {
            document.getElementById('wordSlots').innerHTML += `<span class="word-slot"></span>`;
        }
    } else {
        area.innerHTML = `<input type="text" id="spellInput" class="lock-input" style="width:90%;" placeholder="輸入單字" autofocus onkeydown="if(event.key==='Enter') checkAnswer()">`;
    }
}

function checkAnswer() {
    const q = state.quizSet[state.quizIdx];
    let ans = document.getElementById('spellInput') ? document.getElementById('spellInput').value.trim() : "";
    if(ans.toLowerCase() === q.en.toLowerCase()) {
        state.coins += 5; alert("答對了！💰+5"); nextQuestion();
    } else {
        state.mood = Math.max(0, state.mood - 5);
        alert("答錯了！正確答案是: " + q.en);
        if(!state.wrongList.some(w => w.en === q.en)) state.wrongList.push(q);
        nextQuestion();
    }
    updateUI(); saveLocal();
}

function nextQuestion() {
    state.quizIdx++;
    if(state.quizIdx >= state.quizSet.length) { alert("🎉 15 題挑戰完成！"); goHome(); } else loadQuiz();
}

function goHome() { showScreen('lobbyScreen'); updateUI(); }
function showScreen(id) { 
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    const target = document.getElementById(id);
    if(target) target.style.display = 'block';
    if(id === 'topicScreen') renderLevelSelect(); 
}

function updateUI() {
    document.getElementById('coinDisplay').innerText = state.coins;
    document.getElementById('wrongCount').innerText = state.wrongList.length;
    document.getElementById('inv-fish').innerText = state.inventory.fish;
    document.getElementById('inv-soap').innerText = state.inventory.soap;
    document.getElementById('hVal').innerText = state.hunger;
    document.getElementById('cVal').innerText = state.clean;
    document.getElementById('mVal').innerText = state.mood;
    document.getElementById('catNameLabel').innerText = state.catName;
}

function saveLocal() { localStorage.setItem('catGame_V35', JSON.stringify(state)); }
function loadLocal() { const saved = localStorage.getItem('catGame_V35'); if(saved) state = JSON.parse(saved); }

// 初始化
window.onload = () => {
    loadLocal();
    updateUI();
};
