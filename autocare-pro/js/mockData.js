// AutoCare Pro - Initial Mock Data for LocalStorage (Version 2.0)

const defaultSettings = {
    serviceCenterName: "AutoCare Pro Service Center",
    address: "100 Performance Drive, Suite A, Motor City, MC 48201",
    phone: "+1 (555) 019-2834",
    email: "info@autocarepro.com",
    taxPercentage: 15.0,
    currency: "INR",
    workingHours: "Mon - Sat: 8:00 AM - 6:00 PM, Sun: Closed"
};

const defaultProfile = {
    name: "Akhilesh Girish Babu",
    email: "akhilesh@autocare.com",
    phone: "Not Provided",
    role: "Administrator / Project Developer",
    course: "B.Tech Artificial Intelligence and Data Science",
    college: "Dr N G P Institute of Technology",
    batch: "2028",
    project: "AutoCare Pro",
    avatar: "assets/images/profile/default_avatar.jpg",
    bio: "Developer of AutoCare Pro - B.Tech AI & DS Student at Dr N G P Institute of Technology."
};

const defaultServices = [
    { id: "SRV001", name: "General Service", description: "Comprehensive 75-point checkup, fluid top-up, and diagnostics.", duration: "2 Hours", basePrice: 120, status: "Active" },
    { id: "SRV002", name: "Brake Pads Service", description: "Front/rear brake pads check, caliper cleaning, and replacement.", duration: "1.5 Hours", basePrice: 85, status: "Active" },
    { id: "SRV003", name: "Oil & Filter Change", description: "Synthetic grade engine oil replacement and filter swap.", duration: "1 Hour", basePrice: 60, status: "Active" },
    { id: "SRV004", name: "Wheel Alignment", description: "3D precision wheel alignment, dynamic balancing and tyre check.", duration: "1 Hour", basePrice: 75, status: "Active" },
    { id: "SRV005", name: "AC Diagnostics", description: "AC cooling leak checks, blower cleaning, and gas top-up.", duration: "1.5 Hours", basePrice: 90, status: "Active" }
];

const defaultMechanics = [
    { id: "MEC001", name: "Marcus Vane", phone: "+91 98765 40001", email: "marcus@autocare.com", specialization: "Engine Repair & Diagnostics", experience: "8 Years", assignedJobs: 1, status: "Busy" },
    { id: "MEC002", name: "Elena Rostova", phone: "+91 98765 40002", email: "elena@autocare.com", specialization: "Brakes & Suspension", experience: "5 Years", assignedJobs: 1, status: "Busy" },
    { id: "MEC003", name: "Darnell Jenkins", phone: "+91 98765 40003", email: "darnell@autocare.com", specialization: "Electricals & AC Service", experience: "6 Years", assignedJobs: 0, status: "Available" },
    { id: "MEC004", name: "Kenji Sato", phone: "+91 98765 40004", email: "kenji@autocare.com", specialization: "General Maintenance", experience: "4 Years", assignedJobs: 0, status: "Available" },
    { id: "MEC005", name: "Sarah Connor", phone: "+91 98765 40005", email: "sarah@autocare.com", specialization: "Tuning & Detailing", experience: "7 Years", assignedJobs: 0, status: "On Leave" }
];

