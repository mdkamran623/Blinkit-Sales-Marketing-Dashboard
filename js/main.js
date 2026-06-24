// Main JavaScript for Blinkit Dashboard

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    performance.start('dashboard-init');
    
    initializeDashboard();
    initializeEventListeners();
    initializeCharts();
    initializeMap();
    initializeInteractiveFeatures();
    startAutoRefresh();
    
    performance.end('dashboard-init');
    
    // Show welcome notification
    setTimeout(() => {
        showNotification('Dashboard loaded successfully! Click on any element to interact.', 'success');
    }, 500);
});

// Initialize dashboard components
function initializeDashboard() {
    animateKPICards();
    populateRecentOrders();
    populateInventoryList();
    populateTopProducts();
}

// Animate KPI cards with counter animation
function animateKPICards() {
    const kpiCards = document.querySelectorAll('.kpi-value');
    
    kpiCards.forEach(card => {
        const target = parseFloat(card.dataset.target);
        const text = card.textContent;
        
        if (text.includes('₹')) {
            animateCounter(card, target, 1500, false, true);
        } else if (text.includes('%')) {
            animateCounter(card, target, 1500, true, false);
        } else {
            animateCounter(card, target, 1500, false, false);
        }
    });
}

// Populate recent orders list
function populateRecentOrders() {
    const container = document.getElementById('recentOrdersList');
    if (!container) return;
    
    const orders = dashboardData.recentOrders;
    
    container.innerHTML = orders.map((order, index) => `
        <div class="order-item clickable" data-order-index="${index}" onclick="showOrderDetails(${index})">
            <div class="order-info">
                <div class="order-id">${order.id}</div>
                <div class="order-time">${order.time}</div>
            </div>
            <span class="order-badge ${getStatusBadgeClass(order.status)}">
                ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
        </div>
    `).join('');
}

// Populate inventory list
function populateInventoryList() {
    const container = document.getElementById('inventoryList');
    if (!container) return;
    
    const inventory = dashboardData.inventory;
    
    container.innerHTML = inventory.map((item, index) => `
        <div class="inventory-item clickable" data-item-index="${index}" onclick="showInventoryDetails(${index})">
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-category">${item.category} • Stock: ${item.stock}</div>
            </div>
            <span class="${getStockBadgeClass(item.status)}">
                ${item.status.replace('-', ' ').toUpperCase()}
            </span>
        </div>
    `).join('');
}

// Populate top products list
function populateTopProducts() {
    const container = document.getElementById('topProductsList');
    if (!container) return;
    
    const products = dashboardData.topProducts;
    
    container.innerHTML = products.map((product, index) => `
        <div class="product-item clickable ripple" data-product-index="${index}" onclick="showProductDetails(${index})">
            <div class="product-rank">#${product.rank}</div>
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/50'">
            <div class="product-details">
                <div class="product-name">${product.name}</div>
                <div class="product-category">${product.category}</div>
            </div>
            <div class="product-stats">
                <div class="product-sales">${formatCurrency(product.revenue)}</div>
                <div class="product-trend ${product.trend}">
                    <i class="bi bi-arrow-${product.trend === 'up' ? 'up' : 'down'}"></i>
                    ${product.trendValue}%
                </div>
            </div>
        </div>
    `).join('');
}

// Initialize event listeners
function initializeEventListeners() {
    // Sidebar toggle
    const toggleBtn = document.getElementById('toggleSidebar');
    const closeBtn = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('sidebar');
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 991) {
            if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
    
    // Sales trend period buttons
    const periodButtons = document.querySelectorAll('[data-period]');
    periodButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            periodButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateSalesTrendChart(this.dataset.period);
        });
    });
    
    // Region filter buttons
    const regionButtons = document.querySelectorAll('[data-region]');
    regionButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            regionButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterMapByRegion(this.dataset.region);
        });
    });
    
    // Date filter
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        dateFilter.addEventListener('change', function() {
            handleDateFilterChange(this.value);
        });
    }
    
    // Notification button
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            showNotification('You have 5 new notifications', 'info');
        });
    }
    
    // Window resize handler
    window.addEventListener('resize', debounce(() => {
        handleResize();
    }, 250));
}

