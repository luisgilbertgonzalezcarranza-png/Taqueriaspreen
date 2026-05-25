import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Clipboard, Package, Check, LogOut, Edit3, Plus, UtensilsCrossed, AlertCircle, RefreshCw } from 'lucide-react';
import { Product, Ticket } from '../types';

interface EmployeeViewProps {
  products: Product[];
  tickets: Ticket[];
  onUpdateAvailability: (id: string, estimatedTime: string | undefined, newStock?: number) => void;
  onLogout: () => void;
}

export default function EmployeeView({
  products,
  tickets,
  onUpdateAvailability,
  onLogout
}: EmployeeViewProps) {
  const [activeTab, setActiveTab ] = useState<'cocina' | 'inventario'>('cocina');
  
  // Dialog state for setting restock availability
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [estimatedTimeStr, setEstimatedTimeStr] = useState('');
  const [restockQty, setRestockQty] = useState<number | ''>('');

  const outOfStockItems = products.filter(p => p.stock === 0);

  const handleOpenRestockModal = (product: Product) => {
    setSelectedProduct(product);
    setEstimatedTimeStr(product.estimatedAvailability || '');
    setRestockQty('');
  };

  const handleSaveRestock = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const finalStock = restockQty !== '' && Number(restockQty) > 0 ? Number(restockQty) : undefined;
    const finalTime = estimatedTimeStr.trim() || undefined;

    onUpdateAvailability(selectedProduct.id, finalTime, finalStock);
    setSelectedProduct(null);
    alert('👍 ¡Información de disponibilidad actualizada correctamente!');
  };

  return (
    <div id="employee-view-root" className="min-h-screen bg-slate-50 flex flex-col font-sans pb-24 border-8 border-slate-900 overflow-x-hidden">
      {/* Top Header navbar in Geometric Balance (Red theme) */}
      <header className="h-20 bg-slate-900 text-white shadow-md border-b-4 border-slate-950 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center font-black text-white text-2xl shadow-inner italic">S</div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tighter uppercase italic">
                Taquería <span className="text-red-500">Spreen</span>
              </h1>
              <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Portal del Empleado</span>
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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        
        {/* Banner Informative showing out of stock warnings */}
        {outOfStockItems.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-red-600/10 text-red-600 rounded-xl mt-0.5 border border-red-200">
                <AlertCircle size={20} />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-red-900 text-sm uppercase italic tracking-tight">Productos Agotados ({outOfStockItems.length})</h3>
                <p className="text-xs text-red-700 font-semibold leading-relaxed max-w-xl">
                  Hay tacos o bebidas sin stock. Establece cuándo volverán a estar disponibles para informar adecuadamente a los clientes en su menú.
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setActiveTab('inventario')}
              className="px-4 py-2 bg-slate-900 hover:bg-red-600 text-white rounded text-xs font-black uppercase tracking-wider transition duration-150 whitespace-nowrap self-start sm:self-center cursor-pointer"
            >
              <span>Actualizar Disponibilidad</span>
            </button>
          </div>
        )}

        {/* View content card */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 min-h-[400px]">
          <AnimatePresence mode="wait">

            {/* TAB 1: KITCHEN MONITORS */}
            {activeTab === 'cocina' && (
              <motion.div
                key="tab-cocina"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center border-b border-slate-150 pb-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">Monitor de Cocina 🍳</h2>
                    <p className="text-xs text-slate-500">Prepara las deliciosas órdenes listadas de hoy</p>
                  </div>
                  <span className="text-xs text-red-600 font-extrabold bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                    Cola: {tickets.length} órdenes recibidas
                  </span>
                </div>

                {tickets.length === 0 ? (
                  <div className="py-24 text-center text-slate-400 space-y-3">
                    <UtensilsCrossed size={48} className="mx-auto text-slate-300 stroke-1 animate-pulse" />
                    <p className="text-sm font-semibold">Esperando nuevas órdenes de clientes...</p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Las compras de los clientes se reflejarán instantáneamente aquí para que los cocineros inicien la producción.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...tickets].reverse().map((ticket, index) => (
                      <div key={ticket.id} className="border-2 border-slate-900 rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] bg-slate-50 flex flex-col justify-between">
                        <div>
                          <div className="bg-slate-900 text-white p-3 flex justify-between items-center">
                            <span className="text-[10px] font-black font-mono tracking-widest uppercase">ORDEN #{tickets.length - index}</span>
                            <span className="text-[10px] text-slate-400 font-mono font-bold">{ticket.date}</span>
                          </div>
                          <div className="p-4 space-y-3">
                            <p className="text-xs font-bold text-slate-500">Cliente: <strong className="text-slate-950 font-black">{ticket.customerName}</strong></p>
                            
                            <div className="space-y-1.5 pt-1">
                              {ticket.items.map(item => (
                                <div key={item.id} className="flex justify-between text-xs pb-1 border-b border-slate-200/60">
                                  <span className="text-slate-800 font-bold">{item.name}</span>
                                  <span className="font-extrabold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded font-mono">
                                    x{item.qty}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="p-4 pt-0">
                          <div className="pt-2 flex justify-between items-end border-t border-slate-100">
                            <div>
                              <span className="text-[8px] text-slate-400 uppercase font-black block font-mono">Total pagado</span>
                              <span className="text-base font-black text-slate-900 font-mono">${ticket.total}</span>
                            </div>
                            <span className="inline-flex items-center text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded bg-green-55 bg-green-50 border border-green-200 text-green-700">
                              Listo para Entrega ✔
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 2: INVENTARIO / ESTIMATED AVAILABILITY */}
            {activeTab === 'inventario' && (
              <motion.div
                key="tab-inventario"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center border-b border-slate-150 pb-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">Existencias y Disponibilidad</h2>
                    <p className="text-xs text-slate-500">Actualiza cuándo estarán disponibles los productos en desabasto</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {products.map(product => {
                    const isOut = product.stock === 0;

                    return (
                      <div key={product.id} className="p-3 bg-white w-full rounded-2xl border-2 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition hover:border-slate-450 hover:bg-slate-50/45">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                              {product.category === 'tacos' ? '🌮 Taco' : product.category === 'bebidas' ? '🥤 Bebida' : '🥑 Extra'}
                            </span>
                            <strong className="text-slate-900 text-sm font-black uppercase tracking-tight">{product.name}</strong>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            {isOut ? (
                              <span className="text-[9px] text-red-650 text-red-600 bg-red-150 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-black uppercase">Agotado ❌</span>
                            ) : (
                              <span className="text-[9px] text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded font-black uppercase">{product.stock} en stock ✔</span>
                            )}
                            {product.estimatedAvailability && (
                              <span className="text-[11px] text-slate-500 font-bold italic">⭐ Se muestra: "Por el momento no lo tenemos - Disponible: {product.estimatedAvailability}"</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-end flex-shrink-0">
                          <button
                            onClick={() => handleOpenRestockModal(product)}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-red-600 text-white rounded text-xs font-black uppercase tracking-wider transition flex items-center space-x-1 cursor-pointer"
                          >
                            <Clock size={14} />
                            <span>Definir disponibilidad / Reabastecer</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* Restock & Availability Modal Form */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] border-2 border-slate-900 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b-2 border-slate-900">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 uppercase italic">
                <Clock className="text-red-600" size={16} />
                <span>Actualizar Disponibilidad</span>
              </h3>
              <button onClick={() => setSelectedProduct(null)} className="text-slate-400 hover:text-slate-900 font-extrabold cursor-pointer p-1">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 font-semibold">
              Configura cuándo estará disponible el producto <strong className="text-slate-850 text-slate-900 font-black uppercase italic">{selectedProduct.name}</strong> para los clientes, o reabastece el stock directamente.
            </p>

            <form onSubmit={handleSaveRestock} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block font-mono">Definir disponibilidad estimada</label>
                <input
                  type="text"
                  placeholder="Ej: A las 7:00 PM o Mañana"
                  value={estimatedTimeStr}
                  onChange={(e) => setEstimatedTimeStr(e.target.value)}
                  className="w-full border-2 border-slate-200 bg-white rounded px-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 font-bold transition"
                />
                <span className="text-[9px] text-slate-400 block font-semibold leading-tight">
                  Este mensaje aparecerá en el menú del cliente cuando el stock sea 0.
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block font-mono">¿Reabastecer stock ahora?</label>
                <input
                  type="number"
                  placeholder="Ingresa número de unidades"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value)))}
                  className="w-full border-2 border-slate-200 bg-white rounded px-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 font-bold transition"
                  min={1}
                />
                <span className="text-[9px] text-slate-400 block font-semibold leading-tight">
                  Al reabastecer stock (mínimo 1 pza), el estado volverá a "Disponible" para los clientes.
                </span>
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="w-1/3 border-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-sans font-extrabold rounded transition text-xs py-2 uppercase cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-red-600 hover:bg-slate-900 text-white font-sans font-black rounded transition text-xs py-2 uppercase cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern Empleado Bottom Nav for simple transition */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950 border-t-2 border-slate-900 shadow-2xl z-45 py-3">
        <div className="max-w-xs mx-auto px-6 flex justify-between items-center text-slate-400">
          
          <button
            onClick={() => setActiveTab('cocina')}
            className={`flex flex-col items-center space-y-1 transition text-center cursor-pointer ${
              activeTab === 'cocina' ? 'text-red-500 font-black scale-105' : 'hover:text-white'
            }`}
          >
            <Clipboard size={20} />
            <span className="text-[10px] tracking-tight uppercase font-mono">Cocina y Órdenes</span>
          </button>

          <button
            onClick={() => setActiveTab('inventario')}
            className={`flex flex-col items-center space-y-1 transition text-center cursor-pointer ${
              activeTab === 'inventario' ? 'text-red-500 font-black scale-105' : 'hover:text-white'
            }`}
          >
            <Package size={20} />
            <span className="text-[10px] tracking-tight uppercase font-mono">Inventario</span>
          </button>

        </div>
      </nav>
    </div>
  );
}
