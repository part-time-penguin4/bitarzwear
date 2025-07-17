// BitarzWear Admin Panel JavaScript

// Global variables
let currentSection = 'dashboard';
let products = [
    {
        id: 1,
        name: 'Oversize Basic Tee',
        category: 'Tişört',
        price: 129,
        stock: 45,
        status: 'active',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5GVPC90ZXh0Pgo8L3N2Zz4K'
    },
    {
        id: 2,
        name: 'Oversize White Tee',
        category: 'Tişört',
        price: 139,
        stock: 32,
        status: 'active',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZmZmZmZmIi8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjY2NjIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5GVPC90ZXh0Pgo8L3N2Zz4K'
    },
    {
        id: 3,
        name: 'Grey Baggy Pants',
        category: 'Pantolon',
        price: 199,
        stock: 8,
        status: 'low-stock',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZThlOGU4Ii8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjYWFhIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5GWPC90ZXh0Pgo8L3N2Zz4K'
    }
];

let orders = [
    {
        id: 12457,
        customer: { name: 'Ahmet Yılmaz', email: 'ahmet@email.com' },
        products: 'Oversize Basic Tee',
        total: 159,
        date: '15.07.2025',
        status: 'delivered'
    },
    {
        id: 12456,
        customer: { name: 'Ayşe Kara', email: 'ayse@email.com' },
        products: 'Comfy Set Bundle',
        total: 289,
        date: '14.07.2025',
        status: 'processing'
    },
    {
        id: 12455,
        customer: { name: 'Mehmet Öz', email: 'mehmet@email.com' },
        products: 'Grey Baggy Pants',
        total: 199,
        date: '13.07.2025',
        status: 'shipped'
    }
];

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPanel();
});

function initializeAdminPanel() {
    setupNavigation();
    setupEventListeners();
    updateDashboardStats();
    renderProductsTable();
    renderOrdersTable();
    initializeCharts();
}

// Navigation setup
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            switchSection(section);
        });
    });
}

function switchSection(sectionName) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    
    // Update active content section
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName).classList.add('active');
    
    // Update page title
    const pageTitle = document.querySelector('.page-title');
    const sectionTitles = {
        dashboard: 'Dashboard',
        products: 'Ürün Yönetimi',
        orders: 'Sipariş Yönetimi',
        customers: 'Müşteri Yönetimi',
        analytics: 'Analitik ve Raporlar',
        settings: 'Site Ayarları'
    };
    pageTitle.textContent = sectionTitles[sectionName];
    
    currentSection = sectionName;
}

// Event listeners setup
function setupEventListeners() {
    // Sidebar toggle for mobile
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Add product button
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', openProductModal);
    }
    
    // Product form submission
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
    
    // Modal close
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterOrders(this.getAttribute('data-filter'));
        });
    });
    
    // Logout button
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Dashboard functions
function updateDashboardStats() {
    // Calculate stats from data
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const totalCustomers = new Set(orders.map(order => order.customer.email)).size;
    const totalProducts = products.length;
    
    // Update stat cards
    document.querySelector('.stat-card .stat-number').textContent = `₺${totalRevenue.toLocaleString()}`;
    document.querySelectorAll('.stat-card .stat-number')[1].textContent = totalOrders.toLocaleString();
    document.querySelectorAll('.stat-card .stat-number')[2].textContent = totalCustomers.toLocaleString();
    document.querySelectorAll('.stat-card .stat-number')[3].textContent = totalProducts.toLocaleString();
}

// Product management functions
function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>
                            <div class="product-image-cell">
                                <img src="${product.image}" alt="${product.name}">
                            </div>
                        </td>
                        <td>${product.name}</td>
                        <td>${product.category}</td>
                        <td>₺${product.price}</td>
                        <td>${product.stock}</td>
                        <td>${product.status}</td>
                    </tr>
                `).join('')};