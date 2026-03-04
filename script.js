// --- 1. 基礎設定 ---
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
    quizSet: [], quizIdx: 0, mode: ''
};

// --- 2. 畫面切換邏輯 (與 HTML ID 對接) ---
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    
    const target = document.getElementById(id);
    if (target) {
        target.classList.add('active');
        target.style.display = 'block';
    }
    
    // 如果進入關卡選擇頁，自動渲染按鈕
    if (id === 'levelScreen') {
        renderLevelSelect();
    }
}

// 這是對應你 HTML 裡 item-card onclick 的函數
function showLevelSelect(mode) {
    state.mode = mode; // 儲存玩家選的是拼字還是重組
    showScreen('levelScreen');
}

function goHome() {
    showScreen('lobbyScreen');
    updateUI();
}

// --- 3. 密碼驗證 ---
function verifyAccess() {
    const input = document.getElementById('authCodeInput').value;
    if (input === MY_PRIVATE_PASSWORD) {
        document.getElementById('lockOverlay').style.display = 'none';
        updateUI();
        console.log("登入成功");
    } else {
        alert("密碼錯誤！");
    }
}

// --- 4. 關卡渲染 (Level 1~30) ---
function renderLevelSelect() {
    const list = document.getElementById('level-list');
    if (!list) return;
    list.innerHTML = "";

    if (typeof themes === 'undefined') {
        console.error("找不到 themes 資料");
        return;
    }

    Object.keys(themes).forEach(t => {
        const btn = document.createElement('button');
        btn.innerText = t;
        btn.className = "item-card"; // 使用你 CSS 裡的樣式
        btn.style.width = "100%";
        btn.style.marginBottom = "10px";
        btn.onclick = () => startLevel(t);
        list.appendChild(btn);
    });
}

// --- 5. 遊戲核心邏輯 ---
function startLevel(t) {
    if (!themes[t]) return;
    
    state.hunger = Math.max(0, state.hunger - 5);
    state.clean = Math.max(0, state.clean - 5);
    
    let all = [...themes[t]];
    // 隨機抽 15 題
    state.quizSet = all.sort(() => Math.random() - 0.5).slice(0, 15);
    state.quizIdx = 0;
    
    showScreen('gameScreen');
    loadQuiz();
    updateUI();
    saveLocal();
}

// 補上 loadQuiz, checkAnswer, updateUI 等函數...
function loadQuiz() {
    const q = state.quizSet[state.quizIdx];
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
    
    document.getElementById('qSentence').innerText = q.sen.replace(new RegExp(q.en, 'gi'), '______');
    document.getElementById('qTrans').innerText = q.trans || "";
    
    const area = document.getElementById('inputArea');
    area.innerHTML = `<input type="text" id="spellInput" style="width:90%; padding:10px; font-size:18px; border-radius:10px; border:1px solid #ccc;" placeholder="輸入單字" autofocus onkeydown="if(event.key==='Enter') checkAnswer()">`;
}

function checkAnswer() {
    const q = state.quizSet[state.quizIdx];
    const input = document.getElementById('spellInput');
    const ans = input ? input.value.trim().toLowerCase() : "";
    
    if (ans === q.en.toLowerCase()) {
        state.coins += 5;
        alert("太棒了！答對了 💰+5");
        nextQuestion();
    } else {
        state.mood = Math.max(0, state.mood - 5);
        alert("可惜錯了！答案是: " + q.en);
        if(!state.wrongList.some(w => w.en === q.en)) state.wrongList.push(q);
        nextQuestion();
    }
    updateUI();
    saveLocal();
}

function nextQuestion() {
    state.quizIdx++;
    if (state.quizIdx >= state.quizSet.length) {
        alert("🎉 本關挑戰完成！");
        goHome();
    } else {
        loadQuiz();
    }
}

// --- 6. 貓咪照顧與 UI ---
function updateUI() {
    document.getElementById('coinDisplay').innerText = state.coins;
    document.getElementById('wrongCount').innerText = state.wrongList.length;
    document.getElementById('hVal').innerText = state.hunger;
    document.getElementById('cVal').innerText = state.clean;
    document.getElementById('mVal').innerText = state.mood;
    document.getElementById('inv-fish').innerText = state.inventory.fish;
    document.getElementById('inv-soap').innerText = state.inventory.soap;
    document.getElementById('catNameLabel').innerText = state.catName;
}

function toggleModal(id, show) {
    document.getElementById(id).style.display = show ? 'block' : 'none';
}

function saveLocal() { localStorage.setItem('catGame_V35', JSON.stringify(state)); }
function loadLocal() { 
    const saved = localStorage.getItem('catGame_V35'); 
    if(saved) state = JSON.parse(saved); 
}

window.onload = () => {
    loadLocal();
    updateUI();
};
