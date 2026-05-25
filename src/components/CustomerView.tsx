import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Plus, Minus, Trash2, CreditCard, Sparkles, Check, Truck, UtensilsCrossed, LogOut } from 'lucide-react';
import { Product, OrderItem } from '../types';
import confetti from 'canvas-confetti';

interface CustomerViewProps {
  products: Product[];
  customerName: string;
  onPlaceOrder: (items: OrderItem[], total: number) => void;
  onLogout: () => void;
}

export default function CustomerView({ products, customerName, onPlaceOrder, onLogout }: CustomerViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'tacos' | 'bebidas' | 'extra'>('tacos');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isOrderPanelOpen, setIsOrderPanelOpen] = useState(false);
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);

  // Success screen state
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Filter products by active category
  const filteredProducts = products.filter(p => p.category === selectedCategory);

  // Add to cart with designated initial quantity
  const handleAddToCart = (product: Product, quantityToAdd: number = 1) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      
      // Calculate current total quantity if added
      const currentQtyInCart = existing ? existing.qty : 0;
      const newQty = currentQtyInCart + quantityToAdd;

      if (newQty > product.stock) {
        alert(`¡Ups! Solo quedan ${product.stock} unidades de este producto.`);
        return prevCart;
      }

      setIsOrderPanelOpen(true); // Auto-open order tab

      if (existing) {
        return prevCart.map(item => 
          item.id === product.id ? { ...item, qty: newQty } : item
        );
      } else {
        return [...prevCart, {
          id: product.id,
          name: product.name,
          price: product.price,
          qty: quantityToAdd,
          category: product.category
        }];
      }
    });
  };

  const handleUpdateCartQty = (productId: string, newQty: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQty <= 0) {
      setCart(prev => prev.filter(item => item.id !== productId));
      return;
    }

    if (newQty > product.stock) {
      alert(`No es posible pedir más de las existencias (${product.stock} disponibles).`);
      return;
    }

    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, qty: newQty } : item
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  };

  const handleOpenPayment = () => {
    if (cart.length === 0) return;
    setCardNumber('');
    setCardHolder(customerName);
    setExpiry('');
    setCvv('');
    setPaymentError('');
    setShowPaymentModal(true);
  };

  const handleProcessPayment = (e: FormEvent) => {
    e.preventDefault();
    setPaymentError('');

    // Slashes and space cleaners
    const rawCard = cardNumber.replace(/\s+/g, '');
    const rawExpiry = expiry.replace(/\//g, '').trim();

    if (rawCard.length < 16 || isNaN(Number(rawCard))) {
      setPaymentError('Por favor introduce un número de tarjeta válido (16 dígitos).');
      return;
    }
    if (!cardHolder.trim()) {
      setPaymentError('Nombre del titular de la tarjeta es requerido.');
      return;
    }
    if (rawExpiry.length < 4 || isNaN(Number(rawExpiry))) {
      setPaymentError('Fecha de expiración inválida (MMAA).');
      return;
    }
    if (cvv.length < 3 || isNaN(Number(cvv))) {
      setPaymentError('Código de seguridad (CVV) inválido.');
      return;
    }

    // Direct simulated confirmation with micro loading delay
    setIsProcessingReceipt(true);
    setTimeout(() => {
      setIsProcessingReceipt(false);
      setShowPaymentModal(false);
      
      // Emit trigger
      onPlaceOrder(cart, calculateTotal());
      
      // Clear local cart
      setCart([]);
      setIsOrderPanelOpen(false);
      
      // Show order arrival confirmation with confetti
      setShowSuccessModal(true);

      // Trigger Confetti explosion
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f97316', '#10b981', '#3b82f6', '#ffb703', '#e11d48']
      });

      // Simple sub-explosions to make it ultra vibrant and fun!
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
      }, 250);
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 400);

    }, 1500);
  };

  return (
    <div id="customer-view-root" className="min-h-screen bg-slate-50 flex flex-col font-sans border-8 border-slate-900 overflow-x-hidden">
      {/* Top Header navbar in Geometric Balance (Red theme) */}
      <header className="h-20 bg-red-600 flex items-center justify-between px-4 sm:px-8 shadow-md shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-black text-red-600 text-2xl shadow-inner italic">S</div>
          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tighter uppercase italic">Taquería Spreen</h1>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-6 text-white font-bold">
          <span className="bg-slate-900/20 px-3 sm:px-4 py-1.5 rounded-full text-xs flex items-center gap-2 border border-white/20">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="hidden sm:inline">Cliente:</span> {customerName}
          </span>
          
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest">
            {/* Toggle cart button */}
            <button
              onClick={() => setIsOrderPanelOpen(!isOrderPanelOpen)}
              className="relative p-2 bg-slate-900/45 hover:bg-slate-950 rounded-lg transition text-white border border-white/10 flex items-center gap-1 cursor-pointer"
              title="Ver mi orden"
            >
              <ShoppingBag size={16} />
              {cart.length > 0 && (
                <span className="bg-white text-red-600 rounded-full text-[10px] font-black px-1.5 py-0.5">
                  {cart.reduce((s, i) => s + i.qty, 0)}
                </span>
              )}
            </button>

            {/* Log Out button */}
            <button
              onClick={onLogout}
              className="px-3 py-1.5 border border-white/40 rounded-lg hover:bg-white/10 transition-all font-black uppercase text-[10px] cursor-pointer"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Areas split with sidebar cart */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6">
        
        {/* Menu Section (left/main pane) */}
        <div className="flex-1 space-y-6">
          
          {/* Categories Grid Navbar inside sidebar/nav layout */}
          <div>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em] mb-3">
              Categorías
            </p>
            <div id="customer-categories" className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setSelectedCategory('tacos')}
                className={`w-full px-4 py-3 rounded-xl flex justify-between items-center transition-all cursor-pointer border ${
                  selectedCategory === 'tacos'
                    ? 'bg-red-600 text-white font-bold border-red-600 shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border-transparent font-bold'
                }`}
              >
                <span className="font-bold uppercase tracking-wide text-xs sm:text-sm">Tacos</span>
                <span className="text-lg">🌮</span>
              </button>

              <button
                onClick={() => setSelectedCategory('bebidas')}
                className={`w-full px-4 py-3 rounded-xl flex justify-between items-center transition-all cursor-pointer border ${
                  selectedCategory === 'bebidas'
                    ? 'bg-red-600 text-white font-bold border-red-600 shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border-transparent font-bold'
                }`}
              >
                <span className="font-bold uppercase tracking-wide text-xs sm:text-sm">Bebidas</span>
                <span className="text-lg">🥤</span>
              </button>

              <button
                onClick={() => setSelectedCategory('extra')}
                className={`w-full px-4 py-3 rounded-xl flex justify-between items-center transition-all cursor-pointer border ${
                  selectedCategory === 'extra'
                    ? 'bg-red-600 text-white font-bold border-red-600 shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border-transparent font-bold'
                }`}
              >
                <span className="font-bold uppercase tracking-wide text-xs sm:text-sm">Extras</span>
                <span className="text-lg">🥑</span>
              </button>
            </div>
          </div>

          {/* Products Feed Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">
                Menú de {selectedCategory === 'tacos' ? 'Especialidades' : selectedCategory === 'bebidas' ? 'Refrescos' : 'Extras'}
              </h2>
              <span className="text-[10px] text-slate-500 bg-slate-200/50 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                {filteredProducts.length} listados
              </span>
            </div>

            <div id="customer-products-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map(product => {
                  const isOutOfStock = product.stock <= 0;
                  const itemInCart = cart.find(i => i.id === product.id);
                  const currentQtyInCart = itemInCart ? itemInCart.qty : 0;
                  
                  return (
                    <motion.div
                      layout
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`p-4 rounded-2xl border-2 flex flex-col justify-between relative overflow-hidden transition-all ${
                        isOutOfStock 
                          ? 'bg-slate-50 border-dashed border-slate-200 grayscale opacity-65 min-h-[160px]' 
                          : 'bg-white border-slate-150 shadow-sm focus-within:border-slate-900 hover:border-slate-300 min-h-[160px]'
                      }`}
                    >
                      {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center rotate-[-4deg] z-10 pointer-events-none">
                           <div className="bg-red-600 text-white px-4 py-1.5 font-black uppercase text-xs shadow-xl tracking-tight border border-white">
                             Por el momento no lo tenemos
                           </div>
                        </div>
                      )}

                      {/* Product Content */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-1">
                          <div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                              {product.name}
                            </h3>
                            <p className="text-slate-400 text-xs italic">De la casa con todo el sazón</p>
                          </div>
                          <span className="text-red-600 font-black text-xl whitespace-nowrap">
                            ${product.price}
                          </span>
                        </div>

                        {/* Availability and warning badges */}
                        {!isOutOfStock && (
                          <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              product.stock <= 5 ? 'bg-red-600 animate-pulse' : 'bg-green-500'
                            }`} />
                            Quedan {product.stock} unidades
                          </div>
                        )}
                        {isOutOfStock && product.estimatedAvailability && (
                          <p className="text-[10px] text-slate-400 font-mono tracking-tight">
                            🕒 ESTIMADO: {product.estimatedAvailability}
                          </p>
                        )}
                      </div>

                      {/* Add controls or counter */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        {isOutOfStock ? (
                          <button className="bg-slate-300 text-slate-500 px-4 py-2 rounded-lg font-bold text-xs uppercase cursor-not-allowed">
                            Agotado
                          </button>
                        ) : (
                          <div className="flex items-center justify-between w-full gap-2">
                            {currentQtyInCart > 0 ? (
                              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden w-full justify-between">
                                <button
                                  onClick={() => handleUpdateCartQty(product.id, currentQtyInCart - 1)}
                                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-200 text-slate-600 font-black transition cursor-pointer"
                                  type="button"
                                >
                                  -
                                </button>
                                <span className="px-4 py-1.5 bg-white font-black text-sm text-slate-900">{currentQtyInCart}</span>
                                <button
                                  onClick={() => handleUpdateCartQty(product.id, currentQtyInCart + 1)}
                                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-200 text-slate-600 font-black transition cursor-pointer"
                                  type="button"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleAddToCart(product)}
                                className="w-full bg-slate-900 hover:bg-red-600 text-white font-black uppercase text-xs tracking-wider py-2.5 rounded-lg transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Plus size={14} />
                                <span>Agregar</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        {/* RIGHT SIDEBAR - TICKET DE ORDEN */}
        <aside className="w-full lg:w-72 bg-white border border-slate-200 flex flex-col shrink-0 h-[calc(100vh-140px)] lg:sticky lg:top-24 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <h3 className="text-base font-black text-slate-900 tracking-tight uppercase">TICKET DE ORDEN</h3>
            <p className="text-[10px] text-slate-400 font-mono uppercase">#SP-491-0419</p>
          </div>
          
          <div className="flex-1 p-6 space-y-4 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <UtensilsCrossed size={32} className="mx-auto text-slate-300 stroke-1" />
                <p className="text-xs font-black uppercase tracking-tight text-slate-500">Vacío</p>
                <p className="text-[10px] text-slate-400 max-w-[170px] mx-auto">Selecciona taquitos con todo del menú.</p>
              </div>
            ) : (
              <div className="space-y-3 divide-y divide-slate-100" id="order-sidebar-items-list">
                {cart.map((item, index) => (
                  <div key={item.id} className={`pt-2 flex justify-between items-start text-xs ${index === 0 ? 'pt-0 border-0' : 'pt-2 border-t'}`}>
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 font-mono tracking-wider uppercase block">
                        {item.category === 'tacos' ? 'Tacos' : item.category === 'bebidas' ? 'Bebidas' : 'Extras'}
                      </span>
                      <p className="font-bold text-slate-800 leading-tight">{item.qty}x {item.name}</p>
                    </div>
                    <span className="text-slate-900 font-bold">${item.price * item.qty}</span>
                  </div>
                ))}
              </div>
            )}
            
            {cart.length > 0 && (
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-1.5">
                <div className="flex justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <span>Subtotal</span>
                  <span>${calculateTotal()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>Salsas & Limones</span>
                  <span className="text-green-600 font-mono">$0</span>
                </div>
                <div className="flex justify-between text-slate-900 font-black text-lg mt-2 italic uppercase">
                  <span>Total</span>
                  <span id="order-sidebar-total">${calculateTotal()}</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 space-y-3 bg-slate-50 border-t border-slate-200">
            <button
              onClick={handleOpenPayment}
              disabled={cart.length === 0}
              className={`w-full py-4 rounded-2xl font-black text-base transition-all uppercase italic flex items-center justify-center gap-2 ${
                cart.length > 0
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/10 hover:shadow-red-650/20 active:scale-95 cursor-pointer hover:bg-slate-950'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CreditCard size={18} />
              <span>Obtener Orden</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Credit Card Verification Modal - Geometric Balance (Geometric frame details) */}
      {showPaymentModal && (
        <div id="payment-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border-4 border-slate-900 max-w-md w-full p-6 shadow-[8px_8px_0px_0px_rgba(239,68,68,1)] relative space-y-4">
            <div className="flex justify-between items-center pb-2 border-b-2 border-slate-900">
              <h3 className="font-extrabold text-slate-900 uppercase italic tracking-tight text-lg flex items-center gap-1.5">
                <CreditCard className="text-red-600 animate-pulse" size={20} />
                <span>Verificación de Pago</span>
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-900 font-black text-sm p-1 cursor-pointer hover:text-red-600"
                disabled={isProcessingReceipt}
              >
                ✕
              </button>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <p className="text-[10px] text-blue-600 font-black uppercase mb-1">Verificación de Pago Sencilla</p>
              <span className="text-blue-900 font-bold text-xs tracking-tight">Utiliza los datos de tu tarjeta para que los empleados valen y despachen instantáneamente.</span>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Número de Tarjeta</label>
                <input
                  type="text"
                  id="card-number-input"
                  maxLength={16}
                  placeholder="4000 1234 5678 9010"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full border-2 border-slate-200 bg-slate-50 rounded px-4 py-2 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition"
                  required
                  disabled={isProcessingReceipt}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Titular de Tarjeta</label>
                <input
                  type="text"
                  id="card-holder-input"
                  placeholder="Luis Gilbert Pérez"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full border-2 border-slate-200 bg-slate-50 rounded px-4 py-2 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition"
                  required
                  disabled={isProcessingReceipt}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Expiración (MMAA)</label>
                  <input
                    type="text"
                    id="card-expiry-input"
                    maxLength={4}
                    placeholder="1228"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value.replace(/\D/g, ''))}
                    className="w-full border-2 border-slate-200 bg-slate-50 rounded px-4 py-2 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition text-center"
                    required
                    disabled={isProcessingReceipt}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">CVV (Seguridad)</label>
                  <input
                    type="password"
                    id="card-cvv-input"
                    maxLength={3}
                    placeholder="•••"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    className="w-full border-2 border-slate-200 bg-slate-50 rounded px-4 py-2 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition text-center"
                    required
                    disabled={isProcessingReceipt}
                  />
                </div>
              </div>

              {paymentError && (
                <p className="text-xs text-red-650 text-red-600 font-bold bg-red-50 border border-red-100 p-2 rounded">
                  ⚠️ {paymentError}
                </p>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={isProcessingReceipt}
                  className="w-1/3 border-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-black uppercase text-[10px] rounded transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="confirm-payment-btn"
                  disabled={isProcessingReceipt}
                  className="w-2/3 bg-red-600 hover:bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest py-3 rounded transition flex items-center justify-center space-x-2 cursor-pointer shadow-lg"
                >
                  {isProcessingReceipt ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Confirmar Pago (${calculateTotal()})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal - styled EXACTLY like the overlay feedback mockup (Confetti mockup in Design HTML) */}
      {showSuccessModal && (
        <div id="success-modal" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-80 bg-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(239,68,68,1)] p-6 flex flex-col items-center text-center relative pointer-events-auto"
          >
            <div className="text-5xl mb-2 animate-bounce">🎉</div>
            <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">Tu orden ya está en camino</h2>
            <p className="text-sm text-slate-500 font-semibold mb-4">Buen provecho, {customerName}.</p>
            <p className="text-[11px] text-slate-400 font-mono tracking-normal leading-relaxed pb-3">
              Nuestros taqueros ya tienen tu comanda en el asador. ¡Sigue el progreso de tu orden desde esta pestaña!
            </p>

            <button
              id="success-dismiss-btn"
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-slate-900 hover:bg-red-600 text-white font-black uppercase text-xs py-3 rounded transition cursor-pointer"
            >
              ¡Recibir Orden!
            </button>
          </motion.div>
        </div>
      )}

    </div>
  );
}
