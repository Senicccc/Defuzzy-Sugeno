// Variabel untuk menyimpan chart dan plot
let permintaanChart, persediaanChart, rulesChart, rulesPieChart;
let surfacePlotInstance, contourPlotInstance;

// Fungsi untuk validasi input
function validateInputs() {
    let isValid = true;

    // Reset error messages
    document.querySelectorAll(".error-message").forEach((el) => (el.textContent = ""));
    document.querySelectorAll("input").forEach((el) => el.classList.remove("input-error"));

    // Validasi rentang variabel
    const varPermMin = parseFloat(document.getElementById("varPermMin").value);
    const varPermMax = parseFloat(document.getElementById("varPermMax").value);
    const varPersMin = parseFloat(document.getElementById("varPersMin").value);
    const varPersMax = parseFloat(document.getElementById("varPersMax").value);
    const varProdMin = parseFloat(document.getElementById("varProdMin").value);
    const varProdMax = parseFloat(document.getElementById("varProdMax").value);

    // Validasi nilai yang akan dihitung
    const permintaanX = parseFloat(document.getElementById("permintaanX").value);
    const persediaanX = parseFloat(document.getElementById("persediaanX").value);

    // Validasi rentang minimum < maksimum
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

    // Validasi nilai input berada dalam rentang
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

// Fungsi untuk menghitung derajat keanggotaan
function hitungDerajatKeanggotaan() {
    const varPermMin = parseFloat(document.getElementById("varPermMin").value);
    const varPermMax = parseFloat(document.getElementById("varPermMax").value);
    const varPersMin = parseFloat(document.getElementById("varPersMin").value);
    const varPersMax = parseFloat(document.getElementById("varPersMax").value);
    const permintaanX = parseFloat(document.getElementById("permintaanX").value);
    const persediaanX = parseFloat(document.getElementById("persediaanX").value);

    // Validasi nilai input berada dalam range
    const clampedPermintaanX = Math.max(varPermMin, Math.min(varPermMax, permintaanX));
    const clampedPersediaanX = Math.max(varPersMin, Math.min(varPersMax, persediaanX));

    // Hitung derajat keanggotaan permintaan
    const permTurun = (varPermMax - clampedPermintaanX) / (varPermMax - varPermMin);
    const permNaik = (clampedPermintaanX - varPermMin) / (varPermMax - varPermMin);

    // Hitung derajat keanggotaan persediaan
    const persSedikit = (varPersMax - clampedPersediaanX) / (varPersMax - varPersMin);
    const persBanyak = (clampedPersediaanX - varPersMin) / (varPersMax - varPersMin);

    // Update tampilan (tanpa desimal)
    document.getElementById("permTurun").textContent = Math.round(Math.max(0, Math.min(1, permTurun)) * 100);
    document.getElementById("permNaik").textContent = Math.round(Math.max(0, Math.min(1, permNaik) * 100));
    document.getElementById("persSedikit").textContent = Math.round(Math.max(0, Math.min(1, persSedikit) * 100));
    document.getElementById("persBanyak").textContent = Math.round(Math.max(0, Math.min(1, persBanyak) * 100));

    return {
        permTurun: Math.max(0, Math.min(1, permTurun)),
        permNaik: Math.max(0, Math.min(1, permNaik)),
        persSedikit: Math.max(0, Math.min(1, persSedikit)),
        persBanyak: Math.max(0, Math.min(1, persBanyak)),
    };
}

// Fungsi untuk menghitung aturan fuzzy
function hitungAturanFuzzy(permTurun, permNaik, persSedikit, persBanyak) {
    // Hitung nilai α-predikat untuk setiap aturan
    const nilaiR1 = Math.min(permTurun, persBanyak);
    const nilaiR2 = Math.min(permTurun, persSedikit);
    const nilaiR3 = Math.min(permNaik, persBanyak);
    const nilaiR4 = Math.min(permNaik, persSedikit);

    // Update tampilan
    document.getElementById("nilaiR1").textContent = nilaiR1.toFixed(4);
    document.getElementById("nilaiR2").textContent = nilaiR2.toFixed(4);
    document.getElementById("nilaiR3").textContent = nilaiR3.toFixed(4);
    document.getElementById("nilaiR4").textContent = nilaiR4.toFixed(4);

    return { nilaiR1, nilaiR2, nilaiR3, nilaiR4 };
}

// Fungsi untuk menghitung hasil inferensi
function hitungHasilInferensi(nilaiR1, nilaiR2, nilaiR3, nilaiR4) {
    // Untuk Sugeno: 
    // Produksi Berkurang = min(R1, R2)
    // Produksi Bertambah = max(R3, R4)
    const prodBerkurang = Math.min(nilaiR1, nilaiR2);
    const prodBertambah = Math.max(nilaiR3, nilaiR4);

    // Update tampilan
    document.getElementById("prodBerkurang").textContent = prodBerkurang.toFixed(4);
    document.getElementById("prodBertambah").textContent = prodBertambah.toFixed(4);

    return { prodBerkurang, prodBertambah };
}

// Fungsi untuk menghitung defuzzifikasi Sugeno dengan clamping
function hitungDefuzzifikasi(prodBerkurang, prodBertambah) {
    const varProdMin = parseFloat(document.getElementById("varProdMin").value);
    const varProdMax = parseFloat(document.getElementById("varProdMax").value);

    // Hitung pembilang dan penyebut
    const numerator = prodBerkurang * varProdMin + prodBertambah * varProdMax;
    const denominator = prodBerkurang + prodBertambah;

    // Clamping nilai Sugeno antara varProdMin dan varProdMax
    let nilaiSugeno = denominator !== 0 ? numerator / denominator : (varProdMin + varProdMax) / 2;
    nilaiSugeno = Math.max(varProdMin, Math.min(varProdMax, nilaiSugeno));

    // Update tampilan
    document.getElementById("nilaiSugeno").textContent = isNaN(nilaiSugeno)
        ? "0.00"
        : nilaiSugeno.toFixed(2);

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

    // Data untuk chart permintaan
    const permLabels = [];
    const permTurunData = [];
    const permNaikData = [];
    const permInputLine = [];

    // Generate 100 titik data antara min dan max
    const stepPerm = (varPermMax - varPermMin) / 100;
    for (let x = varPermMin; x <= varPermMax; x += stepPerm) {
        permLabels.push(Math.round(x)); // Dibulatkan ke integer
        permTurunData.push(
            Math.max(0, Math.min(1, (varPermMax - x) / (varPermMax - varPermMin)))
        );
        permNaikData.push(
            Math.max(0, Math.min(1, (x - varPermMin) / (varPermMax - varPermMin)))
        );
        permInputLine.push(
            Math.abs(x - permintaanX) < stepPerm ? 1 : null
        );
    }

    // Data untuk chart persediaan
    const persLabels = [];
    const persSedikitData = [];
    const persBanyakData = [];
    const persInputLine = [];
    
    const stepPers = (varPersMax - varPersMin) / 100;
    for (let x = varPersMin; x <= varPersMax; x += stepPers) {
        persLabels.push(Math.round(x)); // Dibulatkan ke integer
        persSedikitData.push(
            Math.max(0, Math.min(1, (varPersMax - x) / (varPersMax - varPersMin)))
        );
        persBanyakData.push(
            Math.max(0, Math.min(1, (x - varPersMin) / (varPersMax - varPersMin)))
        );
        persInputLine.push(
            Math.abs(x - persediaanX) < stepPers ? 1 : null
        );
    }

    return {
        permintaan: {
            labels: permLabels,
            turun: permTurunData,
            naik: permNaikData,
            inputX: permintaanX,
            inputLine: permInputLine,
        },
        persediaan: {
            labels: persLabels,
            sedikit: persSedikitData,
            banyak: persBanyakData,
            inputX: persediaanX,
            inputLine: persInputLine,
        },
    };
}

// Fungsi untuk memperbarui chart
function updateCharts() {
    const chartData = prepareChartData();
    const permintaanX = chartData.permintaan.inputX;
    const persediaanX = chartData.persediaan.inputX;

    // Hitung derajat keanggotaan pada titik input
    const permTurunVal = Math.max(0, Math.min(1, (chartData.permintaan.labels[chartData.permintaan.labels.indexOf(Math.round(permintaanX))] !== undefined
        ? (chartData.permintaan.turun[chartData.permintaan.labels.indexOf(Math.round(permintaanX))])
        : (chartData.permintaan.turun[Math.floor(chartData.permintaan.turun.length/2)])));
    const permNaikVal = Math.max(0, Math.min(1, (chartData.permintaan.labels[chartData.permintaan.labels.indexOf(Math.round(permintaanX))] !== undefined
        ? (chartData.permintaan.naik[chartData.permintaan.labels.indexOf(Math.round(permintaanX))])
        : (chartData.permintaan.naik[Math.floor(chartData.permintaan.naik.length/2)])));
    const persSedikitVal = Math.max(0, Math.min(1, (chartData.persediaan.labels[chartData.persediaan.labels.indexOf(Math.round(persediaanX))] !== undefined
        ? (chartData.persediaan.sedikit[chartData.persediaan.labels.indexOf(Math.round(persediaanX))])
        : (chartData.persediaan.sedikit[Math.floor(chartData.persediaan.sedikit.length/2)])));
    const persBanyakVal = Math.max(0, Math.min(1, (chartData.persediaan.labels[chartData.persediaan.labels.indexOf(Math.round(persediaanX))] !== undefined
        ? (chartData.persediaan.banyak[chartData.persediaan.labels.indexOf(Math.round(persediaanX))])
        : (chartData.persediaan.banyak[Math.floor(chartData.persediaan.banyak.length/2)])));

    // Destroy chart jika sudah ada (gunakan optional chaining)
    permintaanChart?.destroy();
    persediaanChart?.destroy();
    rulesChart?.destroy?.();
    rulesPieChart?.destroy?.();

    // Chart Permintaan
    const permintaanCtx = document.getElementById("permintaanChart").getContext("2d");
    permintaanChart = new Chart(permintaanCtx, {
        type: "line",
        data: {
            labels: chartData.permintaan.labels,
            datasets: [
                {
                    label: "Turun",
                    data: chartData.permintaan.turun,
                    borderColor: "rgb(255, 99, 132)",
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    tension: 0,
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 2
                },
                {
                    label: "Naik",
                    data: chartData.permintaan.naik,
                    borderColor: "rgb(54, 162, 235)",
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                    tension: 0,
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 2
                },
                {
                    label: "Input",
                    data: [
                        {x: permintaanX, y: 0},
                        {x: permintaanX, y: 1}
                    ],
                    parsing: false,
                    borderColor: "rgb(0, 0, 0)",
                    borderWidth: 1,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false,
                    showLine: true,
                    order: 0
                },
                {
                    label: "Turun Value",
                    data: [
                        {x: chartData.permintaan.labels[0], y: permTurunVal},
                        {x: permintaanX, y: permTurunVal}
                    ],
                    parsing: false,
                    borderColor: "red",
                    borderWidth: 1,
                    borderDash: [2, 2],
                    pointRadius: 0,
                    fill: false,
                    showLine: true,
                    order: 1
                },
                {
                    label: "Naik Value",
                    data: [
                        {x: chartData.permintaan.labels[chartData.permintaan.labels.length-1], y: permNaikVal},
                        {x: permintaanX, y: permNaikVal}
                    ],
                    parsing: false,
                    borderColor: "red",
                    borderWidth: 1,
                    borderDash: [2, 2],
                    pointRadius: 0,
                    fill: false,
                    showLine: true,
                    order: 1
                },
                {
                    label: "Turun Label",
                    data: [{x: permintaanX, y: permTurunVal}],
                    parsing: false,
                    borderColor: "red",
                    backgroundColor: "red",
                    pointRadius: 6,
                    pointStyle: "circle",
                    showLine: false
                },
                {
                    label: "Naik Label",
                    data: [{x: permintaanX, y: permNaikVal}],
                    parsing: false,
                    borderColor: "red",
                    backgroundColor: "red",
                    pointRadius: 6,
                    pointStyle: "circle",
                    showLine: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: "Fungsi Keanggotaan Variabel Permintaan",
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                tooltip: {
                    enabled: false
                },
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 20,
                        usePointStyle: true
                    }
                },
                datalabels: {
                    display: true,
                    align: "left",
                    color: "red",
                    font: { weight: "bold", size: 14 },
                    formatter: function(value, ctx) {
                        if (ctx.dataset.label === "Turun Label") return permTurunVal.toFixed(3);
                        if (ctx.dataset.label === "Naik Label") return permNaikVal.toFixed(3);
                        return null;
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Nilai Permintaan",
                        font: { weight: 'bold' }
                    },
                    type: "linear",
                    min: chartData.permintaan.labels[0],
                    max: chartData.permintaan.labels[chartData.permintaan.labels.length-1],
                    ticks: { precision: 0 }
                },
                y: {
                    title: {
                        display: true,
                        text: "Derajat Keanggotaan",
                        font: { weight: 'bold' }
                    },
                    min: 0,
                    max: 1,
                    ticks: { stepSize: 0.2 }
                }
            }
        },
        plugins: [ChartDataLabels]
    });

    // Chart Persediaan
    const persediaanCtx = document.getElementById("persediaanChart").getContext("2d");
    persediaanChart = new Chart(persediaanCtx, {
        type: "line",
        data: {
            labels: chartData.persediaan.labels,
            datasets: [
                {
                    label: "Sedikit",
                    data: chartData.persediaan.sedikit,
                    borderColor: "rgb(255, 159, 64)",
                    backgroundColor: "rgba(255, 159, 64, 0.2)",
                    tension: 0,
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 2
                },
                {
                    label: "Banyak",
                    data: chartData.persediaan.banyak,
                    borderColor: "rgb(75, 192, 192)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    tension: 0,
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 2
                },
                {
                    label: "Input",
                    data: [
                        {x: persediaanX, y: 0},
                        {x: persediaanX, y: 1}
                    ],
                    parsing: false,
                    borderColor: "rgb(0, 0, 0)",
                    borderWidth: 1,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false,
                    showLine: true,
                    order: 0
                },
                {
                    label: "Sedikit Value",
                    data: [
                        {x: chartData.persediaan.labels[0], y: persSedikitVal},
                        {x: persediaanX, y: persSedikitVal}
                    ],
                    parsing: false,
                    borderColor: "red",
                    borderWidth: 1,
                    borderDash: [2, 2],
                    pointRadius: 0,
                    fill: false,
                    showLine: true,
                    order: 1
                },
                {
                    label: "Banyak Value",
                    data: [
                        {x: chartData.persediaan.labels[chartData.persediaan.labels.length-1], y: persBanyakVal},
                        {x: persediaanX, y: persBanyakVal}
                    ],
                    parsing: false,
                    borderColor: "red",
                    borderWidth: 1,
                    borderDash: [2, 2],
                    pointRadius: 0,
                    fill: false,
                    showLine: true,
                    order: 1
                },
                {
                    label: "Sedikit Label",
                    data: [{x: persediaanX, y: persSedikitVal}],
                    parsing: false,
                    borderColor: "red",
                    backgroundColor: "red",
                    pointRadius: 6,
                    pointStyle: "circle",
                    showLine: false
                },
                {
                    label: "Banyak Label",
                    data: [{x: persediaanX, y: persBanyakVal}],
                    parsing: false,
                    borderColor: "red",
                    backgroundColor: "red",
                    pointRadius: 6,
                    pointStyle: "circle",
                    showLine: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: "Fungsi Keanggotaan Variabel Persediaan",
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                tooltip: {
                    enabled: false
                },
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 20,
                        usePointStyle: true
                    }
                },
                datalabels: {
                    display: true,
                    align: "left",
                    color: "red",
                    font: { weight: "bold", size: 14 },
                    formatter: function(value, ctx) {
                        if (ctx.dataset.label === "Sedikit Label") return persSedikitVal.toFixed(3);
                        if (ctx.dataset.label === "Banyak Label") return persBanyakVal.toFixed(3);
                        return null;
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Nilai Persediaan",
                        font: { weight: 'bold' }
                    },
                    type: "linear",
                    min: chartData.persediaan.labels[0],
                    max: chartData.persediaan.labels[chartData.persediaan.labels.length-1],
                    ticks: { precision: 0 }
                },
                y: {
                    title: {
                        display: true,
                        text: "Derajat Keanggotaan",
                        font: { weight: 'bold' }
                    },
                    min: 0,
                    max: 1,
                    ticks: { stepSize: 0.2 }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
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
    const calculateBtn = document.getElementById("calculateBtn");
    if (calculateBtn) {
        calculateBtn.addEventListener("click", hitungSemua);
    }

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