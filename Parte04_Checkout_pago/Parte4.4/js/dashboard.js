const salesData = {
  7: [
    { day: "Lun", value: 1240 },
    { day: "Mar", value: 980 },
    { day: "Mié", value: 1560 },
    { day: "Jue", value: 1380 },
    { day: "Vie", value: 2190 },
    { day: "Sáb", value: 2410 },
    { day: "Dom", value: 1750 },
  ],
  14: [
    { day: "S1", value: 980 },
    { day: "S2", value: 1220 },
    { day: "S3", value: 1600 },
    { day: "S4", value: 1350 },
    { day: "S5", value: 1980 },
    { day: "S6", value: 2150 },
    { day: "S7", value: 1740 },
    { day: "S8", value: 1870 },
    { day: "S9", value: 2280 },
    { day: "S10", value: 2520 },
    { day: "S11", value: 2310 },
    { day: "S12", value: 2690 },
    { day: "S13", value: 2410 },
    { day: "S14", value: 2860 },
  ],
  30: [
    { day: "1", value: 850 },
    { day: "2", value: 920 },
    { day: "3", value: 1110 },
    { day: "4", value: 1280 },
    { day: "5", value: 1040 },
    { day: "6", value: 990 },
    { day: "7", value: 1460 },
    { day: "8", value: 1310 },
    { day: "9", value: 1580 },
    { day: "10", value: 1740 },
    { day: "11", value: 1620 },
    { day: "12", value: 1890 },
    { day: "13", value: 1980 },
    { day: "14", value: 2150 },
    { day: "15", value: 2040 },
    { day: "16", value: 2230 },
    { day: "17", value: 2400 },
    { day: "18", value: 2310 },
    { day: "19", value: 2540 },
    { day: "20", value: 2680 },
    { day: "21", value: 2490 },
    { day: "22", value: 2750 },
    { day: "23", value: 2900 },
    { day: "24", value: 2820 },
    { day: "25", value: 3100 },
    { day: "26", value: 2940 },
    { day: "27", value: 3210 },
    { day: "28", value: 3080 },
    { day: "29", value: 3320 },
    { day: "30", value: 3490 },
  ]
};

const products = [
  { name: "Zapatillas urbanas", detail: "42 ventas · Rotación alta", score: "S/ 8,940" },
  { name: "Polos básicos", detail: "31 ventas · Buen margen", score: "S/ 4,760" },
  { name: "Accesorios smart", detail: "18 ventas · Crecimiento", score: "S/ 3,210" },
  { name: "Mochilas", detail: "15 ventas · Stock estable", score: "S/ 2,980" },
];

const orders = [
  { id: "MS-1045", customer: "Ana Torres", status: "Entregado", amount: 189.90 },
  { id: "MS-1046", customer: "Luis Ramírez", status: "En proceso", amount: 249.00 },
  { id: "MS-1047", customer: "Carla Díaz", status: "Pendiente", amount: 129.50 },
  { id: "MS-1048", customer: "José Rojas", status: "Entregado", amount: 349.90 },
  { id: "MS-1049", customer: "María Vega", status: "En proceso", amount: 219.00 },
];

const els = {
  salesToday: document.getElementById("salesToday"),
  ordersActive: document.getElementById("ordersActive"),
  stockCount: document.getElementById("stockCount"),
  newCustomers: document.getElementById("newCustomers"),
  chart: document.getElementById("salesChart"),
  topProducts: document.getElementById("topProducts"),
  ordersTable: document.getElementById("ordersTable"),
  searchInput: document.getElementById("searchInput"),
  periodFilter: document.getElementById("periodFilter"),
  refreshBtn: document.getElementById("refreshBtn"),
  lastSync: document.getElementById("lastSync"),
};

function money(value) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function renderMetrics() {
  const data = salesData[7];
  const total = data.reduce((acc, item) => acc + item.value, 0);
  els.salesToday.textContent = money(4820);
  els.ordersActive.textContent = "14";
  els.stockCount.textContent = "286";
  els.newCustomers.textContent = "27";
}

function renderProducts() {
  els.topProducts.innerHTML = products.map((product, index) => `
    <li>
      <div>
        <strong>${index + 1}. ${product.name}</strong>
        <span>${product.detail}</span>
      </div>
      <div class="score">${product.score}</div>
    </li>
  `).join("");
}

function renderOrders(filter = "") {
  const term = filter.trim().toLowerCase();
  const visible = orders.filter(order =>
    !term ||
    order.id.toLowerCase().includes(term) ||
    order.customer.toLowerCase().includes(term) ||
    order.status.toLowerCase().includes(term)
  );

  els.ordersTable.innerHTML = visible.map(order => {
    const statusClass =
      order.status === "Entregado" ? "entregado" :
      order.status === "En proceso" ? "proceso" : "pendiente";

    return `
      <tr>
        <td>${order.id}</td>
        <td>${order.customer}</td>
        <td><span class="status ${statusClass}">${order.status}</span></td>
        <td>${money(order.amount)}</td>
      </tr>
    `;
  }).join("") || `
    <tr>
      <td colspan="4">No hay resultados para esta búsqueda.</td>
    </tr>
  `;
}

function renderChart(period = 7) {
  const data = salesData[period];
  const max = Math.max(...data.map(item => item.value));
  els.chart.innerHTML = data.map(item => {
    const height = Math.max((item.value / max) * 260, 20);
    return `
      <div class="bar-group">
        <div class="bar-value">${money(item.value)}</div>
        <div class="bar" style="height:${height}px" title="${item.day}: ${money(item.value)}"></div>
        <div class="bar-label">${item.day}</div>
      </div>
    `;
  }).join("");
}

function refreshDashboard() {
  const now = new Date();
  els.lastSync.textContent = now.toLocaleString("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
  });

  renderMetrics();
  renderProducts();
  renderOrders(els.searchInput.value);
  renderChart(Number(els.periodFilter.value));
}

els.searchInput.addEventListener("input", (event) => renderOrders(event.target.value));
els.periodFilter.addEventListener("change", (event) => renderChart(Number(event.target.value)));
els.refreshBtn.addEventListener("click", refreshDashboard);

refreshDashboard();
