// ===== SWIPER =====
// Only initialize Swiper if the library is loaded on the page. Some pages (like item.html)
// may not include the Swiper script — guarding prevents a ReferenceError that would
// stop the rest of this file from executing (which in turn prevented the theme toggle
// event listeners from being attached).
if (typeof Swiper !== 'undefined') {
    var swiper = new Swiper(".mySwiper", {
        loop: true,
        navigation: {
            nextEl: ".fa-arrow-right",
            prevEl: ".fa-arrow-left",
        },
    });
}

// ===== ELEMENT SELECTORS =====
const cartIcon = document.querySelector('.cart-icon');
const cartTab = document.querySelector('.cart-tab');
const closeBtn = document.querySelector('.close-btn');
const cardList = document.querySelector('.card-list');
const cartList = document.querySelector('.cart-list');
const cartTotal = document.querySelector('.cart-total');
const cartValue = document.querySelector('.cart-value');
const hamburger = document.querySelector('.hamberger');
const mobileMenu = document.querySelector('.mobile-menu');
const bars = document.querySelector('.fa-bars');
const backToTop = document.querySelector('.back-to-top');
const themeToggles = document.querySelectorAll('.theme-toggle');

// ===== CART OPEN/CLOSE =====
cartIcon?.addEventListener('click', () => cartTab.classList.add("cart-tab-active"));
closeBtn?.addEventListener('click', () => cartTab.classList.remove("cart-tab-active"));
hamburger?.addEventListener('click', () => {
    mobileMenu.classList.toggle("mobile-menu-active");
    bars.classList.toggle("fa-xmark");
    bars.classList.toggle("fa-bars");
});

window.addEventListener('scroll', () => {
    if (window.scrollY > 400) backToTop?.classList.add('visible');
    else backToTop?.classList.remove('visible');
});

backToTop?.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== THEME TOGGLE =====
const applySmoothTransition = () => {
    document.documentElement.classList.add('theme-transition');
    setTimeout(() => document.documentElement.classList.remove('theme-transition'), 600);
};

const updateThemeIcons = theme => {
    themeToggles.forEach(toggle => {
        const icon = toggle && toggle.querySelector ? toggle.querySelector('i') : null;
        const label = toggle && toggle.querySelector ? toggle.querySelector('span') : null;
        if (theme === 'dark') {
             if (icon) icon.classList.replace('fa-moon', 'fa-sun');
            toggle.classList.add('dark');
            if (label) label.textContent = 'Light Mode ☀️';
        } else {
            if (icon) icon.classList.replace('fa-sun', 'fa-moon');
            toggle.classList.remove('dark');
            if (label) label.textContent = 'Dark Mode 🌙';
        }
        icon.classList.add('rotate-icon');
        setTimeout(() => icon.classList.remove('rotate-icon'), 600);
    });
};

const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applySmoothTransition();
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcons(newTheme);
};
// Use event delegation so the toggle works even if buttons are dynamically rendered
document.addEventListener('click', e => {
    const t = e.target.closest && e.target.closest('.theme-toggle');
    if (t) {
        e.preventDefault();
        toggleTheme();
    }
});

const initTheme = () => {
      const savedTheme = localStorage.getItem('theme') || null;
    // respect prefers-color-scheme if no saved preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    // also toggle a body class for compatibility with older selectors
    if (theme === 'dark') document.body.classList.add('dark-mode'); else document.body.classList.remove('dark-mode');
    updateThemeIcons(theme);
    // set aria-pressed on toggles for accessibility
    themeToggles.forEach(toggle => toggle.setAttribute('aria-pressed', theme === 'dark'));
};
initTheme();

// keep body class in sync when theme changes (for pages that check body.dark-mode)
const obs = new MutationObserver(muts => {
    muts.forEach(m => {
        if (m.attributeName === 'data-theme') {
            const t = document.documentElement.getAttribute('data-theme');
            if (t === 'dark') document.body.classList.add('dark-mode');
            else document.body.classList.remove('dark-mode');
            themeToggles.forEach(toggle => toggle.setAttribute('aria-pressed', t === 'dark'));
        }
    });
});
obs.observe(document.documentElement, { attributes: true });

// ===== PRODUCTS & CART =====
let productList = [];
let addProduct = [];

// ===== FAVORITES (WISHLIST) =====
// const FAVORITES_STORAGE_KEY = 'foodie:favorites';
// let favoriteIds = new Set();

// const loadFavorites = () => {
//     try {
//         const raw = localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]';
//         const arr = JSON.parse(raw);
//         if (Array.isArray(arr)) favoriteIds = new Set(arr);
//     } catch (_) { favoriteIds = new Set(); }
// };

// const saveFavorites = () => {
//     try { localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favoriteIds])); } catch (_) {}
// };

// const isFavorite = id => favoriteIds.has(id);
// const toggleFavorite = id => {
//     if (favoriteIds.has(id)) favoriteIds.delete(id); else favoriteIds.add(id);
//     saveFavorites();
// };
// loadFavorites();

