/* ============================================================
   app.js — Logique générale (navigation, authentification)
   ============================================================ */

// ── Initialiser la BDD au chargement ──
document.addEventListener("DOMContentLoaded", async () => {
    await initDatabase();
    updateNavigation();
});

// ── Mise à jour de la navigation selon l'état de connexion ──
function updateNavigation() {
    const session = getSession();
    const navUser = document.getElementById("nav-user");
    const navLogin = document.getElementById("nav-login");
    const navRegister = document.getElementById("nav-register");
    const navGame = document.getElementById("nav-game");
    const navScores = document.getElementById("nav-scores");
    const navLogout = document.getElementById("nav-logout");
    const navUsername = document.getElementById("nav-username");

    if (session) {
        // Utilisateur connecté
        if (navUser) navUser.style.display = "flex";
        if (navLogin) navLogin.style.display = "none";
        if (navRegister) navRegister.style.display = "none";
        if (navGame) navGame.style.display = "inline-block";
        if (navScores) navScores.style.display = "inline-block";
        if (navLogout) navLogout.style.display = "inline-block";
        if (navUsername) navUsername.textContent = session.username;
    } else {
        // Utilisateur non connecté
        if (navUser) navUser.style.display = "none";
        if (navLogin) navLogin.style.display = "inline-block";
        if (navRegister) navRegister.style.display = "inline-block";
        if (navGame) navGame.style.display = "none";
        if (navScores) navScores.style.display = "inline-block";
        if (navLogout) navLogout.style.display = "none";
    }
}

// ── Déconnexion ──
function logout() {
    clearSession();
    window.location.href = "index.html";
}

// ── Vérifier que l'utilisateur est connecté (pages protégées) ──
function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = "index.html";
        return false;
    }
    return true;
}

// ── Afficher un message de notification ──
function showNotification(message, type = "success") {
    // Supprimer les notifications existantes
    const existing = document.querySelector(".notification");
    if (existing) existing.remove();

    const notif = document.createElement("div");
    notif.className = `notification notification-${type}`;
    notif.innerHTML = `
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">✕</button>
    `;
    document.body.appendChild(notif);

    // Animation d'entrée
    requestAnimationFrame(() => {
        notif.classList.add("notification-show");
    });

    // Suppression automatique après 4 secondes
    setTimeout(() => {
        notif.classList.remove("notification-show");
        setTimeout(() => notif.remove(), 300);
    }, 4000);
}

// ── Formater une date ISO en format français ──
function formatDate(isoDate) {
    const date = new Date(isoDate);
    return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

function formatDateTime(isoDate) {
    const date = new Date(isoDate);
    return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}
