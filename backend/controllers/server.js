// BitarzWear Backend API - Düzeltilmiş Versiyon
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    next();
});
app.use(helmet()); // Güvenlik headers
app.use(compression()); // Gzip sıkıştırma
app.use(cors({
    origin: ['https://part-time-penguin4.github.io', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined')); // Log middleware

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // IP başına maksimum 100 istek
    message: {
        error: 'Çok fazla istek gönderildi, lütfen 15 dakika sonra tekrar deneyin.'
    }
});
app.use('/api/', limiter);

// Basit veritabanı simülasyonu
let database = {
    products: [
        {
            id: 1,
            name: 'Oversize Basic Tee',
            title: 'Oversize Basic Tee',
            category: 'tshirt',
            categoryName: 'Tişört',
            price: 129,
            originalPrice: 179,
            stock: 45,
            status: 'active',
            description: 'Rahat kesim, yüksek kalite pamuklu oversize tişört.',
            image: '/images/oversize-basic-tee.jpg',
            badge: 'OVERSIZE',
            featured: true,
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            colors: ['Gri', 'Siyah', 'Beyaz'],
            material: '%100 Pamuk',
            tags: ['oversize', 'basic', 'tshirt', 'street'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 2,
            name: 'Oversize White Tee',
            title: 'Oversize White Tee',
            category: 'tshirt',
            categoryName: 'Tişört',
            price: 139,
            originalPrice: 189,
            stock: 32,
            status: 'active',
            description: 'Beyaz oversize tişört, şık ve rahat.',
            image: '/images/oversize-white-tee.jpg',
            badge: 'WHITE',
            featured: true,
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            colors: ['Beyaz'],
            material: '%100 Pamuk',
            tags: ['oversize', 'white', 'tshirt', 'street'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 3,
            name: 'Grey Baggy Pants',
            title: 'Grey Baggy Pants',
            category: 'pants',
            categoryName: 'Pantolon',
            price: 199,
            originalPrice: 279,
            stock: 8,
            status: 'low-stock',
            description: 'Gri bol kesim pantolon, sokak stili.',
            image: '/images/grey-baggy-pants.jpg',
            badge: 'BAGGY',
            featured: true,
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Gri'],
            material: '%65 Pamuk %35 Polyester',
            tags: ['baggy', 'pants', 'grey', 'street'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ],
    orders: [],
    customers: [],
    categories: [
        { id: 1, name: 'Tişört', slug: 'tshirt', active: true },
        { id: 2, name: 'Pantolon', slug: 'pants', active: true },
        { id: 3, name: 'Takım', slug: 'set', active: true },
        { id: 4, name: 'Ceket', slug: 'jacket', active: true }
    ],
    settings: {
        siteName: 'BitarzWear',
        siteDescription: 'Sokak stili, uygun fiyat ve yenilikçi giyim markası.',
        currency: 'TRY',
        currencySymbol: '₺',
        freeShippingLimit: 250,
        shippingCost: 30,
        taxRate: 0.18,
        contactEmail: 'info@bitarzwear.com',
        contactPhone: '+90 507 128 3393',
        whatsappNumber: '+90 507 128 3393',
        address: 'Sakarya/Erenler, Türkiye',
        socialMedia: {
            instagram: 'https://instagram.com/bitarzwear',
            dolap: 'https://dolap.com/bitarzwear',
            shopier: 'https://www.shopier.com/'
        }
    }
};

// Utility functions
const generateId = (array) => {
    return array.length > 0 ? Math.max(...array.map(item => item.id), 0) + 1 : 1;
};

const generateOrderNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BW-${year}-${random}`;
};

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0'
    });
});

// Ana sayfa
app.get('/', (req, res) => {
    res.json({
        message: 'BitarzWear API Server',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            products: '/api/products',
            orders: '/api/orders',
            categories: '/api/categories',
            settings: '/api/settings'
        }
    });
});

// Products Routes
app.get('/api/products', asyncHandler(async (req, res) => {
    const { 
        category, 
        featured, 
        status = 'active', 
        limit = 50, 
        offset = 0,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = req.query;

    let products = [...database.products];

    // Filtreleme
    if (category) {
        products = products.filter(p => p.category === category);
    }
    if (featured !== undefined) {
        products = products.filter(p => p.featured === (featured === 'true'));
    }
    if (status) {
        products = products.filter(p => p.status === status);
    }
    if (search) {
        const searchLower = search.toLowerCase();
        products = products.filter(p => 
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower) ||
            (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        );
    }

    // Sıralama
    products.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];
        
        if (sortBy === 'price') {
            aVal = parseFloat(aVal);
            bVal = parseFloat(bVal);
        }
        
        if (sortOrder === 'desc') {
            return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
    });

    // Pagination
    const total = products.length;
    products = products.slice(offset, offset + parseInt(limit));

    res.json({
        success: true,
        data: products,
        pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
            totalPages: Math.ceil(total / limit)
        }
    });
}));

app.get('/api/products/:id', asyncHandler(async (req, res) => {
    const product = database.products.find(p => p.id === parseInt(req.params.id));
    
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Ürün bulunamadı'
        });
    }

    res.json({
        success: true,
        data: product
    });
}));

// Orders Routes
app.get('/api/orders', asyncHandler(async (req, res) => {
    const { 
        status, 
        customer_email,
        limit = 50, 
        offset = 0
    } = req.query;

    let orders = [...database.orders];

    // Filtreleme
    if (status) {
        orders = orders.filter(o => o.status === status);
    }
    if (customer_email) {
        orders = orders.filter(o => o.customer && o.customer.email === customer_email);
    }

    // Pagination
    const total = orders.length;
    orders = orders.slice(offset, offset + parseInt(limit));

    res.json({
        success: true,
        data: orders,
        pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
            totalPages: Math.ceil(total / limit)
        }
    });
}));

app.post('/api/orders', asyncHandler(async (req, res) => {
    const {
        customer,
        items,
        notes = ''
    } = req.body;

    // Validasyon
    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Müşteri bilgileri ve ürünler zorunlu'
        });
    }

    // Ürün stoklarını kontrol et
    for (const item of items) {
        const product = database.products.find(p => p.id === item.productId);
        if (!product) {
            return res.status(400).json({
                success: false,
                message: `Ürün bulunamadı: ${item.productId}`
            });
        }
        if (product.stock < item.quantity) {
            return res.status(400).json({
                success: false,
                message: `Yetersiz stok: ${product.name}`
            });
        }
    }

    // Fiyat hesaplama
    const subtotal = items.reduce((sum, item) => {
        const product = database.products.find(p => p.id === item.productId);
        return sum + (product.price * item.quantity);
    }, 0);

    const shipping = subtotal >= database.settings.freeShippingLimit ? 0 : database.settings.shippingCost;
    const tax = subtotal * database.settings.taxRate;
    const total = subtotal + shipping + tax;

    const newOrder = {
        id: generateId(database.orders),
        orderNumber: generateOrderNumber(),
        customer,
        items: items.map(item => {
            const product = database.products.find(p => p.id === item.productId);
            return {
                ...item,
                productName: product.name,
                price: product.price
            };
        }),
        total: Math.round(total * 100) / 100,
        subtotal: Math.round(subtotal * 100) / 100,
        shipping: Math.round(shipping * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'whatsapp',
        trackingNumber: '',
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Stokları düş
    items.forEach(item => {
        const productIndex = database.products.findIndex(p => p.id === item.productId);
        if (productIndex !== -1) {
            database.products[productIndex].stock -= item.quantity;
            if (database.products[productIndex].stock <= 5) {
                database.products[productIndex].status = 'low-stock';
            }
        }
    });

    database.orders.push(newOrder);

    res.status(201).json({
        success: true,
        message: 'Sipariş başarıyla oluşturuldu',
        data: newOrder
    });
}));

// Categories Routes
app.get('/api/categories', asyncHandler(async (req, res) => {
    const { active } = req.query;
    
    let categories = [...database.categories];
    
    if (active !== undefined) {
        categories = categories.filter(c => c.active === (active === 'true'));
    }

    res.json({
        success: true,
        data: categories
    });
}));

// Settings Routes
app.get('/api/settings', asyncHandler(async (req, res) => {
    res.json({
        success: true,
        data: database.settings
    });
}));

// WhatsApp Integration
app.post('/api/whatsapp/send-order', asyncHandler(async (req, res) => {
    const { orderId } = req.body;
    
    const order = database.orders.find(o => o.id === parseInt(orderId));
    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Sipariş bulunamadı'
        });
    }

    const whatsappNumber = database.settings.whatsappNumber.replace('+', '');
    const orderText = `🛒 *BitarzWear Siparişi*\n\n` +
        `📋 Sipariş No: ${order.orderNumber}\n` +
        `👤 Müşteri: ${order.customer.name}\n` +
        `📧 Email: ${order.customer.email}\n` +
        `📱 Telefon: ${order.customer.phone}\n\n` +
        `*Ürünler:*\n` +
        order.items.map(item => 
            `• ${item.productName}${item.size ? ` (${item.size})` : ''}${item.color ? ` - ${item.color}` : ''} x${item.quantity} - ${database.settings.currencySymbol}${(item.price * item.quantity).toFixed(2)}`
        ).join('\n') +
        `\n\n*Ara Toplam:* ${database.settings.currencySymbol}${order.subtotal.toFixed(2)}` +
        `\n*Kargo:* ${database.settings.currencySymbol}${order.shipping.toFixed(2)}` +
        `\n*Toplam:* ${database.settings.currencySymbol}${order.total.toFixed(2)}`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderText)}`;

    res.json({
        success: true,
        message: 'WhatsApp linki oluşturuldu',
        data: {
            whatsappUrl,
            orderText
        }
    });
}));

// Analytics Routes
app.get('/api/analytics/dashboard', asyncHandler(async (req, res) => {
    const totalProducts = database.products.length;
    const activeProducts = database.products.filter(p => p.status === 'active').length;
    const lowStockProducts = database.products.filter(p => p.status === 'low-stock').length;
    
    const totalOrders = database.orders.length;
    const pendingOrders = database.orders.filter(o => o.status === 'pending').length;
    const completedOrders = database.orders.filter(o => o.status === 'delivered').length;
    
    const totalRevenue = database.orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + o.total, 0);
    
    const totalCustomers = database.customers.length;

    res.json({
        success: true,
        data: {
            products: {
                total: totalProducts,
                active: activeProducts,
                lowStock: lowStockProducts
            },
            orders: {
                total: totalOrders,
                pending: pendingOrders,
                completed: completedOrders
            },
            revenue: {
                total: Math.round(totalRevenue * 100) / 100,
                currency: database.settings.currencySymbol
            },
            customers: {
                total: totalCustomers
            }
        }
    });
}));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Sunucu hatası',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint bulunamadı'
    });
});

