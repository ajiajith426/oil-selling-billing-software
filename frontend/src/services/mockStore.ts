import { Category, SubCategory, Product, Customer, Supplier, Sale, Purchase, StockMovement, Settings, User, Vehicle, VehicleExpense, Staff, SalaryPayment } from '@/types';

// ── Seed version: bump this to wipe localStorage and reload fresh seed data ──
const SEED_VERSION = 'v3-vehicle-staff';

const storedVersion = localStorage.getItem('mock_seed_version');
if (storedVersion !== SEED_VERSION) {
  // Clear all previous mock data keys
  Object.keys(localStorage)
    .filter(k => k.startsWith('mock_'))
    .forEach(k => localStorage.removeItem(k));
  localStorage.setItem('mock_seed_version', SEED_VERSION);
}

// Helper to load/save from localStorage
const getLocal = <T>(key: string, initial: T): T => {
  const data = localStorage.getItem(`mock_${key}`);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return initial;
    }
  }
  localStorage.setItem(`mock_${key}`, JSON.stringify(initial));
  return initial;
};

const setLocal = <T>(key: string, val: T) => {
  localStorage.setItem(`mock_${key}`, JSON.stringify(val));
};

// Initial Data
const initialCategories: Category[] = [
  { id: 1, name: 'Edible Oil',       description: 'Cooking & edible oils — groundnut, sunflower, palm, coconut, etc.', is_active: true, created_at: new Date().toISOString() },
  { id: 2, name: 'Masala & Spices',  description: 'Whole spices, ground masala powders & blended masalas', is_active: true, created_at: new Date().toISOString() },
  { id: 3, name: 'Rice & Grains',    description: 'Basmati, raw rice, toor dal, chana dal & other grains', is_active: true, created_at: new Date().toISOString() },
  { id: 4, name: 'Flour & Rava',     description: 'Wheat flour, maida, besan, rava & semolina products', is_active: true, created_at: new Date().toISOString() },
  { id: 5, name: 'Sugar & Salt',     description: 'Sugar, jaggery, rock salt & iodised salt', is_active: true, created_at: new Date().toISOString() },
  { id: 6, name: 'Pulses & Dals',    description: 'Toor dal, moong dal, urad dal, chana dal, masoor dal', is_active: true, created_at: new Date().toISOString() },
  { id: 7, name: 'Dry Fruits & Nuts','description': 'Cashew, almonds, raisins, dates & mixed dry fruits', is_active: true, created_at: new Date().toISOString() },
  { id: 8, name: 'Beverages',        description: 'Tea, coffee, health drinks & juices', is_active: true, created_at: new Date().toISOString() },
];

const initialSubCategories: SubCategory[] = [
  // Edible Oil
  { id: 1,  name: 'Groundnut Oil',   category_id: 1, category_name: 'Edible Oil',      description: 'Cold-pressed & refined groundnut oil', is_active: true, created_at: new Date().toISOString() },
  { id: 2,  name: 'Sunflower Oil',   category_id: 1, category_name: 'Edible Oil',      description: 'Refined sunflower cooking oil', is_active: true, created_at: new Date().toISOString() },
  { id: 3,  name: 'Palm Oil',        category_id: 1, category_name: 'Edible Oil',      description: 'Refined palm oil for cooking & frying', is_active: true, created_at: new Date().toISOString() },
  { id: 4,  name: 'Coconut Oil',     category_id: 1, category_name: 'Edible Oil',      description: 'Pure coconut oil', is_active: true, created_at: new Date().toISOString() },
  // Masala & Spices
  { id: 5,  name: 'Whole Spices',    category_id: 2, category_name: 'Masala & Spices', description: 'Whole pepper, cloves, cardamom, cinnamon', is_active: true, created_at: new Date().toISOString() },
  { id: 6,  name: 'Ground Powders',  category_id: 2, category_name: 'Masala & Spices', description: 'Chilli, coriander, turmeric, cumin powder', is_active: true, created_at: new Date().toISOString() },
  { id: 7,  name: 'Blended Masalas', category_id: 2, category_name: 'Masala & Spices', description: 'Sambar, biryani, garam masala blends', is_active: true, created_at: new Date().toISOString() },
  // Rice & Grains
  { id: 8,  name: 'Basmati Rice',    category_id: 3, category_name: 'Rice & Grains',   description: 'Long-grain premium basmati rice', is_active: true, created_at: new Date().toISOString() },
  { id: 9,  name: 'Raw Rice',        category_id: 3, category_name: 'Rice & Grains',   description: 'Ponni & sona masoori raw rice', is_active: true, created_at: new Date().toISOString() },
  // Flour & Rava
  { id: 10, name: 'Wheat Products',  category_id: 4, category_name: 'Flour & Rava',    description: 'Atta, maida, sooji', is_active: true, created_at: new Date().toISOString() },
  { id: 11, name: 'Gram Flour',      category_id: 4, category_name: 'Flour & Rava',    description: 'Besan & chickpea flour', is_active: true, created_at: new Date().toISOString() },
  // Pulses
  { id: 12, name: 'Toor / Arhar Dal',category_id: 6, category_name: 'Pulses & Dals',   description: 'Toor dal varieties', is_active: true, created_at: new Date().toISOString() },
  { id: 13, name: 'Moong Dal',       category_id: 6, category_name: 'Pulses & Dals',   description: 'Yellow & green moong dal', is_active: true, created_at: new Date().toISOString() },
];

