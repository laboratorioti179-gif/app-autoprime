import React, { useState, useEffect, useMemo } from 'react';
import { 
  Car, 
  LayoutDashboard, 
  History, 
  Package, 
  DollarSign, 
  Users, 
  Plus, 
  Camera, 
  Clock, 
  User, 
  Phone, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Search, 
  Wrench, 
  TrendingUp, 
  AlertTriangle, 
  Paintbrush, 
  ImageIcon, 
  Save, 
  X, 
  Eye, 
  Activity, 
  ClipboardList, 
  Hash, 
  Loader2, 
  RotateCcw, 
  Calendar, 
  Sparkles, 
  Tag, 
  Zap, 
  Droplets, 
  Globe, 
  Wallet, 
  MessageSquare, 
  FileText, 
  Download, 
  Settings, 
  Building2, 
  Mail, 
  Fingerprint, 
  Check, 
  Lock, 
  LogIn, 
  LogOut, 
  UserPlus,
  Menu,
  MapPin,
  CalendarDays
} from 'lucide-react';

// --- CONFIGURAÇÃO SUPABASE ---
const SUPABASE_URL = "https://nmuhjnkiktaxvvarcfvt.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_1KEeI_9oX6JkhqPoLcxO-A_vFN77VoA";

// --- COMPONENTES UI FIXOS ---

const Card = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl transition-all ${onClick ? 'cursor-pointer hover:border-zinc-700 active:scale-[0.99]' : ''} ${className}`}
  >
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", className = "", disabled = false, type = "button" }) => {
  const variants = {
    primary: "bg-orange-600 hover:bg-orange-700 text-white",
    secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-300",
    danger: "bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/20",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white",
    outline: "bg-transparent border border-zinc-700 hover:border-orange-600 text-zinc-300 hover:text-orange-500"
  };
  return (
    <button 
      type={type}
      disabled={disabled}
      onClick={onClick} 
      className={`px-4 py-2 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ label, icon: Icon, ...props }) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">{label}</label>}
    <div className="relative group">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-orange-600 transition-colors">
          <Icon size={18} />
        </div>
      )}
      <input 
        {...props} 
        value={props.value ?? ""} 
        className={`bg-zinc-800 border border-zinc-700 rounded-xl w-full py-2.5 text-white outline-none focus:border-orange-600 transition-colors ${Icon ? 'pl-11 pr-4' : 'px-4'}`}
      />
    </div>
  </div>
);

// --- APP PRINCIPAL ---

