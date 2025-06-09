<?php
require_once 'auth.php';
require_once 'db_connection.php';

// Pastikan user sudah login
redirectIfNotLoggedIn();

// Ambil data user
$pdo = getDBConnection();
$userStmt = $pdo->prepare("SELECT username, email, created_at FROM users WHERE id = ?");
$userStmt->execute([$_SESSION['user_id']]);
$user = $userStmt->fetch();

// Ambil riwayat perhitungan
$calcStmt = $pdo->prepare("
    SELECT id, name, nilai_sugeno, created_at 
    FROM calculations 
    WHERE user_id = ? 
    ORDER BY created_at DESC
");
$calcStmt->execute([$_SESSION['user_id']]);
$calculations = $calcStmt->fetchAll();

// Tangani request detail perhitungan
if (isset($_GET['detail_id'])) {
    $detailStmt = $pdo->prepare("
        SELECT * FROM calculations 
        WHERE id = ? AND user_id = ?
    ");
    $detailStmt->execute([$_GET['detail_id'], $_SESSION['user_id']]);
    $calculationDetail = $detailStmt->fetch();
    
    if ($calculationDetail) {
        // Tampilkan modal dengan detail perhitungan
        header('Content-Type: application/json');
        echo json_encode($calculationDetail);
        exit;
    }
}
?>

<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Akun Saya - Sistem Fuzzy Sugeno</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="../css/account.css">
</head>

<body>
    <?php 
    require_once 'header.php';
    ?>
    <div class="container">
        <div class="profile-card">
            <h2><i class="fas fa-user-circle"></i> Profil Saya</h2>
            <div class="profile-info">
                <div class="info-item">
                    <span class="label">Username:</span>
                    <span class="value"><?php echo htmlspecialchars($user['username']); ?></span>
                </div>
                <div class="info-item">
                    <span class="label">Email:</span>
                    <span class="value"><?php echo htmlspecialchars($user['email']); ?></span>
                </div>
                <div class="info-item">
                    <span class="label">Bergabung sejak:</span>
                    <span class="value"><?php echo date('d F Y', strtotime($user['created_at'])); ?></span>
                </div>
            </div>
        </div>

        <div class="history-card">
            <h2><i class="fas fa-history"></i> Riwayat Perhitungan</h2>

            <?php if (empty($calculations)): ?>
            <p class="no-data">Belum ada riwayat perhitungan.</p>
            <?php else: ?>
            <div class="table-responsive">
                <table class="history-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Perhitungan</th>
                            <th>Hasil Produksi</th>
                            <th>Tanggal</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($calculations as $index => $calc): ?>
                        <tr>
                            <td><?php echo $index + 1; ?></td>
                            <td><?php echo htmlspecialchars($calc['name']); ?></td>
                            <td><?php echo number_format($calc['nilai_sugeno'], 2); ?></td>
                            <td><?php echo date('d/m/Y H:i', strtotime($calc['created_at'])); ?></td>
                            <td>
                                <a href="calculation_detail.php?id=<?php echo $calc['id']; ?>" class="detail-btn">
                                    <i class="fas fa-eye"></i> Detail
                                </a>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
            <?php endif; ?>
        </div>
    </div>

</body>

</html>