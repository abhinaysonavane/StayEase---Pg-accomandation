/**
 * StayEase Realistic Mock Dataset
 * Used for Phase 1 frontend development and initial UI showcase.
 * In later phases, these entities map 1:1 to MySQL models via FastAPI REST endpoints.
 */

export const mockUsers = {
  tenant: {
    id: 1,
    name: "Rohan Sharma",
    email: "rohan.sharma@example.com",
    phone: "+91 98765 43210",
    role: "tenant",
    avatar: "RS",
    gender: "male",
    occupation: "Software Engineer at TechCorp",
    emergencyContact: {
      name: "Suresh Sharma (Father)",
      phone: "+91 98765 43211",
      relation: "Parent"
    },
    kycStatus: "verified"
  },
  owner: {
    id: 2,
    name: "Rajesh Verma",
    email: "rajesh.verma@stayliving.com",
    phone: "+91 98111 22334",
    role: "owner",
    avatar: "RV",
    companyName: "Verma Hospitality & Living",
    propertiesCount: 3,
    verifiedStatus: "verified"
  },
  admin: {
    id: 3,
    name: "Priya Nair",
    email: "admin@stayease.com",
    phone: "+91 98999 88776",
    role: "admin",
    avatar: "PN",
    department: "Platform Operations"
  }
};

