// Render item detail page
(function () {
    'use strict';

    const getIdFromQuery = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    };

    const el = id => document.getElementById(id);

    // simple star renderer: returns small inline stars (filled/half/empty)
    const renderStars = (rating) => {
        const full = Math.floor(rating);
        const half = (rating - full) >= 0.5 ? 1 : 0;
        let out = '';
        for (let i = 0; i < full; i++) out += '★';
        if (half) out += '☆';
        for (let i = full + half; i < 5; i++) out += '☆';
        return out;
    };

    const showNotFound = () => {
        el('itemTitle').textContent = 'Item not found';
        el('itemDescription').textContent = 'We could not find the item you are looking for.';
        el('itemImage').src = '../imgs/fabicon.png';
        el('addToCartBtn').disabled = true;
    };

    const renderProduct = product => {
        el('itemImage').src = product.image;
        el('itemTitle').textContent = product.name;
        el('itemPrice').textContent = `\u20b9${parseFloat(product.price).toFixed(2)}`;
        el('itemDescription').textContent = product.description || 'No description available.';

        // optional extras (placeholder)
        const extras = el('itemExtras');
        extras.innerHTML = '';
        if (product.ingredients) {
            const h = document.createElement('h4');
            h.textContent = 'Ingredients';
            const p = document.createElement('p');
            p.textContent = product.ingredients.join(', ');
            extras.appendChild(h);
            extras.appendChild(p);
        }
    };

    const renderRecommendations = (list, currentId) => {
        const container = el('recommendList');
        container.innerHTML = '';
        if (!list || list.length === 0) return;

    // pick 4 random distinct items excluding currentId
        const candidates = list.filter(p => String(p.id) !== String(currentId));
        // shuffle
        for (let i = candidates.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
        }
    const picks = candidates.slice(0, 4);

        picks.forEach(p => {
            const card = document.createElement('div');
            card.className = 'order-card recommendation-card';

            // small snippet/description and rating (if available)
            const snippet = p.description ? (p.description.length > 60 ? p.description.slice(0, 60) + '...' : p.description) : '';
            // rating fallback: random 3.5-5.0 for visual richness if not provided
            const rating = p.rating || (Math.round((3.5 + Math.random() * 1.5) * 10) / 10);

            card.innerHTML = `
                <div class="card-image"><img src="${p.image}" alt="${p.name}"></div>
                <div class="card-body">
                    <div class="card-head">
                        <h4>${p.name}</h4>
                        <div class="rating" aria-label="rating ${rating}">
                            <span class="rating-value">${rating}</span>
                            <span class="rating-stars">${renderStars(rating)}</span>
                        </div>
                    </div>
                    <p class="snippet">${snippet}</p>
                    <div class="card-actions">
                        <a href="./item.html?id=${p.id}" class="btn view-btn">View</a>
                        <button class="btn add-small">Add</button>
                    </div>
                </div>
            `;

            // wire view button (prevent bubbling) and small add-to-cart
            const viewBtn = card.querySelector('.view-btn');
            if (viewBtn) viewBtn.addEventListener('click', e => e.stopPropagation());

            const addBtn = card.querySelector('.add-small');
            if (addBtn) {
                addBtn.addEventListener('click', e => {
                    e.preventDefault();
                    e.stopPropagation();
                    const API = window.__FOODIE__ && window.__FOODIE__.addToCart;
                    if (API && typeof API === 'function') {
                        API(p);
                        addBtn.textContent = 'Added';
                        addBtn.disabled = true;
                        setTimeout(() => { addBtn.textContent = 'Add'; addBtn.disabled = false; }, 1200);
                    } else {
                        const key = 'fallback_cart';
                        const existing = JSON.parse(sessionStorage.getItem(key) || '[]');
                        const found = existing.find(i => i.id === p.id);
                        if (found) found.quantity++;
                        else existing.push({ ...p, quantity: 1 });
                        sessionStorage.setItem(key, JSON.stringify(existing));
                        addBtn.textContent = 'Added';
                        addBtn.disabled = true;
                        setTimeout(() => { addBtn.textContent = 'Add'; addBtn.disabled = false; }, 1200);
                    }
                });
            }

            container.appendChild(card);
        });
    };

    const wireAddToCart = (product) => {
        const btn = el('addToCartBtn');
        btn.addEventListener('click', e => {
            e.preventDefault();
            // prefer global addToCart if available
            const API = window.__FOODIE__ && window.__FOODIE__.addToCart;
            if (API && typeof API === 'function') {
                API(product);
                // show small feedback; we wait for the dispatched event to update the button
                btn.disabled = true;
                btn.textContent = 'Adding...';
                setTimeout(() => { btn.disabled = false; btn.textContent = 'Add to Cart'; }, 1600);
            } else {
                // fallback: store in session
                const key = 'fallback_cart';
                const existing = JSON.parse(sessionStorage.getItem(key) || '[]');
                const found = existing.find(i => i.id === product.id);
                if (found) found.quantity++;
                else existing.push({ ...product, quantity: 1 });
                sessionStorage.setItem(key, JSON.stringify(existing));
                btn.textContent = 'Added ✓';
                btn.disabled = true;
                setTimeout(() => (btn.textContent = 'Add to Cart', btn.disabled = false), 1200);
            }
        });
    };

    // react to global add events so the UI shows a successful add
    window.addEventListener('product:added', e => {
        const added = e.detail && e.detail.product;
        if (!added) return;
        const id = getIdFromQuery();
        if (String(added.id) === String(id)) {
            const btn = el('addToCartBtn');
            if (!btn) return;
            btn.textContent = 'Added ✓';
            btn.disabled = true;
            setTimeout(() => { btn.textContent = 'Add to Cart'; btn.disabled = false; }, 1200);
        }
    });

    const init = async () => {
        const id = getIdFromQuery();
        let list = window.__FOODIE__ && window.__FOODIE__.productList;

        if (!list) {
            try {
                const res = await fetch('../products.json');
                list = await res.json();
                // also populate global for others
                window.__FOODIE__ = window.__FOODIE__ || {};
                window.__FOODIE__.productList = list;
            } catch (err) {
                console.error('Failed to load products.json', err);
            }
        }

        if (!id || !list) return showNotFound();

        const product = list.find(p => String(p.id) === String(id));
        if (!product) return showNotFound();

        renderProduct(product);
        renderRecommendations(list, id);
        wireAddToCart(product);

        // back button
        const back = document.getElementById('backBtn');
        back.addEventListener('click', e => {
            e.preventDefault();
            // go back to menu (try history first)
            if (document.referrer && document.referrer.includes('menu')) {
                history.back();
            } else {
                window.location.href = './menu.html';
            }
        });
    };

    document.addEventListener('DOMContentLoaded', init);
})();
