<?php
require_once 'auth.php';
require_once 'db_connection.php';

redirectIfNotLoggedIn();

if (!isset($_GET['id'])) {
    header('Location: account.php');
    exit;
}

$calculationId = $_GET['id'];

$pdo = getDBConnection();
$stmt = $pdo->prepare("SELECT * FROM calculations WHERE id = ? AND user_id = ?");
$stmt->execute([$calculationId, $_SESSION['user_id']]);
$calculation = $stmt->fetch();

if (!$calculation) {
    header('Location: account.php');
    exit;
}
?>

<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detail Perhitungan - Sistem Fuzzy Sugeno</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="stylesheet" href="../css/calculation_detail.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <style>
    .surface-plot-container {
        width: 100%;
        height: 500px;
        border: 1px solid #ddd;
        margin-top: 10px;
    }
    </style>
</head>

<body>
    <?php
    require_once 'header.php';
    ?>
    <div class="container">
        <div class="detail-header">
            <h1><i class="fas fa-calculator"></i> Detail Perhitungan</h1>
            <a href="account.php" class="back-btn"><i class="fas fa-arrow-left"></i> Kembali ke Riwayat</a>
        </div>

        <!-- Same form structure as form.php but with disabled inputs -->
        <div class="card">
            <h2>Input Parameter</h2>
            <form id="fuzzyForm">
                <div class="input-group">
                    <label for="calculationName">Nama Perhitungan:</label>
                    <input type="text" id="calculationName"
                        value="<?php echo htmlspecialchars($calculation['name']); ?>" readonly>
                </div>

                <h3>Rentang Variabel</h3>
                <div class="grid-cols-2">
                    <div class="input-group">
                        <label for="varPermMin">Permintaan Minimum:</label>
                        <input type="number" id="varPermMin" value="<?php echo $calculation['var_perm_min']; ?>"
                            readonly>
                    </div>
                    <div class="input-group">
                        <label for="varPermMax">Permintaan Maksimum:</label>
                        <input type="number" id="varPermMax" value="<?php echo $calculation['var_perm_max']; ?>"
                            readonly>
                    </div>
                    <div class="input-group">
                        <label for="varPersMin">Persediaan Minimum:</label>
                        <input type="number" id="varPersMin" value="<?php echo $calculation['var_pers_min']; ?>"
                            readonly>
                    </div>
                    <div class="input-group">
                        <label for="varPersMax">Persediaan Maksimum:</label>
                        <input type="number" id="varPersMax" value="<?php echo $calculation['var_pers_max']; ?>"
                            readonly>
                    </div>
                    <div class="input-group">
                        <label for="varProdMin">Produksi Minimum:</label>
                        <input type="number" id="varProdMin" value="<?php echo $calculation['var_prod_min']; ?>"
                            readonly>
                    </div>
                    <div class="input-group">
                        <label for="varProdMax">Produksi Maksimum:</label>
                        <input type="number" id="varProdMax" value="<?php echo $calculation['var_prod_max']; ?>"
                            readonly>
                    </div>
                </div>

                <h3>Nilai yang Akan Dihitung</h3>
                <div class="grid-cols-2">
                    <div class="input-group">
                        <label for="permintaanX">Permintaan:</label>
                        <input type="number" id="permintaanX" value="<?php echo $calculation['permintaan_x']; ?>"
                            readonly>
                    </div>
                    <div class="input-group">
                        <label for="persediaanX">Persediaan:</label>
                        <input type="number" id="persediaanX" value="<?php echo $calculation['persediaan_x']; ?>"
                            readonly>
                    </div>
                </div>
            </form>
        </div>

        <!-- Hasil Perhitungan -->
        <div class="card">
            <h2>Hasil Perhitungan</h2>
            <div class="bg-gray-50 p-4 rounded-md">
                <h3>Derajat Keanggotaan</h3>
                <div class="grid-cols-2">
                    <div>
                        <p><strong>Permintaan:</strong></p>
                        <p>Turun: <span id="permTurun">0.0000</span></p>
                        <p>Naik: <span id="permNaik">0.0000</span></p>
                    </div>
                    <div>
                        <p><strong>Persediaan:</strong></p>
                        <p>Sedikit: <span id="persSedikit">0.0000</span></p>
                        <p>Banyak: <span id="persBanyak">0.0000</span></p>
                    </div>
                </div>
            </div>

            <div class="bg-gray-50 p-4 rounded-md" style="margin-top: 20px;">
                <h3>Aturan Fuzzy</h3>
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Aturan</th>
                            <th class="text-center">α-predikat</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>R1</td>
                            <td>IF Permintaan Turun AND Persediaan Banyak THEN Produksi Berkurang</td>
                            <td class="text-center" id="nilaiR1">0.0000</td>
                        </tr>
                        <tr>
                            <td>R2</td>
                            <td>IF Permintaan Turun AND Persediaan Sedikit THEN Produksi Berkurang</td>
                            <td class="text-center" id="nilaiR2">0.0000</td>
                        </tr>
                        <tr>
                            <td>R3</td>
                            <td>IF Permintaan Naik AND Persediaan Banyak THEN Produksi Bertambah</td>
                            <td class="text-center" id="nilaiR3">0.0000</td>
                        </tr>
                        <tr>
                            <td>R4</td>
                            <td>IF Permintaan Naik AND Persediaan Sedikit THEN Produksi Bertambah</td>
                            <td class="text-center" id="nilaiR4">0.0000</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="result-highlight">
                <h3>Hasil Defuzzifikasi</h3>
                <div class="grid-cols-2">
                    <div>
                        <p><strong>Produksi Berkurang:</strong></p>
                        <p id="prodBerkurang">0.0000</p>
                    </div>
                    <div>
                        <p><strong>Produksi Bertambah:</strong></p>
                        <p id="prodBertambah">0.0000</p>
                    </div>
                </div>
                <p><strong>Nilai Produksi:</strong></p>
                <p class="result-value" id="nilaiSugeno"><?php echo number_format($calculation['nilai_sugeno'], 2); ?>
                </p>
            </div>
        </div>

        <!-- Visualisasi Fungsi Keanggotaan -->
        <div class="card">
            <h2>Visualisasi Fungsi Keanggotaan</h2>
            <div class="grid-cols-2">
                <div>
                    <h3>Variabel Permintaan</h3>
                    <div class="chart-container">
                        <canvas id="permintaanChart"></canvas>
                    </div>
                </div>
                <div>
                    <h3>Variabel Persediaan</h3>
                    <div class="chart-container">
                        <canvas id="persediaanChart"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- Visualisasi Aturan Fuzzy -->
        <div class="card">
            <h2>Visualisasi Aturan Fuzzy</h2>
            <div class="rules-container">
                <div>
                    <h3>Kontribusi Aturan</h3>
                    <div class="chart-container">
                        <canvas id="rulesChart"></canvas>
                    </div>
                </div>
                <div>
                    <h3>Diagram Aturan Fuzzy</h3>
                    <div class="chart-container">
                        <canvas id="rulesPieChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Visualisasi 3D Surface Plot -->
    <div class="card">
        <h2>Visualisasi 3D Hubungan Permintaan-Persediaan-Produksi</h2>
        <div class="tab-container">
            <div class="tab-buttons">
                <button class="tab-button active" onclick="openTab('surfacePlotTab')">Surface Plot</button>
                <button class="tab-button" onclick="openTab('contourPlotTab')">Contour Plot</button>
            </div>
            <div id="surfacePlotTab" class="tab-content active">
                <div id="surfacePlot" class="surface-plot-container"></div>
            </div>
            <div id="contourPlotTab" class="tab-content">
                <div id="contourPlot" class="surface-plot-container"></div>
            </div>
        </div>
    </div>

    <script src="../js/form.js"></script>

    <script>
    document.addEventListener('DOMContentLoaded', function() {
        const permTurun =
            <?php echo 1 - ($calculation['permintaan_x'] - $calculation['var_perm_min']) / ($calculation['var_perm_max'] - $calculation['var_perm_min']); ?>;
        const permNaik =
            <?php echo ($calculation['permintaan_x'] - $calculation['var_perm_min']) / ($calculation['var_perm_max'] - $calculation['var_perm_min']); ?>;
        const persSedikit =
            <?php echo 1 - ($calculation['persediaan_x'] - $calculation['var_pers_min']) / ($calculation['var_pers_max'] - $calculation['var_pers_min']); ?>;
        const persBanyak =
            <?php echo ($calculation['persediaan_x'] - $calculation['var_pers_min']) / ($calculation['var_pers_max'] - $calculation['var_pers_min']); ?>;

        document.getElementById('permTurun').textContent = permTurun.toFixed(4);
        document.getElementById('permNaik').textContent = permNaik.toFixed(4);
        document.getElementById('persSedikit').textContent = persSedikit.toFixed(4);
        document.getElementById('persBanyak').textContent = persBanyak.toFixed(4);

        const nilaiR1 = Math.min(permTurun, persBanyak);
        const nilaiR2 = Math.min(permTurun, persSedikit);
        const nilaiR3 = Math.min(permNaik, persBanyak);
        const nilaiR4 = Math.min(permNaik, persSedikit);

        document.getElementById('nilaiR1').textContent = nilaiR1.toFixed(4);
        document.getElementById('nilaiR2').textContent = nilaiR2.toFixed(4);
        document.getElementById('nilaiR3').textContent = nilaiR3.toFixed(4);
        document.getElementById('nilaiR4').textContent = nilaiR4.toFixed(4);

        const prodBerkurang = Math.min(nilaiR1, nilaiR2);
        const prodBertambah = Math.max(nilaiR3, nilaiR4);

        document.getElementById('prodBerkurang').textContent = prodBerkurang.toFixed(4);
        document.getElementById('prodBertambah').textContent = prodBertambah.toFixed(4);

        updateCharts();

        document.getElementById('calculateBtn').style.display = 'none';
    });
    </script>
</body>

</html>