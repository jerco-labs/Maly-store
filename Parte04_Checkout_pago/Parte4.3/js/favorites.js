
const FAVORITES_KEY = "malystore_favorites";
const baseCartKey = "malystore_cart";

function formatMoney(v){ return `S/ ${Number(v||0).toFixed(2)}`; }

function getFavorites(){
  return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
}

function setFavorites(list){
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
}

function getProducts(){
  return fetch("../data/productos.json").then(r => r.json()).catch(() => []);
}

function addToCart(product){
  const cart = JSON.parse(localStorage.getItem(baseCartKey) || "[]");
  const found = cart.find(item => item.id === product.id);
  if(found) found.qty += 1;
  else cart.push({id: product.id, nombre: product.nombre, precio: product.precio, qty: 1});
  localStorage.setItem(baseCartKey, JSON.stringify(cart));
  if (window.showToast) showToast("Agregado al carrito", "success");
}

function card(product){
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
        <span class="old-price">${formatMoney(product.precioAnterior)}</span>
        <span class="price">${formatMoney(product.precio)}</span>
      </div>
      <p class="hero__text">${product.descripcion}</p>
      <div style="display:flex;gap:.6rem;flex-wrap:wrap">
        <button class="btn btn--primary" data-cart="${product.id}" type="button">Carrito</button>
        <button class="btn btn--secondary" data-unfav="${product.id}" type="button">Quitar</button>
      </div>
    </article>
  `;
}

async function renderFavorites(){
  const grid = document.getElementById("favoritesGrid");
  if(!grid) return;
  const ids = getFavorites();
  const products = await getProducts();
  const list = products.filter(p => ids.includes(p.id));
  grid.innerHTML = list.length ? list.map(card).join("") : `<div class="favorite-empty">Aún no tienes favoritos guardados.</div>`;
}

document.addEventListener("click", (e) => {
  const unfavBtn = e.target.closest("[data-unfav]");
  const cartBtn = e.target.closest("[data-cart]");
  if(unfavBtn){
    const id = unfavBtn.dataset.unfav;
    const next = getFavorites().filter(x => x !== id);
    setFavorites(next);
    renderFavorites();
    if (window.showToast) showToast("Quitado de favoritos", "info");
  }
  if(cartBtn){
    getProducts().then(products => {
      const product = products.find(p => p.id === cartBtn.dataset.cart);
      if(product) addToCart(product);
    });
  }
  if(e.target.id === "clearFavoritesBtn"){
    setFavorites([]);
    renderFavorites();
    if (window.showToast) showToast("Favoritos vaciados", "info");
  }
});

renderFavorites();
