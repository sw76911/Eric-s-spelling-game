// --- 1. 基礎與狀態設定 ---
const MY_PRIVATE_PASSWORD = "0127"; 

let state = {
    currentUser: '',
    coins: 100, hunger: 80, clean: 80, mood: 80, catName: '我的小貓',
    inventory: { fish: 2, soap: 1 }, bag: [], wrongList: [],
    equipped: { head:null, suit:null, socks:null, color:'#f39c12' },
    quizSet: [], quizIdx: 0, mode: '', currentLevelName: ''
};

const shopItems = {
    daily: [{id:'f1', name:'鮮魚', price:10, type:'fish', icon:'🐟'}, {id:'s1', name:'沐浴乳', price:10, type:'soap', icon:'🧼'}],
    toys: [{id:'t1', name:'皮球', price:20, type:'toy', icon:'⚽'}, {id:'t2', name:'逗貓棒', price:30, type:'toy', icon:'🪄'}],
    hats: [{id:'h1', name:'草帽', price:40, style:'#f0e68c', part:'head', icon:'👒'}, {id:'h2', name:'飛行帽', price:90, style:'#8b4513', part:'head', icon:'👨‍✈️'}],
    clothes: [{id:'c1', name:'小T', price:60, style:'#98fb98', part:'suit', icon:'👕'}, {id:'c2', name:'背心', price:120, style:'skyblue', part:'suit', icon:'🎽'}],
    socks: [{id:'k1', name:'白襪', price:15, style:'#ffffff', part:'socks', icon:'🧦'}, {id:'k2', name:'黑襪', price:15, style:'#333333', part:'socks', icon:'🧦'}]
};

// --- 2. 存檔與安全性邏輯 ---
function saveLocal() { 
    if (!state.currentUser) return; 
    const dataString = JSON.stringify(state);
    const encodedData = btoa(unescape(encodeURIComponent(dataString)));
    localStorage.setItem('catGame_V35_Data_' + state.currentUser, encodedData); 
}

function loadLocal() { 
    if (!state.currentUser) return; 
    const savedRaw = localStorage.getItem('catGame_V35_Data_' + state.currentUser); 
    if (savedRaw) {
        try {
            const decodedData = decodeURIComponent(escape(atob(savedRaw)));
            state = JSON.parse(decodedData);
        } catch(e) { console.error("讀取失敗"); resetNewUser(state.currentUser); }
    } else { resetNewUser(state.currentUser); }
    updateUI();
}

function resetNewUser(name) {
    state.coins = 100; state.inventory = { fish: 2, soap: 1 };
    state.bag = []; state.wrongList = [];
    state.catName = name + "的小貓";
    state.hunger = 80; state.clean = 80; state.mood = 80;
}

function verifyAccess() {
    const name = document.getElementById('userNameInput').value.trim();
    const pass = document.getElementById('authCodeInput').value;
    if (pass === MY_PRIVATE_PASSWORD) {
        if (!name) return alert("請輸入使用者名稱！");
        state.currentUser = name; 
        loadLocal();
        document.getElementById('lockOverlay').style.display = 'none';
        updateUI();
    } else { alert("管理密碼錯誤！"); }
}

// --- 3. 商店與購買功能 ---
function renderShop(cat, btn) {
    if(btn) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
    const cont = document.getElementById('shop-content');
    if (!cont) return;
    cont.innerHTML = "";
    if (!shopItems[cat]) return;
    shopItems[cat].forEach(i => {
        const isPermanent = (cat !== 'daily'); 
        const isOwned = isPermanent && state.bag.some(owned => owned.id === i.id);
        const itemDiv = document.createElement('div');
        itemDiv.className = "item-card";
        const displayPrice = isOwned ? "已擁有" : `💰 ${i.price}`;
        const clickAction = isOwned ? "alert('你已經擁有囉！')" : `buyItem('${cat}', '${i.id}')`;
        const btnBg = isOwned ? "#ccc" : "var(--primary)";
        itemDiv.innerHTML = `<div style="font-size:30px; margin-bottom:5px;">${i.icon || '👕'}</div><div style="font-weight:bold;">${i.name}</div><button onclick="${clickAction}" style="margin-top:10px; padding:5px 10px; border-radius:10px; border:none; background:${btnBg}; color:white;">${displayPrice}</button>`;
        cont.appendChild(itemDiv);
    });
}