const defaultCustomers = [
    { id: "CST001", name: "Arun Kumar", phone: "+91 98765 43210", email: "arun.kumar@gmail.com", address: "12, PSG Colony, Peelamedu, Coimbatore - 641004", vehiclesCount: 1, registrationDate: "2026-01-15" },
    { id: "CST002", name: "Rahul Menon", phone: "+91 94432 18907", email: "rahul.menon@outlook.com", address: "54, Nehru Nagar, Kalapatti Road, Coimbatore - 641014", vehiclesCount: 1, registrationDate: "2026-02-10" },
    { id: "CST003", name: "Priya Sharma", phone: "+91 81223 90544", email: "priya.sharma@yahoo.co.in", address: "8B, Avinashi Road, Lakshmi Mills Junction, Coimbatore - 641037", vehiclesCount: 1, registrationDate: "2026-03-05" },
    { id: "CST004", name: "Vikram Nair", phone: "+91 99655 12345", email: "vikram.nair@hotmail.com", address: "102, Trichy Road, Singanallur, Coimbatore - 641005", vehiclesCount: 1, registrationDate: "2026-04-20" },
    { id: "CST005", name: "Neha Reddy", phone: "+91 73584 98765", email: "neha.reddy@gmail.com", address: "43, Vadavalli Road, Sai Baba Colony, Coimbatore - 641011", vehiclesCount: 1, registrationDate: "2026-05-18" }
];

const defaultVehicles = [
    { id: "VEH001", ownerId: "CST001", ownerName: "Arun Kumar", regNo: "TN-37-AB-1234", brand: "BMW", model: "3 Series", year: 2022, fuel: "Petrol", transmission: "Automatic", kmReading: 24500, color: "Phytonic Blue", lastServiceDate: "2026-04-10", nextServiceDate: "2026-10-10", image: "assets/images/vehicles/bmw_3_series.jpg" },
    { id: "VEH002", ownerId: "CST002", ownerName: "Rahul Menon", regNo: "TN-37-CZ-5678", brand: "BMW", model: "5 Series", year: 2021, fuel: "Diesel", transmission: "Automatic", kmReading: 48000, color: "Sophisto Grey", lastServiceDate: "2026-05-12", nextServiceDate: "2026-11-12", image: "assets/images/vehicles/bmw_5_series.jpg" },
    { id: "VEH003", ownerId: "CST003", ownerName: "Priya Sharma", regNo: "TN-37-EF-9012", brand: "BMW", model: "X1", year: 2023, fuel: "Petrol", transmission: "Automatic", kmReading: 12500, color: "Alpine White", lastServiceDate: "2026-06-01", nextServiceDate: "2026-12-01", image: "assets/images/vehicles/bmw_x1.jpg" },
    { id: "VEH004", ownerId: "CST004", ownerName: "Vikram Nair", regNo: "TN-37-GH-3456", brand: "BMW", model: "X3", year: 2020, fuel: "Diesel", transmission: "Automatic", kmReading: 62000, color: "Flamenco Red", lastServiceDate: "2026-03-15", nextServiceDate: "2026-09-15", image: "assets/images/vehicles/bmw_x3.jpg" },
    { id: "VEH005", ownerId: "CST005", ownerName: "Neha Reddy", regNo: "TN-37-JK-7890", brand: "BMW", model: "X5", year: 2022, fuel: "Hybrid", transmission: "Automatic", kmReading: 31000, color: "Carbon Black", lastServiceDate: "2026-02-20", nextServiceDate: "2026-08-20", image: "assets/images/vehicles/bmw_x5.jpg" }
];

