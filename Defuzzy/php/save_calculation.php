<?php
session_start();
require_once 'db_connection.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Anda harus login']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

try {
    $pdo = getDBConnection();

    // Simpan data
    $stmt = $pdo->prepare("
        INSERT INTO calculations (
            user_id, name, var_perm_min, var_perm_max, 
            var_pers_min, var_pers_max, var_prod_min, 
            var_prod_max, permintaan_x, persediaan_x, nilai_sugeno
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $_SESSION['user_id'],
        $data['name'],
        $data['varPermMin'],
        $data['varPermMax'],
        $data['varPersMin'],
        $data['varPersMax'],
        $data['varProdMin'],
        $data['varProdMax'],
        $data['permintaanX'],
        $data['persediaanX'],
        $data['nilaiSugeno']
    ]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>