const initialProducts: Product[] = [
  // ── Edible Oils ──────────────────────────────────────────────────────────
  { id: 1,  name: 'Fortune Groundnut Oil 15 kg',  category_id: 1, subcategory_id: 1, category_name: 'Edible Oil', subcategory_name: 'Groundnut Oil',  sku: 'MJA-OIL-GND-15', barcode: '8901030860018', purchase_price: 1980, selling_price: 2150, gst_percent: 5, unit: 'Kg',  current_stock: 50,  minimum_stock: 10, brand: 'Fortune',  description: 'Fortune refined groundnut oil 15 kg tin',      is_active: true, created_at: new Date().toISOString() },
  { id: 2,  name: 'Sundrop Sunflower Oil 15 L',   category_id: 1, subcategory_id: 2, category_name: 'Edible Oil', subcategory_name: 'Sunflower Oil',   sku: 'MJA-OIL-SUN-15', barcode: '8901030580059', purchase_price: 1750, selling_price: 1920, gst_percent: 5, unit: 'Litre', current_stock: 60,  minimum_stock: 15, brand: 'Sundrop',  description: 'Refined sunflower oil 15 litre jerry can',      is_active: true, created_at: new Date().toISOString() },
  { id: 3,  name: 'Gemini Sunflower Oil 1 L',     category_id: 1, subcategory_id: 2, category_name: 'Edible Oil', subcategory_name: 'Sunflower Oil',   sku: 'MJA-OIL-SUN-1',  barcode: '8901030911001', purchase_price:  130, selling_price:  148, gst_percent: 5, unit: 'Litre', current_stock: 200, minimum_stock: 50, brand: 'Gemini',   description: 'Gemini sunflower refined oil 1 litre pouch',   is_active: true, created_at: new Date().toISOString() },
  { id: 4,  name: 'KLF Coconad Coconut Oil 1 L',  category_id: 1, subcategory_id: 4, category_name: 'Edible Oil', subcategory_name: 'Coconut Oil',     sku: 'MJA-OIL-COC-1',  barcode: '8901063101016', purchase_price:  195, selling_price:  225, gst_percent: 5, unit: 'Litre', current_stock: 80,  minimum_stock: 20, brand: 'KLF',      description: 'Pure coconut oil 1 litre bottle',              is_active: true, created_at: new Date().toISOString() },
  { id: 5,  name: 'Ruchi Gold Palm Oil 15 kg',    category_id: 1, subcategory_id: 3, category_name: 'Edible Oil', subcategory_name: 'Palm Oil',        sku: 'MJA-OIL-PLM-15', barcode: '8901030850194', purchase_price: 1420, selling_price: 1560, gst_percent: 5, unit: 'Kg',  current_stock: 3,   minimum_stock: 10, brand: 'Ruchi Gold','description': 'Refined palm oil 15 kg tin',                 is_active: true, created_at: new Date().toISOString() },
  // ── Masala & Spices ───────────────────────────────────────────────────────
  { id: 6,  name: 'Aachi Sambar Masala 500 g',    category_id: 2, subcategory_id: 7, category_name: 'Masala & Spices', subcategory_name: 'Blended Masalas', sku: 'MJA-MSL-SAM-500', barcode: '8906008300011', purchase_price:  72,  selling_price:  88,  gst_percent: 5, unit: 'Pcs', current_stock: 150, minimum_stock: 30, brand: 'Aachi',    description: 'Aachi sambar masala powder 500 g packet',      is_active: true, created_at: new Date().toISOString() },
  { id: 7,  name: 'MDH Garam Masala 100 g',       category_id: 2, subcategory_id: 7, category_name: 'Masala & Spices', subcategory_name: 'Blended Masalas', sku: 'MJA-MSL-GAR-100', barcode: '8904109100057', purchase_price:  52,  selling_price:  65,  gst_percent: 5, unit: 'Pcs', current_stock: 100, minimum_stock: 20, brand: 'MDH',      description: 'MDH garam masala 100 g packet',                is_active: true, created_at: new Date().toISOString() },
  { id: 8,  name: 'Aachi Chilli Powder 500 g',    category_id: 2, subcategory_id: 6, category_name: 'Masala & Spices', subcategory_name: 'Ground Powders',  sku: 'MJA-MSL-CHI-500', barcode: '8906008100017', purchase_price:  68,  selling_price:  82,  gst_percent: 5, unit: 'Pcs', current_stock: 120, minimum_stock: 25, brand: 'Aachi',    description: 'Aachi red chilli powder 500 g',                is_active: true, created_at: new Date().toISOString() },
  { id: 9,  name: 'Eastern Turmeric Powder 500 g',category_id: 2, subcategory_id: 6, category_name: 'Masala & Spices', subcategory_name: 'Ground Powders',  sku: 'MJA-MSL-TUR-500', barcode: '8901040500056', purchase_price:  55,  selling_price:  70,  gst_percent: 5, unit: 'Pcs', current_stock: 80,  minimum_stock: 20, brand: 'Eastern',  description: 'Pure turmeric powder 500 g packet',            is_active: true, created_at: new Date().toISOString() },
  { id: 10, name: 'Whole Black Pepper 100 g',     category_id: 2, subcategory_id: 5, category_name: 'Masala & Spices', subcategory_name: 'Whole Spices',    sku: 'MJA-MSL-PEP-100', barcode: '8901040100024', purchase_price:  80,  selling_price:  98,  gst_percent: 5, unit: 'Pcs', current_stock: 2,   minimum_stock: 15, brand: 'MJA',      description: 'Whole black pepper 100 g pouch',               is_active: true, created_at: new Date().toISOString() },
  // ── Rice & Grains ─────────────────────────────────────────────────────────
  { id: 11, name: 'India Gate Basmati Rice 5 kg', category_id: 3, subcategory_id: 8, category_name: 'Rice & Grains',  subcategory_name: 'Basmati Rice',    sku: 'MJA-RCE-BAS-5',  barcode: '8901012001510', purchase_price: 485,  selling_price: 560,  gst_percent: 5, unit: 'Kg',  current_stock: 40,  minimum_stock: 10, brand: 'India Gate','description': 'India Gate classic basmati rice 5 kg bag',  is_active: true, created_at: new Date().toISOString() },
  { id: 12, name: 'Ponni Raw Rice 25 kg',         category_id: 3, subcategory_id: 9, category_name: 'Rice & Grains',  subcategory_name: 'Raw Rice',        sku: 'MJA-RCE-PON-25', barcode: '8902050250001', purchase_price: 1050, selling_price: 1180, gst_percent: 5, unit: 'Kg',  current_stock: 30,  minimum_stock: 8,  brand: 'Local',    description: 'Premium ponni boiled rice 25 kg sack',         is_active: true, created_at: new Date().toISOString() },
  // ── Flour & Rava ──────────────────────────────────────────────────────────
  { id: 13, name: 'Aashirvaad Atta 10 kg',        category_id: 4, subcategory_id: 10, category_name: 'Flour & Rava', subcategory_name: 'Wheat Products',  sku: 'MJA-FLR-ATT-10', barcode: '8901725122309', purchase_price: 370,  selling_price: 420,  gst_percent: 5, unit: 'Kg',  current_stock: 45,  minimum_stock: 10, brand: 'Aashirvaad','description': 'Whole wheat atta 10 kg bag',                is_active: true, created_at: new Date().toISOString() },
  { id: 14, name: 'MTR Besan 500 g',              category_id: 4, subcategory_id: 11, category_name: 'Flour & Rava', subcategory_name: 'Gram Flour',      sku: 'MJA-FLR-BSN-500',barcode: '8901018502001', purchase_price:  44,  selling_price:  55,  gst_percent: 5, unit: 'Pcs', current_stock: 60,  minimum_stock: 15, brand: 'MTR',      description: 'MTR besan 500 g packet',                       is_active: true, created_at: new Date().toISOString() },
  // ── Sugar & Salt ──────────────────────────────────────────────────────────
  { id: 15, name: 'Tata Sugar 1 kg',              category_id: 5, category_name: 'Sugar & Salt', sku: 'MJA-SUG-TAT-1',  barcode: '8901800002010', purchase_price:  44,  selling_price:  50,  gst_percent: 0, unit: 'Kg',  current_stock: 200, minimum_stock: 50, brand: 'Tata',     description: 'Tata refined sugar 1 kg pack',                 is_active: true, created_at: new Date().toISOString() },
  { id: 16, name: 'Tata Salt 1 kg',               category_id: 5, category_name: 'Sugar & Salt', sku: 'MJA-SLT-TAT-1',  barcode: '8901800009101', purchase_price:  20,  selling_price:  24,  gst_percent: 0, unit: 'Kg',  current_stock: 4,   minimum_stock: 50, brand: 'Tata',     description: 'Tata iodised salt 1 kg pack',                  is_active: true, created_at: new Date().toISOString() },
  // ── Pulses & Dals ─────────────────────────────────────────────────────────
  { id: 17, name: 'Toor Dal 25 kg',               category_id: 6, subcategory_id: 12, category_name: 'Pulses & Dals', subcategory_name: 'Toor / Arhar Dal', sku: 'MJA-DAL-TOR-25', barcode: '8901800025013', purchase_price: 2100, selling_price: 2380, gst_percent: 5, unit: 'Kg',  current_stock: 20,  minimum_stock: 5,  brand: 'Local',    description: 'Premium toor dal 25 kg sack',                  is_active: true, created_at: new Date().toISOString() },
  { id: 18, name: 'Moong Dal 1 kg',               category_id: 6, subcategory_id: 13, category_name: 'Pulses & Dals', subcategory_name: 'Moong Dal',        sku: 'MJA-DAL-MOG-1',  barcode: '8901800013001', purchase_price:  95,  selling_price: 112,  gst_percent: 5, unit: 'Kg',  current_stock: 50,  minimum_stock: 15, brand: 'Local',    description: 'Yellow moong dal 1 kg packet',                 is_active: true, created_at: new Date().toISOString() },
  // ── Dry Fruits ────────────────────────────────────────────────────────────
  { id: 19, name: 'Cashew W240 500 g',            category_id: 7, category_name: 'Dry Fruits & Nuts', sku: 'MJA-DRY-CSH-500', barcode: '8905010050014', purchase_price: 360,  selling_price: 430,  gst_percent: 5, unit: 'Pcs', current_stock: 25,  minimum_stock: 8,  brand: 'MJA',      description: 'Premium W240 cashew nuts 500 g pouch',         is_active: true, created_at: new Date().toISOString() },
  { id: 20, name: 'California Almonds 250 g',     category_id: 7, category_name: 'Dry Fruits & Nuts', sku: 'MJA-DRY-ALM-250', barcode: '8905010025015', purchase_price: 220,  selling_price: 270,  gst_percent: 5, unit: 'Pcs', current_stock: 30,  minimum_stock: 10, brand: 'MJA',      description: 'Raw California almonds 250 g pouch',           is_active: true, created_at: new Date().toISOString() },
  // ── Beverages ─────────────────────────────────────────────────────────────
  { id: 21, name: 'Brooke Bond Red Label Tea 1 kg',category_id: 8, category_name: 'Beverages', sku: 'MJA-BEV-TEA-1',  barcode: '8901030502551', purchase_price: 310,  selling_price: 360,  gst_percent: 5, unit: 'Pcs', current_stock: 55,  minimum_stock: 12, brand: 'Brooke Bond','description': 'Red Label tea 1 kg pack',                   is_active: true, created_at: new Date().toISOString() },
  { id: 22, name: 'Bru Instant Coffee 200 g',     category_id: 8, category_name: 'Beverages', sku: 'MJA-BEV-COF-200', barcode: '8901030401900', purchase_price: 195,  selling_price: 230,  gst_percent: 5, unit: 'Pcs', current_stock: 3,   minimum_stock: 10, brand: 'Bru',      description: 'Bru instant coffee 200 g jar',                is_active: true, created_at: new Date().toISOString() },
];

const initialCustomers: Customer[] = [
  { id: 1, name: 'Murugan Provision Store',  mobile: '9876543210', email: 'murugan@example.com', gst_number: '33AAAAA1111A1Z1', address: '14, Anna Nagar', city: 'Madurai',    state: 'Tamil Nadu', pincode: '625020', created_at: new Date().toISOString() },
  { id: 2, name: 'Rajan Super Market',       mobile: '9123456789', email: 'rajan@example.com',   gst_number: '33BBBBB2222B2Z2', address: '7, Main Road',   city: 'Dindigul',   state: 'Tamil Nadu', pincode: '624001', created_at: new Date().toISOString() },
  { id: 3, name: 'Selvi Kirana Shop',        mobile: '9444012345', email: '',                    gst_number: '',               address: '3, Weli Street', city: 'Madurai',    state: 'Tamil Nadu', pincode: '625001', created_at: new Date().toISOString() },
  { id: 4, name: 'Vel Wholesale Traders',    mobile: '9500123456', email: 'vel@example.com',     gst_number: '33CCCCC3333C3Z3', address: '22, KK Nagar',   city: 'Madurai',    state: 'Tamil Nadu', pincode: '625020', created_at: new Date().toISOString() },
  { id: 5, name: 'Lakshmi General Stores',   mobile: '9655432100', email: '',                    gst_number: '',               address: '8, East Veli',   city: 'Virudhunagar', state: 'Tamil Nadu', pincode: '626001', created_at: new Date().toISOString() },
];

