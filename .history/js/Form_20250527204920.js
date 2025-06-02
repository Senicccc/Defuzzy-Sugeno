// Variabel untuk menyimpan chart dan plot
let permintaanChart, persediaanChart, rulesChart, rulesPieChart;
let surfacePlotInstance, contourPlotInstance;

// Fungsi untuk menggambar garis vertikal pada Chart.js
Chart.register({
    id: 'verticalLine',
    afterDraw: (chart) => {
        if (chart.config._inputX !== undefined) {
            const ctx = chart.ctx;
            const xAxis = chart.scales.x;
            const yAxis = chart.scales.y;
            const xPos = xAxis.getPixelForValue(chart.config._inputX);

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(xPos, yAxis.top);
            ctx.lineTo(xPos, yAxis.bottom);
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#2c3e50';
            ctx.stroke();
            ctx.restore();
        }
    }
});

// Fungsi untuk validasi input
function validateInputs() {
    let isValid = true;
    document.querySelectorAll(".error-message").forEach((el) => (el.textContent = ""));
    document.querySelectorAll("input").forEach((el) => el.classList.remove("input-error"));

    const varPermMin = parseFloat(document.getElementById("varPermMin").value);
    const varPermMax = parseFloat(document.getElementById("varPermMax").value);
    const varPersMin = parseFloat(document.getElementById("varPersMin").value);
    const varPersMax = parseFloat(document.getElementById("varPersMax").value);
    const varProdMin = parseFloat(document.getElementById("varProdMin").value);
    const varProdMax = parseFloat(document.getElementById("varProdMax").value);

    const permintaanX = parseFloat(document.getElementById("permintaanX").value);
    const persediaanX = parseFloat(document.getElementById("persediaanX").value);

    if (varPermMin >= varPermMax) {
        document.getElementById("varPermMinError").textContent = "Minimum harus kurang dari maksimum";
        document.getElementById("varPermMin").classList.add("input-error");
        isValid = false;
    }
    if (varPersMin >= varPersMax) {
        document.getElementById("varPersMinError").textContent = "Minimum harus kurang dari maksimum";
        document.getElementById("varPersMin").classList.add("input-error");
        isValid = false;
    }
    if (varProdMin >= varProdMax) {
        document.getElementById("varProdMinError").textContent = "Minimum harus kurang dari maksimum";
        document.getElementById("varProdMin").classList.add("input-error");
        isValid = false;
    }
    if (permintaanX < varPermMin || permintaanX > varPermMax) {
        document.getElementById("permintaanXError").textContent = `Nilai harus antara ${varPermMin} dan ${varPermMax}`;
        document.getElementById("permintaanX").classList.add("input-error");
        isValid = false;
    }
    if (persediaanX < varPersMin || persediaanX > varPersMax) {
        document.getElementById("persediaanXError").textContent = `Nilai harus antara ${varPersMin} dan ${varPersMax}`;
        document.getElementById("persediaanX").classList.add("input-error");
        isValid = false;
    }
    return isValid;
}

