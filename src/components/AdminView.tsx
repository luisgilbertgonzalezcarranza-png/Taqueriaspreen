import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Receipt, ClipboardList, Package, UserCheck, PlusCircle, 
  Trash2, AlertTriangle, TrendingUp, LogOut, DollarSign, 
  CheckCircle, XCircle, RefreshCw, Eye
} from 'lucide-react';
import { Product, Ticket, AccessRequest, Role } from '../types';

interface AdminViewProps {
  products: Product[];
  tickets: Ticket[];
  accessRequests: AccessRequest[];
  onAddProduct: (product: { name: string; price: number; stock: number; category: 'tacos' | 'bebidas' | 'extra' }) => void;
  onUpdateStock: (id: string, newStock: number, estimatedAvailability?: string) => void;
  onDeleteProduct: (id: string) => void;
  onApproveRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
  onLogout: () => void;
}

type AdminTab = 'tickets' | 'inventario' | 'productos' | 'solicitudes';

export default function AdminView({
  products,
  tickets,
  accessRequests,
  onAddProduct,
  onUpdateStock,
  onDeleteProduct,
  onApproveRequest,
  onRejectRequest,
  onLogout
}: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('tickets');
  
  // Add product form states
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState<number | ''>('');
  const [newProdStock, setNewProdStock] = useState<number | ''>('');
  const [newProdCategory, setNewProdCategory] = useState<'tacos' | 'bebidas' | 'extra'>('tacos');
  const [formError, setFormError] = useState('');

  // Inline stock edit states
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editStockValue, setEditStockValue] = useState<number>(0);
  const [editAvailabilityValue, setEditAvailabilityValue] = useState<string>('');

  const handleAddNewProductClick = (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newProdName.trim()) {
      setFormError('El nombre del producto es requerido.');
      return;
    }
    if (newProdPrice === '' || Number(newProdPrice) <= 0) {
      setFormError('Por favor ingresa un precio válido mayor a 0.');
      return;
    }
    if (newProdStock === '' || Number(newProdStock) < 0) {
      setFormError('Por favor ingresa un stock inicial (mínimo 0).');
      return;
    }

    onAddProduct({
      name: newProdName.trim(),
      price: Number(newProdPrice),
      stock: Number(newProdStock),
      category: newProdCategory
    });

    // Reset fields
    setNewProdName('');
    setNewProdPrice('');
    setNewProdStock('');
    setFormError('');
    alert('🎉 ¡Producto agregado exitosamente al menú!');
  };

  const startEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setEditStockValue(product.stock);
    setEditAvailabilityValue(product.estimatedAvailability || '');
  };

  const saveProductEdit = (id: string) => {
    onUpdateStock(id, editStockValue, editAvailabilityValue.trim() || undefined);
    setEditingProductId(null);
  };

  // Calculations
  const totalSalesToday = tickets.reduce((acc, t) => acc + t.total, 0);
  const pendingRequestsCount = accessRequests.filter(r => r.status === 'pending').length;

  // Inventory analysis
  const outOfStockItems = products.filter(p => p.stock === 0);
  const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= 5);
  const goodStockItems = products.filter(p => p.stock > 5);

  return (
    <div id="admin-view-root" className="min-h-screen bg-slate-50 flex flex-col font-sans pb-24 border-8 border-slate-900 overflow-x-hidden">
      {/* Top Header navbar in Geometric Balance (Red theme) */}
      <header className="h-20 bg-slate-900 text-white shadow-md border-b-4 border-slate-950 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center font-black text-white text-2xl shadow-inner italic">S</div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tighter uppercase italic">
                Taquería <span className="text-red-500">Spreen</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Admin Panel</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 border border-white/20 rounded-lg hover:bg-white/10 transition-all font-black uppercase text-[10px] flex items-center gap-1 cursor-pointer"
          >
            <LogOut size={12} />
            <span>Regresar a Roles</span>
          </button>
        </div>
      </header>

      {/* Main content grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">

        {/* Live Metrics Header bar (Ventas Hoy is highly visible here!) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Sales metric (high contrast & clear) */}
          <div id="metric-sales-today" className="bg-slate-950 text-white p-5 rounded-2xl border-4 border-slate-900 shadow-[6px_6px_0px_0px_rgba(220,38,38,1)] relative overflow-hidden flex items-center justify-between">
            <div className="space-y-1 z-10">
              <span className="text-[10px] text-red-500 uppercase font-black tracking-widest font-mono block">Ventas Hoy</span>
              <p className="text-4xl font-black text-white tracking-tight" id="sales-amount-display">
                ${totalSalesToday.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">Actualizado en tiempo real</p>
            </div>
            <div className="p-4 bg-red-600/10 text-red-500 rounded-2xl z-10">
              <TrendingUp size={28} />
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl pointer-events-none"></div>
          </div>

          {/* Tickets counter */}
          <div className="bg-white p-5 rounded-2xl border-2 border-slate-200/80 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest font-mono block">Tickets Cobrados</span>
              <p className="text-3xl font-black text-slate-900">{tickets.length} órdenes</p>
              <p className="text-xs text-slate-500 font-bold">Promedio de ${(tickets.length ? totalSalesToday / tickets.length : 0).toFixed(1)} / orden</p>
            </div>
            <div className="p-3 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl">
              <Receipt size={24} />
            </div>
          </div>

          {/* Pending validations approval */}
          <div className="bg-white p-5 rounded-2xl border-2 border-slate-200/80 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest font-mono block">Solicitudes de Acceso</span>
              <p className="text-3xl font-black text-slate-900">{pendingRequestsCount} pendientes</p>
              <span className={`inline-flex items-center text-[10px] font-black px-2.5 py-1 rounded-full ${
                pendingRequestsCount > 0 ? 'bg-red-100 text-red-700 border border-red-300 animate-pulse' : 'bg-slate-100 text-slate-500'
              }`}>
                {pendingRequestsCount > 0 ? 'Requiere atención' : 'Todo al corriente'}
              </span>
            </div>
            <div className={`p-3 rounded-xl border ${pendingRequestsCount > 0 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-100 text-slate-500'}`}>
              <UserCheck size={24} />
            </div>
          </div>
        </div>

        {/* Tab contents wrapper */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 min-h-[400px] shadow-xs">
          <AnimatePresence mode="wait">
            
            {/* 1. TICKETS TAB */}
            {activeTab === 'tickets' && (
              <motion.div
                key="tab-tickets"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center border-b border-slate-150 pb-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">Historial de Ventas</h2>
                    <p className="text-xs text-slate-500">Tickets generados y aprobados hoy</p>
                  </div>
                  <span className="text-xs text-red-600 font-extrabold bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                    Total: {tickets.length} tickets
                  </span>
                </div>

                {tickets.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 space-y-2">
                    <Receipt size={40} className="mx-auto text-slate-300 stroke-1" />
                    <p className="text-sm font-semibold">No hay ventas registradas todavía</p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">Cuando los clientes realicen compras y validen sus pagos, los tickets aparecerán detallados aquí.</p>
                  </div>
                ) : (
                  <div id="tickets-history-container" className="space-y-3">
                    {[...tickets].reverse().map((ticket, idx) => (
                      <div key={ticket.id} className="p-4 bg-slate-50 hover:bg-slate-100/50 rounded-2xl border-2 border-slate-250 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-black bg-slate-900 text-white font-mono px-2 py-0.5 rounded-md">
                              TICKET #{tickets.length - idx}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold font-mono">Hora: {ticket.date}</span>
                            <span className="text-[11px] text-slate-600 font-black">• Cliente: {ticket.customerName}</span>
                          </div>
                          <div className="text-xs text-slate-600 font-semibold flex flex-wrap gap-x-2 gap-y-1">
                            {ticket.items.map(item => (
                              <span key={item.id} className="bg-white border-2 border-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-700">
                                {item.name} <strong className="text-red-600 font-black">x{item.qty}</strong>
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="text-right flex items-center md:flex-col justify-between md:justify-center border-t md:border-t-0 pt-2 md:pt-0 border-slate-200 gap-1 pl-4">
                          <span className="text-[9px] text-green-700 font-black tracking-wider uppercase bg-green-50 border border-green-300 rounded px-2 py-0.5">
                            Cobrado ✔
                          </span>
                          <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                            ${ticket.total}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* 2. INVENTARIO TAB (Dynamic tracking of stock availability) */}
            {activeTab === 'inventario' && (
              <motion.div
                key="tab-inventario"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-5"
              >
                <div className="flex justify-between items-center border-b border-slate-150 pb-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">Estado de Inventario</h2>
                    <p className="text-xs text-slate-500">Análisis coherente de existencias y desabastos</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Out of stock card */}
                  <div className="p-4 rounded-2xl bg-red-50 border-2 border-dashed border-red-200 space-y-2">
                    <div className="flex items-center justify-between text-red-700">
                      <span className="text-[10px] font-black uppercase tracking-wider font-mono">Agotados (Faltante)</span>
                      <AlertTriangle size={18} />
                    </div>
                    <p className="text-3xl font-black text-red-900">{outOfStockItems.length} productos</p>
                    <p className="text-xs text-red-600 leading-relaxed font-bold">
                      Los clientes no pueden ordenarlos. Muestran mensaje "Por el momento no lo tenemos".
                    </p>
                  </div>

                  {/* Low stock card */}
                  <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 space-y-2">
                    <div className="flex items-center justify-between text-amber-700">
                      <span className="text-[10px] font-black uppercase tracking-wider font-mono">Por agotarse (Crítico)</span>
                      <AlertTriangle size={18} />
                    </div>
                    <p className="text-3xl font-black text-amber-900">{lowStockItems.length} productos</p>
                    <p className="text-xs text-amber-700 font-bold">Inventario menor o igual a 5 pzas.</p>
                  </div>

                  {/* Healthy stock card */}
                  <div className="p-4 rounded-2xl bg-green-50 border-2 border-green-200 space-y-2">
                    <div className="flex items-center justify-between text-green-700">
                      <span className="text-[10px] font-black uppercase tracking-wider font-mono">Suficiente (OK)</span>
                      <CheckCircle size={18} />
                    </div>
                    <p className="text-3xl font-black text-green-950">{goodStockItems.length} productos</p>
                    <p className="text-xs text-green-700 font-bold">Abasto garantizado para clientes.</p>
                  </div>

                </div>

                {/* Coherent itemized lists of what we have and what is missing */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Desglose Detallado</h3>
                  
                  <div className="border-2 border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100" id="admin-inventory-report-table">
                    {products.map(product => {
                      const isLow = product.stock > 0 && product.stock <= 5;
                      const isOut = product.stock === 0;

                      return (
                        <div key={product.id} className="p-3 bg-white flex justify-between items-center text-sm">
                          <div className="space-y-0.5">
                            <span className="text-[9px] uppercase font-bold tracking-wider font-mono text-slate-400">
                              {product.category === 'tacos' ? '🌮 Taco' : product.category === 'bebidas' ? '🥤 Bebida' : '🥑 Extra'}
                            </span>
                            <p className="font-extrabold text-slate-900">{product.name}</p>
                            {isOut && product.estimatedAvailability && (
                              <p className="text-[10px] text-red-600 font-mono font-bold">
                                🕒 Disponibilidad estimada: {product.estimatedAvailability}
                              </p>
                            )}
                          </div>

                          <div className="text-right flex items-center space-x-3">
                            <div className="space-y-0.5">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-black font-mono border ${
                                isOut 
                                  ? 'bg-red-100 text-red-700 border-red-300' 
                                  : isLow 
                                    ? 'bg-amber-100 text-amber-700 border-amber-300' 
                                    : 'bg-slate-100 text-slate-600 border-slate-300'
                              }`}>
                                {product.stock} pzas
                              </span>
                              <p className={`text-[10px] font-black uppercase text-right tracking-wider ${
                                isOut ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-slate-400'
                              }`}>
                                {isOut ? 'Faltante ❌' : isLow ? 'Reabastecer ⚠️' : 'Disponible ✔'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </motion.div>
            )}

            {/* 3. PRODUCTOS TAB (Option separate from inventory with "Agregar" action) */}
            {activeTab === 'productos' && (
              <motion.div
                key="tab-productos"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                
                {/* List and inline editing (occupies 2 cols) */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="border-b border-slate-150 pb-2">
                    <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tight font-sans">Gestión de Menú</h2>
                    <p className="text-xs text-slate-500">Inspecciona y edita existencias o elimina del catálogo</p>
                  </div>

                  <div id="admin-product-editor-list" className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {products.map(product => {
                      const isEditing = editingProductId === product.id;
                      
                      return (
                        <div key={product.id} className="p-3 bg-white w-full rounded-2xl border-2 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition hover:border-slate-450 hover:bg-slate-50/40">
                          <div className="space-y-0.5 flex-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                              {product.category === 'tacos' ? '🌮 Taco' : product.category === 'bebidas' ? '🥤 Bebida' : '🥑 Extra'}
                            </span>
                            <span className="font-extrabold text-slate-900 text-sm block">{product.name}</span>
                            <span className="text-xs text-red-600 font-extrabold font-mono">${product.price} por pieza</span>
                          </div>

                          {isEditing ? (
                            <div className="bg-white p-3 rounded-xl border-2 border-slate-900 w-full sm:w-auto space-y-2 flex-shrink-0">
                              <div className="flex items-center space-x-2">
                                <label className="text-xs text-slate-500 font-mono font-bold">Stock:</label>
                                <input
                                  type="number"
                                  className="w-16 border rounded px-1.5 py-0.5 text-xs font-bold text-center"
                                  value={editStockValue}
                                  onChange={(e) => setEditStockValue(Math.max(0, parseInt(e.target.value) || 0))}
                                />
                              </div>
                              <div className="flex flex-col space-y-0.5">
                                <label className="text-[10px] text-slate-400 uppercase font-black font-mono">Disponibilidad Estimada:</label>
                                <input
                                  type="text"
                                  placeholder="Ej: A las 5:00 PM o Mañana"
                                  value={editAvailabilityValue}
                                  className="border rounded px-2 py-1 text-xs text-slate-700 font-semibold"
                                  onChange={(e) => setEditAvailabilityValue(e.target.value)}
                                />
                              </div>
                              <div className="flex space-x-2 pt-1 justify-end">
                                <button
                                  onClick={() => setEditingProductId(null)}
                                  className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg transition border border-slate-200"
                                >
                                  Cancelar
                                </button>
                                <button
                                  onClick={() => saveProductEdit(product.id)}
                                  className="px-2.5 py-1 bg-red-650 bg-red-600 text-white text-xs font-bold rounded-lg transition"
                                >
                                  Guardar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                              <div className="text-right sm:mr-3">
                                <span className={`text-xs px-2.5 py-0.5 font-black font-mono rounded-lg border ${
                                  product.stock === 0 ? 'bg-red-100 text-red-700 border-red-200' : 'bg-slate-150 text-slate-700 border-slate-100'
                                }`}>
                                  {product.stock} u.
                                </span>
                                {product.estimatedAvailability && product.stock === 0 && (
                                  <span className="text-[9px] text-slate-400 block max-w-[100px] truncate">{product.estimatedAvailability}</span>
                                )}
                              </div>

                              <div className="flex space-x-1.5">
                                <button
                                  onClick={() => startEditProduct(product)}
                                  className="px-2.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 hover:bg-slate-800"
                                >
                                  <span>Editar</span>
                                </button>
                                <button
                                  onClick={() => onDeleteProduct(product.id)}
                                  className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition border border-slate-200"
                                  title="Eliminar producto"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Form to add products - "Agregar nuevo producto ya sea bebida o taco" */}
                <div className="bg-slate-50 border-2 border-slate-900 p-5 shadow-[6px_6px_0px_0px_rgba(239,68,68,1)] rounded-2xl h-fit space-y-4">
                  <div className="pb-2 border-b border-slate-200">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5 uppercase italic">
                      <PlusCircle size={18} className="text-red-600" />
                      <span>Agregar Producto</span>
                    </h3>
                    <p className="text-xs text-slate-500">Inserta un nuevo taco, bebida o extra al menú</p>
                  </div>

                  <form onSubmit={handleAddNewProductClick} className="space-y-4">
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block font-mono">Nombre del Producto</label>
                      <input
                        type="text"
                        id="new-product-name-input"
                        placeholder="Ej. Taco de Pastor con Queso"
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        className="w-full bg-white border border-slate-250 rounded px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-900"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block font-mono">Categoría</label>
                      <select
                        id="new-product-category-select"
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value as any)}
                        className="w-full bg-white border border-slate-250 rounded px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                      >
                        <option value="tacos">🌮 Tacos / Al Pastor</option>
                        <option value="bebidas">🥤 Bebidas y Aguas Frescas</option>
                        <option value="extra">🥑 Guarniciones y Extras</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block font-mono">Precio ($)</label>
                        <input
                          type="number"
                          id="new-product-price-input"
                          placeholder="18"
                          value={newProdPrice}
                          onChange={(e) => setNewProdPrice(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value)))}
                          className="w-full bg-white border border-slate-250 rounded px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-900 text-center"
                          required
                          min={1}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block font-mono">Stock Inicial</label>
                        <input
                          type="number"
                          id="new-product-stock-input"
                          placeholder="50"
                          value={newProdStock}
                          onChange={(e) => setNewProdStock(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value)))}
                          className="w-full bg-white border border-slate-250 rounded px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-900 text-center"
                          required
                          min={0}
                        />
                      </div>
                    </div>

                    {formError && (
                      <p className="text-xs text-red-500 font-bold bg-white border border-red-100 p-2 rounded">
                        ⚠️ {formError}
                      </p>
                    )}

                    <button
                      type="submit"
                      id="add-product-submit"
                      className="w-full bg-red-650 bg-red-600 hover:bg-slate-900 text-white font-black py-2.5 rounded transition text-xs uppercase tracking-wider flex items-center justify-center space-x-1 cursor-pointer shadow-lg shadow-red-600/10"
                    >
                      <span>Agregar al Menú</span>
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* 4. SOLICITUDES TAB */}
            {activeTab === 'solicitudes' && (
              <motion.div
                key="tab-solicitudes"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center border-b border-slate-150 pb-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">Solicitudes de Inicio de Sesión</h2>
                    <p className="text-xs text-slate-500">Autoriza usuarios para clientes o empleados al crear una cuenta</p>
                  </div>
                  <span className="text-xs text-red-600 font-extrabold bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                    Aprobados: {accessRequests.filter(r => r.status === 'approved').length}
                  </span>
                </div>

                {accessRequests.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 space-y-2">
                    <UserCheck size={40} className="mx-auto text-slate-300 stroke-1" />
                    <p className="text-sm font-semibold">No hay solicitudes de registro registradas</p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Cuando un cliente o empleado intente ingresar vía registro de acceso, su solicitud se enlistará aquí para su respectiva autorización.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3" id="access-requests-list">
                    {accessRequests.map(request => (
                      <div key={request.id} className="p-4 bg-white rounded-2xl border-2 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <strong className="text-slate-900 text-base font-black uppercase tracking-tight">{request.name}</strong>
                            <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded ${
                              request.role === 'cliente' ? 'bg-red-50 text-red-650 text-red-600 border border-red-200' : 'bg-slate-900 text-slate-150 border border-slate-800'
                            }`}>
                              {request.role === 'cliente' ? 'Cliente' : 'Empleado'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-bold">Solicitud registrada: {request.timestamp}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          {request.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => onRejectRequest(request.id)}
                                className="px-3 py-1.5 border-2 border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                              >
                                <XCircle size={14} className="text-red-500" />
                                <span>Rechazar</span>
                              </button>
                              <button
                                onClick={() => onApproveRequest(request.id)}
                                className="px-3 py-1.5 bg-red-600 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-md shadow-red-500/15 cursor-pointer"
                              >
                                <CheckCircle size={14} />
                                <span>Autorizar</span>
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center space-x-1.5 text-xs text-green-700 font-bold font-mono bg-green-50 border border-green-200 px-3 py-1 rounded-xl">
                              <CheckCircle size={14} />
                              <span>{request.status === 'approved' ? 'AUTORIZADO ✔' : 'RECHAZADO ✕'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>

      {/* Modern Active Bottom Nav for Admin Dashboard */}
      <nav id="admin-bottom-nav-bar" className="fixed bottom-0 left-0 right-0 bg-slate-950 border-t-2 border-slate-900 shadow-2xl z-45 py-3">
        <div className="max-w-md mx-auto px-6 flex justify-between items-center text-slate-400">
          
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex flex-col items-center space-y-1 transition text-center cursor-pointer ${
              activeTab === 'tickets' ? 'text-red-500 font-black scale-105' : 'hover:text-white'
            }`}
          >
            <Receipt size={20} />
            <span className="text-[10px] tracking-tight uppercase font-mono">Tickets</span>
          </button>

          <button
            onClick={() => setActiveTab('inventario')}
            className={`flex flex-col items-center space-y-1 transition text-center cursor-pointer ${
              activeTab === 'inventario' ? 'text-red-500 font-black scale-105' : 'hover:text-white'
            }`}
          >
            <ClipboardList size={20} />
            <span className="text-[10px] tracking-tight uppercase font-mono">Inventario</span>
          </button>

          <button
            onClick={() => setActiveTab('productos')}
            className={`flex flex-col items-center space-y-1 transition text-center cursor-pointer ${
              activeTab === 'productos' ? 'text-red-500 font-black scale-105' : 'hover:text-white'
            }`}
          >
            <Package size={20} />
            <span className="text-[10px] tracking-tight uppercase font-mono">Productos</span>
          </button>

          <button
            onClick={() => setActiveTab('solicitudes')}
            className={`flex flex-col items-center space-y-1 transition relative text-center cursor-pointer ${
              activeTab === 'solicitudes' ? 'text-red-500 font-black scale-105' : 'hover:text-white'
            }`}
          >
            <UserCheck size={20} />
            <span className="text-[10px] tracking-tight uppercase font-mono">Solicitudes</span>
            {pendingRequestsCount > 0 && (
              <span className="absolute -top-1.5 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-slate-950"></span>
            )}
          </button>

        </div>
      </nav>
    </div>
  );
}