const updateTotalPrice = () => {
    let totalPrice = 0;
    let totalQuantity = 0;

    
    // If cartList DOM isn't present (some pages like item.html), calculate totals
    // from the in-memory `addProduct` array or fallback session storage.
    if (!cartList) {
        const source = (addProduct && addProduct.length) ? addProduct : JSON.parse(sessionStorage.getItem('fallback_cart') || '[]');
        source.forEach(p => {
            const price = parseFloat(String(p.price).replace(/[₹$]/g, '')) || 0;
            const qty = p.quantity || 1;
            totalPrice += price * qty;
            totalQuantity += qty;
        });
        if (cartTotal) cartTotal.textContent = `₹${totalPrice.toFixed(2)}`;
        if (cartValue) cartValue.textContent = totalQuantity;
        return;
    }
    cartList.querySelectorAll('.item').forEach(item => {
        const quantity = parseInt(item.querySelector('.quantity-value').textContent);
        const price = parseFloat(item.querySelector('.item-total').textContent.replace(/[₹$]/g, ''));
        totalPrice += price;
        totalQuantity += quantity;
    });

    cartTotal.textContent = `₹${totalPrice.toFixed(2)}`;
    cartValue.textContent = totalQuantity;
};

// ===== ADD TO CART =====
const addToCart = product => {
    const price = parseFloat(product.price.replace(/[₹$]/g, ''));
    let existProduct = addProduct.find(item => item.id === product.id);

    if (existProduct) {
        existProduct.quantity++;
        const existingCartItem = [...cartList.querySelectorAll('.item')]
            .find(item => item.querySelector('.detail h4').textContent === product.name);
        if (existingCartItem) {
            const quantityValue = existingCartItem.querySelector('.quantity-value');
            const itemTotal = existingCartItem.querySelector('.item-total');
            quantityValue.textContent = parseInt(quantityValue.textContent) + 1;
            itemTotal.textContent = `₹${(existProduct.quantity * price).toFixed(2)}`;
        }
        updateTotalPrice();
        return;
    }
       // initialize quantity and keep in-memory list
    product.quantity = 1;
    addProduct.push(product);

    // If the cart DOM exists, render the cart item in the sidebar; otherwise
    // persist to sessionStorage as a fallback so pages like item.html can still
    // add items to cart.
    if (cartList) {
        const cartItem = document.createElement('div');
        cartItem.classList.add('item');
        cartItem.innerHTML = `
            <div class="images-container"><img src="${product.image}"></div>
            <div class="detail">
                <h4>${product.name}</h4>
                <h4 class="item-total">₹${price.toFixed(2)}</h4>
            </div>
            <div class="flex">
                <a href="#" class="quantity-btn minus"><i class="fa-solid fa-minus"></i></a>
                <h4 class="quantity-value">1</h4>
                <a href="#" class="quantity-btn plus"><i class="fa-solid fa-plus"></i></a>
            </div>
        `;
        cartList.appendChild(cartItem);
        updateTotalPrice();
        
        const plusBtn = cartItem.querySelector('.plus');
        const minusBtn = cartItem.querySelector('.minus');
        const quantityValue = cartItem.querySelector('.quantity-value');
        const itemTotal = cartItem.querySelector('.item-total');

        plusBtn.addEventListener('click', e => {
            e.preventDefault();
            product.quantity++;
            quantityValue.textContent = product.quantity;
            itemTotal.textContent = `₹${(product.quantity * price).toFixed(2)}`;
            updateTotalPrice();
        });

                minusBtn.addEventListener('click', e => {
            e.preventDefault();
            if (product.quantity > 1) {
                product.quantity--;
                quantityValue.textContent = product.quantity;
                itemTotal.textContent = `₹${(product.quantity * price).toFixed(2)}`;
                updateTotalPrice();
            } else {
                cartItem.remove();
                addProduct = addProduct.filter(item => item.id !== product.id);
                updateTotalPrice();
            }
        });
    } else {
        // fallback: store current addProduct into session storage
        sessionStorage.setItem('fallback_cart', JSON.stringify(addProduct));
        updateTotalPrice();
    }
    // emit a custom event so other pages/scripts can react (e.g., show 'Added ✓')
    try {
        const ev = new CustomEvent('product:added', { detail: { product } });
        window.dispatchEvent(ev);
    } catch (e) { /* ignore on old browsers */ }
};

// ===== CHECKOUT =====
const checkoutBtn = document.querySelector('.check-out');
checkoutBtn?.addEventListener('click', e => {
    e.preventDefault();
    if (addProduct.length === 0) return alert('Your cart is empty!');

    const checkoutData = addProduct.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: product.quantity
    }));

    sessionStorage.setItem('checkoutCart', JSON.stringify(checkoutData));
    window.location.href = '../HTML/checkout.html';
});

