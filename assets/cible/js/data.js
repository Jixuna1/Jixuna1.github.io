/* ============================================================
   data.js — Couche de données (simule la BDD MySQL via localStorage)
   Base de données : cible.sql
   ============================================================ */

// ── Régions françaises (depuis la table `regions` de cible.sql) ──
const REGIONS = [
    "Auvergne-Rhône-Alpes",
    "Bourgogne-Franche-Comté",
    "Bretagne",
    "Centre-Val de Loire",
    "Corse",
    "Grand Est",
    "Guadeloupe",
    "Guyane",
    "Hauts-de-France",
    "Île-de-France",
    "La Réunion",
    "Martinique",
    "Mayotte",
    "Normandie",
    "Nouvelle-Aquitaine",
    "Occitanie",
    "Pays de la Loire",
    "Provence-Alpes-Côte d'Azur"
];

// ── Clés localStorage ──
const STORAGE_KEYS = {
    users: "cible_users",
    scores: "cible_scores",
    session: "cible_session",
    nextUserId: "cible_next_user_id",
    nextScoreId: "cible_next_score_id"
};

// ── Hash simple pour mots de passe (simulation côté client) ──
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// ── Initialisation de la BDD (exécutée au premier chargement) ──
async function initDatabase() {
    // Vérifier si la BDD existe déjà
    if (localStorage.getItem(STORAGE_KEYS.users)) {
        return; // BDD déjà initialisée
    }

    // Hash des mots de passe par défaut
    const hashAntoine = await hashPassword("antoine123");
    const hashRosa = await hashPassword("rosa123");

    // Utilisateurs (depuis la table `users` de cible.sql)
    const users = [
        {
            id: 1,
            username: "Antoine",
            password: hashAntoine,
            email: "antoine@ecole.fr",
            birthdate: "2005-04-12",
            region: "Île-de-France",
            created_at: "2026-05-31T07:12:41"
        },
        {
            id: 2,
            username: "Rosa",
            password: hashRosa,
            email: "rosa@ecole.fr",
            birthdate: "2006-09-24",
            region: "Bretagne",
            created_at: "2026-05-31T07:12:41"
        }
    ];

    // Scores (depuis la table `scores` de cible.sql)
    // On ajoute un mode par défaut pour la rétrocompatibilité
    const scores = [
        {
            id: 1,
            user_id: 1,
            score: 38,
            mode: "casual",
            difficulty: "normal",
            played_at: "2026-05-31T07:12:41"
        },
        {
            id: 2,
            user_id: 2,
            score: 45,
            mode: "casual",
            difficulty: "normal",
            played_at: "2026-05-31T07:12:41"
        }
    ];

    // Sauvegarde dans localStorage
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.scores, JSON.stringify(scores));
    localStorage.setItem(STORAGE_KEYS.nextUserId, "3");
    localStorage.setItem(STORAGE_KEYS.nextScoreId, "3");
}

// ══════════════════════════════════════════════════════════════
//  CRUD — Utilisateurs
// ══════════════════════════════════════════════════════════════

function getUsers() {
    const data = localStorage.getItem(STORAGE_KEYS.users);
    return data ? JSON.parse(data) : [];
}

function getUserById(id) {
    return getUsers().find(u => u.id === id) || null;
}

function getUserByUsername(username) {
    return getUsers().find(
        u => u.username.toLowerCase() === username.toLowerCase()
    ) || null;
}

async function createUser(username, password, email, birthdate, region) {
    const users = getUsers();

    // Vérifier unicité du pseudo
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        return { success: false, message: "Ce pseudo est déjà utilisé." };
    }

    // Générer l'ID auto-incrémenté
    let nextId = parseInt(localStorage.getItem(STORAGE_KEYS.nextUserId) || "1");

    const newUser = {
        id: nextId,
        username: username,
        password: await hashPassword(password),
        email: email,
        birthdate: birthdate,
        region: region,
        created_at: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.nextUserId, String(nextId + 1));

    return { success: true, user: newUser };
}

