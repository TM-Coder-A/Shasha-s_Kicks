const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Shasha@123';

document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('sk_admin_logged_in') === 'true') {
    showDashboard();
  }

  document.getElementById('loginForm').addEventListener('submit', event => {
    event.preventDefault();
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem('sk_admin_logged_in', 'true');
      showDashboard();
    } else {
      alert('Incorrect username or password.');
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('sk_admin_logged_in');
    location.reload();
  });

  document.getElementById('settingsForm').addEventListener('submit', event => {
    event.preventDefault();
    const settings = {
      brandName: document.getElementById('brandNameInput').value.trim(),
      tagline: document.getElementById('taglineInput').value.trim(),
      phoneDisplay: document.getElementById('phoneDisplayInput').value.trim(),
      whatsappNumber: document.getElementById('whatsappNumberInput').value.replace(/[^0-9]/g, ''),
      location: document.getElementById('locationInput').value.trim(),
      socialHandle: document.getElementById('socialHandleInput').value.trim(),
      heroTitle: document.getElementById('heroTitleInput').value.trim(),
      heroText: document.getElementById('heroTextInput').value.trim()
    };
    skSaveSettings(settings);
    alert('Website settings saved. Open the website in this same browser to see the changes.');
  });

  document.getElementById('resetSettingsBtn').addEventListener('click', () => {
    if (!confirm('Reset website settings?')) return;
    skSaveSettings(SK_DEFAULT_SETTINGS);
    loadSettingsForm();
  });

  document.getElementById('productForm').addEventListener('submit', async event => {
    event.preventDefault();
    const productId = document.getElementById('productId').value || `p_${Date.now()}`;
    let image = document.getElementById('productImageUrl').value.trim();
    const imageFile = document.getElementById('productImageFile').files[0];

    if (imageFile) {
      image = await fileToDataUrl(imageFile);
    }

    if (!image) image = 'assets/shashas-kicks-flyer.jpg';

    const product = {
      id: productId,
      name: document.getElementById('productName').value.trim(),
      category: document.getElementById('productCategory').value.trim(),
      price: document.getElementById('productPrice').value.trim(),
      sizes: document.getElementById('productSizes').value.trim(),
      image,
      description: document.getElementById('productDescription').value.trim()
    };

    const products = skGetProducts();
    const index = products.findIndex(item => item.id === productId);
    if (index >= 0) products[index] = product;
    else products.unshift(product);

    skSaveProducts(products);
    clearProductForm();
    renderAdminProducts();
    alert('Product saved.');
  });

  document.getElementById('clearFormBtn').addEventListener('click', clearProductForm);

  document.getElementById('exportBtn').addEventListener('click', () => {
    const data = { settings: skGetSettings(), products: skGetProducts() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'shashas-kicks-data.json';
    link.click();
    URL.revokeObjectURL(link.href);
  });
});

function showDashboard() {
  document.getElementById('loginSection').classList.add('hidden');
  document.getElementById('dashboardSection').classList.remove('hidden');
  loadSettingsForm();
  renderAdminProducts();
}

function loadSettingsForm() {
  const s = skGetSettings();
  document.getElementById('brandNameInput').value = s.brandName;
  document.getElementById('taglineInput').value = s.tagline;
  document.getElementById('phoneDisplayInput').value = s.phoneDisplay;
  document.getElementById('whatsappNumberInput').value = s.whatsappNumber;
  document.getElementById('locationInput').value = s.location;
  document.getElementById('socialHandleInput').value = s.socialHandle;
  document.getElementById('heroTitleInput').value = s.heroTitle;
  document.getElementById('heroTextInput').value = s.heroText;
}

function renderAdminProducts() {
  const list = document.getElementById('adminProductList');
  const products = skGetProducts();

  if (!products.length) {
    list.innerHTML = '<div class="empty-state">No products yet. Add your first product above.</div>';
    return;
  }

  list.innerHTML = products.map(product => `
    <div class="admin-product-row">
      <img src="${skEscape(product.image)}" alt="${skEscape(product.name)}" onerror="this.src='assets/shashas-kicks-flyer.jpg'" />
      <div>
        <h3>${skEscape(product.name)}</h3>
        <p class="muted">${skEscape(product.category)} • ${skEscape(product.price)}</p>
        <p class="help-text">${skEscape(product.description)}</p>
      </div>
      <div class="row-actions">
        <button class="btn btn-small btn-neutral" onclick="editProduct('${skEscape(product.id)}')">Edit</button>
        <button class="btn btn-small btn-danger" onclick="deleteProduct('${skEscape(product.id)}')">Delete</button>
      </div>
    </div>
  `).join('');
}

function editProduct(id) {
  const product = skGetProducts().find(item => item.id === id);
  if (!product) return;

  document.getElementById('productFormTitle').textContent = 'Edit product';
  document.getElementById('productId').value = product.id;
  document.getElementById('productName').value = product.name;
  document.getElementById('productCategory').value = product.category;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productSizes').value = product.sizes;
  document.getElementById('productImageUrl').value = product.image.startsWith('data:') ? '' : product.image;
  document.getElementById('productDescription').value = product.description;
  document.getElementById('productImageFile').value = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  skSaveProducts(skGetProducts().filter(item => item.id !== id));
  renderAdminProducts();
}

function clearProductForm() {
  document.getElementById('productFormTitle').textContent = 'Add new product';
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (file.size > 900000) {
      const proceed = confirm('This image is large and may not save properly in browser storage. Continue?');
      if (!proceed) return reject(new Error('Large image cancelled'));
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
