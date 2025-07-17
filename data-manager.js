// BitarzWear - Veri Yönetim Sistemi
// Admin panel ve ana site arasında veri senkronizasyonu

class DataManager {
    constructor() {
        this.storageKey = 'bitarzwear_data';
        this.eventListeners = new Map();
        this.initializeStorage();
    }

    // Local Storage'ı başlat
    initializeStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            const initialData = {
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
                        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI4MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMzAwIiBmaWxsPSJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjZjBmMGYwLCAjZThlOGU4KSIvPgo8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0MCwgNTApIj4KICA8IS0tIFRpc2hpcnQgU2hhcGUgLS0+CiAgPHBhdGggZD0iTTUwIDIwIEwxNTAgMjAgTDE5MCA2MCBMMTkwIDIwMCBMOTAgMjAwIEw5MCA2MCBaIiBmaWxsPSIjZGRkZGRkIiBzdHJva2U9IiNjY2MiIHN0cm9rZS13aWR0aD0iMiIvPgogIDwhLS0gU2xlZXZlcyAtLT4KICA8ZWxsaXBzZSBjeD0iMjUiIGN5PSI4MCIgcng9IjM1IiByeT0iNDAiIGZpbGw9IiNkZGRkZGQiIHN0cm9rZT0iI2NjYyIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPGVsbGlwc2UgY3g9IjIxNSIgY3k9IjgwIiByeD0iMzUiIHJ5PSI0MCIgZmlsbD0iI2RkZGRkZCIgc3Ryb2tlPSIjY2NjIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8IS0tIE5lY2sgLS0+CiAgPGVsbGlwc2UgY3g9IjEyMCIgY3k9IjQwIiByeD0iMjAiIHJ5PSIyNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjY2NjIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9nPgo8dGV4dCB4PSIxNDAiIHk9IjI3MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5PdmVyc2l6ZSBUZWU8L3RleHQ+Cjwvc3ZnPg==',
                        badge: 'OVERSIZE',
                        featured: true,
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
                        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI4MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMzAwIiBmaWxsPSJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjZmZmZmZmLCAjZjhmOGY4KSIvPgo8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0MCwgNTApIj4KICA8IS0tIFRpc2hpcnQgU2hhcGUgLS0+CiAgPHBhdGggZD0iTTUwIDIwIEwxNTAgMjAgTDE5MCA2MCBMMTkwIDIwMCBMOTAgMjAwIEw5MCA2MCBaIiBmaWxsPSIjZmZmZmZmIiBzdHJva2U9IiNlZWUiIHN0cm9rZS13aWR0aD0iMiIvPgogIDwhLS0gU2xlZXZlcyAtLT4KICA8ZWxsaXBzZSBjeD0iMjUiIGN5PSI4MCIgcng9IjM1IiByeT0iNDAiIGZpbGw9IiNmZmZmZmYiIHN0cm9rZT0iI2VlZSIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPGVsbGlwc2UgY3g9IjIxNSIgY3k9IjgwIiByeD0iMzUiIHJ5PSI0MCIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjZWVlIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8IS0tIE5lY2sgLS0+CiAgPGVsbGlwc2UgY3g9IjEyMCIgY3k9IjQwIiByeD0iMjAiIHJ5PSIyNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZWVlIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9nPgo8dGV4dCB4PSIxNDAiIHk9IjI3MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjY2NjIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5XaGl0ZSBUZWU8L3RleHQ+Cjwvc3ZnPg==',
                        badge: 'WHITE',
                        featured: true,
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
                        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI4MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMzAwIiBmaWxsPSJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjZThlOGU4LCAjZDNkM2QzKSIvPgo8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg3MCwgMzApIj4KICA8IS0tIFBhbnRzIFNoYXBlIC0tPgogIDxwYXRoIGQ9Ik00MCAyMCBMMTIwIDIwIEwxMzAgNTAgTDEzNSAyNDAgTDExMCAyNDAgTDExMCAyMDAgTDkwIDIwMCBMOTAgMjQwIEw2NSAyNDAgTDcwIDUwIFoiIGZpbGw9IiNkM2QzZDMiIHN0cm9rZT0iI2JiYiIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPCEtLSBXYWlzdGJhbmQgLS0+CiAgPHJlY3QgeD0iNDAiIHk9IjIwIiB3aWR0aD0iODAiIGhlaWdodD0iMTAiIGZpbGw9IiNjY2MiLz4KICA8IS0tIFBvY2tldCAtLT4KICA8cmVjdCB4PSI5NSIgeT0iNzAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYmJiIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9nPgo8dGV4dCB4PSIxNDAiIHk9IjI4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CYWdneSBQYW50czwvdGV4dD4KPC9zdmc+',
                        badge: 'BAGGY',
                        featured: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    },
                    {
                        id: 4,
                        name: 'Black Loose Fit',
                        title: 'Black Loose Fit',
                        category: 'pants',
                        categoryName: 'Pantolon',
                        price: 179,
                        originalPrice: 239,
                        stock: 15,
                        status: 'active',
                        description: 'Siyah loose fit pantolon.',
                        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI4MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMzAwIiBmaWxsPSJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjMmEyYTJhLCAjMWExYTFhKSIvPgo8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg3MCwgMzApIj4KICA8IS0tIFBhbnRzIFNoYXBlIC0tPgogIDxwYXRoIGQ9Ik00MCAyMCBMMTIwIDIwIEwxMzAgNTAgTDEzNSAyNDAgTDExMCAyNDAgTDExMCAyMDAgTDkwIDIwMCBMOTAgMjQwIEw2NSAyNDAgTDcwIDUwIFoiIGZpbGw9IiMzMzMiIHN0cm9rZT0iIzU1NSIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPCEtLSBXYWlzdGJhbmQgLS0+CiAgPHJlY3QgeD0iNDAiIHk9IjIwIiB3aWR0aD0iODAiIGhlaWdodD0iMTAiIGZpbGw9IiM0NDQiLz4KICA8IS0tIFBvY2tldCAtLT4KICA8cmVjdCB4PSI5NSIgeT0iNzAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNTU1IiBzdHJva2Utd2lkdGg9IjEiLz4KPC9nPgo8dGV4dCB4PSIxNDAiIHk9IjI4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNzc3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Mb29zZSBGaXQ8L3RleHQ+Cjwvc3ZnPg==',
                        badge: 'LOOSE',
                        featured: false,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    },
                    {
                        id: 5,
                        name: 'Comfy Set Bundle',
                        title: 'Comfy Set Bundle',
                        category: 'set',
                        categoryName: 'Takım',
                        price: 299,
                        originalPrice: 399,
                        stock: 12,
                        status: 'active',
                        description: 'Rahat eşofman takımı.',
                        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI4MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMzAwIiBmaWxsPSJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjZjBmMGYwLCAjZTBlMGUwKSIvPgo8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0MCwgMjApIj4KICA8IS0tIFRvcCAtLT4KICA8cGF0aCBkPSJNNTAgMTAgTDE1MCAxMCBMMTkwIDQwIEwxOTAgMTIwIEw5MCAxMjAgTDkwIDQwIFoiIGZpbGw9IiNlZWVlZWUiIHN0cm9rZT0iI2RkZCIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPCEtLSBCb3R0b20gLS0+CiAgPHBhdGggZD0iTTcwIDEzMCBMMTcwIDEzMCBMMTgwIDE2MCBMMTU1IDI2MCBMMTM1IDI2MCBMMTM1IDIyMCBMMTE1IDIyMCBMMTE1IDI2MCBMOTE1IDI2MCBMOTA1IDE2MCBaIiBmaWxsPSIjZWVlZWVlIiBzdHJva2U9IiNkZGQiIHN0cm9rZS13aWR0aD0iMiIvPgo8L2c+Cjx0ZXh0IHg9IjE0MCIgeT0iMjkwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNvbWZ5IFNldDwvdGV4dD4KPC9zdmc+',
                        badge: 'BUNDLE',
                        badgeColor: 'linear-gradient(45deg, #ff6b6b, #feca57)',
                        featured: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    },
                    {
                        id: 6,
                        name: 'Street Bomber',
                        title: 'Street Bomber',
                        category: 'jacket',
                        categoryName: 'Ceket',
                        price: 249,
                        originalPrice: 329,
                        stock: 18,
                        status: 'active',
                        description: 'Sokak stili bomber ceket.',
                        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDI4MCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMzAwIiBmaWxsPSJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjMmEyYTJhLCAjMWExYTFhKSIvPgo8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0MCwgNDApIj4KICA8IS0tIEJvbWJlciBKYWNrZXQgLS0+CiAgPHBhdGggZD0iTTUwIDMwIEwxNTAgMzAgTDE5MCA3MCBMMTY1IDIwMCBMMTE1IDIwMCBMOTAgNzAgWiIgZmlsbD0iIzMzMyIgc3Ryb2tlPSIjNTU1IiBzdHJva2Utd2lkdGg9IjMiLz4KICA8IS0tIFppcHBlciAtLT4KICA8bGluZSB4MT0iMTIwIiB5MT0iNTAiIHgyPSIxMjAiIHkyPSIxODAiIHN0cm9rZT0iIzY2NiIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgPCEtLSBQb2NrZXRzIC0tPgogIDxyZWN0IHg9Ijc1IiB5PSIxMjAiIHdpZHRoPSIzMCIgaGVpZ2h0PSIyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNTU1IiBzdHJva2Utd2lkdGg9IjIiLz4KICA8cmVjdCB4PSIxMzUiIHk9IjEyMCIgd2lkdGg9IjMwIiBoZWlnaHQ9IjIwIiBmaWxsPSJub25lIiBzdHJva2U9IiM1NTUiIHN0cm9rZS13aWR0aD0iMiIvPgo8L2c+Cjx0ZXh0IHg9IjE0MCIgeT0iMjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM3NzciIHRleHQtYW5jaG9yPSJtaWRkbGUiPkJvbWJlcjwvdGV4dD4KPC9zdmc+',
                        badge: 'BOMBER',
                        featured: false,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ],
                orders: [
                    {
                        id: 12457,
                        customer: {
                            name: 'Ahmet Yılmaz',
                            email: 'ahmet@email.com',
                            phone: '+90 555 123 4567',
                            address: 'İstanbul, Türkiye'
                        },
                        items: [
                            {
                                productId: 1,
                                productName: 'Oversize Basic Tee',
                                quantity: 1,
                                price: 129
                            }
                        ],
                        total: 159, // Kargo dahil
                        subtotal: 129,
                        shipping: 30,
                        status: 'delivered',
                        paymentStatus: 'paid',
                        date: '2025-07-15',
                        createdAt: new Date('2025-07-15').toISOString(),
                        updatedAt: new Date().toISOString()
                    },
                    {
                        id: 12456,
                        customer: {
                            name: 'Ayşe Kara',
                            email: 'ayse@email.com',
                            phone: '+90 555 987 6543',
                            address: 'Ankara, Türkiye'
                        },
                        items: [
                            {
                                productId: 5,
                                productName: 'Comfy Set Bundle',
                                quantity: 1,
                                price: 299
                            }
                        ],
                        total: 299, // Ücretsiz kargo
                        subtotal: 299,
                        shipping: 0,
                        status: 'processing',
                        paymentStatus: 'paid',
                        date: '2025-07-14',
                        createdAt: new Date('2025-07-14').toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ],
                customers: [
                    {
                        id: 1,
                        name: 'Ahmet Yılmaz',
                        email: 'ahmet@email.com',
                        phone: '+90 555 123 4567',
                        address: 'İstanbul, Türkiye',
                        totalOrders: 12,
                        totalSpent: 1890,
                        createdAt: new Date('2025-01-15').toISOString(),
                        lastOrderDate: '2025-07-15'
                    },
                    {
                        id: 2,
                        name: 'Ayşe Kara',
                        email: 'ayse@email.com',
                        phone: '+90 555 987 6543',
                        address: 'Ankara, Türkiye',
                        totalOrders: 8,
                        totalSpent: 1240,
                        createdAt: new Date('2025-02-20').toISOString(),
                        lastOrderDate: '2025-07-14'
                    }
                ],
                settings: {
                    siteName: 'BitarzWear',
                    siteDescription: 'Sokak stili, uygun fiyat ve yenilikçi giyim markası.',
                    currency: 'TL',
                    freeShippingLimit: 250,
                    shippingCost: 30,
                    taxRate: 0.18,
                    contactEmail: 'info@bitarzwear.com',
                    contactPhone: '+90 555 123 4567',
                    address: 'İstanbul, Türkiye',
                    socialMedia: {
                        instagram: '@bitarzwear',
                        twitter: '@bitarzwear',
                        facebook: 'BitarzWear'
                    }
                },
                cart: [],
                lastUpdate: new Date().toISOString()
            };
            
            localStorage.setItem(this.storageKey, JSON.stringify(initialData));
        }
    }

    // Veri okuma
    getData(type = null) {
        const data = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        return type ? data[type] : data;
    }

    // Veri yazma
    setData(type, value) {
        const data = this.getData();
        data[type] = value;
        data.lastUpdate = new Date().toISOString();
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        this.notifyListeners(type, value);
    }

    // Tek veri güncelleme
    updateItem(type, id, updates) {
        const items = this.getData(type);
        const index = items.findIndex(item => item.id === id);
        
        if (index !== -1) {
            items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
            this.setData(type, items);
            return items[index];
        }
        return null;
    }

    // Yeni veri ekleme
    addItem(type, item) {
        const items = this.getData(type);
        const newId = Math.max(...items.map(i => i.id), 0) + 1;
        const newItem = {
            ...item,
            id: newId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        items.push(newItem);
        this.setData(type, items);
        return newItem;
    }

    // Veri silme
    deleteItem(type, id) {
        const items = this.getData(type);
        const filteredItems = items.filter(item => item.id !== id);
        this.setData(type, filteredItems);
        return true;
    }

    // Event listener sistemi
    addEventListener(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    removeEventListener(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    notifyListeners(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => callback(data));
        }
    }}