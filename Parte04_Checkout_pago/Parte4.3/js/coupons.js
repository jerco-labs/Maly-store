
const COUPON_KEY = "malystore_coupon";
const COUPON_VALUES = {
  "MALY10": 0.10,
  "NUEVA10": 0.10,
  "ENVIOFREE": 0.05
};

function money(n){ return `S/ ${Number(n).toFixed(2)}`; }

function getCart(){
  return JSON.parse(localStorage.getItem("malystore_cart") || "[]");
}

function getCoupon(){
  return localStorage.getItem(COUPON_KEY) || "";
}

function getDiscountRate(code){
  return COUPON_VALUES[String(code || "").trim().toUpperCase()] || 0;
}

function calcSubtotal(){
  return getCart().reduce((acc, item) => acc + item.precio * item.qty, 0);
}

function updateCheckout(){
  const subtotal = calcSubtotal();
  const rate = getDiscountRate(getCoupon());
  const discount = subtotal * rate;
  const total = subtotal - discount;

  const subtotalEl = document.getElementById("checkoutSubtotal");
  const discountEl = document.getElementById("checkoutDiscount");
  const totalEl = document.getElementById("checkoutTotal");
  const listEl = document.getElementById("checkoutCartList");

  if (subtotalEl) subtotalEl.textContent = money(subtotal);
  if (discountEl) discountEl.textContent = money(discount);
  if (totalEl) totalEl.textContent = money(total);

  if (listEl) {
    const cart = getCart();
    if (!cart.length) {
      listEl.innerHTML = `<div class="contact-card page-card"><p>Tu carrito está vacío. Regresa a la tienda y agrega productos.</p></div>`;
      return;
    }
    listEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div>
          <strong>${item.nombre}</strong>
          <div class="hero__text">${money(item.precio)} × ${item.qty}</div>
        </div>
        <div><strong>${money(item.precio * item.qty)}</strong></div>
      </div>
    `).join("");
  }
}

function applyCoupon(){
  const input = document.getElementById("couponInput");
  const msg = document.getElementById("couponMessage");
  const code = String(input?.value || "").trim().toUpperCase();
  if (!code) {
    if (msg) msg.textContent = "Escribe un cupón para aplicarlo.";
    return;
  }
  if (COUPON_VALUES[code]) {
    localStorage.setItem(COUPON_KEY, code);
    if (msg) msg.textContent = `Cupón ${code} aplicado correctamente.`;
    if (window.showToast) showToast(`Cupón ${code} aplicado`, "success");
  } else {
    localStorage.removeItem(COUPON_KEY);
    if (msg) msg.textContent = "Cupón no válido. Prueba con MALY10 o NUEVA10.";
    if (window.showToast) showToast("Cupón no válido", "error");
  }
  updateCheckout();
}

function checkoutWhatsApp(){
  const cart = getCart();
  const subtotal = calcSubtotal();
  const rate = getDiscountRate(getCoupon());
  const discount = subtotal * rate;
  const total = subtotal - discount;
  const lines = cart.map(item => `• ${item.nombre} x${item.qty} - ${money(item.precio * item.qty)}`).join("%0A");
  const couponText = getCoupon() ? `%0ACupón: ${getCoupon()} (-${Math.round(rate*100)}%)` : "";
  const text = `Hola, quiero comprar:%0A%0A${lines}%0A%0ASubtotal: ${money(subtotal)}%0ADescuento: ${money(discount)}${couponText}%0ATotal estimado: ${money(total)}%0AQuiero coordinar la entrega.`;
  window.open(`https://wa.me/51999999999?text=${encodeURIComponent(text)}`, "_blank");
}

document.addEventListener("click", (e) => {
  if (e.target.id === "applyCouponBtn") applyCoupon();
  if (e.target.id === "checkoutWhatsAppBtn") checkoutWhatsApp();
});

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("couponInput");
  if (input) input.value = getCoupon();
  updateCheckout();
});
