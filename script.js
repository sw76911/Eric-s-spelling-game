// 請將下方兩個變數修改為你自己的值
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

let currentInputArr = []; let poolLetters = [];

function speakWord() { window.speechSynthesis.cancel(); const q = state.quizSet[state.quizIdx]; const msg = new SpeechSynthesisUtterance(q.en); msg.lang = 'en-US'; window.speechSynthesis.speak(msg); }
function speakSentence() { window.speechSynthesis.cancel(); const q = state.quizSet[state.quizIdx]; const msg = new SpeechSynthesisUtterance(q.sen); msg.lang = 'en-US'; msg.rate = 0.9; window.speechSynthesis.speak(msg); }

function startLevel(t) {
    state.hunger = Math.max(0, state.hunger - 5);
    state.clean = Math.max(0, state.clean - 5);
    let all = [...themes[t]];
    state.quizSet = all.sort(() => Math.random() - 0.5).slice(0, 15);
    state.quizIdx = 0;
    showScreen('gameScreen');
    loadQuiz();
    updateUI();
    saveLocal();
}

function loadQuiz() {
    const q = state.quizSet[state.quizIdx];
    const formattedWord = formatWord(q.en);
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
        renderPool();
        for(let i=0; i<formattedWord.length; i++) {
            document.getElementById('wordSlots').innerHTML += `<span class="word-slot" onclick="removeLetter(${i})"></span>`;
        }
    } else {
        area.innerHTML = `<input type="text" id="spellInput" class="lock-input" style="width:90%;" placeholder="輸入單字" autofocus onkeydown="if(event.key==='Enter') checkAnswer()">`;
    }
}

function checkAnswer() {
    const q = state.quizSet[state.quizIdx];
    let ans = state.mode === 'scramble' ? currentInputArr.map(i=>i.char).join('') : document.getElementById('spellInput').value.trim();
    if(ans.toLowerCase() === q.en.toLowerCase()) {
        state.coins += 5; alert("答對了！💰+5"); nextQuestion();
    } else {
        state.mood = Math.max(0, state.mood - 5);
        alert("答錯了！心情下降 5%\n正確答案是: " + formatWord(q.en));
        if(!state.wrongList.some(w => w.en === q.en)) state.wrongList.push(q);
        nextQuestion();
    }
    updateUI(); saveLocal();
}

function nextQuestion() {
    state.quizIdx++;
    if(state.quizIdx >= state.quizSet.length) { alert("🎉 15 題挑戰完成！"); goHome(); } else loadQuiz();
}