const initialSuppliers: Supplier[] = [
  { id: 1, name: 'Fortune Foods Distributors',  mobile: '9000100020', email: 'fortune@example.com',  gst_number: '27AAAAA3333A1Z3', address: '12, APMC Yard',      city: 'Chennai',   state: 'Tamil Nadu',  pincode: '600001', created_at: new Date().toISOString() },
  { id: 2, name: 'Aachi Masala Wholesale',      mobile: '9888877777', email: 'aachi@example.com',    gst_number: '33DDDDD4444D4Z4', address: '5, Industrial Area', city: 'Chennai',   state: 'Tamil Nadu',  pincode: '600096', created_at: new Date().toISOString() },
  { id: 3, name: 'Sri Murugan Rice Mill',       mobile: '9444556677', email: 'muruganmill@example.com', gst_number: '33EEEEE5555E5Z5', address: '34, Mill Road',    city: 'Dindigul',  state: 'Tamil Nadu',  pincode: '624003', created_at: new Date().toISOString() },
  { id: 4, name: 'Tata Consumer Products Ltd',  mobile: '9001122334', email: 'tata@example.com',     gst_number: '27FFFFF6666F6Z6', address: 'Worli',              city: 'Mumbai',    state: 'Maharashtra', pincode: '400018', created_at: new Date().toISOString() },
];

const initialSettings: Settings = {
  id: 1,
  company_name: 'MJ Agency',
  gst_number: '33AAAAA0000A1Z0',
  phone: '0452-2345678',
  email: 'info@mjagency.com',
  address: '42, Veli Street, Madurai Main Market',
  city: 'Madurai',
  state: 'Tamil Nadu',
  pincode: '625001',
  invoice_prefix: 'MJA',
  purchase_prefix: 'MJP',
  currency: 'INR',
  currency_symbol: '₹',
  tax_inclusive: 'false',
  website: 'www.mjagency.com'
};

const initialSales: Sale[] = [
  {
    id: 1,
    invoice_number: 'MJA-2026-0001',
    customer_id: 1,
    customer_name: 'Murugan Provision Store',
    sale_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    subtotal: 4300,
    discount_amount: 200,
    tax_amount: 205,
    grand_total: 4305,
    paid_amount: 4305,
    change_amount: 0,
    payment_method: 'cash',
    cash_amount: 4305,
    card_amount: 0,
    upi_amount: 0,
    status: 'completed',
    notes: '',
    items: [
      { id: 1, product_id: 1,  product_name: 'Fortune Groundnut Oil 15 kg',  quantity: 2, unit_price: 2150, gst_percent: 5, gst_amount: 215, discount_percent: 0, discount_amount: 0, total_amount: 4300 }
    ],
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    invoice_number: 'MJA-2026-0002',
    customer_id: 2,
    customer_name: 'Rajan Super Market',
    sale_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    subtotal: 2750,
    discount_amount: 0,
    tax_amount: 137,
    grand_total: 2887,
    paid_amount: 2887,
    change_amount: 0,
    payment_method: 'upi',
    cash_amount: 0,
    card_amount: 0,
    upi_amount: 2887,
    status: 'completed',
    notes: '',
    items: [
      { id: 1, product_id: 6,  product_name: 'Aachi Sambar Masala 500 g',    quantity: 10, unit_price: 88,   gst_percent: 5, gst_amount: 44,  discount_percent: 0, discount_amount: 0, total_amount: 880 },
      { id: 2, product_id: 8,  product_name: 'Aachi Chilli Powder 500 g',    quantity: 10, unit_price: 82,   gst_percent: 5, gst_amount: 41,  discount_percent: 0, discount_amount: 0, total_amount: 820 },
      { id: 3, product_id: 15, product_name: 'Tata Sugar 1 kg',              quantity: 20, unit_price: 50,   gst_percent: 0, gst_amount: 0,   discount_percent: 0, discount_amount: 0, total_amount: 1000 }
    ],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    invoice_number: 'MJA-2026-0003',
    customer_id: 4,
    customer_name: 'Vel Wholesale Traders',
    sale_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    subtotal: 6490,
    discount_amount: 300,
    tax_amount: 310,
    grand_total: 6500,
    paid_amount: 4500,
    change_amount: 0,
    payment_method: 'cash',
    cash_amount: 6500,
    card_amount: 0,
    upi_amount: 0,
    status: 'completed',
    notes: 'Bulk order',
    items: [
      { id: 1, product_id: 12, product_name: 'Ponni Raw Rice 25 kg',         quantity: 2, unit_price: 1180, gst_percent: 5, gst_amount: 118, discount_percent: 0, discount_amount: 0, total_amount: 2360 },
      { id: 2, product_id: 13, product_name: 'Aashirvaad Atta 10 kg',        quantity: 4, unit_price: 420,  gst_percent: 5, gst_amount: 84,  discount_percent: 0, discount_amount: 0, total_amount: 1680 },
      { id: 3, product_id: 17, product_name: 'Toor Dal 25 kg',               quantity: 1, unit_price: 2380, gst_percent: 5, gst_amount: 119, discount_percent: 0, discount_amount: 0, total_amount: 2380 }
    ],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 4,
    invoice_number: 'MJA-2026-0004',
    customer_id: 3,
    customer_name: 'Selvi Kirana Shop',
    sale_date: new Date().toISOString(),
    subtotal: 1340,
    discount_amount: 0,
    tax_amount: 67,
    grand_total: 1407,
    paid_amount: 1407,
    change_amount: 0,
    payment_method: 'upi',
    cash_amount: 0,
    card_amount: 0,
    upi_amount: 1407,
    status: 'completed',
    notes: '',
    items: [
      { id: 1, product_id: 3,  product_name: 'Gemini Sunflower Oil 1 L',     quantity: 5,  unit_price: 148,  gst_percent: 5, gst_amount: 37,  discount_percent: 0, discount_amount: 0, total_amount: 740 },
      { id: 2, product_id: 16, product_name: 'Tata Salt 1 kg',               quantity: 10, unit_price: 24,   gst_percent: 0, gst_amount: 0,   discount_percent: 0, discount_amount: 0, total_amount: 240 },
      { id: 3, product_id: 21, product_name: 'Brooke Bond Red Label Tea 1 kg', quantity: 1, unit_price: 360, gst_percent: 5, gst_amount: 18,  discount_percent: 0, discount_amount: 0, total_amount: 360 }
    ],
    created_at: new Date().toISOString()
  }
];

