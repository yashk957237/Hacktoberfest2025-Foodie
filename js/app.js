// ===== SWIPER =====
var swiper = new Swiper(".mySwiper", {
    loop: true,
    navigation: {
        nextEl: ".fa-arrow-right",
        prevEl: ".fa-arrow-left",
    },
});

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
        const icon = toggle.querySelector('i');
        const label = toggle.querySelector('span');
        if (theme === 'dark') {
            icon.classList.replace('fa-moon', 'fa-sun');
            toggle.classList.add('dark');
            if (label) label.textContent = 'Light Mode ☀️';
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
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

themeToggles.forEach(toggle => toggle.addEventListener('click', toggleTheme));

const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcons(savedTheme);
};
initTheme();

// ===== PRODUCTS & CART =====
let productList = [];
let addProduct = [];

const updateTotalPrice = () => {
    let totalPrice = 0;
    let totalQuantity = 0;

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

    product.quantity = 1;
    addProduct.push(product);

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
        card.innerHTML = `
            <div class="card-image"><img src="${product.image}" alt="${product.name}"></div>
            <h4>${product.name}</h4>
            <h4 class="price">₹${parseFloat(product.price.replace(/[₹$]/g, '')).toFixed(2)}</h4>
            <a href="#" class="btn card-btn">Add to Cart</a>
        `;
        card.addEventListener('click', e => {
            if (!e.target.classList.contains('card-btn')) openFoodModal(product);
        });
        card.querySelector('.card-btn').addEventListener('click', e => {
            e.preventDefault();
            addToCart(product);
        });
        cardList.appendChild(card);
    });
};

// ===== SEARCH + PRICE FILTER =====
const priceSelector = document.getElementById('priceSelector');
const selected = priceSelector?.querySelector('.selected');
const options = priceSelector?.querySelectorAll('.options li');
let currentPriceFilter = 'all';

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

        return matchesSearch && matchesPrice;
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

// ===== LAZY LOADING OPTIMIZATION =====
const lazyLoadImages = () => {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    }, { rootMargin: '100px 0px' });
    
    images.forEach(img => imageObserver.observe(img));
};

// ===== PERFORMANCE OPTIMIZATIONS =====
let filterDebounceTimer;
function debounce(func, delay) {
    return function(...args) {
        clearTimeout(filterDebounceTimer);
        filterDebounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
}

// Optimized filter function with debouncing
const debouncedApplyFilters = debounce(applyFilters, 300);
searchInput?.addEventListener('input', debouncedApplyFilters);

// ===== INIT APP WITH ERROR HANDLING =====
const initApp = async () => {
    try {
        const response = await fetch('../products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Invalid or empty product data');
        }
        
        productList = data;
        showCards(productList);
        
        // Initialize lazy loading after products are loaded
        setTimeout(lazyLoadImages, 100);
        
        // Initialize FAQ functionality
        initFAQ();
        
        console.log(`✅ Loaded ${data.length} products successfully`);
    } catch (error) {
        console.error('❌ Failed to load products:', error);
        
        // Initialize FAQ even if products fail to load
        initFAQ();
        
        // Show user-friendly error message
        if (cardList) {
            cardList.innerHTML = `
                <div class="error-message" style="
                    text-align: center;
                    padding: 2rem;
                    background: var(--bg-secondary);
                    border: 2px solid #ff6b6b;
                    border-radius: 1rem;
                    color: var(--text-primary);
                ">
                    <h3>🚫 Unable to load menu items</h3>
                    <p>Please refresh the page or try again later.</p>
                    <button onclick="location.reload()" class="btn" style="margin-top: 1rem;">Retry</button>
                </div>
            `;
        }
    }
};

// ===== FAQ ACCORDION FUNCTIONALITY =====
const initFAQ = () => {
    console.log('🔧 Initializing FAQ...');
    const faqItems = document.querySelectorAll('.faq-item');
    console.log(`📋 Found ${faqItems.length} FAQ items`);
    
    if (faqItems.length === 0) {
        console.log('⚠️ No FAQ items found');
        return;
    }
    
    faqItems.forEach((item, index) => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = question.querySelector('i');
        
        console.log(`🔗 Setting up FAQ item ${index + 1}`);
        
        if (!question || !answer) {
            console.log(`❌ Missing elements in FAQ item ${index + 1}`);
            return;
        }
        
        // Remove any existing event listeners
        const newQuestion = question.cloneNode(true);
        question.parentNode.replaceChild(newQuestion, question);
        
        newQuestion.addEventListener('click', (e) => {
            e.preventDefault();
            console.log(`🖱️ FAQ item ${index + 1} clicked`);
            
            const isActive = item.classList.contains('active');
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    const otherIcon = otherItem.querySelector('.faq-question i');
                    
                    if (otherAnswer) {
                        otherAnswer.style.maxHeight = '0px';
                    }
                    if (otherIcon) {
                        otherIcon.style.transform = 'rotate(0deg)';
                    }
                }
            });
            
            // Toggle current FAQ item
            if (isActive) {
                console.log(`📝 Closing FAQ item ${index + 1}`);
                item.classList.remove('active');
                answer.style.maxHeight = '0px';
                if (icon) icon.style.transform = 'rotate(0deg)';
            } else {
                console.log(`📖 Opening FAQ item ${index + 1}`);
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
                if (icon) icon.style.transform = 'rotate(180deg)';
            }
        });
        
        // Add keyboard accessibility
        newQuestion.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                newQuestion.click();
            }
        });
        
        // Make question focusable for accessibility
        newQuestion.setAttribute('tabindex', '0');
        newQuestion.setAttribute('role', 'button');
        newQuestion.setAttribute('aria-expanded', 'false');
        newQuestion.style.cursor = 'pointer';
        
        // Set initial state
        answer.style.maxHeight = '0px';
        answer.style.overflow = 'hidden';
        answer.style.transition = 'max-height 0.4s ease, opacity 0.3s ease';
        
        console.log(`✅ FAQ item ${index + 1} initialized successfully`);
    });
    
    console.log('✅ FAQ initialization complete');
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initApp();
        // Always initialize FAQ regardless of product loading
        setTimeout(initFAQ, 100);
    });
} else {
    initApp();
    // Always initialize FAQ regardless of product loading
    setTimeout(initFAQ, 100);
}
