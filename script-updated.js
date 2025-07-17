// BitarzWear - Gelişmiş Sepet Sistemi ile JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('BitarzWear site yüklendi!');
    
    // LocalStorage'dan sepeti yükle
    loadCartFromStorage();
    
    // Ana fonksiyonları başlat
    setupSmoothScrolling();
    setupCartFunctionality();
    setupAnimations();
    setupHeaderEffects();
    setupProductInteractions();
    setupCartModal();
    
    // Sepet ikonunu güncelle
    updateCartDisplay();
});

// Sepet verileri
let cart = [];

// LocalStorage'dan sepeti yükle
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('bitarzwear_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Sepeti LocalStorage'a kaydet
function saveCartToStorage() {
    localStorage.setItem('bitarzwear_cart', JSON.stringify(cart));
}

// Smooth scrolling
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
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

// Sepet fonksiyonalitesi
function setupCartFunctionality() {
    // Tüm "Sepete Ekle" butonları için event listener
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product');
            const productPrice = parseFloat(this.getAttribute('data-price'));
            const productTitle = this.closest('.product-card').querySelector('.product-title').textContent;
            const productImage = this.closest('.product-card').querySelector('.product-image .product-placeholder');
            const productImageSrc = productImage ? productImage.textContent : productTitle;

            addToCart(productId, productTitle, productPrice, productImageSrc, this);
        });
    });

    // Sepet ikonuna tıklama
    document.querySelector('.cart-icon').addEventListener('click', function(e) {
        e.preventDefault();
        openCartModal();
    });
}

// Sepete ekleme fonksiyonu
function addToCart(id, title, price, image, buttonElement) {
    // Çoklu tıklamayı engelle
    if (buttonElement.disabled) return;
    
    // Ürün zaten sepette var mı kontrol et
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        // Miktar artır
        existingItem.quantity += 1;
    } else {
        // Yeni ürün ekle
        cart.push({
            id: id,
            title: title,
            price: price,
            image: image,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }

    // Sepeti kaydet
    saveCartToStorage();
    
    // Butonu geçici olarak değiştir
    buttonElement.disabled = true;
    buttonElement.style.background = '#4CAF50';
    buttonElement.innerHTML = '<i class="fas fa-check"></i> Eklendi';

    // Sepet görüntüsünü güncelle
    updateCartDisplay();

    // Başarı mesajı göster
    showNotification(`${title} sepete eklendi!`, 'success');

    // Sepet animasyonu
    animateCartIcon();

    // 2 saniye sonra butonu eski haline döndür
    setTimeout(() => {
        buttonElement.disabled = false;
        buttonElement.style.background = '#c49a9a';
        buttonElement.textContent = 'Sepete Ekle';
    }, 2000);

    console.log('Sepet güncellendi:', cart);
}

// Sepetten çıkarma fonksiyonu
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartDisplay();
    updateCartModal();
    showNotification('Ürün sepetten çıkarıldı', 'info');
}

// Ürün miktarını güncelle
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCartToStorage();
            updateCartDisplay();
            updateCartModal();
        }
    }
}

// Sepeti temizle
function clearCart() {
    cart = [];
    saveCartToStorage();
    updateCartDisplay();
    updateCartModal();
    showNotification('Sepet temizlendi', 'info');
}

// Sepet görüntüsünü güncelle
function updateCartDisplay() {
    const cartIcon = document.querySelector('.cart-icon');
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    if (cartIcon) {
        cartIcon.innerHTML = `🛒 Sepet${itemCount > 0 ? ` (${itemCount})` : ''}`;
        
        // Sepet badge'i ekle
        if (itemCount > 0) {
            cartIcon.style.position = 'relative';
            let badge = cartIcon.querySelector('.cart-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'cart-badge';
                cartIcon.appendChild(badge);
            }
            badge.textContent = itemCount;
            badge.style.cssText = `
                position: absolute;
                top: -8px;
                right: -8px;
                background: #ff4444;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            `;
        }
    }
}

// Sepet animasyonu
function animateCartIcon() {
    const cartIcon = document.querySelector('.cart-icon');
    cartIcon.classList.add('cart-bounce');
    setTimeout(() => {
        cartIcon.classList.remove('cart-bounce');
    }, 300);
}

