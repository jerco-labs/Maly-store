const ADMIN_KEY = "malystore_admin_products";
const BASE_KEY = "malystore_base_products";

let adminProducts = [];

function cloneProducts(list) {
  return JSON.parse(JSON.stringify(list));
}

async function loadBaseProducts() {
  try {
    const path = location.pathname.includes("/pages/") ? "../data/productos.json" : "./data/productos.json";
    const res = await fetch(path);
    return await res.json();
  } catch {
    return [];
  }
}

function getStoredProducts() {
  const raw = localStorage.getItem(ADMIN_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setStoredProducts(products) {
  localStorage.setItem(ADMIN_KEY, JSON.stringify(products));
}

function formatMoney(value) {
  return `S/ ${Number(value || 0).toFixed(2)}`;
}

function getImageFallback(category) {
  const fallback = {
    labiales: "../img/producto-labial-rosa.svg",
    encajes: "../img/producto-brasier.svg",
    zapatillas: "../img/producto-zapatilla.svg",
  };
  return fallback[category] || "../img/producto-labial-rosa.svg";
}

function productCard(item) {
  return `
    <article class="admin-item">
      <div class="admin-item__img">
        <img src="${item.imagen || getImageFallback(item.categoria)}" alt="${item.nombre}" loading="lazy">
      </div>
      <div>
        <strong>${item.nombre}</strong>
        <div class="admin-item__meta">
          <span>${item.categoria}</span>
          <span>${item.marca}</span>
          <span>${item.color}</span>
          <span>${item.talla || "Sin talla"}</span>
        </div>
        <div class="admin-item__meta">
          <span>${formatMoney(item.precio)}</span>
          <span>Stock: ${item.stock ?? 0}</span>
          <span>${item.destacado ? "Destacado" : "Normal"}</span>
        </div>
      </div>
      <div class="admin-actions">
        <button class="admin-mini" data-edit="${item.id}" type="button">Editar</button>
        <button class="admin-mini admin-mini--danger" data-delete="${item.id}" type="button">Eliminar</button>
      </div>
    </article>
  `;
}

function renderStats() {
  const stats = document.getElementById("adminStats");
  if (!stats) return;
  const total = adminProducts.length;
  const featured = adminProducts.filter(p => p.destacado).length;
  const categories = new Set(adminProducts.map(p => p.categoria)).size;

  stats.innerHTML = `
    <div class="stat"><strong>${total}</strong><br><span>Productos</span></div>
    <div class="stat"><strong>${featured}</strong><br><span>Destacados</span></div>
    <div class="stat"><strong>${categories}</strong><br><span>Categorías</span></div>
  `;
}

function renderAdminList() {
  const list = document.getElementById("adminList");
  if (!list) return;

  const search = (document.getElementById("adminSearch")?.value || "").toLowerCase();
  const category = document.getElementById("adminCategory")?.value || "";

  let filtered = adminProducts.filter(item => {
    const haystack = `${item.nombre} ${item.marca} ${item.color} ${item.subcategoria} ${item.categoria}`.toLowerCase();
    const matchSearch = !search || haystack.includes(search);
    const matchCategory = !category || item.categoria === category;
    return matchSearch && matchCategory;
  });

  list.innerHTML = filtered.length
    ? filtered.map(productCard).join("")
    : `<div class="page-card"><p>No se encontraron productos.</p></div>`;

  renderStats();
}

function clearForm() {
  document.getElementById("productForm")?.reset();
  const image = document.getElementById("imagen");
  if (image) image.value = "../img/producto-labial-rosa.svg";
}

function readForm() {
  return {
    id: crypto.randomUUID(),
    nombre: document.getElementById("nombre").value.trim(),
    categoria: document.getElementById("categoria").value,
    subcategoria: document.getElementById("subcategoria").value.trim(),
    marca: document.getElementById("marca").value.trim(),
    color: document.getElementById("color").value.trim(),
    talla: document.getElementById("talla").value.trim(),
    precio: Number(document.getElementById("precio").value),
    precioAnterior: Number(document.getElementById("precioAnterior").value || 0),
    stock: Number(document.getElementById("stock").value),
    descripcion: document.getElementById("descripcion").value.trim(),
    imagen: document.getElementById("imagen").value.trim() || getImageFallback(document.getElementById("categoria").value),
    destacado: document.getElementById("destacado").checked,
  };
}

function bindEvents() {
  const form = document.getElementById("productForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const newProduct = readForm();
      adminProducts.unshift(newProduct);
      setStoredProducts(adminProducts);
      renderAdminList();
      clearForm();
    });
  }

  document.addEventListener("click", (e) => {
    const editBtn = e.target.closest("[data-edit]");
    const deleteBtn = e.target.closest("[data-delete]");
    const resetBtn = e.target.closest("#resetProducts");

    if (deleteBtn) {
      const id = deleteBtn.dataset.delete;
      adminProducts = adminProducts.filter(item => item.id !== id);
      setStoredProducts(adminProducts);
      renderAdminList();
    }

    if (editBtn) {
      const id = editBtn.dataset.edit;
      const item = adminProducts.find(p => p.id === id);
      if (!item) return;

      document.getElementById("nombre").value = item.nombre || "";
      document.getElementById("categoria").value = item.categoria || "labiales";
      document.getElementById("subcategoria").value = item.subcategoria || "";
      document.getElementById("marca").value = item.marca || "";
      document.getElementById("color").value = item.color || "";
      document.getElementById("talla").value = item.talla || "";
      document.getElementById("precio").value = item.precio ?? "";
      document.getElementById("precioAnterior").value = item.precioAnterior ?? "";
      document.getElementById("stock").value = item.stock ?? "";
      document.getElementById("descripcion").value = item.descripcion || "";
      document.getElementById("imagen").value = item.imagen || "";
      document.getElementById("destacado").checked = !!item.destacado;

      adminProducts = adminProducts.filter(p => p.id !== id);
      setStoredProducts(adminProducts);
      renderAdminList();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (resetBtn) {
      if (confirm("¿Restaurar la base original de productos?")) {
        loadBaseProducts().then(base => {
          adminProducts = cloneProducts(base);
          setStoredProducts(adminProducts);
          renderAdminList();
        });
      }
    }
  });

  ["adminSearch", "adminCategory"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", renderAdminList);
    if (el) el.addEventListener("change", renderAdminList);
  });
}

async function initAdmin() {
  const base = await loadBaseProducts();
  const stored = getStoredProducts();
  adminProducts = Array.isArray(stored) ? stored : cloneProducts(base);
  if (!stored) setStoredProducts(adminProducts);
  renderAdminList();
  bindEvents();
}

initAdmin();
