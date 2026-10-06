/**
 * NIKE // AIRPULSE INDIA — MAIN STORE APPLICATION JS
 * Currency: Indian Rupees (₹) with en-IN localization
 * Features: Catalog, Biomechanical Fit, Cart, Wishlist, User Authentication, Checkout, and Orders
 */

const STATE = {
  shoes: [],
  cart: JSON.parse(localStorage.getItem('nike_pulse_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('nike_pulse_wishlist') || '[]'),
  user: null,
  currentCategory: 'all',
  currentCushion: 'all',
  currentSort: 'featured',
  currentSearch: '',
  activeShoeId: null,
  activeSelectedSize: null,
  promoDiscount: 0,
  activePromoCode: ''
};

// Currency Formatter Utility for Indian Rupees (₹)
function formatINR(amount) {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return `₹${Math.round(num).toLocaleString('en-IN')}`;
}

// ==========================================
// DOM INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  checkUserAuth();
  initHeroCardInteraction();
  initHeroColorwaySwitcher();
  initCatalog();
  initCart();
  initWishlist();
  initProductModal();
  initCheckout();
  initOrdersModal();
  initAnnouncementBar();
});

// ==========================================
// 0. USER AUTHENTICATION & PROFILE STATE
// ==========================================
async function checkUserAuth() {
  const widget = document.getElementById('user-auth-widget');
  const mobileAuth = document.getElementById('mobile-auth-row');

  try {
    const res = await fetch('/api/me');
    const data = await res.json();

    if (data.logged_in && data.user) {
      STATE.user = data.user;
      const firstName = data.user.name.split(' ')[0];

      if (widget) {
        widget.innerHTML = `
          <div class="user-profile-menu">
            <button class="btn-user-profile" id="user-profile-toggle" aria-label="User Profile Menu">
              <span class="user-avatar-badge">👤</span>
              <span class="user-name-label">${firstName}</span>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <div class="user-dropdown-menu" id="user-dropdown-menu" style="display:none;">
              <div class="dropdown-user-info">
                <strong>${data.user.name}</strong>
                <span>${data.user.email}</span>
                ${data.user.phone ? `<small>${data.user.phone}</small>` : ''}
              </div>
              <button class="dropdown-item" id="btn-view-my-orders">
                <span>📦</span> My Orders
              </button>
              <button class="dropdown-item text-danger" id="btn-user-logout">
                <span>🚪</span> Sign Out
              </button>
            </div>
          </div>
        `;

        // Toggle profile dropdown
        const toggleBtn = document.getElementById('user-profile-toggle');
        const dropdown = document.getElementById('user-dropdown-menu');
        if (toggleBtn && dropdown) {
          toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = dropdown.style.display === 'block';
            dropdown.style.display = isVisible ? 'none' : 'block';
          });

          document.addEventListener('click', () => {
            dropdown.style.display = 'none';
          });
        }

        // Logout
        const logoutBtn = document.getElementById('btn-user-logout');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', handleLogout);
        }

        // View Orders
        const myOrdersBtn = document.getElementById('btn-view-my-orders');
        if (myOrdersBtn) {
          myOrdersBtn.addEventListener('click', openOrdersModal);
        }
      }

      if (mobileAuth) {
        mobileAuth.innerHTML = `
          <div class="mobile-user-greeting">
            <span>Welcome, <strong>${data.user.name}</strong></span>
            <button class="btn-secondary" onclick="openOrdersModal()" style="padding:6px 12px; font-size:0.8rem;">My Orders</button>
            <button class="btn-secondary" onclick="handleLogout()" style="padding:6px 12px; font-size:0.8rem;">Logout</button>
          </div>
        `;
      }

      // Pre-fill checkout form if visible
      const nameInput = document.getElementById('checkout-name');
      const emailInput = document.getElementById('checkout-email');
      if (nameInput && !nameInput.value) nameInput.value = data.user.name;
      if (emailInput && !emailInput.value) emailInput.value = data.user.email;

    } else {
      STATE.user = null;
      if (widget) {
        widget.innerHTML = `
          <a href="/login" class="btn-auth-link" id="btn-auth-action">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Sign In</span>
          </a>
        `;
      }
    }
  } catch (err) {
    console.warn('Auth check error:', err);
  }
}

async function handleLogout() {
  try {
    await fetch('/api/logout', { method: 'POST' });
    STATE.user = null;
    localStorage.removeItem('nike_pulse_user');
    showToast('Signed out of Nike Member Lab.');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  } catch (err) {
    console.error('Logout error:', err);
  }
}

