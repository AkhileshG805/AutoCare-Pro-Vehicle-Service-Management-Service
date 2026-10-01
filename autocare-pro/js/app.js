// AutoCare Pro - Central Application Logic & Routing

// Global Session Auth Guard
if (localStorage.getItem('autocare_auth') !== 'true') {
    window.location.href = 'login.html';
}

// Global Application State
let appState = {
    activePage: 'dashboard',
    deleteTarget: { module: '', id: '' },
    pagination: {
        customers: { page: 1, limit: 5 },
        vehicles: { page: 1, limit: 5 },
        bookings: { page: 1, limit: 5 },
        records: { page: 1, limit: 5 },
        inventory: { page: 1, limit: 5 },
        billing: { page: 1, limit: 5 }
    },
    charts: {} // Store Chart.js references to destroy/recreate cleanly
};

// Database Helpers
function getDB(key) {
    return JSON.parse(localStorage.getItem(`autocare_${key}`)) || [];
}

function saveDB(key, data) {
    localStorage.setItem(`autocare_${key}`, JSON.stringify(data));
}

function getSettings() {
    return JSON.parse(localStorage.getItem('autocare_settings')) || {};
}

function getProfile() {
    return JSON.parse(localStorage.getItem('autocare_profile')) || {};
}

// Visual Toast System
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast-alert toast-${type}`;
    
    let iconClass = 'fa-circle-check';
    if (type === 'danger') iconClass = 'fa-circle-xmark';
    if (type === 'warning') iconClass = 'fa-triangle-exclamation';
    if (type === 'info') iconClass = 'fa-circle-info';

    toast.innerHTML = `
        <div class="toast-content-flex">
            <i class="fa-solid ${iconClass} toast-icon"></i>
            <span class="toast-message">${message}</span>
        </div>
        <button class="toast-close-btn" onclick="this.parentElement.remove()">&times;</button>
    `;
    container.appendChild(toast);
    
    // Auto remove after 3.5 seconds
    setTimeout(() => {
        toast.style.animation = 'slideInToast 0.3s reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Modal Controllers
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// UI Dropdowns & Collapsible Sidebar Toggles
document.addEventListener('DOMContentLoaded', () => {
    // Check if database needs seeding
    if (window.initLocalStorageDB) {
        window.initLocalStorageDB();
    }
    
    // Sidebar toggle (Desktop)
    const sidebarCollapseBtn = document.getElementById('sidebarCollapseBtn');
    const appContainer = document.getElementById('appContainer');
    sidebarCollapseBtn.addEventListener('click', () => {
        appContainer.classList.toggle('sidebar-collapsed');
    });

    // Sidebar toggle (Mobile)
    const mobileMenuToggleBtn = document.getElementById('mobileMenuToggleBtn');
    mobileMenuToggleBtn.addEventListener('click', () => {
        appContainer.classList.toggle('sidebar-open');
    });

    // Profile Dropdown click handling
    const profileDropdownTrigger = document.getElementById('profileDropdownTrigger');
    const profileDropdown = document.getElementById('profileDropdown');
    profileDropdownTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.style.display = profileDropdown.style.display === 'flex' ? 'none' : 'flex';
        // Close other dropdowns
        document.getElementById('notificationDropdown').style.display = 'none';
        document.getElementById('globalSearchResults').style.display = 'none';
    });

    // Notifications Dropdown click handling
    const bellBtn = document.getElementById('bellBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationDropdown.style.display = notificationDropdown.style.display === 'flex' ? 'none' : 'flex';
        // Close other dropdowns
        profileDropdown.style.display = 'none';
        document.getElementById('globalSearchResults').style.display = 'none';
    });

    // Global click listener to shut open dropdowns
    document.addEventListener('click', () => {
        profileDropdown.style.display = 'none';
        notificationDropdown.style.display = 'none';
        document.getElementById('globalSearchResults').style.display = 'none';
    });

    // Logout Action
    const logoutAction = () => {
        localStorage.removeItem('autocare_auth');
        window.location.href = 'login.html';
    };
    document.getElementById('logoutBtn').addEventListener('click', logoutAction);
    document.getElementById('dropdownLogoutBtn').addEventListener('click', logoutAction);

    // Initial Routing Setup
    window.addEventListener('hashchange', handleRouting);
    handleRouting();

    // Trigger Initial Profile / Header load
    updateHeaderUI();

    // Event listener configurations for forms
    setupFormListeners();

    // Initialize notification counters
    updateNotificationsUI();
    
    // Initial global search listener
    setupGlobalSearch();
});

// Load Current Profile details onto the Topbar Header
function updateHeaderUI() {
    const profile = getProfile();
    document.getElementById('headerProfileName').textContent = profile.name || "Alex Mercer";
    document.getElementById('headerProfileRole').textContent = profile.role || "Manager";
    document.getElementById('headerProfileImg').src = profile.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80";
}

// Router Mapping hashes to content panels
const routes = {
    'dashboard': { viewId: 'view-dashboard', title: 'Dashboard Analytics', init: loadDashboardView },
    'customers': { viewId: 'view-customers', title: 'Customers Directory', init: loadCustomersView },
    'customer-details': { viewId: 'view-customer-details', title: 'Customer Details', init: loadCustomerDetailsView },
    'vehicles': { viewId: 'view-vehicles', title: 'Vehicles Fleet', init: loadVehiclesView },
    'vehicle-details': { viewId: 'view-vehicle-details', title: 'Vehicle Profile', init: loadVehicleDetailsView },
    'bookings': { viewId: 'view-bookings', title: 'Service Bookings', init: loadBookingsView },
    'tracking': { viewId: 'view-tracking', title: 'Live Service Progress', init: loadTrackingView },
    'records': { viewId: 'view-records', title: 'Completed Service Records', init: loadRecordsView },
    'mechanics': { viewId: 'view-mechanics', title: 'Mechanics Registry', init: loadMechanicsView },
    'services': { viewId: 'view-services', title: 'Service Catalog', init: loadServicesView },
    'inventory': { viewId: 'view-inventory', title: 'Spare Parts Inventory', init: loadInventoryView },
    'billing': { viewId: 'view-billing', title: 'Billing & Invoices', init: loadBillingView },
    'invoice-details': { viewId: 'view-invoice-details', title: 'Client Tax Invoice', init: loadInvoiceDetailsView },
    'reports': { viewId: 'view-reports', title: 'Reports & Business Analytics', init: loadReportsView },
    'notifications': { viewId: 'view-notifications', title: 'System Notifications Log', init: loadNotificationsView },
    'settings': { viewId: 'view-settings', title: 'System Configurations', init: loadSettingsView },
    'profile': { viewId: 'view-profile', title: 'Admin Account Settings', init: loadProfileView }
};

function handleRouting() {
    const hash = window.location.hash.split('?')[0];
    let routeKey = hash.replace('#/', '');
    
    // Default route
    if (!routeKey || routeKey === '') {
        routeKey = 'dashboard';
        window.location.hash = '#/dashboard';
        return;
    }

    const route = routes[routeKey];
    if (route) {
        appState.activePage = routeKey;
        
        // Hide all views & show target
        document.querySelectorAll('.content-panel').forEach(p => p.classList.remove('active'));
        const targetView = document.getElementById(route.viewId);
        if (targetView) {
            targetView.classList.add('active');
        }

        // Set Top Nav Header Page Title
        document.getElementById('headerPageTitle').textContent = route.title;

        // Highlight Sidebar item
        document.querySelectorAll('.sidebar-menu .menu-item').forEach(li => {
            li.classList.remove('active');
            if (li.getAttribute('data-page') === routeKey) {
                li.classList.add('active');
            }
        });

        // Initialize Route Specific Functions
        route.init();
        
        // Close Mobile Menu automatically
        document.getElementById('appContainer').classList.remove('sidebar-open');
    } else {
        // Fallback
        window.location.hash = '#/dashboard';
    }
}

// Helper to extract Query parameters from hash: e.g. #/customer-details?id=CST001
function getQueryParam(paramName) {
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
    return searchParams.get(paramName);
}


// ==========================================================================
// 1. DASHBOARD VIEW CONTROLLER
// ==========================================================================
function loadDashboardView() {
    const customers = getDB('customers');
    const vehicles = getDB('vehicles');
    const bookings = getDB('bookings');
    const inventory = getDB('inventory');
    const invoices = getDB('invoices');
    
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Set greeting name dynamically
    const welcomeName = document.getElementById('dashboardWelcomeName');
    if (welcomeName) {
        welcomeName.textContent = (getProfile().name || 'Akhilesh').split(' ')[0];
    }
    
    // Dynamic Stats Calculations
    const totalCustomers = customers.length;
    const totalVehicles = vehicles.length;
    const todaysBookings = bookings.filter(b => b.date === todayStr).length;
    const activeServices = bookings.filter(b => ['Inspection', 'In Service', 'Waiting for Parts'].includes(b.status)).length;
    const completedServices = bookings.filter(b => b.status === 'Completed').length;
    const lowStockItems = inventory.filter(p => p.quantity <= p.minStock).length;
    
    // Calculations for Revenue
    const paidInvoices = invoices.filter(inv => inv.status === 'Paid');
    const totalRevenue = paidInvoices.reduce((sum, item) => sum + item.total, 0);
    
    // Calculations for Pending Payments
    const pendingInvoices = invoices.filter(inv => inv.status === 'Pending' || inv.status === 'Partially Paid');
    const pendingPaymentsSum = pendingInvoices.reduce((sum, item) => sum + item.total, 0);

    const statsGrid = document.getElementById('dashboardStatsGrid');
    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-card-left">
                <span class="stat-card-title">Total Customers</span>
                <span class="stat-card-value">${totalCustomers}</span>
            </div>
            <div class="stat-card-icon primary">
                <i class="fa-solid fa-users"></i>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-card-left">
                <span class="stat-card-title">Registered Fleet</span>
                <span class="stat-card-value">${totalVehicles}</span>
            </div>
            <div class="stat-card-icon info">
                <i class="fa-solid fa-car"></i>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-card-left">
                <span class="stat-card-title">Today's Bookings</span>
                <span class="stat-card-value">${todaysBookings}</span>
            </div>
            <div class="stat-card-icon purple">
                <i class="fa-solid fa-calendar-day"></i>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-card-left">
                <span class="stat-card-title">Active Services</span>
                <span class="stat-card-value">${activeServices}</span>
            </div>
            <div class="stat-card-icon warning">
                <i class="fa-solid fa-screwdriver-wrench"></i>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-card-left">
                <span class="stat-card-title">Completed (All)</span>
                <span class="stat-card-value">${completedServices}</span>
            </div>
            <div class="stat-card-icon success">
                <i class="fa-solid fa-square-check"></i>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-card-left">
                <span class="stat-card-title">Invoiced Revenue</span>
                <span class="stat-card-value">₹${totalRevenue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div class="stat-card-icon success">
                <i class="fa-solid fa-sack-dollar"></i>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-card-left">
                <span class="stat-card-title">Outstanding Payments</span>
                <span class="stat-card-value">₹${pendingPaymentsSum.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div class="stat-card-icon danger">
                <i class="fa-solid fa-hand-holding-dollar"></i>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-card-left">
                <span class="stat-card-title">Low Stock Spare Parts</span>
                <span class="stat-card-value">${lowStockItems}</span>
            </div>
            <div class="stat-card-icon danger">
                <i class="fa-solid fa-boxes-stacked"></i>
            </div>
        </div>
    `;

    // Render Active Vehicles Grid
    const activeVehiclesGrid = document.getElementById('dashboardActiveVehiclesGrid');
    if (activeVehiclesGrid) {
        activeVehiclesGrid.innerHTML = '';
        
        // Find bookings that are currently active in shop
        const activeBookings = bookings.filter(b => ['Inspection', 'In Service', 'Waiting for Parts'].includes(b.status));
        
        if (activeBookings.length === 0) {
            activeVehiclesGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 24px; color: var(--text-muted); font-size: 13.5px;">
                    <i class="fa-solid fa-square-check" style="font-size: 24px; color: var(--success); margin-bottom: 8px; display: block;"></i>
                    No vehicles are currently in the service bay. All clear!
                </div>
            `;
        } else {
            activeBookings.slice(0, 3).forEach(b => {
                const v = vehicles.find(x => x.id === b.vehicleId || x.regNo === b.vehicleReg) || {};
                const imgPath = v.image || "assets/images/vehicles/bmw_3_series.jpg";
                
                let statusBadgeClass = 'badge-info';
                if (b.status === 'In Service') statusBadgeClass = 'badge-success';
                if (b.status === 'Waiting for Parts') statusBadgeClass = 'badge-warning';

                activeVehiclesGrid.innerHTML += `
                    <div class="service-bay-card" style="background: var(--bg-main); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; display: flex; gap: 12px; align-items: center; transition: var(--transition-speed);">
                        <img src="${imgPath}" alt="${b.vehicleReg}" style="width: 80px; height: 60px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                        <div style="flex:1; min-width: 0;">
                            <h4 style="font-weight: 700; font-size: 14px; margin-bottom: 2px; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${v.brand || 'BMW'} ${v.model || 'Series'}</h4>
                            <p style="font-family: monospace; font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">${b.vehicleReg}</p>
                            <div style="font-size: 11px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                <span><strong style="color:var(--text-secondary);">Owner:</strong> ${b.customerName}</span><br>
                                <span><strong style="color:var(--text-secondary);">Service:</strong> ${b.serviceType}</span>
                            </div>
                        </div>
                        <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
                            <span class="badge ${statusBadgeClass}" style="font-size: 10px;">${b.status}</span>
                            <span style="font-size: 10.5px; color: var(--text-muted); font-weight: 500;"><i class="fa-solid fa-wrench" style="margin-right:3px;"></i> ${b.mechanicName || 'Unassigned'}</span>
                        </div>
                    </div>
                `;
            });
        }
    }

    // Render Recent Bookings Table
    const recentTableBody = document.getElementById('dashboardRecentBookingsTable');
    recentTableBody.innerHTML = '';
    
    // Get last 5 bookings
    const recentBookings = [...bookings].reverse().slice(0, 5);
    
    if (recentBookings.length === 0) {
        recentTableBody.innerHTML = `<tr><td colspan="6" class="empty-state-container" style="padding:20px;">No bookings found.</td></tr>`;
    } else {
        recentBookings.forEach(b => {
            let statusBadge = getBookingStatusBadgeClass(b.status);
            recentTableBody.innerHTML += `
                <tr>
                    <td><a href="#/bookings" style="font-weight:600; color:var(--primary);">${b.id}</a></td>
                    <td style="font-weight:500;">${b.customerName}</td>
                    <td><span style="font-family:monospace; background:#e2e8f0; padding:2px 6px; border-radius:4px;">${b.vehicleReg}</span></td>
                    <td>${b.serviceType}</td>
                    <td>${b.time}</td>
                    <td><span class="badge ${statusBadge}">${b.status}</span></td>
                </tr>
            `;
        });
    }

    // Render Low Stock Widget List
    const lowStockList = document.getElementById('dashboardLowStockList');
    lowStockList.innerHTML = '';
    const lowStockParts = inventory.filter(p => p.quantity <= p.minStock);
    if (lowStockParts.length === 0) {
        lowStockList.innerHTML = `
            <li class="empty-state-container" style="padding:15px; border: 1px dashed var(--border-color); border-radius:var(--radius-sm);">
                <i class="fa-solid fa-circle-check" style="color:var(--success); font-size:24px; margin-bottom:8px;"></i>
                <h4 style="font-size:13px;">Inventory OK</h4>
                <p style="font-size:11px;">All spare parts are within safety parameters.</p>
            </li>
        `;
    } else {
        lowStockParts.slice(0, 5).forEach(part => {
            lowStockList.innerHTML += `
                <li style="display:flex; align-items:center; justify-content:space-between; padding:12px; border-bottom:1px solid var(--border-color); font-size:13px;">
                    <div>
                        <strong style="display:block; color:var(--text-main); font-weight:600;">${part.name}</strong>
                        <span style="font-size:11px; color:var(--text-muted);">Supplier: ${part.supplier}</span>
                    </div>
                    <span class="badge badge-danger" style="font-size:10.5px;">Qty: ${part.quantity} / Min: ${part.minStock}</span>
                </li>
            `;
        });
    }

    // Render Dash Charts
    renderDashboardCharts(bookings, invoices);
}

function getBookingStatusBadgeClass(status) {
    switch (status) {
        case 'Booked': return 'badge-status-booked';
        case 'Confirmed': return 'badge-status-confirmed';
        case 'Inspection': return 'badge-status-inspection';
        case 'In Service': return 'badge-status-inservice';
        case 'Waiting for Parts': return 'badge-status-waitingparts';
        case 'Ready for Delivery': return 'badge-status-ready';
        case 'Completed': return 'badge-status-completed';
        case 'Cancelled': return 'badge-status-cancelled';
        default: return 'badge-primary';
    }
}

function renderDashboardCharts(bookings, invoices) {
    // Destroy previous chart instances if they exist
    if (appState.charts.dashRevenue) appState.charts.dashRevenue.destroy();
    if (appState.charts.dashPopular) appState.charts.dashPopular.destroy();

    // 1. Monthly Revenue Analytics Setup (Last 6 Months)
    const revCtx = document.getElementById('chartMonthlyRevenue').getContext('2d');
    
    // Group invoices by month
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
        let m = currentMonth - i;
        if (m < 0) m += 12;
        last6Months.push(months[m]);
    }

    // Dynamic mock sums from actual invoices
    const monthlySumValues = last6Months.map((mName, index) => {
        // filter paid invoices where date matches
        let testMonthIdx = months.indexOf(mName);
        let yearFilter = new Date().getFullYear();
        if (testMonthIdx > currentMonth) yearFilter -= 1; // last year

        const matchedInvoices = invoices.filter(inv => {
            const d = new Date(inv.date);
            return d.getMonth() === testMonthIdx && d.getFullYear() === yearFilter && inv.status === 'Paid';
        });
        return matchedInvoices.reduce((sum, x) => sum + x.total, 0);
    });

    appState.charts.dashRevenue = new Chart(revCtx, {
        type: 'line',
        data: {
            labels: last6Months,
            datasets: [{
                label: 'Invoiced Payments (₹)',
                data: monthlySumValues,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(226, 232, 240, 0.5)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // 2. Service Bookings & Popular Service Types Distribution Setup
    const popCtx = document.getElementById('chartPopularServices').getContext('2d');
    
    // Group bookings by service type
    const serviceTypeCounts = {};
    bookings.forEach(b => {
        serviceTypeCounts[b.serviceType] = (serviceTypeCounts[b.serviceType] || 0) + 1;
    });

    const serviceLabels = Object.keys(serviceTypeCounts);
    const serviceValues = Object.values(serviceTypeCounts);

    appState.charts.dashPopular = new Chart(popCtx, {
        type: 'doughnut',
        data: {
            labels: serviceLabels.length > 0 ? serviceLabels : ['General Service', 'Oil Change', 'Brakes'],
            datasets: [{
                data: serviceValues.length > 0 ? serviceValues : [3, 2, 1],
                backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#f43f5e'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { boxWidth: 12, padding: 16, font: { family: 'Inter', size: 11 } }
                }
            },
            cutout: '60%'
        }
    });
}


// ==========================================================================
// 2. CUSTOMER MODULE CONTROLLER (CRUD)
// ==========================================================================
function loadCustomersView() {
    const customers = getDB('customers');
    const searchVal = document.getElementById('customerSearchInput').value.toLowerCase();
    const sortVal = document.getElementById('customerSortSelect').value;

    // Filter
    let filtered = customers.filter(c => 
        c.name.toLowerCase().includes(searchVal) ||
        c.email.toLowerCase().includes(searchVal) ||
        c.phone.includes(searchVal) ||
        c.id.toLowerCase().includes(searchVal)
    );

    // Sort
    if (sortVal === 'name-asc') {
        filtered.sort((a,b) => a.name.localeCompare(b.name));
    } else if (sortVal === 'name-desc') {
        filtered.sort((a,b) => b.name.localeCompare(a.name));
    } else if (sortVal === 'date-newest') {
        filtered.sort((a,b) => new Date(b.registrationDate) - new Date(a.registrationDate));
    } else if (sortVal === 'date-oldest') {
        filtered.sort((a,b) => new Date(a.registrationDate) - new Date(b.registrationDate));
    }

    // Paginate
    const pag = appState.pagination.customers;
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pag.limit) || 1;
    if (pag.page > totalPages) pag.page = totalPages;
    const startIndex = (pag.page - 1) * pag.limit;
    const paginated = filtered.slice(startIndex, startIndex + pag.limit);

    const tbody = document.getElementById('customersTableBody');
    tbody.innerHTML = '';

    if (paginated.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-state-container">
            <i class="fa-solid fa-users-slash empty-state-icon"></i>
            <h4>No Customers Registered</h4>
            <p>Try searching for a different term or click "Add Customer" to start logging records.</p>
        </td></tr>`;
    } else {
        paginated.forEach(c => {
            tbody.innerHTML += `
                <tr>
                    <td><a href="#/customer-details?id=${c.id}" style="font-weight:600; color:var(--primary);">${c.id}</a></td>
                    <td>
                        <div style="font-weight:600; color:var(--text-main);">${c.name}</div>
                        <span style="font-size:11.5px; color:var(--text-muted);">${c.address}</span>
                    </td>
                    <td>${c.phone}</td>
                    <td>${c.email}</td>
                    <td style="text-align:center;"><span class="badge badge-primary" style="border-radius:4px; font-weight:700;">${c.vehiclesCount}</span></td>
                    <td>${c.registrationDate}</td>
                    <td style="text-align: right;">
                        <div class="action-buttons-flex" style="justify-content: flex-end;">
                            <a href="#/customer-details?id=${c.id}" class="btn-icon-action" title="View details"><i class="fa-solid fa-eye"></i></a>
                            <button class="btn-icon-action" onclick="openEditCustomerModal('${c.id}')" title="Edit customer"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn-icon-action btn-delete" onclick="triggerDeleteRecord('customers', '${c.id}')" title="Delete customer"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    renderPaginationControl('customerPagination', pag.page, totalPages, totalItems, pag.limit, (newPage) => {
        appState.pagination.customers.page = newPage;
        loadCustomersView();
    });
}

// Open modals for customer CRUD
document.getElementById('openAddCustomerModalBtn').addEventListener('click', () => {
    document.getElementById('customerForm').reset();
    document.getElementById('customerIdHidden').value = '';
    document.getElementById('customerModalTitle').textContent = 'Add Customer';
    openModal('customerModal');
});

function openEditCustomerModal(id) {
    const customers = getDB('customers');
    const c = customers.find(x => x.id === id);
    if (!c) return;

    document.getElementById('customerIdHidden').value = c.id;
    document.getElementById('custName').value = c.name;
    document.getElementById('custPhone').value = c.phone;
    document.getElementById('custEmail').value = c.email;
    document.getElementById('custAddress').value = c.address;
    
    document.getElementById('customerModalTitle').textContent = 'Modify Customer Details';
    openModal('customerModal');
}

// ==========================================================================
// 3. VEHICLE MODULE CONTROLLER (CRUD)
// ==========================================================================
function loadVehiclesView() {
    const vehicles = getDB('vehicles');
    const searchVal = document.getElementById('vehicleSearchInput').value.toLowerCase();
    const fuelVal = document.getElementById('vehicleFuelFilter').value;

    let filtered = vehicles.filter(v => 
        v.regNo.toLowerCase().includes(searchVal) ||
        v.brand.toLowerCase().includes(searchVal) ||
        v.model.toLowerCase().includes(searchVal) ||
        v.ownerName.toLowerCase().includes(searchVal) ||
        v.id.toLowerCase().includes(searchVal)
    );

    if (fuelVal !== 'all') {
        filtered = filtered.filter(v => v.fuel === fuelVal);
    }

    const pag = appState.pagination.vehicles;
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pag.limit) || 1;
    if (pag.page > totalPages) pag.page = totalPages;
    const startIndex = (pag.page - 1) * pag.limit;
    const paginated = filtered.slice(startIndex, startIndex + pag.limit);

    const tbody = document.getElementById('vehiclesTableBody');
    tbody.innerHTML = '';

    if (paginated.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-state-container">
            <i class="fa-solid fa-car-burst empty-state-icon"></i>
            <h4>No Vehicles Tracked</h4>
            <p>Click "Add Vehicle" to register customer cars for service operations.</p>
        </td></tr>`;
    } else {
        paginated.forEach(v => {
            const imgPath = v.image || "assets/images/vehicles/bmw_3_series.jpg";
            tbody.innerHTML += `
                <tr>
                    <td><a href="#/vehicle-details?id=${v.id}" style="font-weight:600; color:var(--primary);">${v.id}</a></td>
                    <td><span style="font-family:monospace; font-weight:700; background:#f1f5f9; padding:4px 8px; border:1px solid #cbd5e1; border-radius:4px;">${v.regNo}</span></td>
                    <td>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <img src="${imgPath}" alt="${v.regNo}" style="width: 48px; height: 36px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-color);">
                            <div>
                                <div style="font-weight:600; color:var(--text-main);">${v.brand} ${v.model}</div>
                                <span style="font-size:11.5px; color:var(--text-muted);">${v.year} | ${v.color}</span>
                            </div>
                        </div>
                    </td>
                    <td style="font-weight:500;">${v.ownerName}</td>
                    <td>
                        <span class="badge badge-info">${v.fuel}</span>
                        <span style="font-size:12px; color:var(--text-muted); font-weight:500; margin-left:6px;">${v.transmission}</span>
                    </td>
                    <td>${v.lastServiceDate || 'Not Serviced'}</td>
                    <td style="text-align: right;">
                        <div class="action-buttons-flex" style="justify-content: flex-end;">
                            <a href="#/vehicle-details?id=${v.id}" class="btn-icon-action" title="View details"><i class="fa-solid fa-eye"></i></a>
                            <button class="btn-icon-action" onclick="openEditVehicleModal('${v.id}')" title="Edit vehicle"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn-icon-action btn-delete" onclick="triggerDeleteRecord('vehicles', '${v.id}')" title="Delete vehicle"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    renderPaginationControl('vehiclePagination', pag.page, totalPages, totalItems, pag.limit, (newPage) => {
        appState.pagination.vehicles.page = newPage;
        loadVehiclesView();
    });
}

document.getElementById('openAddVehicleModalBtn').addEventListener('click', () => {
    document.getElementById('vehicleForm').reset();
    document.getElementById('vehicleIdHidden').value = '';
    document.getElementById('vehicleModalTitle').textContent = 'Add Vehicle';
    
    // Dynamic owner dropdown load
    loadCustomerDropdown('vehOwner');
    openModal('vehicleModal');
});

function openEditVehicleModal(id) {
    const vehicles = getDB('vehicles');
    const v = vehicles.find(x => x.id === id);
    if (!v) return;

    loadCustomerDropdown('vehOwner');

    document.getElementById('vehicleIdHidden').value = v.id;
    document.getElementById('vehOwner').value = v.ownerId;
    document.getElementById('vehRegNo').value = v.regNo;
    document.getElementById('vehBrand').value = v.brand;
    document.getElementById('vehModel').value = v.model;
    document.getElementById('vehYear').value = v.year;
    document.getElementById('vehFuel').value = v.fuel;
    document.getElementById('vehTransmission').value = v.transmission;
    document.getElementById('vehKmReading').value = v.kmReading;
    document.getElementById('vehColor').value = v.color;
    document.getElementById('vehLastService').value = v.lastServiceDate;
    
    document.getElementById('vehicleModalTitle').textContent = 'Modify Vehicle Parameters';
    openModal('vehicleModal');
}

function loadCustomerDropdown(selectId) {
    const customers = getDB('customers');
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">-- Choose Owner --</option>';
    customers.forEach(c => {
        select.innerHTML += `<option value="${c.id}">${c.name} (${c.phone})</option>`;
    });
}


// ==========================================================================
// 4. SERVICE BOOKINGS MODULE (CRUD)
// ==========================================================================
function loadBookingsView() {
    const bookings = getDB('bookings');
    const searchVal = document.getElementById('bookingSearchInput').value.toLowerCase();
    const statusVal = document.getElementById('bookingStatusFilter').value;
    const dateVal = document.getElementById('bookingDateFilter').value;

    let filtered = bookings.filter(b => 
        b.customerName.toLowerCase().includes(searchVal) ||
        b.vehicleReg.toLowerCase().includes(searchVal) ||
        b.serviceType.toLowerCase().includes(searchVal) ||
        b.id.toLowerCase().includes(searchVal)
    );

    if (statusVal !== 'all') {
        filtered = filtered.filter(b => b.status === statusVal);
    }
    
    if (dateVal) {
        filtered = filtered.filter(b => b.date === dateVal);
    }

    const pag = appState.pagination.bookings;
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pag.limit) || 1;
    if (pag.page > totalPages) pag.page = totalPages;
    const startIndex = (pag.page - 1) * pag.limit;
    const paginated = filtered.slice(startIndex, startIndex + pag.limit);

    const tbody = document.getElementById('bookingsTableBody');
    tbody.innerHTML = '';

    if (paginated.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="empty-state-container">
            <i class="fa-solid fa-calendar-times empty-state-icon"></i>
            <h4>No Bookings Logged</h4>
            <p>Verify your filter parameters or schedule a new service booking.</p>
        </td></tr>`;
    } else {
        paginated.forEach(b => {
            let statusBadge = getBookingStatusBadgeClass(b.status);
            tbody.innerHTML += `
                <tr>
                    <td><span style="font-weight:700; color:var(--primary);">${b.id}</span></td>
                    <td style="font-weight:600;">${b.customerName}</td>
                    <td><span style="font-family:monospace; background:#e2e8f0; padding:2px 6px; border-radius:4px;">${b.vehicleReg}</span></td>
                    <td style="font-weight:500;">${b.serviceType}</td>
                    <td>
                        <div style="font-weight:500; font-size:13px;">${b.date}</div>
                        <span style="font-size:11px; color:var(--text-muted);">${b.time}</span>
                    </td>
                    <td>${b.mechanicName || '<em>Unassigned</em>'}</td>
                    <td><span class="badge ${statusBadge}">${b.status}</span></td>
                    <td style="text-align: right;">
                        <div class="action-buttons-flex" style="justify-content: flex-end;">
                            <button class="btn-icon-action" onclick="openEditBookingModal('${b.id}')" title="Edit booking"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn-icon-action btn-delete" onclick="triggerDeleteRecord('bookings', '${b.id}')" title="Cancel/Delete booking"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    renderPaginationControl('bookingPagination', pag.page, totalPages, totalItems, pag.limit, (newPage) => {
        appState.pagination.bookings.page = newPage;
        loadBookingsView();
    });
}

document.getElementById('openAddBookingModalBtn').addEventListener('click', () => {
    document.getElementById('bookingForm').reset();
    document.getElementById('bookingIdHidden').value = '';
    document.getElementById('bookingModalTitle').textContent = 'Create Service Booking';
    
    // Dynamic lists load
    loadCustomerDropdown('bkgCustomer');
    loadServicesDropdown();
    loadMechanicsDropdown();
    
    // Set default booking date to today
    document.getElementById('bkgDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('bkgStatus').value = 'Booked';

    // Trigger empty load
    loadCustomerVehiclesDropdown('', 'bkgVehicle');

    openModal('bookingModal');
});

function openEditBookingModal(id) {
    const bookings = getDB('bookings');
    const b = bookings.find(x => x.id === id);
    if (!b) return;

    loadCustomerDropdown('bkgCustomer');
    loadCustomerVehiclesDropdown(b.customerId, 'bkgVehicle');
    loadServicesDropdown();
    loadMechanicsDropdown();

    document.getElementById('bookingIdHidden').value = b.id;
    document.getElementById('bkgCustomer').value = b.customerId;
    document.getElementById('bkgVehicle').value = b.vehicleId;
    document.getElementById('bkgService').value = b.serviceId;
    document.getElementById('bkgDate').value = b.date;
    document.getElementById('bkgTime').value = b.time;
    document.getElementById('bkgMechanic').value = b.mechanicId || '';
    document.getElementById('bkgStatus').value = b.status;
    document.getElementById('bkgCost').value = b.cost;
    document.getElementById('bkgComplaint').value = b.complaint;

    document.getElementById('bookingModalTitle').textContent = 'Edit Service Booking Parameters';
    openModal('bookingModal');
}

function loadCustomerVehiclesDropdown(customerId, selectId) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">-- Choose Vehicle --</option>';
    if (!customerId) return;
    
    const vehicles = getDB('vehicles');
    const matched = vehicles.filter(v => v.ownerId === customerId);
    matched.forEach(v => {
        select.innerHTML += `<option value="${v.id}">${v.brand} ${v.model} (${v.regNo})</option>`;
    });
}

function loadServicesDropdown() {
    const services = getDB('services');
    const select = document.getElementById('bkgService');
    select.innerHTML = '<option value="">-- Choose Service Catalog --</option>';
    services.forEach(s => {
        if (s.status === 'Active') {
            select.innerHTML += `<option value="${s.id}">${s.name} (₹${s.basePrice})</option>`;
        }
    });
}

function loadMechanicsDropdown() {
    const mechanics = getDB('mechanics');
    const select = document.getElementById('bkgMechanic');
    select.innerHTML = '<option value="">-- Choose Mechanic --</option>';
    mechanics.forEach(m => {
        if (m.status !== 'On Leave') {
            select.innerHTML += `<option value="${m.id}">${m.name} (${m.specialization})</option>`;
        }
    });
}


// ==========================================================================
// 5. SERVICE TRACKING VIEW CONTROLLER
// ==========================================================================
const trackingStages = [
    "Booking Confirmed",
    "Vehicle Received",
    "Inspection",
    "Service Started",
    "Waiting for Parts",
    "Quality Check",
    "Ready for Delivery",
    "Completed"
];

function loadTrackingView() {
    const bookings = getDB('bookings');
    const activeBookings = bookings.filter(b => b.status !== 'Cancelled');
    
    const selector = document.getElementById('trackingBookingSelector');
    selector.innerHTML = '<option value="">-- Select Active Booking --</option>';
    
    activeBookings.forEach(b => {
        selector.innerHTML += `<option value="${b.id}">${b.id} - ${b.customerName} (${b.vehicleReg})</option>`;
    });

    const activeId = getQueryParam('bookingId');
    const trackingWrapper = document.getElementById('trackingInteractiveWrapper');

    if (activeId) {
        selector.value = activeId;
        renderTrackingConsole(activeId);
    } else if (activeBookings.length > 0) {
        // Load first booking by default
        selector.value = activeBookings[0].id;
        renderTrackingConsole(activeBookings[0].id);
    } else {
        trackingWrapper.innerHTML = `
            <div class="card-panel">
                <div class="empty-state-container">
                    <i class="fa-solid fa-route empty-state-icon"></i>
                    <h4>No Service Bookings Available</h4>
                    <p>Create a service booking to track and update progress.</p>
                </div>
            </div>
        `;
    }

    selector.onchange = (e) => {
        if (e.target.value) {
            window.location.hash = `#/tracking?bookingId=${e.target.value}`;
        }
    };
}

function renderTrackingConsole(bookingId) {
    const bookings = getDB('bookings');
    const trackingDB = JSON.parse(localStorage.getItem('autocare_tracking')) || {};
    const b = bookings.find(x => x.id === bookingId);
    if (!b) return;

    // Map booking status to stage index
    let currentStageIndex = getStageIndexFromStatus(b.status);
    
    // Check if there are saved tracking detail extensions in local storage
    const trackDetails = trackingDB[bookingId] || {
        stageIndex: currentStageIndex,
        notes: "No initial notes compiled. Update service details below.",
        estimatedCompletion: "Not specified",
        updatedBy: "System Admin"
    };

    // Ensure state matches booking status
    trackDetails.stageIndex = currentStageIndex;

    const fillWidthPercentage = (currentStageIndex / (trackingStages.length - 1)) * 100;

    const wrapper = document.getElementById('trackingInteractiveWrapper');
    
    // Timeline steps HTML compilation
    let stepsHTML = '';
    trackingStages.forEach((stage, idx) => {
        let stepClass = '';
        if (idx < currentStageIndex) stepClass = 'completed';
        else if (idx === currentStageIndex) stepClass = 'active';
        
        stepsHTML += `
            <div class="timeline-step-node ${stepClass}" onclick="updateTrackingStageDirectly('${bookingId}', ${idx})">
                <div class="timeline-node-circle">
                    ${idx < currentStageIndex ? '<i class="fa-solid fa-check"></i>' : idx + 1}
                </div>
                <div class="timeline-node-label">${stage}</div>
            </div>
        `;
    });

    wrapper.innerHTML = `
        <div class="card-panel">
            <div class="card-panel-header">
                <h3>Visual Stages Timeline Progress</h3>
                <span class="badge ${getBookingStatusBadgeClass(b.status)}" style="font-size:13px; font-weight:700;">Status: ${b.status}</span>
            </div>
            <div class="card-panel-body">
                <div class="tracking-timeline-horizontal">
                    <div class="tracking-progress-fill" style="width: ${fillWidthPercentage}%;"></div>
                    ${stepsHTML}
                </div>
            </div>
        </div>

        <div class="tracking-detail-card-grid">
            <div class="card-panel">
                <div class="card-panel-header">
                    <h3>Service Tracking Details</h3>
                </div>
                <div class="card-panel-body">
                    <form id="trackingDetailForm" onsubmit="saveTrackingNotes(event, '${bookingId}')">
                        <div class="form-field-group">
                            <label for="trackNotes">Service Progress Notes</label>
                            <textarea id="trackNotes" rows="4" required placeholder="State operations completed, issues discovered...">${trackDetails.notes}</textarea>
                        </div>
                        <div class="form-grid-2-col">
                            <div class="form-field-group">
                                <label for="trackEstTime">Estimated Completion</label>
                                <input type="text" id="trackEstTime" value="${trackDetails.estimatedCompletion}" placeholder="e.g. 2026-07-08 05:00 PM">
                            </div>
                            <div class="form-field-group">
                                <label for="trackOperator">Updated By</label>
                                <input type="text" id="trackOperator" value="${trackDetails.updatedBy || 'Alex Mercer'}">
                            </div>
                        </div>
                        <div style="display:flex; justify-content:flex-end; margin-top:10px;">
                            <button type="submit" class="btn-primary">
                                <i class="fa-solid fa-save"></i> Save Progress Logs
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div class="card-panel">
                <div class="card-panel-header">
                    <h3>Linked Parameters</h3>
                </div>
                <div class="card-panel-body" style="padding: 0 24px;">
                    <div class="info-row-item">
                        <span class="info-row-label">Booking ID</span>
                        <span class="info-row-value" style="font-weight:700; color:var(--primary);">${b.id}</span>
                    </div>
                    <div class="info-row-item">
                        <span class="info-row-label">Owner Name</span>
                        <span class="info-row-value">${b.customerName}</span>
                    </div>
                    <div class="info-row-item">
                        <span class="info-row-label">Vehicle Registration</span>
                        <span class="info-row-value" style="font-family:monospace; font-weight:700;">${b.vehicleReg}</span>
                    </div>
                    <div class="info-row-item">
                        <span class="info-row-label">Assigned Mechanic</span>
                        <span class="info-row-value">${b.mechanicName || 'Unassigned'}</span>
                    </div>
                    <div class="info-row-item">
                        <span class="info-row-label">Preferred Date/Time</span>
                        <span class="info-row-value" style="font-size:12.5px;">${b.date} | ${b.time}</span>
                    </div>
                    <div class="info-row-item">
                        <span class="info-row-label">Estimated Service cost</span>
                        <span class="info-row-value">₹${b.cost}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getStageIndexFromStatus(status) {
    switch (status) {
        case 'Booked': return 0;
        case 'Confirmed': return 1;
        case 'Inspection': return 2;
        case 'In Service': return 3;
        case 'Waiting for Parts': return 4;
        case 'Quality Check': return 5;
        case 'Ready for Delivery': return 6;
        case 'Completed': return 7;
        default: return 0;
    }
}

function getStatusFromStageIndex(index) {
    const mapping = ['Booked', 'Confirmed', 'Inspection', 'In Service', 'Waiting for Parts', 'Quality Check', 'Ready for Delivery', 'Completed'];
    return mapping[index] || 'Booked';
}

function updateTrackingStageDirectly(bookingId, targetIdx) {
    const bookings = getDB('bookings');
    const bIdx = bookings.findIndex(x => x.id === bookingId);
    if (bIdx === -1) return;

    const newStatus = getStatusFromStageIndex(targetIdx);
    
    // Update booking status in DB
    bookings[bIdx].status = newStatus;
    saveDB('bookings', bookings);

    // Save tracking metadata
    const trackingDB = JSON.parse(localStorage.getItem('autocare_tracking')) || {};
    trackingDB[bookingId] = trackingDB[bookingId] || {};
    trackingDB[bookingId].stageIndex = targetIdx;
    localStorage.setItem('autocare_tracking', JSON.stringify(trackingDB));

    // Show toast and re-render
    showToast(`Service stage updated to: ${trackingStages[targetIdx]}`, 'success');
    
    // Trigger notification if Completed
    if (newStatus === 'Completed') {
        addNotification(`Vehicle ${bookings[bIdx].vehicleReg} completed service. Invoice ready for generation.`, 'completed');
    }

    renderTrackingConsole(bookingId);
}

function saveTrackingNotes(event, bookingId) {
    event.preventDefault();
    const trackingDB = JSON.parse(localStorage.getItem('autocare_tracking')) || {};
    
    trackingDB[bookingId] = trackingDB[bookingId] || {};
    trackingDB[bookingId].notes = document.getElementById('trackNotes').value;
    trackingDB[bookingId].estimatedCompletion = document.getElementById('trackEstTime').value;
    trackingDB[bookingId].updatedBy = document.getElementById('trackOperator').value;

    localStorage.setItem('autocare_tracking', JSON.stringify(trackingDB));
    showToast("Service tracking logs saved successfully.", "success");
}


// ==========================================================================
// 6. SERVICE RECORDS CONTROLLER (CRUD)
// ==========================================================================
function loadRecordsView() {
    const records = getDB('service_records');
    const searchVal = document.getElementById('recordSearchInput').value.toLowerCase();

    let filtered = records.filter(r => 
        r.vehicleReg.toLowerCase().includes(searchVal) ||
        r.customerName.toLowerCase().includes(searchVal) ||
        r.serviceType.toLowerCase().includes(searchVal) ||
        r.id.toLowerCase().includes(searchVal)
    );

    const pag = appState.pagination.records;
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pag.limit) || 1;
    if (pag.page > totalPages) pag.page = totalPages;
    const startIndex = (pag.page - 1) * pag.limit;
    const paginated = filtered.slice(startIndex, startIndex + pag.limit);

    const tbody = document.getElementById('recordsTableBody');
    tbody.innerHTML = '';

    if (paginated.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="empty-state-container">
            <i class="fa-solid fa-folder-open empty-state-icon"></i>
            <h4>No Service History Records Found</h4>
            <p>Provide details to archive completed customer jobs.</p>
        </td></tr>`;
    } else {
        paginated.forEach(r => {
            tbody.innerHTML += `
                <tr>
                    <td><span style="font-weight:700; color:var(--primary);">${r.id}</span></td>
                    <td><span style="font-family:monospace; background:#e2e8f0; padding:2px 6px; border-radius:4px;">${r.vehicleReg}</span></td>
                    <td style="font-weight:600;">${r.customerName}</td>
                    <td>${r.serviceDate}</td>
                    <td>${r.serviceType}</td>
                    <td>${r.mechanicName}</td>
                    <td style="font-weight:700; color:var(--success);">₹${r.totalCost.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td style="text-align: right;">
                        <div class="action-buttons-flex" style="justify-content: flex-end;">
                            <button class="btn-icon-action" onclick="openEditRecordModal('${r.id}')" title="Edit record"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn-icon-action btn-delete" onclick="triggerDeleteRecord('service_records', '${r.id}')" title="Delete record"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    renderPaginationControl('recordPagination', pag.page, totalPages, totalItems, pag.limit, (newPage) => {
        appState.pagination.records.page = newPage;
        loadRecordsView();
    });
}

document.getElementById('openAddRecordModalBtn').addEventListener('click', () => {
    document.getElementById('recordForm').reset();
    document.getElementById('recordIdHidden').value = '';
    document.getElementById('recordModalTitle').textContent = 'Add Service Record';
    
    loadServiceRecordFormDropdowns();
    
    // Clear customer fields
    document.getElementById('recCustomer').value = '';
    document.getElementById('recCustomerIdHidden').value = '';
    
    // Set default service date to today
    document.getElementById('recDate').value = new Date().toISOString().split('T')[0];
    
    openModal('recordModal');
});

function loadServiceRecordFormDropdowns() {
    const vehicles = getDB('vehicles');
    const services = getDB('services');
    const mechanics = getDB('mechanics');
    
    const recVehicle = document.getElementById('recVehicle');
    recVehicle.innerHTML = '<option value="">-- Choose Vehicle --</option>';
    vehicles.forEach(v => {
        recVehicle.innerHTML += `<option value="${v.id}">${v.brand} ${v.model} (${v.regNo})</option>`;
    });

    const recService = document.getElementById('recService');
    recService.innerHTML = '<option value="">-- Choose Service --</option>';
    services.forEach(s => {
        if (s.status === 'Active') {
            recService.innerHTML += `<option value="${s.id}">${s.name} (₹${s.basePrice})</option>`;
        }
    });

    const recMechanic = document.getElementById('recMechanic');
    recMechanic.innerHTML = '<option value="">-- Choose Mechanic --</option>';
    mechanics.forEach(m => {
        if (m.status !== 'On Leave') {
            recMechanic.innerHTML += `<option value="${m.id}">${m.name} (${m.specialization})</option>`;
        }
    });
}

function openEditRecordModal(id) {
    const records = getDB('service_records');
    const r = records.find(x => x.id === id);
    if (!r) return;

    loadServiceRecordFormDropdowns();

    document.getElementById('recordIdHidden').value = r.id;
    
    const vehicles = getDB('vehicles');
    const vObj = vehicles.find(v => v.regNo === r.vehicleReg);
    if (vObj) {
        document.getElementById('recVehicle').value = vObj.id;
        document.getElementById('recCustomer').value = r.customerName || vObj.ownerName;
        document.getElementById('recCustomerIdHidden').value = vObj.ownerId;
    }
    
    const services = getDB('services');
    const sObj = services.find(s => s.name === r.serviceType);
    if (sObj) {
        document.getElementById('recService').value = sObj.id;
    }

    const mechanics = getDB('mechanics');
    const mObj = mechanics.find(m => m.name === r.mechanicName);
    if (mObj) {
        document.getElementById('recMechanic').value = mObj.id;
    }

    document.getElementById('recDate').value = r.serviceDate;
    document.getElementById('recKm').value = r.kilometerReading || r.kmReading;
    document.getElementById('recNextDate').value = r.nextRecommendedServiceDate || r.nextServiceDate;
    document.getElementById('recLabor').value = r.laborCost;
    document.getElementById('recPartsCost').value = r.partsCost;
    document.getElementById('recPartsList').value = r.partsReplaced;
    document.getElementById('recWorkPerformed').value = r.workPerformed;

    document.getElementById('recordModalTitle').textContent = 'Modify Service History Record';
    openModal('recordModal');
}


// ==========================================================================
// 7. MECHANICS CONTROLLER
// ==========================================================================
function loadMechanicsView() {
    const mechanics = getDB('mechanics');
    const searchVal = document.getElementById('mechanicSearchInput').value.toLowerCase();
    const statusVal = document.getElementById('mechanicStatusFilter').value;

    let filtered = mechanics.filter(m => 
        m.name.toLowerCase().includes(searchVal) ||
        m.specialization.toLowerCase().includes(searchVal) ||
        m.id.toLowerCase().includes(searchVal)
    );

    if (statusVal !== 'all') {
        filtered = filtered.filter(m => m.status === statusVal);
    }

    const grid = document.getElementById('mechanicsGrid');
    grid.innerHTML = '';

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="card-panel form-group-full" style="grid-column: 1/-1;">
                <div class="empty-state-container">
                    <i class="fa-solid fa-users-slash empty-state-icon"></i>
                    <h4>No Mechanics Found</h4>
                    <p>Register new technical resources in your catalog.</p>
                </div>
            </div>
        `;
    } else {
        filtered.forEach(m => {
            let badgeClass = 'badge-success';
            if (m.status === 'Busy') badgeClass = 'badge-warning';
            if (m.status === 'On Leave') badgeClass = 'badge-danger';
            
            grid.innerHTML += `
                <div class="mechanic-card">
                    <span class="badge ${badgeClass} mechanic-card-badge">${m.status}</span>
                    <div class="mechanic-card-avatar">
                        <i class="fa-solid fa-wrench"></i>
                    </div>
                    <h4>${m.name}</h4>
                    <span class="mechanic-card-specialty">${m.specialization}</span>
                    
                    <div class="mechanic-card-stats">
                        <div class="mechanic-stat-item">
                            <span class="mechanic-stat-num">${m.experience}</span>
                            <span class="mechanic-stat-label">Experience</span>
                        </div>
                        <div class="mechanic-stat-item">
                            <span class="mechanic-stat-num">${m.assignedJobs}</span>
                            <span class="mechanic-stat-label">Active Jobs</span>
                        </div>
                    </div>

                    <div class="mechanic-card-contact">
                        <span><i class="fa-solid fa-phone" style="width:20px;"></i> ${m.phone}</span>
                        <span><i class="fa-solid fa-envelope" style="width:20px;"></i> ${m.email}</span>
                    </div>

                    <div class="mechanic-card-actions">
                        <button class="btn-secondary" style="flex:1; padding:8px;" onclick="openEditMechanicModal('${m.id}')">Edit</button>
                        <button class="btn-danger-action" style="padding:8px;" onclick="triggerDeleteRecord('mechanics', '${m.id}')"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
            `;
        });
    }
}

document.getElementById('openAddMechanicModalBtn').addEventListener('click', () => {
    document.getElementById('mechanicForm').reset();
    document.getElementById('mechanicIdHidden').value = '';
    document.getElementById('mechanicModalTitle').textContent = 'Add Mechanic';
    openModal('mechanicModal');
});

function openEditMechanicModal(id) {
    const mechanics = getDB('mechanics');
    const m = mechanics.find(x => x.id === id);
    if (!m) return;

    document.getElementById('mechanicIdHidden').value = m.id;
    document.getElementById('mecName').value = m.name;
    document.getElementById('mecPhone').value = m.phone;
    document.getElementById('mecEmail').value = m.email;
    document.getElementById('mecSpecialty').value = m.specialization;
    document.getElementById('mecExperience').value = m.experience;
    document.getElementById('mecStatus').value = m.status;

    document.getElementById('mechanicModalTitle').textContent = 'Modify Mechanic Profile';
    openModal('mechanicModal');
}


// ==========================================================================
// 8. SERVICES CATALOG CONTROLLER
// ==========================================================================
function loadServicesView() {
    const services = getDB('services');
    const tbody = document.getElementById('servicesCatalogTableBody');
    tbody.innerHTML = '';

    services.forEach(s => {
        tbody.innerHTML += `
            <tr>
                <td><strong style="color:var(--primary);">${s.id}</strong></td>
                <td style="font-weight:600;">${s.name}</td>
                <td style="font-size:12.5px; max-width:300px; color:var(--text-muted);">${s.description}</td>
                <td>${s.duration}</td>
                <td style="font-weight:700;">₹${s.basePrice.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td><span class="badge ${s.status === 'Active' ? 'badge-success' : 'badge-danger'}">${s.status}</span></td>
                <td style="text-align: right;">
                    <div class="action-buttons-flex" style="justify-content: flex-end;">
                        <button class="btn-icon-action" onclick="openEditServiceModal('${s.id}')" title="Edit service"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-icon-action btn-delete" onclick="triggerDeleteRecord('services', '${s.id}')" title="Delete service"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });
}

document.getElementById('openAddServiceModalBtn').addEventListener('click', () => {
    document.getElementById('serviceForm').reset();
    document.getElementById('serviceIdHidden').value = '';
    document.getElementById('serviceModalTitle').textContent = 'Add Service Type';
    openModal('serviceModal');
});

function openEditServiceModal(id) {
    const services = getDB('services');
    const s = services.find(x => x.id === id);
    if (!s) return;

    document.getElementById('serviceIdHidden').value = s.id;
    document.getElementById('srvName').value = s.name;
    document.getElementById('srvDuration').value = s.duration;
    document.getElementById('srvPrice').value = s.basePrice;
    document.getElementById('srvDescription').value = s.description;

    document.getElementById('serviceModalTitle').textContent = 'Modify Service Operation Details';
    openModal('serviceModal');
}


// ==========================================================================
// 9. INVENTORY MODULE (CRUD)
// ==========================================================================
function loadInventoryView() {
    const inventory = getDB('inventory');
    const searchVal = document.getElementById('inventorySearchInput').value.toLowerCase();
    const categoryVal = document.getElementById('inventoryCategoryFilter').value;

    let filtered = inventory.filter(p => 
        p.name.toLowerCase().includes(searchVal) ||
        p.supplier.toLowerCase().includes(searchVal) ||
        p.id.toLowerCase().includes(searchVal)
    );

    if (categoryVal !== 'all') {
        filtered = filtered.filter(p => p.category === categoryVal);
    }

    const pag = appState.pagination.inventory;
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pag.limit) || 1;
    if (pag.page > totalPages) pag.page = totalPages;
    const startIndex = (pag.page - 1) * pag.limit;
    const paginated = filtered.slice(startIndex, startIndex + pag.limit);

    const tbody = document.getElementById('inventoryTableBody');
    tbody.innerHTML = '';

    if (paginated.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="empty-state-container">
            <i class="fa-solid fa-boxes-packing empty-state-icon"></i>
            <h4>No Parts Matching Criteria</h4>
            <p>Review search terms or log a new spare part item.</p>
        </td></tr>`;
    } else {
        paginated.forEach(p => {
            const isLowStock = p.quantity <= p.minStock;
            tbody.innerHTML += `
                <tr>
                    <td><strong style="color:var(--primary);">${p.id}</strong></td>
                    <td style="font-weight:600;">${p.name}</td>
                    <td>${p.category}</td>
                    <td>${p.supplier}</td>
                    <td style="font-weight:700; text-align:center;">${p.quantity}</td>
                    <td style="text-align:center; color:var(--text-muted);">${p.minStock}</td>
                    <td style="font-weight:600;">₹${p.price.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td>
                        <span class="badge ${isLowStock ? 'badge-danger' : 'badge-success'}">
                            ${isLowStock ? 'LOW STOCK' : 'IN STOCK'}
                        </span>
                    </td>
                    <td style="text-align: right;">
                        <div class="action-buttons-flex" style="justify-content: flex-end;">
                            <button class="btn-icon-action" onclick="openEditPartModal('${p.id}')" title="Edit part"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn-icon-action btn-delete" onclick="triggerDeleteRecord('inventory', '${p.id}')" title="Delete part"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    renderPaginationControl('inventoryPagination', pag.page, totalPages, totalItems, pag.limit, (newPage) => {
        appState.pagination.inventory.page = newPage;
        loadInventoryView();
    });
}

document.getElementById('openAddPartModalBtn').addEventListener('click', () => {
    document.getElementById('partForm').reset();
    document.getElementById('partIdHidden').value = '';
    document.getElementById('partModalTitle').textContent = 'Add Spare Part';
    openModal('partModal');
});

function openEditPartModal(id) {
    const inventory = getDB('inventory');
    const p = inventory.find(x => x.id === id);
    if (!p) return;

    document.getElementById('partIdHidden').value = p.id;
    document.getElementById('prtName').value = p.name;
    document.getElementById('prtCategory').value = p.category;
    document.getElementById('prtSupplier').value = p.supplier;
    document.getElementById('prtQuantity').value = p.quantity;
    document.getElementById('prtMinStock').value = p.minStock;
    document.getElementById('prtPrice').value = p.price;

    document.getElementById('partModalTitle').textContent = 'Modify Spare Part Inventory';
    openModal('partModal');
}


// ==========================================================================
// 10. BILLING & INVOICES CONTROLLER (CRUD)
// ==========================================================================
function loadBillingView() {
    const invoices = getDB('invoices');
    const searchVal = document.getElementById('invoiceSearchInput').value.toLowerCase();
    const statusVal = document.getElementById('invoiceStatusFilter').value;

    let filtered = invoices.filter(inv => 
        inv.customerName.toLowerCase().includes(searchVal) ||
        inv.vehicleReg.toLowerCase().includes(searchVal) ||
        inv.id.toLowerCase().includes(searchVal)
    );

    if (statusVal !== 'all') {
        filtered = filtered.filter(inv => inv.status === statusVal);
    }

    const pag = appState.pagination.billing;
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pag.limit) || 1;
    if (pag.page > totalPages) pag.page = totalPages;
    const startIndex = (pag.page - 1) * pag.limit;
    const paginated = filtered.slice(startIndex, startIndex + pag.limit);

    const tbody = document.getElementById('invoicesTableBody');
    tbody.innerHTML = '';

    if (paginated.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="empty-state-container">
            <i class="fa-solid fa-receipt empty-state-icon"></i>
            <h4>No Invoices Logged</h4>
            <p>Review payment parameters or generate a new client invoice.</p>
        </td></tr>`;
    } else {
        paginated.forEach(inv => {
            let badgeClass = 'badge-success';
            if (inv.status === 'Pending') badgeClass = 'badge-warning';
            if (inv.status === 'Partially Paid') badgeClass = 'badge-info';

            tbody.innerHTML += `
                <tr>
                    <td><a href="#/invoice-details?invoiceId=${inv.id}" style="font-weight:700; color:var(--primary);">${inv.id}</a></td>
                    <td style="font-weight:600;">${inv.customerName}</td>
                    <td><span style="font-family:monospace; background:#e2e8f0; padding:2px 6px; border-radius:4px;">${inv.vehicleReg}</span></td>
                    <td>${inv.date}</td>
                    <td style="font-weight:700;">₹${inv.total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td>${inv.method}</td>
                    <td><span class="badge ${badgeClass}">${inv.status}</span></td>
                    <td style="text-align: right;">
                        <div class="action-buttons-flex" style="justify-content: flex-end;">
                            <a href="#/invoice-details?invoiceId=${inv.id}" class="btn-icon-action" title="Print/View invoice"><i class="fa-solid fa-eye"></i></a>
                            <button class="btn-icon-action" onclick="openEditInvoiceModal('${inv.id}')" title="Edit invoice"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn-icon-action btn-delete" onclick="triggerDeleteRecord('invoices', '${inv.id}')" title="Delete invoice"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    renderPaginationControl('invoicePagination', pag.page, totalPages, totalItems, pag.limit, (newPage) => {
        appState.pagination.billing.page = newPage;
        loadBillingView();
    });
}

document.getElementById('openAddInvoiceModalBtn').addEventListener('click', () => {
    document.getElementById('invoiceForm').reset();
    document.getElementById('invoiceIdHidden').value = '';
    document.getElementById('invoiceModalTitle').textContent = 'Generate Tax Invoice';
    
    loadCompletedBookingsDropdown();
    
    // Set default invoice date to today
    document.getElementById('invDate').value = new Date().toISOString().split('T')[0];

    openModal('invoiceModal');
});

function loadCompletedBookingsDropdown() {
    const bookings = getDB('bookings');
    const select = document.getElementById('invBooking');
    select.innerHTML = '<option value="">-- Choose Completed Service Booking --</option>';
    
    bookings.forEach(b => {
        select.innerHTML += `<option value="${b.id}">${b.id} - ${b.customerName} (${b.vehicleReg} | Est. ₹${b.cost})</option>`;
    });
}

function openEditInvoiceModal(id) {
    const invoices = getDB('invoices');
    const inv = invoices.find(x => x.id === id);
    if (!inv) return;

    loadCompletedBookingsDropdown();

    document.getElementById('invoiceIdHidden').value = inv.id;
    document.getElementById('invBooking').value = inv.bookingId || '';
    document.getElementById('invDate').value = inv.date;
    document.getElementById('invServiceCharges').value = inv.serviceCharges;
    document.getElementById('invPartsCharges').value = inv.partsCharges;
    document.getElementById('invLaborCharges').value = inv.laborCharges;
    document.getElementById('invDiscount').value = inv.discount;
    document.getElementById('invMethod').value = inv.method;
    document.getElementById('invStatus').value = inv.status;

    document.getElementById('invoiceModalTitle').textContent = 'Modify Invoice Parameters';
    openModal('invoiceModal');
}


// ==========================================================================
// 11. REPORTS AND ANALYTICS CONTROLLER
// ==========================================================================
function loadReportsView() {
    const customers = getDB('customers');
    const vehicles = getDB('vehicles');
    const bookings = getDB('bookings');
    const invoices = getDB('invoices');
    const mechanics = getDB('mechanics');
    const inventory = getDB('inventory');

    const totalCustomers = customers.length;
    const totalVehicles = vehicles.length;
    const activeJobs = bookings.filter(b => b.status !== 'Completed' && b.status !== 'Cancelled').length;
    const completedCount = bookings.filter(b => b.status === 'Completed').length;
    const completionRate = bookings.length > 0 ? ((completedCount / bookings.length) * 100).toFixed(1) : 0;
    
    // Revenue calculations
    const paidInvoices = invoices.filter(i => i.status === 'Paid');
    const revenueSum = paidInvoices.reduce((sum, item) => sum + item.total, 0);

    const pendingInvoices = invoices.filter(i => i.status !== 'Paid');
    const outstandingSum = pendingInvoices.reduce((sum, item) => sum + item.total, 0);

    const reportsStatsGrid = document.getElementById('reportsStatsGrid');
    reportsStatsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-card-left">
                <span class="stat-card-title">Accumulated Revenue</span>
                <span class="stat-card-value">₹${revenueSum.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
            </div>
            <div class="stat-card-icon success">
                <i class="fa-solid fa-circle-dollar-to-slot"></i>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-card-left">
                <span class="stat-card-title">Outstanding Payments</span>
                <span class="stat-card-value">₹${outstandingSum.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
            </div>
            <div class="stat-card-icon danger">
                <i class="fa-solid fa-sack-xmark"></i>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-card-left">
                <span class="stat-card-title">Service Completion Rate</span>
                <span class="stat-card-value">${completionRate}%</span>
            </div>
            <div class="stat-card-icon info">
                <i class="fa-solid fa-chart-line"></i>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-card-left">
                <span class="stat-card-title">Pending Job Queue</span>
                <span class="stat-card-value">${activeJobs}</span>
            </div>
            <div class="stat-card-icon warning">
                <i class="fa-solid fa-truck-ramp-box"></i>
            </div>
        </div>
    `;

    renderReportsCharts(bookings, invoices, mechanics);
}

function renderReportsCharts(bookings, invoices, mechanics) {
    if (appState.charts.repRevenue) appState.charts.repRevenue.destroy();
    if (appState.charts.repStatus) appState.charts.repStatus.destroy();
    if (appState.charts.repPopular) appState.charts.repPopular.destroy();
    if (appState.charts.repMechanics) appState.charts.repMechanics.destroy();

    // 1. Line Chart: Monthly Revenue
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
        let m = currentMonth - i;
        if (m < 0) m += 12;
        last6Months.push(months[m]);
    }
    const monthlySumValues = last6Months.map((mName, index) => {
        let testMonthIdx = months.indexOf(mName);
        let yearFilter = new Date().getFullYear();
        if (testMonthIdx > currentMonth) yearFilter -= 1;
        const matchedInvoices = invoices.filter(inv => {
            const d = new Date(inv.date);
            return d.getMonth() === testMonthIdx && d.getFullYear() === yearFilter && inv.status === 'Paid';
        });
        return matchedInvoices.reduce((sum, x) => sum + x.total, 0);
    });

    const revCtx = document.getElementById('chartReportsRevenue').getContext('2d');
    appState.charts.repRevenue = new Chart(revCtx, {
        type: 'line',
        data: {
            labels: last6Months,
            datasets: [{
                label: 'Revenue Sum (₹)',
                data: monthlySumValues,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // 2. Doughnut Chart: Booking Statuses Distribution
    const statusCounts = {};
    bookings.forEach(b => {
        statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
    });
    const statusLabels = Object.keys(statusCounts);
    const statusValues = Object.values(statusCounts);

    const statusCtx = document.getElementById('chartReportsStatus').getContext('2d');
    appState.charts.repStatus = new Chart(statusCtx, {
        type: 'doughnut',
        data: {
            labels: statusLabels.length > 0 ? statusLabels : ['No Bookings'],
            datasets: [{
                data: statusValues.length > 0 ? statusValues : [1],
                backgroundColor: ['#64748b', '#06b6d4', '#8b5cf6', '#2563eb', '#f59e0b', '#10b981', '#15803d', '#ef4444'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12 } } }
        }
    });

    // 3. Bar Chart: Popular Services
    const serviceCounts = {};
    bookings.forEach(b => {
        serviceCounts[b.serviceType] = (serviceCounts[b.serviceType] || 0) + 1;
    });
    const popularCtx = document.getElementById('chartReportsPopular').getContext('2d');
    appState.charts.repPopular = new Chart(popularCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(serviceCounts).length > 0 ? Object.keys(serviceCounts) : ['General', 'Oil Change', 'AC'],
            datasets: [{
                label: 'Bookings Count',
                data: Object.values(serviceCounts).length > 0 ? Object.values(serviceCounts) : [5, 3, 2],
                backgroundColor: 'rgba(37, 99, 235, 0.85)',
                borderColor: '#2563eb',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });

    // 4. Doughnut Chart: Mechanics Assigned Jobs
    const mechanicNames = mechanics.map(m => m.name);
    const mechanicJobs = mechanics.map(m => m.assignedJobs);
    
    const mecCtx = document.getElementById('chartReportsMechanics').getContext('2d');
    appState.charts.repMechanics = new Chart(mecCtx, {
        type: 'doughnut',
        data: {
            labels: mechanicNames,
            datasets: [{
                data: mechanicJobs,
                backgroundColor: ['#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ef4444'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12 } } }
        }
    });
}


// ==========================================================================
// 12. CENTRAL NOTIFICATIONS VIEW & UTILITIES
// ==========================================================================
function updateNotificationsUI() {
    const notifications = getDB('notifications');
    const unread = notifications.filter(n => !n.read);
    
    // Header Bell Counter
    const badge = document.getElementById('notificationBadgeCount');
    badge.textContent = unread.length;
    badge.style.display = unread.length > 0 ? 'flex' : 'none';

    // Dropdown list population
    const dropdownList = document.getElementById('notificationDropdownList');
    dropdownList.innerHTML = '';
    
    if (notifications.length === 0) {
        dropdownList.innerHTML = `<li class="notification-item" style="text-align:center; padding:20px; color:var(--text-muted);">No system notifications logged.</li>`;
    } else {
        notifications.slice(0, 4).forEach(n => {
            dropdownList.innerHTML += `
                <li class="notification-item ${n.read ? '' : 'unread'}" onclick="markNotificationRead('${n.id}')">
                    <span class="notification-text">${n.text}</span>
                    <span class="notification-time">${n.date}</span>
                </li>
            `;
        });
    }
}

function loadNotificationsView() {
    const notifications = getDB('notifications');
    const list = document.getElementById('pageNotificationsList');
    list.innerHTML = '';

    if (notifications.length === 0) {
        list.innerHTML = `
            <div class="empty-state-container" style="padding:40px;">
                <i class="fa-solid fa-bell-slash empty-state-icon"></i>
                <h4>No notifications found</h4>
                <p>All clean. System warnings and alerts will render here.</p>
            </div>
        `;
    } else {
        notifications.forEach(n => {
            let warningClass = '';
            if (n.type === 'low-stock') warningClass = 'style="border-left: 4px solid var(--danger);"';
            if (n.type === 'booking') warningClass = 'style="border-left: 4px solid var(--primary);"';
            
            list.innerHTML += `
                <li class="notification-item" ${warningClass} style="cursor:default; border-bottom:1px solid var(--border-color); display:flex; flex-direction:row; align-items:center; justify-content:space-between; gap:16px;">
                    <div>
                        <span class="notification-text" style="font-weight:${n.read ? 'normal' : 'bold'}; font-size:14px;">${n.text}</span>
                        <span class="notification-time" style="display:block; margin-top:4px;">${n.date}</span>
                    </div>
                    <div>
                        ${n.read ? '' : `<button class="btn-secondary" style="padding:6px 12px; font-size:12px;" onclick="markNotificationRead('${n.id}', true)">Mark as Read</button>`}
                    </div>
                </li>
            `;
        });
    }
}

function addNotification(text, type = 'general') {
    const notifications = getDB('notifications');
    const timestamp = new Date().toLocaleString();
    const newNtf = {
        id: 'NTF' + Date.now(),
        text: text,
        date: timestamp,
        read: false,
        type: type
    };
    notifications.unshift(newNtf);
    saveDB('notifications', notifications);
    updateNotificationsUI();
    
    // Render central page notifications if page is open
    if (appState.activePage === 'notifications') {
        loadNotificationsView();
    }
}

function markNotificationRead(id, refreshPage = false) {
    const notifications = getDB('notifications');
    const idx = notifications.findIndex(n => n.id === id);
    if (idx !== -1) {
        notifications[idx].read = true;
        saveDB('notifications', notifications);
        updateNotificationsUI();
        if (refreshPage || appState.activePage === 'notifications') {
            loadNotificationsView();
        }
    }
}

document.getElementById('markAllReadBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    const notifications = getDB('notifications');
    notifications.forEach(n => n.read = true);
    saveDB('notifications', notifications);
    updateNotificationsUI();
    showToast("All notifications marked as read.", 'success');
});

document.getElementById('pageClearNotificationsBtn').addEventListener('click', () => {
    let notifications = getDB('notifications');
    notifications = notifications.filter(n => !n.read);
    saveDB('notifications', notifications);
    updateNotificationsUI();
    loadNotificationsView();
    showToast("Cleared all read notifications.", 'success');
});


// ==========================================================================
// 13. SYSTEM SETTINGS CONTROLLER
// ==========================================================================
function loadSettingsView() {
    const settings = getSettings();
    document.getElementById('setCenterName').value = settings.serviceCenterName || "";
    document.getElementById('setCenterEmail').value = settings.email || "";
    document.getElementById('setCenterPhone').value = settings.phone || "";
    document.getElementById('setTaxPercentage').value = settings.taxPercentage || 15.0;
    document.getElementById('setCurrency').value = settings.currency || "INR";
    document.getElementById('setWorkingHours').value = settings.workingHours || "";
    document.getElementById('setCenterAddress').value = settings.address || "";
}


// ==========================================================================
// 14. ADMIN PROFILE CONTROLLER
// ==========================================================================
function loadProfileView() {
    const profile = getProfile();
    
    document.getElementById('profileCardName').textContent = profile.name || "Alex Mercer";
    document.getElementById('profileCardRole').textContent = profile.role || "Manager";
    document.getElementById('profileCardImg').src = profile.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80";

    document.getElementById('profileNameInput').value = profile.name || "";
    document.getElementById('profileEmailInput').value = profile.email || "";
    document.getElementById('profilePhoneInput').value = profile.phone || "";
    document.getElementById('profileRoleInput').value = profile.role || "Administrator";
    
    // Clear password forms
    document.getElementById('changePasswordForm').reset();
}


// ==========================================================================
// 15. DETAILS SUBVIEWS (Customer / Vehicle / Invoice Details)
// ==========================================================================
function loadCustomerDetailsView() {
    const id = getQueryParam('id');
    const customers = getDB('customers');
    const vehicles = getDB('vehicles');
    
    const c = customers.find(x => x.id === id);
    const infoCard = document.getElementById('customerDetailsInfoCard');
    const vehiclesTable = document.getElementById('customerDetailsVehiclesTable');

    if (!c) {
        infoCard.innerHTML = `<p class="empty-state-container">Customer details not found.</p>`;
        vehiclesTable.innerHTML = '';
        return;
    }

    document.getElementById('customerDetailsName').textContent = c.name;

    infoCard.innerHTML = `
        <div class="info-row-item">
            <span class="info-row-label">Customer ID</span>
            <span class="info-row-value" style="font-weight:700; color:var(--primary);">${c.id}</span>
        </div>
        <div class="info-row-item">
            <span class="info-row-label">Full Name</span>
            <span class="info-row-value" style="font-weight:600;">${c.name}</span>
        </div>
        <div class="info-row-item">
            <span class="info-row-label">Phone Number</span>
            <span class="info-row-value">${c.phone}</span>
        </div>
        <div class="info-row-item">
            <span class="info-row-label">Email Address</span>
            <span class="info-row-value">${c.email}</span>
        </div>
        <div class="info-row-item">
            <span class="info-row-label">Physical Address</span>
            <span class="info-row-value">${c.address}</span>
        </div>
        <div class="info-row-item">
            <span class="info-row-label">Registered Date</span>
            <span class="info-row-value">${c.registrationDate}</span>
        </div>
    `;

    // Filter vehicles belonging to this customer
    const fleet = vehicles.filter(v => v.ownerId === id);
    vehiclesTable.innerHTML = '';
    
    if (fleet.length === 0) {
        vehiclesTable.innerHTML = `<tr><td colspan="5" class="empty-state-container" style="padding:20px;">No vehicles registered for this customer.</td></tr>`;
    } else {
        fleet.forEach(v => {
            vehiclesTable.innerHTML += `
                <tr>
                    <td><span style="font-family:monospace; background:#e2e8f0; padding:2px 6px; border-radius:4px; font-weight:700;">${v.regNo}</span></td>
                    <td><strong>${v.brand} ${v.model}</strong></td>
                    <td>${v.year}</td>
                    <td><span class="badge badge-info">${v.fuel}</span></td>
                    <td>${v.lastServiceDate || 'Not serviced'}</td>
                </tr>
            `;
        });
    }
}

function loadVehicleDetailsView() {
    const id = getQueryParam('id');
    const vehicles = getDB('vehicles');
    const records = getDB('service_records');

    const v = vehicles.find(x => x.id === id);
    const infoCard = document.getElementById('vehicleDetailsInfoCard');
    const historyTable = document.getElementById('vehicleDetailsHistoryTable');

    if (!v) {
        infoCard.innerHTML = `<p class="empty-state-container">Vehicle record parameters not found.</p>`;
        historyTable.innerHTML = '';
        return;
    }

    document.getElementById('vehicleDetailsTitle').textContent = `${v.brand} ${v.model} (${v.regNo})`;

    infoCard.innerHTML = `
        <div class="info-row-item">
            <span class="info-row-label">Vehicle ID</span>
            <span class="info-row-value" style="font-weight:700; color:var(--primary);">${v.id}</span>
        </div>
        <div class="info-row-item">
            <span class="info-row-label">Owner / Client</span>
            <span class="info-row-value">${v.ownerName}</span>
        </div>
        <div class="info-row-item">
            <span class="info-row-label">Registration Plate</span>
            <span class="info-row-value" style="font-family:monospace; font-weight:700;">${v.regNo}</span>
        </div>
        <div class="info-row-item">
            <span class="info-row-label">Brand & Model</span>
            <span class="info-row-value">${v.brand} ${v.model} (${v.year})</span>
        </div>
        <div class="info-row-item">
            <span class="info-row-label">Mechanical Parameters</span>
            <span class="info-row-value">${v.transmission} | ${v.fuel} | ${v.color}</span>
        </div>
        <div class="info-row-item">
            <span class="info-row-label">Kilometer Reading</span>
            <span class="info-row-value">${v.kmReading} KM</span>
        </div>
        <div class="info-row-item">
            <span class="info-row-label">Last Service Date</span>
            <span class="info-row-value">${v.lastServiceDate || 'Not Serviced'}</span>
        </div>
        <div class="info-row-item">
            <span class="info-row-label">Next Service Date</span>
            <span class="info-row-value">${v.nextServiceDate || 'Not Serviced'}</span>
        </div>
    `;

    // Filter service records matching this vehicle's registration number
    const vehicleRecords = records.filter(r => r.vehicleReg === v.regNo);
    historyTable.innerHTML = '';

    if (vehicleRecords.length === 0) {
        historyTable.innerHTML = `<tr><td colspan="5" class="empty-state-container" style="padding:20px;">No completed service records found.</td></tr>`;
    } else {
        vehicleRecords.forEach(r => {
            historyTable.innerHTML += `
                <tr>
                    <td><strong style="color:var(--primary);">${r.id}</strong></td>
                    <td>${r.serviceDate}</td>
                    <td>${r.serviceType}</td>
                    <td style="font-size:12.5px; color:var(--text-muted); max-width:200px;">${r.partsReplaced}</td>
                    <td style="font-weight:700; color:var(--success);">₹${r.totalCost.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>
            `;
        });
    }
}

function loadInvoiceDetailsView() {
    const invoiceId = getQueryParam('invoiceId');
    const invoices = getDB('invoices');
    const inv = invoices.find(x => x.id === invoiceId);
    const printArea = document.getElementById('invoice-print-section');
    const settings = getSettings();

    if (!inv) {
        printArea.innerHTML = `<p class="empty-state-container">Invoice details not found.</p>`;
        return;
    }

    const calculatedTax = inv.tax;

    printArea.innerHTML = `
        <div class="invoice-print-header">
            <div>
                <div class="invoice-brand-logo">
                    <i class="fa-solid fa-gears"></i> ${settings.serviceCenterName || "AutoCare Pro"}
                </div>
                <div class="invoice-center-meta">
                    <p>${settings.address || "100 Performance Drive, Suite A, Motor City"}</p>
                    <p>Phone: ${settings.phone || "+1 (555) 019-2834"} | Email: ${settings.email || "info@autocarepro.com"}</p>
                </div>
            </div>
            <div class="invoice-title-meta">
                <h2>Tax Invoice</h2>
                <p>Invoice ID: <span class="invoice-id-span">${inv.id}</span></p>
                <p style="font-size:13px; color:var(--text-muted); margin-top:4px;">Date: ${inv.date}</p>
            </div>
        </div>

        <div class="invoice-bill-parties-grid">
            <div class="invoice-party-details">
                <h4>Billed To</h4>
                <strong style="font-size:14.5px; display:block; margin-bottom:4px;">${inv.customerName}</strong>
                <p style="color:var(--text-muted);">Vehicle Reg: <span style="font-family:monospace; font-weight:700; color:var(--text-main);">${inv.vehicleReg}</span></p>
            </div>
            <div class="invoice-party-details" style="text-align: right;">
                <h4>Payment Details</h4>
                <p>Status: <span class="badge ${inv.status === 'Paid' ? 'badge-success' : 'badge-warning'}" style="font-size:11px;">${inv.status}</span></p>
                <p style="margin-top:4px;">Payment Method: <strong>${inv.method}</strong></p>
            </div>
        </div>

        <table class="invoice-items-table">
            <thead>
                <tr>
                    <th style="text-align: left;">Item Description</th>
                    <th style="text-align: right;">Amount Cost</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Service Operation Base Charges</td>
                    <td style="text-align: right;">₹${inv.serviceCharges.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>
                <tr>
                    <td>Spare Parts Installed</td>
                    <td style="text-align: right;">₹${inv.partsCharges.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>
                <tr>
                    <td>Additional Bay Labor Costs</td>
                    <td style="text-align: right;">₹${inv.laborCharges.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>
            </tbody>
        </table>

        <div class="invoice-totals-wrapper">
            <table class="invoice-totals-table">
                <tr>
                    <td>Subtotal:</td>
                    <td style="text-align: right;">₹${(inv.serviceCharges + inv.partsCharges + inv.laborCharges).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>
                <tr>
                    <td>Discount applied:</td>
                    <td style="text-align: right; color:var(--danger);">- ₹${inv.discount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>
                <tr>
                    <td>VAT / Tax (${settings.taxPercentage || 15.0}%):</td>
                    <td style="text-align: right;">₹${calculatedTax.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>
                <tr class="grand-total-row">
                    <td>Grand Total:</td>
                    <td style="text-align: right;">₹${inv.total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>
            </table>
        </div>

        <div class="invoice-footer-message">
            <p>Thank you for choosing ${settings.serviceCenterName || "AutoCare Pro"} for your automotive repair needs.</p>
            <p style="margin-top:6px; font-size:11px;">Working Hours: ${settings.workingHours || "Mon - Sat: 8:00 AM - 6:00 PM"}</p>
        </div>
    `;
}


// ==========================================================================
// 16. CENTRAL SEARCH ENGINE
// ==========================================================================
function setupGlobalSearch() {
    const input = document.getElementById('globalSearchInput');
    const dropdown = document.getElementById('globalSearchResults');

    input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
            dropdown.style.display = 'none';
            return;
        }

        // Search collections
        const customers = getDB('customers');
        const vehicles = getDB('vehicles');
        const invoices = getDB('invoices');
        const mechanics = getDB('mechanics');

        const custMatches = customers.filter(c => c.name.toLowerCase().includes(query) || c.phone.includes(query)).slice(0, 3);
        const vehMatches = vehicles.filter(v => v.regNo.toLowerCase().includes(query) || v.brand.toLowerCase().includes(query)).slice(0, 3);
        const invMatches = invoices.filter(inv => inv.id.toLowerCase().includes(query) || inv.customerName.toLowerCase().includes(query)).slice(0, 3);
        const mecMatches = mechanics.filter(m => m.name.toLowerCase().includes(query) || m.specialization.toLowerCase().includes(query)).slice(0, 3);

        dropdown.innerHTML = '';
        let totalMatches = 0;

        if (custMatches.length > 0) {
            dropdown.innerHTML += `<div class="search-result-section-title">Customers</div>`;
            custMatches.forEach(c => {
                dropdown.innerHTML += `
                    <div class="search-result-item" onclick="window.location.hash='#/customer-details?id=${c.id}'">
                        <span class="search-result-item-title">${c.name}</span>
                        <span class="search-result-item-meta">Phone: ${c.phone} | ID: ${c.id}</span>
                    </div>
                `;
                totalMatches++;
            });
        }

        if (vehMatches.length > 0) {
            dropdown.innerHTML += `<div class="search-result-section-title">Vehicles</div>`;
            vehMatches.forEach(v => {
                dropdown.innerHTML += `
                    <div class="search-result-item" onclick="window.location.hash='#/vehicle-details?id=${v.id}'">
                        <span class="search-result-item-title">${v.brand} ${v.model}</span>
                        <span class="search-result-item-meta">Reg: ${v.regNo} | Owner: ${v.ownerName}</span>
                    </div>
                `;
                totalMatches++;
            });
        }

        if (invMatches.length > 0) {
            dropdown.innerHTML += `<div class="search-result-section-title">Billing Invoices</div>`;
            invMatches.forEach(inv => {
                dropdown.innerHTML += `
                    <div class="search-result-item" onclick="window.location.hash='#/invoice-details?invoiceId=${inv.id}'">
                        <span class="search-result-item-title">Invoice ${inv.id}</span>
                        <span class="search-result-item-meta">Client: ${inv.customerName} | Total: ₹${inv.total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                `;
                totalMatches++;
            });
        }

        if (mecMatches.length > 0) {
            dropdown.innerHTML += `<div class="search-result-section-title">Mechanics</div>`;
            mecMatches.forEach(m => {
                dropdown.innerHTML += `
                    <div class="search-result-item" onclick="window.location.hash='#/mechanics'">
                        <span class="search-result-item-title">${m.name}</span>
                        <span class="search-result-item-meta">Specialization: ${m.specialization} | Status: ${m.status}</span>
                    </div>
                `;
                totalMatches++;
            });
        }

        if (totalMatches === 0) {
            dropdown.innerHTML = `<div style="padding:16px; font-size:13px; color:var(--text-muted); text-align:center;">No results match "${query}".</div>`;
        }

        dropdown.style.display = 'block';
    });

    // Stop propagation so search overlay doesn't close prematurely
    dropdown.addEventListener('click', (e) => e.stopPropagation());
    input.addEventListener('click', (e) => e.stopPropagation());
}


// ==========================================================================
// 17. CENTRAL DELETE DIALOG HANDLING
// ==========================================================================
function triggerDeleteRecord(module, id) {
    appState.deleteTarget = { module, id };
    openModal('confirmDeleteModal');
}

document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
    const { module, id } = appState.deleteTarget;
    if (!module || !id) return;

    let db = getDB(module);
    const beforeLength = db.length;
    db = db.filter(x => x.id !== id);
    
    if (db.length < beforeLength) {
        saveDB(module, db);
        showToast("Record deleted successfully.", 'success');
        
        // If a vehicle is deleted, recalculate owner's fleet count
        if (module === 'vehicles') {
            recalculateCustomerVehiclesCount();
        }

        // Refresh appropriate view
        if (appState.activePage === 'customers' && module === 'customers') loadCustomersView();
        if (appState.activePage === 'vehicles' && module === 'vehicles') loadVehiclesView();
        if (appState.activePage === 'bookings' && module === 'bookings') loadBookingsView();
        if (appState.activePage === 'records' && module === 'service_records') loadRecordsView();
        if (appState.activePage === 'mechanics' && module === 'mechanics') loadMechanicsView();
        if (appState.activePage === 'services' && module === 'services') loadServicesView();
        if (appState.activePage === 'inventory' && module === 'inventory') loadInventoryView();
        if (appState.activePage === 'billing' && module === 'invoices') loadBillingView();
    } else {
        showToast("Error deleting record parameters.", 'danger');
    }

    closeModal('confirmDeleteModal');
});


// ==========================================================================
// 18. PAGINATION UTILITY
// ==========================================================================
function renderPaginationControl(elementId, currentPage, totalPages, totalItems, limit, onPageChange) {
    const container = document.getElementById(elementId);
    if (!container) return;

    const startItem = totalItems > 0 ? (currentPage - 1) * limit + 1 : 0;
    let endItem = currentPage * limit;
    if (endItem > totalItems) endItem = totalItems;

    container.innerHTML = `
        <div class="pagination-info">
            Showing <strong>${startItem} - ${endItem}</strong> of <strong>${totalItems}</strong> entries
        </div>
        <div class="pagination-buttons">
            <button class="btn-pagination" ${currentPage === 1 ? 'disabled' : ''} id="${elementId}-prev">Previous</button>
            <button class="btn-pagination" ${currentPage === totalPages ? 'disabled' : ''} id="${elementId}-next">Next</button>
        </div>
    `;

    const prevBtn = document.getElementById(`${elementId}-prev`);
    const nextBtn = document.getElementById(`${elementId}-next`);

    if (prevBtn) {
        prevBtn.onclick = () => onPageChange(currentPage - 1);
    }
    if (nextBtn) {
        nextBtn.onclick = () => onPageChange(currentPage + 1);
    }
}


// ==========================================================================
// 19. FORM VALIDATORS & SAVE LISTENERS
// ==========================================================================
function setupFormListeners() {
    // ==========================================
    // SINGLE EVENT LISTENERS FOR MODAL LOGIC
    // ==========================================

    // 0. Profile avatar upload handler
    const avatarInput = document.getElementById('profileAvatarUploadInput');
    if (avatarInput) {
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const base64Data = evt.target.result;
                    const profile = getProfile();
                    profile.avatar = base64Data;
                    localStorage.setItem('autocare_profile', JSON.stringify(profile));
                    
                    document.getElementById('profileCardImg').src = base64Data;
                    document.getElementById('headerProfileImg').src = base64Data;
                    
                    showToast("Profile avatar updated successfully.", "success");
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 1. Booking Customer Change event listener
    document.getElementById('bkgCustomer').addEventListener('change', (e) => {
        loadCustomerVehiclesDropdown(e.target.value, 'bkgVehicle');
    });

    // 2. Service Record Vehicle Change event listener
    document.getElementById('recVehicle').addEventListener('change', (e) => {
        const vehicles = getDB('vehicles');
        const vObj = vehicles.find(v => v.id === e.target.value);
        const recCustomer = document.getElementById('recCustomer');
        const recCustomerIdHidden = document.getElementById('recCustomerIdHidden');
        if (vObj) {
            recCustomer.value = vObj.ownerName;
            recCustomerIdHidden.value = vObj.ownerId;
        } else {
            recCustomer.value = '';
            recCustomerIdHidden.value = '';
        }
    });

    // 3. Service Record Service Type Change event listener
    document.getElementById('recService').addEventListener('change', (e) => {
        const services = getDB('services');
        const sObj = services.find(s => s.id === e.target.value);
        if (sObj) {
            document.getElementById('recLabor').value = (sObj.basePrice * 0.4).toFixed(2);
            document.getElementById('recPartsCost').value = (sObj.basePrice * 0.6).toFixed(2);
        } else {
            document.getElementById('recLabor').value = '0.00';
            document.getElementById('recPartsCost').value = '0.00';
        }
    });

    // 4. Invoice Booking Change event listener
    document.getElementById('invBooking').addEventListener('change', (e) => {
        const bookings = getDB('bookings');
        const bObj = bookings.find(b => b.id === e.target.value);
        if (bObj) {
            document.getElementById('invServiceCharges').value = bObj.cost;
        } else {
            document.getElementById('invServiceCharges').value = '0.00';
        }
    });

    // ==========================================
    // FORM SUBMIT HANDLERS WITH CRUD VALIDATIONS
    // ==========================================

    // 1. Customer Form Submit
    const custForm = document.getElementById('customerForm');
    custForm.onsubmit = (e) => {
        e.preventDefault();
        const customers = getDB('customers');
        const hiddenId = document.getElementById('customerIdHidden').value;
        const name = document.getElementById('custName').value.trim();
        const phone = document.getElementById('custPhone').value.trim();
        const email = document.getElementById('custEmail').value.trim();
        const address = document.getElementById('custAddress').value.trim();

        // Validations
        if (!name || name.length < 2) {
            showToast("Full Name must be at least 2 characters.", "danger");
            return;
        }
        const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
        if (!phone || !phoneRegex.test(phone)) {
            showToast("Please enter a valid phone number.", "danger");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            showToast("Please enter a valid email address.", "danger");
            return;
        }
        // Duplicate email prevention
        const isDuplicateEmail = customers.some(c => c.email.toLowerCase() === email.toLowerCase() && c.id !== hiddenId);
        if (isDuplicateEmail) {
            showToast("A customer with this email address already exists.", "danger");
            return;
        }

        if (hiddenId) {
            // Edit Mode
            const idx = customers.findIndex(c => c.id === hiddenId);
            if (idx !== -1) {
                // Preserve registration date and nested vehicles count
                const orig = customers[idx];
                customers[idx] = { ...orig, name, phone, email, address };
                saveDB('customers', customers);
                showToast("Customer parameters updated successfully.", "success");

                // Keep owner name synced in vehicles
                const vehicles = getDB('vehicles');
                let vehiclesChanged = false;
                vehicles.forEach(v => {
                    if (v.ownerId === hiddenId) {
                        v.ownerName = name;
                        vehiclesChanged = true;
                    }
                });
                if (vehiclesChanged) saveDB('vehicles', vehicles);

                // Keep customer name synced in bookings
                const bookings = getDB('bookings');
                let bookingsChanged = false;
                bookings.forEach(b => {
                    if (b.customerId === hiddenId) {
                        b.customerName = name;
                        bookingsChanged = true;
                    }
                });
                if (bookingsChanged) saveDB('bookings', bookings);
            }
        } else {
            // Create Mode
            const newCust = {
                id: 'CST' + String(customers.length + 1).padStart(3, '0') + String(Date.now()).slice(-2),
                name, phone, email, address,
                vehiclesCount: 0,
                registrationDate: new Date().toISOString().split('T')[0]
            };
            customers.push(newCust);
            saveDB('customers', customers);
            showToast("New customer created successfully.", "success");
            addNotification(`New customer ${name} registered.`, 'general');
        }

        closeModal('customerModal');
        loadCustomersView();
    };

    // 2. Vehicle Form Submit
    const vehForm = document.getElementById('vehicleForm');
    vehForm.onsubmit = (e) => {
        e.preventDefault();
        const vehicles = getDB('vehicles');
        const customers = getDB('customers');
        const hiddenId = document.getElementById('vehicleIdHidden').value;
        const ownerId = document.getElementById('vehOwner').value;
        const regNo = document.getElementById('vehRegNo').value.trim().toUpperCase();
        const brand = document.getElementById('vehBrand').value.trim();
        const model = document.getElementById('vehModel').value.trim();
        const year = parseInt(document.getElementById('vehYear').value);
        const fuel = document.getElementById('vehFuel').value;
        const transmission = document.getElementById('vehTransmission').value;
        const kmReading = parseInt(document.getElementById('vehKmReading').value);
        const color = document.getElementById('vehColor').value.trim();
        const lastServiceDate = document.getElementById('vehLastService').value;

        // Validations
        if (!ownerId) {
            showToast("Please select a customer owner.", "danger");
            return;
        }
        if (!regNo) {
            showToast("Registration plate number is required.", "danger");
            return;
        }
        // Unique Registration number check
        const isDuplicateReg = vehicles.some(v => v.regNo.toUpperCase() === regNo && v.id !== hiddenId);
        if (isDuplicateReg) {
            showToast("A vehicle with this registration number already exists.", "danger");
            return;
        }
        const currentYear = new Date().getFullYear();
        if (isNaN(year) || year < 1900 || year > currentYear + 1) {
            showToast(`Please enter a valid manufacturing year between 1900 and ${currentYear + 1}.`, "danger");
            return;
        }
        if (isNaN(kmReading) || kmReading < 0) {
            showToast("Kilometer reading cannot be negative.", "danger");
            return;
        }

        // Calculate next service date (6 months after last service date)
        let nextServiceDate = "";
        if (lastServiceDate) {
            const d = new Date(lastServiceDate);
            d.setMonth(d.getMonth() + 6);
            nextServiceDate = d.toISOString().split('T')[0];
        }

        const ownerName = (customers.find(c => c.id === ownerId) || {}).name || "Unknown";

        if (hiddenId) {
            // Edit Mode
            const idx = vehicles.findIndex(v => v.id === hiddenId);
            if (idx !== -1) {
                const oldOwnerId = vehicles[idx].ownerId;
                const oldRegNo = vehicles[idx].regNo;

                vehicles[idx] = { ...vehicles[idx], ownerId, ownerName, regNo, brand, model, year, fuel, transmission, kmReading, color, lastServiceDate, nextServiceDate };
                saveDB('vehicles', vehicles);

                // Update counts if owner changed
                if (oldOwnerId !== ownerId) {
                    recalculateCustomerVehiclesCount();
                }

                // Sync vehicleReg in bookings if reg number changed
                if (oldRegNo !== regNo) {
                    const bookings = getDB('bookings');
                    bookings.forEach(b => {
                        if (b.vehicleId === hiddenId) {
                            b.vehicleReg = regNo;
                        }
                    });
                    saveDB('bookings', bookings);
                }

                showToast("Vehicle parameters updated successfully.", "success");
            }
        } else {
            // Create Mode
            const newVeh = {
                id: 'VEH' + String(vehicles.length + 1).padStart(3, '0') + String(Date.now()).slice(-2),
                ownerId, ownerName, regNo, brand, model, year, fuel, transmission, kmReading, color, lastServiceDate, nextServiceDate
            };
            vehicles.push(newVeh);
            saveDB('vehicles', vehicles);
            recalculateCustomerVehiclesCount();
            showToast("Vehicle registered successfully.", "success");
        }

        closeModal('vehicleModal');
        loadVehiclesView();
    };

    // 3. Booking Form Submit
    const bookingForm = document.getElementById('bookingForm');
    bookingForm.onsubmit = (e) => {
        e.preventDefault();
        const bookings = getDB('bookings');
        const customers = getDB('customers');
        const vehicles = getDB('vehicles');
        const mechanics = getDB('mechanics');
        const services = getDB('services');

        const hiddenId = document.getElementById('bookingIdHidden').value;
        const customerId = document.getElementById('bkgCustomer').value;
        const vehicleId = document.getElementById('bkgVehicle').value;
        const serviceId = document.getElementById('bkgService').value;
        const date = document.getElementById('bkgDate').value;
        const time = document.getElementById('bkgTime').value;
        const mechanicId = document.getElementById('bkgMechanic').value;
        const status = document.getElementById('bkgStatus').value;
        const cost = parseFloat(document.getElementById('bkgCost').value);
        const complaint = document.getElementById('bkgComplaint').value.trim();

        // Validations
        if (!customerId) {
            showToast("Please select a customer.", "danger");
            return;
        }
        if (!vehicleId) {
            showToast("Please select a vehicle.", "danger");
            return;
        }
        if (!serviceId) {
            showToast("Please select a service type.", "danger");
            return;
        }
        if (!date) {
            showToast("Booking date is required.", "danger");
            return;
        }
        if (isNaN(cost) || cost < 0) {
            showToast("Estimated cost cannot be negative.", "danger");
            return;
        }

        // Verify vehicle owner matches customerId
        const vehicleObj = vehicles.find(v => v.id === vehicleId);
        if (!vehicleObj || vehicleObj.ownerId !== customerId) {
            showToast("Selected vehicle does not belong to the selected customer.", "danger");
            return;
        }

        const customerName = (customers.find(c => c.id === customerId) || {}).name || "Unknown";
        const vehicleReg = vehicleObj.regNo || "Unknown";
        const serviceType = (services.find(s => s.id === serviceId) || {}).name || "Unknown";
        const mechanicName = mechanicId ? (mechanics.find(m => m.id === mechanicId) || {}).name : "";

        if (hiddenId) {
            // Edit Mode
            const idx = bookings.findIndex(b => b.id === hiddenId);
            if (idx !== -1) {
                const oldStatus = bookings[idx].status;
                bookings[idx] = { ...bookings[idx], customerId, customerName, vehicleId, vehicleReg, serviceId, serviceType, date, time, mechanicId, mechanicName, status, cost, complaint };
                saveDB('bookings', bookings);
                showToast("Booking parameters saved.", "success");

                // Link status change to visual progress stepper
                if (oldStatus !== status) {
                    const trackingDB = JSON.parse(localStorage.getItem('autocare_tracking')) || {};
                    const newStageIdx = getStageIndexFromStatus(status);
                    trackingDB[hiddenId] = trackingDB[hiddenId] || {};
                    trackingDB[hiddenId].stageIndex = newStageIdx;
                    trackingDB[hiddenId].notes = `Status updated via Booking Editor to: ${status}`;
                    localStorage.setItem('autocare_tracking', JSON.stringify(trackingDB));
                }

                if (status === 'Completed') {
                    addNotification(`Booking ${hiddenId} marked as completed.`, 'booking');
                }
            }
        } else {
            // Create Mode
            const bookingId = 'BKG' + String(bookings.length + 1).padStart(3, '0') + String(Date.now()).slice(-2);
            const newBkg = {
                id: bookingId,
                customerId, customerName, vehicleId, vehicleReg, serviceId, serviceType, date, time, mechanicId, mechanicName, status, cost, complaint
            };
            bookings.push(newBkg);
            saveDB('bookings', bookings);

            // Automatically initialize tracking stage index
            const trackingDB = JSON.parse(localStorage.getItem('autocare_tracking')) || {};
            trackingDB[bookingId] = {
                stageIndex: 0,
                notes: "Service booking successfully created. Pending vehicle arrival.",
                estimatedCompletion: "Not specified",
                updatedBy: "System Admin"
            };
            localStorage.setItem('autocare_tracking', JSON.stringify(trackingDB));

            showToast("New service booking scheduled.", "success");
            addNotification(`New booking ${newBkg.id} created for ${customerName}.`, 'booking');
        }

        closeModal('bookingModal');
        loadBookingsView();
    };

    // 4. Record Form Submit
    const recordForm = document.getElementById('recordForm');
    recordForm.onsubmit = (e) => {
        e.preventDefault();
        const records = getDB('service_records');
        const vehicles = getDB('vehicles');
        const mechanics = getDB('mechanics');
        const services = getDB('services');

        const hiddenId = document.getElementById('recordIdHidden').value;
        const vehicleId = document.getElementById('recVehicle').value;
        const customerName = document.getElementById('recCustomer').value;
        const serviceId = document.getElementById('recService').value;
        const mechanicId = document.getElementById('recMechanic').value;
        const serviceDate = document.getElementById('recDate').value;
        const kmReading = parseInt(document.getElementById('recKm').value);
        const nextServiceDate = document.getElementById('recNextDate').value;
        const laborCost = parseFloat(document.getElementById('recLabor').value);
        const partsCost = parseFloat(document.getElementById('recPartsCost').value);
        const partsReplaced = document.getElementById('recPartsList').value.trim();
        const workPerformed = document.getElementById('recWorkPerformed').value.trim();

        // Validations
        if (!vehicleId) {
            showToast("Please select a vehicle.", "danger");
            return;
        }
        if (!serviceId) {
            showToast("Please select a service type.", "danger");
            return;
        }
        if (!mechanicId) {
            showToast("Please select an assigned mechanic.", "danger");
            return;
        }
        if (!serviceDate) {
            showToast("Service date is required.", "danger");
            return;
        }
        if (isNaN(kmReading) || kmReading < 0) {
            showToast("Kilometer reading cannot be negative.", "danger");
            return;
        }
        if (isNaN(laborCost) || laborCost < 0) {
            showToast("Labor charges cannot be negative.", "danger");
            return;
        }
        if (isNaN(partsCost) || partsCost < 0) {
            showToast("Parts charges cannot be negative.", "danger");
            return;
        }

        // Tax & Totals calculation
        const settings = getSettings();
        const taxRate = settings.taxPercentage || 15.0;
        const subtotal = laborCost + partsCost;
        const tax = subtotal * (taxRate / 100);
        const totalCost = subtotal + tax;

        const vehicleObj = vehicles.find(v => v.id === vehicleId) || {};
        const vehicleReg = vehicleObj.regNo || "Unknown";
        const vehicleInfo = vehicleObj.brand ? `${vehicleObj.brand} ${vehicleObj.model} (${vehicleObj.year})` : "Vehicle";
        const serviceType = (services.find(s => s.id === serviceId) || {}).name || "Unknown Service";
        const mechanicName = (mechanics.find(m => m.id === mechanicId) || {}).name || "System";

        if (hiddenId) {
            // Edit Mode
            const idx = records.findIndex(r => r.id === hiddenId);
            if (idx !== -1) {
                records[idx] = { ...records[idx], vehicleId, vehicleReg, vehicleInfo, customerName, serviceDate, serviceType, workPerformed, partsReplaced, mechanicName, laborCost, partsCost, tax, totalCost, kmReading, nextServiceDate };
                saveDB('service_records', records);
                showToast("Service record updated.", "success");
            }
        } else {
            // Create Mode
            const newRec = {
                id: 'REC' + String(records.length + 1).padStart(3, '0') + String(Date.now()).slice(-2),
                vehicleId, vehicleReg, vehicleInfo, customerName, serviceDate, serviceType, workPerformed, partsReplaced, mechanicName, laborCost, partsCost, tax, totalCost, kmReading, nextServiceDate
            };
            records.push(newRec);
            saveDB('service_records', records);
            showToast("Service record archived successfully.", "success");

            // Update parameters in vehicles table (last service date and km reading)
            updateVehicleServiceDate(vehicleReg, serviceDate, nextServiceDate, kmReading);
        }

        closeModal('recordModal');
        loadRecordsView();
    };

    // 5. Mechanic Form Submit
    const mechanicForm = document.getElementById('mechanicForm');
    mechanicForm.onsubmit = (e) => {
        e.preventDefault();
        const mechanics = getDB('mechanics');
        const hiddenId = document.getElementById('mechanicIdHidden').value;
        const name = document.getElementById('mecName').value.trim();
        const phone = document.getElementById('mecPhone').value.trim();
        const email = document.getElementById('mecEmail').value.trim();
        const specialization = document.getElementById('mecSpecialty').value.trim();
        const experience = document.getElementById('mecExperience').value.trim();
        const status = document.getElementById('mecStatus').value;

        // Validations
        if (!name || name.length < 2) {
            showToast("Mechanic name must be at least 2 characters.", "danger");
            return;
        }
        const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
        if (!phone || !phoneRegex.test(phone)) {
            showToast("Please enter a valid phone number.", "danger");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            showToast("Please enter a valid email address.", "danger");
            return;
        }

        if (hiddenId) {
            const idx = mechanics.findIndex(m => m.id === hiddenId);
            if (idx !== -1) {
                mechanics[idx] = { ...mechanics[idx], name, phone, email, specialization, experience, status };
                saveDB('mechanics', mechanics);
                showToast("Mechanic details updated.", "success");
            }
        } else {
            const newMec = {
                id: 'MEC' + String(mechanics.length + 1).padStart(3, '0') + String(Date.now()).slice(-2),
                name, phone, email, specialization, experience, status,
                assignedJobs: 0
            };
            mechanics.push(newMec);
            saveDB('mechanics', mechanics);
            showToast("Mechanic registered.", "success");
        }

        closeModal('mechanicModal');
        loadMechanicsView();
    };

    // 6. Service Form Submit
    const serviceForm = document.getElementById('serviceForm');
    serviceForm.onsubmit = (e) => {
        e.preventDefault();
        const services = getDB('services');
        const hiddenId = document.getElementById('serviceIdHidden').value;
        const name = document.getElementById('srvName').value.trim();
        const duration = document.getElementById('srvDuration').value.trim();
        const basePrice = parseFloat(document.getElementById('srvPrice').value);
        const description = document.getElementById('srvDescription').value.trim();

        // Validations
        if (!name) {
            showToast("Service name is required.", "danger");
            return;
        }
        if (isNaN(basePrice) || basePrice < 0) {
            showToast("Base price cannot be negative.", "danger");
            return;
        }
        const isDuplicateName = services.some(s => s.name.toLowerCase() === name.toLowerCase() && s.id !== hiddenId);
        if (isDuplicateName) {
            showToast("A service with this name already exists in the catalog.", "danger");
            return;
        }

        if (hiddenId) {
            const idx = services.findIndex(s => s.id === hiddenId);
            if (idx !== -1) {
                services[idx] = { ...services[idx], name, duration, basePrice, description };
                saveDB('services', services);
                showToast("Service catalog updated.", "success");
            }
        } else {
            const newSrv = {
                id: 'SRV' + String(services.length + 1).padStart(3, '0') + String(Date.now()).slice(-2),
                name, duration, basePrice, description,
                status: 'Active'
            };
            services.push(newSrv);
            saveDB('services', services);
            showToast("Service added.", "success");
        }

        closeModal('serviceModal');
        loadServicesView();
    };

    // 7. Inventory Spare Parts Form Submit
    const partForm = document.getElementById('partForm');
    partForm.onsubmit = (e) => {
        e.preventDefault();
        const inventory = getDB('inventory');
        const hiddenId = document.getElementById('partIdHidden').value;
        const name = document.getElementById('prtName').value.trim();
        const category = document.getElementById('prtCategory').value;
        const supplier = document.getElementById('prtSupplier').value.trim();
        const quantity = parseInt(document.getElementById('prtQuantity').value);
        const minStock = parseInt(document.getElementById('prtMinStock').value);
        const price = parseFloat(document.getElementById('prtPrice').value);
        const lastUpdated = new Date().toISOString().split('T')[0];

        // Validations
        if (!name) {
            showToast("Part name is required.", "danger");
            return;
        }
        if (isNaN(quantity) || quantity < 0) {
            showToast("Quantity cannot be negative.", "danger");
            return;
        }
        if (isNaN(minStock) || minStock < 0) {
            showToast("Minimum stock level cannot be negative.", "danger");
            return;
        }
        if (isNaN(price) || price < 0) {
            showToast("Unit price cannot be negative.", "danger");
            return;
        }

        if (hiddenId) {
            const idx = inventory.findIndex(p => p.id === hiddenId);
            if (idx !== -1) {
                inventory[idx] = { ...inventory[idx], name, category, supplier, quantity, minStock, price, lastUpdated };
                saveDB('inventory', inventory);
                showToast("Spare part stock updated.", "success");
                
                // Add stock warnings
                if (quantity <= minStock) {
                    addNotification(`Low stock warning: '${name}' reaches safety level (Qty: ${quantity} / Min: ${minStock})`, 'low-stock');
                }
            }
        } else {
            const newPart = {
                id: 'PRT' + String(inventory.length + 1).padStart(3, '0') + String(Date.now()).slice(-2),
                name, category, supplier, quantity, minStock, price, lastUpdated
            };
            inventory.push(newPart);
            saveDB('inventory', inventory);
            showToast("Spare part added.", "success");
            
            if (quantity <= minStock) {
                addNotification(`Low stock warning: '${name}' reaches safety level (Qty: ${quantity} / Min: ${minStock})`, 'low-stock');
            }
        }

        closeModal('partModal');
        loadInventoryView();
    };

    // 8. Billing Form Invoice Submit
    const invoiceForm = document.getElementById('invoiceForm');
    invoiceForm.onsubmit = (e) => {
        e.preventDefault();
        const invoices = getDB('invoices');
        const bookings = getDB('bookings');

        const hiddenId = document.getElementById('invoiceIdHidden').value;
        const bookingId = document.getElementById('invBooking').value;
        const date = document.getElementById('invDate').value;
        const serviceCharges = parseFloat(document.getElementById('invServiceCharges').value);
        const partsCharges = parseFloat(document.getElementById('invPartsCharges').value);
        const laborCharges = parseFloat(document.getElementById('invLaborCharges').value);
        const discount = parseFloat(document.getElementById('invDiscount').value);
        const method = document.getElementById('invMethod').value;
        const status = document.getElementById('invStatus').value;

        // Validations
        if (!bookingId) {
            showToast("Please select a service booking link.", "danger");
            return;
        }
        if (isNaN(serviceCharges) || serviceCharges < 0 ||
            isNaN(partsCharges) || partsCharges < 0 ||
            isNaN(laborCharges) || laborCharges < 0 ||
            isNaN(discount) || discount < 0) {
            showToast("Charges and discount values cannot be negative.", "danger");
            return;
        }

        // Subtotal & Grand Total calculation
        const settings = getSettings();
        const taxRate = settings.taxPercentage || 15.0;
        const subtotal = serviceCharges + partsCharges + laborCharges - discount;
        const tax = subtotal * (taxRate / 100);
        const total = subtotal + tax;

        const b = bookings.find(x => x.id === bookingId) || {};
        const customerName = b.customerName || "Unknown Client";
        const vehicleReg = b.vehicleReg || "Unknown Reg";

        if (hiddenId) {
            const idx = invoices.findIndex(i => i.id === hiddenId);
            if (idx !== -1) {
                invoices[idx] = { ...invoices[idx], bookingId, customerName, vehicleReg, serviceCharges, partsCharges, laborCharges, tax, discount, total, method, status, date };
                saveDB('invoices', invoices);
                showToast("Invoice updated.", "success");
            }
        } else {
            const newInv = {
                id: 'INV' + String(invoices.length + 1).padStart(3, '0') + String(Date.now()).slice(-2),
                bookingId, customerName, vehicleReg, serviceCharges, partsCharges, laborCharges, tax, discount, total, method, status, date
            };
            invoices.push(newInv);
            saveDB('invoices', invoices);
            showToast("Client tax invoice generated successfully.", "success");
            
            if (status === 'Pending') {
                addNotification(`Invoice ${newInv.id} issued. Outstanding balance: ₹${total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 'payment');
            }
        }

        closeModal('invoiceModal');
        loadBillingView();
    };

    // 9. Store configuration Settings form
    const settingsForm = document.getElementById('settingsForm');
    settingsForm.onsubmit = (e) => {
        e.preventDefault();
        const settings = {
            serviceCenterName: document.getElementById('setCenterName').value.trim(),
            email: document.getElementById('setCenterEmail').value.trim(),
            phone: document.getElementById('setCenterPhone').value.trim(),
            taxPercentage: parseFloat(document.getElementById('setTaxPercentage').value),
            currency: document.getElementById('setCurrency').value.trim(),
            workingHours: document.getElementById('setWorkingHours').value.trim(),
            address: document.getElementById('setCenterAddress').value.trim()
        };

        // Settings level non-negative validation
        if (isNaN(settings.taxPercentage) || settings.taxPercentage < 0) {
            showToast("Tax rate percentage cannot be negative.", "danger");
            return;
        }

        localStorage.setItem('autocare_settings', JSON.stringify(settings));
        showToast("Operational configurations updated successfully.", "success");
    };

    // 10. Admin profile edit form
    const profileForm = document.getElementById('profileForm');
    profileForm.onsubmit = (e) => {
        e.preventDefault();
        const profile = getProfile();
        profile.name = document.getElementById('profileNameInput').value.trim();
        profile.email = document.getElementById('profileEmailInput').value.trim();
        profile.phone = document.getElementById('profilePhoneInput').value.trim();

        localStorage.setItem('autocare_profile', JSON.stringify(profile));
        showToast("Profile details updated successfully.", "success");
        updateHeaderUI();
        loadProfileView();
    };

    // 11. Change Password Form
    const changePasswordForm = document.getElementById('changePasswordForm');
    changePasswordForm.onsubmit = (e) => {
        e.preventDefault();
        const oldP = document.getElementById('oldPasswordInput').value;
        const newP = document.getElementById('newPasswordInput').value;

        // For this local simulation: password is admin123 or stored in profile
        const profile = getProfile();
        const savedPass = profile.password || 'admin123';

        if (oldP === savedPass) {
            profile.password = newP;
            localStorage.setItem('autocare_profile', JSON.stringify(profile));
            showToast("Password updated successfully.", "success");
            changePasswordForm.reset();
        } else {
            showToast("Current password parameter is incorrect.", "danger");
        }
    };

    // Table search boxes key triggers
    document.getElementById('customerSearchInput').addEventListener('input', loadCustomersView);
    document.getElementById('customerSortSelect').addEventListener('change', loadCustomersView);
    
    document.getElementById('vehicleSearchInput').addEventListener('input', loadVehiclesView);
    document.getElementById('vehicleFuelFilter').addEventListener('change', loadVehiclesView);
    
    document.getElementById('bookingSearchInput').addEventListener('input', loadBookingsView);
    document.getElementById('bookingStatusFilter').addEventListener('change', loadBookingsView);
    document.getElementById('bookingDateFilter').addEventListener('change', loadBookingsView);
    
    document.getElementById('recordSearchInput').addEventListener('input', loadRecordsView);
    document.getElementById('mechanicSearchInput').addEventListener('input', loadMechanicsView);
    document.getElementById('mechanicStatusFilter').addEventListener('change', loadMechanicsView);
    
    document.getElementById('inventorySearchInput').addEventListener('input', loadInventoryView);
    document.getElementById('inventoryCategoryFilter').addEventListener('change', loadInventoryView);
    
    document.getElementById('invoiceSearchInput').addEventListener('input', loadBillingView);
    document.getElementById('invoiceStatusFilter').addEventListener('change', loadBillingView);
}


// ==========================================================================
// 20. MISC DATABASE UTILITIES
// ==========================================================================
function recalculateCustomerVehiclesCount() {
    const customers = getDB('customers');
    const vehicles = getDB('vehicles');
    
    customers.forEach(c => {
        const count = vehicles.filter(v => v.ownerId === c.id).length;
        c.vehiclesCount = count;
    });

    saveDB('customers', customers);
}

function updateVehicleServiceDate(regNo, serviceDate, nextServiceDate, kmReading) {
    const vehicles = getDB('vehicles');
    const idx = vehicles.findIndex(v => v.regNo === regNo);
    if (idx !== -1) {
        vehicles[idx].lastServiceDate = serviceDate;
        vehicles[idx].nextServiceDate = nextServiceDate;
        if (kmReading > vehicles[idx].kmReading) {
            vehicles[idx].kmReading = kmReading;
        }
        saveDB('vehicles', vehicles);
    }
}
