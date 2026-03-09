<?php
// Fichier: panier.php
session_start(); // Essentiel pour lire $_SESSION['panier'] !

// 1. Inclure la connexion à la base de données
require 'supermarche.php';

// 2. Définition du taux de TVA (exemple à 20%)
const TAUX_TVA = 0.20; // 20%

// Initialisation des variables
$produits_selectionnes = [];
$total_ht = 0;
$total_tva = 0;
$total_ttc = 0;

// ==========================================================
// MODIFICATION CLÉ : Lire la session au lieu de $_POST
// ==========================================================
$panier_session = isset($_SESSION['panier']) ? $_SESSION['panier'] : [];

// Récupérer uniquement les ID de produits pour lesquels la quantité est > 0
$quantites_demandees = array_filter($panier_session, function($qte) {
    return intval($qte) > 0;
});

if (!empty($quantites_demandees)) {
    
    $ids_produits = array_keys($quantites_demandees);
    $placeholders = str_repeat('?,', count($ids_produits) - 1) . '?';

    try {
        // Requête sécurisée pour récupérer les informations des produits sélectionnés
        $sql = "SELECT IdProduit, NomProd, Prix FROM produit WHERE IdProduit IN ($placeholders)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($ids_produits);
        $resultats_bdd = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 3. Traitement et calcul des totaux
        foreach ($resultats_bdd as $produit) {
            $id = $produit['IdProduit'];
            
            // UTILISATION DE LA QUANTITÉ DE LA SESSION
            $quantite = $quantites_demandees[$id]; 
            
            $prix_unitaire = $produit['Prix'];
            $prix_ligne_ht = $quantite * $prix_unitaire;
            
            // Ajouter le produit au récapitulatif
            $produits_selectionnes[] = [
                'nom' => htmlspecialchars($produit['NomProd']),
                'quantite' => $quantite,
                'prix_unitaire' => $prix_unitaire,
                'prix_ligne_ht' => $prix_ligne_ht
            ];

            // Mise à jour du Total Hors Taxe
            $total_ht += $prix_ligne_ht;
        }

        // Calcul de la TVA et du Total TTC
        $total_tva = $total_ht * TAUX_TVA;
        $total_ttc = $total_ht + $total_tva;

    } catch (PDOException $e) {
        // Affiche une erreur de base de données si la requête échoue
        die("Erreur de base de données : " . $e->getMessage());
    }
}
// Le reste du code HTML ci-dessous est conservé.
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Panier de Commande</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="CSS/style.css">
    <style>
        .cart-container {
            width: 100%;
            max-width: 800px;
            background: white;
            padding: 2rem;
            border-radius: 16px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .cart-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 2rem;
        }
        .cart-table th, .cart-table td {
            text-align: left;
            padding: 1rem;
            border-bottom: 1px solid #E2E8F0;
        }
        .cart-table th { background-color: #EDF2F7; }
        .cart-summary {
            float: right;
            width: 100%;
            max-width: 300px;
        }
        .cart-summary div {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
        }
        .cart-summary .total-row {
            font-weight: bold;
            font-size: 1.2rem;
            border-top: 2px solid #0056B3;
            margin-top: 0.5rem;
            padding-top: 1rem !important;
        }
        .button-group {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 5rem;
            clear: both;
        }
        .btn-retour, .btn-finaliser {
            padding: 1rem 2rem;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            text-decoration: none;
            text-align: center;
        }
        .btn-retour { background-color: #A0AEC0; color: white; }
        .btn-finaliser { background-color: #38A169; color: white; }
    </style>
</head>
<body>

    <header class="header">
        <div class="logo">MON ENTREPRISE</div>
        <div class="user-profile"><span>Gérant</span><div class="avatar-circle">👤</div></div>
    </header>

    <main class="main-container">
        <section class="welcome-section">
            <h1>Récapitulatif de la commande</h1>
            <p>Vérifiez les articles et finalisez la commande.</p>
        </section>

        <div class="cart-container">
            <?php if (empty($produits_selectionnes)): ?>
                <p>Votre panier est vide. Veuillez <a href="commandes.php">retourner au choix des familles</a>.</p>
            <?php else: ?>

                <table class="cart-table">
                    <thead>
                        <tr>
                            <th>Produit</th>
                            <th>Quantité</th>
                            <th>Prix Unitaire HT</th>
                            <th>Total Ligne HT</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($produits_selectionnes as $item): ?>
                            <tr>
                                <td><?php echo $item['nom']; ?></td>
                                <td><?php echo $item['quantite']; ?></td>
                                <td><?php echo number_format($item['prix_unitaire'], 2) . ' €'; ?></td>
                                <td><?php echo number_format($item['prix_ligne_ht'], 2) . ' €'; ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>

                <div class="cart-summary">
                    <div>
                        <span>Sous-total HT :</span>
                        <span><?php echo number_format($total_ht, 2) . ' €'; ?></span>
                    </div>
                    <div>
                        <span>Taux TVA (<?php echo (TAUX_TVA * 100); ?>%) :</span>
                        <span><?php echo number_format($total_tva, 2) . ' €'; ?></span>
                    </div>
                    <div class="total-row">
                        <span>Total TTC :</span>
                        <span><?php echo number_format($total_ttc, 2) . ' €'; ?></span>
                    </div>
                </div>

                <div class="button-group">
                    <a href="commandes.php" class="btn-retour">Modifier la sélection</a>
                    
                    <a href="finaliser_commande.php" class="btn-finaliser">Finaliser la commande</a>
                </div>

            <?php endif; ?>
        </div>
    </main>

    <footer class="footer">© 2023 Mon Entreprise</footer>
</body>
</html>