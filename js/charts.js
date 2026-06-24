// Chart.js Configuration and Initialization

let salesTrendChart, ageChart, locationChart, categoryChart, deliveryChart;

// Chart.js default configuration
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.color = '#6C757D';

// Initialize all charts
function initializeCharts() {
    initSalesTrendChart('weekly');
    initAgeChart();
    initLocationChart();
    initCategoryChart();
    initDeliveryChart();
}

// Sales Trend Chart
function initSalesTrendChart(period = 'weekly') {
    const ctx = document.getElementById('salesTrendChart');
    if (!ctx) return;

    const data = dashboardData.salesTrends[period];

    if (salesTrendChart) {
        salesTrendChart.destroy();
    }

    salesTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Revenue',
                    data: data.revenue,
                    borderColor: '#F8CB46',
                    backgroundColor: 'rgba(248, 203, 70, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#F8CB46',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: 'Orders',
                    data: data.orders,
                    borderColor: '#0C831F',
                    backgroundColor: 'rgba(12, 131, 31, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#0C831F',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.dataset.label === 'Revenue') {
                                label += formatCurrency(context.parsed.y);
                            } else {
                                label += context.parsed.y.toLocaleString();
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Age Distribution Chart
function initAgeChart() {
    const ctx = document.getElementById('ageChart');
    if (!ctx) return;

    const data = dashboardData.customerDemographics.ageGroups;

    ageChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data),
                backgroundColor: [
                    '#F8CB46',
                    '#0C831F',
                    '#17A2B8',
                    '#E23744',
                    '#6C757D'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 10,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Location Distribution Chart
function initLocationChart() {
    const ctx = document.getElementById('locationChart');
    if (!ctx) return;

    const data = dashboardData.customerDemographics.locations;

    locationChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Customers',
                data: Object.values(data),
                backgroundColor: [
                    'rgba(248, 203, 70, 0.8)',
                    'rgba(12, 131, 31, 0.8)',
                    'rgba(23, 162, 184, 0.8)',
                    'rgba(226, 55, 68, 0.8)'
                ],
                borderColor: [
                    '#F8CB46',
                    '#0C831F',
                    '#17A2B8',
                    '#E23744'
                ],
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return `Customers: ${context.parsed.x.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Category Performance Chart
function initCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    const data = dashboardData.categoryPerformance;

    categoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.categories,
            datasets: [{
                label: 'Sales',
                data: data.sales,
                backgroundColor: 'rgba(248, 203, 70, 0.8)',
                borderColor: '#F8CB46',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return `Sales: ${formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// Delivery Performance Chart
function initDeliveryChart() {
    const ctx = document.getElementById('deliveryChart');
    if (!ctx) return;

    const data = dashboardData.deliveryAnalytics.performance;

    deliveryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Deliveries',
                data: data.data,
                backgroundColor: [
                    'rgba(40, 167, 69, 0.8)',
                    'rgba(248, 203, 70, 0.8)',
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(226, 55, 68, 0.8)',
                    'rgba(220, 53, 69, 0.8)'
                ],
                borderColor: [
                    '#28A745',
                    '#F8CB46',
                    '#FFC107',
                    '#E23744',
                    '#DC3545'
                ],
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return `Deliveries: ${context.parsed.y.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Update sales trend chart based on period selection
function updateSalesTrendChart(period) {
    initSalesTrendChart(period);
}

// Update all charts with new data
function updateAllCharts() {
    if (salesTrendChart) salesTrendChart.update();
    if (ageChart) ageChart.update();
    if (locationChart) locationChart.update();
    if (categoryChart) categoryChart.update();
    if (deliveryChart) deliveryChart.update();
}

// Destroy all charts (useful for cleanup)
function destroyAllCharts() {
    if (salesTrendChart) salesTrendChart.destroy();
    if (ageChart) ageChart.destroy();
    if (locationChart) locationChart.destroy();
    if (categoryChart) categoryChart.destroy();
    if (deliveryChart) deliveryChart.destroy();
}

// Made with Bob
