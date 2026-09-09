const menuButton = document.querySelector('#menuButton');
const mobileNav = document.querySelector('#mobileNav');
const cartButton = document.querySelector('#cartButton');
const cartDrawer = document.querySelector('#cartDrawer');
const closeCart = document.querySelector('#closeCart');
const scrim = document.querySelector('#scrim');
const productDialog = document.querySelector('#productDialog');
const productForm = document.querySelector('#productForm');
const dialogProductName = document.querySelector('#dialogProductName');
const dialogPrice = document.querySelector('#dialogPrice');
const addPrice = document.querySelector('#addPrice');
const checkoutDialog = document.querySelector('#checkoutDialog');
const cart = [];

const ambientLightSettings = [
  ['7%', '3px', '18s', '-4s', '34px', '2.4s'],
  ['18%', '5px', '24s', '-17s', '-28px', '3.1s'],
  ['31%', '3px', '21s', '-9s', '42px', '2.7s'],
  ['43%', '4px', '27s', '-22s', '-36px', '3.6s'],
  ['57%', '3px', '20s', '-13s', '30px', '2.2s'],
  ['68%', '5px', '25s', '-6s', '-44px', '3.4s'],
  ['79%', '3px', '23s', '-19s', '38px', '2.8s'],
  ['91%', '4px', '28s', '-11s', '-32px', '3.8s'],
  ['12%', '2px', '30s', '-26s', '26px', '2.5s'],
  ['52%', '2px', '26s', '-2s', '-24px', '3.2s']
];

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const lightLayer = document.createElement('div');
  lightLayer.className = 'ambient-lights';
  lightLayer.setAttribute('aria-hidden', 'true');
  ambientLightSettings.forEach(([left, size, duration, delay, drift, twinkle]) => {
    const light = document.createElement('span');
    light.className = 'glow-speck';
    light.style.setProperty('--left', left);
    light.style.setProperty('--size', size);
    light.style.setProperty('--duration', duration);
    light.style.setProperty('--delay', delay);
    light.style.setProperty('--drift', drift);
    light.style.setProperty('--twinkle', twinkle);
    lightLayer.appendChild(light);
  });
  document.body.appendChild(lightLayer);
}

if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    mobileNav.hidden = open;
  });
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    mobileNav.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
  }));
}

document.querySelectorAll('.filter-row[data-filter-scope], .shop-section .filter-row').forEach(group => {
  group.querySelectorAll('.filter-chip').forEach(button => {
    button.addEventListener('click', () => {
      group.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('active'));
      button.classList.add('active');
      const scope = group.dataset.filterScope ? document.querySelector(group.dataset.filterScope) : document;
      const filter = button.dataset.filter;
      scope.querySelectorAll('[data-category]').forEach(item => {
        item.hidden = filter !== 'all' && item.dataset.category !== filter;
      });
      updateCatalogCount();
    });
  });
});

function syncBuilderImage(value) {
  const thumb = document.querySelector(`.builder-thumb[data-size-value="${value}"]`);
  const mainImage = document.querySelector('#builderMainImage');
  if (!thumb || !mainImage) return;
  document.querySelectorAll('.builder-thumb').forEach(item => item.classList.remove('active'));
  thumb.classList.add('active');
  mainImage.classList.add('is-changing');
  window.setTimeout(() => {
    mainImage.src = thumb.dataset.image;
    mainImage.alt = thumb.dataset.alt;
    mainImage.classList.remove('is-changing');
  }, 140);
}

function calculatePrice() {
  if (!productForm) return 0;
  const size = Number(productForm.elements.size.value);
  const addOns = [...productForm.querySelectorAll('[name="addon"]:checked')]
    .reduce((sum, input) => sum + Number(input.value), 0);
  const total = size + addOns;
  if (dialogPrice) dialogPrice.textContent = `$${total}`;
  if (addPrice) addPrice.textContent = `$${total}`;
  syncBuilderImage(String(size));
  return total;
}

