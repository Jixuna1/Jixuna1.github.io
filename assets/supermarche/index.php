<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accueil - Tableau de Bord</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="CSS/style.css">
</head>
<body>

    <header class="header">
        <div class="logo">
            <img src="images/supermarche.svg" alt="Supermarché TR Logo" class="logo-img">
        </div>

        <div class="user-profile">
            <span>Gérant</span>
            <div class="avatar-circle">👤</div>
        </div>
    </header>

    <main class="main-container">
        
        <section class="welcome-section">
            <h1>Bonjour et bienvenue</h1>
            <p>Que souhaitez-vous faire aujourd'hui ?</p>
        </section>

        <div class="button-grid">
            
            <a href="commandes.php" class="action-card">
                <div class="card-icon">🛒</div>
                <h2 class="card-title">Passer une commande</h2>
                <p class="card-desc">Nouvelle vente ou devis</p>
            </a>

            <a href="#" class="action-card">
                <div class="card-icon">👤</div>
                <h2 class="card-title">Accéder au compte</h2>
                <p class="card-desc">Profil et paramètres</p>
            </a>

            <a href="#" class="action-card">
                <div class="card-icon">🎁</div>
                <h2 class="card-title">Carte fidélité</h2>
                <p class="card-desc">Gestion des points clients</p>
            </a>

            <a href="#" class="action-card admin-card">
                <div class="card-icon">🛠️</div>
                <h2 class="card-title">Gestion BDD</h2>
                <p class="card-desc">Administration système</p>
            </a>

        </div>
    </main>

    <footer class="footer">
        © 2023 Mon Entreprise - Version 1.0.2
    </footer>

</body>
</html>