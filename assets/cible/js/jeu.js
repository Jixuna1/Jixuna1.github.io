/* ============================================================
   jeu.js — Logique du jeu de la cible (Canvas HTML5)
   Avec système de visée, vent et modes de jeu
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    // Vérifier l'authentification
    if (!requireAuth()) return;

    // --- Éléments UI du setup ---
    const setupArea = document.getElementById("game-setup");
    const gameArea = document.getElementById("game-area");
    
    // Nouveaux éléments
    const cards = document.querySelectorAll('.mode-card');
    const difficultyGroup = document.getElementById("difficulty-group");
    const diffBtns = document.querySelectorAll('.diff-btn');
    
    const btnStartGame = document.getElementById("btn-start-game");
    const displayMode = document.getElementById("display-mode");

    // --- Éléments UI du jeu ---
    const canvas = document.getElementById("dartboard");
    const ctx = canvas.getContext("2d");
    const scoreDisplay = document.getElementById("current-score");
    const dartsLeftDisplay = document.getElementById("darts-left");
    const historyList = document.getElementById("history-list");
    const btnRestart = document.getElementById("btn-restart");
    const btnShoot = document.getElementById("btn-shoot");
    const btnMenu = document.getElementById("btn-menu");
    
    // --- Éléments de la météo ---
    const compassArrow = document.getElementById("compass-arrow");
    const windDirText = document.getElementById("wind-dir");
    const windPowerText = document.getElementById("wind-power");

    // --- Variables d'état du jeu ---
    const MAX_DARTS = 5;
    let currentDarts = MAX_DARTS;
    let totalScore = 0;
    let impacts = [];
    let currentAim = null;
    let currentWind = { angle: 0, force: 0, forceLabel: "Nul" };
    
    // Configuration choisie par défaut
    let currentMode = "casual";
    let currentDifficulty = "faible";

    const CENTER_X = canvas.width / 2;
    const CENTER_Y = canvas.height / 2;

    const zones = [
        { radius: 180, color: "#0a1128", score: 10 },
        { radius: 140, color: "#1c2541", score: 20 },
        { radius: 100, color: "#3a506b", score: 30 },
        { radius: 60, color: "#60a5fa", score: 40 },
        { radius: 20, color: "#ffd700", score: 50 }
    ];

    const windDirections = [
        { label: "Nord", angle: -90 }, { label: "Nord-Est", angle: -45 },
        { label: "Est", angle: 0 }, { label: "Sud-Est", angle: 45 },
        { label: "Sud", angle: 90 }, { label: "Sud-Ouest", angle: 135 },
        { label: "Ouest", angle: 180 }, { label: "Nord-Ouest", angle: -135 }
    ];

    const windStrengths = {
        "faible": { label: "Faible", multiplier: 15 },
        "moyen": { label: "Moyen", multiplier: 30 },
        "fort": { label: "Fort", multiplier: 55 }
    };

    // ── GESTION DU MENU DE SETUP (NOUVEAU DESIGN) ──
    
    // Choix du mode
    cards.forEach(card => {
        card.addEventListener('click', () => {
            cards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            currentMode = card.getAttribute('data-mode');
            
            if (currentMode === "ranked") {
                difficultyGroup.style.opacity = "0";
                setTimeout(() => difficultyGroup.style.display = "none", 300);
            } else {
                difficultyGroup.style.display = "block";
                setTimeout(() => difficultyGroup.style.opacity = "1", 10);
            }
        });
    });

    // Choix de la difficulté (seulement si mode casual)
    diffBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            diffBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDifficulty = btn.getAttribute('data-diff');
        });
    });

    btnStartGame.addEventListener("click", () => {
        if (currentMode === "ranked") {
            currentDifficulty = "aleatoire"; // Forcé en ranked
            displayMode.textContent = "Ranked";
            displayMode.style.color = "#ffd700";
        } else {
            displayMode.textContent = "Casual";
            displayMode.style.color = "var(--light-color)";
        }

        setupArea.style.display = "none";
        gameArea.style.display = "grid";
        
        // Démarrer la partie
        resetGameState();
    });

    btnMenu.addEventListener("click", () => {
        gameArea.style.display = "none";
        setupArea.style.display = "block";
    });

    // ── GESTION DU CANVAS (VISÉE) ──
    canvas.addEventListener("click", (e) => {
        if (currentDarts <= 0) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        currentAim = {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };

        btnShoot.disabled = false;
        btnShoot.textContent = "TIRER !";
        drawBoard();
    });

    // ── BOUTON TIRER ──
    btnShoot.addEventListener("click", () => {
        if (!currentAim || currentDarts <= 0) return;

        const angleRad = currentWind.angle * (Math.PI / 180);
        const offsetX = Math.cos(angleRad) * currentWind.force;
        const offsetY = Math.sin(angleRad) * currentWind.force;

        const finalX = currentAim.x + offsetX;
        const finalY = currentAim.y + offsetY;

        const distance = Math.sqrt(Math.pow(finalX - CENTER_X, 2) + Math.pow(finalY - CENTER_Y, 2));

        let shotScore = 0;
        for (let i = zones.length - 1; i >= 0; i--) {
            if (distance <= zones[i].radius) {
                shotScore = zones[i].score;
                break;
            }
        }

        impacts.push({ aimX: currentAim.x, aimY: currentAim.y, x: finalX, y: finalY, score: shotScore });
        totalScore += shotScore;
        currentDarts--;

        currentAim = null;
        btnShoot.disabled = true;
        btnShoot.textContent = "Viser d'abord !";

        scoreDisplay.textContent = totalScore;
        dartsLeftDisplay.textContent = currentDarts;

        const li = document.createElement("li");
        li.innerHTML = `<span>Lancer ${MAX_DARTS - currentDarts}</span> <span style="color:var(--primary-color)"><b>${shotScore}</b> pts</span>`;
        historyList.prepend(li);

        if (currentDarts > 0) {
            generateWind();
        } else {
            endGame();
        }

        drawBoard();
    });

    // ── BOUTON REJOUER ──
    btnRestart.addEventListener("click", resetGameState);

    // ── FONCTIONS COMMUNES ──
    function resetGameState() {
        currentDarts = MAX_DARTS;
        totalScore = 0;
        impacts = [];
        currentAim = null;
        
        scoreDisplay.textContent = "0";
        dartsLeftDisplay.textContent = currentDarts;
        historyList.innerHTML = "";
        btnRestart.style.display = "none";
        btnMenu.style.display = "none";
        btnShoot.style.display = "block";
        btnShoot.disabled = true;
        
        generateWind();
        drawBoard();
    }

    function generateWind() {
        const randomDir = windDirections[Math.floor(Math.random() * windDirections.length)];
        
        let strengthObj;
        if (currentDifficulty === "aleatoire") {
            const keys = Object.keys(windStrengths);
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            strengthObj = windStrengths[randomKey];
        } else {
            strengthObj = windStrengths[currentDifficulty];
        }

        currentWind = {
            direction: randomDir.label,
            angle: randomDir.angle,
            force: strengthObj.multiplier,
            forceLabel: strengthObj.label
        };

        windDirText.textContent = currentWind.direction;
        windPowerText.textContent = currentWind.forceLabel;
        compassArrow.style.transform = `rotate(${currentWind.angle + 90}deg)`;
    }

    function drawBoard() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        zones.forEach(zone => {
            ctx.beginPath();
            ctx.arc(CENTER_X, CENTER_Y, zone.radius, 0, Math.PI * 2);
            ctx.fillStyle = zone.color;
            ctx.fill();
            
            // Subtle starlight border for each zone ring
            ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        ctx.beginPath();
        ctx.moveTo(CENTER_X, 20);
        ctx.lineTo(CENTER_X, canvas.height - 20);
        ctx.moveTo(20, CENTER_Y);
        ctx.lineTo(canvas.width - 20, CENTER_Y);
        ctx.strokeStyle = "rgba(125, 211, 252, 0.25)";
        ctx.lineWidth = 1;
        ctx.stroke();

        if (currentAim) {
            // 1. Trace une bordure sombre épaisse pour assurer le contraste sur les zones claires (cyan/jaune)
            ctx.strokeStyle = "#040814";
            ctx.lineWidth = 4;
            
            ctx.beginPath();
            ctx.arc(currentAim.x, currentAim.y, 10, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(currentAim.x - 15, currentAim.y);
            ctx.lineTo(currentAim.x + 15, currentAim.y);
            ctx.moveTo(currentAim.x, currentAim.y - 15);
            ctx.lineTo(currentAim.x, currentAim.y + 15);
            ctx.stroke();

            // 2. Trace le cœur orange-rouge fluo de la croix par-dessus
            ctx.strokeStyle = "#ff4500";
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.arc(currentAim.x, currentAim.y, 10, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(currentAim.x - 15, currentAim.y);
            ctx.lineTo(currentAim.x + 15, currentAim.y);
            ctx.moveTo(currentAim.x, currentAim.y - 15);
            ctx.lineTo(currentAim.x, currentAim.y + 15);
            ctx.stroke();
        }

        impacts.forEach(impact => {
            ctx.beginPath();
            ctx.moveTo(impact.aimX, impact.aimY);
            ctx.lineTo(impact.x, impact.y);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
            ctx.setLineDash([2, 2]);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.beginPath();
            ctx.arc(impact.x, impact.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = "#ffd700";
            ctx.fill();
            ctx.strokeStyle = "#040814";
            ctx.lineWidth = 1;
            ctx.stroke();
            
            ctx.fillStyle = "#ffd700";
            ctx.font = "bold 12px 'Outfit', Arial";
            ctx.fillText(impact.score, impact.x + 8, impact.y - 8);
        });
    }

    function endGame() {
        const user = getSession();
        // Sauvegarder avec le mode et la difficulté
        addScore(user.id, totalScore, currentMode, currentDifficulty);
        
        const modeText = currentMode === "ranked" ? " (Points Ranked accumulés !)" : "";
        showNotification(`Partie terminée ! Score final : ${totalScore} pts${modeText}`);
        
        btnShoot.style.display = "none";
        btnRestart.style.display = "block";
        btnMenu.style.display = "block";
    }
});