// ==========================================
// 1. HERO 3D TILT & COLORWAY SWITCHER
// ==========================================
function initHeroCardInteraction() {
  const card = document.getElementById('hero-card-3d');
  const img = document.getElementById('hero-sneaker-img');
  if (!card || !img) return;

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 14;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  });
}

function initHeroColorwaySwitcher() {
  const swatches = document.querySelectorAll('.hero-colorways .color-swatch');
  const aura = document.getElementById('sneaker-aura');
  const colorName = document.getElementById('hero-color-name');
  const buyBtn = document.getElementById('hero-buy-btn');

  const colorwayMap = {
    volt: { name: 'Volt / Electric Cyan', auraClass: 'aura-volt' },
    crimson: { name: 'Hyper Crimson / Infrared', auraClass: 'aura-crimson' },
    obsidian: { name: 'Cyber Cyan / Obsidian', auraClass: 'aura-obsidian' },
    platinum: { name: 'Pure Ghost Platinum', auraClass: 'aura-platinum' }
  };

  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');

      const colorKey = swatch.dataset.color;
      const data = colorwayMap[colorKey];
      if (data && aura && colorName) {
        aura.className = `sneaker-aura ${data.auraClass}`;
        colorName.textContent = data.name;
      }
    });
  });

  if (buyBtn) {
    buyBtn.addEventListener('click', () => {
      openProductModal(1);
    });
  }
}

// ==========================================
// 2. CATALOG: FETCHING, FILTERING & RENDERING
// ==========================================
function initCatalog() {
  const categoryTabs = document.querySelectorAll('.cat-tab');
  const cushionSelect = document.getElementById('cushion-filter');
  const sortSelect = document.getElementById('sort-filter');
  const searchInput = document.getElementById('global-search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const clearAllFiltersBtn = document.getElementById('btn-clear-all-filters');
  const resetFiltersBtn = document.getElementById('btn-reset-filters');

  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      STATE.currentCategory = tab.dataset.category;
      fetchShoes();
    });
  });

  if (cushionSelect) {
    cushionSelect.addEventListener('change', (e) => {
      STATE.currentCushion = e.target.value;
      fetchShoes();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      STATE.currentSort = e.target.value;
      fetchShoes();
    });
  }

  let searchTimer;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      STATE.currentSearch = val;
      if (clearSearchBtn) {
        clearSearchBtn.style.display = val ? 'block' : 'none';
      }
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        fetchShoes();
      }, 250);
    });
  }

  if (clearSearchBtn && searchInput) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      STATE.currentSearch = '';
      clearSearchBtn.style.display = 'none';
      fetchShoes();
    });
  }

  const resetAction = () => {
    STATE.currentCategory = 'all';
    STATE.currentCushion = 'all';
    STATE.currentSort = 'featured';
    STATE.currentSearch = '';
    if (searchInput) searchInput.value = '';
    if (clearSearchBtn) clearSearchBtn.style.display = 'none';
    if (cushionSelect) cushionSelect.value = 'all';
    if (sortSelect) sortSelect.value = 'featured';

    categoryTabs.forEach(t => {
      t.classList.toggle('active', t.dataset.category === 'all');
      t.setAttribute('aria-selected', t.dataset.category === 'all' ? 'true' : 'false');
    });

    fetchShoes();
  };

  if (clearAllFiltersBtn) clearAllFiltersBtn.addEventListener('click', resetAction);
  if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetAction);

  fetchShoes();
}

async function fetchShoes() {
  const grid = document.getElementById('shoes-grid');
  const countBadge = document.getElementById('active-results-count');
  const emptyBox = document.getElementById('empty-results-box');

  const params = new URLSearchParams();
  if (STATE.currentCategory !== 'all') params.append('category', STATE.currentCategory);
  if (STATE.currentCushion !== 'all') params.append('cushion', STATE.currentCushion);
  if (STATE.currentSort !== 'featured') params.append('sort', STATE.currentSort);
  if (STATE.currentSearch) params.append('search', STATE.currentSearch);

  updateFilterTags();

  try {
    const res = await fetch(`/api/shoes?${params.toString()}`);
    const data = await res.json();
    STATE.shoes = data.shoes || [];

    if (countBadge) countBadge.textContent = STATE.shoes.length;

    if (STATE.shoes.length === 0) {
      if (grid) grid.innerHTML = '';
      if (emptyBox) emptyBox.style.display = 'block';
    } else {
      if (emptyBox) emptyBox.style.display = 'none';
      renderShoeGrid(STATE.shoes);
    }
  } catch (err) {
    console.error('Failed to load shoes:', err);
    if (grid) {
      grid.innerHTML = `<div class="empty-results-box">
        <h3>Error loading shoes</h3>
        <p>Could not connect to Flask SQLite backend. Please ensure the server is running.</p>
      </div>`;
    }
  }
}

