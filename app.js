document.addEventListener('DOMContentLoaded', () => {
  applySiteSettings();
  renderManagedProducts();
  addProductNamesToContactForm();
});

function applySiteSettings() {
  const settings = skGetSettings();
  const whatsappUrl = `https://wa.me/${settings.whatsappNumber}`;

  const brandName = document.querySelector('.brand strong');
  const tagline = document.querySelector('.brand small');
  const heroTitle = document.querySelector('.hero-copy h1');
  const heroText = document.querySelector('.hero-text');
  const footerBrand = document.querySelector('.footer-content p:first-child');
  const footerTagline = document.querySelector('.footer-content p:last-child');

  if (brandName) brandName.textContent = settings.brandName;
  if (tagline) tagline.textContent = settings.tagline;
  if (heroTitle) heroTitle.textContent = settings.heroTitle;
  if (heroText) heroText.textContent = settings.heroText;
  if (footerBrand) footerBrand.innerHTML = `© <span id="year">${new Date().getFullYear()}</span> ${skEscape(settings.brandName)}. All rights reserved.`;
  if (footerTagline) footerTagline.textContent = settings.tagline;

  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.href = whatsappUrl;
  });

  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.href = `tel:+${settings.whatsappNumber}`;
  });

  const quickInfo = document.querySelectorAll('.quick-info strong');
  if (quickInfo[0]) quickInfo[0].textContent = settings.phoneDisplay;
  if (quickInfo[1]) quickInfo[1].textContent = settings.location.split(',')[0];
  if (quickInfo[2]) quickInfo[2].textContent = settings.socialHandle;

  const contactBoxSpans = document.querySelectorAll('.contact-box span');
  if (contactBoxSpans[0]) contactBoxSpans[0].textContent = settings.phoneDisplay;
  if (contactBoxSpans[2]) contactBoxSpans[2].textContent = settings.location;

  document.querySelectorAll('.social-line strong').forEach(el => {
    el.textContent = settings.socialHandle;
  });
}

function renderManagedProducts() {
  const grid = document.getElementById('managedProductGrid');
  if (!grid) return;

  const settings = skGetSettings();
  const products = skGetProducts();

  if (!products.length) {
    grid.innerHTML = '<div class="empty-state">No products have been added yet.</div>';
    return;
  }

  grid.innerHTML = products.map(product => {
    const message = encodeURIComponent(`Hello ${settings.brandName}, I am interested in ${product.name}. Please confirm price, sizes and availability.`);
    return `
      <article class="managed-product-card">
        <img src="${skEscape(product.image || 'assets/shashas-kicks-flyer.jpg')}" alt="${skEscape(product.name)}" onerror="this.src='assets/shashas-kicks-flyer.jpg'" />
        <div class="managed-product-body">
          <div class="managed-meta">
            <span>${skEscape(product.category)}</span>
            <strong>${skEscape(product.price)}</strong>
          </div>
          <h3>${skEscape(product.name)}</h3>
          <p>${skEscape(product.description)}</p>
          <small><b>Sizes:</b> ${skEscape(product.sizes)}</small>
          <a class="btn btn-gold" href="https://wa.me/${settings.whatsappNumber}?text=${message}" target="_blank" rel="noopener">Order on WhatsApp</a>
        </div>
      </article>
    `;
  }).join('');
}

function addProductNamesToContactForm() {
  const select = document.getElementById('product');
  if (!select) return;

  const products = skGetProducts();
  const separator = document.createElement('option');
  separator.disabled = true;
  separator.textContent = '--- Available Products ---';
  select.appendChild(separator);

  products.forEach(product => {
    const option = document.createElement('option');
    option.textContent = product.name;
    select.appendChild(option);
  });
}
