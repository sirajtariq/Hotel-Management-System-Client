export type RoomStatus = 'Available' | 'Occupied' | 'Reserved' | 'Cleaning' | 'Maintenance';
export type CleaningStatus = 'Clean' | 'Dirty' | 'In Progress' | 'Inspected';
export type ReservationStatus = 'Reserved' | 'Checked In' | 'Checked Out' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Partial' | 'Paid';
export type PaymentMethod = 'Cash' | 'Card' | 'Bank' | 'Other';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface RoomType {
  id: string;
  name: string;
  code: string;
  description: string;
  basePrice: number;
  capacity: number;
  maxExtraGuests: number;
  extraGuestRate: number;
  totalRoomsCount: number;
  bedType: string;
  amenities: string[];
}

export interface Room {
  id: string;
  number: string;
  propertyId?: string;
  propertyName?: string;
  roomTypeId: string;
  roomTypeName: string;
  floor: number;
  status: RoomStatus;
  cleaningStatus: CleaningStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  lastCleaned?: string;
  currentReservationId?: string;
  currentGuestName?: string;
  pricePerNight: number;
}

export interface Guest {
  id: string;
  name: string;
  phone: string;
  email: string;
  idCardOrPassport: string;
  address: string;
  vipStatus: boolean;
  previousStaysCount: number;
  totalSpent: number;
  notes?: string;
  createdAt: string;
}

export interface Reservation {
  id: string;
  reservationNumber: string;
  propertyId?: string;
  propertyName?: string;
  guestId: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  guestIdNumber?: string;
  guestAddress?: string;
  roomTypeId: string;
  roomTypeName: string;
  roomId?: string;
  roomNumber?: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guestsCount: number;
  adultCount: number;
  childCount: number;
  ratePerNight: number;
  totalRoomCharges: number;
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  source: 'Direct Walk-in' | 'Online' | 'Phone' | 'Corporate' | 'Travel Agent';
  notes?: string;
  createdAt: string;
  checkedInAt?: string;
  checkedOutAt?: string;
}

export interface FolioCharge {
  id: string;
  reservationId: string;
  guestId: string;
  roomId?: string;
  description: string;
  category: 'Room' | 'Restaurant' | 'Room Service' | 'Laundry' | 'Minibar' | 'Spa' | 'Other';
  amount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  date: string;
  referenceId?: string;
}

export interface PaymentRecord {
  id: string;
  receiptNumber: string;
  reservationId: string;
  invoiceId?: string;
  guestId: string;
  guestName: string;
  amount: number;
  method: PaymentMethod;
  referenceNumber?: string;
  date: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  reservationId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestAddress?: string;
  roomNumber?: string;
  roomTypeName?: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  charges: FolioCharge[];
  payments: PaymentRecord[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxRatePercent: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;
  status: 'Draft' | 'Paid' | 'Partial' | 'Refunded';
  issuedAt: string;
  dueDate: string;
  notes?: string;
}

export interface RefundRecord {
  id: string;
  paymentId: string;
  reservationId: string;
  guestName: string;
  amount: number;
  reason: string;
  date: string;
  processedBy: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'Breakfast' | 'Appetizers' | 'Main Course' | 'Beverages' | 'Desserts' | 'Snacks';
  price: number;
  taxPercent: number;
  status: 'Available' | 'Out of Stock';
  prepTimeMinutes: number;
  description?: string;
}

export interface RestaurantTable {
  id: string;
  tableNumber: string;
  capacity: number;
  status: 'Available' | 'Occupied' | 'Reserved';
  currentOrderId?: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface FoodOrder {
  id: string;
  orderNumber: string;
  orderType: 'Dine-in' | 'Room Service' | 'Takeaway';
  tableId?: string;
  tableNumber?: string;
  roomId?: string;
  roomNumber?: string;
  guestId?: string;
  guestName?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  status: 'Pending' | 'In Kitchen' | 'Ready' | 'Served' | 'Billed' | 'Charged to Room';
  kotGenerated: boolean;
  kotNumber?: string;
  createdAt: string;
  paymentMethod?: PaymentMethod | 'Room Charge';
}

export interface InventoryCategory {
  id: string;
  name: string;
  description: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  unit: 'kg' | 'pcs' | 'liters' | 'bottles' | 'packs' | 'boxes' | 'sets';
  purchasePrice: number;
  currentStock: number;
  minStock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  supplierId: string;
  supplierName: string;
  lastRestocked?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  categoriesSupplied: string[];
}

export interface PurchaseItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDate: string;
  items: PurchaseItem[];
  totalAmount: number;
  status: 'Ordered' | 'Received' | 'Cancelled';
  receivedDate?: string;
  notes?: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'Stock In' | 'Stock Out' | 'Adjustment';
  quantity: number;
  unit: string;
  referenceType: 'Purchase Order' | 'Room Housekeeping' | 'Restaurant Kitchen' | 'Damaged/Loss' | 'Manual Count';
  date: string;
  recordedBy: string;
  notes?: string;
}

export interface MaintenanceRequest {
  id: string;
  ticketNumber: string;
  roomNumber: string;
  areaOrFacility: string;
  issue: string;
  priority: PriorityLevel;
  status: 'Reported' | 'In Progress' | 'Resolved' | 'Cancelled';
  reportedBy: string;
  assignedTo?: string;
  reportedAt: string;
  resolvedAt?: string;
  cost?: number;
  notes?: string;
}

export interface LostAndFoundItem {
  id: string;
  item: string;
  roomNumberOrLocation: string;
  foundDate: string;
  description: string;
  foundBy: string;
  claimedBy?: string;
  status: 'In Storage' | 'Claimed' | 'Disposed';
  contactPhone?: string;
  notes?: string;
}

export interface Department {
  id: string;
  name: string;
  headOfDepartment: string;
  totalStaff: number;
}

export interface WorkShift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  description: string;
}