function renderShoeGrid(shoes) {
  const grid = document.getElementById('shoes-grid');
  if (!grid) return;

  grid.innerHTML = shoes.map(shoe => {
    const isWishlisted = STATE.wishlist.some(item => item.id === shoe.id);
    const badgeHtml = shoe.badge 
      ? `<span class="card-badge ${shoe.badge.includes('OLYMPIC') || shoe.badge.includes('NEW') ? 'highlight-badge' : ''}">${shoe.badge}</span>`
      : '<span></span>';

    return `
      <article class="shoe-card" data-shoe-id="${shoe.id}">
        <div class="card-top">
          ${badgeHtml}
          <button class="btn-card-wishlist ${isWishlisted ? 'active' : ''}" 
                  data-shoe-id="${shoe.id}" 
                  aria-label="Add ${shoe.name} to wishlist"
                  onclick="toggleWishlist(${shoe.id}, event)">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>

        <div class="card-image-box" onclick="openProductModal(${shoe.id})">
          <img src="${shoe.image_url}" alt="${shoe.name}" class="shoe-card-img" loading="lazy">
        </div>

        <div class="card-info" onclick="openProductModal(${shoe.id})">
          <span class="card-subtitle">${shoe.subtitle}</span>
          <h3 class="card-title">${shoe.name}</h3>
          <span class="card-colorway">${shoe.colorway}</span>

          <div class="card-meta-row">
            <div class="card-rating">
              <span>★ ${shoe.rating}</span>
              <span class="card-rating-count">(${shoe.reviews_count})</span>
            </div>
            <div class="card-price-box">
              <span class="price-main">${formatINR(shoe.price)}</span>
              ${shoe.original_price ? `<span class="price-old">${formatINR(shoe.original_price)}</span>` : ''}
            </div>
          </div>
        </div>

        <div class="card-actions-row">
          <button class="btn-card-quickview" onclick="openProductModal(${shoe.id})">
            View Details
          </button>
          <button class="btn-card-addbag" onclick="quickAddToCart(${shoe.id}, event)" title="Add to Bag">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </article>
    `;
  }).join('');
}

function updateFilterTags() {
  const bar = document.getElementById('active-tags-bar');
  const container = document.getElementById('tags-container');
  if (!bar || !container) return;

  const tags = [];
  if (STATE.currentCategory !== 'all') {
    tags.push({ label: `Category: ${STATE.currentCategory.toUpperCase()}`, type: 'category' });
  }
  if (STATE.currentCushion !== 'all') {
    tags.push({ label: `Cushion: ${STATE.currentCushion.toUpperCase()}`, type: 'cushion' });
  }
  if (STATE.currentSearch) {
    tags.push({ label: `Search: "${STATE.currentSearch}"`, type: 'search' });
  }

  if (tags.length === 0) {
    bar.style.display = 'none';
    container.innerHTML = '';
  } else {
    bar.style.display = 'flex';
    container.innerHTML = tags.map(t => `
      <span class="filter-tag">
        ${t.label}
        <span class="filter-tag-remove" onclick="removeFilter('${t.type}')">&times;</span>
      </span>
    `).join('');
  }
}

window.removeFilter = function(type) {
  if (type === 'category') {
    STATE.currentCategory = 'all';
    document.querySelectorAll('.cat-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.category === 'all');
    });
  } else if (type === 'cushion') {
    STATE.currentCushion = 'all';
    const c = document.getElementById('cushion-filter');
    if (c) c.value = 'all';
  } else if (type === 'search') {
    STATE.currentSearch = '';
    const s = document.getElementById('global-search-input');
    if (s) s.value = '';
    const clr = document.getElementById('clear-search-btn');
    if (clr) clr.style.display = 'none';
  }
  fetchShoes();
};