// Sepet modal'ını kur
function setupCartModal() {
    // Modal HTML'ini oluştur
    const modalHTML = `
        <div id="cartModal" class="cart-modal" style="display: none;">
            <div class="cart-modal-content">
                <div class="cart-header">
                    <h2>🛒 Sepetiniz</h2>
                    <button class="close-cart" onclick="closeCartModal()">&times;</button>
                </div>
                <div class="cart-items-container" id="cartItemsContainer">
                    <!-- Sepet içeriği buraya gelecek -->
                </div>
                <div class="cart-footer">
                    <div class="cart-total">
                        <strong>Toplam: <span id="cartTotalAmount">₺0</span></strong>
                    </div>
                    <div class="cart-actions">
                        <button class="clear-cart-btn" onclick="clearCart()">Sepeti Temizle</button>
                        <button class="checkout-btn" onclick="checkout()">Siparişi Tamamla</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Modal stillerini ekle
    const modalStyles = `
        <style>
        .cart-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        }
        
        .cart-modal-content {
            background: white;
            border-radius: 15px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            animation: slideIn 0.3s ease;
        }
        
        .cart-header {
            padding: 1.5rem;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .close-cart {
            background: none;
            border: none;
            font-size: 2rem;
            cursor: pointer;
            color: #999;
        }
        
        .cart-items-container {
            padding: 1rem;
            min-height: 200px;
        }
        
        .cart-item {
            display: flex;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid #eee;
            gap: 1rem;
        }
        
        .cart-item-image {
            width: 60px;
            height: 60px;
            background: #f0f0f0;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            color: #999;
        }
        
        .cart-item-details {
            flex: 1;
        }
        
        .cart-item-title {
            font-weight: bold;
            margin-bottom: 0.5rem;
        }
        
        .cart-item-price {
            color: #c49a9a;
            font-weight: bold;
        }
        
        .quantity-controls {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }
        
        .quantity-btn {
            width: 30px;
            height: 30px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 5px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .quantity-btn:hover {
            background: #f0f0f0;
        }
        
        .remove-item {
            background: #ff4444;
            color: white;
            border: none;
            padding: 0.5rem;
            border-radius: 5px;
            cursor: pointer;
        }
        
        .cart-footer {
            padding: 1.5rem;
            border-top: 1px solid #eee;
        }
        
        .cart-total {
            text-align: center;
            font-size: 1.2rem;
            margin-bottom: 1rem;
        }
        
        .cart-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
        }
        
        .clear-cart-btn {
            background: #ff4444;
            color: white;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
        }
        
        .checkout-btn {
            background: #c49a9a;
            color: white;
            border: none;
            padding: 0.8rem 2rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
        }
        
        .empty-cart {
            text-align: center;
            padding: 3rem;
            color: #999;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideIn {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', modalStyles);
}

// Sepet modal'ını aç
function openCartModal() {
    const modal = document.getElementById('cartModal');
    modal.style.display = 'flex';
    updateCartModal();
    
    // Modal dışına tıklayınca kapat
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeCartModal();
        }
    });
}

// Sepet modal'ını kapat
function closeCartModal() {
    const modal = document.getElementById('cartModal');
    modal.style.display = 'none';
}

// Sepet modal içeriğini güncelle
function updateCartModal() {
    const container = document.getElementById('cartItemsContainer');
    const totalElement = document.getElementById('cartTotalAmount');
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <h3>Sepetiniz boş</h3>
                <p>Alışverişe başlamak için ürünleri inceleyin!</p>
                <button onclick="closeCartModal(); document.getElementById('products').scrollIntoView({behavior: 'smooth'})" 
                        style="background: #c49a9a; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; margin-top: 1rem;">
                    Ürünleri İncele
                </button>
            </div>
        `;
        totalElement.textContent = '₺0';
    } else {
        container.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">${item.image}</div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">₺${item.price}</div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                        <span style="padding: 0 0.5rem; font-weight: bold;">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="removeFromCart('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalElement.textContent = `₺${total.toFixed(2)}`;
    }
}

// Sipariş tamamlama
function checkout() {
    if (cart.length === 0) {
        showNotification('Sepetiniz boş!', 'error');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // WhatsApp siparişi
    const orderText = `🛒 *BitarzWear Siparişim*\n\n` +
        cart.map(item => `• ${item.title} (${item.quantity} adet) - ₺${(item.price * item.quantity).toFixed(2)}`).join('\n') +
        `\n\n*Toplam: ₺${total.toFixed(2)}*\n*Ürün Sayısı: ${itemCount} adet*`;
    
    const whatsappUrl = `https://wa.me/905071283393?text=${encodeURIComponent(orderText)}`;
    
    window.open(whatsappUrl, '_blank');
    
    showNotification('WhatsApp\'a yönlendiriliyorsunuz...', 'success');
    closeCartModal();
}

// Animasyonlar
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

// Header scroll efektleri
function setupHeaderEffects() {
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(245, 241, 235, 0.98)';
            header.style.boxShadow = '0 2px 25px rgba(0, 0, 0, 0.15)';
        } else {
            header.style.background = 'rgba(245, 241, 235, 0.95)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
    });
}

// Ürün etkileşimleri
function setupProductInteractions() {
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    document.querySelectorAll('.product-image').forEach(img => {
        img.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
            this.style.transition = 'transform 0.3s ease';
        });

        img.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Bildirim sistemi
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
    notification.innerHTML = `
        <span style="margin-right: 8px; font-weight: bold;">${icon}</span>
        <span>${message}</span>
    `;

    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#c49a9a',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: '10001',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        fontWeight: '600',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
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

// Klavye kısayolları
document.addEventListener('keydown', function(e) {
    // ESC ile modal'ı kapat
    if (e.key === 'Escape') {
        closeCartModal();
    }
});

// Hata yakalama
window.addEventListener('error', function(e) {
    console.error('JavaScript Hatası:', e.error);
    showNotification('Bir hata oluştu. Lütfen sayfayı yenileyin.', 'error');
});

// Global fonksiyonlar
window.BitarzWear = {
    cart: cart,
    addToCart: addToCart,
    removeFromCart: removeFromCart,
    clearCart: clearCart,
    openCartModal: openCartModal,
    closeCartModal: closeCartModal,
    showNotification: showNotification
};

// Global fonksiyonları window'a ekle (HTML'den çağırabilmek için)
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.openCartModal = openCartModal;
window.closeCartModal = closeCartModal;
window.checkout = checkout;

console.log('BitarzWear Gelişmiş Sepet Sistemi yüklendi!');