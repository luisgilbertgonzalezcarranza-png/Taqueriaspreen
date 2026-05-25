import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, User, Briefcase, Key, UserPlus, Clock, CheckCircle, RefreshCw, AlertCircle, Store, Eye, EyeOff } from 'lucide-react';
import { Role, AccessRequest } from '../types';

interface RoleSelectorProps {
  onSelectRole: (role: Role, name?: string) => void;
  accessRequests: AccessRequest[];
  onSubmitRequest: (name: string, role: 'cliente' | 'empleado') => void;
}

export default function RoleSelector({ onSelectRole, accessRequests, onSubmitRequest }: RoleSelectorProps) {
  const [activeTab, setActiveTab ] = useState<'select' | 'auth' | 'register'>('select');
  const [selectedRoleType, setSelectedRoleType] = useState<'admin' | 'empleado' | 'cliente'>('cliente');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showDemoPass, setShowDemoPass] = useState(false);
  const [showTypedPassword, setShowTypedPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [pendingRequest, setPendingRequest] = useState<AccessRequest | null>(null);

  // Check if there is an active pending request in this session so we can poll/verify it
  useEffect(() => {
    const savedReqId = sessionStorage.getItem('spreen_my_request_id');
    if (savedReqId) {
      const found = accessRequests.find(r => r.id === savedReqId);
      if (found) {
        setPendingRequest(found);
        // If it got approved, log them in automatically!
        if (found.status === 'approved') {
          onSelectRole(found.role, found.name);
          sessionStorage.removeItem('spreen_my_request_id');
        }
      }
    }
  }, [accessRequests, onSelectRole]);

  const handleRoleClick = (roleType: 'admin' | 'empleado' | 'cliente') => {
    setSelectedRoleType(roleType);
    setPassword('');
    setFullName('');
    setPasswordError('');

    if (roleType === 'admin') {
      setActiveTab('auth');
    } else {
      // For employee & client, give them a suboption: Access via password (if employee/admin) or Login/Register
      setActiveTab('auth');
    }
  };

  const handleVerifyPassword = (e: FormEvent) => {
    e.preventDefault();
    if (password === '0419') {
      // Admin and Employee can use password 0419 directly
      onSelectRole(selectedRoleType, selectedRoleType === 'admin' ? 'Administrador' : 'Empleado');
    } else {
      setPasswordError('Contraseña incorrecta.');
    }
  };

  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    // Determine target role from current choice
    const targetRole = selectedRoleType === 'empleado' ? 'empleado' : 'cliente';
    
    // Create new request
    const newId = 'req-' + Date.now();
    const newRequest: AccessRequest = {
      id: newId,
      name: fullName.trim(),
      role: targetRole,
      status: 'pending',
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    };

    onSubmitRequest(fullName.trim(), targetRole);
    sessionStorage.setItem('spreen_my_request_id', newId);
    setPendingRequest(newRequest);
    setActiveTab('register');
  };

  const handleRefreshRequestStatus = () => {
    const savedReqId = sessionStorage.getItem('spreen_my_request_id');
    if (savedReqId) {
      // Force read state update
      const found = accessRequests.find(r => r.id === savedReqId);
      if (found) {
        setPendingRequest(found);
        if (found.status === 'approved') {
          onSelectRole(found.role, found.name);
          sessionStorage.removeItem('spreen_my_request_id');
        }
      }
    }
  };
  return (
    <div id="role-selector-container" className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans border-8 md:border-[12px] border-slate-900">
      {/* Geometric Decorative Patterns */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-red-600/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-slate-900/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-12 w-24 h-24 bg-red-500/5 rotate-12 border-4 border-red-500 rounded-lg pointer-events-none hidden md:block"></div>

      {/* Main Container with thick borders and red shift shadow */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white border-4 border-slate-900 p-8 shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] z-10 text-slate-900 text-center"
      >
        <div className="mb-6">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-red-600 text-white rounded-full mb-4 shadow-inner italic font-black text-3xl"
          >
            S
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-slate-900 uppercase italic mb-1">
            Taquería <span className="text-red-600">Spreen</span>
          </h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest font-black">Los mejores tacos al pastor de la ciudad 🌮</p>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'select' && !pendingRequest && (
            <motion.div
              key="select-pane"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4 text-left"
            >
              <div className="text-center pb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white bg-slate-900 px-4 py-1.5 rounded-none block">
                  Selecciona tu rol de acceso
                </span>
              </div>

              {/* Admin Button */}
              <button
                id="select-role-admin"
                onClick={() => handleRoleClick('admin')}
                className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-slate-900 hover:bg-slate-50/40 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-all border border-red-150">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-950 text-sm uppercase tracking-tight">Administrador</h3>
                    <p className="text-slate-500 text-xs font-semibold">Aprobación, Inventario y Productos</p>
                  </div>
                </div>
                <div className="w-8 h-8 bg-slate-100 flex items-center justify-center text-slate-800 rounded group-hover:bg-slate-900 group-hover:text-white transition-all">
                  <span className="font-black">→</span>
                </div>
              </button>

              {/* Employee Button */}
              <button
                id="select-role-empleado"
                onClick={() => handleRoleClick('empleado')}
                className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-slate-900 hover:bg-slate-50/40 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-slate-100 text-slate-800 rounded-lg group-hover:bg-slate-905 group-hover:bg-slate-900 group-hover:text-white transition-all border border-slate-200">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-950 text-sm uppercase tracking-tight">Empleado</h3>
                    <p className="text-slate-500 text-xs font-semibold">Preparación de tacos y stock</p>
                  </div>
                </div>
                <div className="w-8 h-8 bg-slate-100 flex items-center justify-center text-slate-800 rounded group-hover:bg-slate-900 group-hover:text-white transition-all">
                  <span className="font-black">→</span>
                </div>
              </button>

              {/* Customer Button */}
              <button
                id="select-role-cliente"
                onClick={() => handleRoleClick('cliente')}
                className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-slate-900 hover:bg-slate-50/40 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-all border border-red-150">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-950 text-sm uppercase tracking-tight">Cliente</h3>
                    <p className="text-slate-500 text-xs font-semibold">Ver menú, ordenar tacos y bebidas</p>
                  </div>
                </div>
                <div className="w-8 h-8 bg-slate-100 flex items-center justify-center text-slate-800 rounded group-hover:bg-slate-900 group-hover:text-white transition-all">
                  <span className="font-black">→</span>
                </div>
              </button>

              {/* Quick direct access help */}
              <div className="pt-2 text-center text-[10px] text-slate-400 leading-relaxed font-mono uppercase tracking-wider flex flex-col items-center justify-center gap-1">
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <span>Contraseña Admin/Empleado:</span>
                  <button 
                    type="button"
                    onClick={() => setShowDemoPass(!showDemoPass)} 
                    className="text-slate-700 font-bold hover:text-red-500 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer transition flex items-center gap-1 text-[10px]"
                    title="Hacer clic para revelar"
                  >
                    <span>{showDemoPass ? '0419' : '••••'}</span>
                    {showDemoPass ? <EyeOff size={10} /> : <Eye size={10} />}
                  </button>
                </div>
                <span>Los clientes pueden solicitar registro</span>
              </div>
            </motion.div>
          )}

          {activeTab === 'auth' && (
            <motion.div
              key="auth-pane"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4 text-left"
            >
              <div className="flex items-center space-x-2 mb-2">
                <button 
                  onClick={() => setActiveTab('select')}
                  className="text-xs text-slate-500 hover:text-slate-900 uppercase font-black tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  ← Volver a roles
                </button>
              </div>

              <h3 className="text-lg font-black text-slate-900 text-center uppercase italic">
                Acceso para {selectedRoleType === 'admin' ? 'Administrador' : selectedRoleType === 'empleado' ? 'Empleado' : 'Cliente'}
              </h3>

              {/* If Admin or Employee -> require password directly */}
              {(selectedRoleType === 'admin' || selectedRoleType === 'empleado') ? (
                <form id="auth-code-form" onSubmit={handleVerifyPassword} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block font-black font-mono">Contraseña de Seguridad</label>
                    <div className="relative">
                      <input
                        type={showTypedPassword ? "text" : "password"}
                        id="role-auth-password"
                        placeholder="••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-200 focus:border-slate-900 rounded py-3 px-4 pl-10 pr-10 text-slate-950 placeholder-slate-400 focus:outline-none text-center tracking-widest text-lg font-bold"
                        autoFocus
                      />
                      <Key className="absolute left-3.5 top-3.5 text-slate-450" size={18} />
                      <button
                        type="button"
                        onClick={() => setShowTypedPassword(!showTypedPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 cursor-pointer p-1"
                        title={showTypedPassword ? "Ocultar contraseña" : "Ver contraseña"}
                      >
                        {showTypedPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="text-xs text-red-650 text-red-600 font-bold mt-1 flex items-center font-mono">
                        <AlertCircle size={12} className="mr-1 shrink-0" /> {passwordError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    id="submit-auth-btn"
                    className="w-full bg-red-600 hover:bg-slate-900 text-white font-black uppercase italic py-3 px-4 rounded transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-red-600/10"
                  >
                    <span>Ingresar</span>
                    <span className="text-sm">→</span>
                  </button>
                </form>
              ) : (
                /* For Cliente, we can choose standard register/request */
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-center space-y-2">
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                      Como cliente, debes registrar tu nombre para iniciar tu orden. El administrador aprobará tu sesión al instante.
                    </p>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase tracking-widest block font-black font-mono">Nombre Completo</label>
                      <input
                        type="text"
                        id="client-register-name"
                        placeholder="Ej. Luis Gilbert Pérez"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-white border-2 border-slate-250 rounded py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none font-bold text-sm"
                        required
                        autoFocus
                      />
                    </div>

                    <button
                      type="submit"
                      id="submit-register-btn"
                      className="w-full bg-red-600 hover:bg-slate-900 text-white font-black uppercase italic py-3 px-4 rounded transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-red-600/10"
                    >
                      <UserPlus size={18} />
                      <span>Solicitar Acceso de Cliente</span>
                    </button>
                  </form>
                  
                  {/* Option for quick testing - Direct Employee Registration request as well! */}
                  <div className="border-t border-slate-150 pt-3 text-center">
                    <button
                      onClick={() => {
                        setSelectedRoleType('empleado');
                        setFullName('');
                        setActiveTab('register_empleado');
                      }}
                      className="text-xs text-red-600 font-bold hover:underline cursor-pointer"
                    >
                      ¿Quieres registrarte como Empleado sin contraseña? Pide aprobación
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'register_empleado' && (
            <motion.div
              key="register-empleado-pane"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4 text-left"
            >
              <div className="flex items-center space-x-2 mb-2">
                <button 
                  onClick={() => setActiveTab('select')}
                  className="text-xs text-slate-500 hover:text-slate-900 uppercase font-black tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  ← Volver a roles
                </button>
              </div>

              <h3 className="text-lg font-black text-red-600 text-center uppercase italic">
                Registro de Empleado
              </h3>

              <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-center">
                <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                  Registra tu solicitud para el puesto de Empleado. El administrador te dará de alta en el apartado de Solicitudes.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase tracking-widest block font-black font-mono">Nombre de Empleado</label>
                  <input
                    type="text"
                    id="employee-register-name"
                    placeholder="Ej. Carlos Martínez"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white border-2 border-slate-250 rounded py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none font-bold text-sm"
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-red-650 hover:bg-red-600 text-white font-black uppercase italic py-3 px-4 rounded transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg"
                >
                  <UserPlus size={18} />
                  <span>Enviar Solicitud de Empleado</span>
                </button>
              </form>
            </motion.div>
          )}

          {/* Pending Request / Wait Room Pane */}
          {(activeTab === 'register' || pendingRequest) && pendingRequest && (
            <motion.div
              key="pending-pane"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 text-center"
            >
              <div className="p-4 bg-red-105 bg-red-50 text-red-600 rounded-full inline-flex items-center justify-center border-2 border-red-200">
                <Clock className="animate-spin" size={32} />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase italic text-slate-900">¡Solicitud Enviada!</h3>
                <p className="text-slate-600 text-sm font-semibold">
                  Hola <strong className="text-red-600 font-black">{pendingRequest.name}</strong>, tu solicitud para acceder como{' '}
                  <strong className="text-red-600 font-black">{pendingRequest.role === 'cliente' ? 'Cliente' : 'Empleado'}</strong> está registrada.
                </p>
                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 mt-4 text-left space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 uppercase tracking-widest font-black font-mono">ID:</span>
                    <span className="text-slate-800 font-mono font-black">{pendingRequest.id}</span>
                  </div>
                  <div className="flex justify-between text-xs items-center">
                    <span className="text-slate-500 uppercase tracking-widest font-black font-mono">Estado:</span>
                    <span className={`px-2 py-0.5 rounded font-black text-[10px] uppercase tracking-wider border ${
                      pendingRequest.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse' : 'bg-green-50 text-green-700 border-green-300'
                    }`}>
                      {pendingRequest.status === 'pending' ? 'Pendiente' : 'Aprobado'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed font-semibold">
                🛡️ Pídele al <strong className="text-slate-900 font-black">Administrador</strong> que te apruebe en el menú de <strong className="text-slate-900 uppercase">Solicitudes</strong>.
              </div>

              <div className="pt-2 flex flex-col space-y-2">
                <button
                  onClick={handleRefreshRequestStatus}
                  className="w-full bg-green-600 hover:bg-slate-900 text-white font-black uppercase italic py-3 px-4 rounded transition duration-150 flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-green-600/10"
                >
                  <RefreshCw size={16} />
                  <span>Verificar Aprobación</span>
                </button>
                <button
                  onClick={() => {
                    sessionStorage.removeItem('spreen_my_request_id');
                    setPendingRequest(null);
                    setActiveTab('select');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-950 underline font-extrabold cursor-pointer"
                >
                  Cancelar / Probar con otro rol
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
