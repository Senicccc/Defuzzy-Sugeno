// Variabel untuk menyimpan chart dan plot
let permintaanChart, persediaanChart, rulesChart, rulesPieChart;
let surfacePlotInstance, contourPlotInstance;

// Fungsi untuk validasi input
function validateInputs() {
  let isValid = true;

  // Reset error messages
  document
    .querySelectorAll(".error-message")
    .forEach((el) => (el.textContent = ""));
  document
    .querySelectorAll("input")
    .forEach((el) => el.classList.remove("input-error"));

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
    document.getElementById("varPermMinError").textContent =
      "Minimum harus kurang dari maksimum";
    document.getElementById("varPermMin").classList.add("input-error");
    isValid = false;
  }

  if (varPersMin >= varPersMax) {
    document.getElementById("varPersMinError").textContent =
      "Minimum harus kurang dari maksimum";
    document.getElementById("varPersMin").classList.add("input-error");
    isValid = false;
  }

  if (varProdMin >= varProdMax) {
    document.getElementById("varProdMinError").textContent =
      "Minimum harus kurang dari maksimum";
    document.getElementById("varProdMin").classList.add("input-error");
    isValid = false;
  }

  // Validasi nilai input berada dalam rentang
  if (permintaanX < varPermMin || permintaanX > varPermMax) {
    document.getElementById(
      "permintaanXError"
    ).textContent = `Nilai harus antara ${varPermMin} dan ${varPermMax}`;
    document.getElementById("permintaanX").classList.add("input-error");
    isValid = false;
  }

  if (persediaanX < varPersMin || persediaanX > varPersMax) {
    document.getElementById(
      "persediaanXError"
    ).textContent = `Nilai harus antara ${varPersMin} dan ${varPersMax}`;
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
  const clampedPermintaanX = Math.max(
    varPermMin,
    Math.min(varPermMax, permintaanX)
  );
  const clampedPersediaanX = Math.max(
    varPersMin,
    Math.min(varPersMax, persediaanX)
  );

  // Hitung derajat keanggotaan permintaan
  const permTurun =
    (varPermMax - clampedPermintaanX) / (varPermMax - varPermMin);
  const permNaik =
    (clampedPermintaanX - varPermMin) / (varPermMax - varPermMin);

  // Hitung derajat keanggotaan persediaan
  const persSedikit =
    (varPersMax - clampedPersediaanX) / (varPersMax - varPersMin);
  const persBanyak =
    (clampedPersediaanX - varPersMin) / (varPersMax - varPersMin);

  // Update tampilan (tanpa desimal)
  document.getElementById("permTurun").textContent = Math.round(
    Math.max(0, Math.min(1, permTurun)) * 100
  );
  document.getElementById("permNaik").textContent = Math.round(
    Math.max(0, Math.min(1, permNaik) * 100)
  );
  document.getElementById("persSedikit").textContent = Math.round(
    Math.max(0, Math.min(1, persSedikit) * 100)
  );
  document.getElementById("persBanyak").textContent = Math.round(
    Math.max(0, Math.min(1, persBanyak) * 100)
  );

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
  document.getElementById("prodBerkurang").textContent =
    prodBerkurang.toFixed(4);
  document.getElementById("prodBertambah").textContent =
    prodBertambah.toFixed(4);

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
  let nilaiSugeno =
    denominator !== 0 ? numerator / denominator : (varProdMin + varProdMax) / 2;
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

  // Hitung margin kiri dan kanan agar simetris
  const permMargin = varPermMin; // margin kiri = varPermMin, kanan = varPermMin
  const permStart = varPermMin - permMargin;
  const permEnd = varPermMax + permMargin;

  const persMargin = varPersMin;
  const persStart = varPersMin - persMargin;
  const persEnd = varPersMax + persMargin;

  // Data permintaan
  const permLabels = [];
  const permTurunData = [];
  const permNaikData = [];
  const permInputLine = [];
  const stepPerm = (permEnd - permStart) / 100;
  for (let x = permStart; x <= permEnd; x += stepPerm) {
    permLabels.push(Math.round(x));
    permTurunData.push(
      x < varPermMin
        ? 1
        : x > varPermMax
        ? 0
        : Math.max(0, Math.min(1, (varPermMax - x) / (varPermMax - varPermMin)))
    );
    permNaikData.push(
      x < varPermMin
        ? 0
        : x > varPermMax
        ? 1
        : Math.max(0, Math.min(1, (x - varPermMin) / (varPermMax - varPermMin)))
    );
    permInputLine.push(Math.abs(x - permintaanX) < stepPerm ? 1 : null);
  }
  // Titik ekstra di ujung kanan
  permLabels.push(Math.round(permEnd + stepPerm));
  permTurunData.push(0);
  permNaikData.push(1);

  // Data persediaan
  const persLabels = [];
  const persSedikitData = [];
  const persBanyakData = [];
  const persInputLine = [];
  const stepPers = (persEnd - persStart) / 100;
  for (let x = persStart; x <= persEnd; x += stepPers) {
    persLabels.push(Math.round(x));
    persSedikitData.push(
      x < varPersMin
        ? 1
        : x > varPersMax
        ? 0
        : Math.max(0, Math.min(1, (varPersMax - x) / (varPersMax - varPersMin)))
    );
    persBanyakData.push(
      x < varPersMin
        ? 0
        : x > varPersMax
        ? 1
        : Math.max(0, Math.min(1, (x - varPersMin) / (varPersMax - varPersMin)))
    );
    persInputLine.push(Math.abs(x - persediaanX) < stepPers ? 1 : null);
  }
  persLabels.push(Math.round(persEnd + stepPers));
  persSedikitData.push(0);
  persBanyakData.push(1);

  return {
    permintaan: {
      labels: permLabels,
      turun: permTurunData,
      naik: permNaikData,
      inputX: permintaanX,
      inputLine: permInputLine,
      min: permStart,
      max: permEnd,
    },
    persediaan: {
      labels: persLabels,
      sedikit: persSedikitData,
      banyak: persBanyakData,
      inputX: persediaanX,
      inputLine: persInputLine,
      min: persStart,
      max: persEnd,
    },
  };
}

