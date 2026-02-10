import React, { useState, useEffect, useMemo } from 'react';
import { 
  Car, 
  LayoutDashboard, 
  History, 
  Package, 
  DollarSign, 
  Plus, 
  Camera, 
  Clock, 
  User, 
  Phone, 
  Trash2, 
  CheckCircle2, 
  Wrench, 
  Paintbrush, 
  ImageIcon, 
  Save, 
  X, 
  ClipboardList, 
  Loader2, 
  RotateCcw, 
  Sparkles, 
  Settings, 
  Mail, 
  Check, 
  Lock, 
  LogIn, 
  LogOut, 
  Menu,
  MapPin,
  ToggleLeft,
  ToggleRight,
  Cpu, 
  Layers,
  Copy,
  Share2,
  Download,
  AlertTriangle,
  TrendingUp,
  Zap,
  Droplets,
  Globe,
  FileText,
  Calendar,
  Activity,
  BoxSelect,
  MinusCircle,
  ArrowDownRight,
  Search,
  MessageCircle,
  FileDigit,
  CreditCard,
  ShieldAlert,
  Gauge
} from 'lucide-react';

// --- CONFIGURAÇÃO SUPABASE ---
const SUPABASE_URL = "https://nmuhjnkiktaxvvarcfvt.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_1KEeI_9oX6JkhqPoLcxO-A_vFN77VoA";

// --- COMPONENTES UI REFINADOS ---