// ══════════════════════════════════════════════════════════════
//  CRUD — Scores
// ══════════════════════════════════════════════════════════════

function getScores() {
    const data = localStorage.getItem(STORAGE_KEYS.scores);
    return data ? JSON.parse(data) : [];
}

function getScoresByUserId(userId) {
    return getScores().filter(s => s.user_id === userId);
}

function addScore(userId, score, mode = "casual", difficulty = "normal") {
    const scores = getScores();
    let nextId = parseInt(localStorage.getItem(STORAGE_KEYS.nextScoreId) || "1");

    const newScore = {
        id: nextId,
        user_id: userId,
        score: score,
        mode: mode,
        difficulty: difficulty,
        played_at: new Date().toISOString()
    };

    scores.push(newScore);
    localStorage.setItem(STORAGE_KEYS.scores, JSON.stringify(scores));
    localStorage.setItem(STORAGE_KEYS.nextScoreId, String(nextId + 1));

    return newScore;
}

// Récupérer les scores avec le nom d'utilisateur, triés par score décroissant (Pour le mode Casual)
function getScoresWithUsernames(modeFilter = "casual") {
    const scores = getScores().filter(s => (s.mode || "casual") === modeFilter);
    const users = getUsers();

    return scores.map(s => {
        const user = users.find(u => u.id === s.user_id);
        return {
            ...s,
            username: user ? user.username : "Inconnu"
        };
    }).sort((a, b) => b.score - a.score);
}

// ══════════════════════════════════════════════════════════════
//  Logique Ranked (Compétitif)
// ══════════════════════════════════════════════════════════════

const RANKS = [
    { name: "Diamant", min: 3000, color: "#00b4d8" },
    { name: "Or", min: 1500, color: "#ffd700" },
    { name: "Argent", min: 500, color: "#c0c0c0" },
    { name: "Bronze", min: 0, color: "#cd7f32" }
];

function getUserRankInfo(totalScore) {
    for (let rank of RANKS) {
        if (totalScore >= rank.min) {
            return rank;
        }
    }
    return RANKS[RANKS.length - 1]; // Bronze par défaut
}

// Agréger les scores ranked par utilisateur (un seul résultat par utilisateur)
function getRankedLeaderboard() {
    const scores = getScores().filter(s => s.mode === "ranked");
    const users = getUsers();
    
    // Regrouper par user_id et calculer la somme
    const userTotals = {};
    
    scores.forEach(s => {
        if (!userTotals[s.user_id]) {
            userTotals[s.user_id] = {
                user_id: s.user_id,
                total_score: 0,
                games_played: 0,
                last_played: s.played_at
            };
        }
        userTotals[s.user_id].total_score += s.score;
        userTotals[s.user_id].games_played += 1;
        
        // Garder la date la plus récente
        if (new Date(s.played_at) > new Date(userTotals[s.user_id].last_played)) {
            userTotals[s.user_id].last_played = s.played_at;
        }
    });
    
    // Transformer en tableau, lier au username et déterminer le rang
    const leaderboard = Object.values(userTotals).map(stat => {
        const user = users.find(u => u.id === stat.user_id);
        const rankInfo = getUserRankInfo(stat.total_score);
        
        return {
            ...stat,
            username: user ? user.username : "Inconnu",
            rankName: rankInfo.name,
            rankColor: rankInfo.color
        };
    });
    
    // Trier par score total décroissant
    return leaderboard.sort((a, b) => b.total_score - a.total_score);
}

// ══════════════════════════════════════════════════════════════
//  Session (simule $_SESSION PHP via sessionStorage)
// ══════════════════════════════════════════════════════════════

function setSession(user) {
    sessionStorage.setItem(STORAGE_KEYS.session, JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.email,
        region: user.region
    }));
}

function getSession() {
    const data = sessionStorage.getItem(STORAGE_KEYS.session);
    return data ? JSON.parse(data) : null;
}

function clearSession() {
    sessionStorage.removeItem(STORAGE_KEYS.session);
}

function isLoggedIn() {
    return getSession() !== null;
}
