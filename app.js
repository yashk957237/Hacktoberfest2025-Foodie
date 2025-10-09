var swiper = new Swiper(".mySwiper", {
    loop: true,
    navigation: {
        nextEl: ".fa-arrow-right",
        prevEl: ".fa-arrow-left",
    },
});

const cartIcon = document.querySelector('.cart-icon');
const cartTab = document.querySelector('.cart-tab');
const closeBtn = document.querySelector('.close-btn');
const cardList = document.querySelector('.card-list');
const cartList = document.querySelector('.cart-list');
const cartTotal = document.querySelector('.cart-total');
const cartValue = document.querySelector('.cart-value');
const hamberger = document.querySelector('.hamberger')
const mobileMenu = document.querySelector('.mobile-menu');
const bars = document.querySelector('.fa-bars');
const backToTop = document.querySelector('.back-to-top');
const themeToggles = document.querySelectorAll('.theme-toggle');



cartIcon.addEventListener('click', () => cartTab.classList.add("cart-tab-active"));
closeBtn.addEventListener('click', () => cartTab.classList.remove("cart-tab-active"));
hamberger.addEventListener('click', () => mobileMenu.classList.toggle("mobile-menu-active"));
hamberger.addEventListener('click', () => { bars.classList.toggle("fa-xmark"); bars.classList.toggle("fa-bars") });

window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
        backToTop && backToTop.classList.add('visible');
    } else {
        backToTop && backToTop.classList.remove('visible');
    }
});

backToTop && backToTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Theme toggle functionality
const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcons(savedTheme);
};

const updateThemeIcons = (theme) => {
    themeToggles.forEach(toggle => {
        const icon = toggle.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fa-solid fa-sun';
            toggle.classList.add('dark');
        } else {
            icon.className = 'fa-solid fa-moon';
            toggle.classList.remove('dark');
        }
    });
};

const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcons(newTheme);
};

// Add event listeners to all theme toggle buttons
themeToggles.forEach(toggle => {
    toggle.addEventListener('click', toggleTheme);
});

// Initialize theme on page load
initTheme();

let produtList = [];
let AddProduct = [];

const updateTotalPrice = () => {

    let totalPrice = 0;
    let totalQualtity = 0;

    document.querySelectorAll('.item').forEach(item => {

        const quantity = parseInt(item.querySelector('.quatity-value').textContent);
        const price = parseFloat(item.querySelector('.item-total').textContent.replace('$', ''));

        totalPrice += price;
        totalQualtity += quantity;

    })

    cartTotal.textContent = `$${totalPrice.toFixed(2)}`;
    cartValue.textContent = totalQualtity;

}

// === Show Cards ===
const showCards = () => {
    cardList.innerHTML = "";
    produtList.forEach(product => {
        const orderCard = document.createElement('div');
        orderCard.classList.add('order-card');

        orderCard.innerHTML = `
          <div class="card-image">
            <img src="${product.image}" alt="">
            </div>
            <h4>${product.name}</h4>
            <h4 class="price">${product.price}</h4>
            <a href="#" class="btn card-btn">Add to Cart</a>
        `;

        // Open modal on click
        orderCard.addEventListener("click", (e) => {
        if (!e.target.classList.contains('card-btn')) {
            
        openFoodModal(product);
    }
});
        
        // Add to cart directly
        const cardBtn = orderCard.querySelector('.card-btn');
        cardBtn.addEventListener('click', (e) => {
            e.preventDefault();
            addToCart(product);      
        });
        cardList.appendChild(orderCard);
    });
}

const addToCart = (product) => {

    let quantity = 1;
    let price = parseFloat(product.price.replace('$', ''));

    const existProduct = AddProduct.find(item => item.id === product.id);
    if (existProduct) {
        alert("Product is Already in the cart you can increase the quantity form cart");
        return;
    }

    AddProduct.push(product);

    const cartItem = document.createElement('div');
    cartItem.classList.add('item');

    cartItem.innerHTML = `
     <div class="images-container">
    <img src="${product.image}">
    </div>

    <div class="detail">
    <h4>${product.name}</h4>
    <h4 class="item-total">${product.price}</h4>
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

    plusBtn.addEventListener('click', (e) => {
        e.preventDefault();

        quantity++;
        quantityValue.textContent = quantity;
        itemTotal.textContent = `$${(quantity * price).toFixed(2)}`;
        updateTotalPrice();
    })

    minusBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (quantity > 1) {
            quantity--;
            quantityValue.textContent = quantity;
            itemTotal.textContent = `$${(price / quantity).toFixed(2)}`;
            updateTotalPrice();
        } else {
            cartItem.classList.add('slide-out');

            setTimeout(() => {
                cartItem.remove();
                updateTotalPrice();
                AddProduct = AddProduct.filter(item => item.id !== product.id);
            }, 200);
        }
    })
}

const initApp = () => {

    fetch('products.json').then
        (response => response.json()).then
        (data => {
            produtList = data;
            showCards();
        })
}

initApp();

// Modal Feature Implement
const modal = document.getElementById("foodModal");
const modalImage = document.getElementById("modalImage");
const modalName = document.getElementById("modalName");
const modalPrice = document.getElementById("modalPrice");
const modalDescription = document.getElementById("modalDescription");
const modalAddBtn = document.getElementById("addToCartBtn");
const modalViewBtn = document.getElementById("viewCartBtn");
const modalClose = document.querySelector(".modal .close");

function openFoodModal(product) {
    modalImage.src = product.image;
    modalName.textContent = product.name;
    modalPrice.textContent = product.price;
    modalDescription.textContent = product.description || "No description available.";
    modal.style.display = "flex";

    modalAddBtn.onclick = () => {
        addToCart(product);
        modal.style.display = "none";
    };

    modalViewBtn.onclick = () => {
        modal.style.display = "none";
        cartTab.classList.add("cart-tab-active");
    };
}

// Modal closing handlers
modalClose.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
document.addEventListener("keydown", e => { if (e.key === "Escape") modal.style.display = "none"; });

// Theme toggle script
const themeToggle = document.querySelectorAll('.theme-toggle');
themeToggle.forEach(btn => {
  btn.addEventListener('click', () => {
    document.documentElement.toggleAttribute('data-theme', 'dark');
  });
});