// Initialize Leaflet map
let map;
let markers = [];

function initializeMap() {
    const mapContainer = document.getElementById('salesMap');
    if (!mapContainer) return;
    
    try {
        // Initialize map centered on India
        map = L.map('salesMap').setView([20.5937, 78.9629], 5);
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(map);
        
        // Add markers for each region
        addMapMarkers();
        
        // Fix map display issues
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    } catch (error) {
        console.error('Error initializing map:', error);
        mapContainer.innerHTML = '<div class="alert alert-warning">Map could not be loaded. Please check your internet connection.</div>';
    }
}

// Add markers to map
function addMapMarkers(filterRegion = 'all') {
    if (!map) return;
    
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Filter regions if needed
    let regions = dashboardData.regionalSales;
    if (filterRegion !== 'all') {
        regions = regions.filter(r => r.name.toLowerCase().includes(filterRegion));
    }
    
    // Add new markers
    regions.forEach(region => {
        const marker = L.marker([region.lat, region.lng])
            .bindPopup(`
                <div style="text-align: center;">
                    <strong>${region.name}</strong><br>
                    Sales: ${formatCurrency(region.sales)}<br>
                    Orders: ${region.orders.toLocaleString()}
                </div>
            `)
            .addTo(map);
        
        markers.push(marker);
    });
}

// Filter map by region
function filterMapByRegion(region) {
    addMapMarkers(region);
    
    if (region !== 'all' && map) {
        const regionData = dashboardData.regionalSales.find(r => 
            r.name.toLowerCase().includes(region)
        );
        if (regionData) {
            map.setView([regionData.lat, regionData.lng], 7);
        }
    } else if (map) {
        map.setView([20.5937, 78.9629], 5);
    }
}

// Handle date filter change
function handleDateFilterChange(value) {
    console.log('Date filter changed to:', value);
    showNotification(`Filter changed to: ${value}`, 'info');
    
    // In a real application, you would fetch new data here
    // For now, we'll just show a notification
}

// Handle window resize
function handleResize() {
    if (map) {
        map.invalidateSize();
    }
    
    // Update charts if needed
    updateAllCharts();
}

// Auto-refresh functionality
let refreshInterval;

function startAutoRefresh() {
    // Refresh every 30 seconds
    refreshInterval = setInterval(() => {
        refreshDashboardData();
    }, 30000);
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
}

function refreshDashboardData() {
    // Simulate data update
    const updatedData = simulateDataUpdate();
    
    // Update order status counts
    document.querySelectorAll('[data-status]').forEach(el => {
        const status = el.dataset.status;
        const newValue = updatedData.orderStatus[status];
        if (newValue !== undefined) {
            animateCounter(el, newValue, 500);
        }
    });
    
    // Update KPIs
    const revenueEl = document.querySelector('[data-target="1250000"]');
    if (revenueEl) {
        animateCounter(revenueEl, updatedData.kpis.totalRevenue, 500, false, true);
    }
    
    const ordersEl = document.querySelector('[data-target="8543"]');
    if (ordersEl) {
        animateCounter(ordersEl, updatedData.kpis.totalOrders, 500);
    }
    
    console.log('Dashboard data refreshed');
}

// Export functions
function exportDashboardData() {
    const data = {
        kpis: dashboardData.kpis,
        orders: dashboardData.recentOrders,
        inventory: dashboardData.inventory,
        topProducts: dashboardData.topProducts
    };
    
    exportToCSV(dashboardData.recentOrders, 'blinkit-orders.csv');
    showNotification('Data exported successfully!', 'success');
}

