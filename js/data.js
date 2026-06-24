// Mock Data for Blinkit Dashboard

const dashboardData = {
    kpis: {
        totalRevenue: 1250000,
        totalOrders: 8543,
        growthRate: 15.8,
        activeUsers: 15234
    },

    orderStatus: {
        pending: 45,
        processing: 123,
        outForDelivery: 89,
        delivered: 7286
    },

    recentOrders: [
        { id: '#ORD-2345', customer: 'Rajesh Kumar', time: '2 mins ago', status: 'processing', amount: 450 },
        { id: '#ORD-2344', customer: 'Priya Sharma', time: '5 mins ago', status: 'delivery', amount: 780 },
        { id: '#ORD-2343', customer: 'Amit Patel', time: '8 mins ago', status: 'delivered', amount: 320 },
        { id: '#ORD-2342', customer: 'Sneha Reddy', time: '12 mins ago', status: 'processing', amount: 590 },
        { id: '#ORD-2341', customer: 'Vikram Singh', time: '15 mins ago', status: 'pending', amount: 410 }
    ],

    inventory: [
        { id: 1, name: 'Fresh Milk', category: 'Dairy', stock: 450, minStock: 100, status: 'in-stock' },
        { id: 2, name: 'Organic Bananas', category: 'Fruits', stock: 85, minStock: 100, status: 'low-stock' },
        { id: 3, name: 'Whole Wheat Bread', category: 'Bakery', stock: 320, minStock: 50, status: 'in-stock' },
        { id: 4, name: 'Fresh Tomatoes', category: 'Vegetables', stock: 15, minStock: 50, status: 'out-of-stock' },
        { id: 5, name: 'Basmati Rice', category: 'Grains', stock: 580, minStock: 200, status: 'in-stock' },
        { id: 6, name: 'Greek Yogurt', category: 'Dairy', stock: 65, minStock: 80, status: 'low-stock' },
        { id: 7, name: 'Orange Juice', category: 'Beverages', stock: 240, minStock: 100, status: 'in-stock' },
        { id: 8, name: 'Chicken Breast', category: 'Meat', stock: 12, minStock: 30, status: 'out-of-stock' }
    ],

    topProducts: [
        {
            rank: 1,
            name: 'Organic Bananas',
            category: 'Fruits',
            sales: 2340,
            revenue: 93600,
            trend: 'up',
            trendValue: 15,
            image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=100&h=100&fit=crop'
        },
        {
            rank: 2,
            name: 'Fresh Milk',
            category: 'Dairy',
            sales: 2180,
            revenue: 87200,
            trend: 'up',
            trendValue: 12,
            image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&h=100&fit=crop'
        },
        {
            rank: 3,
            name: 'Whole Wheat Bread',
            category: 'Bakery',
            sales: 1950,
            revenue: 78000,
            trend: 'up',
            trendValue: 8,
            image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&h=100&fit=crop'
        },
        {
            rank: 4,
            name: 'Basmati Rice',
            category: 'Grains',
            sales: 1820,
            revenue: 72800,
            trend: 'down',
            trendValue: 3,
            image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&h=100&fit=crop'
        },
        {
            rank: 5,
            name: 'Orange Juice',
            category: 'Beverages',
            sales: 1650,
            revenue: 66000,
            trend: 'up',
            trendValue: 10,
            image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=100&h=100&fit=crop'
        }
    ],

    customerDemographics: {
        ageGroups: {
            '18-25': 2500,
            '26-35': 5600,
            '36-45': 4200,
            '46-55': 2100,
            '56+': 834
        },
        locations: {
            'North Delhi': 3500,
            'South Delhi': 4200,
            'East Delhi': 3800,
            'West Delhi': 3734
        }
    },

    salesTrends: {
        daily: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            revenue: [65000, 72000, 68000, 85000, 92000, 105000, 98000],
            orders: [450, 520, 480, 610, 680, 750, 720]
        },
        weekly: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            revenue: [450000, 520000, 580000, 620000],
            orders: [3200, 3650, 4100, 4350]
        },
        monthly: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            revenue: [1800000, 1950000, 2100000, 2250000, 2400000, 2550000],
            orders: [12500, 13800, 15200, 16500, 17800, 19200]
        }
    },

    categoryPerformance: {
        categories: ['Fruits & Vegetables', 'Dairy', 'Bakery', 'Beverages', 'Grains', 'Meat & Fish', 'Snacks', 'Personal Care'],
        sales: [320000, 280000, 245000, 210000, 195000, 175000, 160000, 145000]
    },

    deliveryAnalytics: {
        avgDeliveryTime: 28,
        successRate: 96.5,
        customerRating: 4.7,
        performance: {
            labels: ['< 15 min', '15-30 min', '30-45 min', '45-60 min', '> 60 min'],
            data: [1200, 4500, 2100, 600, 143]
        }
    },

    regionalSales: [
        { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090, sales: 450000, orders: 3200 },
        { name: 'Mumbai', lat: 19.0760, lng: 72.8777, sales: 520000, orders: 3650 },
        { name: 'Bangalore', lat: 12.9716, lng: 77.5946, sales: 380000, orders: 2800 },
        { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, sales: 340000, orders: 2500 },
        { name: 'Chennai', lat: 13.0827, lng: 80.2707, sales: 310000, orders: 2300 },
        { name: 'Kolkata', lat: 22.5726, lng: 88.3639, sales: 290000, orders: 2100 },
        { name: 'Pune', lat: 18.5204, lng: 73.8567, sales: 270000, orders: 2000 },
        { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, sales: 250000, orders: 1850 }
    ]
};

// Utility function to format currency
function formatCurrency(amount) {
    if (amount >= 100000) {
        return '₹' + (amount / 100000).toFixed(1) + 'L';
    } else if (amount >= 1000) {
        return '₹' + (amount / 1000).toFixed(1) + 'K';
    }
    return '₹' + amount.toLocaleString('en-IN');
}

// Utility function to format numbers
function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Simulate real-time data updates
function simulateDataUpdate() {
    // Randomly update order counts
    dashboardData.orderStatus.pending = Math.floor(Math.random() * 20) + 35;
    dashboardData.orderStatus.processing = Math.floor(Math.random() * 30) + 110;
    dashboardData.orderStatus.outForDelivery = Math.floor(Math.random() * 20) + 75;
    dashboardData.orderStatus.delivered += Math.floor(Math.random() * 10) + 1;

    // Update KPIs slightly
    dashboardData.kpis.totalRevenue += Math.floor(Math.random() * 5000) + 1000;
    dashboardData.kpis.totalOrders += Math.floor(Math.random() * 10) + 1;
    dashboardData.kpis.activeUsers += Math.floor(Math.random() * 20) - 10;

    return dashboardData;
}

// Export data for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { dashboardData, formatCurrency, formatNumber, simulateDataUpdate };
}

// Made with Bob
