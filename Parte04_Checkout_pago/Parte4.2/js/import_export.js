const ADMIN_STORAGE_KEY = "malystore_admin_products";

window.exportProducts = function exportProducts() {
  const data = localStorage.getItem(ADMIN_STORAGE_KEY) || "[]";
  const blob = new Blob([data], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "productos-malystore.json";
  a.click();
  URL.revokeObjectURL(url);
  if (window.showToast) showToast("Productos exportados correctamente", "success");
};

window.importProducts = function importProducts(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      JSON.parse(e.target.result);
      localStorage.setItem(ADMIN_STORAGE_KEY, e.target.result);
      if (window.showToast) showToast("Productos importados correctamente", "success");
      setTimeout(() => location.reload(), 600);
    } catch {
      if (window.showToast) showToast("El JSON no es válido", "error");
    }
  };
  reader.readAsText(file);
};
