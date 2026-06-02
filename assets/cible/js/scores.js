/* ============================================================
   scores.js — Logique de la page des scores (Ranked & Casual)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    const session = getSession();
    
    // --- Gestion des onglets ---
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            // Retirer active partout
            tabBtns.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));
            
            // Activer le bouton cliqué et sa cible
            btn.classList.add("active");
            const targetId = btn.getAttribute("data-target");
            document.getElementById(targetId).classList.add("active");
        });
    });

    // --- Rendu du classement Ranked ---
    const rankedBody = document.getElementById("ranked-body");
    if (rankedBody) {
        const rankedData = getRankedLeaderboard();
        
        if (rankedData.length === 0) {
            rankedBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Aucun score compétitif enregistré.</td></tr>`;
        } else {
            rankedData.forEach((stat, index) => {
                const tr = document.createElement("tr");
                if (session && session.id === stat.user_id) {
                    tr.classList.add("current-user-row");
                }

                // Icône de trophée pour le top 3
                let posDisplay = `#${index + 1}`;
                if (index === 0) posDisplay = "🥇 1er";
                else if (index === 1) posDisplay = "🥈 2ème";
                else if (index === 2) posDisplay = "🥉 3ème";

                tr.innerHTML = `
                    <td style="font-weight:bold;">${posDisplay}</td>
                    <td><strong>${stat.username}</strong></td>
                    <td><span class="rank-badge" style="background-color: ${stat.rankColor}">${stat.rankName}</span></td>
                    <td style="color: var(--primary-color); font-weight: bold;">${stat.total_score} pts</td>
                    <td style="font-size: 0.9em; color: #aaa;">${stat.games_played} partie(s)</td>
                `;
                rankedBody.appendChild(tr);
            });
        }
    }

    // --- Rendu du classement Casual ---
    const casualBody = document.getElementById("casual-body");
    if (casualBody) {
        const casualScores = getScoresWithUsernames("casual");
        
        if (casualScores.length === 0) {
            casualBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Aucune partie détente jouée.</td></tr>`;
        } else {
            casualScores.forEach((score, index) => {
                const tr = document.createElement("tr");
                if (session && session.id === score.user_id) {
                    tr.classList.add("current-user-row");
                }

                const diffLabels = {
                    "faible": "Vent faible",
                    "moyen": "Vent moyen",
                    "fort": "Vent fort",
                    "aleatoire": "Vent aléatoire",
                    "normal": "Normal (Ancien)"
                };
                const difficultyText = diffLabels[score.difficulty] || score.difficulty;

                tr.innerHTML = `
                    <td>#${index + 1}</td>
                    <td><strong>${score.username}</strong></td>
                    <td style="color: var(--accent-color); font-weight: bold;">${score.score} pts</td>
                    <td style="font-size: 0.85em;">${difficultyText}</td>
                    <td style="font-size: 0.85em;">${formatDateTime(score.played_at)}</td>
                `;
                casualBody.appendChild(tr);
            });
        }
    }
});
