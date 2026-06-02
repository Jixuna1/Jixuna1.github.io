/* ============================================================
   inscription.js — Logique de la page d'inscription
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    // Si déjà connecté, rediriger
    if (isLoggedIn()) {
        window.location.href = "jeu.html";
        return;
    }

    // Charger les régions dans le select
    const regionSelect = document.getElementById("region");
    if (regionSelect) {
        REGIONS.forEach(region => {
            const option = document.createElement("option");
            option.value = region;
            option.textContent = region;
            regionSelect.appendChild(option);
        });
    }

    const registerForm = document.getElementById("register-form");
    if (!registerForm) return;

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // Reset erreurs
        document.querySelectorAll(".error-msg").forEach(el => {
            el.textContent = "";
            el.classList.remove("visible");
        });
        
        // Récupérer les valeurs
        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm_password").value;
        const birthdate = document.getElementById("birthdate").value;
        const region = document.getElementById("region").value;
        
        let hasErrors = false;

        // Validations
        if (password !== confirmPassword) {
            showError("confirm_password-error", "Les mots de passe ne correspondent pas.");
            hasErrors = true;
        }

        if (password.length < 6) {
            showError("password-error", "Le mot de passe doit contenir au moins 6 caractères.");
            hasErrors = true;
        }

        if (hasErrors) return;

        // Création de l'utilisateur
        const result = await createUser(username, password, email, birthdate, region);
        
        if (!result.success) {
            showError("form-error", result.message);
            return;
        }

        // Connexion automatique après inscription
        setSession(result.user);
        window.location.href = "jeu.html";
    });

    function showError(id, message) {
        const errorEl = document.getElementById(id);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add("visible");
        }
    }
});