// Server başlatma
app.listen(PORT, () => {
    console.log(`🚀 BitarzWear API sunucusu ${PORT} portunda çalışıyor`);
    console.log(`📝 API Dokümantasyonu: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Ortam: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Test URL: http://localhost:${PORT}`);
});

module.exports = app;

// Users Routes - server.js dosyanıza Categories Routes'tan sonra ekleyin

// Users database'i ekleyin (database objesine)
database.users = [
    {
        id: 1,
        name: 'Admin User',
        email: 'admin@bitarzwear.com',
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 2,
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// Users Routes
app.get('/api/users', asyncHandler(async (req, res) => {
    const { 
        role, 
        status = 'active', 
        limit = 50, 
        offset = 0,
        search
    } = req.query;

    let users = [...database.users];

    // Filtreleme
    if (role) {
        users = users.filter(u => u.role === role);
    }
    if (status) {
        users = users.filter(u => u.status === status);
    }
    if (search) {
        const searchLower = search.toLowerCase();
        users = users.filter(u => 
            u.name.toLowerCase().includes(searchLower) ||
            u.email.toLowerCase().includes(searchLower)
        );
    }

    // Pagination
    const total = users.length;
    users = users.slice(offset, offset + parseInt(limit));

    // Şifreleri gizle (varsa)
    users = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    });

    res.json({
        success: true,
        data: users,
        pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
            totalPages: Math.ceil(total / limit)
        }
    });
}));

