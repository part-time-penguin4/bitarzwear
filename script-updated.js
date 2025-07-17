// BitarzWear - Güncellenmiş Ana Site JavaScript
// Admin panel entegrasyonu ile

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Data Manager'ın yüklenmesini bekle
    if (typeof window.dataManager !== 'undefined') {
        initializeWebsiteWithData();
    } else {
        setTimeout(() => initializeWebsiteWithData(), 100);
    }
});

// Data Manager ile site başlatma
function initializeWebsiteWithData() {
    loadProductsFromData();
    setupCartFunctionality();
    setupProductSync();
    setupSmoothScrolling();
    setupAnimations();
    setupHeaderEffects();
    setupSearchFunctionality();
    updateCartDisplay();
    
    console.log('BitarzWear site initialized with data manager');
}

// Ürünleri Data Manager'dan yükle
function loadProductsFromData() {
    try {
        const products = BitarzWearAPI.getProducts({ 
            status: 'active',
            inStock: true 
        });
        
        const productsGrid = document.querySelector('.products-grid');
        
        if (productsGrid && products.length > 0) {
            productsGrid.innerHTML = products.map(product => createProductCard(product)).join('');
            setupProductEventListeners();
            
            // Animasyonları tekrar başlat
            setupAnimations();
        }
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback olarak static ürünleri göster
        loadFallbackProducts();
    }
}

// Ürün kartı oluştur
function createProductCard(product) {
    const badgeStyle = product.badgeColor ? 
        `style="background: ${product.badgeColor};"` : '';
    
    return `
        <div class="product-card fade-in">
            <div class="product-image" data-product="${product.category}-${product.id}">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="product-badge" ${badgeStyle}>${product.badge}</div>
                ${product.stock <= 5 ? '<div class="low-stock-warning">Son Parçalar!</div>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <div class="product-price">
                    ₺${product.price}
                    <span class="original-price">₺${product.originalPrice}</span>
                </div>
                <button class="add-to-cart" 
                        data-product-id="${product.id}" 
                        data-price="${product.price}"
                        data-name="${product.name}"
                        ${product.stock <= 0 ? 'disabled' : ''}>
                    ${product.stock <= 0 ? 'Stok Yok' : 'Sepete Ekle'}
                </button>
            </div>
        </div>
    `;
}

// Sepet fonksiyonalitesini güncelle
function setupCartFunctionality() {
    // Mevcut sepet durumunu yükle
    updateCartDisplay();
    
    // Sepete ekle butonları için event listener
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart')) {
            handleAddToCart(e.target);
        }
    });
}

// Sepete ekleme işlemi
function handleAddToCart(button) {
    if (button.disabled) return;
    
    const productId = parseInt(button.getAttribute('data-product-id'));
    const productPrice = parseInt(button.getAttribute('data-price'));
    const productName = button.getAttribute('data-name');
    
    try {
        // Data Manager ile sepete ekle
        const cart = BitarzWearAPI.addToCart(productId, 1);
        
        // Stok kontrolü ve güncelleme
        const product = BitarzWearAPI.getProduct(productId);
        if (product) {
            // Optimistic UI update
            BitarzWearAPI.updateProduct(productId, { 
                stock: Math.max(0, product.stock - 1) 
            });
        }
        
        // UI güncelleme
        button.disabled = true;
        button.style.background = '#4CAF50';
        button.textContent = 'Sepete Eklendi ✓';
        
        // Sepet sayısını güncelle
        updateCartDisplay();
        
        // Animasyon efekti
        button.closest('.product-card').classList.add('added-to-cart');
        
        // Success notification
        showNotification(`${productName} sepete eklendi!`, 'success');
        
        // Reset button after 2 seconds
        setTimeout(() => {
            button.disabled = false;
            button.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
            button.textContent = 'Sepete Ekle';
            button.closest('.product-card').classList.remove('added-to-cart');
        }, 2000);
        
    } catch (error) {
        console.error('Add to cart error:', error);
        showNotification('Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
    }
}

// Sepet görüntüsünü güncelle
function updateCartDisplay() {
    try {
        const cart = BitarzWearAPI.getCart();
        const cartIcon = document.querySelector('.cart-icon');
        const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
        
        if (cartIcon) {
            cartIcon.innerHTML = `🛒 Sepet${itemCount > 0 ? ` (${itemCount})` : ''}`;
            
            // Cart animation
            if (itemCount > 0) {
                cartIcon.classList.add('cart-bounce');
                setTimeout(() => cartIcon.classList.remove('cart-bounce'), 300);
            }
        }
        
        // Update cart total if cart page exists
        updateCartTotalDisplay();
        
    } catch (error) {
        console.error('Cart display update error:', error);
    }
}

// Sepet toplam güncelle
function updateCartTotalDisplay() {
    const cartTotalElement = document.querySelector('.cart-total');
    if (cartTotalElement) {
        const total = BitarzWearAPI.getCartTotal();
        cartTotalElement.textContent = `₺${total.toLocaleString()}`;
    }
}

// Ürün senkronizasyonu
function setupProductSync() {
    try {
        // Admin'den gelen ürün değişikliklerini dinle
        BitarzWearAPI.on('products', (products) => {
            loadProductsFromData();
            showNotification('Ürünler güncellendi!', 'info');
        });
        
        // Stok değişikliklerini dinle
        BitarzWearAPI.on('stock-update', (data) => {
            handleStockUpdate(data.productId, data.newStock);
        });
        
        // Sepet değişikliklerini dinle
        BitarzWearAPI.on('cart', (cart) => {
            updateCartDisplay();
        });
        
    } catch (error) {
        console.error('Product sync setup error:', error);
    }
}

// Stok güncelleme işlemi
function handleStockUpdate(productId, newStock) {
    const productCard = document.querySelector(`[data-product-id="${productId}"]`)?.closest('.product-card');
    if (productCard) {
        const button = productCard.querySelector('.add-to-cart');
        
        if (newStock <= 0) {
            productCard.style.opacity = '0.6';
            button.disabled = true;
            button.textContent = 'Stok Yok';
        } else if (newStock <= 5) {
            // Düşük stok uyarısı
            const warning = productCard.querySelector('.low-stock-warning') || 
                           document.createElement('div');
            warning.className = 'low-stock-warning';
            warning.textContent = 'Son Parçalar!';
            
            if (!productCard.querySelector('.low-stock-warning')) {
                productCard.querySelector('.product-image').appendChild(warning);
            }
        }
    }
}

// Arama fonksiyonalitesi
function setupSearchFunctionality() {
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            searchTimeout = setTimeout(() => {
                if (query.length >= 2) {
                    searchProducts(query);
                } else if (query.length === 0) {
                    loadProductsFromData(); // Reset to all products
                }
            }, 300);
        });
    }
}