export const mockProperties = [
  {
    id: 1,
    name: "GreenLeaf Luxury Coliving & PG",
    tagline: "Premium techie living with high-speed fiber & gourmet dining",
    city: "Bangalore",
    locality: "Koramangala 4th Block",
    address: "Plot 88, 17th Main Rd, 4th Block, Koramangala, Bengaluru, Karnataka 560034",
    genderPolicy: "unisex", // unisex, male, female
    startingPrice: 12500,
    depositMonths: 2,
    noticePeriodDays: 30,
    rating: 4.85,
    reviewsCount: 42,
    verified: true,
    coverImage: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80"
    ],
    roomTypes: ["single", "double", "triple"],
    foodIncluded: true,
    foodType: "veg_and_non_veg", // veg_only, veg_and_non_veg, self_cooking
    acAvailable: true,
    totalBeds: 48,
    vacantBeds: 6,
    amenities: [
      "High-Speed Wi-Fi (300 Mbps)",
      "24x7 Power Backup",
      "Daily Housekeeping",
      "Biometric Door Lock",
      "CCTV Surveillance",
      "Fitness Gym",
      "Fully Automatic Laundry",
      "RO Drinking Water",
      "Cafeteria & Lounge",
      "EV Charging Point"
    ],
    houseRules: [
      "Visitor entry allowed in common areas until 9:30 PM",
      "Gate closed from 11:30 PM to 5:30 AM (Biometric emergency override)",
      "Smoking strictly prohibited in rooms and corridors",
      "Quiet hours after 10:30 PM"
    ],
    ownerId: 2,
    ownerName: "Rajesh Verma",
    ownerPhone: "+91 98111 22334"
  },
  {
    id: 2,
    name: "UrbanNest Executive PG for Men",
    tagline: "Walk to IT park, peaceful atmosphere and homestyle meals",
    city: "Pune",
    locality: "Hinjewadi Phase 1",
    address: "Near Blue Ridge IT SEZ, Hinjewadi Phase 1, Pune, Maharashtra 411057",
    genderPolicy: "male",
    startingPrice: 8500,
    depositMonths: 1,
    noticePeriodDays: 30,
    rating: 4.6,
    reviewsCount: 28,
    verified: true,
    coverImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80"
    ],
    roomTypes: ["double", "triple"],
    foodIncluded: true,
    foodType: "veg_and_non_veg",
    acAvailable: true,
    totalBeds: 36,
    vacantBeds: 4,
    amenities: [
      "High-Speed Wi-Fi",
      "24x7 Power Backup",
      "Daily Housekeeping",
      "Biometric Access",
      "CCTV Security",
      "Washing Machine",
      "Two-Wheeler Parking",
      "RO Water"
    ],
    houseRules: [
      "Main gate closure at 11:00 PM",
      "Alcohol/Drugs strictly forbidden",
      "Rent payable by 5th of every month"
    ],
    ownerId: 2,
    ownerName: "Rajesh Verma",
    ownerPhone: "+91 98111 22334"
  },
  {
    id: 3,
    name: "Serene Haven Luxury PG for Women",
    tagline: "3-tier safety, rooftop cafe, gym & organic pure-veg dining",
    city: "Hyderabad",
    locality: "Gachibowli",
    address: "Financial District Road, Gachibowli, Hyderabad, Telangana 500032",
    genderPolicy: "female",
    startingPrice: 10500,
    depositMonths: 2,
    noticePeriodDays: 30,
    rating: 4.92,
    reviewsCount: 56,
    verified: true,
    coverImage: "https://images.unsplash.com/photo-1540518614846-7ede433c4ef5?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1540518614846-7ede433c4ef5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
    ],
    roomTypes: ["single", "double"],
    foodIncluded: true,
    foodType: "veg_only",
    acAvailable: true,
    totalBeds: 40,
    vacantBeds: 3,
    amenities: [
      "High-Speed Wi-Fi",
      "24x7 Lady Warden & Guards",
      "Biometric Access",
      "CCTV on Every Floor",
      "Power Backup",
      "Fitness Gym & Yoga Deck",
      "Housekeeping & Linen",
      "RO Purified Water",
      "Covered 2W & 4W Parking"
    ],
    houseRules: [
      "Strict gate curfew 10:30 PM",
      "Male visitors restricted to ground floor lounge",
      "Prior written intimation required for overnight leaves"
    ],
    ownerId: 2,
    ownerName: "Rajesh Verma",
    ownerPhone: "+91 98111 22334"
  },
  {
    id: 4,
    name: "Silicon Heights Executive Coliving",
    tagline: "Smart living with co-working desks, arcade gaming & gym",
    city: "Gurgaon",
    locality: "Cyber City DLF Phase 2",
    address: "Sector 25, DLF Phase 2, Gurugram, Haryana 122002",
    genderPolicy: "unisex",
    startingPrice: 16000,
    depositMonths: 2,
    noticePeriodDays: 45,
    rating: 4.78,
    reviewsCount: 39,
    verified: true,
    coverImage: "https://images.unsplash.com/photo-1502005229762-ae1b460020e2?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1502005229762-ae1b460020e2?auto=format&fit=crop&w=1200&q=80"
    ],
    roomTypes: ["single", "double"],
    foodIncluded: true,
    foodType: "veg_and_non_veg",
    acAvailable: true,
    totalBeds: 50,
    vacantBeds: 7,
    amenities: [
      "1 Gbps Dedicated Fiber",
      "Coworking Hotdesks & Meeting Pods",
      "PlayStation Gaming Lounge",
      "24x7 Power Backup",
      "Rooftop Cafe",
      "Daily Chef Specials",
      "Gym with Trainer",
      "Valet Parking & EV Charging"
    ],
    houseRules: [
      "Biometric 24/7 entry for residents",
      "Pets allowed with prior approval",
      "Maintain cleanliness in common workspace"
    ],
    ownerId: 2,
    ownerName: "Rajesh Verma",
    ownerPhone: "+91 98111 22334"
  },
  {
    id: 5,
    name: "Royal Palm Coliving Spaces",
    tagline: "Serene beachside vibe with authentic South & North Indian food",
    city: "Chennai",
    locality: "OMR Thoraipakkam",
    address: "Rajiv Gandhi Salai, Thoraipakkam, Chennai, Tamil Nadu 600097",
    genderPolicy: "unisex",
    startingPrice: 9500,
    depositMonths: 1,
    noticePeriodDays: 30,
    rating: 4.55,
    reviewsCount: 22,
    verified: true,
    coverImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80"
    ],
    roomTypes: ["single", "double", "triple"],
    foodIncluded: true,
    foodType: "veg_and_non_veg",
    acAvailable: true,
    totalBeds: 32,
    vacantBeds: 5,
    amenities: [
      "Wi-Fi",
      "Power Backup",
      "Housekeeping",
      "CCTV",
      "Washing Machine",
      "Bike Parking"
    ],
    houseRules: [
      "Quiet hours after 10 PM",
      "Visitors allowed with pass until 8 PM"
    ],
    ownerId: 2,
    ownerName: "Rajesh Verma",
    ownerPhone: "+91 98111 22334"
  },
  {
    id: 6,
    name: "Metro Pods Living",
    tagline: "Pocket-friendly modern rooms 200m from metro station",
    city: "Noida",
    locality: "Sector 62",
    address: "Block B, Industrial Area, Sector 62, Noida, Uttar Pradesh 201301",
    genderPolicy: "male",
    startingPrice: 7800,
    depositMonths: 1,
    noticePeriodDays: 30,
    rating: 4.4,
    reviewsCount: 19,
    verified: true,
    coverImage: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80"
    ],
    roomTypes: ["double", "triple"],
    foodIncluded: true,
    foodType: "veg_only",
    acAvailable: false,
    totalBeds: 28,
    vacantBeds: 8,
    amenities: [
      "Wi-Fi",
      "Power Backup",
      "Daily Cleaning",
      "CCTV",
      "Drinking Water"
    ],
    houseRules: [
      "Gate closed at 11 PM",
      "No smoking"
    ],
    ownerId: 2,
    ownerName: "Rajesh Verma",
    ownerPhone: "+91 98111 22334"
  }
];

