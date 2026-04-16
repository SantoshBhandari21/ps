// src/data/mockData.js

// Mock users data
export const mockUsers = [
  {
    id: 1,
    name: "John Smith",
    email: "john@example.com",
    type: "owner",
    phone: "+1234567890",
    avatar: "https://via.placeholder.com/100",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    type: "tenant",
    phone: "+1234567891",
    avatar: "https://via.placeholder.com/100",
  },
];

// Mock rooms data
export const mockRooms = [
  {
    id: 1,
    title: "Cozy Studio Apartment",
    description: "A beautiful studio apartment in the heart of downtown.",
    price: 800,
    location: "Downtown",
    address: "123 Main St, City Center",
    bedrooms: 1,
    bathrooms: 1,
    area: 450,
    amenities: ["WiFi", "Air Conditioning", "Furnished", "Parking"],
    ownerId: 1,
    available: true,
    datePosted: "2024-09-15",
    contactInfo: {
      phone: "+1234567890",
      email: "john@example.com",
    },
  },
  {
    id: 2,
    title: "Spacious 2BR Apartment",
    description: "Modern 2-bedroom apartment with great city views.",
    price: 1200,
    location: "Midtown",
    address: "456 Oak Ave, Midtown District",
    bedrooms: 2,
    bathrooms: 2,
    area: 850,
    amenities: ["WiFi", "Dishwasher", "Laundry", "Balcony", "Gym Access"],
    ownerId: 1,
    available: true,
    datePosted: "2024-09-10",
    contactInfo: {
      phone: "+1234567890",
      email: "john@example.com",
    },
  },
  {
    id: 3,
    title: "Affordable Single Room",
    description:
      "Budget-friendly single room in a shared house. Includes utilities.",
    price: 500,
    location: "University District",
    address: "789 College Rd, Near Campus",
    bedrooms: 1,
    bathrooms: 1,
    area: 200,
    amenities: ["WiFi", "Shared Kitchen", "Study Area", "Close to Campus"],
    ownerId: 1,
    available: true,
    datePosted: "2024-09-20",
    contactInfo: {
      phone: "+1234567890",
      email: "john@example.com",
    },
  },
];