export type StaffRole =
  | 'Manager'
  | 'Housekeeper'
  | 'Guard'
  | 'Cook'
  | 'Maintenance / Technician'
  | 'Caretaker'
  | 'Front Desk'
  | 'Driver'
  | 'Other';

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  phone: string; // Mobile contact
  cnic?: string; // National ID / CNIC (e.g. 35201-1234567-1)
  role?: StaffRole; // Manager, Housekeeper, Guard, Cook, etc.
  propertyId?: string; // Assigned Property / Ghar
  propertyName?: string; // Assigned Property Name
  departmentId?: string;
  departmentName?: string;
  designation?: string;
  email?: string;
  joiningDate: string;
  salary: number; // Fixed monthly salary
  shiftId?: string;
  shiftName?: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  notes?: string;
  emergencyContact?: string;
  lastSalaryPaidMonth?: string; // e.g. "2026-08"
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  clockIn?: string;
  clockOut?: string;
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  leaveType: 'Annual' | 'Sick' | 'Casual' | 'Emergency';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
}

export interface CompanyProfile {
  companyName: string;
  logoText: string;
  taxIdNumber: string;
  registrationNumber: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

export type PropertyFieldCategory =
  | 'General & Identity'
  | 'Location & Address'
  | 'Contact & Channels'
  | 'Operations & Timings'
  | 'Tax & Fiscal'
  | 'Guest Services & Info';

export type PropertyFieldKey =
  | 'hotelName'
  | 'propertyCode'
  | 'propertyType'
  | 'starRating'
  | 'status'
  | 'totalRooms'
  | 'totalFloors'
  | 'address'
  | 'city'
  | 'stateCountry'
  | 'phone'
  | 'email'
  | 'website'
  | 'taxRegistrationId'
  | 'checkInTime'
  | 'checkOutTime'
  | 'currency'
  | 'amenities'
  | 'description'
  | 'emergencyContact'
  | 'cancellationPolicy'
  | 'wifiNetwork'
  | 'parkingInfo'
  | 'airportDistance'
  | 'managerOnDuty'
  | 'bankAccountDetails';

export interface PropertyFieldConfig {
  id: PropertyFieldKey;
  label: string;
  category: PropertyFieldCategory;
  description: string;
  iconName: string;
  visible: boolean;
  required?: boolean;
}

export interface HotelProperty {
  id: string;
  hotelName: string;
  propertyCode: string;
  propertyType?: string;
  starRating: number;
  totalRooms?: number;
  totalFloors?: number;
  address: string;
  city?: string;
  stateCountry?: string;
  phone: string;
  email: string;
  website?: string;
  taxRegistrationId?: string;
  checkInTime: string;
  checkOutTime: string;
  currencySymbol: string;
  currencyCode: string;
  status?: 'Operational' | 'Renovation' | 'Opening Soon';
  isMainProperty?: boolean;
  amenities?: string[];
  description?: string;
  emergencyContact?: string;
  cancellationPolicy?: string;
  wifiNetwork?: string;
  parkingInfo?: string;
  airportDistance?: string;
  managerOnDuty?: string;
  bankAccountDetails?: string;
  customFields?: Record<string, string>;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  contact: string;
  isMainBranch: boolean;
}

export type UserRole =
  | 'Owner / Super Admin'
  | 'Property Manager / Caretaker'
  | 'Admin'
  | 'Manager'
  | 'Front Desk'
  | 'Cashier'
  | 'Housekeeping';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  lastLogin: string;
  assignedPropertyId?: string; // Assigned House / Property ID (for Manager / Caretaker)
  assignedPropertyName?: string; // Assigned House / Property Name
  phone?: string;
  avatar?: string;
}

export interface TaxSetting {
  id: string;
  name: string;
  ratePercent: number;
  code: string;
  isActive: boolean;
  description: string;
}

export interface GeneralSettings {
  dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
  timeFormat: '12-hour' | '24-hour';
  defaultCurrency: string;
  currencySymbol: string;
  language: string;
  allowNegativeStock: boolean;
  defaultTaxId: string;
  invoicePrefix: string;
  receiptPrefix: string;
  kotPrefix: string;
  serviceChargePercent: number;
}

export type ExpenseCategory =
  | 'Utilities'
  | 'Maintenance'
  | 'Cleaning Supplies'
  | 'House Rent'
  | 'Linen & Bedding'
  | 'Groceries & Kitchen'
  | 'Fuel & Generator'
  | 'Staff & Wages'
  | 'Miscellaneous';

export type ExpensePaymentMethod =
  | 'Cash'
  | 'Bank Transfer / Online'
  | 'Card'
  | 'Petty Cash'
  | 'Cheque';

export interface ExpenseRecord {
  id: string;
  expenseNumber: string;
  date: string;
  propertyId: string;
  propertyName: string;
  itemDescription: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  category: ExpenseCategory;
  vendorName: string;
  vendorPhone?: string;
  vendorContact?: string;
  vendorAddress?: string;
  amount: number;
  paymentMethod: ExpensePaymentMethod;
  paymentStatus?: 'Paid' | 'Pending / Due' | 'Reimbursed';
  receiptImageUrl?: string;
  receiptImageName?: string;
  notes?: string;
  billInvoiceNumber?: string;
  recordedBy?: string;
  paidBy?: string;
  isReconciled?: boolean;
  createdAt: string;
}
