// --- 1. 基礎與狀態設定 ---
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwOiL-ScKXeJQSi4kFw8o5zUWSXjtSdJlQfkZlc7mZxhNgcgmuXCppJejFamm1pxF98/exec"; 
const MY_PRIVATE_PASSWORD = "0127"; 

let state = {
    coins: 100, hunger: 80, clean: 80, mood: 80, catName: '我的小貓',
    inventory: { fish: 2, soap: 1 }, bag: [], wrongList: [],
    equipped: { head:null, suit:null, socks:null, color:'#f39c12' },
    quizSet: [], quizIdx: 0, mode: '', currentLevelName: ''
};

const shopItems = {
    daily: [{id:'f1', name:'鮮魚', price:10, type:'fish'}, {id:'s1', name:'沐浴乳', price:10, type:'soap'}],
    toys: [{id:'t1', name:'皮球', price:20, type:'toy', icon:'⚽'}, {id:'t2', name:'逗貓棒', price:30, type:'toy', icon:'🪄'}],
    hats: [{id:'h1', name:'草帽', price:40, style:'#f0e68c', part:'head'}, {id:'h2', name:'飛行帽', price:90, style:'#8b4513', part:'head'}],
    clothes: [{id:'c1', name:'小T', price:60, style:'#98fb98', part:'suit'}, {id:'c2', name:'背心', price:120, style:'skyblue', part:'suit'}],
    socks: [{id:'k1', name:'白襪', price:15, style:'#ffffff', part:'socks'}, {id:'k2', name:'黑襪', price:15, style:'#333333', part:'socks'}]
};

let currentInputArr = []; // 儲存字母重組已點選的字母
let poolLetters = [];    // 儲存字母重組待選的字母池

// --- 2. 核心功能：發音 (修正點 2) ---
function speakWord() { 
    window.speechSynthesis.cancel(); 
    const q = state.quizSet[state.quizIdx]; 
    const msg = new SpeechSynthesisUtterance(q.en); 
    msg.lang = 'en-US'; 
    window.speechSynthesis.speak(msg); 
}
function speakSentence() { 
    window.speechSynthesis.cancel(); 
    const q = state.quizSet[state.quizIdx]; 
    const msg = new SpeechSynthesisUtterance(q.sen); 
    msg.lang = 'en-US'; 
    msg.rate = 0.8; 
    window.speechSynthesis.speak(msg); 
}

// --- 3. 遊戲流程與字母重組 (修正點 1) ---
function showLevelSelect(mode) {
    state.mode = mode;
    document.getElementById('lobbyScreen').style.display = 'none';
    document.getElementById('levelScreen').style.display = 'block';
    renderLevelSelect();
}

function startLevel(levelKey) {
    if (!themes[levelKey]) return;
    state.hunger = Math.max(0, state.hunger - 5);
    state.clean = Math.max(0, state.clean - 5);
    state.quizSet = [...themes[levelKey]].sort(() => Math.random() - 0.5).slice(0, 15);
    state.quizIdx = 0;
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
    
    // UI 顯示控制
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

    // 清空輸入區
    const area = document.getElementById('inputArea');
    const slots = document.getElementById('wordSlots');
    area.innerHTML = ""; slots.innerHTML = "";
    currentInputArr = [];

    if (state.mode === 'scramble') {
        // 字母重組模式：生成可點擊氣泡
        poolLetters = q.en.split('').sort(() => Math.random() - 0.5);
        renderPool();
        // 顯示空格槽
        for(let i=0; i<q.en.length; i++) {
            slots.innerHTML += `<span class="word-slot" onclick="removeLetter(${i})"></span>`;
        }
    } else {
        // 拼字模式：顯示輸入框
        area.innerHTML = `<input type="text" id="spellInput" class="lock-input" style="width:90%;" placeholder="輸入單字" autofocus onkeydown="if(event.key==='Enter') checkAnswer()">`;
    }
}

// 渲染待選字母池
function renderPool() {
    const area = document.getElementById('inputArea');
    area.innerHTML = `<div class="letter-pool"></div>`;
    const poolCont = area.querySelector('.letter-pool');
    poolLetters.forEach((char, idx) => {
        if(char === null) return;
        const btn = document.createElement('div');
        btn.className = "letter-bubble";
        btn.innerText = char;
        btn.onclick = () => selectLetter(idx);
        poolCont.appendChild(btn);
    });
}