// Fungsi untuk menghitung derajat keanggotaan (diperbarui)
function hitungDerajatKeanggotaan() {
    const varPermMin = parseFloat(document.getElementById("varPermMin").value);
    const varPermMax = parseFloat(document.getElementById("varPermMax").value);
    const varPersMin = parseFloat(document.getElementById("varPersMin").value);
    const varPersMax = parseFloat(document.getElementById("varPersMax").value);
    const permintaanX = parseFloat(document.getElementById("permintaanX").value);
    const persediaanX = parseFloat(document.getElementById("persediaanX").value);

    const clampedPermintaanX = Math.max(varPermMin, Math.min(varPermMax, permintaanX));
    const clampedPersediaanX = Math.max(varPersMin, Math.min(varPersMax, persediaanX));

    const permTurun = (varPermMax - clampedPermintaanX) / (varPermMax - varPermMin);
    const permNaik = (clampedPermintaanX - varPermMin) / (varPermMax - varPermMin);
    const persSedikit = (varPersMax - clampedPersediaanX) / (varPersMax - varPersMin);
    const persBanyak = (clampedPersediaanX - varPersMin) / (varPersMax - varPersMin);

    // Update tampilan dengan 2 desimal
    document.getElementById("permTurun").textContent = (Math.max(0, Math.min(1, permTurun)) * 100).toFixed(2);
    document.getElementById("permNaik").textContent = (Math.max(0, Math.min(1, permNaik)) * 100).toFixed(2);
    document.getElementById("persSedikit").textContent = (Math.max(0, Math.min(1, persSedikit)) * 100).toFixed(2);
    document.getElementById("persBanyak").textContent = (Math.max(0, Math.min(1, persBanyak)) * 100).toFixed(2);

    return {
        permTurun: Math.max(0, Math.min(1, permTurun)),
        permNaik: Math.max(0, Math.min(1, permNaik)),
        persSedikit: Math.max(0, Math.min(1, persSedikit)),
        persBanyak: Math.max(0, Math.min(1, persBanyak)),
    };
}

// Fungsi untuk menghitung aturan fuzzy
function hitungAturanFuzzy(permTurun, permNaik, persSedikit, persBanyak) {
    const nilaiR1 = Math.min(permTurun, persBanyak);
    const nilaiR2 = Math.min(permTurun, persSedikit);
    const nilaiR3 = Math.min(permNaik, persBanyak);
    const nilaiR4 = Math.min(permNaik, persSedikit);

    document.getElementById("nilaiR1").textContent = nilaiR1.toFixed(4);
    document.getElementById("nilaiR2").textContent = nilaiR2.toFixed(4);
    document.getElementById("nilaiR3").textContent = nilaiR3.toFixed(4);
    document.getElementById("nilaiR4").textContent = nilaiR4.toFixed(4);

    return { nilaiR1, nilaiR2, nilaiR3, nilaiR4 };
}

// Fungsi untuk menghitung hasil inferensi
function hitungHasilInferensi(nilaiR1, nilaiR2, nilaiR3, nilaiR4) {
    const prodBerkurang = Math.min(nilaiR1, nilaiR2);
    const prodBertambah = Math.max(nilaiR3, nilaiR4);

    document.getElementById("prodBerkurang").textContent = prodBerkurang.toFixed(4);
    document.getElementById("prodBertambah").textContent = prodBertambah.toFixed(4);

    return { prodBerkurang, prodBertambah };
}

// Fungsi untuk menghitung defuzzifikasi Sugeno dengan clamping (penambahan pembulatan)
function hitungDefuzzifikasi(prodBerkurang, prodBertambah) {
    const varProdMin = parseFloat(document.getElementById("varProdMin").value);
    const varProdMax = parseFloat(document.getElementById("varProdMax").value);

    const numerator = prodBerkurang * varProdMin + prodBertambah * varProdMax;
    const denominator = prodBerkurang + prodBertambah;

    let nilaiSugeno = denominator !== 0 ? numerator / denominator : (varProdMin + varProdMax) / 2;
    nilaiSugeno = Math.max(varProdMin, Math.min(varProdMax, nilaiSugeno));

    document.getElementById("nilaiSugeno").textContent =
        isNaN(nilaiSugeno) ? "0.00" : nilaiSugeno.toFixed(2);

    return nilaiSugeno;
}