// Ürün arama
function searchProducts(query) {
    try {
        const results = BitarzWearAPI.searchProducts(query);
        const productsGrid = document.querySelector('.products-grid');
        
        if (productsGrid) {
            if (results.length > 0) {
                productsGrid.innerHTML = results.map(product => createProductCard(product)).join('');
                setupProductEventListeners();
            } else {
                productsGrid.innerHTML = `
                    <div class="no-results">
                        <h3>Aradığınız ürün bulunamadı</h3>
                        <p>"${query}" için sonuç bulunamadı.</p>
                        <button onclick="loadProductsFromData()" class="btn btn-primary">
                            Tüm Ürünleri Göster
                        </button>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Search error:', error);
    }
}

// Smooth scrolling
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Animation setup
function setupAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
}

// Header effects
function setupHeaderEffects() {
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 25px rgba(0, 0, 0, 0.15)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
    });
}

// Product event listeners
function setupProductEventListeners() {
    // Product card hover effects
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-5px)';
        });
    });

    // Product image zoom effect
    document.querySelectorAll('.product-image img').forEach(img => {
        img.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.3s ease';
        });

        img.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Fallback ürünler (Data Manager çalışmazsa)
function loadFallbackProducts() {
    console.warn('Loading fallback products - Data Manager not available');
    
    const fallbackProducts = [
        {
            id: 1,
            title: 'Oversize Basic Tee',
            price: 129,
            originalPrice: 179,
            badge: 'OVERSIZE',
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI4MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk92ZXJzaXplIFRlZTwvdGV4dD4KPC9zdmc+',
            category: 'tshirt',
            stock: 45
        }
        // Daha fazla fallback ürün eklenebilir
    ];
    
    const productsGrid = document.querySelector('.products-grid');
    if (productsGrid) {
        productsGrid.innerHTML = fallbackProducts.map(product => createProductCard(product)).join('');
        setupProductEventListeners();
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
    notification.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <span class="notification-message">${message}</span>
    `;

    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: getNotificationColor(type),
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: '10000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        fontWeight: '600',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        maxWidth: '300px'
    });

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function getNotificationColor(type) {
    switch(type) {
        case 'success': return '#4CAF50';
        case 'error': return '#f44336';
        case 'warning': return '#ff9800';
        default: return '#667eea';
    }
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    showNotification('Bir hata oluştu. Lütfen sayfayı yenileyin.', 'error');
});

// Performance monitoring
function trackPerformance() {
    window.addEventListener('load', () => {
        if (performance.getEntriesByType) {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart + 'ms');
            }
        }
    });
}

// Sepet sayfası fonksiyonları (eğer ayrı sayfa varsa)
function setupCartPage() {
    const cartContainer = document.querySelector('.cart-container');
    if (cartContainer) {
        renderCartItems();
        setupCartActions();
    }
}

