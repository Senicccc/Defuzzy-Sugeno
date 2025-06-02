<?php
session_start();
require_once 'db_connection.php'; 

$isLoggedIn = isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
$username = $isLoggedIn ? htmlspecialchars($_SESSION['username'], ENT_QUOTES, 'UTF-8') : '';
?>

<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fuzzy Sugeno - Keputusan Jumlah Produksi</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <link rel="stylesheet" href="../css/form.css">
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
    <main>
        <h1>Form Hitung Jumlah Produksi</h1>

        <?php if ($isLoggedIn): ?>
        <div class="user-info">
            <p>Selamat datang, <?php echo $username; ?></p>
            <a href="logout.php" class="logout-btn">Logout</a>
        </div>
        <?php else: ?>
        <div class="login-prompt">
            <p>Anda belum login. <a href="login.php">Login disini</a> untuk menyimpan perhitungan.</p>
        </div>
        <?php endif; ?>

        <div class="container">
            <!-- Input Parameter -->
            <div class="card">
                <h2>Input Parameter</h2>

                <form id="fuzzyForm">
                    <?php if ($isLoggedIn): ?>
                    <div class="input-group">
                        <label for="calculationName">Nama Perhitungan:</label>
                        <input type="text" id="calculationName" placeholder="Contoh: Perhitungan Produksi PT. ABC"
                            required maxlength="100">
                    </div>
                    <?php endif; ?>

                    <h3>Rentang Variabel</h3>
                    <div class="grid-cols-2">
                        <?php 
                        // Data untuk input range
                        $inputRanges = [
                            ['id' => 'varPermMin', 'label' => 'Permintaan Minimum:', 'value' => 486],
                            ['id' => 'varPermMax', 'label' => 'Permintaan Maksimum:', 'value' => 9868],
                            ['id' => 'varPersMin', 'label' => 'Persediaan Minimum:', 'value' => 743],
                            ['id' => 'varPersMax', 'label' => 'Persediaan Maksimum:', 'value' => 3761],
                            ['id' => 'varProdMin', 'label' => 'Produksi Minimum:', 'value' => 1254],
                            ['id' => 'varProdMax', 'label' => 'Produksi Maksimum:', 'value' => 8580]
                        ];
                        
                        foreach ($inputRanges as $input): ?>
                        <div class="input-group">
                            <label for="<?php echo $input['id']; ?>"><?php echo $input['label']; ?></label>
                            <input type="number" id="<?php echo $input['id']; ?>" value="<?php echo $input['value']; ?>"
                                min="0" step="1">
                            <div id="<?php echo $input['id']; ?>Error" class="error-message"></div>
                        </div>
                        <?php endforeach; ?>
                    </div>

                    <h3>Nilai yang Akan Dihitung</h3>
                    <div class="grid-cols-2">
                        <?php 
                        $calculationInputs = [
                            ['id' => 'permintaanX', 'label' => 'Permintaan:', 'value' => 5823],
                            ['id' => 'persediaanX', 'label' => 'Persediaan:', 'value' => 2903]
                        ];
                        
                        foreach ($calculationInputs as $input): ?>
                        <div class="input-group">
                            <label for="<?php echo $input['id']; ?>"><?php echo $input['label']; ?></label>
                            <input type="number" id="<?php echo $input['id']; ?>" value="<?php echo $input['value']; ?>"
                                min="0" step="1">
                            <div id="<?php echo $input['id']; ?>Error" class="error-message"></div>
                        </div>
                        <?php endforeach; ?>
                    </div>

                    <div class="button-group">
                        <button type="button" id="calculateBtn" class="btn-primary">Hitung Fuzzy Sugeno</button>

                        <?php if ($isLoggedIn): ?>
                        <button type="button" id="saveBtn" class="btn-secondary">Simpan Perhitungan</button>
                        <?php else: ?>
                        <button type="button" id="saveBtn" class="btn-secondary" disabled
                            title="Anda harus login untuk menyimpan">Simpan Perhitungan</button>
                        <?php endif; ?>
                    </div>
                </form>
            </div>

            <!-- Hasil Perhitungan -->
            <div class="card">
                <h2>Hasil Perhitungan</h2>

                <div class="result-section">
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

                <div class="result-section">
                    <h3>Aturan Fuzzy</h3>
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Aturan</th>
                                    <th class="text-center">α-predikat</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php
                                $rules = [
                                    ['id' => 'nilaiR1', 'desc' => 'IF Permintaan Turun AND Persediaan Banyak THEN Produksi Berkurang'],
                                    ['id' => 'nilaiR2', 'desc' => 'IF Permintaan Turun AND Persediaan Sedikit THEN Produksi Berkurang'],
                                    ['id' => 'nilaiR3', 'desc' => 'IF Permintaan Naik AND Persediaan Banyak THEN Produksi Bertambah'],
                                    ['id' => 'nilaiR4', 'desc' => 'IF Permintaan Naik AND Persediaan Sedikit THEN Produksi Bertambah']
                                ];
                                
                                foreach ($rules as $index => $rule): ?>
                                <tr>
                                    <td>R<?php echo $index + 1; ?></td>
                                    <td><?php echo $rule['desc']; ?></td>
                                    <td class="text-center" id="<?php echo $rule['id']; ?>">0.0000</td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
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
                    <p class="result-value" id="nilaiSugeno">0.00</p>
                </div>
            </div>
        </div>

        <!-- Visualisasi Fungsi Keanggotaan -->
        <div class="card">
            <h2>Visualisasi Fungsi Keanggotaan</h2>
            <div class="grid-cols-2">
                <div>
                    <h3>Variabel Permintaan</h3>
                    <div class="chart-container">
                        <canvas id="permintaanChart" aria-label="Grafik Fungsi Keanggotaan Permintaan"
                            role="img"></canvas>
                    </div>
                </div>
                <div>
                    <h3>Variabel Persediaan</h3>
                    <div class="chart-container">
                        <canvas id="persediaanChart" aria-label="Grafik Fungsi Keanggotaan Persediaan"
                            role="img"></canvas>
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
                        <canvas id="rulesChart" aria-label="Grafik Kontribusi Aturan Fuzzy" role="img"></canvas>
                    </div>
                </div>
                <div>
                    <h3>Diagram Aturan Fuzzy</h3>
                    <div class="chart-container">
                        <canvas id="rulesPieChart" aria-label="Diagram Pie Aturan Fuzzy" role="img"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- Heatmap Visualisasi -->
        <div class="card">
            <h2>Visualisasi Heat Map Permintaan-Persediaan-Produksi</h2>
            <div id="heatmapPlot" class="surface-plot-container"></div>
        </div>
    </main>

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
    document.getElementById('saveBtn')?.addEventListener('click', function() {
        if (!<?php echo $isLoggedIn ? 'true' : 'false'; ?>) {
            alert('Anda harus login untuk menyimpan perhitungan');
            return;
        }

        const calculationName = document.getElementById('calculationName').value.trim();
        if (!calculationName) {
            alert('Harap beri nama perhitungan');
            return;
        }

        if (calculationName.length > 100) {
            alert('Nama perhitungan maksimal 100 karakter');
            return;
        }

        const data = {
            name: calculationName,
            varPermMin: document.getElementById('varPermMin').value,
            varPermMax: document.getElementById('varPermMax').value,
            varPersMin: document.getElementById('varPersMin').value,
            varPersMax: document.getElementById('varPersMax').value,
            varProdMin: document.getElementById('varProdMin').value,
            varProdMax: document.getElementById('varProdMax').value,
            permintaanX: document.getElementById('permintaanX').value,
            persediaanX: document.getElementById('persediaanX').value,
            permTurun: document.getElementById('permTurun').textContent,
            permNaik: document.getElementById('permNaik').textContent,
            persSedikit: document.getElementById('persSedikit').textContent,
            persBanyak: document.getElementById('persBanyak').textContent,
            nilaiR1: document.getElementById('nilaiR1').textContent,
            nilaiR2: document.getElementById('nilaiR2').textContent,
            nilaiR3: document.getElementById('nilaiR3').textContent,
            nilaiR4: document.getElementById('nilaiR4').textContent,
            prodBerkurang: document.getElementById('prodBerkurang').textContent,
            prodBertambah: document.getElementById('prodBertambah').textContent,
            nilaiSugeno: document.getElementById('nilaiSugeno').textContent
        };

        for (const key in data) {
            if (data[key] === undefined || data[key] === null || data[key] === '') {
                alert('Harap lengkapi semua data sebelum menyimpan');
                return;
            }
        }

        fetch('save_calculation.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    alert('Perhitungan berhasil disimpan!');
                } else {
                    alert('Gagal menyimpan: ' + (data.message || 'Terjadi kesalahan'));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat menyimpan');
            });
    });

    // Fungsi Heatmap
    function generateHeatmap() {
        const permintaan = [];
        const persediaan = [];
        const produksi = [];

        // Buat grid data
        const permMin = parseInt(document.getElementById('varPermMin').value);
        const permMax = parseInt(document.getElementById('varPermMax').value);
        const persMin = parseInt(document.getElementById('varPersMin').value);
        const persMax = parseInt(document.getElementById('varPersMax').value);

        const permStep = Math.max(1, Math.floor((permMax - permMin) / 20));
        const persStep = Math.max(1, Math.floor((persMax - persMin) / 20));

        for (let i = permMin; i <= permMax; i += permStep) {
            permintaan.push(i);
        }
        for (let j = persMin; j <= persMax; j += persStep) {
            persediaan.push(j);
        }

        // Dummy: produksi = (permintaan + persediaan) / 2 (ganti dengan hasil fuzzy Sugeno jika ada)
        for (let i = 0; i < permintaan.length; i++) {
            produksi[i] = [];
            for (let j = 0; j < persediaan.length; j++) {
                produksi[i][j] = Math.max(0, permintaan[i] + persediaan[j]) / 2;
            }
        }

        const data = [{
            z: produksi,
            x: persediaan,
            y: permintaan,
            type: 'heatmap',
            colorscale: 'YlOrRd'
        }];

        const layout = {
            title: 'Heat Map Permintaan-Persediaan-Produksi',
            xaxis: {
                title: 'Persediaan'
            },
            yaxis: {
                title: 'Permintaan'
            },
            autosize: true
        };

        Plotly.newPlot('heatmapPlot', data, layout, {
            responsive: true
        });
    }

    // Generate heatmap saat halaman load dan saat input berubah
    window.addEventListener('DOMContentLoaded', generateHeatmap);
    ['varPermMin', 'varPermMax', 'varPersMin', 'varPersMax'].forEach(id => {
        document.getElementById(id).addEventListener('input', generateHeatmap);
    });
    </script>
</body>

</html>