const defaultBookings = [
    { id: "BKG001", customerId: "CST001", customerName: "Arun Kumar", vehicleId: "VEH001", vehicleReg: "TN-37-AB-1234", serviceId: "SRV001", serviceType: "General Service", date: "2026-07-07", time: "09:00 AM", complaint: "Engine noise and oil change required. Inspect front suspension.", cost: 120, mechanicId: "MEC001", mechanicName: "Marcus Vane", status: "In Service" },
    { id: "BKG002", customerId: "CST002", customerName: "Rahul Menon", vehicleId: "VEH002", vehicleReg: "TN-37-CZ-5678", serviceId: "SRV002", serviceType: "Brake Pads Service", date: "2026-07-07", time: "11:30 AM", complaint: "Brake warning light is on. Check and replace front brake pads.", cost: 85, mechanicId: "MEC002", mechanicName: "Elena Rostova", status: "Confirmed" },
    { id: "BKG003", customerId: "CST003", customerName: "Priya Sharma", vehicleId: "VEH003", vehicleReg: "TN-37-EF-9012", serviceId: "SRV003", serviceType: "Oil & Filter Change", date: "2026-07-08", time: "02:00 PM", complaint: "Periodic scheduled engine oil swap and inspection.", cost: 60, mechanicId: "MEC003", mechanicName: "Darnell Jenkins", status: "Booked" },
    { id: "BKG004", customerId: "CST004", customerName: "Vikram Nair", vehicleId: "VEH004", vehicleReg: "TN-37-GH-3456", serviceId: "SRV004", serviceType: "Wheel Alignment", date: "2026-07-06", time: "10:00 AM", complaint: "Vehicle pulls to left side on high speed.", cost: 75, mechanicId: "MEC004", mechanicName: "Kenji Sato", status: "Completed" },
    { id: "BKG005", customerId: "CST005", customerName: "Neha Reddy", vehicleId: "VEH005", vehicleReg: "TN-37-JK-7890", serviceId: "SRV005", serviceType: "AC Diagnostics", date: "2026-07-05", time: "03:30 PM", complaint: "AC cabin blower cooling is weak and smelling dusty.", cost: 90, mechanicId: "MEC001", mechanicName: "Marcus Vane", status: "Completed" }
];

const defaultServiceRecords = [
    { id: "REC001", vehicleId: "VEH004", vehicleReg: "TN-37-GH-3456", vehicleInfo: "BMW X3 (2020)", customerName: "Vikram Nair", serviceDate: "2026-07-06", serviceType: "Wheel Alignment", workPerformed: "Completed 3D wheel alignment and balancing. Adjusted tie rods to correct toe-in. Tested highway drive.", partsReplaced: "Alignment shims", mechanicName: "Kenji Sato", laborCost: 75.00, partsCost: 0.00, tax: 11.25, totalCost: 86.25, kmReading: 62000, nextServiceDate: "2027-01-06" },
    { id: "REC002", vehicleId: "VEH005", vehicleReg: "TN-37-JK-7890", vehicleInfo: "BMW X5 (2022)", customerName: "Neha Reddy", serviceDate: "2026-07-05", serviceType: "AC Diagnostics", workPerformed: "AC gas checked. Leak detected in condenser. Replaced AC cabin filter. Evacuated and refilled R-134a refrigerant.", partsReplaced: "AC Cabin Air Filter, R-134a gas charge", mechanicName: "Marcus Vane", laborCost: 90.00, partsCost: 45.00, tax: 20.25, totalCost: 155.25, kmReading: 31000, nextServiceDate: "2027-01-05" },
    { id: "REC003", vehicleId: "VEH001", vehicleReg: "TN-37-AB-1234", vehicleInfo: "BMW 3 Series (2022)", customerName: "Arun Kumar", serviceDate: "2026-04-10", serviceType: "Oil & Filter Change", workPerformed: "Drained old oil. Replaced engine oil filter and refilled with 5W-30 synthetic oil. Reset service light.", partsReplaced: "Universal Oil Filter, 5W-30 Synthetic Oil", mechanicName: "Marcus Vane", laborCost: 40.00, partsCost: 20.00, tax: 9.00, totalCost: 69.00, kmReading: 20000, nextServiceDate: "2026-10-10" },
    { id: "REC004", vehicleId: "VEH002", vehicleReg: "TN-37-CZ-5678", vehicleInfo: "BMW 5 Series (2021)", customerName: "Rahul Menon", serviceDate: "2026-05-12", serviceType: "General Service", workPerformed: "Completed 75-point general service inspection. Cleaned air and cabin filters. Checked fluid levels.", partsReplaced: "None", mechanicName: "Elena Rostova", laborCost: 120.00, partsCost: 0.00, tax: 18.00, totalCost: 138.00, kmReading: 42000, nextServiceDate: "2026-11-12" },
    { id: "REC005", vehicleId: "VEH003", vehicleReg: "TN-37-EF-9012", vehicleInfo: "BMW X1 (2023)", customerName: "Priya Sharma", serviceDate: "2026-06-01", serviceType: "Brake Pads Service", workPerformed: "Replaced front brake pads. Cleaned brake rotors and calipers. Flushed brake fluid.", partsReplaced: "Front Brake Pads Set, Brake Fluid DOT 4", mechanicName: "Elena Rostova", laborCost: 85.00, partsCost: 65.00, tax: 22.50, totalCost: 172.50, kmReading: 10000, nextServiceDate: "2026-12-01" }
];

