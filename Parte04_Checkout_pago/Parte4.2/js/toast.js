window.showToast = function showToast(message, type = "info") {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  requestAnimationFrame(() => toast.classList.add("show"));
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
};
