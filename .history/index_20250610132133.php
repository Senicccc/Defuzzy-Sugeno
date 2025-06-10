<?php
session_start();
require_once 'php/db_connection.php'; 

$isLoggedIn = isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
$username = $isLoggedIn ? htmlspecialchars($_SESSION['username'], ENT_QUOTES, 'UTF-8') : '';
?>
<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fuzzy Sugeno - Home</title>
    <link rel="icon" href="img/favicon.png" type="image/png">
    <link rel="stylesheet" href="css/index.css">
</head>

<body>

    <?php 
    require_once 'php/header-index.php';
    ?>

    <section class="hero" style="background: url('img/menu-bg.jpg') center center/cover no-repeat;">
        <h1>Pengambilan Keputusan Jumlah Produksi Berdasarkan Logika Fuzzy Sugeno</h1>
        <a href="php/form.php" class="start-button">Mulai</a>
    </section>

</body>

</html>