// ==========================================
// 3. PRODUCT DETAIL MODAL & REVIEWS
// ==========================================
function initProductModal() {
  const modal = document.getElementById('product-modal');
  const closeBtn = document.getElementById('close-product-btn');
  const addToCartBtn = document.getElementById('modal-add-to-cart');
  const wishlistBtn = document.getElementById('modal-wishlist-toggle');
  const writeReviewToggle = document.getElementById('btn-toggle-write-review');
  const reviewForm = document.getElementById('review-form');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
      }
    });
  }

  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      if (!STATE.activeSelectedSize) {
        const alertBox = document.getElementById('modal-size-alert');
        if (alertBox) alertBox.style.display = 'block';
        return;
      }

      const shoe = STATE.shoes.find(s => s.id === STATE.activeShoeId);
      if (shoe) {
        addItemToCart({
          id: shoe.id,
          name: shoe.name,
          subtitle: shoe.subtitle,
          price: shoe.price,
          image_url: shoe.image_url,
          colorway: shoe.colorway,
          size: STATE.activeSelectedSize,
          quantity: 1
        });
        showToast(`Added ${shoe.name} (Size US ${STATE.activeSelectedSize}) to Bag!`);
        modal.classList.remove('active');
        openCartDrawer();
      }
    });
  }

  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', (e) => {
      if (STATE.activeShoeId) {
        toggleWishlist(STATE.activeShoeId, e);
        const isWishlisted = STATE.wishlist.some(i => i.id === STATE.activeShoeId);
        wishlistBtn.classList.toggle('active', isWishlisted);
      }
    });
  }

  if (writeReviewToggle && reviewForm) {
    writeReviewToggle.addEventListener('click', () => {
      const isHidden = reviewForm.style.display === 'none' || reviewForm.style.display === '';
      reviewForm.style.display = isHidden ? 'flex' : 'none';
      writeReviewToggle.textContent = isHidden ? 'Cancel' : 'Write a Review';
    });
  }

  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const author = document.getElementById('review-author').value.trim();
      const rating = parseInt(document.getElementById('review-rating').value);
      const title = document.getElementById('review-title').value.trim();
      const comment = document.getElementById('review-comment').value.trim();

      if (!author || !comment || !STATE.activeShoeId) return;

      try {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shoe_id: STATE.activeShoeId,
            user_name: author,
            rating,
            title,
            comment
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast('Review submitted and recorded in SQLite!');
          reviewForm.reset();
          reviewForm.style.display = 'none';
          if (writeReviewToggle) writeReviewToggle.textContent = 'Write a Review';
          openProductModal(STATE.activeShoeId);
          fetchShoes();
        }
      } catch (err) {
        console.error('Failed to submit review:', err);
        showToast('Error saving review to database.', 'error');
      }
    });
  }
}

window.openProductModal = async function(shoeId) {
  STATE.activeShoeId = shoeId;
  STATE.activeSelectedSize = null;

  const modal = document.getElementById('product-modal');
  const alertBox = document.getElementById('modal-size-alert');
  if (alertBox) alertBox.style.display = 'none';

  try {
    const res = await fetch(`/api/shoes/${shoeId}`);
    const data = await res.json();
    const shoe = data.shoe;
    const reviews = data.reviews || [];

    document.getElementById('modal-main-img').src = shoe.image_url;
    document.getElementById('modal-badge-tag').textContent = shoe.badge || 'PRO PERFORMANCE';
    document.getElementById('modal-subtitle').textContent = shoe.subtitle;
    document.getElementById('modal-product-title').textContent = shoe.name;
    document.getElementById('modal-rating-num').textContent = shoe.rating;
    document.getElementById('modal-reviews-count').textContent = `(${shoe.reviews_count} reviews)`;
    
    // Indian Rupee Price
    document.getElementById('modal-price').textContent = formatINR(shoe.price);

    const origPriceEl = document.getElementById('modal-original-price');
    const discountEl = document.getElementById('modal-discount-badge');
    if (shoe.original_price && shoe.original_price > shoe.price) {
      origPriceEl.textContent = formatINR(shoe.original_price);
      origPriceEl.style.display = 'inline';
      discountEl.textContent = `Save ${formatINR(shoe.original_price - shoe.price)}`;
      discountEl.style.display = 'inline';
    } else {
      origPriceEl.style.display = 'none';
      discountEl.style.display = 'none';
    }

    document.getElementById('modal-description').textContent = shoe.description;
    document.getElementById('modal-colorway-name').textContent = shoe.colorway;

    const techPillsContainer = document.getElementById('modal-tech-pills');
    if (techPillsContainer) {
      techPillsContainer.innerHTML = `
        <span class="tech-chip">Cushion: ${shoe.cushion_level.toUpperCase()}</span>
        <span class="tech-chip">Arch: ${shoe.arch_support.replace('_', ' ').toUpperCase()}</span>
        <span class="tech-chip">Surface: ${shoe.surface.toUpperCase()}</span>
      `;
    }

    const sizeGrid = document.getElementById('modal-size-grid');
    const sizes = Array.isArray(shoe.sizes) ? shoe.sizes : [8, 8.5, 9, 9.5, 10, 10.5, 11, 12];
    sizeGrid.innerHTML = sizes.map(size => `
      <button type="button" class="size-btn" onclick="selectModalSize(${size}, this)">
        US ${size}
      </button>
    `).join('');

    const middleBtn = sizeGrid.children[Math.floor(sizes.length / 2)];
    if (middleBtn) {
      middleBtn.click();
    }

    const featuresList = document.getElementById('modal-features-list');
    const features = Array.isArray(shoe.features) ? shoe.features : [];
    featuresList.innerHTML = features.map(f => `<li>${f}</li>`).join('');

    const specsTable = document.getElementById('modal-specs-table');
    const specs = typeof shoe.tech_specs === 'object' ? shoe.tech_specs : {};
    specsTable.innerHTML = Object.entries(specs).map(([key, val]) => `
      <div class="spec-cell">
        <span class="spec-cell-label">${key}</span>
        <span class="spec-cell-val">${val}</span>
      </div>
    `).join('');

    const reviewsList = document.getElementById('modal-reviews-list');
    if (reviews.length === 0) {
      reviewsList.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted);">No athlete reviews yet in India. Be the first to review!</p>`;
    } else {
      reviewsList.innerHTML = reviews.map(rev => `
        <div class="review-card">
          <div class="review-card-top">
            <span class="review-user">${rev.user_name} ${rev.verified ? '✓ Verified Buyer' : ''}</span>
            <span class="review-stars">${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)}</span>
          </div>
          <div class="review-heading">${rev.title}</div>
          <p class="review-body">${rev.comment}</p>
        </div>
      `).join('');
    }

    const wishlistBtn = document.getElementById('modal-wishlist-toggle');
    const isWishlisted = STATE.wishlist.some(i => i.id === shoeId);
    wishlistBtn.classList.toggle('active', isWishlisted);

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');

  } catch (err) {
    console.error('Failed to load shoe details:', err);
    showToast('Failed to load shoe details', 'error');
  }
};