// Fungsi untuk mempersiapkan data chart
function prepareChartData() {
    const varPermMin = parseFloat(document.getElementById("varPermMin").value);
    const varPermMax = parseFloat(document.getElementById("varPermMax").value);
    const varPersMin = parseFloat(document.getElementById("varPersMin").value);
    const varPersMax = parseFloat(document.getElementById("varPersMax").value);
    const permintaanX = parseFloat(document.getElementById("permintaanX").value);
    const persediaanX = parseFloat(document.getElementById("persediaanX").value);

    const permLabels = [];
    const permTurunData = [];
    const permNaikData = [];

    const stepPerm = (varPermMax - varPermMin) / 100;
    for (let x = varPermMin; x <= varPermMax; x += stepPerm) {
        permLabels.push(Math.round(x));
        permTurunData.push(
            Math.max(0, Math.min(1, (varPermMax - x) / (varPermMax - varPermMin)))
        );
        permNaikData.push(
            Math.max(0, Math.min(1, (x - varPermMin) / (varPermMax - varPermMin)))
        );
    }

    const persLabels = [];
    const persSedikitData = [];
    const persBanyakData = [];

    const stepPers = (varPersMax - varPersMin) / 100;
    for (let x = varPersMin; x <= varPersMax; x += stepPers) {
        persLabels.push(Math.round(x));
        persSedikitData.push(
            Math.max(0, Math.min(1, (varPersMax - x) / (varPersMax - varPersMin)))
        );
        persBanyakData.push(
            Math.max(0, Math.min(1, (x - varPersMin) / (varPersMax - varPersMin)))
        );
    }

    return {
        permintaan: {
            labels: permLabels,
            turun: permTurunData,
            naik: permNaikData,
            inputX: permintaanX
        },
        persediaan: {
            labels: persLabels,
            sedikit: persSedikitData,
            banyak: persBanyakData,
            inputX: persediaanX
        },
    };
}