function verifyAccess() {
    if (document.getElementById('authCodeInput').value !== MY_PRIVATE_PASSWORD) return alert("密碼錯誤");
    document.getElementById('lockOverlay').style.display = 'none'; loadLocal(); updateUI(); renderShop('daily');
}
function formatWord(w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); }
function showLevelSelect(m) { state.mode = m; const list = document.getElementById('level-list'); list.innerHTML = ""; Object.keys(themes).forEach(t => { list.innerHTML += `<div class="item-card" onclick="startLevel('${t}')">🌟 ${t}</div>`; }); showScreen('levelScreen'); }
function renderPool() { const area = document.getElementById('inputArea'); area.innerHTML = ""; poolLetters.forEach((l, idx) => { if(l !== null) area.innerHTML += `<button class="letter-btn" onclick="addLetter('${l}', ${idx})">${l}</button>`; else area.innerHTML += `<div class="letter-btn" style="opacity:0.2; cursor:default;">&nbsp;</div>`; }); }
function addLetter(l, idx) { const slots = document.querySelectorAll('.word-slot'); if(currentInputArr.length < poolLetters.length) { currentInputArr.push({char: l, originIdx: idx}); poolLetters[idx] = null; renderPool(); const lastIdx = currentInputArr.length - 1; slots[lastIdx].innerText = l; } }
function removeLetter(slotIdx) { if(currentInputArr[slotIdx]) { const item = currentInputArr.splice(slotIdx, 1)[0]; poolLetters[item.originIdx] = item.char; renderPool(); const slots = document.querySelectorAll('.word-slot'); slots.forEach(s => s.innerText = ""); currentInputArr.forEach((val, i) => slots[i].innerText = val.char); } }
function startReview() { if(state.wrongList.length === 0) return alert("沒有錯題！"); state.quizSet = [...state.wrongList].sort(() => Math.random() - 0.5).slice(0, 15); state.quizIdx = 0; state.mode = 'spell'; showScreen('gameScreen'); loadQuiz(); }
function showScreen(id) { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); document.getElementById(id).classList.add('active'); }
function goHome() { showScreen('lobbyScreen'); updateUI(); }
function toggleModal(id, s) { document.getElementById(id).style.display = s?'block':'none'; }
function renderShop(cat, btn) { if(btn) { document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); } const cont = document.getElementById('shop-content'); cont.innerHTML = ""; shopItems[cat].forEach(i => { cont.innerHTML += `<div class="item-card" onclick="buyItem('${cat}','${i.id}')">${i.name}<br>💰${i.price}</div>`; }); }
function buyItem(cat, id) { const i = shopItems[cat].find(x => x.id === id); if(state.coins >= i.price) { state.coins -= i.price; if(cat === 'daily') state.inventory[i.type]++; else state.bag.push({...i}); updateUI(); saveLocal(); renderShop(cat); } else alert("金幣不足"); }
function updateUI() {
    document.getElementById('coinDisplay').innerText = state.coins;
    document.getElementById('wrongCount').innerText = state.wrongList.length;
    document.getElementById('inv-fish').innerText = state.inventory.fish;
    document.getElementById('inv-soap').innerText = state.inventory.soap;
    document.getElementById('hVal').innerText = state.hunger;
    document.getElementById('cVal').innerText = state.clean;
    document.getElementById('mVal').innerText = state.mood;
    document.getElementById('catNameLabel').innerText = state.catName;
    document.documentElement.style.setProperty('--cat-color', state.equipped.color);
    document.getElementById('layer-head').style.display = state.equipped.head ? 'block' : 'none';
    document.getElementById('layer-head').style.background = state.equipped.head || '';
    document.getElementById('layer-suit').style.display = state.equipped.suit ? 'block' : 'none';
    document.getElementById('layer-suit').style.background = state.equipped.suit || '';
    document.querySelectorAll('.socks-layer').forEach(s => { s.style.display = state.equipped.socks ? 'block' : 'none'; s.style.background = state.equipped.socks || ''; });
    const bagCont = document.getElementById('bag-content'); bagCont.innerHTML = "";
    state.bag.forEach((i, idx) => { if(i.type !== 'toy') bagCont.innerHTML += `<div class="item-card" onclick="toggleEquip(${idx})">${i.name}<br>${state.equipped[i.part] === i.style ? '✅' : '👕'}</div>`; else bagCont.innerHTML += `<div class="item-card">🧸 ${i.name}</div>`; });
}
function care(t) { if(state.inventory[t] > 0) { state[t === 'fish' ? 'hunger' : 'clean'] = Math.min(100, state[t === 'fish' ? 'hunger' : 'clean'] + 20); state.inventory[t]--; updateUI(); saveLocal(); } else alert("道具不足"); }
function openToySelect() { const myToys = state.bag.filter(i => i.type === 'toy'); if(myToys.length === 0) return alert("沒玩具！"); const cont = document.getElementById('toyOptionList'); cont.innerHTML = ""; myToys.forEach(t => cont.innerHTML += `<div onclick="useToy('${t.id}')" style="cursor:pointer; font-size:30px;">${t.icon}<br><small>${t.name}</small></div>`); document.getElementById('toySelectModal').style.display = 'block'; }
function useToy(id) { const toy = state.bag.find(i => i.id === id); document.getElementById('toySelectModal').style.display = 'none'; const disp = document.getElementById('toyDisplay'); disp.innerText = toy.icon; disp.style.display = 'block'; state.mood = Math.min(100, state.mood + 20); setTimeout(() => disp.style.display = 'none', 3000); updateUI(); saveLocal(); }
function changeSkin(c) { state.equipped.color = c; updateUI(); saveLocal(); }
function toggleEquip(idx) { const i = state.bag[idx]; state.equipped[i.part] = (state.equipped[i.part] === i.style) ? null : i.style; updateUI(); saveLocal(); }
function renameCat() { const n = prompt("取名：", state.catName); if(n) { state.catName = n; updateUI(); saveLocal(); } }
function saveLocal() { localStorage.setItem('catGame_V35', JSON.stringify(state)); if(GOOGLE_SCRIPT_URL.startsWith("http")) fetch(GOOGLE_SCRIPT_URL, {method:'POST', mode:'no-cors', body:JSON.stringify(state)}); }
function loadLocal() { const saved = localStorage.getItem('catGame_V35'); if(saved) state = JSON.parse(saved); }
function manualSync() { if(GOOGLE_SCRIPT_URL.startsWith("http")) fetch(GOOGLE_SCRIPT_URL, {method:'POST', mode:'no-cors', body:JSON.stringify(state)}); alert("同步完成！"); }