export const mockRoomsAndBeds = [
  {
    roomId: 201,
    propertyId: 1,
    roomNumber: "201",
    floor: 2,
    roomType: "single",
    ac: true,
    monthlyRent: 18000,
    beds: [
      { id: "201-A", bedNumber: "A", status: "occupied", tenantName: "Amitabh Sen", tenantPhone: "+91 98222 11001" }
    ]
  },
  {
    roomId: 202,
    propertyId: 1,
    roomNumber: "202",
    floor: 2,
    roomType: "double",
    ac: true,
    monthlyRent: 14000,
    beds: [
      { id: "202-A", bedNumber: "A", status: "occupied", tenantName: "Karan Johal", tenantPhone: "+91 98333 22002" },
      { id: "202-B", bedNumber: "B", status: "vacant", tenantName: null, tenantPhone: null }
    ]
  },
  {
    roomId: 204,
    propertyId: 1,
    roomNumber: "204",
    floor: 2,
    roomType: "double",
    ac: true,
    monthlyRent: 12500,
    beds: [
      { id: "204-A", bedNumber: "A", status: "occupied", tenantName: "Vikram Mehta", tenantPhone: "+91 98444 33003" },
      { id: "204-B", bedNumber: "B", status: "occupied", tenantName: "Rohan Sharma", tenantPhone: "+91 98765 43210" } // Current tenant!
    ]
  },
  {
    roomId: 301,
    propertyId: 1,
    roomNumber: "301",
    floor: 3,
    roomType: "triple",
    ac: true,
    monthlyRent: 10500,
    beds: [
      { id: "301-A", bedNumber: "A", status: "occupied", tenantName: "Nikhil Rao", tenantPhone: "+91 98555 44004" },
      { id: "301-B", bedNumber: "B", status: "vacant", tenantName: null, tenantPhone: null },
      { id: "301-C", bedNumber: "C", status: "vacant", tenantName: null, tenantPhone: null }
    ]
  }
];

export const mockTenantStay = {
  stayId: 101,
  tenantId: 1,
  propertyId: 1,
  propertyName: "GreenLeaf Luxury Coliving & PG",
  propertyAddress: "Plot 88, 17th Main Rd, 4th Block, Koramangala, Bengaluru",
  roomNumber: "204",
  bedNumber: "B",
  roomType: "Double Sharing (AC)",
  moveInDate: "2024-01-15",
  monthlyRent: 12500,
  securityDeposit: 25000,
  depositPaid: true,
  rentDueDate: "5th of every month",
  roommates: [
    {
      name: "Vikram Mehta",
      bed: "A",
      phone: "+91 98444 33003",
      occupation: "Product Designer at FinTech",
      moveInDate: "2023-11-01"
    }
  ],
  wifiDetails: {
    ssid: "GreenLeaf_Residents_5G",
    password: "stay@greenleaf99"
  },
  gatePassId: "GL-KR-204B"
};

export const mockJoinRequests = [
  {
    id: 1,
    tenantId: 1,
    tenantName: "Rohan Sharma",
    tenantPhone: "+91 98765 43210",
    tenantEmail: "rohan.sharma@example.com",
    propertyId: 1,
    propertyName: "GreenLeaf Luxury Coliving & PG",
    roomTypePreference: "double",
    moveInDate: "2024-01-15",
    status: "approved", // pending, approved, rejected
    createdAt: "2024-01-10",
    allocatedRoom: "204",
    allocatedBed: "B",
    notes: "Allocated AC Double Sharing room as requested."
  },
  {
    id: 2,
    tenantId: 104,
    tenantName: "Aditya Chopra",
    tenantPhone: "+91 98222 33445",
    tenantEmail: "aditya.chopra@startup.io",
    propertyId: 1,
    propertyName: "GreenLeaf Luxury Coliving & PG",
    roomTypePreference: "single",
    moveInDate: "2024-11-01",
    status: "pending",
    createdAt: "2024-10-10",
    allocatedRoom: null,
    allocatedBed: null,
    notes: "Requires single room facing the quiet garden side."
  },
  {
    id: 3,
    tenantId: 105,
    tenantName: "Sneha Reddy",
    tenantPhone: "+91 98333 44556",
    tenantEmail: "sneha.reddy@consultancy.com",
    propertyId: 1,
    propertyName: "GreenLeaf Luxury Coliving & PG",
    roomTypePreference: "double",
    moveInDate: "2024-10-25",
    status: "pending",
    createdAt: "2024-10-11",
    allocatedRoom: null,
    allocatedBed: null,
    notes: "Prefers non-smoking roommate."
  }
];