// Fungsi untuk memperbarui chart
function updateCharts() {
  const chartData = prepareChartData();
  const nilaiR1 = parseFloat(
    document.getElementById("nilaiR1").textContent || 0
  );
  const nilaiR2 = parseFloat(
    document.getElementById("nilaiR2").textContent || 0
  );
  const nilaiR3 = parseFloat(
    document.getElementById("nilaiR3").textContent || 0
  );
  const nilaiR4 = parseFloat(
    document.getElementById("nilaiR4").textContent || 0
  );

  // Hancurkan chart yang ada jika sudah ada
  if (permintaanChart) permintaanChart.destroy();
  if (persediaanChart) persediaanChart.destroy();
  if (rulesChart) rulesChart.destroy();
  if (rulesPieChart) rulesPieChart.destroy();

  // Buat chart permintaan
  const permintaanCtx = document
    .getElementById("permintaanChart")
    .getContext("2d");
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
          tension: 0.1,
          fill: true,
          pointRadius: 4,         // <--- tambah ini
          borderWidth: 3,         // <--- tambah ini
        },
        {
          label: "Naik",
          data: chartData.permintaan.naik,
          borderColor: "rgb(54, 162, 235)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          tension: 0.4,
          fill: true,
          pointRadius: 0,        
          borderWidth: 4, 
        },
        {
          label: "Nilai Input",
          data: [
            { x: chartData.permintaan.inputX, y: 0 },
            { x: chartData.permintaan.inputX, y: 1 },
          ],
          borderColor: "rgb(0, 0, 0)",
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 5,
          fill: false,
          showLine: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Fungsi Keanggotaan Permintaan",
          font: {
            size: 16,
            weight: "bold",
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              // Jika dataset label "Nilai Input", tampilkan x dan y
              if (context.dataset.label === "Nilai Input") {
                return (
                  "Nilai Input: x = " +
                  context.parsed.x +
                  ", y = " +
                  Math.round(context.parsed.y * 100) +
                  "%"
                );
              }
              // Dataset lain (fungsi keanggotaan)
              return (
                context.dataset.label +
                ": " +
                Math.round(context.raw * 100) +
                "%"
              );
            },
          },
        },
        legend: {
          labels: {
            boxWidth: 12,
            padding: 20,
          },
        },
      },
      scales: {
        x: {
          type: "linear",
          min: chartData.permintaan.min,
          max: chartData.permintaan.max,
          title: {
            display: true,
            text: "Nilai Permintaan",
            font: {
              weight: "bold",
            },
          },
          ticks: {
            precision: 0,
          },
        },
        y: {
          title: {
            display: true,
            text: "Derajat Keanggotaan",
            font: {
              weight: "bold",
            },
          },
          min: 0,
          max: 1,
          ticks: {
            callback: function (value) {
              return Math.round(value * 100) + "%";
            },
          },
        },
      },
    },
  });

  // Buat chart persediaan
  const persediaanCtx = document
    .getElementById("persediaanChart")
    .getContext("2d");
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
          tension: 0.4,
          fill: true,
          pointRadius: 0,        
          borderWidth: 4,        
        },
        {
          label: "Banyak",
          data: chartData.persediaan.banyak,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.4,
          fill: true,
          pointRadius: 0,        
          borderWidth: 4,      
        },
        {
          label: "Nilai Input",
          data: [
            { x: chartData.persediaan.inputX, y: 0 },
            { x: chartData.persediaan.inputX, y: 1 },
          ],
          borderColor: "rgb(0, 0, 0)",
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 5,
          fill: false,
          showLine: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Fungsi Keanggotaan Persediaan",
          font: {
            size: 16,
            weight: "bold",
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              // Jika dataset label "Nilai Input", tampilkan x dan y
              if (context.dataset.label === "Nilai Input") {
                return (
                  "Nilai Input: x = " +
                  context.parsed.x +
                  ", y = " +
                  Math.round(context.parsed.y * 100) +
                  "%"
                );
              }
              // Dataset lain (fungsi keanggotaan)
              return (
                context.dataset.label +
                ": " +
                Math.round(context.raw * 100) +
                "%"
              );
            },
          },
        },
        legend: {
          labels: {
            boxWidth: 12,
            padding: 20,
          },
        },
      },
      scales: {
        x: {
          type: "linear",
          min: chartData.persediaan.min,
          max: chartData.persediaan.max,
          title: {
            display: true,
            text: "Nilai Persediaan",
            font: {
              weight: "bold",
            },
          },
          ticks: {
            precision: 0,
          },
        },
        y: {
          title: {
            display: true,
            text: "Derajat Keanggotaan",
            font: {
              weight: "bold",
            },
          },
          min: 0,
          max: 1,
          ticks: {
            callback: function (value) {
              return Math.round(value * 100) + "%";
            },
          },
        },
      },
    },
  });

  // Buat chart aturan fuzzy (bar chart)
  const rulesCtx = document.getElementById("rulesChart").getContext("2d");
  rulesChart = new Chart(rulesCtx, {
    type: "bar",
    data: {
      labels: ["R1", "R2", "R3", "R4"],
      datasets: [
        {
          label: "Nilai α-predikat",
          data: [nilaiR1, nilaiR2, nilaiR3, nilaiR4],
          backgroundColor: [
            "rgba(255, 99, 132, 0.7)",
            "rgba(54, 162, 235, 0.7)",
            "rgba(255, 206, 86, 0.7)",
            "rgba(75, 192, 192, 0.7)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Nilai α-predikat untuk Setiap Aturan",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 1,
          title: {
            display: true,
            text: "Nilai α-predikat",
          },
        },
      },
    },
  });

  // Buat pie chart aturan fuzzy
  const rulesPieCtx = document.getElementById("rulesPieChart").getContext("2d");
  rulesPieChart = new Chart(rulesPieCtx, {
    type: "pie",
    data: {
      labels: [
        "R1: Turun & Banyak",
        "R2: Turun & Sedikit",
        "R3: Naik & Banyak",
        "R4: Naik & Sedikit",
      ],
      datasets: [
        {
          data: [nilaiR1, nilaiR2, nilaiR3, nilaiR4],
          backgroundColor: [
            "rgba(255, 99, 132, 0.7)",
            "rgba(54, 162, 235, 0.7)",
            "rgba(255, 206, 86, 0.7)",
            "rgba(75, 192, 192, 0.7)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Distribusi Kontribusi Aturan Fuzzy",
        },
        legend: {
          position: "right",
        },
      },
    },
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
      let nilaiSugeno =
        denominator !== 0
          ? numerator / denominator
          : (varProdMin + varProdMax) / 2;
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
  const { permTurun, permNaik, persSedikit, persBanyak } =
    hitungDerajatKeanggotaan();
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
