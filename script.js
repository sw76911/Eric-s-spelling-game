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
            if (state.bag && state.bag.length > 0) {
                state.bag = state.bag.filter((item, index, self) =>
                    index === self.findIndex((t) => t.id === item.id)
                );
            }
        } catch(e) {
            console.error("讀取失敗");
            resetNewUser(state.currentUser);
        }
    } else {
        resetNewUser(state.currentUser);
    }
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

        itemDiv.innerHTML = `
            <div style="font-size:30px; margin-bottom:5px;">${i.icon || '👕'}</div>
            <div style="font-weight:bold;">${i.name}</div>
            <button onclick="${clickAction}" style="margin-top:10px; padding:5px 10px; border-radius:10px; border:none; background:${btnBg}; color:white;">
                ${displayPrice}
            </button>`;
        cont.appendChild(itemDiv);
    });
}

function buyItem(cat, id) {
    const item = shopItems[cat].find(x => x.id === id);
    if (!item || (cat !== 'daily' && state.bag.some(owned => owned.id === id))) return;

    if (state.coins >= item.price) {
        state.coins -= item.price;
        if (cat === 'daily') {
            if (item.type === 'fish') state.inventory.fish++;
            if (item.type === 'soap') state.inventory.soap++;
        } else {
            state.bag.push({ id: id, name: item.name, type: item.type, icon: item.icon });
        }
        alert(`成功購買 ${item.name}！`);
        saveLocal(); updateUI(); renderShop(cat); 
    } else { alert("金幣不足喔！"); }
}

// --- 4. 遊戲流程控制 (修正 loadQuiz) ---
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
    // 1. 📉 執行扣除邏輯：每闖關一次，飽食度與清潔度各下降 5%
    state.hunger = Math.max(0, state.hunger - 5);
    state.clean = Math.max(0, state.clean - 5);

    // 2. 準備題目資料
    state.quizSet = [...themes[levelKey]].sort(() => Math.random() - 0.5).slice(0, 15);
    state.quizIdx = 0;
    
    // 3. 切換顯示螢幕
    document.getElementById('levelScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';

    // 4. ✨ 關鍵：執行存檔與更新 UI，否則畫面上的數字不會變
    saveLocal(); 
    updateUI(); 
    
    // 5. 載入第一題
    loadQuiz();
}