// ===== RENDER PRODUCT CARDS =====
const showCards = list => {
    if (!cardList) return; // some pages (like item.html) don't render a product grid
    cardList.innerHTML = '';
    if (!list || list.length === 0) {
        const msg = document.createElement('div');
        msg.classList.add('no-items-message');
        msg.textContent = 'Oops! No items available.';
        cardList.appendChild(msg);
        return;
    }

    list.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('order-card');
        const favActive = isFavorite(product.id);
        card.innerHTML = `
            <button class="fav-btn${favActive ? ' active' : ''}" aria-label="Toggle favorite" aria-pressed="${favActive}" title="${favActive ? 'Remove from favorites' : 'Add to favorites'}">
                <i class="${favActive ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
            </button>
            <div class="card-image"><img src="${product.image}" alt="${product.name}"></div>
            <h4>${product.name}</h4>
            <h4 class="price">₹${parseFloat(product.price.replace(/[₹$]/g, '')).toFixed(2)}</h4>
            <a href="#" class="btn card-btn">Add to Cart</a>
        `;
        // navigate to detail page when clicking the card (but not when Add to Cart clicked)
            card.addEventListener('click', e => {
                if (!e.target.classList.contains('card-btn')) {
                    // item.html is in the same folder as other html pages
                    window.location.href = `./item.html?id=${product.id}`;
                }
            });
        card.querySelector('.card-btn').addEventListener('click', e => {
            e.preventDefault();
            addToCart(product);
        });

        const favBtn = card.querySelector('.fav-btn');
        favBtn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(product.id);
            const nowActive = isFavorite(product.id);
            favBtn.classList.toggle('active', nowActive);
            favBtn.setAttribute('aria-pressed', String(nowActive));
            favBtn.setAttribute('title', nowActive ? 'Remove from favorites' : 'Add to favorites');
            const icon = favBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-solid', nowActive);
                icon.classList.toggle('fa-regular', !nowActive);
            }
        });
        cardList.appendChild(card);
    });
};

// ===== SEARCH + PRICE FILTER =====
const priceSelector = document.getElementById('priceSelector');
const selected = priceSelector?.querySelector('.selected');
const options = priceSelector?.querySelectorAll('.options li');
let currentPriceFilter = 'all';
let favoritesOnly = false;

selected?.addEventListener('click', () => priceSelector.classList.toggle('open'));
options?.forEach(opt => {
    opt.addEventListener('click', e => {
        currentPriceFilter = e.target.dataset.value;
        selected.textContent = e.target.textContent + ' ▾';
        priceSelector.classList.remove('open');
        applyFilters();
    });
});
document.addEventListener('click', e => {
    if (!priceSelector.contains(e.target)) priceSelector.classList.remove('open');
});

const searchInput = document.getElementById('search');
searchInput?.addEventListener('input', applyFilters);

// Favorites-only toggle (if present in page)
const favToggle = document.getElementById('favToggle');
favToggle?.addEventListener('click', e => {
    e.preventDefault();
    favoritesOnly = !favoritesOnly;
    favToggle.classList.toggle('active', favoritesOnly);
    favToggle.setAttribute('aria-pressed', String(favoritesOnly));
    applyFilters();
});

function applyFilters() {
    if (!productList) return;
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = productList.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm);
        const price = parseFloat(p.price.replace(/[₹$]/g, ''));
        let matchesPrice = true;

        if (currentPriceFilter === 'low') matchesPrice = price < 100;
        else if (currentPriceFilter === 'mid') matchesPrice = price >= 100 && price <= 200;
        else if (currentPriceFilter === 'high') matchesPrice = price > 200;

        const matchesFavorite = !favoritesOnly || isFavorite(p.id);
        return matchesSearch && matchesPrice && matchesFavorite;
    });
    showCards(filtered);
}

// ===== MODAL =====
const modal = document.getElementById('foodModal');
const modalImage = document.getElementById('modalImage');
const modalName = document.getElementById('modalName');
const modalPrice = document.getElementById('modalPrice');
const modalDescription = document.getElementById('modalDescription');
const modalAddBtn = document.getElementById('addToCartBtn');
const modalViewBtn = document.getElementById('viewCartBtn');
const modalClose = document.querySelector('#foodModal .close');

function openFoodModal(product) {
    modalImage.src = product.image;
    modalName.textContent = product.name;
    modalPrice.textContent = `₹${parseFloat(product.price.replace(/[₹$]/g, '')).toFixed(2)}`;
    modalDescription.textContent = product.description || "No description available.";
    modal.style.display = 'flex';
    modalAddBtn.onclick = () => { addToCart(product); modal.style.display = 'none'; };
    modalViewBtn.onclick = () => { cartTab.classList.add('cart-tab-active'); modal.style.display = 'none'; };
}

modalClose?.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
document.addEventListener('keydown', e => { if (e.key === "Escape") modal.style.display = 'none'; });

// ===== INIT APP =====
fetch('../products.json')
    .then(res => res.json())
    .then(data => {
        productList = data;
        showCards(productList);
          // Expose for other pages (e.g., item detail page) via window
        window.__FOODIE__ = window.__FOODIE__ || {};
        window.__FOODIE__.productList = productList;
        window.__FOODIE__.addToCart = addToCart;
    })
    .catch(err => console.error('Failed to load products:', err));
