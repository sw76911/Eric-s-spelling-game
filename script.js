// --- 基礎設定 ---
const MY_PRIVATE_PASSWORD = "0127"; 
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwOiL-ScKXeJQSi4kFw8o5zUWSXjtSdJlQfkZlc7mZxhNgcgmuXCppJejFamm1pxF98/exec"; 

let state = { coins: 100, hunger: 80, clean: 80, mood: 80, catName: '我的小貓', quizSet: [], quizIdx: 0, wrongList: [] };

// --- 密碼驗證 (確保這個函數名稱跟 HTML 的 onclick 一致) ---
function verifyAccess() {
    const input = document.getElementById('authCodeInput').value;
    if (input === MY_PRIVATE_PASSWORD) {
        document.getElementById('lockOverlay').style.display = 'none';
        renderLevelSelect();
        console.log("登入成功！");
    } else {
        alert("密碼錯誤！");
    }
}

// --- 渲染關卡 ---
function renderLevelSelect() {
    const list = document.getElementById('level-list');
    if (!list) return;
    list.innerHTML = "";
    
    if (typeof themes === 'undefined') {
        alert("錯誤：找不到 data.js 裡的題庫資料！請檢查 index.html 引入順序。");
        return;
    }

    Object.keys(themes).forEach(t => {
        const btn = document.createElement('button');
        btn.innerText = t;
        btn.style.padding = "10px";
        btn.onclick = () => alert("你點擊了：" + t); // 先測試按鈕有沒有反應
        list.appendChild(btn);
    });
}

// --- 畫面切換 ---
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    const target = document.getElementById(id);
    if(target) target.style.display = 'block';
}

window.onload = () => { console.log("程式已啟動"); };
