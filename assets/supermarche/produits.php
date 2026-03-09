<?php
// Fichier: produits.php
session_start(); // <<< COMMANDE 1 : Démarrage de la session PHP

// Inclure la connexion à la base de données
require 'supermarche.php';

// 1. Récupération de l'ID de la famille depuis l'URL (méthode GET utilisée par le formulaire précédent)
$famille_id = isset($_GET['famille_id']) ? intval($_GET['famille_id']) : 0;
$nom_famille = "Produits"; // Valeur par défaut

$produits = [];

if ($famille_id > 0) {
    try {
        // Récupérer le nom de la famille pour l'affichage (Nom des tables mis à jour)
        $stmt_famille = $pdo->prepare("SELECT NomFamille FROM famille WHERE IdFamille = :id");
        $stmt_famille->execute([':id' => $famille_id]);
        $famille_info = $stmt_famille->fetch(PDO::FETCH_ASSOC);
        if ($famille_info) {
            $nom_famille = htmlspecialchars($famille_info['NomFamille']);
        }

        // Récupérer la liste des produits pour cette famille (Nom des tables mis à jour)
        $stmt_produits = $pdo->prepare("SELECT IdProduit, NomProd, Prix FROM produit WHERE IdFamille = :famille_id ORDER BY NomProd");
        $stmt_produits->execute([':famille_id' => $famille_id]);
        $produits = $stmt_produits->fetchAll(PDO::FETCH_ASSOC);

    } catch (PDOException $e) {
        die("Erreur lors de la récupération des produits : " . $e->getMessage());
    }
} else {
    // Si l'ID n'est pas fourni, renvoyer l'utilisateur à l'étape 1
    header("Location: commandes.php");
    exit;
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Etape 2: Choix des Produits</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="CSS/style.css">
</head>
<body>

<body>
        <section class="welcome-section">
            <h1>Étape 2 : Choix des produits (<?php echo $nom_famille; ?>)</h1>
            <p>Sélectionnez la quantité désirée pour chaque produit.</p>
        </section>

        <div class="form-container">
            <form action="traitement_panier.php" method="POST"> 
                
                <input type="hidden" name="famille_id_actuelle" value="<?php echo $famille_id; ?>">

                <?php if (!empty($produits)): ?>
                    <table class="product-list">
                        <thead>
                            </thead>
                        <tbody>
                            <?php foreach ($produits as $produit): ?>
                                <tr>
                                    <td><?php echo htmlspecialchars($produit['NomProd']); ?></td>
                                    <td><?php echo number_format($produit['Prix'], 2) . ' €'; ?></td>
                                    <td>
                                        <input type="number" 
                                               name="quantite[<?php echo $produit['IdProduit']; ?>]" 
                                               value="0" 
                                               min="0" 
                                               class="product-select" 
                                               style="width: 100%;">
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php else: ?>
                    <p>Aucun produit trouvé dans cette famille.</p>
                <?php endif; ?>
                
                <div class="button-group">
                    
                    <a href="commandes.php" class="btn-navigation btn-retour">Retour</a>
                    
                    <a href="index.php" class="btn-navigation btn-annuler">Annuler</a>
                    
                    <button type="submit" name="action" value="ajouter" class="btn-submit-action btn-ajouter">Ajouter au panier</button>
                    
                    <button type="submit" name="action" value="valider" class="btn-submit-action btn-valider">Valider la commande</button>
                </div>
            </form>
        </div>
    </main>

    <footer class="footer">© 2023 Mon Entreprise</footer>
</html>