// ===============================
// NAVIGATION
// ===============================

function showPage(id, el) {
    const pages = document.querySelectorAll(".page");

    pages.forEach(p =>
        p.classList.remove("active")
    );

    const target =
        document.getElementById(id);

    if (target)
        target.classList.add("active");

    document.querySelectorAll("nav a")
        .forEach(a =>
            a.classList.remove("active")
        );

    if (el)
        el.classList.add("active");
}

// ===============================
// USERS HELPERS (NEW)
// ===============================

function getUsers() {
    return JSON.parse(localStorage.getItem("lnf_users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("lnf_users", JSON.stringify(users));
}

// ===============================
// CREATE ACCOUNT
// ===============================

function createAccount() {

    const username =
        document.getElementById("username")
        ?.value.trim();

    const password =
        document.getElementById("password")
        ?.value.trim();

    if (!username || !password) {
        alert("Completează toate câmpurile");
        return;
    }

    let users = getUsers();

    let user = users.find(u => u.username === username);

    if (user) {
        user.online = true;
        user.lastSeen = Date.now();

        saveUsers(users);

        localStorage.setItem("lnf_current_user", username);

        heartbeat();
        showApp();
        loadPanel();
        return;
    }

    const newUser = {
        username,
        password,
        online: true,
        lastSeen: Date.now(),
        avatar: "https://i.imgur.com/zYxDCQT.png"
    };

    users.push(newUser);
    saveUsers(users);

    localStorage.setItem("lnf_current_user", username);

    heartbeat();
    showApp();
    loadPanel();
}

// ===============================
// SHOW APP / AUTH
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

    if (auth) auth.style.display = "none";
    if (app) app.style.display = "block";
}

// ===============================
// HEARTBEAT (ONLINE STATUS)
// ===============================

function heartbeat() {

    const currentUser =
        localStorage.getItem("lnf_current_user");

    if (!currentUser) return;

    let users = getUsers();

    users.forEach(u => {
        if (u.username === currentUser) {
            u.online = true;
            u.lastSeen = Date.now();
        }
    });

    saveUsers(users);
}

// ===============================
// CLEAN OFFLINE USERS
// ===============================

function cleanupOfflineUsers() {

    let users = getUsers();
    const now = Date.now();

    users.forEach(u => {
        if (u.lastSeen && now - u.lastSeen > 15000) {
            u.online = false;
        }
    });

    saveUsers(users);
}

// ===============================
// LOAD DASHBOARD
// ===============================

function loadPanel() {

    const currentUser =
        localStorage.getItem("lnf_current_user");

    if (!currentUser) return;

    let users = getUsers();

    const current =
        users.find(u => u.username === currentUser);

    if (!current) return;

    // username
    const accountName = document.getElementById("accountName");
    if (accountName) accountName.innerText = current.username;

    // avatar
    const avatar = document.getElementById("profileAvatar");
    if (avatar) avatar.src = current.avatar;

    // members count
    const memberCount = document.getElementById("memberCount");
    if (memberCount) memberCount.innerText = `${users.length}/50`;

    // online users
    const now = Date.now();

    const onlineUsers = users.filter(u =>
        u.online && u.lastSeen && now - u.lastSeen < 15000
    );

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
    const allTasks = JSON.parse(localStorage.getItem("lnf_tasks")) || [];
    const userTasks = allTasks.filter(t => t.user === currentUser).length;

    const taskEl = document.getElementById("displayTasks");
    if (taskEl) taskEl.textContent = userTasks;

    // NEW: all members list
    loadAllMembers();

    heartbeat();
}

// ===============================
// ALL MEMBERS (NEW FEATURE)
// ===============================

function loadAllMembers() {

    const users = getUsers();

    const list = document.getElementById("allMembers");
    if (!list) return;

    list.innerHTML = "";

    users.forEach(u => {
        const status = u.online ? "🟢" : "🔴";

        list.innerHTML += `
            <li style="padding:6px 0">
                ${status} ${u.username}
            </li>
        `;
    });
}

// ===============================
// AVATAR CHANGE
// ===============================

function changeAvatar(event) {

    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {

        const currentUser =
            localStorage.getItem("lnf_current_user");

        let users = getUsers();

        const user = users.find(u => u.username === currentUser);

        if (!user) return;

        user.avatar = e.target.result;

        saveUsers(users);

        const avatar = document.getElementById("profileAvatar");
        if (avatar) avatar.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

// ===============================
// PHONE PAGE
// ===============================

function loadPhonePage() {

    const currentUser =
        localStorage.getItem("lnf_current_user");

    if (!currentUser) return;

    const savedPhone =
        localStorage.getItem(`phone_${currentUser}`);

    const form = document.getElementById("phoneFormBox");
    const info = document.getElementById("phoneInfo");

    if (savedPhone) {
        if (form) form.style.display = "none";
        if (info) info.style.display = "grid";
    }
}

function savePhone() {

    const currentUser =
        localStorage.getItem("lnf_current_user");

    const phone =
        document.getElementById("phoneInput").value.trim();

    if (!phone) {
        alert("Introdu un număr!");
        return;
    }

    localStorage.setItem(`phone_${currentUser}`, phone);

    loadPhonePage();
}

// ===============================
// LOGOUT HANDLING
// ===============================

window.addEventListener("beforeunload", () => {

    const currentUser =
        localStorage.getItem("lnf_current_user");

    if (!currentUser) return;

    let users = getUsers();

    users.forEach(u => {
        if (u.username === currentUser) {
            u.online = false;
        }
    });

    saveUsers(users);
});

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
    }, 100);
});

// sync între taburi
window.addEventListener("storage", () => {
    loadPanel();
});
