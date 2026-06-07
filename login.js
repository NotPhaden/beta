import {
  db,
  doc,
  setDoc,
  getDoc
} from "./firebase.js";

async function createAccount() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Completează toate câmpurile");
        return;
    }

    const userRef = doc(db, "users", username);
    const userSnap = await getDoc(userRef);

    // dacă există -> login
    if (userSnap.exists()) {
        const data = userSnap.data();

        if (data.password !== password) {
            alert("Parolă greșită");
            return;
        }

        await setDoc(userRef, {
            ...data,
            online: true,
            lastSeen: Date.now()
        });

        localStorage.setItem("lnf_current_user", username);

        window.location.href = "index.html";
        return;
    }

    // creare cont nou
    await setDoc(userRef, {
        username,
        password,
        avatar: "https://i.imgur.com/zYxDCQT.png",
        online: true,
        lastSeen: Date.now()
    });

    localStorage.setItem("lnf_current_user", username);

    window.location.href = "index.html";
}