function buyItem(cat, id) {
    const item = shopItems[cat].find(x => x.id === id);
    if (!item) return;
    if (state.coins >= item.price) {
        state.coins -= item.price;
        if (cat === 'daily') {
            if (item.type === 'fish') state.inventory.fish++;
            if (item.type === 'soap') state.inventory.soap++;
        } else { state.bag.push({ id: id, name: item.name, type: item.type, icon: item.icon }); }
        alert(`成功購買 ${item.name}！`);
        saveLocal(); updateUI(); renderShop(cat); 
    } else { alert("金幣不足喔！"); }
}

// --- 4. 遊戲流程控制 ---
function showLevelSelect(mode) {
    state.mode = mode;
    document.getElementById('lobbyScreen').style.display = 'none';
    document.getElementById('levelScreen').style.display = 'block';
    renderLevelSelect();
}

function renderLevelSelect() {
    const list = document.getElementById('level-list');
    list.innerHTML = "";
    Object.keys(themes).forEach(t => {
        const btn = document.createElement('div');
        btn.className = "item-card";
        btn.innerText = t;
        btn.onclick = () => startLevel(t);
        list.appendChild(btn);
    });
}

function startLevel(levelKey) {
    state.hunger = Math.max(0, state.hunger - 5);
    state.clean = Math.max(0, state.clean - 5);
    state.quizSet = [...themes[levelKey]].sort(() => Math.random() - 0.5).slice(0, 15);
    state.quizIdx = 0;
    document.getElementById('levelScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    saveLocal(); updateUI(); loadQuiz();
}

function startReview() {
    if (state.wrongList.length === 0) return alert("目前沒有錯題可以複習喔！");
    state.mode = 'review';
    state.quizSet = [...state.wrongList].sort(() => Math.random() - 0.5);
    state.quizIdx = 0;
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById('gameScreen').style.display = 'block';
    loadQuiz();
}

function loadQuiz() {
    const q = state.quizSet[state.quizIdx];
    if (!q) return;

    // 決定目前的模式 (複習模式下會自動抓題目的 errorMode)
    let currentMode = (state.mode === 'review') ? (q.errorMode || 'spell') : state.mode;

    // 更新介面文字
    document.getElementById('qCnText').innerText = q.cn;
    document.getElementById('qSentence').innerText = q.sen;
    document.getElementById('progressIdx').innerText = state.quizIdx + 1;
    document.getElementById('totalIdx').innerText = state.quizSet.length;
    
    if (state.mode === 'review') {
        document.getElementById('quizModeLabel').innerText = `🔥 複習中 (連續對: ${q.correctStreak || 0}/5)`;
    } else {
        document.getElementById('quizModeLabel').innerText = "探險中";
    }

    // ✨ 關鍵修正：重置並生成輸入區域
    const wordSlots = document.getElementById('wordSlots');
    const inputArea = document.getElementById('inputArea');
    wordSlots.innerHTML = ""; 
    inputArea.innerHTML = "";
    wordSlots.innerText = ""; // 清空文字

    if (currentMode === 'scramble') {
        // 問題 1：生成字母泡泡
        const letters = q.en.split('').sort(() => Math.random() - 0.5);
        letters.forEach(char => {
            const btn = document.createElement('button');
            btn.innerText = char;
            btn.className = "item-card";
            btn.style.cssText = "width:auto; padding:10px 15px; margin:5px; cursor:pointer; background:#fff; border:2px solid var(--primary);";
            btn.onclick = () => { wordSlots.innerText += char; };
            inputArea.appendChild(btn);
        });
    } else {
        // 問題 2, 3, 4：生成拼字/例句/錯題的輸入框
        const input = document.createElement('input');
        input.type = "text";
        input.id = "ansInput";
        input.className = "lock-input";
        input.placeholder = "請輸入英文...";
        input.style.width = "100%";
        inputArea.appendChild(input);
        setTimeout(() => input.focus(), 100); // 自動聚焦
    }
}

function checkAnswer() {
    const q = state.quizSet[state.quizIdx];
    const inputField = document.getElementById('ansInput');
    // 如果有 inputField 就抓它的值，不然就抓 wordSlots 的文字
    const userAns = inputField ? inputField.value.trim() : document.getElementById('wordSlots').innerText.trim();

    if (userAns.toLowerCase() === q.en.toLowerCase()) {
        if (state.mode === 'review') {
            q.correctStreak = (q.correctStreak || 0) + 1;
            if (q.correctStreak >= 5) {
                state.wrongList = state.wrongList.filter(w => w.en !== q.en);
            }
        }
        state.quizIdx++;
    } else {
        alert(`答錯了！答案是: ${q.en}`);
        if (state.mode === 'review') { 
            q.correctStreak = 0; 
        } else {
            if (!state.wrongList.some(w => w.en === q.en)) {
                state.wrongList.push({ ...q, errorMode: state.mode, correctStreak: 0 });
            }
        }
        state.quizIdx++; 
    }

    if (state.quizIdx >= state.quizSet.length) {
        if (state.mode === 'review' && state.wrongList.length > 0) { 
            startReview(); 
        } else { 
            alert("挑戰完成！"); 
            goHome(); 
        }
    } else { loadQuiz(); }
    saveLocal(); updateUI();
}

// --- 5. 貓咪照顧與背包功能 ---
function care(type) {
    if (type === 'fish' && state.inventory.fish > 0) {
        state.hunger = Math.min(100, state.hunger + 20); state.inventory.fish--;
    } else if (type === 'soap' && state.inventory.soap > 0) {
        state.clean = Math.min(100, state.clean + 20); state.inventory.soap--;
    } else { return alert("道具不足！"); }
    updateUI(); saveLocal();
}

function openToySelect() {
    const myToys = state.bag.filter(i => i.type === 'toy');
    if (myToys.length === 0) return alert("背包裡沒有玩具喔！");
    const cont = document.getElementById('toyOptionList');
    cont.innerHTML = "";
    myToys.forEach(t => {
        const div = document.createElement('div');
        div.style.cursor = "pointer";
        div.innerHTML = `${t.icon}<br><small>${t.name}</small>`;
        div.onclick = () => useToy(t);
        cont.appendChild(div);
    });
    document.getElementById('toySelectModal').style.display = 'block';
}

function useToy(toy) {
    document.getElementById('toySelectModal').style.display = 'none';
    const disp = document.getElementById('toyDisplay');
    disp.innerText = toy.icon; disp.style.display = 'block';
    state.mood = Math.min(100, state.mood + 20);
    setTimeout(() => disp.style.display = 'none', 3000);
    updateUI(); saveLocal();
}

// --- 6. UI 更新與輔助功能 ---
function updateUI() {
    document.getElementById('coinDisplay').innerText = state.coins;
    document.getElementById('wrongCount').innerText = state.wrongList.length;
    document.getElementById('hVal').innerText = state.hunger;
    document.getElementById('cVal').innerText = state.clean;
    document.getElementById('mVal').innerText = state.mood;
    document.getElementById('inv-fish').innerText = state.inventory.fish;
    document.getElementById('inv-soap').innerText = state.inventory.soap;
    document.getElementById('catNameLabel').innerText = state.catName;
    const bagCont = document.getElementById('bag-content');
    if(bagCont) {
        bagCont.innerHTML = "";
        state.bag.forEach(i => {
            const div = document.createElement('div');
            div.className = "item-card";
            div.innerText = `${i.icon || '👕'} ${i.name}`;
            bagCont.appendChild(div);
        });
    }
}

function goHome() {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById('lobbyScreen').style.display = 'block';
    updateUI();
}

function toggleModal(id, s) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.style.display = s ? 'block' : 'none'; 
    if(s && id === 'shopModal') renderShop('daily'); 
}

function speakWord() { 
    window.speechSynthesis.cancel(); 
    const q = state.quizSet[state.quizIdx]; 
    if(!q) return;
    const msg = new SpeechSynthesisUtterance(q.en); msg.lang = 'en-US'; 
    window.speechSynthesis.speak(msg); 
}

function speakSentence() { 
    window.speechSynthesis.cancel(); 
    const q = state.quizSet[state.quizIdx]; 
    if(!q) return;
    const msg = new SpeechSynthesisUtterance(q.sen); 
    msg.lang = 'en-US'; msg.rate = 0.7; 
    window.speechSynthesis.speak(msg); 
}

window.onload = () => { updateUI(); };