function selectLetter(idx) {
    const char = poolLetters[idx];
    currentInputArr.push({ char, originIdx: idx });
    poolLetters[idx] = null; // 標記已選
    renderPool();
    updateSlots();
}

function removeLetter(slotIdx) {
    if(!currentInputArr[slotIdx]) return;
    const item = currentInputArr.splice(slotIdx, 1)[0];
    poolLetters[item.originIdx] = item.char;
    renderPool();
    updateSlots();
}

function updateSlots() {
    const slotElements = document.querySelectorAll('.word-slot');
    slotElements.forEach((el, i) => {
        el.innerText = currentInputArr[i] ? currentInputArr[i].char : "";
    });
}

function checkAnswer() {
    const q = state.quizSet[state.quizIdx];
    let ans = (state.mode === 'scramble') ? currentInputArr.map(i=>i.char).join('') : document.getElementById('spellInput').value.trim();
    
    if (ans.toLowerCase() === q.en.toLowerCase()) {
        state.coins += 5;
        alert("答對了！💰+5");
        nextQuestion();
    } else {
        state.mood = Math.max(0, state.mood - 5);
        alert("答錯了！答案是: " + q.en);
        if(!state.wrongList.some(w => w.en === q.en)) state.wrongList.push(q);
        nextQuestion();
    }
    updateUI();
    saveLocal();
}

function nextQuestion() {
    state.quizIdx++;
    if (state.quizIdx >= state.quizSet.length) {
        alert("🎉 挑戰完成！");
        goHome();
    } else {
        loadQuiz();
    }
}

// --- 4. 貓咪照顧功能 (修正點 3) ---
function care(type) {
    if (type === 'fish' && state.inventory.fish > 0) {
        state.hunger = Math.min(100, state.hunger + 20);
        state.inventory.fish--;
        alert("餵食成功！🍖+20");
    } else if (type === 'soap' && state.inventory.soap > 0) {
        state.clean = Math.min(100, state.clean + 20);
        state.inventory.soap--;
        alert("洗澡成功！🧼+20");
    } else {
        alert("道具不足，請去商城購買喔！");
    }
    updateUI();
    saveLocal();
}

function openToySelect() {
    const myToys = state.bag.filter(i => i.type === 'toy');
    if (myToys.length === 0) return alert("背包裡沒有玩具喔！");
    const cont = document.getElementById('toyOptionList');
    cont.innerHTML = "";
    myToys.forEach(t => {
        cont.innerHTML += `<div onclick="useToy('${t.id}')" style="cursor:pointer; font-size:30px;">${t.icon}<br><small>${t.name}</small></div>`;
    });
    document.getElementById('toySelectModal').style.display = 'block';
}

function useToy(id) {
    const toy = state.bag.find(i => i.id === id);
    document.getElementById('toySelectModal').style.display = 'none';
    const disp = document.getElementById('toyDisplay');
    disp.innerText = toy.icon;
    disp.style.display = 'block';
    state.mood = Math.min(100, state.mood + 20);
    setTimeout(() => disp.style.display = 'none', 3000);
    updateUI();
    saveLocal();
}

// --- 5. 商城功能 (修正點 4) ---
function renderShop(cat, btn) {
    if(btn) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
    const cont = document.getElementById('shop-content');
    cont.innerHTML = "";
    if (!shopItems[cat]) return;
    
    shopItems[cat].forEach(i => {
        // --- 核心邏輯：檢查是否已經擁有 ---
        // 如果是消耗品 (fish, soap)，永遠顯示價格。如果是衣服或玩具，檢查背包。
        const isPermanent = (cat !== 'daily'); // 除了 daily (魚、肥皂) 以外都是永久品
        const isOwned = isPermanent && state.bag.some(owned => owned.id === i.id);

        const itemDiv = document.createElement('div');
        itemDiv.className = "item-card";
        
        // 根據是否擁有，決定按鈕的樣式與內容
        const displayPrice = isOwned ? "已擁有" : `💰 ${i.price}`;
        const clickAction = isOwned ? "alert('你已經買過這個囉！')" : `buyItem('${cat}', '${i.id}')`;
        const opacityStyle = isOwned ? "opacity: 0.6; cursor: default;" : "cursor: pointer;";

        itemDiv.innerHTML = `
            <div style="font-size:30px; margin-bottom:5px;">${i.icon || '👕'}</div>
            <div style="font-weight:bold;">${i.name}</div>
            <button 
                onclick="${clickAction}" 
                style="margin-top:10px; padding:5px 10px; border-radius:10px; border:none; background:var(--primary); color:white; ${opacityStyle}">
                ${displayPrice}
            </button>
        `;
        
        cont.appendChild(itemDiv);
    });
}

