
const money = n => `S/ ${Number(n).toFixed(2)}`;
const cartKey = "malystore_cart";
const themeKey = "malystore_theme";

const state = {
  products: [],
  cart: JSON.parse(localStorage.getItem(cartKey) || "[]"),
};

function saveCart() {
  localStorage.setItem(cartKey, JSON.stringify(state.cart));
  updateCartCount();
}

function updateCartCount() {
  const count = state.cart.reduce((acc, item) => acc + item.qty, 0);
  document.querySelectorAll("#cartCount").forEach(el => el.textContent = count);
}

function loadTheme() {
  const theme = localStorage.getItem(themeKey) || "light";
  document.documentElement.dataset.theme = theme;
}

function toggleTheme() {
  const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem(themeKey, next);
}

function productCard(product) {
  return `
    <article class="product-card">
      <div class="product-card__img">
        <img src="${product.imagen}" alt="${product.nombre}" loading="lazy">
      </div>
      <h3 class="product-card__title">${product.nombre}</h3>
      <div class="product-card__meta">
        <span>${product.marca}</span>
        <span>${product.color}</span>
      </div>
      <div class="product-card__meta">
        <span class="old-price">${money(product.precioAnterior)}</span>
        <span class="price">${money(product.precio)}</span>
      </div>
      <p class="hero__text">${product.descripcion}</p>
      <div style="display:flex;gap:.6rem;flex-wrap:wrap">
        <button class="btn btn--primary" data-add="${product.id}" type="button">Agregar</button>
        <a class="btn btn--secondary" href="pages/checkout.html">Pagar</a>
      </div>
    </article>`;
}

function addToCart(id) {
  const product = state.products.find(p => p.id === id);
  if (!product) return;
  const found = state.cart.find(item => item.id === id);
  if (found) found.qty += 1;
  else state.cart.push({ id, nombre: product.nombre, precio: product.precio, qty: 1 });
  saveCart();
  renderCart();
}

function renderFeatured() {
  const grid = document.getElementById("featuredGrid");
  if (!grid) return;
  grid.innerHTML = state.products.filter(p => p.destacado).map(productCard).join("");
}

function renderCatalog() {
  const grid = document.getElementById("catalogGrid");
  if (!grid) return;

  const params = new URLSearchParams(location.search);
  const cat = params.get("cat") || "labiales";
  const pageTitle = document.getElementById("pageTitle");
  const pageSubtitle = document.getElementById("pageSubtitle");
  const labels = { labiales: "Labiales", encajes: "Encajes", zapatillas: "Zapatillas" };

  if (pageTitle) pageTitle.textContent = labels[cat] || "Catálogo";
  if (pageSubtitle) pageSubtitle.textContent = `Colección de ${labels[cat] || "productos"} de Maly'store.`;

  const search = (document.getElementById("searchInput")?.value || "").toLowerCase();
  const priceFilter = document.getElementById("priceFilter")?.value || "";
  let items = state.products.filter(p => p.categoria === cat);

  if (search) {
    items = items.filter(p => [p.nombre, p.color, p.marca, p.subcategoria].join(" ").toLowerCase().includes(search));
  }

  if (priceFilter === "low") items.sort((a, b) => a.precio - b.precio);
  if (priceFilter === "high") items.sort((a, b) => b.precio - a.precio);

  grid.innerHTML = items.map(productCard).join("");
}

function renderCart() {
  const list = document.getElementById("cartList");
  const totalEl = document.getElementById("cartTotal");
  if (!list || !totalEl) return;

  if (!state.cart.length) {
    list.innerHTML = `<div class="contact-card page-card"><p>Tu carrito está vacío.</p></div>`;
    totalEl.textContent = money(0);
    return;
  }

  const total = state.cart.reduce((acc, item) => acc + item.precio * item.qty, 0);
  totalEl.textContent = money(total);

  list.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <div>
        <strong>${item.nombre}</strong>
        <div class="hero__text">${money(item.precio)} × ${item.qty}</div>
      </div>
      <div><strong>${money(item.precio * item.qty)}</strong></div>
    </div>
  `).join("");
}

function checkoutWhatsApp() {
  const total = state.cart.reduce((acc, item) => acc + item.precio * item.qty, 0);
  const lines = state.cart.map(item => `• ${item.nombre} x${item.qty} - ${money(item.precio * item.qty)}`).join("%0A");
  const text = `Hola, quiero comprar:%0A%0A${lines}%0A%0ATotal estimado: ${money(total)}%0AQuiero coordinar la entrega.`;
  window.open(`https://wa.me/51999999999?text=${text}`, "_blank");
}

async function initProducts() {
  try {
    const currentPath = location.pathname.includes("/pages/");
    const path = currentPath ? "../data/productos.json" : "./data/productos.json";
    const res = await fetch(path);
    state.products = await res.json();
  } catch {
    state.products = [];
  }
  updateCartCount();
  renderFeatured();
  renderCatalog();
  renderCart();
}

function bindEvents() {
  document.addEventListener("click", (e) => {
    const addBtn = e.target.closest("[data-add]");
    if (addBtn) addToCart(addBtn.dataset.add);

    if (e.target.id === "themeToggle") toggleTheme();
    if (e.target.id === "clearCartBtn") {
      state.cart = [];
      saveCart();
      renderCart();
    }
    if (e.target.id === "checkoutBtn") checkoutWhatsApp();
  });

  document.addEventListener("input", (e) => {
    if (e.target.id === "searchInput" || e.target.id === "priceFilter") renderCatalog();
  });
}

async function main() {
  loadTheme();
  bindEvents();
  await initProducts();
  if ("serviceWorker" in navigator) {
    const swPath = location.pathname.includes("/pages/") ? "../service-worker.js" : "./service-worker.js";
    navigator.serviceWorker.register(swPath).catch(() => {});
  }
}
main();
