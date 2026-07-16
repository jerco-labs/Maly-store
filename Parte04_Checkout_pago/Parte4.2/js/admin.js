const ADMIN_KEY = "malystore_admin_products";

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

function applyFilters(list) {
  const search = (document.getElementById("adminSearch")?.value || "").toLowerCase();
  const category = document.getElementById("adminCategory")?.value || "";
  const sort = document.getElementById("adminSort")?.value || "";
  let filtered = list.filter(item => {
    const haystack = `${item.nombre} ${item.marca} ${item.color} ${item.subcategoria} ${item.categoria}`.toLowerCase();
    return (!search || haystack.includes(search)) && (!category || item.categoria === category);
  });
  if (sort === "priceAsc") filtered.sort((a, b) => a.precio - b.precio);
  if (sort === "priceDesc") filtered.sort((a, b) => b.precio - a.precio);
  if (sort === "nameAsc") filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
  if (sort === "nameDesc") filtered.sort((a, b) => b.nombre.localeCompare(a.nombre));
  return filtered;
}

function renderAdminList() {
  const list = document.getElementById("adminList");
  if (!list) return;
  const filtered = applyFilters(adminProducts);
  list.innerHTML = filtered.length ? filtered.map(productCard).join("") : `<div class="page-card"><p>No se encontraron productos.</p></div>`;
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

function fillForm(item) {
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
      if (window.showToast) showToast("Producto guardado", "success");
    });
  }

  document.getElementById("clearFormBtn")?.addEventListener("click", () => {
    clearForm();
    if (window.showToast) showToast("Formulario limpiado", "info");
  });

  document.getElementById("exportProductsBtn")?.addEventListener("click", () => {
    window.exportProducts && exportProducts();
  });

  document.getElementById("importProductsInput")?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    window.importProducts && importProducts(file);
    e.target.value = "";
  });

  document.addEventListener("click", (e) => {
    const editBtn = e.target.closest("[data-edit]");
    const deleteBtn = e.target.closest("[data-delete]");
    const resetBtn = e.target.closest("#resetProducts");

    if (deleteBtn) {
      adminProducts = adminProducts.filter(item => item.id !== deleteBtn.dataset.delete);
      setStoredProducts(adminProducts);
      renderAdminList();
      if (window.showToast) showToast("Producto eliminado", "info");
    }

    if (editBtn) {
      const item = adminProducts.find(p => p.id === editBtn.dataset.edit);
      if (!item) return;
      fillForm(item);
      adminProducts = adminProducts.filter(p => p.id !== item.id);
      setStoredProducts(adminProducts);
      renderAdminList();
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (window.showToast) showToast("Producto cargado para edición", "info");
    }

    if (resetBtn) {
      if (confirm("¿Restaurar la base original de productos?")) {
        loadBaseProducts().then(base => {
          adminProducts = cloneProducts(base);
          setStoredProducts(adminProducts);
          renderAdminList();
          if (window.showToast) showToast("Base restaurada", "success");
        });
      }
    }
  });

  ["adminSearch", "adminCategory", "adminSort"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", renderAdminList);
      el.addEventListener("change", renderAdminList);
    }
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
