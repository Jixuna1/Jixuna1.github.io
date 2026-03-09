<?php
$dbh = new PDO ('mysql:host=localhost; dbname= supermarche', $user, $pass); 
//connexion
$sth= $dbh -> query('SELECT * FROM famille'); 

$rows = $stm->fetchAll(); 

foreach($rows as $row) {
    printf("$row[0] $row[1] $row[2] \n"); 
    printf("$row['id'] $row['name'] $row['population'] \n"); 
}
?>