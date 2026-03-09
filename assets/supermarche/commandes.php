<?php
// Inclure la connexion à la base de données
require 'supermarche.php';

// 1. Logique de récupération des familles
$familles = [];
try {
    $stmt = $pdo->query("SELECT IdFamille, NomFamille FROM famille ORDER BY NomFamille");
    $familles = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Erreur lors de la récupération des familles : " . $e->getMessage());
}

// 2. Traitement du formulaire pour passer à l'étape suivante
// NOTE: On utilise un formulaire POST pour envoyer la famille_id à la prochaine page
// Le bouton Valider soumettra ce formulaire, le bouton Suivant n'est plus nécessaire.
$action_url = "produits.php"; // Destination du formulaire

?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Etape 1: Choix de la Famille</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="CSS/style.css">
</head>
<body>

    <header class="header">
        <div class="logo">
            <img src="images/supermarche.svg" alt="Supermarché TR Logo" class="logo-img">
        </div>
        <div class="user-profile"><span>Gérant</span><div class="avatar-circle">👤</div></div>
    </header>

    <main class="main-container">
        <section class="welcome-section">
            <h1>Étape 1 : Choix de la Famille de Produits</h1>
            <p>Veuillez sélectionner la catégorie d'articles que vous souhaitez commander.</p>
        </section>

        <div class="form-container">
            <form action="<?php echo $action_url; ?>" method="GET">
                
                <div class="form-group">
                    <label for="famille_id">Sélectionnez une famille :</label>
                    <select id="famille_id" name="famille_id" required>
                        <option value="" disabled selected>-- Choisissez une famille --</option>
                        <?php foreach ($familles as $famille): ?>
                            <option value="<?php echo htmlspecialchars($famille['IdFamille']); ?>">
                                <?php echo htmlspecialchars($famille['NomFamille']); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div class="button-group">
                    <a href="index.php" class="btn-retour">Retour</a>
                    
                    <button type="submit" class="btn-valider">Valider</button>
                </div>
            </form>
        </div>
    </main>

    <footer class="footer">© 2023 Mon Entreprise</footer>
</body>
</html>