app.get('/api/users/:id', asyncHandler(async (req, res) => {
    const user = database.users.find(u => u.id === parseInt(req.params.id));
    
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'Kullanıcı bulunamadı'
        });
    }

    // Şifreyi gizle
    const { password, ...userWithoutPassword } = user;

    res.json({
        success: true,
        data: userWithoutPassword
    });
}));

app.post('/api/users', asyncHandler(async (req, res) => {
    const {
        name,
        email,
        role = 'customer',
        status = 'active'
    } = req.body;

    // Validasyon
    if (!name || !email) {
        return res.status(400).json({
            success: false,
            message: 'İsim ve email zorunlu'
        });
    }

    // Email kontrolü
    const existingUser = database.users.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: 'Bu email adresi zaten kullanılıyor'
        });
    }

    const newUser = {
        id: generateId(database.users),
        name,
        email,
        role,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    database.users.push(newUser);

    res.status(201).json({
        success: true,
        message: 'Kullanıcı başarıyla oluşturuldu',
        data: newUser
    });
}));

app.put('/api/users/:id', asyncHandler(async (req, res) => {
    const userIndex = database.users.findIndex(u => u.id === parseInt(req.params.id));
    
    if (userIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Kullanıcı bulunamadı'
        });
    }

    const {
        name,
        email,
        role,
        status
    } = req.body;

    // Email kontrolü (kendi emaili değilse)
    if (email && email !== database.users[userIndex].email) {
        const existingUser = database.users.find(u => u.email === email && u.id !== parseInt(req.params.id));
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Bu email adresi zaten kullanılıyor'
            });
        }
    }

    // Güncelleme
    const updatedUser = {
        ...database.users[userIndex],
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
        ...(status && { status }),
        updatedAt: new Date().toISOString()
    };

    database.users[userIndex] = updatedUser;

    // Şifreyi gizle
    const { password, ...userWithoutPassword } = updatedUser;

    res.json({
        success: true,
        message: 'Kullanıcı başarıyla güncellendi',
        data: userWithoutPassword
    });
}));

app.delete('/api/users/:id', asyncHandler(async (req, res) => {
    const userIndex = database.users.findIndex(u => u.id === parseInt(req.params.id));
    
    if (userIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Kullanıcı bulunamadı'
        });
    }

    // Soft delete (status'u inactive yap)
    database.users[userIndex].status = 'inactive';
    database.users[userIndex].updatedAt = new Date().toISOString();

    res.json({
        success: true,
        message: 'Kullanıcı başarıyla silindi'
    });
}));