// Print dashboard
function printDashboard() {
    window.print();
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + P for print
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        printDashboard();
    }
    
    // Ctrl/Cmd + E for export
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportDashboardData();
    }
    
    // Escape to close sidebar on mobile
    if (e.key === 'Escape') {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    }
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopAutoRefresh();
    } else {
        startAutoRefresh();
        refreshDashboardData();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
    destroyAllCharts();
});

// Service Worker registration (for PWA support)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered:', registration))
            .catch(error => console.log('SW registration failed:', error));
    });
}

// Console welcome message
console.log('%c🚀 Blinkit Dashboard', 'font-size: 20px; font-weight: bold; color: #F8CB46;');
console.log('%cDeveloped with ❤️', 'font-size: 14px; color: #0C831F;');
console.log('%cKeyboard Shortcuts:', 'font-size: 12px; font-weight: bold;');
console.log('Ctrl/Cmd + P: Print Dashboard');
console.log('Ctrl/Cmd + E: Export Data');
console.log('Esc: Close Sidebar');

// Made with Bob

// ============================================
// INTERACTIVE FEATURES - Click Event Handlers
// ============================================

// Show Order Details Modal
function showOrderDetails(index) {
    const order = dashboardData.recentOrders[index];
    const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
    const content = document.getElementById('orderDetailsContent');
    
    content.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Order ID:</span>
            <span class="detail-value">${order.id}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Customer:</span>
            <span class="detail-value">${order.customer}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value">
                <span class="order-badge ${getStatusBadgeClass(order.status)}">
                    ${order.status.toUpperCase()}
                </span>
            </span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Amount:</span>
            <span class="detail-value">${formatCurrency(order.amount)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Time:</span>
            <span class="detail-value">${order.time}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Payment Method:</span>
            <span class="detail-value">UPI</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Delivery Address:</span>
            <span class="detail-value">123 Main Street, Delhi</span>
        </div>
        <div class="mt-4">
            <h6>Order Items:</h6>
            <ul class="list-group mt-2">
                <li class="list-group-item d-flex justify-content-between">
                    <span>Fresh Milk (2L)</span>
                    <span>₹120</span>
                </li>
                <li class="list-group-item d-flex justify-content-between">
                    <span>Organic Bananas (1kg)</span>
                    <span>₹80</span>
                </li>
                <li class="list-group-item d-flex justify-content-between">
                    <span>Whole Wheat Bread</span>
                    <span>₹45</span>
                </li>
            </ul>
        </div>
        <div class="mt-4 d-flex gap-2">
            <button class="action-btn action-btn-primary" onclick="trackOrder('${order.id}')">
                <i class="bi bi-geo-alt"></i> Track Order
            </button>
            <button class="action-btn action-btn-success" onclick="contactCustomer('${order.customer}')">
                <i class="bi bi-telephone"></i> Contact Customer
            </button>
        </div>
    `;
    
    modal.show();
    showNotification(`Viewing details for ${order.id}`, 'info');
}

// Show Product Details Modal
function showProductDetails(index) {
    const product = dashboardData.topProducts[index];
    const modal = new bootstrap.Modal(document.getElementById('productDetailsModal'));
    const content = document.getElementById('productDetailsContent');
    
    content.innerHTML = `
        <div class="text-center mb-4">
            <img src="${product.image}" alt="${product.name}" style="width: 150px; height: 150px; object-fit: cover; border-radius: 12px;" onerror="this.src='https://via.placeholder.com/150'">
        </div>
        <div class="detail-row">
            <span class="detail-label">Product Name:</span>
            <span class="detail-value">${product.name}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Category:</span>
            <span class="detail-value">${product.category}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Rank:</span>
            <span class="detail-value">#${product.rank}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Total Sales:</span>
            <span class="detail-value">${product.sales.toLocaleString()} units</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Revenue:</span>
            <span class="detail-value">${formatCurrency(product.revenue)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Trend:</span>
            <span class="detail-value">
                <span class="product-trend ${product.trend}">
                    <i class="bi bi-arrow-${product.trend === 'up' ? 'up' : 'down'}"></i>
                    ${product.trendValue}% ${product.trend === 'up' ? 'increase' : 'decrease'}
                </span>
            </span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Stock Status:</span>
            <span class="detail-value"><span class="stock-badge in-stock">IN STOCK</span></span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Price per Unit:</span>
            <span class="detail-value">₹${(product.revenue / product.sales).toFixed(2)}</span>
        </div>
        <div class="mt-4">
            <h6>Performance Metrics:</h6>
            <div class="progress mt-2" style="height: 25px;">
                <div class="progress-bar bg-success" role="progressbar" style="width: ${(product.sales / 2500 * 100)}%" aria-valuenow="${product.sales}" aria-valuemin="0" aria-valuemax="2500">
                    ${((product.sales / 2500) * 100).toFixed(1)}% of target
                </div>
            </div>
        </div>
        <div class="mt-4 d-flex gap-2">
            <button class="action-btn action-btn-primary" onclick="viewProductAnalytics('${product.name}')">
                <i class="bi bi-graph-up"></i> View Analytics
            </button>
            <button class="action-btn action-btn-success" onclick="reorderProduct('${product.name}')">
                <i class="bi bi-cart-plus"></i> Reorder Stock
            </button>
        </div>
    `;
    
    modal.show();
    showNotification(`Viewing ${product.name} details`, 'info');
}

// Show Inventory Details Modal
function showInventoryDetails(index) {
    const item = dashboardData.inventory[index];
    const modal = new bootstrap.Modal(document.getElementById('inventoryDetailsModal'));
    const content = document.getElementById('inventoryDetailsContent');
    
    const stockPercentage = (item.stock / (item.minStock * 5)) * 100;
    const statusColor = item.status === 'in-stock' ? 'success' : item.status === 'low-stock' ? 'warning' : 'danger';
    
    content.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Item Name:</span>
            <span class="detail-value">${item.name}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Category:</span>
            <span class="detail-value">${item.category}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Current Stock:</span>
            <span class="detail-value">${item.stock} units</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Minimum Stock:</span>
            <span class="detail-value">${item.minStock} units</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value">
                <span class="${getStockBadgeClass(item.status)}">
                    ${item.status.replace('-', ' ').toUpperCase()}
                </span>
            </span>
        </div>
        <div class="mt-3">
            <h6>Stock Level:</h6>
            <div class="progress mt-2" style="height: 25px;">
                <div class="progress-bar bg-${statusColor}" role="progressbar" style="width: ${stockPercentage}%" aria-valuenow="${item.stock}" aria-valuemin="0" aria-valuemax="${item.minStock * 5}">
                    ${item.stock} units
                </div>
            </div>
        </div>
        ${item.status !== 'in-stock' ? `
            <div class="alert alert-${statusColor} mt-3">
                <i class="bi bi-exclamation-triangle"></i>
                ${item.status === 'low-stock' ? 'Stock is running low. Consider reordering soon.' : 'Item is out of stock. Immediate reorder required!'}
            </div>
        ` : ''}
        <div class="mt-4 d-flex gap-2">
            <button class="action-btn action-btn-primary" onclick="reorderInventory('${item.name}', ${item.minStock * 3})">
                <i class="bi bi-box-seam"></i> Reorder (${item.minStock * 3} units)
            </button>
            <button class="action-btn action-btn-success" onclick="viewInventoryHistory('${item.name}')">
                <i class="bi bi-clock-history"></i> View History
            </button>
        </div>
    `;
    
    modal.show();
    showNotification(`Viewing ${item.name} inventory`, 'info');
}

// KPI Card Click Handlers
function handleKPIClick(type) {
    const messages = {
        revenue: 'Total Revenue: ₹12.5L - Click to view detailed revenue breakdown',
        orders: 'Total Orders: 8,543 - Click to view order analytics',
        growth: 'Growth Rate: 15.8% - Click to view growth trends',
        users: 'Active Users: 15,234 - Click to view user demographics'
    };
    
    showNotification(messages[type] || 'KPI Details', 'info');
    
    // Add highlight effect
    const cards = document.querySelectorAll('.kpi-card');
    cards.forEach((card, index) => {
        if ((type === 'revenue' && index === 0) ||
            (type === 'orders' && index === 1) ||
            (type === 'growth' && index === 2) ||
            (type === 'users' && index === 3)) {
            card.classList.add('highlight');
            setTimeout(() => card.classList.remove('highlight'), 1000);
        }
    });
}

// Order Status Click Handler
function handleStatusClick(status) {
    const statusNames = {
        pending: 'Pending Orders',
        processing: 'Processing Orders',
        delivery: 'Out for Delivery',
        delivered: 'Delivered Orders'
    };
    
    showNotification(`Viewing ${statusNames[status]}: ${dashboardData.orderStatus[status]} orders`, 'info');
    
    // Highlight the clicked status
    const statusItems = document.querySelectorAll('.status-item');
    statusItems.forEach(item => {
        if (item.classList.contains(status)) {
            item.classList.add('highlight');
            setTimeout(() => item.classList.remove('highlight'), 1000);
        }
    });
}

// Action Button Handlers
function trackOrder(orderId) {
    showNotification(`Tracking order ${orderId}... Opening map view`, 'info');
    // Scroll to map section
    const mapSection = document.getElementById('salesMap');
    if (mapSection) {
        smoothScrollTo(mapSection.parentElement, 100);
    }
}

function contactCustomer(customerName) {
    showNotification(`Initiating call to ${customerName}...`, 'success');
}

function viewProductAnalytics(productName) {
    showNotification(`Loading analytics for ${productName}...`, 'info');
}

function reorderProduct(productName) {
    showNotification(`Reorder request submitted for ${productName}`, 'success');
}

function reorderInventory(itemName, quantity) {
    showNotification(`Reorder request: ${quantity} units of ${itemName}`, 'success');
    
    // Simulate inventory update
    setTimeout(() => {
        showNotification(`Reorder confirmed! ${itemName} will be restocked soon.`, 'success');
    }, 1500);
}

function viewInventoryHistory(itemName) {
    showNotification(`Loading inventory history for ${itemName}...`, 'info');
}

// Chart Click Handlers
function setupChartClickHandlers() {
    // Sales Trend Chart Click
    if (salesTrendChart) {
        salesTrendChart.options.onClick = (event, activeElements) => {
            if (activeElements.length > 0) {
                const datasetIndex = activeElements[0].datasetIndex;
                const index = activeElements[0].index;
                const dataset = salesTrendChart.data.datasets[datasetIndex];
                const label = salesTrendChart.data.labels[index];
                const value = dataset.data[index];
                
                showNotification(
                    `${dataset.label} for ${label}: ${dataset.label === 'Revenue' ? formatCurrency(value) : value.toLocaleString()}`,
                    'info'
                );
            }
        };
    }
    
    // Age Chart Click
    if (ageChart) {
        ageChart.options.onClick = (event, activeElements) => {
            if (activeElements.length > 0) {
                const index = activeElements[0].index;
                const label = ageChart.data.labels[index];
                const value = ageChart.data.datasets[0].data[index];
                
                showNotification(`Age Group ${label}: ${value.toLocaleString()} customers`, 'info');
            }
        };
    }
    
    // Category Chart Click
    if (categoryChart) {
        categoryChart.options.onClick = (event, activeElements) => {
            if (activeElements.length > 0) {
                const index = activeElements[0].index;
                const label = categoryChart.data.labels[index];
                const value = categoryChart.data.datasets[0].data[index];
                
                showNotification(`${label}: ${formatCurrency(value)} in sales`, 'info');
            }
        };
    }
}

// Add click handlers to KPI cards
function addKPIClickHandlers() {
    const kpiCards = document.querySelectorAll('.kpi-card');
    kpiCards.forEach((card, index) => {
        card.classList.add('clickable', 'ripple');
        card.style.cursor = 'pointer';
        
        card.addEventListener('click', () => {
            const types = ['revenue', 'orders', 'growth', 'users'];
            handleKPIClick(types[index]);
        });
    });
}

// Add click handlers to order status items
function addStatusClickHandlers() {
    const statusItems = document.querySelectorAll('.status-item');
    statusItems.forEach(item => {
        item.classList.add('clickable');
        item.style.cursor = 'pointer';
        
        const statusClasses = ['pending', 'processing', 'delivery', 'delivered'];
        const status = statusClasses.find(s => item.classList.contains(s));
        
        if (status) {
            item.addEventListener('click', () => handleStatusClick(status));
        }
    });
}

// Initialize all interactive features
function initializeInteractiveFeatures() {
    addKPIClickHandlers();
    addStatusClickHandlers();
    
    // Setup chart click handlers after charts are initialized
    setTimeout(() => {
        setupChartClickHandlers();
    }, 1000);
}

// ============================================
// PAGE NAVIGATION SYSTEM
// ============================================

let currentPage = 'dashboard';

// Navigate to different pages
function navigateToPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.style.display = 'none';
    });
    
    // Show selected page
    const targetPage = document.getElementById(`page-${pageName}`);
    if (targetPage) {
        targetPage.style.display = 'block';
        currentPage = pageName;
        
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            }
        });
        
        // Close sidebar on mobile
        if (window.innerWidth <= 991) {
            document.getElementById('sidebar').classList.remove('active');
        }
        
        // Load page-specific content
        loadPageContent(pageName);
        
        // Show notification
        const pageNames = {
            dashboard: 'Dashboard',
            orders: 'Orders Management',
            products: 'Products Management',
            analytics: 'Advanced Analytics',
            customers: 'Customer Management',
            delivery: 'Delivery Management',
            settings: 'Settings'
        };
        
        showNotification(`Navigated to ${pageNames[pageName]}`, 'success');
    }
}

