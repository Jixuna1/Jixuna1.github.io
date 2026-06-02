/* ============================================================
   connexion.js — Logique de la page de connexion
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    // Si déjà connecté, rediriger vers le jeu
    if (isLoggedIn()) {
        window.location.href = "jeu.html";
        return;
    }

    const loginForm = document.getElementById("login-form");
    if (!loginForm) return;

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const usernameInput = document.getElementById("username");
        const passwordInput = document.getElementById("password");
        const formError = document.getElementById("form-error");
        
        // Reset erreurs
        formError.textContent = "";
        formError.classList.remove("visible");
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        if (!username || !password) {
            showError("Veuillez remplir tous les champs.");
            return;
        }

        // Vérifier l'utilisateur
        const user = getUserByUsername(username);
        
        if (!user) {
            showError("Nom d'utilisateur ou mot de passe incorrect.");
            return;
        }
        
        // Vérifier le mot de passe (hash simulation)
        const hashedAttempt = await hashPassword(password);
        
        if (user.password !== hashedAttempt) {
            showError("Nom d'utilisateur ou mot de passe incorrect.");
            return;
        }
        
        // Connexion réussie
        setSession(user);
        
        // Redirection
        window.location.href = "jeu.html";
    });

    function showError(message) {
        const formError = document.getElementById("form-error");
        formError.textContent = message;
        formError.classList.add("visible");
    }
});