window.selectModalSize = function(size, btn) {
  STATE.activeSelectedSize = size;
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const alertBox = document.getElementById('modal-size-alert');
  if (alertBox) alertBox.style.display = 'none';
};

window.quickAddToCart = function(shoeId, event) {
  if (event) event.stopPropagation();
  const shoe = STATE.shoes.find(s => s.id === shoeId);
  if (!shoe) return;

  const defaultSize = 10;
  addItemToCart({
    id: shoe.id,
    name: shoe.name,
    subtitle: shoe.subtitle,
    price: shoe.price,
    image_url: shoe.image_url,
    colorway: shoe.colorway,
    size: defaultSize,
    quantity: 1
  });

  showToast(`Added ${shoe.name} (Size US ${defaultSize}) to Bag!`);
  openCartDrawer();
};

// ==========================================
// 4. CART & SLIDE-OVER DRAWER SYSTEM (INR)
// ==========================================
function initCart() {
  const cartBtn = document.getElementById('btn-open-cart');
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-overlay');
  const closeBtn = document.getElementById('close-cart-btn');
  const applyPromoBtn = document.getElementById('btn-apply-promo');
  const checkoutTrigger = document.getElementById('btn-checkout-trigger');
  const shopEmptyBtn = document.getElementById('btn-empty-cart-shop');

  if (cartBtn) cartBtn.addEventListener('click', openCartDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);
  if (overlay) overlay.addEventListener('click', closeCartDrawer);

  if (shopEmptyBtn) {
    shopEmptyBtn.addEventListener('click', () => {
      closeCartDrawer();
      window.location.hash = '#collection';
    });
  }

  if (applyPromoBtn) {
    applyPromoBtn.addEventListener('click', applyPromoCode);
  }

  if (checkoutTrigger) {
    checkoutTrigger.addEventListener('click', () => {
      if (STATE.cart.length === 0) {
        showToast('Your bag is currently empty.');
        return;
      }
      closeCartDrawer();
      openCheckoutModal();
    });
  }

  updateCartUI();
}

function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-overlay');
  if (drawer && overlay) {
    drawer.classList.add('active');
    overlay.classList.add('active');
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-overlay');
  if (drawer && overlay) {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
  }
}

function addItemToCart(item) {
  const existing = STATE.cart.find(i => i.id === item.id && i.size === item.size && i.customTag === item.customTag);
  if (existing) {
    existing.quantity += item.quantity || 1;
  } else {
    STATE.cart.push(item);
  }
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('nike_pulse_cart', JSON.stringify(STATE.cart));
}