const defaultInventory = [
    { id: "PRT001", name: "Premium Synthetic Engine Oil 5W-30", category: "Fluids", supplier: "Valvoline Corp", quantity: 45, minStock: 20, price: 12.50, lastUpdated: "2026-07-01" },
    { id: "PRT002", name: "Front Brake Pads Set (BMW 3/5 Series)", category: "Brakes", supplier: "Brembo USA", quantity: 3, minStock: 5, price: 65.00, lastUpdated: "2026-06-28" },
    { id: "PRT003", name: "AC Cabin Air Filter - Active Charcoal", category: "Filters", supplier: "Denso Parts", quantity: 4, minStock: 8, price: 22.00, lastUpdated: "2026-07-06" },
    { id: "PRT004", name: "Universal Oil Filter", category: "Filters", supplier: "Fram Group", quantity: 35, minStock: 15, price: 8.00, lastUpdated: "2026-07-04" },
    { id: "PRT005", name: "Brake Fluid DOT 4", category: "Fluids", supplier: "Castrol Corp", quantity: 2, minStock: 6, price: 14.00, lastUpdated: "2026-07-06" }
];

const defaultInvoices = [
    { id: "INV001", bookingId: "BKG004", customerName: "Vikram Nair", vehicleReg: "TN-37-GH-3456", serviceCharges: 75.00, partsCharges: 0.00, laborCharges: 0.00, tax: 11.25, discount: 5.00, total: 81.25, method: "Credit Card", status: "Paid", date: "2026-07-06" },
    { id: "INV002", bookingId: "BKG005", customerName: "Neha Reddy", vehicleReg: "TN-37-JK-7890", serviceCharges: 90.00, partsCharges: 45.00, laborCharges: 30.00, tax: 24.75, discount: 0.00, total: 189.75, method: "UPI", status: "Paid", date: "2026-07-05" },
    { id: "INV003", bookingId: "BKG001", customerName: "Arun Kumar", vehicleReg: "TN-37-AB-1234", serviceCharges: 120.00, partsCharges: 65.00, laborCharges: 50.00, tax: 35.25, discount: 10.00, total: 260.25, method: "Online", status: "Pending", date: "2026-07-07" },
    { id: "INV004", bookingId: "BKG002", customerName: "Rahul Menon", vehicleReg: "TN-37-CZ-5678", serviceCharges: 85.00, partsCharges: 65.00, laborCharges: 40.00, tax: 28.50, discount: 15.00, total: 203.50, method: "Cash", status: "Pending", date: "2026-07-07" },
    { id: "INV005", bookingId: "BKG003", customerName: "Priya Sharma", vehicleReg: "TN-37-EF-9012", serviceCharges: 60.00, partsCharges: 0.00, laborCharges: 25.00, tax: 12.75, discount: 0.00, total: 97.75, method: "Debit Card", status: "Paid", date: "2026-07-08" }
];

