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
cartIcon.addEventListener('click', () => cartTab.classList.add("cart-tab-active"));
closeBtn.addEventListener('click', () => cartTab.classList.remove("cart-tab-active"));
hamburger.addEventListener('click', () => {
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
let AddProduct = [];

const updateTotalPrice = () => {
    let totalPrice = 0;
    let totalQuantity = 0;

    cartList.querySelectorAll('.item').forEach(item => {
        const quantity = parseInt(item.querySelector('.quatity-value').textContent);
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
    let existProduct = AddProduct.find(item => item.id === product.id);

    if (existProduct) {
        existProduct.quantity++;
        const existingCartItem = [...cartList.querySelectorAll('.item')]
            .find(item => item.querySelector('.detail h4').textContent === product.name);
        if (existingCartItem) {
            const quantityValue = existingCartItem.querySelector('.quatity-value');
            const itemTotal = existingCartItem.querySelector('.item-total');
            quantityValue.textContent = parseInt(quantityValue.textContent) + 1;
            itemTotal.textContent = `₹${(existProduct.quantity * price).toFixed(2)}`;
        }
        updateTotalPrice();
        return;
    }

    product.quantity = 1;
    AddProduct.push(product);

    const cartItem = document.createElement('div');
    cartItem.classList.add('item');
    cartItem.innerHTML = `
        <div class="images-container"><img src="${product.image}"></div>
        <div class="detail">
            <h4>${product.name}</h4>
            <h4 class="item-total">₹${price.toFixed(2)}</h4>
        </div>
        <div class="flex">
            <a href="#" class="quatity-btn minus"><i class="fa-solid fa-minus"></i></a>
            <h4 class="quatity-value">1</h4>
            <a href="#" class="quatity-btn plus"><i class="fa-solid fa-plus"></i></a>
        </div>
    `;
    cartList.appendChild(cartItem);
    updateTotalPrice();

    const plusBtn = cartItem.querySelector('.plus');
    const minusBtn = cartItem.querySelector('.minus');
    const quantityValue = cartItem.querySelector('.quatity-value');
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
            AddProduct = AddProduct.filter(item => item.id !== product.id);
            updateTotalPrice();
        }
    });
};

// ===== CHECKOUT =====
const checkoutBtn = document.querySelector('.check-out');
checkoutBtn.addEventListener('click', e => {
    e.preventDefault();
    if (AddProduct.length === 0) return alert('Your cart is empty!');

    const checkoutData = AddProduct.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: product.quantity
    }));

    sessionStorage.setItem('checkoutCart', JSON.stringify(checkoutData));
    window.location.href = 'checkout.html';
    
    // Redirect to checkout page
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
            <h4 class="price">₹${parseFloat(product.price.replace(/[₹$]/g,'')).toFixed(2)}</h4>
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
const selected = priceSelector.querySelector('.selected');
const options = priceSelector.querySelectorAll('.options li');
let currentPriceFilter = 'all';

selected.addEventListener('click', () => priceSelector.classList.toggle('open'));
options.forEach(opt => {
    opt.addEventListener('click', e => {
        currentPriceFilter = e.target.dataset.value;
        selected.textContent = e.target.textContent + ' ▾';
        priceSelector.classList.remove('open');
        applyFilters();
    });
});
document.addEventListener('click', e => { if (!priceSelector.contains(e.target)) priceSelector.classList.remove('open'); });

const searchInput = document.getElementById('search');
searchInput.addEventListener('input', applyFilters);

function applyFilters() {
    if (!productList) return;
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = productList.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm);
        const price = parseFloat(p.price.replace(/[₹$]/g,''));
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
    modalPrice.textContent = `₹${parseFloat(product.price.replace(/[₹$]/g,'')).toFixed(2)}`;
    modalDescription.textContent = product.description || "No description available.";
    modal.style.display = 'flex';
    modalAddBtn.onclick = () => { addToCart(product); modal.style.display='none'; };
    modalViewBtn.onclick = () => { cartTab.classList.add('cart-tab-active'); modal.style.display='none'; };
}

modalClose.onclick = () => modal.style.display='none';
window.onclick = e => { if (e.target === modal) modal.style.display='none'; };
document.addEventListener('keydown', e => { if (e.key === "Escape") modal.style.display='none'; });

// ===== INIT APP =====
fetch('../products.json')
    .then(res => res.json())
    .then(data => {
        productList = data;
        showCards(productList);
    });