const initialPurchases: Purchase[] = [
  {
    id: 1,
    invoice_number: 'MJP-2026-0001',
    supplier_id: 1,
    supplier_name: 'Fortune Foods Distributors',
    purchase_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    subtotal: 19800,
    discount_amount: 300,
    tax_amount: 975,
    grand_total: 20475,
    paid_amount: 20475,
    due_amount: 0,
    status: 'received',
    notes: 'Monthly oil stock',
    items: [
      { id: 1, product_id: 1, product_name: 'Fortune Groundnut Oil 15 kg',  quantity: 5, unit_price: 1980, gst_percent: 5, gst_amount: 495, discount_percent: 0, discount_amount: 0, total_amount: 9900 },
      { id: 2, product_id: 2, product_name: 'Sundrop Sunflower Oil 15 L',   quantity: 5, unit_price: 1750, gst_percent: 5, gst_amount: 437, discount_percent: 0, discount_amount: 0, total_amount: 8750 },
      { id: 3, product_id: 5, product_name: 'Ruchi Gold Palm Oil 15 kg',    quantity: 2, unit_price: 1420, gst_percent: 5, gst_amount: 142, discount_percent: 0, discount_amount: 0, total_amount: 2840 }
    ],
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    invoice_number: 'MJP-2026-0002',
    supplier_id: 2,
    supplier_name: 'Aachi Masala Wholesale',
    purchase_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    subtotal: 9200,
    discount_amount: 200,
    tax_amount: 450,
    grand_total: 9450,
    paid_amount: 5000,
    due_amount: 4450,
    status: 'received',
    notes: '',
    items: [
      { id: 1, product_id: 6,  product_name: 'Aachi Sambar Masala 500 g',   quantity: 50, unit_price: 72,   gst_percent: 5, gst_amount: 180, discount_percent: 0, discount_amount: 0, total_amount: 3600 },
      { id: 2, product_id: 7,  product_name: 'MDH Garam Masala 100 g',      quantity: 30, unit_price: 52,   gst_percent: 5, gst_amount: 78,  discount_percent: 0, discount_amount: 0, total_amount: 1560 },
      { id: 3, product_id: 8,  product_name: 'Aachi Chilli Powder 500 g',   quantity: 40, unit_price: 68,   gst_percent: 5, gst_amount: 136, discount_percent: 0, discount_amount: 0, total_amount: 2720 },
      { id: 4, product_id: 9,  product_name: 'Eastern Turmeric Powder 500 g', quantity: 20, unit_price: 55, gst_percent: 5, gst_amount: 55,  discount_percent: 0, discount_amount: 0, total_amount: 1100 }
    ],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    invoice_number: 'MJP-2026-0003',
    supplier_id: 3,
    supplier_name: 'Sri Murugan Rice Mill',
    purchase_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    subtotal: 18500,
    discount_amount: 500,
    tax_amount: 900,
    grand_total: 18900,
    paid_amount: 18900,
    due_amount: 0,
    status: 'received',
    notes: 'Bi-weekly rice & grain stock',
    items: [
      { id: 1, product_id: 11, product_name: 'India Gate Basmati Rice 5 kg', quantity: 10, unit_price: 485, gst_percent: 5, gst_amount: 242, discount_percent: 0, discount_amount: 0, total_amount: 4850 },
      { id: 2, product_id: 12, product_name: 'Ponni Raw Rice 25 kg',          quantity: 8, unit_price: 1050, gst_percent: 5, gst_amount: 420, discount_percent: 0, discount_amount: 0, total_amount: 8400 },
      { id: 3, product_id: 17, product_name: 'Toor Dal 25 kg',                quantity: 2, unit_price: 2100, gst_percent: 5, gst_amount: 210, discount_percent: 0, discount_amount: 0, total_amount: 4200 }
    ],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const initialStockMovements: StockMovement[] = [
  { id: 1, product_id: 1,  product_name: 'Fortune Groundnut Oil 15 kg',   movement_type: 'purchase', quantity: 5,  stock_before: 45, stock_after: 50, reference_id: 1, reference_type: 'purchase', notes: 'Received against MJP-2026-0001', created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 2, product_id: 2,  product_name: 'Sundrop Sunflower Oil 15 L',    movement_type: 'purchase', quantity: 5,  stock_before: 55, stock_after: 60, reference_id: 1, reference_type: 'purchase', notes: 'Received against MJP-2026-0001', created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 3, product_id: 5,  product_name: 'Ruchi Gold Palm Oil 15 kg',     movement_type: 'purchase', quantity: 2,  stock_before: 1,  stock_after: 3,  reference_id: 1, reference_type: 'purchase', notes: 'Received against MJP-2026-0001', created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 4, product_id: 6,  product_name: 'Aachi Sambar Masala 500 g',     movement_type: 'purchase', quantity: 50, stock_before: 100, stock_after: 150, reference_id: 2, reference_type: 'purchase', notes: 'Received against MJP-2026-0002', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 5, product_id: 8,  product_name: 'Aachi Chilli Powder 500 g',     movement_type: 'purchase', quantity: 40, stock_before: 80,  stock_after: 120, reference_id: 2, reference_type: 'purchase', notes: 'Received against MJP-2026-0002', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 6, product_id: 1,  product_name: 'Fortune Groundnut Oil 15 kg',   movement_type: 'sale',     quantity: 2,  stock_before: 50, stock_after: 48, reference_id: 1, reference_type: 'sale',     notes: 'Sold against MJA-2026-0001',   created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 7, product_id: 11, product_name: 'India Gate Basmati Rice 5 kg',  movement_type: 'purchase', quantity: 10, stock_before: 30, stock_after: 40, reference_id: 3, reference_type: 'purchase', notes: 'Received against MJP-2026-0003', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 8, product_id: 12, product_name: 'Ponni Raw Rice 25 kg',          movement_type: 'purchase', quantity: 8,  stock_before: 22, stock_after: 30, reference_id: 3, reference_type: 'purchase', notes: 'Received against MJP-2026-0003', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 9, product_id: 6,  product_name: 'Aachi Sambar Masala 500 g',     movement_type: 'sale',     quantity: 10, stock_before: 150, stock_after: 140, reference_id: 2, reference_type: 'sale',    notes: 'Sold against MJA-2026-0002',   created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 10, product_id: 3, product_name: 'Gemini Sunflower Oil 1 L',      movement_type: 'sale',     quantity: 5,  stock_before: 205, stock_after: 200, reference_id: 4, reference_type: 'sale',    notes: 'Sold against MJA-2026-0004',   created_at: new Date().toISOString() },
];

const initialVehicles: Vehicle[] = [
  { id: 1, vehicle_no: 'TN-59-AB-1234', model: 'Tata Ace', type: 'Mini Truck', is_active: true, created_at: new Date().toISOString() },
  { id: 2, vehicle_no: 'TN-58-Q-9876', model: 'Mahindra Bolero Pik-Up', type: 'Pickup Van', is_active: true, created_at: new Date().toISOString() }
];

const initialVehicleExpenses: VehicleExpense[] = [
  { id: 1, vehicle_id: 1, vehicle_no: 'TN-59-AB-1234', expense_type: 'fuel', amount: 1500, expense_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), liters: 15, bill_no: 'F-8812', notes: 'Diesel refill', created_at: new Date().toISOString() },
  { id: 2, vehicle_id: 1, vehicle_no: 'TN-59-AB-1234', expense_type: 'maintenance', amount: 3500, expense_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), bill_no: 'M-1022', notes: 'Engine oil change and general service', created_at: new Date().toISOString() },
  { id: 3, vehicle_id: 2, vehicle_no: 'TN-58-Q-9876', expense_type: 'fuel', amount: 2000, expense_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), liters: 20, bill_no: 'F-9021', notes: 'Diesel refill', created_at: new Date().toISOString() }
];

const initialStaff: Staff[] = [
  { id: 1, name: 'Rajesh Kumar', mobile: '9876501234', role: 'Driver', salary_type: 'daily', base_salary: 600, is_active: true, created_at: new Date().toISOString() },
  { id: 2, name: 'Suresh Moorthy', mobile: '9765432109', role: 'Helper / Loader', salary_type: 'daily', base_salary: 450, is_active: true, created_at: new Date().toISOString() },
  { id: 3, name: 'Priyanka Sen', mobile: '9543210987', role: 'Billing Staff', salary_type: 'monthly', base_salary: 15000, is_active: true, created_at: new Date().toISOString() }
];

const initialSalaries: SalaryPayment[] = [
  { id: 1, staff_id: 1, staff_name: 'Rajesh Kumar', payment_type: 'daily', payment_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), amount: 600, payment_period: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], notes: 'Daily wage paid', created_at: new Date().toISOString() },
  { id: 2, staff_id: 1, staff_name: 'Rajesh Kumar', payment_type: 'daily', payment_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), amount: 600, payment_period: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], notes: 'Daily wage paid', created_at: new Date().toISOString() },
  { id: 3, staff_id: 2, staff_name: 'Suresh Moorthy', payment_type: 'daily', payment_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), amount: 450, payment_period: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], notes: 'Daily wage paid', created_at: new Date().toISOString() },
  { id: 4, staff_id: 3, staff_name: 'Priyanka Sen', payment_type: 'monthly', payment_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), amount: 15000, payment_period: 'June 2026', notes: 'Monthly salary for June', created_at: new Date().toISOString() }
];