// Fungsi untuk memperbarui chart (versi disesuaikan jurnal)
function updateCharts() {
    const chartData = prepareChartData();

    const permintaanData = chartData.permintaan;
    const persediaanData = chartData.persediaan;

    const colorSet = {
        turun: '#e74c3c',
        naik: '#3498db',
        sedikit: '#f1c40f',
        banyak: '#2ecc71',
        garis: '#2c3e50'
    };

    const chartConfig = {
        type: 'line',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    font: { size: 18, weight: 'bold' },
                    padding: { top: 10, bottom: 20 }
                },
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.dataset.label}: ${(ctx.raw * 100).toFixed(2)}%`
                    }
                },
                legend: {
                    position: 'top',
                    labels: { boxWidth: 20, padding: 15 }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        font: { size: 14, weight: 'bold' },
                        padding: 10
                    },
                    grid: { display: false }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Derajat Keanggotaan (%)',
                        font: { size: 14, weight: 'bold' }
                    },
                    min: 0,
                    max: 1,
                    ticks: {
                        callback: value => `${(value * 100).toFixed(0)}%`,
                        stepSize: 0.2
                    }
                }
            }
        }
    };

    // Chart Permintaan
    if (permintaanChart) permintaanChart.destroy();
    permintaanChart = new Chart(document.getElementById('permintaanChart'), {
        ...chartConfig,
        data: {
            labels: permintaanData.labels,
            datasets: [
                {
                    label: 'Turun',
                    data: permintaanData.turun,
                    borderColor: colorSet.turun,
                    backgroundColor: `${colorSet.turun}20`,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Naik',
                    data: permintaanData.naik,
                    borderColor: colorSet.naik,
                    backgroundColor: `${colorSet.naik}20`,
                    fill: true,
                    tension: 0.3
                }
            ]
        },
        options: {
            ...chartConfig.options,
            plugins: {
                ...chartConfig.options.plugins,
                title: {
                    ...chartConfig.options.plugins.title,
                    text: 'Fungsi Keanggotaan Permintaan'
                }
            }
        },
        _inputX: permintaanData.inputX
    });

    // Chart Persediaan
    if (persediaanChart) persediaanChart.destroy();
    persediaanChart = new Chart(document.getElementById('persediaanChart'), {
        ...chartConfig,
        data: {
            labels: persediaanData.labels,
            datasets: [
                {
                    label: 'Sedikit',
                    data: persediaanData.sedikit,
                    borderColor: colorSet.sedikit,
                    backgroundColor: `${colorSet.sedikit}20`,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Banyak',
                    data: persediaanData.banyak,
                    borderColor: colorSet.banyak,
                    backgroundColor: `${colorSet.banyak}20`,
                    fill: true,
                    tension: 0.3
                }
            ]
        },
        options: {
            ...chartConfig.options,
            plugins: {
                ...chartConfig.options.plugins,
                title: {
                    ...chartConfig.options.plugins.title,
                    text: 'Fungsi Keanggotaan Persediaan'
                }
            }
        },
        _inputX: persediaanData.inputX
    });

    // Bagian rulesChart dan rulesPieChart tetap sama seperti sebelumnya
    // ... (jika ingin tetap menampilkan bar/pie chart aturan fuzzy, gunakan kode Anda sebelumnya)
}

// Fungsi untuk tab
function openTab(tabId) {
    const tabs = document.querySelectorAll(".tab-content");
    tabs.forEach((tab) => tab.classList.remove("active"));
    const buttons = document.querySelectorAll(".tab-button");
    buttons.forEach((btn) => btn.classList.remove("active"));
    document.getElementById(tabId).classList.add("active");
    event.currentTarget.classList.add("active");
}

// Fungsi untuk membuat surface plot
function updateSurfacePlot() {
    const varPermMin = parseFloat(document.getElementById("varPermMin").value);
    const varPermMax = parseFloat(document.getElementById("varPermMax").value);
    const varPersMin = parseFloat(document.getElementById("varPersMin").value);
    const varPersMax = parseFloat(document.getElementById("varPersMax").value);
    const varProdMin = parseFloat(document.getElementById("varProdMin").value);
    const varProdMax = parseFloat(document.getElementById("varProdMax").value);

    // Buat grid data untuk surface plot
    const permintaanSteps = 20;
    const persediaanSteps = 20;

    const permintaanRange = [];
    const persediaanRange = [];
    const produksiValues = [];

    const permStep = (varPermMax - varPermMin) / permintaanSteps;
    const persStep = (varPersMax - varPersMin) / persediaanSteps;

    for (let i = 0; i <= permintaanSteps; i++) {
        permintaanRange.push(varPermMin + i * permStep);
    }

    for (let i = 0; i <= persediaanSteps; i++) {
        persediaanRange.push(varPersMin + i * persStep);
    }

    // Hitung nilai produksi untuk setiap kombinasi permintaan dan persediaan
    for (let i = 0; i <= permintaanSteps; i++) {
        const row = [];
        for (let j = 0; j <= persediaanSteps; j++) {
            const permintaan = permintaanRange[i];
            const persediaan = persediaanRange[j];

            // Hitung derajat keanggotaan
            const permTurun = Math.max(
                0,
                Math.min(1, (varPermMax - permintaan) / (varPermMax - varPermMin))
            );
            const permNaik = Math.max(
                0,
                Math.min(1, (permintaan - varPermMin) / (varPermMax - varPermMin))
            );
            const persSedikit = Math.max(
                0,
                Math.min(1, (varPersMax - persediaan) / (varPersMax - varPersMin))
            );
            const persBanyak = Math.max(
                0,
                Math.min(1, (persediaan - varPersMin) / (varPersMax - varPersMin))
            );

            // Hitung aturan fuzzy
            const nilaiR1 = Math.min(permTurun, persBanyak);
            const nilaiR2 = Math.min(permTurun, persSedikit);
            const nilaiR3 = Math.min(permNaik, persBanyak);
            const nilaiR4 = Math.min(permNaik, persSedikit);

            // Hitung hasil inferensi
            const prodBerkurang = Math.min(nilaiR1, nilaiR2); // Diubah dari min ke max
            const prodBertambah = Math.max(nilaiR3, nilaiR4);

            // Hitung defuzzifikasi
            const numerator = prodBerkurang * varProdMin + prodBertambah * varProdMax;
            const denominator = prodBerkurang + prodBertambah;
            let nilaiSugeno = denominator !== 0 ? numerator / denominator : (varProdMin + varProdMax) / 2;
            nilaiSugeno = Math.max(varProdMin, Math.min(varProdMax, nilaiSugeno));

            row.push(nilaiSugeno);
        }
        produksiValues.push(row);
    }

    // Data untuk surface plot
    const surfaceData = {
        type: "surface",
        x: persediaanRange,
        y: permintaanRange,
        z: produksiValues,
        colorscale: "Viridis",
        contours: {
            z: {
                show: true,
                usecolormap: true,
                highlightcolor: "#42f462",
                project: { z: true },
            },
        },
    };

    const surfaceLayout = {
        title: "Surface Plot Hubungan Permintaan-Persediaan-Produksi",
        scene: {
            xaxis: { title: "Persediaan" },
            yaxis: { title: "Permintaan" },
            zaxis: { title: "Produksi" },
            camera: {
                eye: { x: 1.5, y: 1.5, z: 1 },
            },
        },
        margin: {
            l: 50,
            r: 50,
            b: 50,
            t: 50,
        },
    };

    // Data untuk contour plot
    const contourData = {
        type: "contour",
        x: persediaanRange,
        y: permintaanRange,
        z: produksiValues,
        colorscale: "Viridis",
        contours: {
            coloring: "heatmap",
        },
    };

    const contourLayout = {
        title: "Contour Plot Hubungan Permintaan-Persediaan-Produksi",
        xaxis: { title: "Persediaan" },
        yaxis: { title: "Permintaan" },
        margin: {
            l: 50,
            r: 50,
            b: 50,
            t: 50,
        },
    };

    // Hapus plot sebelumnya jika ada
    if (surfacePlotInstance) {
        Plotly.purge("surfacePlot");
    }
    if (contourPlotInstance) {
        Plotly.purge("contourPlot");
    }
    // Render plot baru
    surfacePlotInstance = Plotly.newPlot(
        "surfacePlot",
        [surfaceData],
        surfaceLayout
    );
        contourPlotInstance = Plotly.newPlot(
            "contourPlot",
            [contourData],
            contourLayout
        );
    }
    
    // Fungsi utama untuk menghitung semua
    function hitungSemua() {
        if (!validateInputs()) {
            return; // Stop jika validasi gagal
        }
        const { permTurun, permNaik, persSedikit, persBanyak } = hitungDerajatKeanggotaan();
        const { nilaiR1, nilaiR2, nilaiR3, nilaiR4 } = hitungAturanFuzzy(
            permTurun,
            permNaik,
            persSedikit,
            persBanyak
        );
        const { prodBerkurang, prodBertambah } = hitungHasilInferensi(
            nilaiR1,
            nilaiR2,
            nilaiR3,
            nilaiR4
        );
        hitungDefuzzifikasi(prodBerkurang, prodBertambah);
        updateCharts();
        updateSurfacePlot();
    }
    
    // Event listener untuk tombol hitung
    document.getElementById("calculateBtn").addEventListener("click", hitungSemua);
    
    // Jalankan perhitungan pertama kali halaman dimuat
    document.addEventListener("DOMContentLoaded", function () {
        // Inisialisasi nilai default jika diperlukan
        if (!document.getElementById("varPermMin").value) {
            document.getElementById("varPermMin").value = "486";
            document.getElementById("varPermMax").value = "9868";
            document.getElementById("varPersMin").value = "743";
            document.getElementById("varPersMax").value = "3761";
            document.getElementById("varProdMin").value = "1254";
            document.getElementById("varProdMax").value = "8580";
            document.getElementById("permintaanX").value = "5823";
            document.getElementById("persediaanX").value = "2903";
        }
        hitungSemua();
    });