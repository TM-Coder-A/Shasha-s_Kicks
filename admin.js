let ADMIN_SESSION_PASSWORD = sessionStorage.getItem("sk_admin_password") || "";
let ADMIN_PRODUCTS_CACHE = [];
let CURRENT_EDITING_IMAGE = "";

document.addEventListener("DOMContentLoaded", () => {
  if (
    sessionStorage.getItem("sk_admin_logged_in") === "true" &&
    ADMIN_SESSION_PASSWORD
  ) {
    showDashboard();
  }

  document.getElementById("loginForm").addEventListener("submit", async event => {
    event.preventDefault();

    const username = document.getElementById("adminUsername").value.trim();
    const password = document.getElementById("adminPassword").value;

    try {
      const response = await fetch("/.netlify/functions/verify-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Incorrect username or password.");
        return;
      }

      ADMIN_SESSION_PASSWORD = password;
      sessionStorage.setItem("sk_admin_password", password);
      sessionStorage.setItem("sk_admin_logged_in", "true");

      showDashboard();
    } catch (error) {
      alert("Login failed. Please check your internet connection.");
      console.error(error);
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem("sk_admin_logged_in");
    sessionStorage.removeItem("sk_admin_password");
    location.reload();
  });

  document.getElementById("settingsForm").addEventListener("submit", event => {
    event.preventDefault();

    const settings = {
      brandName: document.getElementById("brandNameInput").value.trim(),
      tagline: document.getElementById("taglineInput").value.trim(),
      phoneDisplay: document.getElementById("phoneDisplayInput").value.trim(),
      whatsappNumber: document
        .getElementById("whatsappNumberInput")
        .value.replace(/[^0-9]/g, ""),
      location: document.getElementById("locationInput").value.trim(),
      socialHandle: document.getElementById("socialHandleInput").value.trim(),
      heroTitle: document.getElementById("heroTitleInput").value.trim(),
      heroText: document.getElementById("heroTextInput").value.trim()
    };

    skSaveSettings(settings);
    alert("Website settings saved in this browser. Product changes are saved to Supabase.");
  });

  document.getElementById("resetSettingsBtn").addEventListener("click", () => {
    if (!confirm("Reset website settings?")) return;
    skSaveSettings(SK_DEFAULT_SETTINGS);
    loadSettingsForm();
  });

  document.getElementById("productForm").addEventListener("submit", async event => {
    event.preventDefault();

    const existingProductId = document.getElementById("productId").value;
    let image = document.getElementById("productImageUrl").value.trim();
    const imageFile = document.getElementById("productImageFile").files[0];

    if (imageFile) {
      image = await fileToDataUrl(imageFile);
    }

    if (!image && CURRENT_EDITING_IMAGE) {
      image = CURRENT_EDITING_IMAGE;
    }

    if (!image) {
      image = "assets/shashas-kicks-flyer.jpg";
    }

    const product = {
      adminPassword: ADMIN_SESSION_PASSWORD,
      name: document.getElementById("productName").value.trim(),
      category: document.getElementById("productCategory").value.trim(),
      price: document.getElementById("productPrice").value.trim(),
      sizes: document.getElementById("productSizes").value.trim(),
      image_url: image,
      description: document.getElementById("productDescription").value.trim()
    };

    let endpoint = "/.netlify/functions/add-product";

    if (existingProductId) {
      product.id = existingProductId;
      endpoint = "/.netlify/functions/update-product";
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(product)
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Product could not be saved.");
        return;
      }

      clearProductForm();
      await renderAdminProducts();

      alert(existingProductId ? "Product updated successfully." : "Product added successfully.");
    } catch (error) {
      alert("Product could not be saved. Please try again.");
      console.error(error);
    }
  });

  document.getElementById("clearFormBtn").addEventListener("click", clearProductForm);

  document.getElementById("exportBtn").addEventListener("click", () => {
    const data = {
      settings: skGetSettings(),
      products: ADMIN_PRODUCTS_CACHE
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "shashas-kicks-data.json";
    link.click();
    URL.revokeObjectURL(link.href);
  });
});

