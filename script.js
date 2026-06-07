// ===============================
// NAV / PAGE SWITCH (dacă ai page-uri interne)
// ===============================
function showPage(id, el) {
    const pages = document.querySelectorAll(".page");

    pages.forEach(p => p.classList.remove("active"));

    const target = document.getElementById(id);
    if (target) target.classList.add("active");

    document.querySelectorAll("nav a").forEach(a => a.classList.remove("active"));

    if (el) el.classList.add("active");
}


// ===============================
// LOGIN / REGISTER
// ===============================
function createAccount() {
    const username = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    if (!username || !password) {
        alert("Completează toate câmpurile");
        return;
    }

    let users = JSON.parse(localStorage.getItem("lnf_users")) || [];

    let user = users.find(u => u.username === username);

    // dacă există -> login
    if (user) {
        if (user.password !== password) {
            alert("Parolă greșită!");
            return;
        }

        user.online = true;
        user.lastSeen = Date.now();

        localStorage.setItem("lnf_users", JSON.stringify(users));
        localStorage.setItem("lnf_current_user", username);

        showApp();
        loadPanel();
        return;
    }

    // dacă nu există -> creare cont
    const newUser = {
        username,
        password,
        online: true,
        lastSeen: Date.now(),
        avatar: "https://i.imgur.com/zYxDCQT.png"
    };

    users.push(newUser);

    localStorage.setItem("lnf_users", JSON.stringify(users));
    localStorage.setItem("lnf_current_user", username);

    showApp();
    loadPanel();
}


// ===============================
// SHOW APP / AUTH SWITCH
// ===============================
function showApp() {
    const auth = document.getElementById("authScreen");
    const app = document.getElementById("app");

    const currentUser = localStorage.getItem("lnf_current_user");

    if (!currentUser) {
        if (auth) auth.style.display = "flex";
        if (app) app.style.display = "none";
        return;
    }

    let users = JSON.parse(localStorage.getItem("lnf_users")) || [];
    const exists = users.find(u => u.username === currentUser);

    if (!exists) {
        localStorage.removeItem("lnf_current_user");
        if (auth) auth.style.display = "flex";
        if (app) app.style.display = "none";
        return;
    }

    if (auth) auth.style.display = "none";
    if (app) app.style.display = "block";
}


// ===============================
// HEARTBEAT (user online)
// ===============================
function heartbeat() {
    const currentUser = localStorage.getItem("lnf_current_user");
    if (!currentUser) return;

    let users = JSON.parse(localStorage.getItem("lnf_users")) || [];

    users.forEach(u => {
        if (u.username === currentUser) {
            u.online = true;
            u.lastSeen = Date.now();
        }
    });

    localStorage.setItem("lnf_users", JSON.stringify(users));
}


// ===============================
// OFFLINE CLEANUP
// ===============================
function cleanupOfflineUsers() {
    let users = JSON.parse(localStorage.getItem("lnf_users")) || [];
    const now = Date.now();

    users.forEach(u => {
        if (u.lastSeen && now - u.lastSeen > 20000) {
            u.online = false;
        }
    });

    localStorage.setItem("lnf_users", JSON.stringify(users));
}


// ===============================
// DASHBOARD LOAD
// ===============================
function loadPanel() {
    const currentUser = localStorage.getItem("lnf_current_user");
    if (!currentUser) return;

    let users = JSON.parse(localStorage.getItem("lnf_users")) || [];

    const current = users.find(u => u.username === currentUser);
    if (!current) return;

    // username
    const nameEl = document.getElementById("accountName");
    if (nameEl) nameEl.innerText = current.username;

    // avatar
    const avatarEl = document.getElementById("profileAvatar");
    if (avatarEl) avatarEl.src = current.avatar;

    // members count
    const memberCount = document.getElementById("memberCount");
    if (memberCount) memberCount.innerText = `${users.length}/50`;

    // online users
    const now = Date.now();
    const onlineUsers = users.filter(u => u.online && now - u.lastSeen < 20000);

    const onlineCount = document.getElementById("onlineCount");
    if (onlineCount) onlineCount.innerText = onlineUsers.length;

    const list = document.getElementById("onlineMembers");
    if (list) {
        list.innerHTML = "";
        onlineUsers.forEach(u => {
            list.innerHTML += `<li>🟢 ${u.username}</li>`;
        });
    }

    // phone
    const phone = localStorage.getItem(`phone_${currentUser}`);
    const phoneEl = document.getElementById("displayPhone");
    if (phoneEl) phoneEl.textContent = phone || "Nesetat";

    // tasks
    const tasks = JSON.parse(localStorage.getItem("lnf_tasks")) || [];
    const userTasks = tasks.filter(t => t.user === currentUser).length;

    const taskEl = document.getElementById("displayTasks");
    if (taskEl) taskEl.textContent = userTasks;

    heartbeat();
}


// ===============================
// AVATAR CHANGE
// ===============================
function changeAvatar(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        const currentUser = localStorage.getItem("lnf_current_user");

        let users = JSON.parse(localStorage.getItem("lnf_users")) || [];

        const user = users.find(u => u.username === currentUser);
        if (!user) return;

        user.avatar = e.target.result;

        localStorage.setItem("lnf_users", JSON.stringify(users));

        const avatarEl = document.getElementById("profileAvatar");
        if (avatarEl) avatarEl.src = e.target.result;
    };

    reader.readAsDataURL(file);
}


// ===============================
// PHONE PAGE
// ===============================
function loadPhonePage() {
    const currentUser = localStorage.getItem("lnf_current_user");
    if (!currentUser) return;

    const savedPhone = localStorage.getItem(`phone_${currentUser}`);

    const form = document.getElementById("phoneFormBox");
    const info = document.getElementById("phoneInfo");

    if (savedPhone) {
        if (form) form.style.display = "none";
        if (info) info.style.display = "grid";
    }
}

function savePhone() {
    const currentUser = localStorage.getItem("lnf_current_user");

    const input = document.getElementById("phoneInput");
    if (!input) return;

    const phone = input.value.trim();

    if (!phone) {
        alert("Introdu un număr!");
        return;
    }

    localStorage.setItem(`phone_${currentUser}`, phone);
    loadPhonePage();
}


// ===============================
// LOGOUT SAFE (optional)
// ===============================
function logout() {
    const currentUser = localStorage.getItem("lnf_current_user");

    if (currentUser) {
        let users = JSON.parse(localStorage.getItem("lnf_users")) || [];

        users.forEach(u => {
            if (u.username === currentUser) {
                u.online = false;
            }
        });

        localStorage.setItem("lnf_users", JSON.stringify(users));
    }

    localStorage.removeItem("lnf_current_user");
    location.reload();
}


// ===============================
// AUTO UPDATE LOOP
// ===============================
setInterval(() => {
    heartbeat();
    cleanupOfflineUsers();
    loadPanel();
}, 3000);


// ===============================
// INIT
// ===============================
window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        showApp();
        loadPanel();
        loadPhonePage();
    }, 200);
});