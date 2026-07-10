const SK_DEFAULT_PRODUCTS = [
  {
    id: 'p1',
    name: 'Black Corporate Half Shoe',
    category: 'Half shoes',
    price: 'Contact for price',
    sizes: 'Available sizes on request',
    description: 'Premium black half shoe for office, church, meetings and smart everyday dressing.',
    image: 'assets/shashas-kicks-flyer.jpg'
  },
  {
    id: 'p2',
    name: 'White Unisex Sneaker',
    category: 'Unisex sneakers',
    price: 'Contact for price',
    sizes: 'Available sizes on request',
    description: 'Clean unisex sneaker for casual wear, weekend outings and stylish daily looks.',
    image: 'assets/shashas-kicks-flyer.jpg'
  },
  {
    id: 'p3',
    name: 'Black Comfort Slides',
    category: 'Slides/Palms',
    price: 'Contact for price',
    sizes: 'Available sizes on request',
    description: 'Comfortable slides and palms made for relaxed daily movement and easy styling.',
    image: 'assets/shashas-kicks-flyer.jpg'
  }
];

const SK_DEFAULT_SETTINGS = {
  brandName: "Shasha's Kicks",
  tagline: 'Step Beyond Ordinary',
  phoneDisplay: '09136515520',
  whatsappNumber: '2349136515520',
  location: 'Egbeda, Lagos State',
  socialHandle: '@shashaskicks',
  heroTitle: 'Footwear that gives comfort, durability and everyday style.',
  heroText: "Discover quality kicks for casual outings, office looks, weekend style and everyday confidence. From canvas and unisex sneakers to sandals, slides and leather shoes, Shasha's Kicks helps you step beyond ordinary."
};

function skGetProducts() {
  const saved = localStorage.getItem('sk_products');
  if (!saved) {
    skSaveProducts(SK_DEFAULT_PRODUCTS);
    return SK_DEFAULT_PRODUCTS;
  }
  try {
    return JSON.parse(saved);
  } catch (error) {
    skSaveProducts(SK_DEFAULT_PRODUCTS);
    return SK_DEFAULT_PRODUCTS;
  }
}

function skSaveProducts(products) {
  localStorage.setItem('sk_products', JSON.stringify(products));
}

function skGetSettings() {
  const saved = localStorage.getItem('sk_settings');
  if (!saved) {
    skSaveSettings(SK_DEFAULT_SETTINGS);
    return SK_DEFAULT_SETTINGS;
  }
  try {
    return { ...SK_DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch (error) {
    skSaveSettings(SK_DEFAULT_SETTINGS);
    return SK_DEFAULT_SETTINGS;
  }
}

function skSaveSettings(settings) {
  localStorage.setItem('sk_settings', JSON.stringify(settings));
}

function skEscape(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