function buyItem(itemKey) {
    const item = shopData[itemKey];
    if (!item) return;

    // 1. 檢查是否為「永久性道具」（衣服、背景、玩具）
    // 消耗性道具（如：魚 🐟、肥皂 🧼）可以重複購買，所以排除在外
    const permanentTypes = ['clothes', 'bg', 'toy'];
    
    if (permanentTypes.includes(item.type)) {
        // 檢查背包 (state.bag) 裡是否已經有這個道具的 ID
        const alreadyOwned = state.bag.some(owned => owned.id === itemKey);
        
        if (alreadyOwned) {
            alert(`📢 提醒：你已經擁有「${item.name}」囉！不需要重複購買。`);
            return; // 直接中斷函數，不扣錢
        }
    }

    // 2. 檢查金幣是否足夠
    if (state.coins >= item.price) {
        state.coins -= item.price;
        
        // 3. 根據種類加入背包或增加數量
        if (item.type === 'food') {
            state.inventory.fish = (state.inventory.fish || 0) + 1;
        } else if (item.type === 'clean') {
            state.inventory.soap = (state.inventory.soap || 0) + 1;
        } else {
            // 衣服或玩具，存入背包陣列
            state.bag.push({
                id: itemKey,
                name: item.name,
                type: item.type,
                img: item.img
            });
        }
        
        alert(`成功購買 ${item.name}！`);
        updateUI();
        saveLocal(); // 記得儲存進度（現在是加密存檔了）
    } else {
        alert("金幣不足喔！加油多答對幾題吧！");
    }
}

// --- 6. 系統與 UI ---
function updateUI() {
    document.getElementById('coinDisplay').innerText = state.coins;
    document.getElementById('wrongCount').innerText = state.wrongList.length;
    document.getElementById('hVal').innerText = state.hunger;
    document.getElementById('cVal').innerText = state.clean;
    document.getElementById('mVal').innerText = state.mood;
    document.getElementById('inv-fish').innerText = state.inventory.fish;
    document.getElementById('inv-soap').innerText = state.inventory.soap;
    document.getElementById('catNameLabel').innerText = state.catName;
    
    // 背包顯示
    const bagCont = document.getElementById('bag-content');
    if(bagCont) {
        bagCont.innerHTML = "";
        state.bag.forEach(i => {
            bagCont.innerHTML += `<div class="item-card">${i.icon || '👕'} ${i.name}</div>`;
        });
    }
}

function renderLevelSelect() {
    const list = document.getElementById('level-list');
    if (!list) return;
    list.innerHTML = "";
    Object.keys(themes).forEach(t => {
        const btn = document.createElement('div');
        btn.className = "item-card";
        btn.innerText = t;
        btn.onclick = () => startLevel(t);
        list.appendChild(btn);
    });
}

function verifyAccess() {
    if (document.getElementById('authCodeInput').value === MY_PRIVATE_PASSWORD) {
        document.getElementById('lockOverlay').style.display = 'none';
        updateUI();
    } else { alert("密碼錯誤！"); }
}

function toggleModal(id, s) { 
    document.getElementById(id).style.display = s ? 'block' : 'none'; 
    if(id === 'shopModal' && s) renderShop('daily'); // 打開商城預設顯示日常
}

function goHome() {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById('lobbyScreen').style.display = 'block';
    updateUI();
}

function saveLocal() { localStorage.setItem('catGame_V35', JSON.stringify(state)); }
function loadLocal() { 
    const saved = localStorage.getItem('catGame_V35'); 
    if(saved) state = JSON.parse(saved); 
}

window.onload = () => { loadLocal(); updateUI(); };