const Card = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-zinc-900 border border-zinc-800/50 rounded-xl shadow-lg transition-all ${onClick ? 'cursor-pointer hover:border-orange-600/30 active:scale-[0.98]' : ''} ${className}`}
  >
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", className = "", disabled = false, type = "button" }) => {
  const variants = {
    primary: "bg-orange-600 hover:bg-orange-700 text-white shadow-md",
    secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-300",
    danger: "bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white",
    outline: "bg-transparent border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white"
  };
  return (
    <button 
      type={type}
      disabled={disabled}
      onClick={onClick} 
      className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ label, icon: Icon, ...props }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">{label}</label>}
    <div className="relative group">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-orange-600 transition-colors">
          <Icon size={14} />
        </div>
      )}
      <input 
        {...props} 
        value={props.value || ""} 
        className={`bg-zinc-950 border border-zinc-800 rounded-lg w-full py-2 text-sm text-white outline-none focus:border-orange-600 transition-all placeholder:text-zinc-700 ${Icon ? 'pl-9 pr-3' : 'px-3'}`}
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTenantId, setCurrentTenantId] = useState(null);
  
  const [publicVehicle, setPublicVehicle] = useState(null);
  const [isPublicView, setIsPublicView] = useState(false);

  const [vehicles, setVehicles] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [inventoryLog, setInventoryLog] = useState([]); 
  const [dashboardFilter, setDashboardFilter] = useState('all');
  const [loginForm, setLoginForm] = useState({ email: "", password: "", confirmPassword: "", workshopName: "", cpf: "", fullName: "", address: "" });
  const [loginError, setLoginError] = useState("");
  const [authView, setAuthView] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const [inventorySearch, setInventorySearch] = useState("");

  const [profile, setProfile] = useState({
    workshop_name: "", cnpj: "", owner_name: "", address: "", phone: "", email: "",
    subscription_status: "Trial", subscription_expires_at: null
  });

  const [appSettings, setAppSettings] = useState({
    showPolishing: true,
    showInventory: true,
    showFinance: true
  });

  const [serviceOptions, setServiceOptions] = useState([
    "Pintura completa", "Capô", "Porta dianteira", "Porta traseira", "Teto", 
    "Traseira", "Para-choque (Traseiro)", "Para-choque (Dianteiro)", 
    "Polimento veículo", "Polimento (Peça)", "Polimento (Farol)", "Pintura Peça"
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

  const [newItem, setNewItem] = useState({ name: "", brand: "", quantity: "", price: "" });

  const [debitForm, setDebitForm] = useState({ inventoryId: "", quantity: 1 });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
  };

  const copyToClipboard = (text) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showNotification("Link copiado!");
  };

  const sendWhatsAppLink = (vehicle) => {
    const link = `${window.location.origin}${window.location.pathname}?v=${vehicle.id}`;
    const text = `Olá ${vehicle.customer_name}! Segue o link para acompanhar o status do seu veículo (${vehicle.brand} ${vehicle.model}) em tempo real na ${profile.workshop_name || 'AutoPrime'}: ${link}`;
    const phone = (vehicle.phone || "").replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Configuração de Identidade Visual, Atalho e PWA (Nome e Ícone)
  useEffect(() => {
    // 1. Definir Nome do Aplicativo (Aparece no título e ao criar atalho)
    const appName = "Auto Prime";
    document.title = appName;
    
    // 2. Criar Ícone SVG Personalizado (Laranja e Preto)
    // Este SVG será convertido em DataURL para ser usado como favicon e apple-touch-icon
    const iconSvg = `
      <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="180" height="180" rx="40" fill="#EA580C"/>
        <path d="M40 110 L60 85 L120 85 L140 110 Z" fill="black"/>
        <rect x="45" y="105" width="90" height="25" rx="5" fill="black"/>
        <circle cx="65" cy="130" r="12" fill="black"/>
        <circle cx="115" cy="130" r="12" fill="black"/>
        <path d="M30 60 Q90 20 150 60" stroke="black" stroke-width="8" fill="none" stroke-linecap="round"/>
      </svg>
    `.trim();
    const iconDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(iconSvg)}`;

    // Função para gerir links de ícone no head
    const setIcon = (rel, href) => {
      let link = document.querySelector(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
    };

    setIcon('icon', iconDataUrl);
    setIcon('apple-touch-icon', iconDataUrl);
    setIcon('shortcut icon', iconDataUrl);
    
    // 3. Configurar Meta Tags para comportamento de App Nativo
    const setMeta = (name, content) => {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = name;
            document.head.appendChild(meta);
        }
        meta.content = content;
    };

    setMeta("apple-mobile-web-app-title", appName);
    setMeta("apple-mobile-web-app-capable", "yes");
    setMeta("apple-mobile-web-app-status-bar-style", "black-translucent");
    setMeta("mobile-web-app-capable", "yes");
    setMeta("theme-color", "#EA580C"); // Cor Laranja do Tema
    setMeta("description", "Gestão profissional de estética e pintura automóvel.");
  }, []);

  useEffect(() => {
    const initApp = async () => {
      const loadScript = (src) => new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.head.appendChild(script);
      });

      try {
        const supabaseOk = await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
        if (supabaseOk && window.supabase) {
          const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
          setSupabase(client);

          const params = new URLSearchParams(window.location.search);
          const vId = params.get('v');
          if (vId) {
            setIsPublicView(true);
            const { data } = await client.from('autoprime_vehicles').select('*').eq('id', vId).maybeSingle();
            if (data) setPublicVehicle(data);
          }

          const savedAuth = localStorage.getItem('autoprime_session_active');
          const savedTenant = localStorage.getItem('autoprime_tenant_id');
          if (savedAuth === 'true' && savedTenant) {
            setCurrentTenantId(savedTenant);
            setIsAuthenticated(true);
          }
        }

        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js');
      } catch (err) {
        console.error("Erro ao carregar scripts externos:", err);
      } finally {
        setAuthLoading(false);
      }
    };
    initApp();
  }, []);

  useEffect(() => {
    if (supabase && isAuthenticated && currentTenantId) fetchData();
  }, [supabase, isAuthenticated, currentTenantId, activeTab]);

  const fetchData = async () => {
    if (!supabase || !currentTenantId) return;
    try {
      const { data: vData } = await supabase.from('autoprime_vehicles').select('*').eq('tenant_id', currentTenantId).order('created_at', { ascending: false });
      const { data: iData } = await supabase.from('autoprime_inventory').select('*').eq('tenant_id', currentTenantId).order('created_at', { ascending: false });
      const { data: logData } = await supabase.from('autoprime_inventory_log').select('*').eq('tenant_id', currentTenantId).order('created_at', { ascending: false });
      const { data: fData } = await supabase.from('autoprime_fixed_costs').select('*').eq('tenant_id', currentTenantId).maybeSingle(); 
      const { data: pData } = await supabase.from('autoprime_profile').select('*').eq('tenant_id', currentTenantId).maybeSingle();
      
      setVehicles(vData || []);
      setInventory(iData || []);
      setInventoryLog(logData || []);
      if (fData) setFixedCosts(fData);
      if (pData) {
        setProfile(pData);
        if (pData.custom_services) setServiceOptions(pData.custom_services);
        if (pData.app_settings) setAppSettings(pData.app_settings);
      }
    } catch(e) { console.error("Erro ao buscar dados:", e); }
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
    } else { setLoginError("Dados inválidos."); }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoginError("");
    
    if (loginForm.password !== loginForm.confirmPassword) {
      setLoginError("As senhas não coincidem.");
      return;
    }

    const tenantId = loginForm.workshopName.toLowerCase().replace(/\s+/g, '-');
    
    const { data: existing } = await supabase.from('autoprime_admins').select('id').eq('email', loginForm.email).maybeSingle();
    if (existing) {
      setLoginError("E-mail já cadastrado.");
      return;
    }

    const { error } = await supabase.from('autoprime_admins').insert([{
      email: loginForm.email,
      password: loginForm.password,
      tenant_id: tenantId
    }]);

    if (!error) {
      await supabase.from('autoprime_profile').insert([{
        tenant_id: tenantId,
        workshop_name: loginForm.workshopName,
        email: loginForm.email,
        owner_name: loginForm.fullName,
        cnpj: loginForm.cpf,
        address: loginForm.address,
        subscription_status: 'Trial',
        subscription_expires_at: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString()
      }]);
      showNotification("Cadastro realizado com sucesso!");
      setAuthView('login');
      setLoginForm({ ...loginForm, password: "", confirmPassword: "" });
    } else {
      setLoginError("Erro ao cadastrar. Tente novamente.");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (!supabase) return;

    const { data, error } = await supabase
      .from('autoprime_admins')
      .select('id')
      .eq('email', loginForm.email)
      .maybeSingle();

    if (error) {
      setLoginError("Erro ao processar solicitação.");
      return;
    }

    if (data) {
      showNotification("E-mail de recuperação enviado com sucesso!");
      setAuthView('login');
    } else {
      setLoginError("E-mail não cadastrado no sistema.");
    }
  };

  const handleLogout = () => { setIsAuthenticated(false); localStorage.clear(); window.location.href = window.location.pathname; };

  const generateBudgetPDF = (vehicle) => {
    try {
      if (!window.jspdf) return;
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // Cabeçalho Escuro
      doc.setFillColor(24, 24, 27);
      doc.rect(0, 0, 210, 45, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(profile.workshop_name?.toUpperCase() || "AUTOPRIME", 15, 20);
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`${profile.address || ""}`, 15, 28);
      doc.text(`Telefone: ${profile.phone || ""} | E-mail: ${profile.email || ""}`, 15, 33);
      doc.text(`CNPJ/NIF: ${profile.cnpj || ""}`, 15, 38);

      doc.setTextColor(24, 24, 27);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("ORÇAMENTO TÉCNICO", 15, 60);
      doc.line(15, 62, 195, 62);
      
      doc.setFont("helvetica", "normal");
      doc.text(`Cliente: ${vehicle.customer_name}`, 15, 70);
      doc.text(`Veículo: ${vehicle.brand} ${vehicle.model} (${vehicle.license_plate})`, 15, 77);
      doc.text(`Data: ${new Date().toLocaleDateString()}`, 15, 84);

      const services = (vehicle.service_description || "").split(',').map(s => [s.trim()]);
      if (doc.autoTable) {
        doc.autoTable({
          startY: 95,
          head: [['SERVIÇO']],
          body: services,
          theme: 'striped',
          headStyles: { fillColor: [234, 88, 12] }
        });
      }

      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : 140;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`TOTAL: R$ ${Number(vehicle.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 15, finalY);

      doc.save(`Orcamento_${vehicle.license_plate}.pdf`);
      showNotification("PDF gerado!");
    } catch (err) { console.error(err); }
  };

  const generateCRMPDF = () => {
    try {
      if (!window.jspdf) return;
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text(`BASE DE CLIENTES - ${profile.workshop_name?.toUpperCase() || "AUTOPRIME"}`, 15, 20);
      
      const data = vehicles.map(v => [
        v.customer_name,
        `${v.brand} ${v.model}`,
        v.license_plate,
        v.phone,
        new Date(v.created_at || Date.now()).toLocaleDateString('pt-BR')
      ]);

      if (doc.autoTable) {
        doc.autoTable({
          startY: 30,
          head: [['Cliente', 'Carro', 'Placa', 'Contato', 'Data Entrada']],
          body: data,
          theme: 'striped',
          headStyles: { fillColor: [234, 88, 12] }
        });
      }
      doc.save("lista_clientes_crm.pdf");
      showNotification("PDF CRM gerado!");
    } catch (err) { console.error(err); }
  };

  const updateWorkStatus = async (id, newStatus) => {
    const isDone = newStatus === 'Concluído';
    const polDate = isDone ? new Date(new Date().setDate(new Date().getDate() + 30)).toISOString() : null;
    const upd = { 
      work_status: newStatus, 
      status: isDone ? 'done' : 'active', 
      polishing_date: polDate,
      current_stage: newStatus === 'In Work' ? 'Funilaria' : null
    };
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...upd } : v));
    if (viewingVehicle && viewingVehicle.id === id) setViewingVehicle(prev => ({ ...prev, ...upd }));
    await supabase.from('autoprime_vehicles').update(upd).eq('id', id);
    showNotification("Status atualizado!");
  };

  const updateVehicleStage = async (id, stage) => {
    const upd = { current_stage: stage };
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...upd } : v));
    if (viewingVehicle && viewingVehicle.id === id) setViewingVehicle(prev => ({ ...prev, ...upd }));
    await supabase.from('autoprime_vehicles').update(upd).eq('id', id);
    showNotification(`Etapa: ${stage}`);
  };

  const deleteVehicle = async (id) => {
    // Nota: O comando confirm() foi removido pois não é suportado no ambiente seguro.
    // A exclusão agora é executada diretamente para garantir funcionalidade.
    await supabase.from('autoprime_vehicles').delete().eq('id', id);
    setVehicles(prev => prev.filter(v => v.id !== id));
    showNotification("Veículo removido com sucesso.");
  };

  const handlePhotoUpload = (pos, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setNewVehicle(prev => ({ ...prev, photos: { ...prev.photos, [pos]: reader.result } })); };
      reader.readAsDataURL(file);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();

    if (!newVehicle.photos?.['Quilometragem']) {
        showNotification("Foto da quilometragem é obrigatória!", "danger");
        return;
    }

    let desc = (newVehicle.selectedServices || []).join(", ");
    if (newVehicle.customPieceText) desc += ` (${newVehicle.customPieceText})`;
    
    const payload = {
      customer_name: newVehicle.customerName, phone: newVehicle.phone, brand: newVehicle.brand, model: newVehicle.model,
      license_plate: newVehicle.licensePlate, color: newVehicle.color, entry_time: new Date().toLocaleString('pt-BR'),
      service_description: desc, status: newVehicle.workStatus === 'Concluído' ? 'done' : 'active',
      work_status: newVehicle.workStatus, price: Number(String(newVehicle.price).replace(',', '.')),
      cost: Number(String(newVehicle.cost).replace(',', '.')), tenant_id: currentTenantId,
      photos: newVehicle.photos, location: newVehicle.location, professional: newVehicle.professional,
      vehicle_type: newVehicle.type || 'Normal', current_stage: newVehicle.workStatus === 'In Work' ? 'Funilaria' : null
    };
    
    const { data } = await supabase.from('autoprime_vehicles').insert([payload]).select();
    if (data) {
      setVehicles([data[0], ...vehicles]);
      setIsModalOpen(false);
      setNewVehicle({ customerName: "", phone: "", brand: "", model: "", licensePlate: "", type: "Normal", color: "", location: "BOX 01", professional: "", price: "", cost: "", workStatus: "Aguardando Aprovação", selectedServices: [], customPieceText: "", photos: {} });
      showNotification("Cadastrado!");
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    const payload = {
      ...newItem,
      tenant_id: currentTenantId,
      price: Number(newItem.price),
      quantity: Number(newItem.quantity)
    };
    const { data } = await supabase.from('autoprime_inventory').insert([payload]).select();
    if (data) {
      setInventory([data[0], ...inventory]);
      setIsInventoryModalOpen(false);
      setNewItem({ name: "", brand: "", quantity: "", price: "" });
      showNotification("Item adicionado!");
    }
  };

  const handleDebitMaterial = async (e) => {
    e.preventDefault();
    if (!debitForm.inventoryId || debitForm.quantity <= 0) return;

    const item = inventory.find(i => i.id === debitForm.inventoryId);
    if (!item || item.quantity < debitForm.quantity) {
      showNotification("Quantidade insuficiente em estoque!", "danger");
      return;
    }

    const newQty = item.quantity - debitForm.quantity;
    const materialCost = Number(item.price || 0) * Number(debitForm.quantity);
    const newVehicleCost = (Number(viewingVehicle.cost || 0)) + materialCost;

    const { error: invError } = await supabase.from('autoprime_inventory').update({ quantity: newQty }).eq('id', item.id);
    if (invError) return;

    const { error: vehError } = await supabase.from('autoprime_vehicles').update({ cost: newVehicleCost }).eq('id', viewingVehicle.id);
    if (vehError) return;

    const logEntry = {
      tenant_id: currentTenantId,
      item_name: item.name,
      quantity: debitForm.quantity,
      vehicle_info: `${viewingVehicle.brand} ${viewingVehicle.model} (${viewingVehicle.license_plate})`,
      professional: viewingVehicle.professional || "Não Atribuído",
      created_at: new Date().toISOString()
    };
    const { data: logData } = await supabase.from('autoprime_inventory_log').insert([logEntry]).select();

    setInventory(inventory.map(i => i.id === item.id ? { ...i, quantity: newQty } : i));
    setVehicles(vehicles.map(v => v.id === viewingVehicle.id ? { ...v, cost: newVehicleCost } : v));
    setViewingVehicle({ ...viewingVehicle, cost: newVehicleCost });
    if (logData) setInventoryLog([logData[0], ...inventoryLog]);
    
    setDebitForm({ inventoryId: "", quantity: 1 });
    showNotification("Material debitado!");
  };

  const handleUpdateVehiclePhotos = async (e) => {
    const file = e.target.files[0];
    if (file && viewingVehicle) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const photoKey = `Extra_${Date.now()}`;
        const updatedPhotos = { ...viewingVehicle.photos, [photoKey]: reader.result };
        const { error } = await supabase.from('autoprime_vehicles').update({ photos: updatedPhotos }).eq('id', viewingVehicle.id);
        
        if (!error) {
           setViewingVehicle(prev => ({ ...prev, photos: updatedPhotos }));
           setVehicles(prev => prev.map(v => v.id === viewingVehicle.id ? { ...v, photos: updatedPhotos } : v));
           showNotification("Foto adicionada!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const activeVehiclesMemo = useMemo(() => vehicles.filter(v => v.status === 'active'), [vehicles]);
  const historyVehiclesMemo = useMemo(() => vehicles.filter(v => v.status === 'done'), [vehicles]);
  
  const financeMemo = useMemo(() => {
    const rev = vehicles.reduce((acc, v) => acc + (Number(v.price) || 0), 0);
    const exp = Object.values(fixedCosts).reduce((acc, val) => acc + (Number(val) || 0), 0);
    return { rev, exp, profit: rev - exp };
  }, [vehicles, fixedCosts]);

  const filteredVehicles = useMemo(() => {
    if (dashboardFilter === 'budgets') return activeVehiclesMemo.filter(v => v.work_status === 'Aguardando Aprovação');
    if (dashboardFilter === 'registered') return activeVehiclesMemo.filter(v => v.work_status === 'Cadastrado');
    if (dashboardFilter === 'in_work') return activeVehiclesMemo.filter(v => v.work_status === 'In Work');
    if (dashboardFilter === 'done') return historyVehiclesMemo;
    return activeVehiclesMemo;
  }, [dashboardFilter, activeVehiclesMemo, historyVehiclesMemo]);

  const polishingListMemo = useMemo(() => vehicles.filter(v => v.polishing_date).sort((a, b) => new Date(a.polishing_date) - new Date(b.polishing_date)), [vehicles]);

  const totalInventoryValue = useMemo(() => {
    return (inventory || []).reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    const search = (inventorySearch || "").toLowerCase();
    return (inventory || []).filter(item => 
      (item.name?.toLowerCase() || "").includes(search) || 
      (item.brand?.toLowerCase() || "").includes(search)
    );
  }, [inventory, inventorySearch]);

  const vehicleInventoryLogs = useMemo(() => {
    if (!viewingVehicle) return [];
    const targetInfo = `${viewingVehicle.brand} ${viewingVehicle.model} (${viewingVehicle.license_plate})`;
    return inventoryLog.filter(log => log.vehicle_info === targetInfo);
  }, [inventoryLog, viewingVehicle]);

  // Validação de Assinatura e Sincronização Automática com o Banco de Dados
  const isSubscriptionValid = useMemo(() => {
    if (!profile.subscription_expires_at) return true; 
    const expiry = new Date(profile.subscription_expires_at).getTime();
    const now = new Date().getTime();
    return expiry > now;
  }, [profile.subscription_expires_at]);

  useEffect(() => {
    const syncStatus = async () => {
      if (!supabase || !currentTenantId || !profile.subscription_expires_at) return;
      const correctStatus = isSubscriptionValid ? 'Ativa' : 'Expirada';
      if (profile.subscription_status !== correctStatus) {
        await supabase.from('autoprime_profile').update({ subscription_status: correctStatus }).eq('tenant_id', currentTenantId);
        setProfile(prev => ({ ...prev, subscription_status: correctStatus }));
      }
    };
    syncStatus();
  }, [isSubscriptionValid, profile.subscription_status, currentTenantId, supabase]);

  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-800 font-bold uppercase text-[10px] tracking-widest animate-pulse">Sincronizando sistema...</div>;

  if (isPublicView) {
    if (!publicVehicle) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-800 font-bold uppercase text-[10px] tracking-widest animate-pulse">Sincronizando dados...</div>;
    const stages = ['Funilaria', 'Preparação', 'Pintura', 'Polimento', 'Finalizado'];
    const currentIdx = stages.indexOf(publicVehicle.current_stage);
    return (
      <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center font-sans overflow-hidden">
        <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in-95 duration-700 text-center">
           <div className="space-y-4">
              <div className="inline-block p-4 bg-orange-600 rounded-[2rem] text-black shadow-2xl shadow-orange-600/20 rotate-12"><Car size={32} strokeWidth={3}/></div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter">Auto<span className="text-orange-600">Prime</span></h1>
              <div className="h-px w-12 bg-zinc-800 mx-auto"></div>
           </div>
           <Card className="p-8 border-t-8 border-t-orange-600 bg-zinc-900/50 backdrop-blur-xl">
              <div className="space-y-6">
                 <div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tight">{publicVehicle.brand} {publicVehicle.model}</h2>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mt-2">{publicVehicle.license_plate} • {publicVehicle.color}</p>
                 </div>
                 <div className="py-6 px-4 bg-black/40 rounded-2xl border border-zinc-800/50">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Status Atual</p>
                    <p className="text-orange-500 text-lg font-black uppercase italic tracking-tighter">
                      {publicVehicle.work_status === 'In Work' ? `Em Produção: ${publicVehicle.current_stage}` : publicVehicle.work_status}
                    </p>
                 </div>
                 {publicVehicle.work_status === 'In Work' && (
                    <div className="flex justify-between items-center px-2">
                       {stages.map((st, i) => (
                         <div key={st} className="flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-1000 ${i <= currentIdx ? 'bg-orange-600 border-orange-600 text-black shadow-lg shadow-orange-600/30' : 'bg-zinc-950 border-zinc-800 text-zinc-800'}`}>
                               {i < currentIdx ? <Check size={14} strokeWidth={4}/> : <span className="text-[10px] font-black">{i + 1}</span>}
                            </div>
                            <span className={`text-[7px] font-black uppercase tracking-widest ${i <= currentIdx ? 'text-white' : 'text-zinc-700'}`}>{st}</span>
                         </div>
                       ))}
                    </div>
                 )}
              </div>
           </Card>
           <button onClick={() => window.location.reload()} className="w-full py-4 text-zinc-700 text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2 hover:text-white transition-all"><RotateCcw size={14}/> Sincronizar Agora</button>
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="bg-orange-600 p-1.5 rounded-lg text-black rotate-12 shadow-md"><Paintbrush size={18} strokeWidth={3}/></div>
        <h1 className="text-xl font-black text-white italic uppercase tracking-tighter">Auto<span className="text-orange-600">Prime</span></h1>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {[ 
          { id: 'dashboard', label: 'Painel', icon: LayoutDashboard, visible: true }, 
          { id: 'history', label: 'Histórico', icon: History, visible: true }, 
          { id: 'polishing', label: 'Polimento', icon: Sparkles, visible: appSettings.showPolishing }, 
          { id: 'inventory', label: 'Estoque', icon: Package, visible: appSettings.showInventory }, 
          { id: 'finance', label: 'Financeiro', icon: DollarSign, visible: appSettings.showFinance },
          { id: 'settings', label: 'Ajustes', icon: Settings, visible: true }, 
          { id: 'profile', label: 'Oficina', icon: User, visible: true },
          { id: 'crm', label: 'CRM', icon: MessageCircle, visible: true },
          { id: 'subscription_manager', label: 'Assinatura', icon: CreditCard, visible: true } 
        ].filter(item => item.visible).map(item => (
          <button key={item.id} onClick={() => {setActiveTab(item.id); setIsMobileMenuOpen(false);}} className={`flex items-center gap-3 px-3 py-3 rounded-xl font-bold uppercase text-[9px] tracking-widest transition-all ${activeTab === item.id ? 'bg-orange-600 text-black italic shadow-md' : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'}`}><item.icon size={16} /> {item.label}</button>
        ))}
      </nav>
      <div className="mt-auto space-y-2">
        {profile.subscription_status && (
          <div className={`mx-2 p-3 rounded-xl border flex items-center gap-3 ${profile.subscription_status === 'Ativa' ? 'bg-emerald-600/5 border-emerald-500/20' : 'bg-orange-600/5 border-orange-600/20'}`}>
            <CreditCard size={14} className={profile.subscription_status === 'Ativa' ? 'text-emerald-500' : 'text-orange-500'}/>
            <div>
              <p className="text-[7px] font-black uppercase text-zinc-500 tracking-widest">Plano {profile.subscription_status}</p>
              <p className="text-[8px] font-bold text-white uppercase truncate">Expira: {profile.subscription_expires_at ? new Date(profile.subscription_expires_at).toLocaleDateString() : '---'}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 text-red-500 font-bold uppercase text-[9px] tracking-widest hover:bg-red-500/10 rounded-xl transition-all"><LogOut size={16} /> Sair</button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans flex flex-col md:flex-row relative">
      {notification.show && (
        <div className="fixed top-4 right-4 z-[600] flex items-center gap-3 px-5 py-3 rounded-xl border bg-emerald-950/80 backdrop-blur-md border-emerald-500 text-emerald-400 animate-in shadow-xl">
          <Check size={16}/><span className="font-bold uppercase text-[9px] tracking-widest">{notification.message}</span>
        </div>
      )}
      {!isAuthenticated ? (
        <div className="min-h-screen w-full bg-black flex items-center justify-center p-4">
           <Card className="w-full max-w-sm p-8 bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
              <div className="flex flex-col items-center gap-4 mb-8 text-center">
                 <div className="bg-orange-600 p-3 rounded-2xl text-black rotate-12 shadow-lg"><Paintbrush size={24} strokeWidth={3}/></div>
                 <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Auto<span className="text-orange-600">Prime</span></h1>
                 <p className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest">
                    {authView === 'login' ? 'Painel Administrativo' : authView === 'signup' ? 'Criar Nova Oficina' : 'Recuperar Acesso'}
                 </p>
              </div>

              {authView === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <Input label="E-mail" type="email" icon={Mail} value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} placeholder="exemplo@autoprime.com" required />
                  <div className="space-y-1">
                    <Input label="Senha" type="password" icon={Lock} value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} placeholder="••••••••" required />
                    <div className="flex justify-end px-1">
                      <button type="button" onClick={() => setAuthView('forgot')} className="text-[9px] font-black uppercase text-zinc-500 hover:text-orange-500 transition-colors">Esqueci minha senha</button>
                    </div>
                  </div>
                  {loginError && <p className="text-red-500 text-[9px] font-bold text-center">{loginError}</p>}
                  <Button type="submit" className="w-full py-3">Acessar</Button>
                  <div className="pt-4 border-t border-zinc-800 text-center">
                    <button type="button" onClick={() => {setAuthView('signup'); setLoginError("");}} className="text-[10px] font-black uppercase text-orange-500 tracking-widest hover:underline">Não tem conta? Cadastrar</button>
                  </div>
                </form>
              )}

              {authView === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <Input label="Nome da Oficina" icon={Car} value={loginForm.workshopName} onChange={e => setLoginForm({...loginForm, workshopName: e.target.value})} placeholder="Minha Oficina Prime" required />
                  <Input label="Nome Completo (Responsável)" icon={User} value={loginForm.fullName} onChange={e => setLoginForm({...loginForm, fullName: e.target.value})} placeholder="João da Silva" required />
                  <Input label="CPF" icon={FileDigit} value={loginForm.cpf} onChange={e => setLoginForm({...loginForm, cpf: e.target.value})} placeholder="000.000.000-00" required />
                  <Input label="Endereço da Oficina" icon={MapPin} value={loginForm.address} onChange={e => setLoginForm({...loginForm, address: e.target.value})} placeholder="Rua das Flores, 123" required />
                  <Input label="E-mail Administrativo" type="email" icon={Mail} value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} placeholder="admin@autoprime.com" required />
                  <Input label="Nova Senha" type="password" icon={Lock} value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} placeholder="••••••••" required />
                  <Input label="Confirmar Senha" type="password" icon={Lock} value={loginForm.confirmPassword} onChange={e => setLoginForm({...loginForm, confirmPassword: e.target.value})} placeholder="••••••••" required />
                  {loginError && <p className="text-red-500 text-[9px] font-bold text-center">{loginError}</p>}
                  <Button type="submit" className="w-full py-3">Cadastrar</Button>
                  <div className="pt-4 border-t border-zinc-800 text-center">
                    <button type="button" onClick={() => {setAuthView('login'); setLoginError("");}} className="text-[10px] font-black uppercase text-zinc-500 tracking-widest hover:text-white transition-colors">Já tem conta? Entrar</button>
                  </div>
                </form>
              )}

              {authView === 'forgot' && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-[9px] text-zinc-400 text-center px-4 leading-relaxed font-bold uppercase italic tracking-wider">Insira seu e-mail para receber um link de troca de senha.</p>
                  <Input label="E-mail" type="email" icon={Mail} value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} placeholder="seu-email@exemplo.com" required />
                  {loginError && <p className="text-red-500 text-[9px] font-bold text-center">{loginError}</p>}
                  <Button type="submit" className="w-full py-3">Enviar Link</Button>
                  <div className="pt-4 border-t border-zinc-800 text-center">
                    <button type="button" onClick={() => {setAuthView('login'); setLoginError("");}} className="text-[10px] font-black uppercase text-zinc-500 tracking-widest hover:text-white transition-colors">Voltar para Login</button>
                  </div>
                </form>
              )}
           </Card>
        </div>
      ) : !isSubscriptionValid ? (
        <div className="min-h-screen w-full bg-black flex items-center justify-center p-6">
          <Card className="w-full max-w-md p-10 text-center space-y-6 border-orange-600/30">
            <div className="flex justify-center">
              <div className="bg-orange-600/10 p-5 rounded-full text-orange-600 animate-pulse"><ShieldAlert size={48}/></div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Assinatura Expirada</h2>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed">O período de teste ou sua assinatura ativa terminou. Por favor, renove sua conta para continuar gerenciando sua oficina.</p>
            </div>
            <div className="h-px bg-zinc-800 w-12 mx-auto"></div>
            <div className="space-y-4">
              <Button onClick={() => window.open('https://stripe.com', '_blank')} className="w-full py-4 tracking-widest">RENOVAR ASSINATURA AGORA</Button>
              <button onClick={handleLogout} className="text-[10px] font-black uppercase text-zinc-600 hover:text-white transition-all tracking-widest">SAIR DA CONTA</button>
            </div>
          </Card>
        </div>
      ) : (
        <>
          <header className="md:hidden flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-900 sticky top-0 z-50">
            <div className="flex items-center gap-2">
               <div className="bg-orange-600 p-1 rounded-lg text-black rotate-12"><Paintbrush size={16}/></div>
               <span className="text-lg font-black text-white italic tracking-tighter uppercase">Auto<span className="text-orange-600">Prime</span></span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-zinc-400 p-2"><Menu size={18} /></button>
          </header>

          {/* MENU MOBILE OVERLAY - CORRIGINDO VISIBILIDADE NO CELULAR */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-[500] md:hidden">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-64 bg-zinc-950 p-6 flex flex-col border-r border-zinc-900 animate-in slide-in-from-left duration-300">
                <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-4 right-4 text-zinc-700 hover:text-white transition-all"><X size={20}/></button>
                <SidebarContent />
              </div>
            </div>
          )}

          <aside className="hidden md:flex flex-col w-64 bg-zinc-950 border-r border-zinc-900 p-6 sticky top-0 h-screen"><SidebarContent /></aside>
          <main className="flex-1 min-h-screen overflow-y-auto bg-[#050505] p-6 lg:p-8">
            {activeTab === 'dashboard' && (
              <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[ 
                    { id: 'budgets', label: 'Orçamentos', val: activeVehiclesMemo.filter(v => v.work_status === 'Aguardando Aprovação').length, icon: ClipboardList, color: 'text-zinc-500' }, 
                    { id: 'registered', label: 'Pátio', val: activeVehiclesMemo.filter(v => v.work_status === 'Cadastrado').length, icon: Car, color: 'text-orange-500' }, 
                    { id: 'in_work', label: 'Produção', val: activeVehiclesMemo.filter(v => v.work_status === 'In Work').length, icon: Wrench, color: 'text-blue-500' }, 
                    { id: 'done', label: 'Concluídos', val: historyVehiclesMemo.length, icon: CheckCircle2, color: 'text-emerald-500' } 
                  ].map(st => (
                    <Card key={st.id} onClick={() => setDashboardFilter(st.id)} className={`p-4 border-l-2 transition-all ${dashboardFilter === st.id ? 'border-l-orange-600 bg-zinc-800' : 'border-l-zinc-800'}`}>
                      <div className="flex items-center gap-3">
                         <st.icon size={16} className={st.color}/>
                         <div>
                            <p className="text-zinc-500 text-[8px] font-black uppercase tracking-widest">{st.label}</p>
                            <h3 className="text-lg font-black text-white mt-1 leading-none">{st.val}</h3>
                         </div>
                      </div>
                    </Card>
                  ))}
                </div>
                <div className="flex justify-between items-center gap-4">
                   <h2 className="text-lg font-black text-white uppercase italic tracking-tight">Painel</h2>
                   <Button onClick={() => setIsModalOpen(true)} className="px-5"><Plus size={16} /> Nova Entrada</Button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredVehicles.map(v => (
                    <Card key={v.id} className="p-4 flex flex-col gap-4 border-t-2 border-t-zinc-800 hover:border-t-orange-600 transition-all" onClick={() => setViewingVehicle(v)}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-black text-white uppercase italic leading-none">{v.brand} {v.model}</h4>
                          <p className="text-zinc-600 text-[9px] font-bold uppercase mt-1 tracking-widest">{v.license_plate} • {v.location}</p>
                        </div>
                        <span className="text-[8px] px-2 py-0.5 rounded-full font-black bg-zinc-950 text-orange-500 border border-zinc-800 uppercase">{v.work_status}</span>
                      </div>
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                          <div className="flex-1 min-w-0 flex flex-nowrap items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-900 overflow-x-auto overflow-y-hidden touch-pan-x" style={{ WebkitOverflowScrolling: 'touch' }}>
                              {['Aguardando Aprovação', 'Cadastrado', 'In Work', 'Concluído'].map(st => (
                                  <button 
                                    key={st} 
                                    onClick={() => updateWorkStatus(v.id, st)} 
                                    className={`whitespace-nowrap px-4 py-2 rounded-md text-[8px] font-black uppercase transition-all flex-shrink-0 ${v.work_status === st ? 'bg-orange-600 text-black italic' : 'text-zinc-600 hover:text-white hover:bg-zinc-900'}`}
                                  >
                                    {st}
                                  </button>
                              ))}
                          </div>
                          <button onClick={() => deleteVehicle(v.id)} className="p-2.5 bg-red-600/10 text-red-500 rounded-lg hover:bg-red-600 transition-all flex-shrink-0"><Trash2 size={14}/></button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in">
                <h2 className="text-lg font-black text-white uppercase italic">Histórico de Veículos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                   {historyVehiclesMemo.map(v => (
                      <Card key={v.id} className="p-4 flex justify-between items-center group opacity-70 hover:opacity-100" onClick={() => setViewingVehicle(v)}>
                         <div>
                            <h4 className="font-black text-white uppercase text-xs">{v.brand} {v.model}</h4>
                            <p className="text-[8px] text-zinc-600 uppercase mt-1">{v.license_plate} • {v.customer_name}</p>
                         </div>
                         <Button variant="outline" className="opacity-0 group-hover:opacity-100 px-2 py-1.5" onClick={(e) => { e.stopPropagation(); updateWorkStatus(v.id, 'In Work'); }}><RotateCcw size={12}/></Button>
                      </Card>
                   ))}
                   {historyVehiclesMemo.length === 0 && (
                      <div className="col-span-full py-12 text-center text-zinc-800 font-black uppercase italic tracking-widest">Nenhum veículo no histórico</div>
                   )}
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-black text-white uppercase italic">Estoque</h2>
                  <Button onClick={() => setIsInventoryModalOpen(true)}><Plus size={16}/> Novo Item</Button>
                </div>
                <Card className="p-4 border-l-4 border-l-blue-600 bg-zinc-900/40">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600/10 p-2 rounded-lg text-blue-500"><DollarSign size={16}/></div>
                    <div>
                       <p className="text-zinc-500 text-[8px] font-black uppercase tracking-widest leading-none">Investimento em Stock</p>
                       <h3 className="text-lg font-black text-white mt-1 leading-none">R$ {totalInventoryValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    </div>
                  </div>
                </Card>
                <div className="flex gap-2">
                  <div className="relative flex-1 group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-orange-600 transition-colors"><Search size={14} /></div>
                    <input type="text" placeholder="Pesquisar material ou marca..." className="bg-zinc-950 border border-zinc-800 rounded-lg w-full py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-orange-600 transition-all placeholder:text-zinc-700 font-bold" value={inventorySearch} onChange={e => setInventorySearch(e.target.value)}/>
                  </div>
                </div>
                <Card className="overflow-hidden border-zinc-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-800 text-zinc-500 text-[9px] uppercase font-black">
                      <tr><th className="p-4">Material</th><th className="p-4">Qtd</th><th className="p-4">Preço</th><th className="p-4">Cadastrado</th><th className="p-4 text-center">Ações</th></tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {filteredInventory.map(item => (
                        <tr key={item.id} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="p-4 font-bold text-white uppercase text-xs">{item.name} <span className="text-[10px] text-zinc-600 font-normal ml-1">({item.brand})</span></td>
                          <td className="p-4 text-xs font-bold text-zinc-400">{item.quantity} un</td>
                          <td className="p-4 text-emerald-500 font-bold text-xs">R$ {Number(item.price || 0).toLocaleString('pt-BR')}</td>
                          <td className="p-4 text-zinc-600 font-mono text-[10px]">{item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : '---'}</td>
                          <td className="p-4 text-center"><button onClick={() => supabase.from('autoprime_inventory').delete().eq('id', item.id).then(() => fetchData())} className="text-zinc-700 hover:text-red-500 transition-colors"><Trash2 size={16}/></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
                <div className="space-y-4 pt-4">
                  <h3 className="text-sm font-black text-zinc-500 uppercase italic tracking-widest flex items-center gap-2"><History size={16} className="text-orange-600"/> Histórico de Uso</h3>
                  <Card className="overflow-hidden border-zinc-800 bg-zinc-950/50">
                    <table className="w-full text-left text-[10px]">
                      <thead className="bg-zinc-900 text-zinc-500 uppercase font-black">
                        <tr><th className="p-3">Item</th><th className="p-3">Qtd</th><th className="p-3">Destino (Carro)</th><th className="p-3">Por Quem</th><th className="p-3">Data</th></tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900">
                        {inventoryLog.map(log => (
                          <tr key={log.id} className="hover:bg-zinc-900/20 transition-colors">
                            <td className="p-3 font-bold text-white uppercase">{log.item_name}</td>
                            <td className="p-3 text-orange-500 font-black">{log.quantity} un</td>
                            <td className="p-3 text-zinc-400 font-bold uppercase">{log.vehicle_info}</td>
                            <td className="p-3 text-zinc-500 font-bold uppercase italic">{log.professional}</td>
                            <td className="p-3 text-zinc-600 font-mono">{new Date(log.created_at).toLocaleDateString('pt-BR')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'finance' && (
              <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
                  <h2 className="text-lg font-black text-white uppercase italic tracking-tight">Painel Financeiro</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-5 border-l-4 border-l-orange-600"><TrendingUp className="text-orange-600 mb-2" size={18}/><p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Faturamento Bruto</p><p className="text-xl font-black text-white">R$ {financeMemo.rev.toLocaleString('pt-BR')}</p></Card>
                    <Card className="p-5 border-l-4 border-l-red-600"><AlertTriangle className="text-red-600 mb-2" size={18}/><p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Custos Fixos</p><p className="text-xl font-black text-red-500">R$ {financeMemo.exp.toLocaleString('pt-BR')}</p></Card>
                    <Card className="p-5 border-l-4 border-l-emerald-600"><CheckCircle2 className="text-emerald-600 mb-2" size={18}/><p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Lucro Estimado</p><p className="text-xl font-black text-emerald-500">R$ {financeMemo.profit.toLocaleString('pt-BR')}</p></Card>
                  </div>
                  <Card className="p-6 space-y-6">
                     <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-2">Gastos Operacionais Mensais</h3>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <Input label="Aluguel" type="number" value={fixedCosts.aluguel} onChange={e => setFixedCosts({...fixedCosts, aluguel: e.target.value})} icon={MapPin}/>
                        <Input label="Funcionário" type="number" value={fixedCosts.funcionario} onChange={e => setFixedCosts({...fixedCosts, funcionario: e.target.value})} icon={User}/>
                        <Input label="Material" type="number" value={fixedCosts.material} onChange={e => setFixedCosts({...fixedCosts, material: e.target.value})} icon={Package}/>
                        <Input label="Luz" type="number" value={fixedCosts.luz} onChange={e => setFixedCosts({...fixedCosts, luz: e.target.value})} icon={Zap}/>
                        <Input label="Água" type="number" value={fixedCosts.agua} onChange={e => setFixedCosts({...fixedCosts, agua: e.target.value})} icon={Droplets}/>
                        <Input label="Internet" type="number" value={fixedCosts.internet} onChange={e => setFixedCosts({...fixedCosts, internet: e.target.value})} icon={Globe}/>
                     </div>
                     <Button onClick={() => supabase.from('autoprime_fixed_costs').upsert({ tenant_id: currentTenantId, ...fixedCosts }, { onConflict: 'tenant_id' }).then(() => showNotification("Balanço Salvo!"))} className="w-full py-3"><Save size={16}/> Guardar Balanço Financeiro</Button>
                  </Card>
              </div>
            )}

            {activeTab === 'polishing' && (
              <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
                 <h2 className="text-lg font-black text-white uppercase italic flex items-center gap-2 tracking-tight"><Sparkles className="text-orange-500" size={18}/> Agenda de Retorno (Polimento)</h2>
                 <Card className="overflow-hidden border-zinc-900">
                    <table className="w-full text-left text-sm">
                       <thead className="bg-zinc-800 text-zinc-500 text-[9px] uppercase font-black"><tr><th className="p-4">Cliente</th><th className="p-4">Veículo</th><th className="p-4">Data Prevista</th></tr></thead>
                       <tbody className="divide-y divide-zinc-800">
                          {polishingListMemo.map(v => (
                            <tr key={v.id} className="hover:bg-zinc-900/40 transition-colors">
                               <td className="p-4 font-bold text-white uppercase text-xs">{v.customer_name}</td>
                               <td className="p-4 text-zinc-400 text-xs font-bold uppercase">{v.brand} {v.model}</td>
                               <td className="p-4 text-orange-500 font-black text-xs italic">{new Date(v.polishing_date).toLocaleDateString('pt-BR')}</td>
                            </tr>
                          ))}
                          {polishingListMemo.length === 0 && (
                             <tr><td colSpan="3" className="p-8 text-center text-zinc-800 font-black uppercase italic tracking-widest">Nenhum polimento agendado</td></tr>
                          )}
                       </tbody>
                    </table>
                 </Card>
              </div>
            )}

            {activeTab === 'settings' && (
               <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
                  <h2 className="text-lg font-black text-white uppercase italic tracking-tight">Ajustes do Sistema</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[ 
                      { key: 'showPolishing', label: 'Módulo Polimento', icon: Sparkles, color: 'text-orange-500' }, 
                      { key: 'showInventory', label: 'Módulo Estoque', icon: Package, color: 'text-blue-500' }, 
                      { key: 'showFinance', label: 'Módulo Financeiro', icon: DollarSign, color: 'text-emerald-500' } 
                    ].map(item => (
                      <Card key={item.key} onClick={() => {const ns={...appSettings, [item.key]: !appSettings[item.key]}; setAppSettings(ns); supabase.from('autoprime_profile').update({ app_settings: ns }).eq('tenant_id', currentTenantId); showNotification("Configuração Atualizada!");}} className={`p-5 border-2 cursor-pointer transition-all ${appSettings[item.key] ? 'border-orange-600/30' : 'border-zinc-900 grayscale opacity-40'}`}>
                         <div className="flex justify-between items-center mb-4">
                            <item.icon size={20} className={appSettings[item.key] ? item.color : 'text-zinc-700'}/>
                            {appSettings[item.key] ? <ToggleRight className="text-orange-600" size={24}/> : <ToggleLeft className="text-zinc-800" size={24}/>}
                         </div>
                         <h4 className="text-[10px] font-black text-white uppercase italic tracking-widest">{item.label}</h4>
                      </Card>
                    ))}
                  </div>
               </div>
            )}

            {activeTab === 'profile' && (
               <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
                  <h2 className="text-lg font-black text-white uppercase italic tracking-tight">Dados da Oficina</h2>
                  <Card className="p-6 space-y-6 bg-zinc-900/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <Input label="Oficina" value={profile.workshop_name} onChange={e => setProfile({...profile, workshop_name: e.target.value})} icon={Car} placeholder="Nome Fantasia" />
                       <Input label="Telefone" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} icon={Phone} placeholder="9XX XXX XXX" />
                       <Input label="NIF / CNPJ" value={profile.cnpj} onChange={e => setProfile({...profile, cnpj: e.target.value})} icon={FileText} placeholder="Identificação Fiscal" />
                       <Input label="E-mail" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} icon={Mail} placeholder="oficina@exemplo.com" />
                       <div className="md:col-span-2"><Input label="Morada / Endereço" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} icon={MapPin} placeholder="Endereço Completo" /></div>
                    </div>
                    <Button onClick={() => supabase.from('autoprime_profile').upsert({ tenant_id: currentTenantId, ...profile }).then(() => showNotification("Perfil Guardado!"))} className="w-full py-3"><Save size={16}/> Guardar Perfil Oficina</Button>
                  </Card>
               </div>
            )}

            {activeTab === 'crm' && (
              <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
                 <div className="flex justify-between items-center">
                    <h2 className="text-lg font-black text-white uppercase italic tracking-tight">Gestão de Clientes (CRM)</h2>
                    <Button onClick={generateCRMPDF} variant="outline" className="border-orange-600/50 text-orange-500 hover:bg-orange-600/10"><Download size={16}/> Baixar Lista CRM (PDF)</Button>
                 </div>
                 
                 <Card className="overflow-hidden border-zinc-800 bg-zinc-950/50">
                    <table className="w-full text-left text-[10px]">
                      <thead className="bg-zinc-900 text-zinc-500 uppercase font-black">
                        <tr>
                          <th className="p-4">Cliente</th>
                          <th className="p-4">Veículo</th>
                          <th className="p-4">Placa</th>
                          <th className="p-4">Contato (Promoções)</th>
                          <th className="p-4">Última Entrada</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900">
                        {vehicles.map((v, i) => (
                          <tr key={i} className="hover:bg-zinc-900/30 transition-colors">
                            <td className="p-4 font-bold text-white uppercase">{v.customer_name}</td>
                            <td className="p-4 text-zinc-400 font-bold uppercase">{v.brand} {v.model}</td>
                            <td className="p-4 text-orange-500 font-mono italic">{v.license_plate}</td>
                            <td className="p-4 text-white font-bold">{v.phone}</td>
                            <td className="p-4 text-zinc-600 font-mono">{new Date(v.created_at || Date.now()).toLocaleDateString('pt-BR')}</td>
                          </tr>
                        ))}
                        {vehicles.length === 0 && (
                          <tr><td colSpan="5" className="p-12 text-center text-zinc-800 font-black uppercase italic tracking-widest">Nenhum cliente registrado no CRM</td></tr>
                        )}
                      </tbody>
                    </table>
                 </Card>
              </div>
            )}

            {activeTab === 'subscription_manager' && (
              <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
                 <h2 className="text-lg font-black text-white uppercase italic tracking-tight">Assinatura e Planos</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className={`p-6 border-l-4 ${isSubscriptionValid ? 'border-l-emerald-600' : 'border-l-red-600'}`}>
                       <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status da Conta</p>
                       <div className="flex items-center gap-2 mt-2">
                          <div className={`w-2 h-2 rounded-full ${isSubscriptionValid ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                          <h3 className="text-xl font-black text-white uppercase italic">
                             {isSubscriptionValid ? 'Ativo - Acesso total' : 'Expirado - Sem acesso ao aplicativo'}
                          </h3>
                       </div>
                       <p className="text-[10px] text-zinc-400 mt-4 uppercase font-bold">Vinculado ao e-mail:</p>
                       <p className="text-xs text-orange-500 font-mono">{profile.email || loginForm.email}</p>
                    </Card>

                    <Card className="p-6 border-l-4 border-l-zinc-800">
                       <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Validade do Plano</p>
                       <h3 className="text-xl font-black text-white mt-2 italic">
                          {profile.subscription_expires_at ? new Date(profile.subscription_expires_at).toLocaleDateString('pt-BR') : 'Expirado'}
                       </h3>
                       <p className="text-[9px] text-zinc-500 mt-4 leading-relaxed font-bold uppercase tracking-wider italic">
                          {isSubscriptionValid ? 'Sua licença está válida e todas as funcionalidades estão desbloqueadas.' : 'Seu acesso foi interrompido. Regularize sua assinatura para voltar a usar o AutoPrime.'}
                       </p>
                    </Card>
                 </div>
                 
                 <Card className="p-8 bg-zinc-900/50 border-dashed border-zinc-800 flex flex-col items-center text-center gap-4">
                    <div className="bg-zinc-950 p-4 rounded-full text-zinc-700"><ShieldAlert size={32}/></div>
                    <div className="max-w-sm">
                       <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">Pagamentos e Faturas</h4>
                       <p className="text-[10px] text-zinc-500 font-bold uppercase leading-relaxed">
                          {isSubscriptionValid ? 'O processamento de pagamentos é feito de forma segura.' : 'Sua assinatura precisa de renovação para restaurar o acesso total.'}
                       </p>
                    </div>
                    <Button variant={isSubscriptionValid ? "outline" : "primary"} className="mt-2" onClick={() => window.open('https://billing.stripe.com', '_blank')}>
                       {isSubscriptionValid ? 'Gerenciar faturamento' : 'RENOVAR ASSINATURA AGORA'}
                    </Button>
                 </Card>
              </div>
            )}
          </main>

          {isModalOpen && (
            <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] overflow-y-auto no-scrollbar flex items-start justify-center md:items-center p-4">
              <Card className="w-full max-w-4xl p-6 relative bg-zinc-950 border-zinc-800 shadow-2xl my-4 md:my-8 h-auto">
                <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-zinc-700 hover:text-white transition-all z-10"><X size={20}/></button>
                <form onSubmit={handleAddVehicle} className="space-y-8">
                   <h2 className="text-lg font-black text-white uppercase italic border-b border-zinc-900 pb-4 tracking-tighter">Vistoria de Entrada Completa</h2>
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-4">
                         <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic">Dados do Cliente</p>
                         <Input label="Cliente" value={newVehicle.customerName} onChange={e => setNewVehicle({...newVehicle, customerName: e.target.value})} required />
                         <Input label="Contacto" value={newVehicle.phone} onChange={e => setNewVehicle({...newVehicle, phone: e.target.value})} required />
                         <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Horário de Entrada</label>
                            <div className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono flex items-center gap-2">
                               <Clock size={12} className="text-orange-600"/> {new Date().toLocaleTimeString('pt-BR')}
                            </div>
                         </div>
                      </div>
                      <div className="space-y-4">
                         <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic">Dados do Veículo</p>
                         <Input label="Marca" value={newVehicle.brand} onChange={e => setNewVehicle({...newVehicle, brand: e.target.value})} required />
                         <Input label="Modelo" value={newVehicle.model} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})} required />
                         <Input label="Placa" value={newVehicle.licensePlate} onChange={e => setNewVehicle({...newVehicle, licensePlate: e.target.value.toUpperCase()})} required />
                         <Input label="Cor" value={newVehicle.color} onChange={e => setNewVehicle({...newVehicle, color: e.target.value})} required />
                      </div>
                      <div className="space-y-4">
                         <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic">Configurações Técnicas</p>
                         <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Tipo do Veículo</label>
                            <select 
                               className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-600 transition-all"
                               value={newVehicle.type} 
                               onChange={e => setNewVehicle({...newVehicle, type: e.target.value})}
                            >
                               <option value="Normal">Sedan / Hatch (Normal)</option>
                               <option value="SUV">SUV / Jipe</option>
                               <option value="Pick-up">Pick-up / Carrinha</option>
                               <option value="Comercial">Furgão / Comercial</option>
                               <option value="Moto">Mota / Motociclo</option>
                            </select>
                         </div>
                         <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Localização (BOX)</label>
                            <select 
                               className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-600 transition-all"
                               value={newVehicle.location} 
                               onChange={e => setNewVehicle({...newVehicle, location: e.target.value})}
                            >
                               {["BOX 01", "BOX 02", "BOX 03", "BOX 04", "BOX 05", "BOX 06", "BOX 07", "BOX 08", "BOX 09", "BOX 10"].map(box => (
                                 <option key={box} value={box}>{box}</option>
                               ))}
                            </select>
                         </div>
                         <Input label="Técnico Responsável" value={newVehicle.professional} onChange={e => setNewVehicle({...newVehicle, professional: e.target.value})} />
                         <Input label="Valor Cobrado (R$)" value={newVehicle.price} onChange={e => setNewVehicle({...newVehicle, price: e.target.value})} required />
                      </div>
                   </div>

                   <div className="space-y-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic flex items-center gap-2"><Wrench size={14}/> Serviço Solicitado</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                         {serviceOptions.map(service => (
                           <button 
                             key={service} 
                             type="button"
                             onClick={() => {
                               const current = newVehicle.selectedServices || [];
                               const next = current.includes(service) ? current.filter(s => s !== service) : [...current, service];
                               setNewVehicle({...newVehicle, selectedServices: next});
                             }}
                             className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase text-left transition-all border ${newVehicle.selectedServices?.includes(service) ? 'bg-orange-600 border-orange-600 text-black italic shadow-lg shadow-orange-600/20' : 'bg-zinc-950 border-zinc-900 text-zinc-600 hover:text-white'}`}
                           >
                             {service}
                           </button>
                         ))}
                      </div>
                      <Input label="Outro Serviço ou Peça Específica" placeholder="Descreva aqui..." value={newVehicle.customPieceText} onChange={e => setNewVehicle({...newVehicle, customPieceText: e.target.value})} />
                   </div>

                   <div className="space-y-4">
                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic flex items-center gap-2"><Camera size={14}/> Seleção de Fotos (Vistoria)</p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                         {['Quilometragem', 'Frente', 'Trás', 'Lado D', 'Lado E', 'Teto'].map(pos => (
                           <div key={pos} className={`relative aspect-square bg-zinc-950 border-2 border-dashed rounded-xl flex items-center justify-center overflow-hidden hover:border-orange-600 transition-all group ${pos === 'Quilometragem' ? (newVehicle.photos?.['Quilometragem'] ? 'border-zinc-800' : 'border-red-600/50 bg-red-600/5') : 'border-zinc-800'}`}>
                              {newVehicle.photos?.[pos] ? (
                                <>
                                  <img src={newVehicle.photos[pos]} className="w-full h-full object-cover" alt={pos} />
                                  <button type="button" onClick={(e) => { e.stopPropagation(); setNewVehicle(prev => ({ ...prev, photos: { ...prev.photos, [pos]: null } })); }} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={20} className="text-red-500" /></button>
                                </>
                              ) : (
                                <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-2">
                                   <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(pos, e)} />
                                   {pos === 'Quilometragem' ? <Gauge size={20} className="text-red-600" /> : <Camera size={20} className="text-zinc-800" />}
                                   <span className={`text-[7px] font-black uppercase tracking-widest ${pos === 'Quilometragem' ? 'text-red-500' : 'text-zinc-800'}`}>{pos} {pos === 'Quilometragem' && '*'}</span>
                                </label>
                              )}
                           </div>
                         ))}
                      </div>
                   </div>

                   <Button type="submit" className="w-full py-4 tracking-[0.3em] italic font-black text-sm">FINALIZAR E REGISTAR ENTRADA</Button>
                </form>
              </Card>
            </div>
          )}

          {viewingVehicle && (
            <div className="fixed inset-0 bg-black/98 z-[200] flex items-center justify-center p-4 overflow-y-auto no-scrollbar">
              <Card className="w-full max-w-6xl bg-[#0a0a0a] border-none rounded-[24px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header Estilizado conforme a imagem */}
                <div className="bg-orange-600 p-6 flex justify-between items-start text-black">
                    <div>
                        <h2 className="text-2xl font-black uppercase italic leading-none tracking-tighter">FICHA TÉCNICA DO VEÍCULO</h2>
                        <p className="font-black uppercase text-[10px] tracking-widest mt-2 opacity-80 italic">Controlo de Ativos • AutoPrime Professional</p>
                    </div>
                    <button onClick={() => setViewingVehicle(null)} className="bg-black/10 hover:bg-black/20 p-2 rounded-full text-black transition-all active:scale-90 shadow-lg">
                      <X size={20} strokeWidth={3} />
                    </button>
                </div>

                <div className="p-6 md:p-8 grid lg:grid-cols-2 gap-8 overflow-y-auto no-scrollbar max-h-[85vh]">
                   {/* Coluna Esquerda: Dados e Ações */}
                   <div className="space-y-6">
                      
                      {/* Grid de Informações 3x3 */}
                      <div className="grid grid-cols-3 gap-3">
                         {[
                            { label: "DONO / CLIENTE", value: viewingVehicle.customer_name },
                            { label: "TELEMÓVEL", value: viewingVehicle.phone },
                            { label: "MARCA / MODELO", value: `${viewingVehicle.brand} ${viewingVehicle.model}` },
                            { label: "PLACA", value: viewingVehicle.license_plate, highlight: true },
                            { label: "COR", value: viewingVehicle.color },
                            { label: "BOX", value: viewingVehicle.location },
                            { label: "TÉCNICO", value: viewingVehicle.professional || "Não Atribuído" },
                            { label: "TIPO", value: viewingVehicle.vehicle_type || "Normal" },
                            { label: "ENTRADA", value: viewingVehicle.entry_time?.split(',')[0] || "---" }
                         ].map((item, idx) => (
                           <div key={idx} className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                              <p className="text-[7px] font-black text-zinc-500 uppercase italic tracking-widest mb-1 leading-none">{item.label}</p>
                              <p className={`font-bold uppercase text-[10px] truncate ${item.highlight ? 'text-orange-500 italic' : 'text-zinc-200'}`}>
                                {item.value}
                              </p>
                           </div>
                         ))}
                      </div>

                      {/* Seção: Materiais Aplicados */}
                      <div className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl space-y-4">
                         <p className="text-[9px] font-black text-zinc-400 uppercase flex items-center gap-2 italic tracking-widest">
                           <BoxSelect size={14} className="text-blue-500"/> MATERIAIS APLICADOS (DEBITAR STOCK)
                         </p>
                         <form onSubmit={handleDebitMaterial} className="flex gap-3">
                            <select className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-[10px] font-bold outline-none focus:border-blue-500 appearance-none" value={debitForm.inventoryId} onChange={e => setDebitForm({...debitForm, inventoryId: e.target.value})}>
                               <option value="">Selecionar Item...</option>
                               {inventory.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                            </select>
                            <input type="number" min="1" className="w-20 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-[10px] font-bold text-center" value={debitForm.quantity} onChange={e => setDebitForm({...debitForm, quantity: Number(e.target.value)})}/>
                            <button type="submit" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-black text-[9px] uppercase px-6 py-2.5 rounded-xl border border-zinc-700 transition-all active:scale-95 leading-tight">
                              DEBITAR E <br/> LANÇAR
                            </button>
                         </form>
                      </div>

                      {/* Seção: Histórico de Consumo (ESTADO: ADICIONADO/CONFERIDO) */}
                      <div className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl space-y-3">
                          <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 italic leading-none">
                            <History size={14} className="text-blue-400"/> HISTÓRICO DE CONSUMO (ESTOQUE)
                          </p>
                          <div className="space-y-2">
                             {vehicleInventoryLogs.length > 0 ? vehicleInventoryLogs.map((log) => (
                               <div key={log.id} className="bg-black/40 p-3 rounded-xl border border-zinc-900/50 flex justify-between items-center">
                                  <div className="flex flex-col">
                                     <span className="text-[9px] font-black text-zinc-300 uppercase tracking-wide">{log.item_name}</span>
                                     <span className="text-[7px] text-zinc-600 font-bold uppercase">{new Date(log.created_at).toLocaleDateString('pt-BR')}</span>
                                  </div>
                                  <span className="text-[10px] font-black text-blue-500 italic">-{log.quantity} un</span>
                               </div>
                             )) : (
                               <p className="text-[8px] text-zinc-700 font-black uppercase italic py-2 text-center tracking-widest">Nenhum registro de material</p>
                             )}
                          </div>
                      </div>

                      {/* Seção: Serviços Solicitados (ESTADO: ADICIONADO) */}
                      <div className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl space-y-3">
                          <div className="flex justify-between items-center">
                              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 italic leading-none">
                                <ClipboardList size={14} className="text-zinc-500"/> SERVIÇOS SOLICITADOS
                              </p>
                              <button 
                                onClick={async () => {
                                  const extra = window.prompt("Incluir novo serviço na ficha:");
                                  if (extra && viewingVehicle) {
                                    const newDesc = viewingVehicle.service_description ? `${viewingVehicle.service_description}, ${extra}` : extra;
                                    await supabase.from('autoprime_vehicles').update({ service_description: newDesc }).eq('id', viewingVehicle.id);
                                    setViewingVehicle(prev => ({ ...prev, service_description: newDesc }));
                                    setVehicles(prev => prev.map(v => v.id === viewingVehicle.id ? { ...v, service_description: newDesc } : v));
                                    showNotification("Serviço adicionado com sucesso!");
                                  }
                                }}
                                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-all border border-zinc-700"
                              >
                                <Plus size={12}/>
                              </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                             {viewingVehicle.service_description ? viewingVehicle.service_description.split(',').map((serv, i) => (
                               <div key={i} className="bg-zinc-950 border border-zinc-800 px-4 py-2 rounded-xl text-[9px] font-black text-zinc-400 uppercase tracking-tight flex items-center gap-2">
                                  <Check size={12} className="text-orange-600" strokeWidth={4}/> {serv.trim()}
                               </div>
                             )) : (
                               <span className="text-[8px] text-zinc-700 font-black uppercase italic tracking-widest">Nenhum serviço registrado</span>
                             )}
                          </div>
                      </div>

                      {/* Seção: Link de Acompanhamento (ESTADO: ADICIONADO) */}
                      <div className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl space-y-3">
                          <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2 italic leading-none">
                            <Share2 size={14}/> LINK DE ACOMPANHAMENTO (WHATSAPP)
                          </p>
                          <div className="flex gap-2 bg-black/40 p-2 rounded-xl border border-zinc-800">
                             <input readOnly className="bg-transparent flex-1 px-3 text-[10px] text-zinc-500 font-mono outline-none truncate" value={`${window.location.origin}${window.location.pathname}?v=${viewingVehicle.id}`}/>
                             <div className="flex gap-1.5">
                                <button onClick={() => copyToClipboard(`${window.location.origin}${window.location.pathname}?v=${viewingVehicle.id}`)} className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-zinc-300 transition-all flex items-center gap-2 border border-zinc-700">
                                   <Copy size={14}/> <span className="text-[9px] font-black uppercase italic tracking-wider">Copiar</span>
                                </button>
                                <button onClick={() => sendWhatsAppLink(viewingVehicle)} className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-white transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20">
                                   <MessageCircle size={14}/> <span className="text-[9px] font-black uppercase italic tracking-wider whitespace-nowrap">Enviar</span>
                                </button>
                             </div>
                          </div>
                      </div>

                      {/* Seção: Status Geral do Veículo */}
                      <div className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl space-y-4">
                         <p className="text-[9px] font-black text-zinc-400 uppercase flex items-center gap-2 italic tracking-widest leading-none">
                           <Activity size={14} className="text-orange-600"/> STATUS GERAL DO VEÍCULO
                         </p>
                         <div className="flex flex-nowrap items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-900 overflow-x-auto overflow-y-hidden touch-pan-x" style={{ WebkitOverflowScrolling: 'touch' }}>
                            {['Aguardando Aprovação', 'Cadastrado', 'In Work', 'Concluído'].map(st => (
                               <button 
                                 key={st} 
                                 onClick={() => updateWorkStatus(viewingVehicle.id, st)} 
                                 className={`whitespace-nowrap px-4 py-2 rounded-md text-[8px] font-black uppercase transition-all flex-shrink-0 ${viewingVehicle.work_status === st ? 'bg-orange-600 text-black italic' : 'text-zinc-600 hover:text-white hover:bg-zinc-900'}`}
                               >
                                  {st}
                               </button>
                            ))}
                         </div>
                      </div>

                      {/* Seção: Produção em Estufa */}
                      <div className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl space-y-4">
                         <p className="text-[9px] font-black text-zinc-400 uppercase flex items-center gap-2 italic tracking-widest leading-none">
                           <Layers size={14} className="text-orange-600"/> PRODUÇÃO EM ESTUFA (ETAPAS)
                         </p>
                         <div className="grid grid-cols-5 gap-2">
                            {['Funilaria', 'Preparação', 'Pintura', 'Polimento', 'Finalizado'].map(stage => (
                               <button 
                                 key={stage} 
                                 onClick={() => updateVehicleStage(viewingVehicle.id, stage)} 
                                 className={`px-1 py-3 rounded-xl text-[8px] font-black uppercase transition-all border ${viewingVehicle.current_stage === stage ? 'bg-orange-600 border-orange-600 text-black italic shadow-lg shadow-orange-600/30' : 'bg-black/50 border-zinc-800 text-zinc-600 hover:text-zinc-400'}`}
                               >
                                  {stage}
                               </button>
                            ))}
                         </div>
                      </div>

                      {/* Seção Final: Valores (ESTADO: ADICIONADO/CONFERIDO CUSTO MATERIAL) */}
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-5 bg-emerald-600/5 border border-emerald-500/20 rounded-2xl flex flex-col gap-3">
                            <div>
                              <p className="text-[8px] text-zinc-600 font-black mb-1 uppercase tracking-widest italic leading-none">Preço Orçado</p>
                              <p className="text-emerald-500 font-black text-2xl italic tracking-tighter leading-none mt-1">
                                R$ {Number(viewingVehicle.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                            <button onClick={() => generateBudgetPDF(viewingVehicle)} className="w-full bg-zinc-800/80 hover:bg-zinc-700 px-4 py-2.5 rounded-xl text-zinc-300 font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 border border-zinc-700 shadow-xl transition-all active:scale-95">
                               <Download size={16}/> GERAR ORÇAMENTO
                            </button>
                         </div>
                         <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col">
                            <p className="text-[8px] text-zinc-600 font-black mb-1 uppercase tracking-widest italic leading-none">Custo Material</p>
                            <p className="text-zinc-200 font-bold text-xl italic tracking-tighter mt-1">
                              R$ {Number(viewingVehicle.cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                         </div>
                      </div>
                   </div>

                   {/* Coluna Direita: Fotos - AJUSTADO PARA ROLAGEM MOBILE */}
                   <div className="flex md:grid overflow-x-auto md:overflow-x-visible md:grid-cols-2 gap-4 h-fit md:sticky md:top-0 pb-6 md:pb-0 no-scrollbar snap-x snap-mandatory overscroll-x-contain">
                      {/* Galeria de Fotos */}
                      {Object.keys(viewingVehicle.photos || {}).map((key, idx) => (
                        <div key={idx} className={`bg-zinc-900 rounded-[20px] overflow-hidden relative border border-zinc-800 shadow-2xl transition-all hover:border-orange-600/30 group flex-shrink-0 snap-center ${idx === 4 ? 'w-[85vw] md:w-full md:col-span-2 aspect-[21/9]' : 'w-[75vw] md:w-full aspect-square'}`}>
                          {viewingVehicle.photos[key] ? (
                            <img src={viewingVehicle.photos[key]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={key} />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-800 gap-2">
                               <ImageIcon size={32} className="opacity-10" />
                               <span className="text-[8px] font-black uppercase tracking-[0.2em] italic">SEM FOTO: {key}</span>
                            </div>
                          )}
                          <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800 shadow-lg">
                            <span className="text-[8px] font-black text-white uppercase tracking-widest italic">{key}</span>
                          </div>
                        </div>
                      ))}

                      {/* Botão Adicionar Mais Fotos na Ficha Técnica */}
                      <div className="w-[75vw] md:w-full aspect-square bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-[20px] flex items-center justify-center hover:border-orange-600 transition-all flex-shrink-0 snap-center">
                         <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-3">
                            <input type="file" accept="image/*" className="hidden" onChange={handleUpdateVehiclePhotos} />
                            <div className="p-4 bg-zinc-900 rounded-full text-orange-600">
                                <Plus size={24} />
                            </div>
                            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest italic">Adicionar Foto</span>
                         </label>
                      </div>
                   </div>
                </div>
              </Card>
            </div>
          )}

          {/* MODAL DE ESTOQUE */}
          {isInventoryModalOpen && (
            <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[300] flex items-center justify-center p-4">
              <Card className="w-full max-w-md p-6 relative bg-zinc-950 border-zinc-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <button 
                  type="button"
                  onClick={() => setIsInventoryModalOpen(false)} 
                  className="absolute top-4 right-4 text-zinc-700 hover:text-white transition-all"
                >
                  <X size={20}/>
                </button>
                <form onSubmit={handleAddItem} className="space-y-6">
                   <div className="flex items-center gap-3 mb-2">
                      <div className="bg-blue-600/20 p-2 rounded-lg text-blue-500">
                         <Package size={20}/>
                      </div>
                      <h2 className="text-lg font-black text-white uppercase italic tracking-tight">Cadastrar Novo Item</h2>
                   </div>
                   
                   <div className="space-y-4">
                      <Input 
                        label="Nome do Material" 
                        placeholder="Ex: Verniz PU, Lixa 600..." 
                        value={newItem.name} 
                        onChange={e => setNewItem({...newItem, name: e.target.value})} 
                        required 
                      />
                      <Input 
                        label="Marca / Fabricante" 
                        placeholder="Ex: 3M, Norton..." 
                        value={newItem.brand} 
                        onChange={e => setNewItem({...newItem, brand: e.target.value})} 
                        required 
                      />
                      <div className="grid grid-cols-2 gap-4">
                         <Input 
                           label="Quantidade Inicial" 
                           type="number" 
                           placeholder="0" 
                           value={newItem.quantity} 
                           onChange={e => setNewItem({...newItem, quantity: e.target.value})} 
                           required 
                         />
                         <Input 
                           label="Preço Unitário (R$)" 
                           type="number" 
                           step="0.01" 
                           placeholder="0,00" 
                           value={newItem.price} 
                           onChange={e => setNewItem({...newItem, price: e.target.value})} 
                           required 
                         />
                      </div>
                   </div>

                   <div className="flex gap-3 pt-2">
                      <Button variant="outline" className="flex-1" onClick={() => setIsInventoryModalOpen(false)}>Cancelar</Button>
                      <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">Adicionar Item</Button>
                   </div>
                </form>
              </Card>
            </div>
          )}
        </>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        body { background: black; margin: 0; } 
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.99); } to { opacity: 1; transform: scale(1); } }
        .animate-in { animation: fadeIn 0.15s ease-out forwards; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #18181b; border-radius: 10px; }
      ` }} />
    </div>
  );
}