function updateCartUI() {
  const counter = document.getElementById('cart-counter');
  const drawerCount = document.getElementById('drawer-item-count');
  const itemsContainer = document.getElementById('cart-items-container');
  const emptyState = document.getElementById('cart-empty-state');
  const subtotalEl = document.getElementById('cart-subtotal');
  const discountRow = document.getElementById('discount-row');
  const discountEl = document.getElementById('cart-discount');
  const totalEl = document.getElementById('cart-total');
  const shippingTrackerMsg = document.getElementById('shipping-tracker-msg');
  const shippingTrackerFill = document.getElementById('shipping-tracker-fill');

  const totalCount = STATE.cart.reduce((sum, item) => sum + item.quantity, 0);
  if (counter) counter.textContent = totalCount;
  if (drawerCount) drawerCount.textContent = `(${totalCount} items)`;

  if (STATE.cart.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    if (itemsContainer) itemsContainer.innerHTML = '';
    if (itemsContainer && emptyState) itemsContainer.appendChild(emptyState);
    if (subtotalEl) subtotalEl.textContent = '₹0.00';
    if (totalEl) totalEl.textContent = '₹0.00';
    if (discountRow) discountRow.style.display = 'none';
    if (shippingTrackerFill) shippingTrackerFill.style.width = '0%';
    if (shippingTrackerMsg) shippingTrackerMsg.textContent = 'Add ₹14,000 more for Free Nike Express Shipping in India';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  if (itemsContainer) {
    itemsContainer.innerHTML = STATE.cart.map((item, index) => `
      <div class="cart-item-card">
        <img src="${item.image_url}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <h4 class="cart-item-title">${item.name}</h4>
          <span class="cart-item-variant">Size: US ${item.size} ${item.customTag ? `• Engraved: [${item.customTag}]` : ''}</span>
          <span class="cart-item-price">${formatINR(item.price * item.quantity)}</span>
          <div class="cart-item-controls">
            <button class="qty-btn" onclick="updateItemQty(${index}, -1)">−</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" onclick="updateItemQty(${index}, 1)">+</button>
          </div>
        </div>
        <button class="btn-remove-item" onclick="removeItemFromCart(${index})" title="Remove">✕</button>
      </div>
    `).join('');
  }

  const subtotal = STATE.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = subtotal * STATE.promoDiscount;
  const grandTotal = Math.max(0, subtotal - discountAmount);

  if (subtotalEl) subtotalEl.textContent = formatINR(subtotal);
  if (totalEl) totalEl.textContent = formatINR(grandTotal);

  if (discountRow && discountEl) {
    if (STATE.promoDiscount > 0) {
      discountRow.style.display = 'flex';
      discountEl.textContent = `-${formatINR(discountAmount)} (${(STATE.promoDiscount * 100).toFixed(0)}% Off)`;
    } else {
      discountRow.style.display = 'none';
    }
  }

  // Free shipping tracker (₹14,000 threshold for India)
  const freeThreshold = 14000;
  if (shippingTrackerFill && shippingTrackerMsg) {
    if (subtotal >= freeThreshold) {
      shippingTrackerFill.style.width = '100%';
      shippingTrackerMsg.innerHTML = '<strong class="text-green">✓ Unlocked Free Nike Express Shipping in India!</strong>';
    } else {
      const remaining = freeThreshold - subtotal;
      const pct = (subtotal / freeThreshold) * 100;
      shippingTrackerFill.style.width = `${pct}%`;
      shippingTrackerMsg.textContent = `Add ${formatINR(remaining)} more for Free Express Delivery`;
    }
  }
}

window.updateItemQty = function(index, delta) {
  if (!STATE.cart[index]) return;
  STATE.cart[index].quantity += delta;
  if (STATE.cart[index].quantity <= 0) {
    STATE.cart.splice(index, 1);
  }
  saveCart();
  updateCartUI();
};

window.removeItemFromCart = function(index) {
  STATE.cart.splice(index, 1);
  saveCart();
  updateCartUI();
  showToast('Item removed from your bag.');
};

function applyPromoCode() {
  const input = document.getElementById('promo-input');
  const feedback = document.getElementById('promo-feedback');
  if (!input || !feedback) return;

  const code = input.value.trim().toUpperCase();
  if (code === 'JUSTDOIT15') {
    STATE.promoDiscount = 0.15;
    STATE.activePromoCode = code;
    feedback.className = 'promo-feedback success';
    feedback.textContent = '✓ 15% VIP discount applied!';
    updateCartUI();
  } else if (code === 'NIKEVIP') {
    STATE.promoDiscount = 0.20;
    STATE.activePromoCode = code;
    feedback.className = 'promo-feedback success';
    feedback.textContent = '✓ 20% Member Elite discount applied!';
    updateCartUI();
  } else {
    feedback.className = 'promo-feedback error';
    feedback.textContent = 'Invalid promo code. Try JUSTDOIT15';
  }
}

// ==========================================
// 5. WISHLIST MANAGEMENT
// ==========================================
function initWishlist() {
  const wishlistBtn = document.getElementById('btn-open-wishlist');
  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', () => {
      if (STATE.wishlist.length === 0) {
        showToast('Your wishlist is empty. Tap the heart on any shoe to save it!');
        return;
      }
      showToast(`You have ${STATE.wishlist.length} saved shoe styles.`);
      const collection = document.getElementById('collection');
      if (collection) collection.scrollIntoView({ behavior: 'smooth' });
    });
  }
  updateWishlistCounter();
}