async function showDashboard() {
  document.getElementById("loginSection").classList.add("hidden");
  document.getElementById("dashboardSection").classList.remove("hidden");

  loadSettingsForm();
  await renderAdminProducts();
}

function loadSettingsForm() {
  const s = skGetSettings();

  document.getElementById("brandNameInput").value = s.brandName;
  document.getElementById("taglineInput").value = s.tagline;
  document.getElementById("phoneDisplayInput").value = s.phoneDisplay;
  document.getElementById("whatsappNumberInput").value = s.whatsappNumber;
  document.getElementById("locationInput").value = s.location;
  document.getElementById("socialHandleInput").value = s.socialHandle;
  document.getElementById("heroTitleInput").value = s.heroTitle;
  document.getElementById("heroTextInput").value = s.heroText;
}

async function fetchProductsFromSupabase() {
  const response = await fetch("/.netlify/functions/get-products", {
    cache: "no-store"
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Could not load products.");
  }

  return Array.isArray(result) ? result : [];
}

async function renderAdminProducts() {
  const list = document.getElementById("adminProductList");

  try {
    const products = await fetchProductsFromSupabase();
    ADMIN_PRODUCTS_CACHE = products;

    if (!products.length) {
      list.innerHTML = '<div class="empty-state">No products yet. Add your first product above.</div>';
      return;
    }

    list.innerHTML = products.map(product => `
      <div class="admin-product-row">
        <img src="${skEscape(product.image_url || 'assets/shashas-kicks-flyer.jpg')}" alt="${skEscape(product.name)}" onerror="this.src='assets/shashas-kicks-flyer.jpg'" />
        <div>
          <h3>${skEscape(product.name)}</h3>
          <p class="muted">${skEscape(product.category)} • ${skEscape(product.price)}</p>
          <p class="help-text">${skEscape(product.description || "")}</p>
        </div>
        <div class="row-actions">
          <button class="btn btn-small btn-neutral" onclick="editProduct('${skEscape(product.id)}')">Edit</button>
          <button class="btn btn-small btn-danger" onclick="deleteProduct('${skEscape(product.id)}')">Delete</button>
        </div>
      </div>
    `).join("");
  } catch (error) {
    list.innerHTML = `<div class="empty-state">${skEscape(error.message)}</div>`;
    console.error(error);
  }
}

function editProduct(id) {
  const product = ADMIN_PRODUCTS_CACHE.find(item => item.id === id);
  if (!product) return;

  CURRENT_EDITING_IMAGE = product.image_url || "";

  document.getElementById("productFormTitle").textContent = "Edit product";
  document.getElementById("productId").value = product.id;
  document.getElementById("productName").value = product.name || "";
  document.getElementById("productCategory").value = product.category || "";
  document.getElementById("productPrice").value = product.price || "";
  document.getElementById("productSizes").value = product.sizes || "";
  document.getElementById("productImageUrl").value =
    product.image_url && !product.image_url.startsWith("data:")
      ? product.image_url
      : "";
  document.getElementById("productDescription").value = product.description || "";
  document.getElementById("productImageFile").value = "";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;

  try {
    const response = await fetch("/.netlify/functions/delete-product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id,
        adminPassword: ADMIN_SESSION_PASSWORD
      })
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || "Product could not be deleted.");
      return;
    }

    await renderAdminProducts();
    alert("Product deleted successfully.");
  } catch (error) {
    alert("Product could not be deleted. Please try again.");
    console.error(error);
  }
}

function clearProductForm() {
  CURRENT_EDITING_IMAGE = "";
  document.getElementById("productFormTitle").textContent = "Add new product";
  document.getElementById("productForm").reset();
  document.getElementById("productId").value = "";
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (file.size > 900000) {
      const proceed = confirm("This image is large and may not save properly. Use image links for best result. Continue?");
      if (!proceed) return reject(new Error("Large image cancelled"));
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
