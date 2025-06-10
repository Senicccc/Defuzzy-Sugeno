<?php
session_start();
$isLoggedIn = isset($_SESSION['user_id']); // atau sesuaikan dengan session login kamu
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
        <div style="margin-top:24px;">
            <?php if ($isLoggedIn): ?>
                <span style="color:#009900;font-weight:600;">Anda sudah login.</span>
            <?php else: ?>
                <span style="color:#b97b00;font-weight:600;">Anda belum login.</span>
            <?php endif; ?>
        </div>
    </section>

</body>

</html>