function openProduct(name = 'Signature Rose Bouquet') {
  if (!productDialog || !productForm) return;
  productForm.reset();
  if (dialogProductName) dialogProductName.textContent = name;
  calculatePrice();
  productDialog.showModal();
}

document.querySelectorAll('.product-image').forEach(button => button.addEventListener('click', () => openProduct(button.dataset.product)));
document.querySelectorAll('.open-builder').forEach(button => button.addEventListener('click', () => openProduct()));
document.querySelector('#closeProduct')?.addEventListener('click', () => productDialog?.close());

if (productForm) {
  productForm.addEventListener('change', calculatePrice);
  productForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(productForm);
    const selectedSize = productForm.querySelector('[name="size"]:checked');
    cart.push({
      name: dialogProductName?.textContent || 'Sample bouquet',
      price: calculatePrice(),
      size: selectedSize?.nextElementSibling?.firstChild?.textContent?.trim() || 'Selected size',
      color: data.get('color'),
      fulfillment: data.get('fulfillment')
    });
    productDialog.close();
    renderCart();
    openCartDrawer();
  });
}

document.querySelectorAll('.builder-thumb').forEach(button => {
  button.addEventListener('click', () => {
    const radio = productForm?.querySelector(`[name="size"][value="${button.dataset.sizeValue}"]`);
    if (radio) radio.checked = true;
    calculatePrice();
  });
});

function renderCart() {
  document.querySelectorAll('.cart-count').forEach(count => { count.textContent = cart.length; });
  const cartItems = document.querySelector('#cartItems');
  const cartEmpty = document.querySelector('#cartEmpty');
  const cartFooter = document.querySelector('#cartFooter');
  if (!cartItems || !cartEmpty || !cartFooter) return;
  cartItems.innerHTML = '';
  cartEmpty.hidden = cart.length > 0;
  cartFooter.hidden = cart.length === 0;
  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `<div class="cart-thumb"></div><div><h3>${item.name}</h3><p>${item.size} · ${item.color} · ${item.fulfillment}</p></div><strong>$${item.price}</strong>`;
    cartItems.appendChild(row);
  });
  const subtotal = document.querySelector('#cartSubtotal');
  if (subtotal) subtotal.textContent = `$${cart.reduce((sum, item) => sum + item.price, 0)}`;
}

function openCartDrawer() {
  if (!cartDrawer || !scrim) return;
  cartDrawer.classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  scrim.hidden = false;
}
function closeCartDrawer() {
  if (!cartDrawer || !scrim) return;
  cartDrawer.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  scrim.hidden = true;
}
cartButton?.addEventListener('click', openCartDrawer);
closeCart?.addEventListener('click', closeCartDrawer);
scrim?.addEventListener('click', closeCartDrawer);
document.querySelectorAll('.close-cart-link').forEach(link => link.addEventListener('click', closeCartDrawer));
document.querySelector('#checkoutButton')?.addEventListener('click', () => { closeCartDrawer(); checkoutDialog?.showModal(); });
document.querySelector('#closeCheckout')?.addEventListener('click', () => checkoutDialog?.close());
document.querySelector('#finishPreview')?.addEventListener('click', () => checkoutDialog?.close());

