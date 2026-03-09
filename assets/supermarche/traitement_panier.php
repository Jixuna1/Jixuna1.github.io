<?php
// Fichier: traitement_produits.php
session_start();

// Assurez-vous que le panier est initialisé
if (!isset($_SESSION['panier'])) {
    $_SESSION['panier'] = [];
}

$famille_id_retour = isset($_POST['famille_id_actuelle']) ? intval($_POST['famille_id_actuelle']) : 0;
$action = isset($_POST['action']) ? $_POST['action'] : '';

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['quantite'])) {
    
    $quantites_demandees = array_filter($_POST['quantite'], function($qte) {
        return intval($qte) > 0;
    });

    if (!empty($quantites_demandees)) {
        
        // --- Logique d'ajout des produits à la session ---
        foreach ($quantites_demandees as $id_produit => $quantite) {
            $quantite = intval($quantite); 

            if ($quantite > 0) {
                 // Si le produit existe, on ADDITIONNE la nouvelle quantité (logique "ajouter")
                if (isset($_SESSION['panier'][$id_produit])) {
                    $_SESSION['panier'][$id_produit] += $quantite;
                } else {
                    // Sinon, on l'ajoute
                    $_SESSION['panier'][$id_produit] = $quantite;
                }
            }
        }
        // --- Fin Logique d'ajout ---
    }
}

// --- Logique de Redirection ---

if ($action === 'valider') {
    // Si l'utilisateur a cliqué sur "Valider la commande" (bouton vert)
    header("Location: panier.php"); // <<< COMMANDE 4 : Redirige vers le panier
    exit;

} elseif ($action === 'ajouter') {
    // Si l'utilisateur a cliqué sur "Ajouter au panier" (bouton bleu)
    
    // On redirige vers la page des familles pour choisir une nouvelle catégorie (Étape 1)
    // OU, si l'on veut rester sur l'étape 2, on pourrait rediriger vers :
    // header("Location: produits.php?famille_id=" . $famille_id_retour);
    // Mais pour permettre le choix d'une autre famille, on revient à l'étape 1 (commandes.php).
    
    header("Location: commandes.php"); 
    exit;
} else {
    // Action non reconnue ou soumission sans bouton (redirection par défaut)
    header("Location: commandes.php");
    exit;
}
?>