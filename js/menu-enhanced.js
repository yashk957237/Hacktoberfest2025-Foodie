// ===== ENHANCED MENU FUNCTIONALITY =====

// State management
let originalProductList = [];
let filteredProductList = [];
let currentFilters = {
    search: '',
    category: 'all',
    price: 'all'
};
let currentSort = 'default';

// DOM Elements
const cardList = document.querySelector('.card-list');
const searchInput = document.getElementById('search');
const categorySelector = document.getElementById('categorySelector');
const priceSelector = document.getElementById('priceSelector');
const clearFiltersBtn = document.getElementById('clearFilters');
const resultsCount = document.getElementById('resultsCount');
const sortSelect = document.getElementById('sortSelect');

// ===== CATEGORY MAPPING =====
const categoryMap = {
    'Ultimate Double Cheddar Burger': 'main-course',
    'Fiery Chicken Wrap Delight': 'main-course',
    'Crispy Southern Fried Chicken': 'main-course',
    'Wood-Fired Margherita Pizza': 'main-course',
    'Triple-Layer Spicy Lasagna': 'main-course',
    'Loaded Italian Deli Sandwich': 'main-course',
    'Garlic-Herb Spaghetti Bowl': 'main-course',
    'Golden Veggie Spring Rolls': 'appetizers',
    'Paneer Tikka Masala': 'main-course',
    'Thai Basil Noodles': 'main-course',
    'Chocolate Lava Cake': 'desserts',
    'Mango Smoothie': 'beverages',
    'Spicy Tuna Sushi Roll': 'appetizers',
    'Classic Beef Tacos': 'main-course',
    'Hyderabadi Chicken Biryani': 'main-course',
    'Steamed Pork Dim Sum': 'appetizers',
    'Fresh Greek Salad': 'appetizers',
    'Lemon Herb Grilled Salmon': 'main-course',
    'Fluffy Buttermilk Pancakes': 'desserts',
    'Vietnamese Pho Beef Noodle Soup': 'main-course'
};

// ===== UTILITY FUNCTIONS =====
function showLoadingSpinner() {
    cardList.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
        </div>
    `;
}

function updateResultsCount(count) {
    const total = originalProductList.length;
    if (count === total) {
        resultsCount.textContent = `Showing all ${total} items`;
    } else {
        resultsCount.textContent = `Showing ${count} of ${total} items`;
    }
}

function sanitizeInput(str) {
    return str.replace(/[<>'"&]/g, '');
}

// ===== ENHANCED PRODUCT RENDERING =====
function renderProducts(products) {
    if (!products || products.length === 0) {
        cardList.innerHTML = `
            <div class="no-items-message" style="
                grid-column: 1 / -1;
                text-align: center;
                padding: 3rem;
                background: var(--bg-secondary);
                border: 2px dashed var(--border-color);
                border-radius: 1rem;
                color: var(--text-secondary);
            ">
                <i class="fa-solid fa-search" style="font-size: 3rem; margin-bottom: 1rem; color: var(--gold-finger);"></i>
                <h3>No items found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button onclick="clearAllFilters()" class="btn" style="margin-top: 1rem;">Clear All Filters</button>
            </div>
        `;
        updateResultsCount(0);
        return;
    }

    cardList.innerHTML = '';
    
    products.forEach((product, index) => {
        const card = document.createElement('div');
        card.classList.add('order-card');
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <div class="card-image">
                <img src="${product.image}" 
                     alt="${sanitizeInput(product.name)}" 
                     loading="lazy"
                     onerror="this.src='../imgs/placeholder.png'; this.onerror=null;">
            </div>
            <h4>${sanitizeInput(product.name)}</h4>
            <div class="category-badge">${getCategoryDisplay(product.name)}</div>
            <h4 class="price">₹${parseFloat(product.price.replace(/[₹$]/g, '')).toFixed(2)}</h4>
            <div class="card-actions">
                <button class="btn card-btn" data-id="${product.id}">
                    <i class="fa-solid fa-cart-plus"></i> Add to Cart
                </button>
                <button class="btn-secondary view-details-btn" data-id="${product.id}">
                    <i class="fa-solid fa-eye"></i> View
                </button>
            </div>
        `;
        
        // Add event listeners
        const addToCartBtn = card.querySelector('.card-btn');
        const viewDetailsBtn = card.querySelector('.view-details-btn');
        
        addToCartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            addToCartWithAnimation(product, addToCartBtn);
        });
        
        viewDetailsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openFoodModal(product);
        });
        
        cardList.appendChild(card);
    });
    
    updateResultsCount(products.length);
}

function getCategoryDisplay(productName) {
    const category = categoryMap[productName] || 'other';
    const categoryNames = {
        'appetizers': 'Appetizer',
        'main-course': 'Main Course',
        'desserts': 'Dessert',
        'beverages': 'Beverage',
        'other': 'Special'
    };
    return categoryNames[category] || 'Special';
}

function addToCartWithAnimation(product, buttonElement) {
    // Visual feedback
    const originalText = buttonElement.innerHTML;
    buttonElement.innerHTML = '<i class="fa-solid fa-check"></i> Added!';
    buttonElement.style.background = '#28a745';
    
    setTimeout(() => {
        buttonElement.innerHTML = originalText;
        buttonElement.style.background = '';
    }, 1500);
    
    // Call the original addToCart function
    if (typeof addToCart === 'function') {
        addToCart(product);
    }
}

