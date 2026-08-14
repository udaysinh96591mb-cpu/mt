import fs from 'fs';
import path from 'path';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  total: number;
  address: string;
  message?: string;
  paymentMethod: string;
  status: 'NEW' | 'CONFIRMED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  source?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// In-memory fallback if file system is read-only or in serverless ephemeral instances
let memoryOrders: Order[] = [
  {
    id: 'ORD-89421A',
    customerName: 'Ritesh Patel',
    customerPhone: '9876543210',
    customerEmail: 'ritesh.patel@example.com',
    productName: 'LED Headlight Kit (H4/H7)',
    unitPrice: 2499,
    quantity: 1,
    total: 2499,
    address: 'B-402, Shivalik Heights, Science City Road, Ahmedabad - 380060',
    message: 'Please send with 1-year warranty card.',
    paymentMethod: 'COD',
    status: 'CONFIRMED',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'ORD-37199K',
    customerName: 'Meera Shah',
    customerPhone: '9123456780',
    customerEmail: 'meera.shah@example.com',
    productName: 'Luxury Leatherette Seat Covers',
    unitPrice: 3899,
    quantity: 1,
    total: 3899,
    address: '12, Anandvan Society, Naranpura, Ahmedabad - 380013',
    message: 'Black with red stitching preferred.',
    paymentMethod: 'COD',
    status: 'PROCESSING',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'ORD-55201U',
    customerName: 'Kunal Trivedi',
    customerPhone: '9988776655',
    customerEmail: 'kunal.trivedi@example.com',
    productName: '1080P Dual Dash Cam with Night Vision',
    unitPrice: 3499,
    quantity: 1,
    total: 3499,
    address: 'Plot 45, Bopal Ring Road, Ahmedabad - 380058',
    message: 'Call before dispatch.',
    paymentMethod: 'COD',
    status: 'NEW',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  }
];

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(ORDERS_FILE)) {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(memoryOrders, null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('Filesystem data storage unavailable, using in-memory store:', err);
  }
}

export function getOrders(): Order[] {
  ensureDataDir();
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryOrders = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading orders file, fallback to memory:', err);
  }
  return memoryOrders;
}

export function getOrderById(id: string): Order | undefined {
  const all = getOrders();
  return all.find(o => o.id.toUpperCase() === id.trim().toUpperCase());
}

export function saveOrder(orderData: Omit<Order, 'createdAt' | 'updatedAt'> & { createdAt?: string, updatedAt?: string }): Order {
  const all = getOrders();
  const now = new Date().toISOString();
  
  const newOrder: Order = {
    ...orderData,
    status: orderData.status || 'NEW',
    createdAt: orderData.createdAt || now,
    updatedAt: orderData.updatedAt || now,
  };

  // Prepend new order
  const updatedList = [newOrder, ...all.filter(o => o.id !== newOrder.id)];
  memoryOrders = updatedList;

  ensureDataDir();
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(updatedList, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to persist order to disk:', err);
  }

  return newOrder;
}

export function updateOrderStatus(id: string, status: Order['status']): Order | null {
  const all = getOrders();
  const index = all.findIndex(o => o.id.toUpperCase() === id.trim().toUpperCase());
  if (index === -1) return null;

  all[index].status = status;
  all[index].updatedAt = new Date().toISOString();
  memoryOrders = all;

  ensureDataDir();
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to update order on disk:', err);
  }

  return all[index];
}

export function deleteOrder(id: string): boolean {
  const all = getOrders();
  const filtered = all.filter(o => o.id.toUpperCase() !== id.trim().toUpperCase());
  if (filtered.length === all.length) return false;

  memoryOrders = filtered;
  ensureDataDir();
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to delete order from disk:', err);
  }
  return true;
}
