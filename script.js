const USERS = { pc: "admin", phone: "admin1" };

const loginCard = document.getElementById("login-card");
const controlCard = document.getElementById("control-card");
const errorMsg = document.getElementById("error-msg");
const userNameSpan = document.getElementById("user-name");
const outputEl = document.getElementById("output");
const logEl = document.getElementById("log");
const fileListEl = document.getElementById("file-list");

let currentUser = null;

window.onload = () => {
    const storedUser = localStorage.getItem("loggedInUser");
    if(storedUser) loginSuccess(storedUser);
    else loginCard.style.display = "block";
};

// Логін
document.getElementById("login-btn").onclick = () => {
    const nick = document.getElementById("nickname").value.trim();
    const pwd = document.getElementById("password").value.trim();

    if(USERS[nick] && USERS[nick] === pwd) {
        localStorage.setItem("loggedInUser", nick);
        loginSuccess(nick);
    } else {
        errorMsg.textContent = "Невірний нік або пароль";
    }
};

function loginSuccess(user) {
    currentUser = user;
    userNameSpan.textContent = user;
    loginCard.style.display = "none";
    controlCard.style.display = "block";
    renderLog();
    renderFiles();
}

// Logout
document.getElementById("logout-btn").onclick = () => {
    localStorage.removeItem("loggedInUser");
    currentUser = null;
    loginCard.style.display = "block";
    controlCard.style.display = "none";
    errorMsg.textContent = "";
};

// Команди
document.getElementById("send-btn").onclick = () => {
    const cmd = document.getElementById("command-select").value;
    const arg = document.getElementById("arg").value.trim();
    let result = "";

    switch(cmd) {
        case "hello":
            result = "Hello from PC!";
            break;
        case "list":
            result = "File1.txt\nFile2.txt\nFile3.txt";
            break;
        case "custom_echo":
            result = arg ? arg : "No argument provided for custom_echo";
            break;
        default:
            result = "Command not allowed";
    }

    outputEl.textContent = result;

    logAction(cmd + (arg ? " " + arg : ""), result);
};

// Журнал
function logAction(cmd, output) {
    let log = JSON.parse(localStorage.getItem("actionLog") || "[]");
    log.push({user: currentUser, cmd, output, time: new Date().toLocaleTimeString()});
    localStorage.setItem("actionLog", JSON.stringify(log));
    renderLog();
}

function renderLog() {
    const log = JSON.parse(localStorage.getItem("actionLog") || "[]");
    logEl.innerHTML = "";
    log.slice(-20).reverse().forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>[${item.time}]</strong> <em>${item.user}</em> → <code>${item.cmd}</code><div>${item.output}</div>`;
        logEl.appendChild(li);
    });
}

// Файли
document.getElementById("upload-btn").onclick = () => {
    const files = document.getElementById("file-input").files;
    if(files.length === 0) return;

    let storedFiles = JSON.parse(localStorage.getItem("files") || "[]");

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
            storedFiles.push({name: file.name, content: reader.result, user: currentUser, time: new Date().toLocaleTimeString()});
            localStorage.setItem("files", JSON.stringify(storedFiles));
            renderFiles();
        };
        reader.readAsDataURL(file); // зберігаємо у Base64
    });
};

function renderFiles() {
    let storedFiles = JSON.parse(localStorage.getItem("files") || "[]");
    fileListEl.innerHTML = "";
    storedFiles.slice(-20).reverse().forEach(f => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>[${f.time}]</strong> <em>${f.user}</em> → ${f.name} <button onclick="downloadFile('${f.name}')">Download</button>`;
        fileListEl.appendChild(li);
    });
}

window.downloadFile = function(name) {
    const storedFiles = JSON.parse(localStorage.getItem("files") || "[]");
    const f = storedFiles.find(f => f.name === name);
    if(f) {
        const a = document.createElement("a");
        a.href = f.content;
        a.download = f.name;
        a.click();
    }
}