function loadQuiz() {
    const q = state.quizSet[state.quizIdx];
    if (!q) return;

    // ✨ 如果是複習模式，每一題都要切換成它當初錯的那個模式
    if (state.mode === 'review') {
        state.currentQuestionMode = q.errorMode || 'spell'; // 紀錄當前這題要用什麼模式畫畫面
    } else {
        state.currentQuestionMode = state.mode; // 一般關卡跟隨大模式
    }

    // 更新 UI 文字
    document.getElementById('qCnText').innerText = q.cn;
    document.getElementById('qSentence').innerText = q.sen;
    
    // 如果是複習模式，顯示進度（例如：已對 3/5）
    if (state.mode === 'review') {
        document.getElementById('quizModeLabel').innerText = `🔥 複習中 (這題已對: ${q.correctStreak || 0}/5)`;
    }

    // 根據模式呼叫畫面的繪製函數 (scramble 或 spell)
    if (state.currentQuestionMode === 'scramble') {
        renderScramble(q);
    } else {
        renderSpell(q);
    }
}
function checkAnswer() {
    const q = state.quizSet[state.quizIdx];
    const userAns = document.getElementById('ansInput')?.value || ""; // 假設你的輸入框 ID

    if (userAns.toLowerCase() === q.en.toLowerCase()) {
        // --- 答對邏輯 ---
        if (state.mode === 'review') {
            // ✨ 如果是在「錯題複習模式」，累計該題的答對次數
            q.correctStreak = (q.correctStreak || 0) + 1;
            
            // 如果滿 5 次，從總庫中移除
            if (q.correctStreak >= 5) {
                state.wrongList = state.wrongList.filter(w => w.en !== q.en);
                alert(`恭喜！「${q.en}」已連續答對 5 次，從錯題本移除！`);
            }
        }
        
        // 繼續下一題
        state.quizIdx++;
        if (state.quizIdx >= state.quizSet.length) {
            if (state.mode === 'review') {
                // 如果複習完一輪了，重新洗牌再開始（達成一題接一題）
                startReview(); 
            } else {
                goHome(); // 一般關卡結束回首頁
            }
        } else {
            loadQuiz();
        }
    } else {
        // --- 答錯邏輯 ---
        alert("答錯了！答案是: " + q.en);
        
        // 如果是在複習模式答錯，歸零該題的連續次數
        if (state.mode === 'review') {
            q.correctStreak = 0;
        }

        // 如果這題不在錯題本中，加入它
        if (!state.wrongList.some(w => w.en === q.en)) {
            state.wrongList.push({
                ...q,
                errorMode: state.mode,
                correctStreak: 0
            });
        }
        
        // 答錯也要繼續下一題 (達成一題接一題)
        state.quizIdx++;
        if (state.quizIdx >= state.quizSet.length) {
            state.mode === 'review' ? startReview() : goHome();
        } else {
            loadQuiz();
        }
    }
    saveLocal();
    updateUI();
}
// --- 5. 貓咪照顧與背包功能 ---
function care(type) {
    if (type === 'fish' && state.inventory.fish > 0) {
        state.hunger = Math.min(100, state.hunger + 20);
        state.inventory.fish--;
    } else if (type === 'soap' && state.inventory.soap > 0) {
        state.clean = Math.min(100, state.clean + 20);
        state.inventory.soap--;
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
    disp.innerText = toy.icon;
    disp.style.display = 'block';
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
    
    if(s) {
        if(id === 'shopModal') renderShop('daily'); 
        // *** 加入這行，這樣點開錯題本時才會去抓資料 ***
        if(id === 'wrongListModal') renderWrongList(); 
    }
}

function speakWord() { 
    window.speechSynthesis.cancel(); 
    const q = state.quizSet[state.quizIdx]; 
    const msg = new SpeechSynthesisUtterance(q.en); msg.lang = 'en-US'; 
    window.speechSynthesis.speak(msg); 
}

function speakSentence() { 
    window.speechSynthesis.cancel(); 
    const q = state.quizSet[state.quizIdx]; 
    
    // ✨ 關鍵修正：直接使用 q.sen，這是不含底線的原始完整句子
    const msg = new SpeechSynthesisUtterance(q.sen); 
    
    msg.lang = 'en-US'; 
    msg.rate = 0.7; // 稍微慢一點點，讓學生聽得更清楚
    window.speechSynthesis.speak(msg); 
}
// --- 7. 錯題本功能 ---

// 渲染錯題列表
function renderWrongList() {
    const cont = document.getElementById('wrongListContent');
    if (!cont) return;
    cont.innerHTML = "";

    if (state.wrongList.length === 0) {
        cont.innerHTML = "<p style='text-align:center; padding:20px; color:#999;'>目前沒有錯題喔，真棒！</p>";
        return;
    }

    state.wrongList.forEach((q, index) => {
        const div = document.createElement('div');
        div.className = "item-card";
        div.style.cssText = "background:#fff5f5; border:1px solid #ffecec; padding:15px; border-radius:15px; text-align:left; margin-bottom:10px;";
       // 判斷顯示名稱
        const modeName = q.errorMode === 'scramble' ? '🧩 重組' : '✍️ 拼字';

        div.innerHTML = `
            <div style="font-weight:bold; color:var(--primary);">${q.en}</div>
            <div style="font-size:13px; color:#666;">${q.cn}</div>
            <div style="margin-top:10px; display:flex; gap:5px;">
                <button onclick="retryWrong(${index})" style="background:var(--primary); color:white; border:none; border-radius:8px; padding:5px 10px; cursor:pointer;">再次挑戰 (${modeName})</button>
                <button onclick="removeWrong(${index})" style="background:#ccc; color:white; border:none; border-radius:8px; padding:5px 10px; cursor:pointer;">移除</button>
            </div>
        `;
        cont.appendChild(div);
    });
}

// *** 關鍵保留：移除單個錯題 ***
function removeWrong(index) {
    if(confirm("確定要把這個單字從錯題本移除了嗎？")) {
        state.wrongList.splice(index, 1);
        saveLocal();
        updateUI();
        renderWrongList(); // 重新整理列表
    }
}

// *** 新增：以錯誤當時的模式重新挑戰 ***
function retryWrong(index) {
    const target = state.wrongList[index];
    
    // 1. 強制設定為錯誤時的模式
    state.mode = target.errorMode || 'spell'; 
    state.quizSet = [target]; // 只練習這一題
    state.quizIdx = 0;
    
    // 2. 切換畫面
    toggleModal('wrongListModal', false);
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById('gameScreen').style.display = 'block';
    
    // 3. 載入內容
    loadQuiz();
}
function startReview() {
    if (state.wrongList.length === 0) {
        alert("目前沒有錯題可以複習喔！");
        return;
    }

    // 1. 設定為複習模式
    state.mode = 'review';
    // 2. 把錯題本變成當前的題目集 (並隨機排序)
    state.quizSet = [...state.wrongList].sort(() => Math.random() - 0.5);
    state.quizIdx = 0;

    // 3. 切換畫面
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById('gameScreen').style.display = 'block';

    loadQuiz();
}
window.onload = () => { updateUI(); };
