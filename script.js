// --- 1. 基礎設定 (確保放在最上方) ---
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwOiL-ScKXeJQSi4kFw8o5zUWSXjtSdJlQfkZlc7mZxhNgcgmuXCppJejFamm1pxF98/exec"; 
const MY_PRIVATE_PASSWORD = "0127"; 

let state = {
    coins: 100, hunger: 80, clean: 80, mood: 80, catName: '我的小貓',
    inventory: { fish: 2, soap: 1 }, bag: [], wrongList: [],
    equipped: { head:null, suit:null, socks:null, color:'#f39c12' },
    quizSet: [], quizIdx: 0, mode: ''
};

const shopItems = {
    daily: [{id:'f1', name:'鮮魚', price:10, type:'fish'}, {id:'s1', name:'沐浴乳', price:10, type:'soap'}],
    toys: [{id:'t1', name:'皮球', price:20, type:'toy', icon:'⚽'}, {id:'t2', name:'逗貓棒', price:30, type:'toy', icon:'🪄'}],
    hats: [{id:'h1', name:'草帽', price:40, style:'#f0e68c', part:'head'}, {id:'h2', name:'飛行帽', price:90, style:'#8b4513', part:'head'}],
    clothes: [{id:'c1', name:'小T', price:60, style:'#98fb98', part:'suit'}, {id:'c2', name:'背心', price:120, style:'skyblue', part:'suit'}],
    socks: [{id:'k1', name:'白襪', price:15, style:'#ffffff', part:'socks'}, {id:'k2', name:'黑襪', price:15, style:'#333333', part:'socks'}]
};

// --- 2. 密碼驗證 (與 HTML onclick="verifyAccess()" 對接) ---
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

// --- 3. 畫面切換與核心邏輯 (關鍵修正！) ---

// 對應 HTML 裡圖標的 onclick="showLevelSelect('scramble')"
function showLevelSelect(mode) {
    console.log("進入模式：" + mode);
    state.mode = mode; // 紀錄模式
    
    // 切換畫面：隱藏大廳，顯示選關畫面
    const lobby = document.getElementById('lobbyScreen');
    const level = document.getElementById('levelScreen');
    
    if (lobby && level) {
        lobby.style.display = 'none';
        level.style.display = 'block';
        renderLevelSelect(); // 畫出關卡按鈕
    }
}

// 畫出 Level 1 ~ Level 30 的按鈕
function renderLevelSelect() {
    const list = document.getElementById('level-list');
    if (!list) return;
    list.innerHTML = "";

    if (typeof themes === 'undefined') {
        alert("找不到題庫資料，請檢查 data.js");
        return;
    }

    Object.keys(themes).forEach(t => {
        const btn = document.createElement('button');
        btn.innerText = t;
        btn.className = "item-card"; // 使用你 CSS 的卡片樣式
        btn.style.width = "100%";
        btn.onclick = () => startLevel(t);
        list.appendChild(btn);
    });
}

function goHome() {
    // 隱藏所有 screen
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    // 顯示大廳
    document.getElementById('lobbyScreen').style.display = 'block';
    updateUI();
}

// --- 4. 遊戲關卡流程 ---

function startLevel(t) {
    if (!themes[t]) return;
    state.currentLevel = t;
    
    // 隨機選 15 題
    let all = [...themes[t]];
    state.quizSet = all.sort(() => Math.random() - 0.5).slice(0, 15);
    state.quizIdx = 0;

    // 切換到遊戲畫面
    document.getElementById('levelScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    
    loadQuiz();
    updateUI();
}

function loadQuiz() {
    const q = state.quizSet[state.quizIdx];
    document.getElementById('progressIdx').innerText = state.quizIdx + 1;
    document.getElementById('totalIdx').innerText = state.quizSet.length;
    document.getElementById('qPos').innerText = q.pos;
    
    const qCnText = document.getElementById('qCnText');
    const wordBtn = document.getElementById('wordVoiceBtn');
    const senBtn = document.getElementById('sentenceVoiceBtn');

    // 根據模式顯示介面
    if (state.mode === 'sentence') {
        document.getElementById('quizModeLabel').innerText = "📖 例句挑戰";
        qCnText.style.display = "none"; wordBtn.style.display = "none"; senBtn.style.display = "inline-block";
    } else {
        document.getElementById('quizModeLabel').innerText = state.mode === 'scramble' ? "🧩 字母重組" : "✍️ 拼字練習";
        qCnText.innerText = q.cn; qCnText.style.display = "inline"; wordBtn.style.display = "inline-block"; senBtn.style.display = "none";
    }

    document.getElementById('qSentence').innerText = q.sen.replace(new RegExp(q.en, 'gi'), '______');
    document.getElementById('qTrans').innerText = q.trans || "";
    
    // 建立輸入框
    const area = document.getElementById('inputArea');
    area.innerHTML = `<input type="text" id="spellInput" style="width:90%; padding:12px; font-size:18px; border-radius:10px; border:1px solid #ddd;" placeholder="請輸入單字" autofocus onkeydown="if(event.key==='Enter') checkAnswer()">`;
}

function checkAnswer() {
    const q = state.quizSet[state.quizIdx];
    const input = document.getElementById('spellInput');
    if (!input) return;
    
    if (input.value.trim().toLowerCase() === q.en.toLowerCase()) {
        state.coins += 5;
        alert("正確！💰+5");
        nextQuestion();
    } else {
        state.mood = Math.max(0, state.mood - 5);
        alert("錯囉！正確答案是: " + q.en);
        if(!state.wrongList.some(w => w.en === q.en)) state.wrongList.push(q);
        nextQuestion();
    }
    updateUI();
    saveLocal();
}

function nextQuestion() {
    state.quizIdx++;
    if (state.quizIdx >= state.quizSet.length) {
        alert("🎉 關卡完成！");
        goHome();
    } else {
        loadQuiz();
    }
}

// --- 5. UI 更新與系統功能 ---

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
