import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  // Tacos
  { id: 'taco-1', name: 'Taco al Pastor', price: 18, stock: 50, category: 'tacos' },
  { id: 'taco-2', name: 'Taco de Suadero', price: 18, stock: 40, category: 'tacos' },
  { id: 'taco-3', name: 'Taco de Bistec', price: 20, stock: 35, category: 'tacos' },
  { id: 'taco-4', name: 'Taco de Tripa Dorada', price: 22, stock: 0, category: 'tacos', estimatedAvailability: 'Mañana a las 2:00 PM' },
  { id: 'taco-5', name: 'Taco Campechano', price: 20, stock: 45, category: 'tacos' },
  { id: 'taco-6', name: 'Taco de Cabeza', price: 19, stock: 30, category: 'tacos' },
  { id: 'taco-7', name: 'Taco de Barbacoa', price: 25, stock: 25, category: 'tacos' },
  { id: 'taco-8', name: 'Taco de Cochinita Pibil', price: 18, stock: 40, category: 'tacos' },
  { id: 'taco-9', name: 'Gringa de Pastor', price: 35, stock: 15, category: 'tacos' },
  { id: 'taco-10', name: 'Taco de Chicharrón en Salsa Verde', price: 18, stock: 0, category: 'tacos', estimatedAvailability: 'Hoy a las 6:30 PM' },
  
  // Bebidas
  { id: 'beb-1', name: 'Coca-Cola Original 355ml', price: 25, stock: 50, category: 'bebidas' },
  { id: 'beb-2', name: 'Agua de Jamaica Grande', price: 22, stock: 30, category: 'bebidas' },
  { id: 'beb-3', name: 'Agua de Horchata Grande', price: 22, stock: 2, category: 'bebidas' },
  { id: 'beb-4', name: 'Agua de Tamarindo Grande', price: 22, stock: 15, category: 'bebidas' },
  { id: 'beb-5', name: 'Boing de Guayaba', price: 20, stock: 0, category: 'bebidas', estimatedAvailability: 'En 1 hora' },
  { id: 'beb-6', name: 'Refresco Fanta', price: 23, stock: 20, category: 'bebidas' },

  // Extras
  { id: 'ext-1', name: 'Orden de Cebollitas Asadas', price: 15, stock: 40, category: 'extra' },
  { id: 'ext-2', name: 'Guacamole con Totopos', price: 35, stock: 25, category: 'extra' },
  { id: 'ext-3', name: 'Orden de Nopales Asados', price: 15, stock: 20, category: 'extra' },
  { id: 'ext-4', name: 'Papas Galeana Adobadas', price: 25, stock: 0, category: 'extra', estimatedAvailability: 'Hoy a las 5:00 PM' },
  { id: 'ext-5', name: 'Salsa Extra Especial de Habanero', price: 5, stock: 100, category: 'extra' }
];

export function getStoredProducts(): Product[] {
  const stored = localStorage.getItem('spreen_products');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_PRODUCTS;
    }
  }
  localStorage.setItem('spreen_products', JSON.stringify(INITIAL_PRODUCTS));
  return INITIAL_PRODUCTS;
}

export function saveStoredProducts(products: Product[]): void {
  localStorage.setItem('spreen_products', JSON.stringify(products));
}
