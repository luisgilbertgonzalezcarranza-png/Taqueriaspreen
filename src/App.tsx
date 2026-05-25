import { useState, useEffect } from 'react';
import { Role, Product, Ticket, AccessRequest, OrderItem } from './types';
import { getStoredProducts, saveStoredProducts, INITIAL_PRODUCTS } from './data';
import RoleSelector from './components/RoleSelector';
import CustomerView from './components/CustomerView';
import AdminView from './components/AdminView';
import EmployeeView from './components/EmployeeView';

export default function App() {
  const [role, setRole] = useState<Role>('none');
  const [customerName, setCustomerName] = useState('');
  
  // Real-time state synced to LocalStorage
  const [products, setProducts] = useState<Product[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);

  // Initial load
  useEffect(() => {
    // 1. Load products
    const initialProds = getStoredProducts();
    setProducts(initialProds);

    // 2. Load tickets
    const savedTickets = localStorage.getItem('spreen_tickets');
    if (savedTickets) {
      try {
        setTickets(JSON.parse(savedTickets));
      } catch {
        setTickets(getDemoTickets());
      }
    } else {
      const demoT = getDemoTickets();
      setTickets(demoT);
      localStorage.setItem('spreen_tickets', JSON.stringify(demoT));
    }

    // 3. Load access requests
    const savedRequests = localStorage.getItem('spreen_requests');
    if (savedRequests) {
      try {
        setAccessRequests(JSON.parse(savedRequests));
      } catch {
        setAccessRequests(getDemoRequests());
      }
    } else {
      const demoReqBox = getDemoRequests();
      setAccessRequests(demoReqBox);
      localStorage.setItem('spreen_requests', JSON.stringify(demoReqBox));
    }
  }, []);

  // Demo generators for coherent start
  function getDemoTickets(): Ticket[] {
    return [
      {
        id: 'ticket-1',
        customerName: 'Gilbert Martínez',
        total: 155,
        date: '14:24:10',
        items: [
          { id: 'taco-9', name: 'Gringa de Pastor', price: 35, qty: 3, category: 'tacos' },
          { id: 'beb-1', name: 'Coca-Cola Original 355ml', price: 25, qty: 2, category: 'bebidas' }
        ]
      },
      {
        id: 'ticket-2',
        customerName: 'Sofía Aguilar',
        total: 94,
        date: '15:10:45',
        items: [
          { id: 'taco-1', name: 'Taco al Pastor', price: 18, qty: 4, category: 'tacos' },
          { id: 'beb-2', name: 'Agua de Jamaica Grande', price: 22, qty: 1, category: 'bebidas' }
        ]
      }
    ];
  }

  function getDemoRequests(): AccessRequest[] {
    return [
      {
        id: 'req-demo-1',
        name: 'Gilbert Martínez',
        role: 'cliente',
        status: 'approved',
        timestamp: '14:20'
      },
      {
        id: 'req-demo-2',
        name: 'Carlos Ruiz',
        role: 'empleado',
        status: 'pending',
        timestamp: '15:30'
      },
      {
        id: 'req-demo-3',
        name: 'Jimena López',
        role: 'cliente',
        status: 'pending',
        timestamp: '15:45'
      }
    ];
  }

  // --- ACTIONS ---

  // User submits a login authorization request
  const handleSubmitRequest = (name: string, targetRole: 'cliente' | 'empleado') => {
    const newId = 'req-' + Date.now();
    const newReq: AccessRequest = {
      id: newId,
      name,
      role: targetRole,
      status: 'pending',
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [...accessRequests, newReq];
    setAccessRequests(updated);
    localStorage.setItem('spreen_requests', JSON.stringify(updated));
  };

  // Place a new order
  const handlePlaceOrder = (items: OrderItem[], total: number) => {
    // 1. Deduct stock
    const updatedProducts = products.map(p => {
      const orderedItem = items.find(item => item.id === p.id);
      if (orderedItem) {
        return {
          ...p,
          stock: Math.max(0, p.stock - orderedItem.qty)
        };
      }
      return p;
    });

    setProducts(updatedProducts);
    saveStoredProducts(updatedProducts);

    // 2. Create ticket
    const newTicket: Ticket = {
      id: 'ticket-' + Date.now(),
      customerName: customerName || 'Cliente Anónimo',
      items,
      total,
      date: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    const updatedTickets = [...tickets, newTicket];
    setTickets(updatedTickets);
    localStorage.setItem('spreen_tickets', JSON.stringify(updatedTickets));
  };

  // Admin adds a brand new product
  const handleAddProduct = (newProd: { name: string; price: number; stock: number; category: 'tacos' | 'bebidas' | 'extra' }) => {
    const created: Product = {
      id: 'prod-' + Date.now(),
      name: newProd.name,
      price: newProd.price,
      stock: newProd.stock,
      category: newProd.category
    };

    const updated = [...products, created];
    setProducts(updated);
    saveStoredProducts(updated);
  };

  // Admin updates product directly (stock + availability)
  const handleUpdateStock = (id: string, newStock: number, estimatedAvailability?: string) => {
    const updated = products.map(p => {
      if (p.id === id) {
        return {
          ...p,
          stock: newStock,
          estimatedAvailability: newStock > 0 ? undefined : estimatedAvailability // Remove availability note if in stock again
        };
      }
      return p;
    });

    setProducts(updated);
    saveStoredProducts(updated);
  };

  // Admin deletes product from menu
  const handleDeleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    saveStoredProducts(updated);
  };

  // Admin approves Access Request
  const handleApproveRequest = (id: string) => {
    const updated = accessRequests.map(r => {
      if (r.id === id) {
        return { ...r, status: 'approved' as const };
      }
      return r;
    });
    setAccessRequests(updated);
    localStorage.setItem('spreen_requests', JSON.stringify(updated));
  };

  // Admin rejects Access Request
  const handleRejectRequest = (id: string) => {
    const updated = accessRequests.map(r => {
      if (r.id === id) {
        return { ...r, status: 'rejected' as const };
      }
      return r;
    });
    setAccessRequests(updated);
    localStorage.setItem('spreen_requests', JSON.stringify(updated));
  };

  // Employee updates stock / availability
  const handleUpdateAvailability = (id: string, estimatedTime: string | undefined, newStock?: number) => {
    const updated = products.map(p => {
      if (p.id === id) {
        return {
          ...p,
          stock: newStock !== undefined ? newStock : p.stock,
          estimatedAvailability: estimatedTime
        };
      }
      return p;
    });

    setProducts(updated);
    saveStoredProducts(updated);
  };

  const handleLogout = () => {
    setRole('none');
    setCustomerName('');
  };

  const handleSelectRole = (selectedRole: Role, name?: string) => {
    setRole(selectedRole);
    if (name) {
      setCustomerName(name);
    }
  };

  return (
    <div id="app-root-wrapper" className="min-h-screen bg-slate-900 selection:bg-orange-500 selection:text-white">
      {role === 'none' && (
        <RoleSelector
          onSelectRole={handleSelectRole}
          accessRequests={accessRequests}
          onSubmitRequest={handleSubmitRequest}
        />
      )}

      {role === 'cliente' && (
        <CustomerView
          products={products}
          customerName={customerName}
          onPlaceOrder={handlePlaceOrder}
          onLogout={handleLogout}
        />
      )}

      {role === 'admin' && (
        <AdminView
          products={products}
          tickets={tickets}
          accessRequests={accessRequests}
          onAddProduct={handleAddProduct}
          onUpdateStock={handleUpdateStock}
          onDeleteProduct={handleDeleteProduct}
          onApproveRequest={handleApproveRequest}
          onRejectRequest={handleRejectRequest}
          onLogout={handleLogout}
        />
      )}

      {role === 'empleado' && (
        <EmployeeView
          products={products}
          tickets={tickets}
          onUpdateAvailability={handleUpdateAvailability}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
