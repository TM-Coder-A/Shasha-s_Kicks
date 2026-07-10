let ALL_PRODUCTS = [];

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("year").textContent = new Date().getFullYear();

  await loadProducts();

  document.getElementById("productSearch").addEventListener("input", renderProducts);
  document.getElementById("categoryFilter").addEventListener("change", renderProducts);
});

async function loadProducts() {
  const status = document.getElementById("productsStatus");

  try {
    const response = await fetch("/.netlify/functions/get-products", {
      cache: "no-store"
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Could not load products.");
    }

    ALL_PRODUCTS = Array.isArray(result) ? result : [];

    populateCategories();
    renderProducts();

    status.style.display = "none";
  } catch (error) {
    console.error(error);
    status.textContent = "Products could not be loaded. Please refresh the page.";
  }
}

function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");

  const categories = [
    ...new Set(
      ALL_PRODUCTS
        .map(product => product.category)
        .filter(Boolean)
    )
  ];

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

function renderProducts() {
  const grid = document.getElementById("productsPageGrid");
  const search = document.getElementById("productSearch").value.toLowerCase();
  const category = document.getElementById("categoryFilter").value;

  const filteredProducts = ALL_PRODUCTS.filter(product => {
    const text = `
      ${product.name || ""}
      ${product.category || ""}
      ${product.price || ""}
      ${product.sizes || ""}
      ${product.description || ""}
    `.toLowerCase();

    const matchesSearch = text.includes(search);
    const matchesCategory = category === "all" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  if (!filteredProducts.length) {
    grid.innerHTML = `<div class="empty-state">No products found.</div>`;
    return;
  }

  grid.innerHTML = filteredProducts.map(product => {
    const settings = typeof skGetSettings === "function"
      ? skGetSettings()
      : {
          brandName: "Shasha's Kicks",
          whatsappNumber: "2349136515520"
        };

    const message = encodeURIComponent(
      `Hello ${settings.brandName}, I am interested in ${product.name}. Please confirm price, sizes and availability.`
    );

    return `
      <article class="managed-product-card">
        <img
          src="${escapeHTML(product.image_url || "assets/shashas-kicks-flyer.jpg")}"
          alt="${escapeHTML(product.name || "Product image")}"
          onerror="this.src='assets/shashas-kicks-flyer.jpg'"
        />

        <div class="managed-product-body">
          <div class="managed-meta">
            <span>${escapeHTML(product.category || "Footwear")}</span>
            <strong>${escapeHTML(product.price || "Contact for price")}</strong>
          </div>

          <h3>${escapeHTML(product.name || "")}</h3>
          <p>${escapeHTML(product.description || "")}</p>

          <small>
            <b>Sizes:</b> ${escapeHTML(product.sizes || "Available on request")}
          </small>

          <a
            class="btn btn-gold"
            href="https://wa.me/${settings.whatsappNumber}?text=${message}"
            target="_blank"
            rel="noopener"
          >
            Order on WhatsApp
          </a>
        </div>
      </article>
    `;
  }).join("");
}

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