const searchOverlay = document.querySelector('#searchOverlay');
const searchInput = document.querySelector('#searchInput');
const searchResult = document.querySelector('#searchResult');
document.querySelector('#searchButton')?.addEventListener('click', () => {
  const catalogSearch = document.querySelector('#catalogSearch');
  if (catalogSearch) {
    catalogSearch.focus();
    catalogSearch.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else if (searchOverlay) {
    searchOverlay.hidden = false;
    searchInput?.focus();
  }
});
document.querySelector('#closeSearch')?.addEventListener('click', () => { if (searchOverlay) searchOverlay.hidden = true; });
searchInput?.addEventListener('input', () => {
  const value = searchInput.value.toLowerCase();
  const products = ['Signature Rose Bouquet', 'The Boutique Mix', 'The Celebration Bouquet', 'The Grand Gesture'];
  const match = products.find(product => product.toLowerCase().includes(value));
  if (searchResult) searchResult.textContent = value.length < 2 ? 'Enter at least two letters.' : match ? `Sample match: ${match}` : 'No sample match. The final search will use Te’Amo’s full catalog.';
});

function updateCatalogCount() {
  const catalog = document.querySelector('#shopCatalog');
  if (!catalog) return;
  const visible = [...catalog.querySelectorAll('.product-card')].filter(card => !card.hidden);
  const count = document.querySelector('#resultCount');
  const empty = document.querySelector('#catalogEmpty');
  if (count) count.textContent = `${visible.length} sample product${visible.length === 1 ? '' : 's'}`;
  if (empty) empty.hidden = visible.length > 0;
}

const catalogSearch = document.querySelector('#catalogSearch');
catalogSearch?.addEventListener('input', () => {
  const query = catalogSearch.value.trim().toLowerCase();
  document.querySelectorAll('#shopCatalog .product-card').forEach(card => {
    const haystack = `${card.dataset.name} ${card.dataset.category}`.toLowerCase();
    card.hidden = query.length > 0 && !haystack.includes(query);
  });
  document.querySelectorAll('.catalog-filters .filter-chip').forEach(chip => chip.classList.toggle('active', chip.dataset.filter === 'all'));
  updateCatalogCount();
});

document.querySelector('#shopSort')?.addEventListener('change', event => {
  const catalog = document.querySelector('#shopCatalog');
  if (!catalog) return;
  const cards = [...catalog.querySelectorAll('.product-card')];
  const mode = event.target.value;
  cards.sort((a, b) => {
    if (mode === 'price-low') return Number(a.dataset.price) - Number(b.dataset.price);
    if (mode === 'price-high') return Number(b.dataset.price) - Number(a.dataset.price);
    if (mode === 'name') return a.dataset.name.localeCompare(b.dataset.name);
    return 0;
  });
  cards.forEach(card => catalog.appendChild(card));
});

document.querySelector('#loadMore')?.addEventListener('click', event => {
  event.currentTarget.textContent = 'More products will appear here';
  event.currentTarget.disabled = true;
});

document.querySelector('#contactForm')?.addEventListener('submit', event => {
  event.preventDefault();
  const message = document.querySelector('#formMessage');
  if (message) message.textContent = 'Wireframe preview: this form will send to Te’Amo’s approved email address.';
  event.currentTarget.reset();
});

const lightboxDialog = document.querySelector('#lightboxDialog');
const lightboxImage = document.querySelector('#lightboxImage');
const lightboxCaption = document.querySelector('#lightboxCaption');
document.querySelectorAll('[data-lightbox]').forEach(item => item.addEventListener('click', () => {
  if (!lightboxDialog || !lightboxImage || !lightboxCaption) return;
  lightboxImage.src = item.dataset.lightbox;
  lightboxImage.alt = item.querySelector('img')?.alt || 'Gallery image';
  lightboxCaption.textContent = item.dataset.caption || '';
  lightboxDialog.showModal();
}));
document.querySelector('#closeLightbox')?.addEventListener('click', () => lightboxDialog?.close());

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .14 });
  document.querySelectorAll('.reveal').forEach((item, index) => {
    item.style.transitionDelay = `${Math.min((index % 4) * 70, 210)}ms`;
    revealObserver.observe(item);
  });
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      card.style.transform = `perspective(900px) rotateX(${-y * 3}deg) rotateY(${x * 4}deg) translateY(-3px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
} else {
  document.querySelectorAll('.reveal').forEach(item => item.classList.add('is-visible'));
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeCartDrawer();
    if (searchOverlay) searchOverlay.hidden = true;
  }
});