// ===== FILTERING SYSTEM =====
function applyAllFilters() {
    let filtered = [...originalProductList];
    
    // Search filter
    if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase();
        filtered = filtered.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm))
        );
    }
    
    // Category filter
    if (currentFilters.category !== 'all') {
        filtered = filtered.filter(product => {
            const productCategory = categoryMap[product.name] || 'other';
            return productCategory === currentFilters.category;
        });
    }
    
    // Price filter
    if (currentFilters.price !== 'all') {
        filtered = filtered.filter(product => {
            const price = parseFloat(product.price.replace(/[₹$]/g, ''));
            switch (currentFilters.price) {
                case 'low': return price < 100;
                case 'mid': return price >= 100 && price <= 200;
                case 'high': return price > 200;
                default: return true;
            }
        });
    }
    
    filteredProductList = filtered;
    applySorting();
}

// ===== SORTING SYSTEM =====
function applySorting() {
    let sorted = [...filteredProductList];
    
    switch (currentSort) {
        case 'name-asc':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            sorted.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'price-asc':
            sorted.sort((a, b) => {
                const priceA = parseFloat(a.price.replace(/[₹$]/g, ''));
                const priceB = parseFloat(b.price.replace(/[₹$]/g, ''));
                return priceA - priceB;
            });
            break;
        case 'price-desc':
            sorted.sort((a, b) => {
                const priceA = parseFloat(a.price.replace(/[₹$]/g, ''));
                const priceB = parseFloat(b.price.replace(/[₹$]/g, ''));
                return priceB - priceA;
            });
            break;
        default:
            // Keep original order
            break;
    }
    
    renderProducts(sorted);
}

// ===== EVENT HANDLERS =====
function setupEventListeners() {
    // Search with debounce
    let searchTimeout;
    searchInput?.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentFilters.search = sanitizeInput(e.target.value.trim());
            applyAllFilters();
        }, 300);
    });
    
    // Category selector
    const categorySelected = categorySelector?.querySelector('.selected');
    const categoryOptions = categorySelector?.querySelectorAll('.options li');
    
    categorySelected?.addEventListener('click', () => {
        categorySelector.classList.toggle('open');
    });
    
    categoryOptions?.forEach(option => {
        option.addEventListener('click', (e) => {
            currentFilters.category = e.target.dataset.value;
            categorySelected.textContent = e.target.textContent + ' ▾';
            categorySelector.classList.remove('open');
            applyAllFilters();
        });
    });
    
    // Price selector
    const priceSelected = priceSelector?.querySelector('.selected');
    const priceOptions = priceSelector?.querySelectorAll('.options li');
    
    priceSelected?.addEventListener('click', () => {
        priceSelector.classList.toggle('open');
    });
    
    priceOptions?.forEach(option => {
        option.addEventListener('click', (e) => {
            currentFilters.price = e.target.dataset.value;
            priceSelected.textContent = e.target.textContent + ' ▾';
            priceSelector.classList.remove('open');
            applyAllFilters();
        });
    });
    
    // Sort selector
    sortSelect?.addEventListener('change', (e) => {
        currentSort = e.target.value;
        applySorting();
    });
    
    // Clear filters
    clearFiltersBtn?.addEventListener('click', clearAllFilters);
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!categorySelector?.contains(e.target)) {
            categorySelector?.classList.remove('open');
        }
        if (!priceSelector?.contains(e.target)) {
            priceSelector?.classList.remove('open');
        }
    });
}

function clearAllFilters() {
    currentFilters = { search: '', category: 'all', price: 'all' };
    currentSort = 'default';
    
    // Reset UI
    if (searchInput) searchInput.value = '';
    if (categorySelector) {
        categorySelector.querySelector('.selected').textContent = 'All Categories ▾';
        categorySelector.classList.remove('open');
    }
    if (priceSelector) {
        priceSelector.querySelector('.selected').textContent = 'All Prices ▾';
        priceSelector.classList.remove('open');
    }
    if (sortSelect) sortSelect.value = 'default';
    
    applyAllFilters();
}

// ===== INITIALIZATION =====
async function initializeEnhancedMenu() {
    try {
        showLoadingSpinner();
        
        const response = await fetch('../products.json');
        if (!response.ok) {
            throw new Error(`Failed to load menu: ${response.status}`);
        }
        
        const products = await response.json();
        if (!Array.isArray(products) || products.length === 0) {
            throw new Error('Invalid product data received');
        }
        
        originalProductList = products;
        filteredProductList = [...products];
        
        setupEventListeners();
        renderProducts(originalProductList);
        
        console.log(`✅ Enhanced menu loaded with ${products.length} items`);
        
    } catch (error) {
        console.error('❌ Failed to initialize menu:', error);
        
        cardList.innerHTML = `
            <div class="error-message" style="
                grid-column: 1 / -1;
                text-align: center;
                padding: 3rem;
                background: var(--bg-secondary);
                border: 2px solid #ff6b6b;
                border-radius: 1rem;
                color: var(--text-primary);
            ">
                <i class="fa-solid fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; color: #ff6b6b;"></i>
                <h3>Unable to load menu</h3>
                <p>${error.message}</p>
                <button onclick="location.reload()" class="btn" style="margin-top: 1rem;">
                    <i class="fa-solid fa-refresh"></i> Try Again
                </button>
            </div>
        `;
    }
}

// ===== AUTO-INITIALIZATION =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEnhancedMenu);
} else {
    initializeEnhancedMenu();
}

// Make clearAllFilters available globally for the no-results button
window.clearAllFilters = clearAllFilters;