export const mockPayments = [
  {
    id: "INV-2024-10",
    tenantId: 1,
    tenantName: "Rohan Sharma",
    propertyId: 1,
    month: "October 2024",
    amount: 12500,
    breakdown: {
      rent: 11500,
      maintenance: 1000
    },
    dueDate: "2024-10-05",
    paidDate: "2024-10-04",
    status: "paid", // paid, pending, under_review
    paymentMethod: "UPI (Google Pay)",
    transactionRef: "UPI/428901239822",
    receiptId: "REC-2024-10-098"
  },
  {
    id: "INV-2024-09",
    tenantId: 1,
    tenantName: "Rohan Sharma",
    propertyId: 1,
    month: "September 2024",
    amount: 12500,
    breakdown: {
      rent: 11500,
      maintenance: 1000
    },
    dueDate: "2024-09-05",
    paidDate: "2024-09-03",
    status: "paid",
    paymentMethod: "Net Banking",
    transactionRef: "TXN8899220011",
    receiptId: "REC-2024-09-044"
  },
  {
    id: "INV-2024-11",
    tenantId: 1,
    tenantName: "Rohan Sharma",
    propertyId: 1,
    month: "November 2024",
    amount: 12500,
    breakdown: {
      rent: 11500,
      maintenance: 1000
    },
    dueDate: "2024-11-05",
    paidDate: null,
    status: "pending",
    paymentMethod: null,
    transactionRef: null,
    receiptId: null
  }
];

export const mockVehicles = [
  {
    id: 1,
    tenantId: 1,
    propertyId: 1,
    vehicleType: "two_wheeler", // two_wheeler, four_wheeler
    vehicleMake: "Royal Enfield Hunter 350",
    plateNumber: "KA-01-MJ-4029",
    parkingSlot: "B-12",
    passNumber: "PASS-2W-012",
    registrationDate: "2024-01-16",
    status: "active"
  }
];

export const mockComplaints = [
  {
    id: "CMP-104",
    tenantId: 1,
    tenantName: "Rohan Sharma",
    roomNumber: "204",
    category: "plumbing", // plumbing, electrical, wifi, food, housekeeping, other
    title: "Bathroom mixer tap leakage",
    description: "The hot water mixer tap in room 204 bathroom is continuously dripping since yesterday.",
    priority: "medium", // low, medium, high, urgent
    status: "in_progress", // open, in_progress, resolved
    createdAt: "2024-10-10 09:30",
    updatedAt: "2024-10-11 14:00",
    ownerRemark: "Plumber Ramesh assigned. Scheduled visit today at 4:30 PM."
  },
  {
    id: "CMP-098",
    tenantId: 1,
    tenantName: "Rohan Sharma",
    roomNumber: "204",
    category: "wifi",
    title: "Wi-Fi intermittent drops on 2nd floor",
    description: "5GHz access point keeps disconnecting during afternoon work hours.",
    priority: "high",
    status: "resolved",
    createdAt: "2024-09-18 11:15",
    updatedAt: "2024-09-19 16:30",
    ownerRemark: "Access point firmware updated and channel frequency recalibrated."
  }
];

export const mockNotifications = [
  {
    id: 1,
    userId: 1,
    title: "Rent Reminder",
    message: "Rent invoice for November 2024 (₹12,500) has been generated. Due by 5th Nov.",
    type: "payment",
    time: "2 hours ago",
    read: false
  },
  {
    id: 2,
    userId: 1,
    title: "Complaint Update",
    message: "Ticket CMP-104 status moved to 'In Progress'. Technician assigned.",
    type: "complaint",
    time: "1 day ago",
    read: false
  },
  {
    id: 3,
    userId: 1,
    title: "Society Maintenance Notice",
    message: "Water tank cleaning scheduled this Saturday from 10:00 AM to 1:00 PM.",
    type: "announcement",
    time: "3 days ago",
    read: true
  }
];

export const mockReviews = [
  {
    id: 1,
    propertyId: 1,
    authorName: "Ananya Iyer",
    rating: 5,
    date: "September 2024",
    comment: "Hands down the best coliving in Koramangala! High speed internet is truly dependable for WFH, and the daily breakfast & dinner buffet is hygienic and fresh."
  },
  {
    id: 2,
    propertyId: 1,
    authorName: "Karthik Verma",
    rating: 4.5,
    date: "August 2024",
    comment: "Rooms are spacious, biometrics make it feel very safe, and any maintenance issue gets attended to within 24 hours through the portal."
  }
];