window.toggleWishlist = function(shoeId, event) {
  if (event) event.stopPropagation();
  const index = STATE.wishlist.findIndex(i => i.id === shoeId);
  const shoe = STATE.shoes.find(s => s.id === shoeId);

  if (index >= 0) {
    STATE.wishlist.splice(index, 1);
    showToast(`Removed from your wishlist.`);
  } else if (shoe) {
    STATE.wishlist.push({ id: shoe.id, name: shoe.name });
    showToast(`Saved ${shoe.name} to your Wishlist!`);
  }

  localStorage.setItem('nike_pulse_wishlist', JSON.stringify(STATE.wishlist));
  updateWishlistCounter();
  renderShoeGrid(STATE.shoes);
};

function updateWishlistCounter() {
  const counter = document.getElementById('wishlist-counter');
  if (counter) counter.textContent = STATE.wishlist.length;
}

// ==========================================
// 6. CHECKOUT FLOW (INR & UPI / CARDS)
// ==========================================
function initCheckout() {
  const modal = document.getElementById('checkout-modal');
  const closeBtn = document.getElementById('close-checkout-btn');
  const form = document.getElementById('checkout-form');
  const continueBtn = document.getElementById('btn-success-continue');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (continueBtn && modal) {
    continueBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      document.getElementById('checkout-grid-container').style.display = 'grid';
      document.getElementById('order-success-view').style.display = 'none';
      window.location.hash = '#collection';
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const placeOrderText = document.getElementById('place-order-text');
      const submitBtn = document.getElementById('btn-place-order');

      const name = document.getElementById('checkout-name').value.trim();
      const email = document.getElementById('checkout-email').value.trim();
      const address = document.getElementById('checkout-address').value.trim();
      const city = document.getElementById('checkout-city').value.trim();
      const postal = document.getElementById('checkout-postal').value.trim();
      const paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value || 'UPI (GPay / PhonePe / Paytm)';

      const subtotal = STATE.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const discount = subtotal * STATE.promoDiscount;
      const grandTotal = Math.max(0, subtotal - discount);

      if (submitBtn) submitBtn.disabled = true;
      if (placeOrderText) placeOrderText.textContent = 'Processing Payment (INR)...';

      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_name: name,
            email,
            shipping_address: `${address}, ${city} - ${postal}, India`,
            items: STATE.cart,
            subtotal,
            discount,
            total: grandTotal,
            payment_method: paymentMethod
          })
        });

        const data = await res.json();

        if (data.success) {
          STATE.cart = [];
          saveCart();
          updateCartUI();

          document.getElementById('checkout-grid-container').style.display = 'none';
          const successView = document.getElementById('order-success-view');
          successView.style.display = 'block';

          document.getElementById('success-order-num').textContent = data.order_number;
          document.getElementById('success-email').textContent = email;

          showToast(`Order ${data.order_number} confirmed!`);
        } else {
          showToast(data.error || 'Failed to place order.', 'error');
        }
      } catch (err) {
        console.error('Checkout error:', err);
        showToast('Checkout transaction failed.', 'error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (placeOrderText) placeOrderText.textContent = 'Pay in Rupees & Complete Order';
      }
    });
  }
}

function openCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  const itemsSummary = document.getElementById('checkout-items-summary');
  const subtotalEl = document.getElementById('checkout-subtotal');
  const discountRow = document.getElementById('checkout-discount-row');
  const discountEl = document.getElementById('checkout-discount');
  const grandTotalEl = document.getElementById('checkout-grand-total');

  if (!modal) return;

  // Pre-fill user data if available
  if (STATE.user) {
    const nameInput = document.getElementById('checkout-name');
    const emailInput = document.getElementById('checkout-email');
    if (nameInput && !nameInput.value) nameInput.value = STATE.user.name;
    if (emailInput && !emailInput.value) emailInput.value = STATE.user.email;
  }

  const subtotal = STATE.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = subtotal * STATE.promoDiscount;
  const grandTotal = Math.max(0, subtotal - discount);

  if (itemsSummary) {
    itemsSummary.innerHTML = STATE.cart.map(item => `
      <div class="checkout-sum-item">
        <span class="checkout-sum-item-name">${item.name} (US ${item.size}) × ${item.quantity}</span>
        <span class="checkout-sum-item-price">${formatINR(item.price * item.quantity)}</span>
      </div>
    `).join('');
  }

  if (subtotalEl) subtotalEl.textContent = formatINR(subtotal);
  if (grandTotalEl) grandTotalEl.textContent = formatINR(grandTotal);

  if (discountRow && discountEl) {
    if (STATE.promoDiscount > 0) {
      discountRow.style.display = 'flex';
      discountEl.textContent = `-${formatINR(discount)}`;
    } else {
      discountRow.style.display = 'none';
    }
  }

  document.getElementById('checkout-grid-container').style.display = 'grid';
  document.getElementById('order-success-view').style.display = 'none';

  modal.classList.add('active');
}

// ==========================================
// 7. MY ORDERS MODAL SYSTEM
// ==========================================
function initOrdersModal() {
  const modal = document.getElementById('orders-modal');
  const closeBtn = document.getElementById('close-orders-btn');
  const footerLink = document.getElementById('footer-my-orders-link');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  if (footerLink) {
    footerLink.addEventListener('click', (e) => {
      e.preventDefault();
      openOrdersModal();
    });
  }
}

window.openOrdersModal = async function() {
  const modal = document.getElementById('orders-modal');
  const container = document.getElementById('orders-list-container');
  if (!modal || !container) return;

  container.innerHTML = `<div class="spinner"></div><p style="text-align:center; color:var(--text-muted);">Fetching your orders from Nike India SQLite database...</p>`;
  modal.classList.add('active');

  try {
    const res = await fetch('/api/my-orders');
    const data = await res.json();
    const orders = data.orders || [];

    if (orders.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:32px 0;">
          <div style="font-size:3rem; margin-bottom:12px;">📦</div>
          <h4>No orders found</h4>
          <p style="color:var(--text-secondary); font-size:0.88rem; margin-top:6px;">You haven't placed any orders yet, or you are not signed in.</p>
          <a href="/login" class="btn-primary" style="display:inline-block; margin-top:16px;">Sign In to View Orders</a>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(ord => `
      <div class="order-card-item" style="background:var(--bg-surface-elevated); border:1px solid var(--border-glass); border-radius:var(--radius-md); padding:18px; margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:8px;">
          <div>
            <span style="font-family:var(--font-mono); font-weight:800; color:var(--color-volt);">${ord.order_number}</span>
            <small style="display:block; color:var(--text-muted); font-size:0.72rem;">${ord.created_at}</small>
          </div>
          <span class="card-badge highlight-badge">${ord.status}</span>
        </div>

        <div style="font-size:0.85rem; margin-bottom:8px;">
          <strong>Items:</strong>
          <ul style="padding-left:18px; color:var(--text-secondary); margin-top:4px;">
            ${(Array.isArray(ord.items) ? ord.items : []).map(i => `
              <li>${i.name} (US ${i.size}) × ${i.quantity}</li>
            `).join('')}
          </ul>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.06); padding-top:8px; font-size:0.86rem;">
          <span style="color:var(--text-muted); font-size:0.75rem;">Payment: ${ord.payment_method}</span>
          <span>Total: <strong style="color:var(--color-volt); font-family:var(--font-mono);">${formatINR(ord.total)}</strong></span>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Failed to load orders:', err);
    container.innerHTML = `<p style="color:var(--color-crimson);">Failed to load orders from database.</p>`;
  }
};

// ==========================================
// 8. TOAST NOTIFICATIONS & UTILITIES
// ==========================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'error' ? '⚠️' : '⚡'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-30px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function initAnnouncementBar() {
  const closeBtn = document.getElementById('close-announcement');
  const bar = document.getElementById('announcement-bar');
  if (closeBtn && bar) {
    closeBtn.addEventListener('click', () => {
      bar.style.display = 'none';
    });
  }

  const menuToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('active');
    });
  }
}