// Load content for specific pages
function loadPageContent(pageName) {
    switch(pageName) {
        case 'orders':
            populateOrdersTable();
            break;
        case 'products':
            populateProductsGrid();
            break;
        case 'analytics':
            initializeAnalyticsCharts();
            break;
        case 'customers':
            populateCustomersTable();
            break;
        case 'delivery':
            initializeDeliveryMap();
            populateDeliveryPersonnel();
            break;
        case 'settings':
            initializeSettings();
            break;
    }
}

// ============================================
// ORDERS PAGE FUNCTIONS
// ============================================

function populateOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    
    // Generate more orders
    const allOrders = [];
    for (let i = 0; i < 50; i++) {
        const statuses = ['pending', 'processing', 'delivery', 'delivered'];
        const customers = ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Vikram Singh', 'Anita Desai', 'Rahul Verma', 'Pooja Gupta'];
        
        allOrders.push({
            id: `#ORD-${2300 + i}`,
            customer: customers[Math.floor(Math.random() * customers.length)],
            date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            amount: Math.floor(Math.random() * 2000) + 200,
            status: statuses[Math.floor(Math.random() * statuses.length)]
        });
    }
    
    tbody.innerHTML = allOrders.map((order, index) => `
        <tr onclick="showOrderDetails(${index % 5})">
            <td><strong>${order.id}</strong></td>
            <td>${order.customer}</td>
            <td>${order.date}</td>
            <td>${formatCurrency(order.amount)}</td>
            <td><span class="order-badge ${getStatusBadgeClass(order.status)}">${order.status.toUpperCase()}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); trackOrder('${order.id}')">
                    <i class="bi bi-geo-alt"></i>
                </button>
                <button class="btn btn-sm btn-outline-success" onclick="event.stopPropagation(); showNotification('Printing invoice...', 'info')">
                    <i class="bi bi-printer"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ============================================
// PRODUCTS PAGE FUNCTIONS
// ============================================

function populateProductsGrid() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    const products = [
        { name: 'Organic Bananas', category: 'Fruits', price: 40, image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=300&h=200&fit=crop', stock: 85 },
        { name: 'Fresh Milk', category: 'Dairy', price: 60, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=200&fit=crop', stock: 450 },
        { name: 'Whole Wheat Bread', category: 'Bakery', price: 45, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop', stock: 320 },
        { name: 'Fresh Tomatoes', category: 'Vegetables', price: 30, image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=300&h=200&fit=crop', stock: 15 },
        { name: 'Basmati Rice', category: 'Grains', price: 120, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop', stock: 580 },
        { name: 'Greek Yogurt', category: 'Dairy', price: 80, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=200&fit=crop', stock: 65 },
        { name: 'Orange Juice', category: 'Beverages', price: 90, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300&h=200&fit=crop', stock: 240 },
        { name: 'Chicken Breast', category: 'Meat', price: 250, image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&h=200&fit=crop', stock: 12 },
        { name: 'Fresh Apples', category: 'Fruits', price: 120, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=200&fit=crop', stock: 200 },
        { name: 'Cheddar Cheese', category: 'Dairy', price: 180, image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=200&fit=crop', stock: 95 },
        { name: 'Croissants', category: 'Bakery', price: 60, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&h=200&fit=crop', stock: 150 },
        { name: 'Green Tea', category: 'Beverages', price: 150, image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300&h=200&fit=crop', stock: 300 }
    ];
    
    grid.innerHTML = products.map((product, index) => `
        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
            <div class="product-card" onclick="showProductDetails(${index % 5})">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200'">
                <h5>${product.name}</h5>
                <p class="text-muted mb-2">${product.category}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="price">₹${product.price}</span>
                    <span class="badge ${product.stock > 100 ? 'bg-success' : product.stock > 20 ? 'bg-warning' : 'bg-danger'}">
                        Stock: ${product.stock}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
// ANALYTICS PAGE FUNCTIONS
// ============================================

let revenueAnalyticsChart, productPerformanceChart;

function initializeAnalyticsCharts() {
    // Revenue Analytics Chart
    const revenueCtx = document.getElementById('revenueAnalyticsChart');
    if (revenueCtx && !revenueAnalyticsChart) {
        revenueAnalyticsChart = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Revenue 2026',
                    data: [180000, 195000, 210000, 225000, 240000, 255000, 270000, 285000, 300000, 315000, 330000, 345000],
                    borderColor: '#F8CB46',
                    backgroundColor: 'rgba(248, 203, 70, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: true }
                }
            }
        });
    }
    
    // Product Performance Chart
    const perfCtx = document.getElementById('productPerformanceChart');
    if (perfCtx && !productPerformanceChart) {
        productPerformanceChart = new Chart(perfCtx, {
            type: 'radar',
            data: {
                labels: ['Quality', 'Price', 'Availability', 'Delivery', 'Customer Service', 'Variety'],
                datasets: [{
                    label: 'Performance Score',
                    data: [85, 78, 92, 88, 95, 82],
                    backgroundColor: 'rgba(248, 203, 70, 0.2)',
                    borderColor: '#F8CB46',
                    pointBackgroundColor: '#F8CB46',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#F8CB46'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
}

// ============================================
// CUSTOMERS PAGE FUNCTIONS
// ============================================

function populateCustomersTable() {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;
    
    const customers = [
        { id: 'CUST-001', name: 'Rajesh Kumar', email: 'rajesh@email.com', phone: '+91 98765 43210', orders: 45, spent: 125000 },
        { id: 'CUST-002', name: 'Priya Sharma', email: 'priya@email.com', phone: '+91 98765 43211', orders: 38, spent: 98000 },
        { id: 'CUST-003', name: 'Amit Patel', email: 'amit@email.com', phone: '+91 98765 43212', orders: 52, spent: 145000 },
        { id: 'CUST-004', name: 'Sneha Reddy', email: 'sneha@email.com', phone: '+91 98765 43213', orders: 29, spent: 78000 },
        { id: 'CUST-005', name: 'Vikram Singh', email: 'vikram@email.com', phone: '+91 98765 43214', orders: 61, spent: 178000 },
        { id: 'CUST-006', name: 'Anita Desai', email: 'anita@email.com', phone: '+91 98765 43215', orders: 34, spent: 92000 },
        { id: 'CUST-007', name: 'Rahul Verma', email: 'rahul@email.com', phone: '+91 98765 43216', orders: 47, spent: 132000 },
        { id: 'CUST-008', name: 'Pooja Gupta', email: 'pooja@email.com', phone: '+91 98765 43217', orders: 55, spent: 156000 }
    ];
    
    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td><strong>${customer.id}</strong></td>
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td>${customer.orders}</td>
            <td>${formatCurrency(customer.spent)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="showNotification('Viewing ${customer.name} profile', 'info')">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-success" onclick="showNotification('Contacting ${customer.name}', 'info')">
                    <i class="bi bi-telephone"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ============================================
// DELIVERY PAGE FUNCTIONS
// ============================================

let deliveryMap;

function initializeDeliveryMap() {
    const mapContainer = document.getElementById('deliveryMap');
    if (!mapContainer || deliveryMap) return;
    
    try {
        deliveryMap = L.map('deliveryMap').setView([28.6139, 77.2090], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(deliveryMap);
        
        // Add delivery markers
        const deliveries = [
            { lat: 28.6139, lng: 77.2090, driver: 'Driver 1', status: 'In Transit' },
            { lat: 28.6289, lng: 77.2190, driver: 'Driver 2', status: 'Delivered' },
            { lat: 28.6039, lng: 77.1990, driver: 'Driver 3', status: 'In Transit' }
        ];
        
        deliveries.forEach(delivery => {
            L.marker([delivery.lat, delivery.lng])
                .bindPopup(`<b>${delivery.driver}</b><br>Status: ${delivery.status}`)
                .addTo(deliveryMap);
        });
        
        setTimeout(() => deliveryMap.invalidateSize(), 100);
    } catch (error) {
        console.error('Error initializing delivery map:', error);
    }
}

function populateDeliveryPersonnel() {
    const tbody = document.getElementById('deliveryPersonnelBody');
    if (!tbody) return;
    
    const personnel = [
        { id: 'DRV-001', name: 'Ramesh Kumar', status: 'Active', current: 3, completed: 12, rating: 4.8 },
        { id: 'DRV-002', name: 'Suresh Patel', status: 'Active', current: 2, completed: 15, rating: 4.9 },
        { id: 'DRV-003', name: 'Mahesh Singh', status: 'Break', current: 0, completed: 10, rating: 4.7 },
        { id: 'DRV-004', name: 'Dinesh Sharma', status: 'Active', current: 4, completed: 18, rating: 4.9 },
        { id: 'DRV-005', name: 'Ganesh Reddy', status: 'Offline', current: 0, completed: 14, rating: 4.6 }
    ];
    
    tbody.innerHTML = personnel.map(person => `
        <tr>
            <td><strong>${person.id}</strong></td>
            <td>${person.name}</td>
            <td><span class="badge ${person.status === 'Active' ? 'bg-success' : person.status === 'Break' ? 'bg-warning' : 'bg-secondary'}">${person.status}</span></td>
            <td>${person.current}</td>
            <td>${person.completed}</td>
            <td><i class="bi bi-star-fill text-warning"></i> ${person.rating}</td>
        </tr>
    `).join('');
}

// ============================================
// SETTINGS PAGE FUNCTIONS
// ============================================

function initializeSettings() {
    const form = document.getElementById('profileForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            showNotification('Profile settings saved successfully!', 'success');
        });
    }
}
