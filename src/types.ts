export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: 'tacos' | 'bebidas' | 'extra';
  estimatedAvailability?: string; // e.g., "A las 5:00 PM", "Mañana", "Lunes"
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  category: 'tacos' | 'bebidas' | 'extra';
}

export interface Ticket {
  id: string;
  items: OrderItem[];
  total: number;
  date: string; // HH:MM:SS
  customerName: string;
}

export type Role = 'none' | 'admin' | 'empleado' | 'cliente';

export interface AccessRequest {
  id: string;
  name: string;
  role: 'cliente' | 'empleado';
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}