// Stateful Mock Store Database object
export const mockDB = {
  getCategories: () => getLocal('categories', initialCategories),
  setCategories: (val: Category[]) => setLocal('categories', val),

  getSubCategories: () => getLocal('subcategories', initialSubCategories),
  setSubCategories: (val: SubCategory[]) => setLocal('subcategories', val),

  getProducts: () => getLocal('products', initialProducts),
  setProducts: (val: Product[]) => setLocal('products', val),

  getCustomers: () => getLocal('customers', initialCustomers),
  setCustomers: (val: Customer[]) => setLocal('customers', val),

  getSuppliers: () => getLocal('suppliers', initialSuppliers),
  setSuppliers: (val: Supplier[]) => setLocal('suppliers', val),

  getSales: () => getLocal('sales', initialSales),
  setSales: (val: Sale[]) => setLocal('sales', val),

  getPurchases: () => getLocal('purchases', initialPurchases),
  setPurchases: (val: Purchase[]) => setLocal('purchases', val),

  getStockMovements: () => getLocal('stockMovements', initialStockMovements),
  setStockMovements: (val: StockMovement[]) => setLocal('stockMovements', val),

  getSettings: () => getLocal('settings', initialSettings),
  setSettings: (val: Settings) => setLocal('settings', val),

  getVehicles: () => getLocal('vehicles', initialVehicles),
  setVehicles: (val: Vehicle[]) => setLocal('vehicles', val),

  getVehicleExpenses: () => getLocal('vehicleExpenses', initialVehicleExpenses),
  setVehicleExpenses: (val: VehicleExpense[]) => setLocal('vehicleExpenses', val),

  getStaff: () => getLocal('staff', initialStaff),
  setStaff: (val: Staff[]) => setLocal('staff', val),

  getSalaries: () => getLocal('salaries', initialSalaries),
  setSalaries: (val: SalaryPayment[]) => setLocal('salaries', val),

  // ── Categories CRUD ──
  createCategory: (data: Partial<Category>) => {
    const list = mockDB.getCategories();
    const nextId = list.length > 0 ? Math.max(...list.map(c => c.id)) + 1 : 1;
    const newItem: Category = {
      id: nextId,
      name: data.name || '',
      description: data.description || '',
      is_active: data.is_active !== false,
      created_at: new Date().toISOString(),
    };
    list.unshift(newItem); // put at top
    mockDB.setCategories(list);
    return newItem;
  },
  updateCategory: (id: number, data: Partial<Category>) => {
    const list = mockDB.getCategories();
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Category not found');
    list[idx] = { ...list[idx], ...data };
    mockDB.setCategories(list);
    return list[idx];
  },
  deleteCategory: (id: number) => {
    const list = mockDB.getCategories();
    const filtered = list.filter(c => c.id !== id);
    mockDB.setCategories(filtered);
    return { success: true };
  },

  // ── SubCategories CRUD ──
  createSubCategory: (data: Partial<SubCategory>) => {
    const list = mockDB.getSubCategories();
    const cats = mockDB.getCategories();
    const cat = cats.find(c => c.id === data.category_id);
    const nextId = list.length > 0 ? Math.max(...list.map(c => c.id)) + 1 : 1;
    const newItem: SubCategory = {
      id: nextId,
      name: data.name || '',
      category_id: data.category_id || 0,
      category_name: cat ? cat.name : 'Unknown',
      description: data.description || '',
      is_active: data.is_active !== false,
      created_at: new Date().toISOString(),
    };
    list.unshift(newItem);
    mockDB.setSubCategories(list);
    return newItem;
  },
  updateSubCategory: (id: number, data: Partial<SubCategory>) => {
    const list = mockDB.getSubCategories();
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('SubCategory not found');
    const cats = mockDB.getCategories();
    const cat = data.category_id ? cats.find(c => c.id === data.category_id) : null;
    list[idx] = { 
      ...list[idx], 
      ...data,
      category_name: cat ? cat.name : (list[idx].category_name)
    };
    mockDB.setSubCategories(list);
    return list[idx];
  },
  deleteSubCategory: (id: number) => {
    const list = mockDB.getSubCategories();
    const filtered = list.filter(c => c.id !== id);
    mockDB.setSubCategories(filtered);
    return { success: true };
  },

  // ── Products CRUD ──
  createProduct: (data: Partial<Product>) => {
    const list = mockDB.getProducts();
    const cats = mockDB.getCategories();
    const subcats = mockDB.getSubCategories();
    const cat = cats.find(c => c.id === data.category_id);
    const subcat = subcats.find(s => s.id === data.subcategory_id);
    const nextId = list.length > 0 ? Math.max(...list.map(c => c.id)) + 1 : 1;
    
    const newItem: Product = {
      id: nextId,
      name: data.name || '',
      category_id: data.category_id,
      subcategory_id: data.subcategory_id,
      category_name: cat ? cat.name : '',
      subcategory_name: subcat ? subcat.name : '',
      sku: data.sku || `SKU-${nextId}`,
      barcode: data.barcode || `BAR-${nextId}`,
      purchase_price: Number(data.purchase_price || 0),
      selling_price: Number(data.selling_price || 0),
      gst_percent: Number(data.gst_percent || 0),
      unit: data.unit || 'Litre',
      current_stock: Number(data.current_stock || 0),
      minimum_stock: Number(data.minimum_stock || 0),
      brand: data.brand || '',
      description: data.description || '',
      image_url: data.image_url || '',
      is_active: data.is_active !== false,
      created_at: new Date().toISOString(),
    };
    
    list.unshift(newItem);
    mockDB.setProducts(list);
    
    // Add an initial stock movement if current stock > 0
    if (newItem.current_stock > 0) {
      const movements = mockDB.getStockMovements();
      movements.push({
        id: movements.length > 0 ? Math.max(...movements.map(m => m.id)) + 1 : 1,
        product_id: newItem.id,
        product_name: newItem.name,
        movement_type: 'adjustment',
        quantity: newItem.current_stock,
        stock_before: 0,
        stock_after: newItem.current_stock,
        notes: 'Initial Stock',
        created_at: new Date().toISOString()
      });
      mockDB.setStockMovements(movements);
    }
    
    return newItem;
  },
  updateProduct: (id: number, data: Partial<Product>) => {
    const list = mockDB.getProducts();
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Product not found');
    const cats = mockDB.getCategories();
    const subcats = mockDB.getSubCategories();
    const cat = data.category_id ? cats.find(c => c.id === data.category_id) : null;
    const subcat = data.subcategory_id ? subcats.find(s => s.id === data.subcategory_id) : null;

    const oldStock = list[idx].current_stock;
    const newStock = data.current_stock !== undefined ? Number(data.current_stock) : oldStock;

    list[idx] = { 
      ...list[idx], 
      ...data,
      category_name: cat ? cat.name : (data.category_id === null ? '' : list[idx].category_name),
      subcategory_name: subcat ? subcat.name : (data.subcategory_id === null ? '' : list[idx].subcategory_name),
      purchase_price: data.purchase_price !== undefined ? Number(data.purchase_price) : list[idx].purchase_price,
      selling_price: data.selling_price !== undefined ? Number(data.selling_price) : list[idx].selling_price,
      gst_percent: data.gst_percent !== undefined ? Number(data.gst_percent) : list[idx].gst_percent,
      minimum_stock: data.minimum_stock !== undefined ? Number(data.minimum_stock) : list[idx].minimum_stock,
      current_stock: newStock
    };
    mockDB.setProducts(list);

    // If stock changed directly, log a movement
    if (newStock !== oldStock) {
      const movements = mockDB.getStockMovements();
      movements.push({
        id: movements.length > 0 ? Math.max(...movements.map(m => m.id)) + 1 : 1,
        product_id: id,
        product_name: list[idx].name,
        movement_type: 'adjustment',
        quantity: Math.abs(newStock - oldStock),
        stock_before: oldStock,
        stock_after: newStock,
        notes: 'Manual stock update',
        created_at: new Date().toISOString()
      });
      mockDB.setStockMovements(movements);
    }

    return list[idx];
  },
  deleteProduct: (id: number) => {
    const list = mockDB.getProducts();
    const filtered = list.filter(c => c.id !== id);
    mockDB.setProducts(filtered);
    return { success: true };
  },

  // ── Customers CRUD ──
  createCustomer: (data: Partial<Customer>) => {
    const list = mockDB.getCustomers();
    const nextId = list.length > 0 ? Math.max(...list.map(c => c.id)) + 1 : 1;
    const newItem: Customer = {
      id: nextId,
      name: data.name || '',
      mobile: data.mobile || '',
      email: data.email || '',
      gst_number: data.gst_number || '',
      address: data.address || '',
      city: data.city || '',
      state: data.state || '',
      pincode: data.pincode || '',
      created_at: new Date().toISOString(),
    };
    list.unshift(newItem);
    mockDB.setCustomers(list);
    return newItem;
  },
  updateCustomer: (id: number, data: Partial<Customer>) => {
    const list = mockDB.getCustomers();
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Customer not found');
    list[idx] = { ...list[idx], ...data };
    mockDB.setCustomers(list);
    return list[idx];
  },
  deleteCustomer: (id: number) => {
    const list = mockDB.getCustomers();
    const filtered = list.filter(c => c.id !== id);
    mockDB.setCustomers(filtered);
    return { success: true };
  },

  // ── Suppliers CRUD ──
  createSupplier: (data: Partial<Supplier>) => {
    const list = mockDB.getSuppliers();
    const nextId = list.length > 0 ? Math.max(...list.map(s => s.id)) + 1 : 1;
    const newItem: Supplier = {
      id: nextId,
      name: data.name || '',
      mobile: data.mobile || '',
      email: data.email || '',
      gst_number: data.gst_number || '',
      address: data.address || '',
      city: data.city || '',
      state: data.state || '',
      pincode: data.pincode || '',
      created_at: new Date().toISOString(),
    };
    list.unshift(newItem);
    mockDB.setSuppliers(list);
    return newItem;
  },
  updateSupplier: (id: number, data: Partial<Supplier>) => {
    const list = mockDB.getSuppliers();
    const idx = list.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Supplier not found');
    list[idx] = { ...list[idx], ...data };
    mockDB.setSuppliers(list);
    return list[idx];
  },
  deleteSupplier: (id: number) => {
    const list = mockDB.getSuppliers();
    const filtered = list.filter(s => s.id !== id);
    mockDB.setSuppliers(filtered);
    return { success: true };
  },

  // ── Sales ──
  createSale: (data: any) => {
    const sales = mockDB.getSales();
    const products = mockDB.getProducts();
    const movements = mockDB.getStockMovements();
    const nextId = sales.length > 0 ? Math.max(...sales.map(s => s.id)) + 1 : 1;
    const customers = mockDB.getCustomers();
    const customer = customers.find(c => c.id === Number(data.customer_id));

    let subtotal = 0;
    let tax_amount = 0;
    let discount_amount = Number(data.discount_amount || 0);

    const saleItems = data.items.map((item: any, idx: number) => {
      const product = products.find(p => p.id === Number(item.product_id));
      const pName = product ? product.name : 'Unknown Product';
      const qty = Number(item.quantity);
      const price = Number(item.unit_price);
      const gstPct = Number(item.gst_percent !== undefined ? item.gst_percent : (product?.gst_percent || 0));
      const discPct = Number(item.discount_percent || 0);

      const baseAmount = qty * price;
      const discAmt = baseAmount * (discPct / 100);
      const gstAmt = (baseAmount - discAmt) * (gstPct / 100);
      const totalAmt = baseAmount - discAmt + gstAmt;

      subtotal += baseAmount;
      tax_amount += gstAmt;

      // decrease product stock
      if (product) {
        const oldStock = product.current_stock;
        product.current_stock -= qty;
        
        movements.push({
          id: movements.length > 0 ? Math.max(...movements.map(m => m.id)) + 1 : 1,
          product_id: product.id,
          product_name: product.name,
          movement_type: 'sale',
          quantity: qty,
          stock_before: oldStock,
          stock_after: product.current_stock,
          reference_id: nextId,
          reference_type: 'sale',
          notes: `Sold against Invoice MJA-2026-${String(nextId).padStart(4, '0')}`,
          created_at: new Date().toISOString()
        });
      }

      return {
        id: idx + 1,
        product_id: item.product_id,
        product_name: pName,
        quantity: qty,
        unit_price: price,
        gst_percent: gstPct,
        gst_amount: gstAmt,
        discount_percent: discPct,
        discount_amount: discAmt,
        total_amount: totalAmt
      };
    });

    const grand_total = subtotal - discount_amount + tax_amount;

    const newSale: Sale = {
      id: nextId,
      invoice_number: `MJA-2026-${String(nextId).padStart(4, '0')}`,
      customer_id: data.customer_id ? Number(data.customer_id) : undefined,
      customer_name: customer ? customer.name : 'Walk-in Customer',
      sale_date: new Date().toISOString(),
      subtotal,
      discount_amount,
      tax_amount,
      grand_total,
      paid_amount: Number(data.paid_amount || grand_total),
      change_amount: Number(data.change_amount || 0),
      payment_method: data.payment_method || 'cash',
      cash_amount: Number(data.cash_amount || 0),
      card_amount: Number(data.card_amount || 0),
      upi_amount: Number(data.upi_amount || 0),
      status: 'completed',
      notes: data.notes || '',
      items: saleItems,
      created_at: new Date().toISOString()
    };

    sales.unshift(newSale);
    mockDB.setSales(sales);
    mockDB.setProducts(products);
    mockDB.setStockMovements(movements);

    return newSale;
  },

  cancelSale: (id: number) => {
    const sales = mockDB.getSales();
    const idx = sales.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Sale not found');
    
    if (sales[idx].status !== 'cancelled') {
      sales[idx].status = 'cancelled';
      
      // restore stock
      const products = mockDB.getProducts();
      const movements = mockDB.getStockMovements();

      sales[idx].items.forEach(item => {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          const oldStock = product.current_stock;
          product.current_stock += item.quantity;
          
          movements.push({
            id: movements.length > 0 ? Math.max(...movements.map(m => m.id)) + 1 : 1,
            product_id: product.id,
            product_name: product.name,
            movement_type: 'return_in',
            quantity: item.quantity,
            stock_before: oldStock,
            stock_after: product.current_stock,
            reference_id: id,
            reference_type: 'sale',
            notes: `Restored from Cancelled Invoice ${sales[idx].invoice_number}`,
            created_at: new Date().toISOString()
          });
        }
      });
      
      mockDB.setSales(sales);
      mockDB.setProducts(products);
      mockDB.setStockMovements(movements);
    }
    
    return sales[idx];
  },

  // ── Purchases ──
  createPurchase: (data: any) => {
    const purchases = mockDB.getPurchases();
    const products = mockDB.getProducts();
    const movements = mockDB.getStockMovements();
    const nextId = purchases.length > 0 ? Math.max(...purchases.map(p => p.id)) + 1 : 1;
    const suppliers = mockDB.getSuppliers();
    const supplier = suppliers.find(s => s.id === Number(data.supplier_id));

    let subtotal = 0;
    let tax_amount = 0;
    let discount_amount = Number(data.discount_amount || 0);

    const purchaseItems = data.items.map((item: any, idx: number) => {
      const product = products.find(p => p.id === Number(item.product_id));
      const pName = product ? product.name : 'Unknown Product';
      const qty = Number(item.quantity);
      const price = Number(item.unit_price);
      const gstPct = Number(item.gst_percent || product?.gst_percent || 0);
      const discPct = Number(item.discount_percent || 0);

      const baseAmount = qty * price;
      const discAmt = baseAmount * (discPct / 100);
      const gstAmt = (baseAmount - discAmt) * (gstPct / 100);
      const totalAmt = baseAmount - discAmt + gstAmt;

      subtotal += baseAmount;
      tax_amount += gstAmt;

      // increase product stock
      if (product) {
        const oldStock = product.current_stock;
        product.current_stock += qty;
        
        movements.push({
          id: movements.length > 0 ? Math.max(...movements.map(m => m.id)) + 1 : 1,
          product_id: product.id,
          product_name: product.name,
          movement_type: 'purchase',
          quantity: qty,
          stock_before: oldStock,
          stock_after: product.current_stock,
          reference_id: nextId,
          reference_type: 'purchase',
          notes: `Received against Purchase MJP-2026-${String(nextId).padStart(4, '0')}`,
          created_at: new Date().toISOString()
        });
      }

      return {
        id: idx + 1,
        product_id: item.product_id,
        product_name: pName,
        quantity: qty,
        unit_price: price,
        gst_percent: gstPct,
        gst_amount: gstAmt,
        discount_percent: discPct,
        discount_amount: discAmt,
        total_amount: totalAmt
      };
    });

    const grand_total = subtotal - discount_amount + tax_amount;

    const newPurchase: Purchase = {
      id: nextId,
      invoice_number: data.invoice_number || `MJP-2026-${String(nextId).padStart(4, '0')}`,
      supplier_id: data.supplier_id ? Number(data.supplier_id) : undefined,
      supplier_name: supplier ? supplier.name : 'Walk-in Supplier',
      purchase_date: data.purchase_date || new Date().toISOString(),
      subtotal,
      discount_amount,
      tax_amount,
      grand_total,
      paid_amount: Number(data.paid_amount || grand_total),
      due_amount: grand_total - Number(data.paid_amount || grand_total),
      status: 'received',
      notes: data.notes || '',
      items: purchaseItems,
      created_at: new Date().toISOString()
    };

    purchases.unshift(newPurchase);
    mockDB.setPurchases(purchases);
    mockDB.setProducts(products);
    mockDB.setStockMovements(movements);

    return newPurchase;
  },

  // ── Stock Adjustments ──
  adjustStock: (data: { product_id: number; movement_type: string; quantity: number; notes?: string }) => {
    const products = mockDB.getProducts();
    const movements = mockDB.getStockMovements();
    const product = products.find(p => p.id === Number(data.product_id));
    if (!product) throw new Error('Product not found');

    const oldStock = product.current_stock;
    const qty = Number(data.quantity);
    const type = data.movement_type; // 'stock_in' | 'stock_out' | 'adjustment'
    
    if (type === 'stock_in') {
      product.current_stock += qty;
    } else if (type === 'stock_out') {
      product.current_stock -= qty;
    } else if (type === 'adjustment') {
      product.current_stock = qty; // absolute adjustment
    }

    const nextId = movements.length > 0 ? Math.max(...movements.map(m => m.id)) + 1 : 1;
    const newMovement: StockMovement = {
      id: nextId,
      product_id: product.id,
      product_name: product.name,
      movement_type: type as any,
      quantity: Math.abs(qty - (type === 'adjustment' ? oldStock : 0)),
      stock_before: oldStock,
      stock_after: product.current_stock,
      notes: data.notes || 'Manual Adjustment',
      created_at: new Date().toISOString()
    };

    movements.unshift(newMovement);
    mockDB.setProducts(products);
    mockDB.setStockMovements(movements);

    return newMovement;
  },

  // ── Reports ──
  getReportsSales: (from: string, to: string) => {
    const sales = mockDB.getSales().filter(s => s.status !== 'cancelled');
    // Date filter
    const fromTime = from ? new Date(from).getTime() : 0;
    const toTime = to ? new Date(to).getTime() : Infinity;
    
    const filtered = sales.filter(s => {
      const time = new Date(s.sale_date).getTime();
      return time >= fromTime && time <= toTime;
    });

    const productWiseMap: Record<string, { product: string; qty: number; revenue: number; tax: number }> = {};
    let total_sales = 0;
    let total_tax = 0;
    let total_discount = 0;

    filtered.forEach(s => {
      total_sales += s.subtotal;
      total_tax += s.tax_amount;
      total_discount += s.discount_amount;

      s.items.forEach(item => {
        const pName = item.product_name || 'Unknown Product';
        if (!productWiseMap[pName]) {
          productWiseMap[pName] = { product: pName, qty: 0, revenue: 0, tax: 0 };
        }
        productWiseMap[pName].qty += item.quantity;
        productWiseMap[pName].revenue += item.quantity * item.unit_price;
        productWiseMap[pName].tax += item.gst_amount;
      });
    });

    return {
      total_bills: filtered.length,
      total_sales,
      total_tax,
      total_discount,
      product_wise: Object.values(productWiseMap),
    };
  },

  getReportsPurchases: (from: string, to: string) => {
    const purchases = mockDB.getPurchases().filter(p => p.status !== 'cancelled');
    const fromTime = from ? new Date(from).getTime() : 0;
    const toTime = to ? new Date(to).getTime() : Infinity;
    
    const filtered = purchases.filter(p => {
      const time = new Date(p.purchase_date).getTime();
      return time >= fromTime && time <= toTime;
    });

    let total_amount = 0;
    let total_tax = 0;

    filtered.forEach(p => {
      total_amount += p.subtotal;
      total_tax += p.tax_amount;
    });

    return {
      total_purchases: filtered.length,
      total_amount,
      total_tax,
    };
  },

  getReportsStock: () => {
    const products = mockDB.getProducts();
    const inStock = products.filter(p => p.current_stock > 0);
    const lowStock = products.filter(p => p.current_stock <= p.minimum_stock && p.current_stock > 0);
    const outOfStock = products.filter(p => p.current_stock <= 0);

    const totalVal = products.reduce((acc, p) => acc + (p.current_stock * p.purchase_price), 0);

    return {
      total_products: products.length,
      in_stock_count: inStock.length,
      low_stock_count: lowStock.length,
      out_of_stock_count: outOfStock.length,
      total_stock_value: totalVal,
      low_stock_items: lowStock.map(p => ({
        id: p.id,
        name: p.name,
        current_stock: p.current_stock,
        minimum_stock: p.minimum_stock,
        unit: p.unit
      }))
    };
  },

  getReportsGst: (from: string, to: string) => {
    const sRep = mockDB.getReportsSales(from, to);
    const pRep = mockDB.getReportsPurchases(from, to);

    const gst_collected = sRep.total_tax;
    const gst_paid = pRep.total_tax;

    return {
      gst_collected,
      gst_paid,
      net_gst: gst_collected - gst_paid
    };
  },

  getReportsProfitLoss: (from: string, to: string) => {
    const sales = mockDB.getSales().filter(s => s.status !== 'cancelled');
    const fromTime = from ? new Date(from).getTime() : 0;
    const toTime = to ? new Date(to).getTime() : Infinity;
    
    const filtered = sales.filter(s => {
      const time = new Date(s.sale_date).getTime();
      return time >= fromTime && time <= toTime;
    });

    let revenue = 0;
    let cost_of_goods_sold = 0;

    const products = mockDB.getProducts();

    filtered.forEach(s => {
      revenue += (s.subtotal - s.discount_amount);
      s.items.forEach(item => {
        const prod = products.find(p => p.id === item.product_id);
        const costPrice = prod ? prod.purchase_price : item.unit_price * 0.8; // Fallback to 80% if not found
        cost_of_goods_sold += item.quantity * costPrice;
      });
    });

    const gross_profit = revenue - cost_of_goods_sold;
    const gross_margin_percent = revenue > 0 ? Math.round((gross_profit / revenue) * 100) : 0;

    return {
      revenue,
      cost_of_goods_sold,
      gross_profit,
      gross_margin_percent
    };
  },

  getReportsCreditors: () => {
    const suppliers = mockDB.getSuppliers();
    const purchases = mockDB.getPurchases().filter(p => p.status !== 'cancelled');
    
    const creditorsMap: Record<number, {
      supplier_id: number;
      supplier_name: string;
      mobile: string;
      email: string;
      total_purchases: number;
      total_paid: number;
      total_due: number;
    }> = {};

    suppliers.forEach(s => {
      creditorsMap[s.id] = {
        supplier_id: s.id,
        supplier_name: s.name,
        mobile: s.mobile || '-',
        email: s.email || '-',
        total_purchases: 0,
        total_paid: 0,
        total_due: 0
      };
    });

    purchases.forEach(p => {
      if (p.supplier_id && creditorsMap[p.supplier_id]) {
        creditorsMap[p.supplier_id].total_purchases += p.grand_total;
        creditorsMap[p.supplier_id].total_paid += p.paid_amount;
        creditorsMap[p.supplier_id].total_due += p.due_amount;
      }
    });

    const items = Object.values(creditorsMap);
    const outstandingItems = items.filter(c => c.total_due > 0);
    const total_outstanding = outstandingItems.reduce((acc, c) => acc + c.total_due, 0);

    return {
      total_creditors: outstandingItems.length,
      total_outstanding,
      all_items: items,
      outstanding_items: outstandingItems
    };
  },

  getReportsDebtors: () => {
    const customers = mockDB.getCustomers();
    const sales = mockDB.getSales().filter(s => s.status !== 'cancelled');

    const debtorsMap: Record<number, {
      customer_id: number;
      customer_name: string;
      mobile: string;
      email: string;
      total_sales: number;
      total_paid: number;
      total_due: number;
    }> = {};

    customers.forEach(c => {
      debtorsMap[c.id] = {
        customer_id: c.id,
        customer_name: c.name,
        mobile: c.mobile || '-',
        email: c.email || '-',
        total_sales: 0,
        total_paid: 0,
        total_due: 0
      };
    });

    sales.forEach(s => {
      if (s.customer_id && debtorsMap[s.customer_id]) {
        debtorsMap[s.customer_id].total_sales += s.grand_total;
        debtorsMap[s.customer_id].total_paid += s.paid_amount;
        const due = s.grand_total - s.paid_amount;
        debtorsMap[s.customer_id].total_due += due > 0 ? due : 0;
      }
    });

    const items = Object.values(debtorsMap);
    const outstandingItems = items.filter(d => d.total_due > 0);
    const total_outstanding = outstandingItems.reduce((acc, d) => acc + d.total_due, 0);

    return {
      total_debtors: outstandingItems.length,
      total_outstanding,
      all_items: items,
      outstanding_items: outstandingItems
    };
  },

  // ── Vehicles CRUD ──
  createVehicle: (data: Partial<Vehicle>) => {
    const list = mockDB.getVehicles();
    const nextId = list.length > 0 ? Math.max(...list.map(v => v.id)) + 1 : 1;
    const newItem: Vehicle = {
      id: nextId,
      vehicle_no: data.vehicle_no || '',
      model: data.model || '',
      type: data.type || '',
      is_active: data.is_active !== false,
      created_at: new Date().toISOString()
    };
    list.unshift(newItem);
    mockDB.setVehicles(list);
    return newItem;
  },
  updateVehicle: (id: number, data: Partial<Vehicle>) => {
    const list = mockDB.getVehicles();
    const idx = list.findIndex(v => v.id === id);
    if (idx === -1) throw new Error('Vehicle not found');
    list[idx] = { ...list[idx], ...data };
    mockDB.setVehicles(list);
    return list[idx];
  },
  deleteVehicle: (id: number) => {
    const list = mockDB.getVehicles();
    const filtered = list.filter(v => v.id !== id);
    mockDB.setVehicles(filtered);
    return { success: true };
  },

  // ── Vehicle Expenses CRUD ──
  createVehicleExpense: (data: Partial<VehicleExpense>) => {
    const list = mockDB.getVehicleExpenses();
    const vehicles = mockDB.getVehicles();
    const vehicle = vehicles.find(v => v.id === Number(data.vehicle_id));
    const nextId = list.length > 0 ? Math.max(...list.map(e => e.id)) + 1 : 1;
    const newItem: VehicleExpense = {
      id: nextId,
      vehicle_id: Number(data.vehicle_id) || 0,
      vehicle_no: vehicle ? vehicle.vehicle_no : 'Unknown',
      expense_type: data.expense_type || 'other',
      amount: Number(data.amount) || 0,
      expense_date: data.expense_date || new Date().toISOString(),
      liters: data.liters ? Number(data.liters) : undefined,
      bill_no: data.bill_no || '',
      notes: data.notes || '',
      created_at: new Date().toISOString()
    };
    list.unshift(newItem);
    mockDB.setVehicleExpenses(list);
    return newItem;
  },
  updateVehicleExpense: (id: number, data: Partial<VehicleExpense>) => {
    const list = mockDB.getVehicleExpenses();
    const idx = list.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Vehicle expense not found');
    const vehicles = mockDB.getVehicles();
    const vehicle = data.vehicle_id ? vehicles.find(v => v.id === Number(data.vehicle_id)) : null;
    list[idx] = {
      ...list[idx],
      ...data,
      vehicle_id: data.vehicle_id ? Number(data.vehicle_id) : list[idx].vehicle_id,
      vehicle_no: vehicle ? vehicle.vehicle_no : list[idx].vehicle_no,
      amount: data.amount !== undefined ? Number(data.amount) : list[idx].amount,
      liters: data.liters !== undefined ? Number(data.liters) : list[idx].liters
    };
    mockDB.setVehicleExpenses(list);
    return list[idx];
  },
  deleteVehicleExpense: (id: number) => {
    const list = mockDB.getVehicleExpenses();
    const filtered = list.filter(e => e.id !== id);
    mockDB.setVehicleExpenses(filtered);
    return { success: true };
  },

  // ── Staff CRUD ──
  createStaff: (data: Partial<Staff>) => {
    const list = mockDB.getStaff();
    const nextId = list.length > 0 ? Math.max(...list.map(s => s.id)) + 1 : 1;
    const newItem: Staff = {
      id: nextId,
      name: data.name || '',
      mobile: data.mobile || '',
      role: data.role || '',
      salary_type: data.salary_type || 'daily',
      base_salary: Number(data.base_salary) || 0,
      is_active: data.is_active !== false,
      created_at: new Date().toISOString()
    };
    list.unshift(newItem);
    mockDB.setStaff(list);
    return newItem;
  },
  updateStaff: (id: number, data: Partial<Staff>) => {
    const list = mockDB.getStaff();
    const idx = list.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Staff not found');
    list[idx] = { 
      ...list[idx], 
      ...data,
      base_salary: data.base_salary !== undefined ? Number(data.base_salary) : list[idx].base_salary
    };
    mockDB.setStaff(list);
    return list[idx];
  },
  deleteStaff: (id: number) => {
    const list = mockDB.getStaff();
    const filtered = list.filter(s => s.id !== id);
    mockDB.setStaff(filtered);
    return { success: true };
  },

  // ── Salary Payouts CRUD ──
  createSalary: (data: Partial<SalaryPayment>) => {
    const list = mockDB.getSalaries();
    const staffList = mockDB.getStaff();
    const staff = staffList.find(s => s.id === Number(data.staff_id));
    const nextId = list.length > 0 ? Math.max(...list.map(s => s.id)) + 1 : 1;
    const newItem: SalaryPayment = {
      id: nextId,
      staff_id: Number(data.staff_id) || 0,
      staff_name: staff ? staff.name : 'Unknown Staff',
      payment_type: data.payment_type || 'daily',
      payment_date: data.payment_date || new Date().toISOString(),
      amount: Number(data.amount) || 0,
      payment_period: data.payment_period || '',
      notes: data.notes || '',
      created_at: new Date().toISOString()
    };
    list.unshift(newItem);
    mockDB.setSalaries(list);
    return newItem;
  },
  updateSalary: (id: number, data: Partial<SalaryPayment>) => {
    const list = mockDB.getSalaries();
    const idx = list.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Salary payout record not found');
    const staffList = mockDB.getStaff();
    const staff = data.staff_id ? staffList.find(s => s.id === Number(data.staff_id)) : null;
    list[idx] = {
      ...list[idx],
      ...data,
      staff_id: data.staff_id ? Number(data.staff_id) : list[idx].staff_id,
      staff_name: staff ? staff.name : list[idx].staff_name,
      amount: data.amount !== undefined ? Number(data.amount) : list[idx].amount
    };
    mockDB.setSalaries(list);
    return list[idx];
  },
  deleteSalary: (id: number) => {
    const list = mockDB.getSalaries();
    const filtered = list.filter(s => s.id !== id);
    mockDB.setSalaries(filtered);
    return { success: true };
  },

  // ── Expense & Salary Reports ──
  getReportsVehicleExpenses: () => {
    const expenses = mockDB.getVehicleExpenses();
    let total_expenses = 0;
    let total_fuel = 0;
    let total_maintenance = 0;
    let total_others = 0;

    const vehicleWiseMap: Record<string, { vehicle_no: string; amount: number; fuel_amount: number; maint_amount: number; other_amount: number }> = {};

    expenses.forEach(e => {
      const amt = Number(e.amount) || 0;
      total_expenses += amt;
      if (e.expense_type === 'fuel') total_fuel += amt;
      else if (e.expense_type === 'maintenance') total_maintenance += amt;
      else total_others += amt;

      const vNo = e.vehicle_no || 'Unknown Vehicle';
      if (!vehicleWiseMap[vNo]) {
        vehicleWiseMap[vNo] = { vehicle_no: vNo, amount: 0, fuel_amount: 0, maint_amount: 0, other_amount: 0 };
      }
      vehicleWiseMap[vNo].amount += amt;
      if (e.expense_type === 'fuel') vehicleWiseMap[vNo].fuel_amount += amt;
      else if (e.expense_type === 'maintenance') vehicleWiseMap[vNo].maint_amount += amt;
      else vehicleWiseMap[vNo].other_amount += amt;
    });

    return {
      total_expenses,
      total_fuel,
      total_maintenance,
      total_others,
      vehicle_wise: Object.values(vehicleWiseMap),
      all_items: expenses
    };
  },

  getReportsDailyWages: () => {
    const salaries = mockDB.getSalaries().filter(s => s.payment_type === 'daily');
    let total_daily_wages = 0;

    const staffWiseMap: Record<number, { staff_id: number; staff_name: string; total_paid: number; payments_count: number }> = {};

    salaries.forEach(s => {
      const amt = Number(s.amount) || 0;
      total_daily_wages += amt;

      const sId = s.staff_id;
      if (!staffWiseMap[sId]) {
        staffWiseMap[sId] = { staff_id: sId, staff_name: s.staff_name, total_paid: 0, payments_count: 0 };
      }
      staffWiseMap[sId].total_paid += amt;
      staffWiseMap[sId].payments_count += 1;
    });

    return {
      total_daily_wages,
      staff_wise: Object.values(staffWiseMap),
      all_items: salaries
    };
  },

  getReportsMonthlySalaries: () => {
    const salaries = mockDB.getSalaries().filter(s => s.payment_type === 'monthly');
    let total_monthly_salaries = 0;

    const staffWiseMap: Record<number, { staff_id: number; staff_name: string; total_paid: number; payments_count: number }> = {};

    salaries.forEach(s => {
      const amt = Number(s.amount) || 0;
      total_monthly_salaries += amt;

      const sId = s.staff_id;
      if (!staffWiseMap[sId]) {
        staffWiseMap[sId] = { staff_id: sId, staff_name: s.staff_name, total_paid: 0, payments_count: 0 };
      }
      staffWiseMap[sId].total_paid += amt;
      staffWiseMap[sId].payments_count += 1;
    });

    return {
      total_monthly_salaries,
      staff_wise: Object.values(staffWiseMap),
      all_items: salaries
    };
  },

  // ── Dashboard Stats ──
  getDashboardStats: () => {
    const products = mockDB.getProducts();
    const categories = mockDB.getCategories();
    const customers = mockDB.getCustomers();
    const suppliers = mockDB.getSuppliers();
    const sales = mockDB.getSales().filter(s => s.status !== 'cancelled');

    // Today sales
    const today = new Date().toDateString();
    const todaySalesAmount = sales
      .filter(s => new Date(s.sale_date).toDateString() === today)
      .reduce((acc, s) => acc + s.grand_total, 0);

    // Monthly sales
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlySalesAmount = sales
      .filter(s => {
        const date = new Date(s.sale_date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((acc, s) => acc + s.grand_total, 0);

    const lowStockCount = products.filter(p => p.current_stock <= p.minimum_stock).length;

    return {
      today_sales: todaySalesAmount,
      monthly_sales: monthlySalesAmount,
      total_products: products.length,
      total_categories: categories.length,
      total_customers: customers.length,
      total_suppliers: suppliers.length,
      low_stock_count: lowStockCount
    };
  },

  // ── Dashboard Charts ──
  getTopProducts: (limit: number) => {
    const sales = mockDB.getSales().filter(s => s.status !== 'cancelled');
    const pCounts: Record<string, { product_id: number; product_name: string; total_qty: number; total_revenue: number }> = {};
    
    sales.forEach(s => {
      s.items.forEach(item => {
        const key = String(item.product_id);
        const name = item.product_name || 'Unknown';
        if (!pCounts[key]) pCounts[key] = { product_id: item.product_id, product_name: name, total_qty: 0, total_revenue: 0 };
        pCounts[key].total_qty += item.quantity;
        pCounts[key].total_revenue += item.quantity * item.unit_price;
      });
    });

    return Object.values(pCounts)
      .sort((a, b) => b.total_qty - a.total_qty)
      .slice(0, limit);
  },

  getSalesGraph: (days: number) => {
    // Generate last N days array
    const data = [];
    const sales = mockDB.getSales().filter(s => s.status !== 'cancelled');

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayKey = d.toDateString();

      const total = sales
        .filter(s => new Date(s.sale_date).toDateString() === dayKey)
        .reduce((acc, s) => acc + s.grand_total, 0);

      // Return both 'amount' and 'total' so charts work regardless of which key they use
      data.push({ date: dateStr, amount: total, total });
    }
    return data;
  },

  getMonthlyRevenue: (year?: number) => {
    const targetYear = year || new Date().getFullYear();
    const sales = mockDB.getSales().filter(s => s.status !== 'cancelled');
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map((m, idx) => {
      const monthlySales = sales.filter(s => {
        const date = new Date(s.sale_date);
        return date.getMonth() === idx && date.getFullYear() === targetYear;
      });
      const revenue = monthlySales.reduce((acc, s) => acc + (s.subtotal - s.discount_amount), 0);
      const tax = monthlySales.reduce((acc, s) => acc + s.tax_amount, 0);
      
      // month is 1-indexed number AND the string name for flexibility
      return { month: idx + 1, name: m, revenue, tax };
    });
  }
};

// Help helper function to paginate list items
export function getPaginatedResponse<T>(items: T[], params?: any) {
  let filtered = [...items];
  
  if (params && params.search) {
    const q = String(params.search).toLowerCase();
    filtered = filtered.filter((item: any) => {
      return Object.values(item).some(val => 
        val !== null && val !== undefined && String(val).toLowerCase().includes(q)
      );
    });
  }
  
  // Custom filters based on request query parameters
  if (params) {
    Object.keys(params).forEach(key => {
      if (key !== 'page' && key !== 'limit' && key !== 'skip' && key !== 'search' && params[key] !== undefined) {
        filtered = filtered.filter((item: any) => String(item[key]) === String(params[key]));
      }
    });
  }

  const total = filtered.length;
  let limit = 10;
  if (params && params.limit) {
    limit = Number(params.limit);
  }
  
  let startIndex = 0;
  if (params) {
    if (params.skip !== undefined) {
      startIndex = Number(params.skip);
    } else if (params.page) {
      startIndex = (Number(params.page) - 1) * limit;
    }
  }
  
  const paginatedItems = filtered.slice(startIndex, startIndex + limit);
  
  return {
    total,
    items: paginatedItems
  };
}