const defaultNotifications = [
    { id: "NTF001", text: "Low stock alert: 'Front Brake Pads Set (BMW 3/5 Series)' reaches safety level (Quantity: 3, Min: 5)", date: "2026-07-07 09:30 AM", read: false, type: "low-stock" },
    { id: "NTF002", text: "Low stock alert: 'AC Cabin Air Filter - Active Charcoal' reaches safety level (Quantity: 4, Min: 8)", date: "2026-07-07 09:15 AM", read: false, type: "low-stock" },
    { id: "NTF003", text: "Low stock alert: 'Brake Fluid DOT 4' reaches safety level (Quantity: 2, Min: 6)", date: "2026-07-07 09:00 AM", read: false, type: "low-stock" },
    { id: "NTF004", text: "New service booking BKG002 created for Rahul Menon (BMW 5 Series)", date: "2026-07-07 08:30 AM", read: true, type: "booking" },
    { id: "NTF005", text: "Upcoming appointment reminder: Priya Sharma for Oil & Filter Change on 2026-07-08 at 02:00 PM", date: "2026-07-07 08:00 AM", read: true, type: "appointment" }
];

// Helper to initialize local storage database
function initLocalStorageDB() {
    // If the database has never been initialized or has an older seed version, seed/upgrade to v3.0
    const hasInitialized = localStorage.getItem("autocare_initialized");
    const seedVer = localStorage.getItem("autocare_seed_version");
    
    if (!hasInitialized || seedVer !== "3.0") {
        // Safe upgrade strategy: only overwrite default seeds if no user data exists or version mismatch
        localStorage.setItem("autocare_settings", JSON.stringify(defaultSettings));
        localStorage.setItem("autocare_profile", JSON.stringify(defaultProfile));
        localStorage.setItem("autocare_services", JSON.stringify(defaultServices));
        localStorage.setItem("autocare_mechanics", JSON.stringify(defaultMechanics));
        localStorage.setItem("autocare_customers", JSON.stringify(defaultCustomers));
        localStorage.setItem("autocare_vehicles", JSON.stringify(defaultVehicles));
        localStorage.setItem("autocare_bookings", JSON.stringify(defaultBookings));
        localStorage.setItem("autocare_service_records", JSON.stringify(defaultServiceRecords));
        localStorage.setItem("autocare_inventory", JSON.stringify(defaultInventory));
        localStorage.setItem("autocare_invoices", JSON.stringify(defaultInvoices));
        localStorage.setItem("autocare_notifications", JSON.stringify(defaultNotifications));
        
        const defaultTrackingDetails = {
            "BKG001": { stageIndex: 3, notes: "Vehicle is in mechanics bay. Engine diagnostics and oil drain completed.", estimatedCompletion: "2026-07-07 04:30 PM", updatedBy: "Marcus Vane" },
            "BKG002": { stageIndex: 1, notes: "Vehicle received at service bay. Initial walkthrough completed.", estimatedCompletion: "2026-07-07 06:00 PM", updatedBy: "Elena Rostova" },
            "BKG003": { stageIndex: 0, notes: "Booking confirmed. Waiting for customer vehicle arrival.", estimatedCompletion: "2026-07-08 05:00 PM", updatedBy: "System Admin" },
            "BKG004": { stageIndex: 7, notes: "All service stages completed. Checked toe alignment. Handed over to owner.", estimatedCompletion: "2026-07-06 01:00 PM", updatedBy: "Kenji Sato" },
            "BKG005": { stageIndex: 7, notes: "AC leak test completed and condenser replaced. Delivery finalized.", estimatedCompletion: "2026-07-05 05:30 PM", updatedBy: "Marcus Vane" }
        };
        localStorage.setItem("autocare_tracking", JSON.stringify(defaultTrackingDetails));
        
        localStorage.setItem("autocare_seed_version", "3.0");
        localStorage.setItem("autocare_initialized", "true");
        console.log("AutoCare Pro v3.0: LocalStorage Database successfully initialized with developer records (INR default).");
    }
}

// Developer utility reset method, accessible via console: window.resetDatabaseToV2()
window.resetDatabaseToV2 = function() {
    localStorage.removeItem("autocare_initialized");
    localStorage.removeItem("autocare_seed_version");
    initLocalStorageDB();
    console.log("AutoCare Pro: Database reset successfully to v3.0 mock data.");
    window.location.reload();
};

window.initLocalStorageDB = initLocalStorageDB;
initLocalStorageDB();