function renderCartItems() {
    const cart = BitarzWearAPI.getCart();
    const cartContainer = document.querySelector('.cart-items');
    
    if (cartContainer) {
        if (cart.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <h3>Sepetiniz boş</h3>
                    <p>Alışverişe başlamak için ürünler ekleyin.</p>
                    <a href="#products" class="btn btn-primary">Ürünleri İncele</a>
                </div>
            `;
        } else {
            cartContainer.innerHTML = cart.map(item => `
                <div class="cart-item" data-product-id="${item.productId}">
                    <img src="${item.image}" alt="${item.productName}">
                    <div class="item-details">
                        <h4>${item.productName}</h4>
                        <div class="item-controls">
                            <button onclick="updateCartQuantity(${item.productId}, -1)">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button onclick="updateCartQuantity(${item.productId}, 1)">+</button>
                        </div>
                        <div class="item-price">₺${(item.price * item.quantity).toLocaleString()}</div>
                    </div>
                    <button onclick="removeFromCart(${item.productId})" class="remove-btn">×</button>
                </div>
            `).join('');
        }
        
        updateCartTotalDisplay();
    }
}

function updateCartQuantity(productId, change) {
    const cart = BitarzWearAPI.getCart();
    const item = cart.find(i => i.productId === productId);
    
    if (item) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) {
            BitarzWearAPI.removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            BitarzWearAPI.setData('cart', cart);
        }
        renderCartItems();
        updateCartDisplay();
    }
}

function removeFromCart(productId) {
    BitarzWearAPI.removeFromCart(productId);
    renderCartItems();
    updateCartDisplay();
    showNotification('Ürün sepetten çıkarıldı', 'info');
}

// Initialize performance tracking
trackPerformance();

// Export functions for global access
window.BitarzWearSite = {
    loadProducts: loadProductsFromData,
    searchProducts,
    updateCartDisplay,
    showNotification,
    handleAddToCart
};

console.log('BitarzWear site script loaded successfully!');
// Fallback ürün ekleme fonksiyonu
function addMoreProducts() {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;
    
    const additionalProducts = [
        {
            id: 'white-tee',
            title: 'Oversize White Tee',
            price: 139,
            originalPrice: 189,
            badge: 'WHITE',
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI4MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZmZmZmZmIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiNjY2MiIHRleHQtYW5jaG9yPSJtaWRkbGUiPldoaXRlIFRlZTwvdGV4dD4KPC9zdmc+'
        },
        {
            id: 'grey-pants',
            title: 'Grey Baggy Pants',
            price: 199,
            originalPrice: 279,
            badge: 'BAGGY',
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI4MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZThlOGU4Ii8+Cjx0ZXh0IHg9IjE0MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiNhYWEiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkdyZXkgUGFudHM8L3RleHQ+Cjwvc3ZnPg=='
        },
        {
            id: 'black-pants',
            title: 'Black Loose Fit',
            price: 179,
            originalPrice: 239,
            badge: 'LOOSE',
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI4MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMmEyYTJhIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM3NzciIHRleHQtYW5jaG9yPSJtaWRkbGUiPkJsYWNrIFBhbnRzPC90ZXh0Pgo8L3N2Zz4='
        },
        {
            id: 'comfy-set',
            title: 'Comfy Set Bundle',
            price: 299,
            originalPrice: 399,
            badge: 'BUNDLE',
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI4MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNvbWZ5IFNldDwvdGV4dD4KPC9zdmc+'
        },
        {
            id: 'bomber-jacket',
            title: 'Street Bomber',
            price: 249,
            originalPrice: 329,
            badge: 'BOMBER',
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI4MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMmEyYTJhIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM3NzciIHRleHQtYW5jaG9yPSJtaWRkbGUiPkJvbWJlcjwvdGV4dD4KPC9zdmc+'
        }
    ];
    
    // Mevcut ürün sayısını kontrol et
    const currentProducts = productsGrid.querySelectorAll('.product-card').length;
    console.log('Mevcut ürün sayısı:', currentProducts);
    
    if (currentProducts < 6) {
        additionalProducts.forEach(product => {
            const productHTML = `
                <div class="product-card fade-in">
                    <div class="product-image" data-product="${product.id}">
                        <img src="${product.image}" alt="${product.title}">
                        <div class="product-badge">${product.badge}</div>
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.title}</h3>
                        <div class="product-price">
                            ₺${product.price}
                            <span class="original-price">₺${product.originalPrice}</span>
                        </div>
                        <button class="add-to-cart" data-product="${product.id}" data-price="${product.price}">Sepete Ekle</button>
                    </div>
                </div>
            `;
            productsGrid.insertAdjacentHTML('beforeend', productHTML);
        });
        
        console.log('Ürünler eklendi! Yeni toplam:', productsGrid.querySelectorAll('.product-card').length);
    }
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addMoreProducts, 1000); // 1 saniye bekle
});