export default function App() {
  const [supabase, setSupabase] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewingVehicle, setViewingVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTenantId, setCurrentTenantId] = useState(null);

  const [vehicles, setVehicles] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [dashboardFilter, setDashboardFilter] = useState('all');
  const [authMode, setAuthMode] = useState('login'); 
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ workshop_name: "", email: "", password: "", confirmPassword: "" });
  const [loginError, setLoginError] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const [profile, setProfile] = useState({
    workshop_name: "", cnpj: "", owner_name: "", address: "", phone: "", email: ""
  });

  const [serviceOptions, setServiceOptions] = useState([
    "Pintura completa", "Capô", "Porta dianteira (Lado Motorista)", 
    "Porta dianteira (Lado passageiro)", "Teto", "Traseira (Porta Traseira)", 
    "Para-choque (Traseiro)", "Para-choque (Dianteiro)", "Polimento veículo", 
    "Polimento (Peça)", "Polimento (Farol)", "Pintura Interna", "Pintura Peça"
  ]);

  const [fixedCosts, setFixedCosts] = useState({
    aluguel: 0, material: 0, funcionario: 0, agua: 0, luz: 0, internet: 0
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  
  const [newVehicle, setNewVehicle] = useState({
    customerName: "", phone: "", brand: "", model: "", licensePlate: "", type: "Normal", 
    color: "", location: "BOX 01", professional: "", price: "", cost: "", workStatus: "Aguardando Aprovação",
    selectedServices: [], customPieceText: "", photos: {} 
  });

  const [quickServiceText, setQuickServiceText] = useState("");
  const [newItem, setNewItem] = useState({ name: "", brand: "", quantity: "", unitPrice: "", purchaseDate: new Date().toISOString().split('T')[0] });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 4000);
  };

  useEffect(() => {
    document.title = "Auto Prime";
    const metaTags = [
      { name: 'apple-mobile-web-app-title', content: 'Auto Prime' },
      { name: 'application-name', content: 'Auto Prime' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'mobile-web-app-capable', content: 'yes' }
    ];

    metaTags.forEach(tag => {
      let element = document.querySelector(`meta[name="${tag.name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', tag.name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', tag.content);
    });

    let linkIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (!linkIcon) {
      linkIcon = document.createElement('link');
      linkIcon.setAttribute('rel', 'apple-touch-icon');
      document.head.appendChild(linkIcon);
    }
    linkIcon.setAttribute('href', 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png');

    const initApp = async () => {
      const failsafe = setTimeout(() => { setAuthLoading(false); }, 8000);
      const loadScript = (src) => new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.head.appendChild(script);
      });

      const supabaseOk = await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
      if (supabaseOk && window.supabase) {
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        setSupabase(client);
        const savedAuth = localStorage.getItem('autoprime_session_active');
        const savedTenant = localStorage.getItem('autoprime_tenant_id');
        if (savedAuth === 'true' && savedTenant) {
          setCurrentTenantId(savedTenant);
          setIsAuthenticated(true);
        }
      }

      const pdfOk = await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      if (pdfOk && window.jspdf) {
        window.jsPDF = window.jspdf.jsPDF;
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js');
      }

      clearTimeout(failsafe);
      setAuthLoading(false);
    };
    initApp();
  }, []);

  useEffect(() => {
    if (supabase && isAuthenticated && currentTenantId) fetchData();
  }, [supabase, isAuthenticated, currentTenantId]);

  const fetchData = async () => {
    if (!supabase || !currentTenantId) return;
    setLoading(true);
    try {
      const { data: vData } = await supabase.from('autoprime_vehicles').select('*').eq('tenant_id', currentTenantId).order('created_at', { ascending: false });
      const { data: iData } = await supabase.from('autoprime_inventory').select('*').eq('tenant_id', currentTenantId).order('created_at', { ascending: false });
      const { data: fData } = await supabase.from('autoprime_fixed_costs').select('*').eq('tenant_id', currentTenantId).maybeSingle(); 
      const { data: pData } = await supabase.from('autoprime_profile').select('*').eq('tenant_id', currentTenantId).maybeSingle();
      if (vData) setVehicles(vData);
      if (iData) setInventory(iData);
      if (fData) {
        setFixedCosts({ aluguel: Number(fData.aluguel) || 0, material: Number(fData.material) || 0, funcionario: Number(fData.funcionario) || 0, agua: Number(fData.agua) || 0, luz: Number(fData.luz) || 0, internet: Number(fData.internet) || 0 });
      }
      if (pData) {
        setProfile({ workshop_name: pData.workshop_name ?? "", cnpj: pData.cnpj ?? "", owner_name: pData.owner_name ?? "", address: pData.address ?? "", phone: pData.phone ?? "", email: pData.email ?? "" });
        if (pData.custom_services) setServiceOptions(pData.custom_services);
      }
    } finally { setLoading(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    const { data } = await supabase.from('autoprime_admins').select('*').eq('email', loginForm.email).eq('password', loginForm.password).maybeSingle();
    if (data) {
      setCurrentTenantId(data.tenant_id);
      setIsAuthenticated(true);
      localStorage.setItem('autoprime_session_active', 'true');
      localStorage.setItem('autoprime_tenant_id', data.tenant_id);
    } else { setLoginError("Credenciais inválidas."); }
  };

  const handleLogout = () => { setIsAuthenticated(false); localStorage.clear(); };

  const activeVehicles = useMemo(() => vehicles.filter(v => v.status === 'active'), [vehicles]);
  const historyVehicles = useMemo(() => vehicles.filter(v => v.status === 'done'), [vehicles]);
  const finance = useMemo(() => {
    const rev = vehicles.reduce((acc, v) => acc + (Number(v.price) || 0), 0);
    const exp = Object.values(fixedCosts).reduce((acc, val) => acc + (Number(val) || 0), 0);
    return { rev, exp, profit: rev - exp };
  }, [vehicles, fixedCosts]);

  const dashboardStats = useMemo(() => ({
    orcamentos: activeVehicles.filter(v => v.work_status === 'Aguardando Aprovação').length,
    cadastrados: activeVehicles.filter(v => v.work_status === 'Cadastrado').length,
    emTrabalho: activeVehicles.filter(v => v.work_status === 'In Work').length,
    concluidosMes: historyVehicles.length
  }), [activeVehicles, historyVehicles]);

  const filteredDashboardVehicles = useMemo(() => {
    if (dashboardFilter === 'budgets') return activeVehicles.filter(v => v.work_status === 'Aguardando Aprovação');
    if (dashboardFilter === 'registered') return activeVehicles.filter(v => v.work_status === 'Cadastrado');
    if (dashboardFilter === 'in_work') return activeVehicles.filter(v => v.work_status === 'In Work');
    if (dashboardFilter === 'done') return historyVehicles;
    return activeVehicles;
  }, [dashboardFilter, activeVehicles, historyVehicles]);

  const polishingList = useMemo(() => vehicles.filter(v => v.polishing_date).sort((a, b) => new Date(a.polishing_date) - new Date(b.polishing_date)), [vehicles]);

  const generateBudgetPDF = (vehicle) => {
    if (!window.jspdf) { showNotification("Erro ao carregar gerador de PDF.", "danger"); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFillColor(39, 39, 42); 
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(profile.workshop_name.toUpperCase() || "AUTOPRIME", 15, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`CNPJ: ${profile.cnpj || "N/A"}`, 15, 28);
    doc.text(`${profile.address || "Endereço não informado"}`, 15, 33);
    doc.text(`Tel: ${profile.phone || "N/A"}`, 15, 38);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("ORÇAMENTO", 145, 25);
    doc.setFontSize(10);
    doc.text(`#${vehicle.id.substring(0,6).toUpperCase()}`, 145, 32);
    doc.text(`Data: ${new Date().toLocaleDateString()}`, 145, 37);
    doc.setTextColor(39, 39, 42);
    doc.setFontSize(12);
    doc.text("DADOS DO CLIENTE", 15, 60);
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 62, 195, 62);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Cliente: ${vehicle.customer_name}`, 15, 70);
    doc.text(`Telefone: ${vehicle.phone}`, 120, 70);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DADOS DO VEÍCULO", 15, 85);
    doc.line(15, 87, 195, 87);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Veículo: ${vehicle.brand} ${vehicle.model}`, 15, 95);
    doc.text(`Placa: ${vehicle.license_plate}`, 120, 95);
    doc.text(`Cor: ${vehicle.color}`, 15, 102);
    doc.text(`Localização: ${vehicle.location}`, 120, 102);
    if (doc.autoTable) {
        const services = vehicle.service_description.split(",").map(s => [s.trim()]);
        doc.autoTable({
            startY: 115,
            head: [['DESCRIÇÃO DOS SERVIÇOS']],
            body: services,
            theme: 'striped',
            headStyles: { fillColor: [234, 88, 12], textColor: 255, fontStyle: 'bold' },
            bodyStyles: { font: 'helvetica', fontSize: 9 },
            margin: { left: 15, right: 15 }
        });
    }
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 140;
    doc.setFillColor(244, 244, 245);
    doc.rect(130, finalY, 65, 20, 'F');
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("VALOR TOTAL:", 135, finalY + 8);
    doc.setTextColor(234, 88, 12);
    doc.setFontSize(14);
    doc.text(`R$ ${Number(vehicle.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 135, finalY + 16);
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text(`Profissional Responsável: ${vehicle.professional || "Não informado"}`, 15, finalY + 15);
    doc.save(`Orcamento_${vehicle.license_plate}.pdf`);
  };

  const updateWorkStatus = async (id, newWorkStatus) => {
    const isDone = newWorkStatus === 'Concluído';
    const polDate = isDone ? new Date(new Date().setDate(new Date().getDate() + 30)).toISOString() : null;
    const upd = { work_status: newWorkStatus, status: isDone ? 'done' : 'active', polishing_date: polDate };
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...upd } : v));
    await supabase.from('autoprime_vehicles').update(upd).eq('id', id);
  };

  const deleteVehicle = async (id) => {
    const { error } = await supabase.from('autoprime_vehicles').delete().eq('id', id);
    if (!error) setVehicles(vehicles.filter(v => v.id !== id));
  };

  const toggleService = (service) => {
    setNewVehicle(prev => {
      const exists = prev.selectedServices.includes(service);
      return { ...prev, selectedServices: exists ? prev.selectedServices.filter(s => s !== service) : [...prev.selectedServices, service] };
    });
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    let desc = newVehicle.selectedServices.join(", ");
    if (newVehicle.customPieceText && (newVehicle.selectedServices.includes("Polimento (Peça)") || newVehicle.selectedServices.includes("Pintura Peça"))) {
      desc += ` (${newVehicle.customPieceText})`;
    }
    const { data } = await supabase.from('autoprime_vehicles').insert([{
      customer_name: newVehicle.customerName, phone: newVehicle.phone, brand: newVehicle.brand, model: newVehicle.model,
      license_plate: newVehicle.licensePlate, color: newVehicle.color, entry_time: new Date().toLocaleString('pt-BR'),
      service_description: desc, status: 'active', work_status: newVehicle.workStatus, price: Number(newVehicle.price),
      cost: Number(newVehicle.cost), tenant_id: currentTenantId, photos: newVehicle.photos, vehicle_type: newVehicle.type,
      location: newVehicle.location, professional: newVehicle.professional
    }]).select();
    if (data) {
      setVehicles([data[0], ...vehicles]);
      setIsModalOpen(false);
      setNewVehicle({ customerName: "", phone: "", brand: "", model: "", licensePlate: "", type: "Normal", color: "", location: "BOX 01", professional: "", price: "", cost: "", workStatus: "Aguardando Aprovação", selectedServices: [], customPieceText: "", photos: {} });
      showNotification("Veículo registrado com sucesso!");
    }
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 mb-12">
        <div className="bg-orange-600 p-2 rounded-xl text-black rotate-12"><Paintbrush size={24} strokeWidth={3}/></div>
        <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">Auto<span className="text-orange-600">Prime</span></h1>
      </div>
      <nav className="flex flex-col gap-2 flex-1">
        {[ { id: 'dashboard', label: 'Painel', icon: LayoutDashboard }, { id: 'history', label: 'Histórico', icon: History }, { id: 'polishing', label: 'Polimento', icon: Sparkles }, { id: 'inventory', label: 'Estoque', icon: Package }, { id: 'finance', label: 'Financeiro', icon: DollarSign }, { id: 'profile', label: 'Meus dados', icon: User } ].map(item => (
          <button key={item.id} onClick={() => {setActiveTab(item.id); setIsMobileMenuOpen(false);}} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all ${activeTab === item.id ? 'bg-orange-600 text-black italic' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}><item.icon size={18} /> {item.label}</button>
        ))}
      </nav>
      <button onClick={handleLogout} className="mt-auto flex items-center gap-3 px-4 py-3.5 text-red-500 font-black uppercase text-[11px] tracking-widest hover:bg-red-500/10 rounded-2xl transition-all"><LogOut size={18} /> Sair</button>
    </>
  );

  const renderDashboard = () => (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[ { id: 'budgets', label: 'Orçamentos', val: dashboardStats.orcamentos, color: 'border-l-zinc-500', icon: ClipboardList, iconColor: 'text-zinc-500', bg: 'bg-zinc-800' }, { id: 'registered', label: 'Pátio', val: dashboardStats.cadastrados, color: 'border-l-orange-600', icon: Car, iconColor: 'text-orange-600', bg: 'bg-orange-600/10' }, { id: 'in_work', label: 'Trabalhando', val: dashboardStats.emTrabalho, color: 'border-l-blue-600', icon: Wrench, iconColor: 'text-blue-600', bg: 'bg-blue-600/10' }, { id: 'done', label: 'Finalizados', val: dashboardStats.concluidosMes, color: 'border-l-emerald-600', icon: CheckCircle2, iconColor: 'text-emerald-600', bg: 'bg-emerald-600/10' } ].map(st => (
          <Card key={st.id} onClick={() => setDashboardFilter(st.id)} className={`p-4 flex flex-col md:flex-row items-center gap-3 border-l-4 transition-all ${dashboardFilter === st.id ? `${st.color} bg-zinc-800` : 'border-l-zinc-800 opacity-60'}`}>
            <div className={`p-2 ${st.bg} rounded-xl ${st.iconColor}`}><st.icon size={20} /></div>
            <div className="text-center md:text-left"><p className="text-zinc-500 text-[8px] font-black uppercase tracking-widest leading-none mb-1">{st.label}</p><h3 className="text-xl font-black text-white leading-none">{st.val}</h3></div>
          </Card>
        ))}
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">{dashboardFilter === 'budgets' ? 'Orçamentos' : 'Veículos'}</h2>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 w-full md:w-auto justify-center"><Plus size={18} /> Nova Entrada</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredDashboardVehicles.map(v => (
          <Card key={v.id} className="p-5 flex flex-col gap-4 border-t-4 border-t-zinc-700" onClick={() => setViewingVehicle(v)}>
            <div className="flex justify-between items-start">
              <div><h4 className="text-lg font-black text-white uppercase italic leading-none">{v.brand} {v.model}</h4><p className="text-zinc-500 text-[9px] font-black uppercase mt-1">{v.license_plate} • {v.color}</p></div>
              <span className="text-[8px] px-2 py-0.5 rounded font-black bg-orange-600/10 text-orange-600 border border-orange-600/20">{v.work_status}</span>
            </div>
            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                <div className="flex-1 overflow-x-auto flex gap-1 bg-zinc-800 p-1 rounded-xl no-scrollbar">
                    {['Aguardando Aprovação', 'Cadastrado', 'In Work', 'Concluído'].map(st => (
                        <button key={st} onClick={() => updateWorkStatus(v.id, st)} className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${v.work_status === st ? 'bg-orange-600 text-black' : 'text-zinc-500 hover:text-white'}`}>{st}</button>
                    ))}
                </div>
                <Button variant="danger" className="px-3" onClick={() => deleteVehicle(v.id)}><Trash2 size={16}/></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAuth = () => (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/5 blur-[120px] rounded-full" />
      <Card className="w-full max-w-md p-10 relative z-10 border-zinc-800/50 backdrop-blur-xl">
        <div className="flex flex-col items-center gap-6 mb-10">
          <div className="bg-orange-600 p-4 rounded-2xl text-black shadow-lg shadow-orange-600/20 rotate-12"><Paintbrush size={32} strokeWidth={3}/></div>
          <div className="text-center">
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Auto<span className="text-orange-600">Prime</span></h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Sua oficina em um novo nível de gestão</p>
          </div>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <Input label="E-mail" type="email" icon={Mail} placeholder="exemplo@email.com" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} required />
            <Input label="Senha" type="password" icon={Lock} placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} required />
          </div>
          {loginError && <div className="p-3 bg-red-600/10 border border-red-600/20 rounded-xl text-red-500 text-xs font-bold"><AlertTriangle size={14} className="inline mr-2" /> {loginError}</div>}
          <Button type="submit" className="w-full py-4 flex items-center justify-center gap-2 text-sm">Acessar Painel <LogIn size={18} /></Button>
        </form>
      </Card>
    </div>
  );

  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-orange-500"><Loader2 className="animate-spin" size={48} /></div>;
  if (!isAuthenticated) return renderAuth();

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans flex flex-col md:flex-row relative">
      {notification.show && <div className="fixed top-4 right-4 z-[500] flex items-center gap-3 px-6 py-4 rounded-2xl border bg-emerald-950 border-emerald-500 text-emerald-400 animate-in slide-in-from-top-10 shadow-2xl"><Check size={20}/><span className="font-bold uppercase text-[10px] tracking-widest">{notification.message}</span></div>}
      <header className="md:hidden flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
        <div className="flex items-center gap-2"><div className="bg-orange-600 p-1.5 rounded-lg text-black rotate-12"><Paintbrush size={18} strokeWidth={3}/></div><h1 className="text-xl font-black text-white italic uppercase">Auto<span className="text-orange-600">Prime</span></h1></div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="text-zinc-400 p-2"><Menu size={24} /></button>
      </header>
      {isMobileMenuOpen && ( <div className="fixed inset-0 z-[100] md:hidden"><div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}/><aside className="absolute left-0 top-0 bottom-0 w-72 bg-zinc-950 p-6 flex flex-col animate-in slide-in-from-left duration-300"><SidebarContent /></aside></div> )}
      <aside className="hidden md:flex flex-col w-72 bg-zinc-950 border-r border-zinc-800 p-6 sticky top-0 h-screen"><SidebarContent /></aside>
      <main className="flex-1 min-h-screen overflow-y-auto">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'history' && (
           <div className="p-6 space-y-6">
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Histórico de Pinturas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {historyVehicles.map(v => ( <Card key={v.id} onClick={() => setViewingVehicle(v)} className="p-6 opacity-60 hover:opacity-100 flex justify-between items-center group"><div><div className="flex items-center gap-2"><h4 className="font-black text-white uppercase italic leading-none">{v.brand} {v.model}</h4><CheckCircle2 className="text-emerald-500" size={14}/></div><p className="text-[10px] text-zinc-500 mt-2 uppercase font-bold">{v.customer_name} • {v.license_plate}</p></div><Button variant="outline" className="opacity-0 group-hover:opacity-100 transition-all" onClick={(e) => { e.stopPropagation(); updateWorkStatus(v.id, 'In Work'); }}><RotateCcw size={16} /></Button></Card> ))}
              </div>
           </div>
        )}
        {activeTab === 'polishing' && (
           <div className="p-6 space-y-6">
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2"><Sparkles className="text-orange-500"/> Agenda de Polimento</h2>
              <Card className="overflow-hidden"><table className="w-full text-left text-sm min-w-[500px]"><thead className="bg-zinc-800 text-zinc-500 text-[9px] uppercase font-black"><tr><th className="p-4">Cliente</th><th className="p-4">Veículo</th><th className="p-4">Data Polimento</th></tr></thead><tbody className="divide-y divide-zinc-800">{polishingList.map(v => ( <tr key={v.id} className="hover:bg-zinc-800/30"><td className="p-4 font-bold text-white uppercase italic">{v.customer_name}</td><td className="p-4 text-zinc-300 uppercase text-xs">{v.brand} {v.model} ({v.license_plate})</td><td className="p-4 text-orange-500 font-black">{new Date(v.polishing_date).toLocaleDateString()}</td></tr> ))}</tbody></table></Card>
           </div>
        )}
        {activeTab === 'inventory' && (
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Estoque</h2><Button onClick={() => setIsInventoryModalOpen(true)} className="flex items-center gap-2"><Plus size={18}/> Novo Item</Button></div>
            <Card className="overflow-hidden"><table className="w-full text-left text-sm min-w-[500px]"><thead className="bg-zinc-800 text-zinc-500 text-[9px] uppercase font-black"><tr><th className="p-4">Item</th><th className="p-4">Qtd</th><th className="p-4">Preço</th><th className="p-4">Ação</th></tr></thead><tbody className="divide-y divide-zinc-800">{inventory.map(item => ( <tr key={item.id}><td className="p-4 font-bold text-white uppercase italic leading-none">{item.name}<br/><span className="text-[8px] text-zinc-600 font-black">{item.brand}</span></td><td className="p-4">{item.quantity} un</td><td className="p-4 text-emerald-500 font-black">R$ {Number(item.price).toLocaleString()}</td><td className="p-4"><button onClick={() => deleteInventoryItem(item.id)} className="text-zinc-600 hover:text-red-500"><Trash2 size={16}/></button></td></tr> ))}</tbody></table></Card>
          </div>
        )}
        {activeTab === 'finance' && (
          <div className="p-6 space-y-8 animate-in zoom-in-95 duration-300">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Financeiro</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><Card className="p-6 border-l-4 border-l-orange-500"><p className="text-[10px] text-zinc-500 font-black uppercase mb-1">Faturamento</p><p className="text-2xl font-black text-white">R$ {finance.rev.toLocaleString()}</p></Card><Card className="p-6 border-l-4 border-l-red-500"><p className="text-[10px] text-zinc-500 font-black uppercase mb-1">Custos Fixos</p><p className="text-2xl font-black text-red-500">R$ {finance.exp.toLocaleString()}</p></Card><Card className="p-6 border-l-4 border-l-emerald-500"><p className="text-[10px] text-zinc-500 font-black uppercase mb-1">Lucro Estimado</p><p className="text-2xl font-black text-emerald-500">R$ {finance.profit.toLocaleString()}</p></Card></div>
          </div>
        )}
        {activeTab === 'profile' && (
          <div className="p-6 space-y-6">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Meus Dados</h2>
            <Card className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Oficina" value={profile.workshop_name} onChange={e => setProfile({...profile, workshop_name: e.target.value})} />
                <Input label="CNPJ" value={profile.cnpj} onChange={e => setProfile({...profile, cnpj: e.target.value})} />
                <Input label="Telefone" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
                <Input label="Endereço" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} />
              </div>
              <Button onClick={() => supabase.from('autoprime_profile').upsert({ tenant_id: currentTenantId, ...profile }).then(() => showNotification("Perfil salvo!"))}>Salvar Perfil</Button>
            </Card>
          </div>
        )}
      </main>

      {/* MODAL NOVA ENTRADA - RESTAURADO COM O BOX CORRETAMENTE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-2 md:p-4">
          <Card className="w-full max-w-2xl p-6 md:p-8 relative space-y-6 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Nova Entrada</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={24}/></button>
            </div>
            <form onSubmit={handleAddVehicle} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Cliente" value={newVehicle.customerName} onChange={e => setNewVehicle({...newVehicle, customerName: e.target.value})} placeholder="Ex: João Silva" required />
                <Input label="Telefone" value={newVehicle.phone} onChange={e => setNewVehicle({...newVehicle, phone: e.target.value})} placeholder="Ex: (11) 99999-9999" required />
                <Input label="Veículo" value={newVehicle.brand || newVehicle.model ? `${newVehicle.brand} ${newVehicle.model}` : ""} onChange={e => { const parts = e.target.value.split(" "); setNewVehicle({...newVehicle, brand: parts[0] || "", model: parts.slice(1).join(" ")}); }} placeholder="Ex: BMW M3" required />
                <Input label="Placa" value={newVehicle.licensePlate} onChange={e => setNewVehicle({...newVehicle, licensePlate: e.target.value.toUpperCase()})} placeholder="Ex: ABC-1234" required />
                <Input label="Valor Orçado" type="number" value={newVehicle.price} onChange={e => setNewVehicle({...newVehicle, price: e.target.value})} placeholder="Ex: 1500" required />
                <Input label="Custo Material" type="number" value={newVehicle.cost} onChange={e => setNewVehicle({...newVehicle, cost: e.target.value})} placeholder="Ex: 450" required />
                <Input label="Cor" value={newVehicle.color} onChange={e => setNewVehicle({...newVehicle, color: e.target.value})} placeholder="Ex: Cinza Nardo" required />
                <Input label="Profissional" value={newVehicle.professional} onChange={e => setNewVehicle({...newVehicle, professional: e.target.value})} placeholder="Ex: Ricardo Silva" required />
                
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Vaga / Local (BOX)</label>
                  <select className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-orange-600 transition-colors text-sm cursor-pointer" value={newVehicle.location} onChange={e => setNewVehicle({...newVehicle, location: e.target.value})}>
                    {["BOX 01", "BOX 02", "BOX 03", "BOX 04", "BOX 05", "BOX 06", "BOX 07", "BOX 08", "BOX 09", "BOX 10"].map(box => <option key={box} value={box}>{box}</option>)}
                  </select>
                </div>
                
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Status Inicial</label>
                  <select className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-orange-600 text-sm" value={newVehicle.workStatus} onChange={e => setNewVehicle({...newVehicle, workStatus: e.target.value})} required>
                    <option value="Aguardando Aprovação">Orçamento (Aguardando Aprovação)</option>
                    <option value="Cadastrado">Confirmado (Pátio)</option>
                    <option value="In Work">Em Trabalho</option>
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full py-4 uppercase tracking-widest">Finalizar Registro</Button>
            </form>
          </Card>
        </div>
      )}

      {/* VIEW VEHICLE MODAL - FICHA COMPLETA COM TODOS OS DETALHES */}
      {viewingVehicle && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-2 md:p-4 overflow-y-auto">
          <Card className="w-full max-w-4xl bg-zinc-950 border-none rounded-[32px] overflow-hidden my-auto shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            {/* CABEÇALHO LARANJA */}
            <div className="bg-orange-600 p-8 flex justify-between items-start relative">
                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-black uppercase italic leading-none tracking-tighter">
                        {viewingVehicle.brand} {viewingVehicle.model}
                    </h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                        <p className="text-black font-black uppercase text-[11px] tracking-widest opacity-80">
                            PLACA: {viewingVehicle.license_plate}
                        </p>
                        <p className="text-black font-black uppercase text-[11px] tracking-widest opacity-80">
                            COR: {viewingVehicle.color}
                        </p>
                    </div>
                </div>
                <button 
                  onClick={() => setViewingVehicle(null)} 
                  className="bg-black/10 hover:bg-black/20 p-2 rounded-full text-black transition-colors"
                >
                  <X size={24}/>
                </button>
            </div>

            {/* CORPO DA FICHA */}
            <div className="p-8 grid md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                <div className="space-y-6">
                    {/* INFORMAÇÕES DO CLIENTE */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
                            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-1"><User size={10}/> Cliente</p>
                            <p className="text-white font-bold uppercase text-xs">{viewingVehicle.customer_name}</p>
                        </div>
                        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
                            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Phone size={10}/> Contato</p>
                            <p className="text-white font-bold uppercase text-xs">{viewingVehicle.phone}</p>
                        </div>
                    </div>

                    {/* LOCALIZAÇÃO E PROFISSIONAL */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
                            <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin size={10}/> Vaga / Local</p>
                            <p className="text-white font-black uppercase text-xs italic">{viewingVehicle.location}</p>
                        </div>
                        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
                            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Wrench size={10}/> Responsável</p>
                            <p className="text-white font-bold uppercase text-xs">{viewingVehicle.professional || "Não informado"}</p>
                        </div>
                    </div>

                    {/* ENTRADA E STATUS */}
                    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex justify-between items-center">
                        <div>
                            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Clock size={10}/> Entrada no Sistema</p>
                            <p className="text-white font-bold text-xs">{viewingVehicle.entry_time}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Status Atual</p>
                            <span className="text-[9px] px-2 py-0.5 rounded font-black bg-orange-600/10 text-orange-600 border border-orange-600/20 uppercase">{viewingVehicle.work_status}</span>
                        </div>
                    </div>

                    {/* SERVIÇOS CONTRATADOS */}
                    <div className="p-6 bg-zinc-900/80 border border-orange-600/20 rounded-[24px] space-y-4">
                        <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] border-b border-zinc-800 pb-3">Resumo dos Serviços</p>
                        <p className="text-white font-bold italic text-sm leading-relaxed">
                            {viewingVehicle.service_description}
                        </p>
                    </div>

                    {/* VALOR TOTAL E DOWNLOAD */}
                    <div className="flex items-center justify-between p-6 bg-orange-600/5 border border-orange-600/20 rounded-[24px]">
                        <div>
                            <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-1">Valor do Orçamento</p>
                            <p className="text-emerald-500 font-black text-2xl leading-none">
                                R$ {Number(viewingVehicle.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <button 
                          onClick={() => generateBudgetPDF(viewingVehicle)}
                          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 transition-all border border-zinc-700 font-black text-[10px] uppercase tracking-widest"
                        >
                          <Download size={16}/> PDF
                        </button>
                    </div>
                </div>

                {/* GRADE DE FOTOS COM ETIQUETAS */}
                <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'TETO', pos: 'Teto' },
                      { key: 'TRÁS', pos: 'Trás' },
                      { key: 'FRENTE', pos: 'Frente' },
                      { key: 'LADO D', pos: 'Lado D' },
                      { key: 'LADO E', pos: 'Lado E' }
                    ].map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`aspect-[4/3] bg-zinc-900 rounded-2xl overflow-hidden relative border border-white/5 group ${item.key === 'LADO E' ? 'col-span-2 aspect-[16/6]' : ''}`}
                      >
                        {viewingVehicle.photos?.[item.pos] ? (
                          <img src={viewingVehicle.photos[item.pos]} className="w-full h-full object-cover" alt={item.key} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-800 flex-col gap-2">
                            <ImageIcon size={32} />
                            <span className="text-[8px] font-black">SEM FOTO</span>
                          </div>
                        )}
                        <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg">
                          <span className="text-[8px] font-black text-white uppercase tracking-widest">{item.key}</span>
                        </div>
                      </div>
                    ))}
                </div>
            </div>
          </Card>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        body { background: black; } 
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-in { animation: fadeIn 0.3s ease-out; }
      ` }} />
    </div>
  );
}
