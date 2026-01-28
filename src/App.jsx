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
  UserPlus
} from 'lucide-react';

// --- CONFIGURAÇÃO DO BANCO DE DADOS (SUPABASE) ---
const SUPABASE_URL = "https://nmuhjnkiktaxvvarcfvt.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_1KEeI_9oX6JkhqPoLcxO-A_vFN77VoA";

// --- COMPONENTES UI AUXILIARES ---

const Card = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl transition-all ${onClick ? 'cursor-pointer hover:border-zinc-600' : ''} ${className}`}
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
  
  const [currentTenantId, setCurrentTenantId] = useState(null);

  const [vehicles, setVehicles] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [dashboardFilter, setDashboardFilter] = useState('all');

  const [authMode, setAuthMode] = useState('login'); 
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ workshop_name: "", email: "", password: "", confirmPassword: "" });
  const [loginError, setLoginError] = useState("");

  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 4000);
  };

  const [profile, setProfile] = useState({
    workshop_name: "", cnpj: "", owner_name: "", address: "", phone: "", email: ""
  });

  const [fixedCosts, setFixedCosts] = useState({
    aluguel: 0, material: 0, funcionario: 0, agua: 0, luz: 0, internet: 0
  });
  
  const [fixedCostsId, setFixedCostsId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  
  const [newVehicle, setNewVehicle] = useState({
    customerName: "", phone: "", brand: "", model: "", licensePlate: "", type: "Normal", 
    color: "", location: "", professional: "", price: "", cost: "", workStatus: "Aguardando Aprovação",
    serviceDescription: "", photos: {} 
  });

  const [newItem, setNewItem] = useState({
    name: "", brand: "", quantity: "", unitPrice: "",
    purchaseDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const scriptSupabase = document.createElement('script');
    scriptSupabase.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    scriptSupabase.async = true;
    scriptSupabase.onload = () => {
      if (window.supabase) {
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        setSupabase(client);
        
        const savedAuth = localStorage.getItem('autoprime_session_active');
        const savedTenant = localStorage.getItem('autoprime_tenant_id');
        
        if (savedAuth === 'true' && savedTenant) {
          setCurrentTenantId(savedTenant);
          setIsAuthenticated(true);
        }
        
        setAuthLoading(false);
      }
    };
    document.head.appendChild(scriptSupabase);

    const scriptPDF = document.createElement('script');
    scriptPDF.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    scriptPDF.async = true;
    scriptPDF.onload = () => {
        if (window.jspdf) window.jsPDF = window.jspdf.jsPDF;
        const scriptTable = document.createElement('script');
        scriptTable.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js';
        scriptTable.async = true;
        document.head.appendChild(scriptTable);
    };
    document.head.appendChild(scriptPDF);
  }, []);

  useEffect(() => {
    if (supabase && isAuthenticated && currentTenantId) fetchData();
  }, [supabase, isAuthenticated, currentTenantId]);

  const fetchData = async () => {
    if (!supabase || !currentTenantId) return;
    setLoading(true);
    try {
      const { data: vData, error: vError } = await supabase
        .from('autoprime_vehicles')
        .select('*')
        .eq('tenant_id', currentTenantId)
        .order('created_at', { ascending: false });
      
      const { data: iData, error: iError } = await supabase
        .from('autoprime_inventory')
        .select('*')
        .eq('tenant_id', currentTenantId)
        .order('created_at', { ascending: false });

      const { data: fData, error: fError } = await supabase
        .from('autoprime_fixed_costs')
        .select('*')
        .eq('tenant_id', currentTenantId)
        .maybeSingle(); 

      const { data: pData, error: pError } = await supabase
        .from('autoprime_profile')
        .select('*')
        .eq('tenant_id', currentTenantId)
        .maybeSingle();

      if (!vError) setVehicles(vData || []);
      if (!iError) setInventory(iData || []);
      
      if (!fError && fData) {
        setFixedCostsId(fData.id); 
        setFixedCosts({
          aluguel: Number(fData.aluguel) || 0,
          material: Number(fData.material) || 0,
          funcionario: Number(fData.funcionario) || 0,
          agua: Number(fData.agua) || 0,
          luz: Number(fData.luz) || 0,
          internet: Number(fData.internet) || 0
        });
      } else {
        setFixedCostsId(null);
        setFixedCosts({ aluguel: 0, material: 0, funcionario: 0, agua: 0, luz: 0, internet: 0 });
      }
      
      if (!pError && pData) {
        setProfile({
          workshop_name: pData.workshop_name ?? "",
          cnpj: pData.cnpj ?? "",
          owner_name: pData.owner_name ?? "",
          address: pData.address ?? "",
          phone: pData.phone ?? "",
          email: pData.email ?? ""
        });
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('autoprime_admins')
        .select('*')
        .eq('email', loginForm.email)
        .eq('password', loginForm.password)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCurrentTenantId(data.tenant_id);
        setIsAuthenticated(true);
        localStorage.setItem('autoprime_session_active', 'true');
        localStorage.setItem('autoprime_tenant_id', data.tenant_id);
        showNotification("Acesso autorizado!");
      } else {
        setLoginError("Credenciais inválidas.");
      }
    } catch (err) {
      setLoginError("Erro ao conectar.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (!supabase) return;

    if (registerForm.password !== registerForm.confirmPassword) {
      setLoginError("As senhas não coincidem.");
      return;
    }

    try {
      const newTenantId = `tenant-${Math.random().toString(36).substr(2, 9)}`;
      const { error: adminError } = await supabase
        .from('autoprime_admins')
        .insert([{
          email: registerForm.email,
          password: registerForm.password,
          tenant_id: newTenantId
        }]);

      if (adminError) {
        if (adminError.code === '23505') setLoginError("Este e-mail já está cadastrado.");
        else throw adminError;
        return;
      }

      await supabase
        .from('autoprime_profile')
        .insert([{
          tenant_id: newTenantId,
          workshop_name: registerForm.workshop_name,
          email: registerForm.email
        }]);

      showNotification("Conta criada! Faça login.");
      setAuthMode('login');
      setLoginForm({ email: registerForm.email, password: registerForm.password });
    } catch (err) {
      console.error(err);
      setLoginError("Erro ao criar conta.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentTenantId(null);
    setFixedCostsId(null);
    localStorage.removeItem('autoprime_session_active');
    localStorage.removeItem('autoprime_tenant_id');
    showNotification("Sessão encerrada.");
  };

  const activeVehicles = useMemo(() => vehicles.filter(v => v.status === 'active'), [vehicles]);
  const historyVehicles = useMemo(() => vehicles.filter(v => v.status === 'done'), [vehicles]);
  
  const finance = useMemo(() => {
    const totalRevenue = vehicles.reduce((acc, v) => acc + (Number(v.price) || 0), 0);
    const totalExpenses = Object.values(fixedCosts).reduce((acc, val) => acc + (Number(val) || 0), 0);
    return { totalRevenue, totalExpenses, profit: totalRevenue - totalExpenses };
  }, [vehicles, fixedCosts]);

  const dashboardStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return {
      orcamentos: activeVehicles.filter(v => v.work_status === 'Aguardando Aprovação').length,
      cadastrados: activeVehicles.filter(v => v.work_status === 'Cadastrado').length,
      emTrabalho: activeVehicles.filter(v => v.work_status === 'In Work').length,
      concluidosMes: historyVehicles.filter(v => {
        const d = new Date(v.created_at);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }).length
    };
  }, [activeVehicles, historyVehicles]);

  const filteredDashboardVehicles = useMemo(() => {
    if (dashboardFilter === 'budgets') return activeVehicles.filter(v => v.work_status === 'Aguardando Aprovação');
    if (dashboardFilter === 'registered') return activeVehicles.filter(v => v.work_status === 'Cadastrado');
    if (dashboardFilter === 'in_work') return activeVehicles.filter(v => v.work_status === 'In Work');
    if (dashboardFilter === 'done') {
        const now = new Date();
        return historyVehicles.filter(v => {
            const d = new Date(v.created_at);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
    }
    return activeVehicles;
  }, [dashboardFilter, activeVehicles, historyVehicles]);

  const polishingList = useMemo(() => {
    return vehicles.filter(v => v.polishing_date).sort((a, b) => new Date(a.polishing_date) - new Date(b.polishing_date));
  }, [vehicles]);

  const generateBudgetPDF = (vehicle) => {
    if (!window.jspdf) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header do PDF
    doc.setFillColor(39, 39, 42); doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.setFont("helvetica", "bold");
    doc.text(profile.workshop_name || "AUTOPRIME", 15, 20);
    doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.text(`CNPJ: ${profile.cnpj || "-"}`, 15, 27);
    doc.text(`Endereço: ${profile.address || "-"}`, 15, 32);
    doc.text(`Contato: ${profile.phone || "-"} | ${profile.email || "-"}`, 15, 37);
    doc.setFontSize(14); doc.text("ORÇAMENTO #"+vehicle.id.substring(0,6).toUpperCase(), 140, 25);
    
    // Dados do Cliente
    doc.setTextColor(0, 0, 0); doc.setFontSize(12); doc.setFont("helvetica", "bold");
    doc.text("DADOS DO CLIENTE", 15, 55); doc.line(15, 57, 195, 57);
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    doc.text(`Cliente: ${vehicle.customer_name}`, 15, 65); doc.text(`Telefone: ${vehicle.phone}`, 15, 72);
    
    // Dados do Veículo
    doc.setFont("helvetica", "bold"); doc.text("DADOS DO VEÍCULO", 15, 85); doc.line(15, 87, 195, 87);
    doc.setFont("helvetica", "normal"); doc.text(`Marca/Modelo: ${vehicle.brand} ${vehicle.model}`, 15, 95);
    doc.text(`Placa: ${vehicle.license_plate}`, 15, 102); doc.text(`Cor: ${vehicle.color}`, 140, 95);
    doc.text(`Profissional: ${vehicle.professional || "-"}`, 140, 102);
    
    // Descritivo dos Serviços
    doc.setFont("helvetica", "bold"); doc.text("DESCRITIVO DOS SERVIÇOS", 15, 115); doc.line(15, 117, 195, 117);
    const splitDesc = doc.splitTextToSize(vehicle.service_description || "Nenhum serviço descrito.", 180);
    doc.setFont("helvetica", "normal"); doc.text(splitDesc, 15, 125);
    
    // Valor Total
    const totalPos = 180;
    const total = `VALOR TOTAL: R$ ${Number(vehicle.price).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.text(total, 120, totalPos);
    
    // Área de Assinatura
    const signPos = 240;
    doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.line(15, signPos, 90, signPos); doc.text("Assinatura do Cliente", 15, signPos + 5);
    doc.line(120, signPos, 195, signPos); doc.text("Responsável Oficina", 120, signPos + 5);
    
    doc.save(`Orcamento_${vehicle.license_plate}.pdf`);
  };

  const updateWorkStatus = async (id, newWorkStatus) => {
    if (!supabase) return;
    const isDone = newWorkStatus === 'Concluído';
    const polDate = isDone ? new Date(new Date().setDate(new Date().getDate() + 30)).toISOString() : null;
    const upd = { work_status: newWorkStatus, status: isDone ? 'done' : 'active', polishing_date: polDate };
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...upd } : v));
    await supabase.from('autoprime_vehicles').update(upd).eq('id', id);
    if (isDone) showNotification("Serviço concluído!");
  };

  const reactivateVehicle = async (id) => {
    if (!supabase) return;
    const upd = { status: 'active', work_status: 'In Work', polishing_date: null };
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...upd } : v));
    await supabase.from('autoprime_vehicles').update(upd).eq('id', id);
    showNotification("Veículo reativado com sucesso!");
  };

  const deleteVehicle = async (id) => {
    if (!supabase) return;
    const { error } = await supabase.from('autoprime_vehicles').delete().eq('id', id);
    if (!error) {
        setVehicles(prev => prev.filter(i => i.id !== id));
        showNotification("Registro removido.", "danger");
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!supabase || !currentTenantId) return;

    // CORREÇÃO: Mapeamento correto dos campos do estado para o banco
    const vData = {
      customer_name: newVehicle.customerName, 
      phone: newVehicle.phone, 
      brand: newVehicle.brand,
      model: newVehicle.model, 
      license_plate: newVehicle.licensePlate, 
      vehicle_type: newVehicle.type,
      color: newVehicle.color, 
      entry_time: new Date().toLocaleString('pt-BR'), 
      location: newVehicle.location,
      professional: newVehicle.professional, 
      service_description: newVehicle.serviceDescription, // Ajustado de service_description para serviceDescription
      status: 'active', 
      work_status: newVehicle.workStatus, 
      price: Number(newVehicle.price) || 0,
      cost: Number(newVehicle.cost) || 0, 
      tenant_id: currentTenantId, 
      photos: newVehicle.photos 
    };

    try {
      const { data, error } = await supabase.from('autoprime_vehicles').insert([vData]).select();
      
      if (error) {
        console.error("Erro Supabase:", error);
        showNotification("Erro ao registrar veículo. Verifique as permissões.", "danger");
        return;
      }

      if (data && data.length > 0) {
        setVehicles(prev => [data[0], ...prev]);
        setIsModalOpen(false);
        // Reset do formulário
        setNewVehicle({ 
          customerName: "", phone: "", brand: "", model: "", licensePlate: "", 
          type: "Normal", color: "", location: "", professional: "", 
          price: "", cost: "", workStatus: "Aguardando Aprovação", 
          serviceDescription: "", photos: {} 
        });
        showNotification("Veículo registrado com sucesso!");
      }
    } catch (err) {
      console.error("Erro crítico:", err);
      showNotification("Erro de conexão com o servidor.", "danger");
    }
  };

  const handlePhotoUpload = (pos, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewVehicle(prev => ({ ...prev, photos: { ...prev.photos, [pos]: reader.result } }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    if (!supabase || !currentTenantId) return;
    const itemData = {
      name: newItem.name, brand: newItem.brand, quantity: Number(newItem.quantity),
      price: Number(newItem.unitPrice), purchase_date: newItem.purchaseDate, tenant_id: currentTenantId
    };
    const { data, error } = await supabase.from('autoprime_inventory').insert([itemData]).select();
    if (!error) {
      setInventory(prev => [data[0], ...prev]);
      setIsInventoryModalOpen(false);
      setNewItem({ name: "", brand: "", quantity: "", unitPrice: "", purchaseDate: new Date().toISOString().split('T')[0] });
      showNotification("Material Adicionado!");
    }
  };

  const deleteInventoryItem = async (id) => {
    if (!supabase) return;
    const { error } = await supabase.from('autoprime_inventory').delete().eq('id', id);
    if (!error) setInventory(prev => prev.filter(i => i.id !== id));
  };

  const saveFixedCosts = async () => {
    if (!supabase || !currentTenantId) return;
    
    const payload = {
      tenant_id: currentTenantId,
      aluguel: Number(fixedCosts.aluguel) || 0,
      material: Number(fixedCosts.material) || 0,
      funcionario: Number(fixedCosts.funcionario) || 0,
      agua: Number(fixedCosts.agua) || 0,
      luz: Number(fixedCosts.luz) || 0,
      internet: Number(fixedCosts.internet) || 0
    };

    if (fixedCostsId) {
      payload.id = fixedCostsId;
    }

    const { data, error } = await supabase
      .from('autoprime_fixed_costs')
      .upsert(payload, { 
        onConflict: 'tenant_id' 
      })
      .select();

    if (!error) {
      if (data && data[0]) setFixedCostsId(data[0].id);
      showNotification("Finanças Atualizadas!");
    } else {
      console.error("Erro ao salvar custos:", error);
      showNotification("Erro de permissão no banco de dados.", "danger");
    }
  };

  const saveProfile = async () => {
    if (!supabase || !currentTenantId) return;
    const { error } = await supabase.from('autoprime_profile').upsert({ tenant_id: currentTenantId, ...profile }, { onConflict: 'tenant_id' });
    if (!error) showNotification("Dados da oficina salvos!", "success");
  };

  // --- RENDERS ---

  const renderAuth = () => (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/5 blur-[120px] rounded-full" />

      <Card className="w-full max-w-md p-10 relative z-10 border-zinc-800/50 backdrop-blur-xl">
        <div className="flex flex-col items-center gap-6 mb-10">
          <div className="bg-orange-600 p-4 rounded-2xl text-black shadow-lg shadow-orange-600/20 rotate-12">
            <Paintbrush size={32} strokeWidth={3}/>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Auto<span className="text-orange-600">Prime</span></h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Sua oficina em um novo nível de gestão</p>
          </div>
        </div>

        {authMode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <Input label="E-mail" type="email" icon={Mail} placeholder="exemplo@email.com" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} required />
              <Input label="Senha" type="password" icon={Lock} placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} required />
            </div>
            {loginError && <div className="p-3 bg-red-600/10 border border-red-600/20 rounded-xl text-red-500 text-xs font-bold animate-in fade-in"><AlertTriangle size={14} className="inline mr-2" /> {loginError}</div>}
            <Button type="submit" className="w-full py-4 flex items-center justify-center gap-2 text-sm">Acessar Painel <LogIn size={18} /></Button>
            <div className="text-center mt-6">
              <button type="button" onClick={() => {setAuthMode('register'); setLoginError("");}} className="text-zinc-500 hover:text-orange-600 text-xs font-bold uppercase transition-colors">Não tem conta? Cadastre sua oficina</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-4">
              <Input label="Nome da Oficina" icon={Building2} placeholder="Ex: Prime Car" value={registerForm.workshop_name} onChange={e => setRegisterForm({...registerForm, workshop_name: e.target.value})} required />
              <Input label="E-mail de Acesso" type="email" icon={Mail} placeholder="exemplo@email.com" value={registerForm.email} onChange={e => setRegisterForm({...registerForm, email: e.target.value})} required />
              <Input label="Criar Senha" type="password" icon={Lock} placeholder="••••••••" value={registerForm.password} onChange={e => setRegisterForm({...registerForm, password: e.target.value})} required />
              <Input label="Confirmar Senha" type="password" icon={Lock} placeholder="••••••••" value={registerForm.confirmPassword} onChange={e => setRegisterForm({...registerForm, confirmPassword: e.target.value})} required />
            </div>
            {loginError && <div className="p-3 bg-red-600/10 border border-red-600/20 rounded-xl text-red-500 text-xs font-bold animate-in fade-in">{loginError}</div>}
            <Button type="submit" className="w-full py-4 flex items-center justify-center gap-2 text-sm">Criar Minha Conta <UserPlus size={18} /></Button>
            <div className="text-center mt-6">
              <button type="button" onClick={() => {setAuthMode('login'); setLoginError("");}} className="text-zinc-500 hover:text-orange-600 text-xs font-bold uppercase transition-colors">Já possui conta? Faça Login</button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );

  const renderDashboard = () => (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { id: 'budgets', label: 'Orçamentos', val: dashboardStats.orcamentos, color: 'border-l-zinc-500', icon: ClipboardList, iconColor: 'text-zinc-500', bg: 'bg-zinc-800' },
          { id: 'registered', label: 'Cadastrados', val: dashboardStats.cadastrados, color: 'border-l-orange-600', icon: Car, iconColor: 'text-orange-600', bg: 'bg-orange-600/10' },
          { id: 'in_work', label: 'Em Trabalho', val: dashboardStats.emTrabalho, color: 'border-l-blue-600', icon: Wrench, iconColor: 'text-blue-600', bg: 'bg-blue-600/10' },
          { id: 'done', label: 'Concluídos (Mês)', val: dashboardStats.concluidosMes, color: 'border-l-emerald-600', icon: CheckCircle2, iconColor: 'text-emerald-600', bg: 'bg-emerald-600/10' },
        ].map(st => (
          <Card key={st.id} onClick={() => setDashboardFilter(st.id)} className={`p-4 flex items-center gap-3 border-l-4 transition-all ${dashboardFilter === st.id ? `${st.color} bg-zinc-800` : 'border-l-zinc-800 opacity-60'}`}>
            <div className={`p-2 ${st.bg} rounded-xl ${st.iconColor}`}><st.icon size={24} /></div>
            <div><p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest leading-none mb-1">{st.label}</p><h3 className="text-xl font-black text-white">{st.val}</h3></div>
          </Card>
        ))}
      </div>
      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-black text-white tracking-tight uppercase italic flex items-center gap-2">
            {dashboardFilter === 'budgets' ? 'Orçamentos Pendentes' : 
             dashboardFilter === 'done' ? 'Serviços Finalizados no Mês' : 'Veículos Ativos'}
        </h2>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2"><Plus size={18} /> Nova Entrada</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDashboardVehicles.length === 0 ? (
            <div className="col-span-full py-20 text-center text-zinc-600 font-bold uppercase text-xs tracking-widest">Nenhum veículo encontrado nesta categoria.</div>
        ) : (
            filteredDashboardVehicles.map(v => (
              <Card key={v.id} className="p-5 flex flex-col gap-4 border-t-4 border-t-zinc-700" onClick={() => setViewingVehicle(v)}>
                <div className="flex justify-between items-start">
                  <div><h4 className="text-xl font-black text-white uppercase italic">{v.brand} {v.model}</h4><p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{v.license_plate} • {v.color}</p></div>
                  <span className="text-[8px] px-2 py-0.5 rounded font-black uppercase border bg-orange-600/10 text-orange-600 border-orange-600/20">{v.work_status}</span>
                </div>
                {v.status === 'active' && (
                  <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex-1 flex gap-1 bg-zinc-800 p-1 rounded-xl overflow-x-auto no-scrollbar">
                      {['Aguardando Aprovação', 'Cadastrado', 'In Work', 'Concluído'].map(st => (
                        <button key={st} onClick={() => updateWorkStatus(v.id, st)} className={`whitespace-nowrap px-3 py-2 rounded-lg text-[8px] font-black uppercase transition-all ${v.work_status === st ? 'bg-orange-600 text-black' : 'text-zinc-500 hover:text-white'}`}>{st === 'Aguardando Aprovação' ? 'Orçamento' : st}</button>
                      ))}
                    </div>
                    <Button variant="danger" onClick={() => deleteVehicle(v.id)} className="px-3"><Trash2 size={16}/></Button>
                  </div>
                )}
                {v.status === 'done' && (
                   <div className="flex justify-end pt-2">
                        <Button variant="outline" className="text-[10px] py-1 px-3" onClick={(e) => { e.stopPropagation(); reactivateVehicle(v.id); }}>
                            <RotateCcw size={12} className="mr-1 inline"/> Reativar
                        </Button>
                   </div>
                )}
              </Card>
            ))
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="p-6 space-y-8 animate-in slide-in-from-right-5 duration-500 max-w-4xl">
      <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Meus Dados</h2>
      <Card className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Nome da Funilaria / Estética" value={profile.workshop_name} onChange={(e) => setProfile({...profile, workshop_name: e.target.value})} />
          <Input label="CNPJ" placeholder="00.000.000/0000-00" value={profile.cnpj} onChange={(e) => setProfile({...profile, cnpj: e.target.value})} />
          <Input label="Nome do Dono / Responsável" value={profile.owner_name} onChange={(e) => setProfile({...profile, owner_name: e.target.value})} />
          <Input label="Telefone Comercial" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} />
          <div className="md:col-span-2"><Input label="Endereço Completo" value={profile.address} onChange={(e) => setProfile({...profile, address: e.target.value})} /></div>
          <div className="md:col-span-2"><Input label="E-mail de Contato" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} /></div>
        </div>
        <div className="pt-6 border-t border-zinc-800 flex justify-end"><Button onClick={saveProfile} className="px-12"><Save size={18} className="inline mr-2"/> Salvar Dados</Button></div>
      </Card>
    </div>
  );

  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-orange-500"><Loader2 className="animate-spin" size={48} /></div>;
  if (!isAuthenticated) return <>{notification.show && <div className="fixed top-4 right-4 z-[500] flex items-center gap-3 px-6 py-4 rounded-2xl border bg-emerald-950 border-emerald-500 text-emerald-400 animate-in slide-in-from-top-10"><Check size={20}/><span className="font-bold uppercase text-xs tracking-widest">{notification.message}</span></div>}{renderAuth()}</>;

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans flex flex-col md:flex-row relative">
      {notification.show && <div className="fixed top-4 right-4 z-[500] flex items-center gap-3 px-6 py-4 rounded-2xl border bg-emerald-950 border-emerald-500 text-emerald-400 animate-in slide-in-from-top-10"><Check size={20}/><span className="font-bold uppercase text-xs tracking-widest">{notification.message}</span></div>}
      
      <aside className="hidden md:flex flex-col w-72 bg-zinc-950 border-r border-zinc-800 p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12"><div className="bg-orange-600 p-2 rounded-xl text-black rotate-12"><Paintbrush size={24} strokeWidth={3}/></div><h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">Auto<span className="text-orange-600">Prime</span></h1></div>
        <nav className="flex flex-col gap-2 flex-1">
          {[
            { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
            { id: 'history', label: 'Histórico', icon: History },
            { id: 'polishing', label: 'Polimento', icon: Sparkles },
            { id: 'inventory', label: 'Estoque', icon: Package },
            { id: 'finance', label: 'Financeiro', icon: DollarSign },
            { id: 'customers', label: 'Clientes', icon: Users },
            { id: 'profile', label: 'Meus dados', icon: User },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all ${activeTab === item.id ? 'bg-orange-600 text-black italic' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}><item.icon size={18} /> {item.label}</button>
          ))}
        </nav>
        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 px-4 py-3.5 text-red-500 font-black uppercase text-[11px] tracking-widest hover:bg-red-500/10 rounded-2xl transition-all"><LogOut size={18} /> Sair</button>
      </aside>

      <main className="flex-1 min-h-screen overflow-y-auto pb-24 md:pb-0">
        {loading && <div className="h-1 w-full bg-zinc-900 overflow-hidden"><div className="h-full bg-orange-600 animate-pulse w-1/3" /></div>}
        
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'profile' && renderProfile()}
        
        {activeTab === 'history' && (
           <div className="p-6 space-y-6">
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Histórico de Pinturas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {historyVehicles.map(v => (
                    <Card key={v.id} onClick={() => setViewingVehicle(v)} className="p-6 opacity-60 hover:opacity-100 transition-all flex justify-between items-center group">
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-black text-white uppercase italic">{v.brand} {v.model}</h4>
                                <CheckCircle2 className="text-emerald-500" size={16}/>
                            </div>
                            <p className="text-xs text-zinc-500 mt-1 uppercase font-bold">{v.customer_name} • {v.license_plate} • {v.entry_time}</p>
                        </div>
                        <Button variant="outline" className="opacity-0 group-hover:opacity-100 transition-all" onClick={(e) => { e.stopPropagation(); reactivateVehicle(v.id); }}>
                            <RotateCcw size={16} />
                        </Button>
                    </Card>
                 ))}
              </div>
           </div>
        )}

        {activeTab === 'polishing' && (
           <div className="p-6 space-y-6">
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2"><Sparkles className="text-orange-500"/> Agenda de Polimento</h2>
              <Card className="overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-800 text-zinc-400 text-[9px] uppercase font-black tracking-widest">
                    <tr><th className="p-4">Cliente</th><th className="p-4">Veículo</th><th className="p-4">Data Polimento</th></tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {polishingList.map(v => (
                      <tr key={v.id} className="hover:bg-zinc-800/30">
                        <td className="p-4 font-bold text-white uppercase italic">{v.customer_name}</td>
                        <td className="p-4 text-zinc-300">{v.brand} {v.model} ({v.license_plate})</td>
                        <td className="p-4 text-orange-500 font-black">{new Date(v.polishing_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
           </div>
        )}

        {activeTab === 'inventory' && (
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Estoque</h2>
              <Button onClick={() => setIsInventoryModalOpen(true)} className="flex items-center gap-2"><Plus size={18}/> Novo Item</Button>
            </div>
            <Card className="overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-800 text-zinc-500 text-[9px] uppercase font-black tracking-widest">
                  <tr><th className="p-4">Item</th><th className="p-4">Marca</th><th className="p-4">Qtd</th><th className="p-4">Preço</th><th className="p-4">Ação</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {inventory.map(item => (
                    <tr key={item.id}>
                      <td className="p-4 font-bold text-white uppercase italic">{item.name}</td>
                      <td className="p-4 text-zinc-500 uppercase text-xs font-bold">{item.brand || '-'}</td>
                      <td className="p-4">{item.quantity} un</td>
                      <td className="p-4 text-emerald-500 font-black">R$ {Number(item.price).toLocaleString()}</td>
                      <td className="p-4"><button onClick={() => deleteInventoryItem(item.id)} className="text-zinc-600 hover:text-red-500"><Trash2 size={16}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="p-6 space-y-8 animate-in zoom-in-95 duration-300">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Financeiro</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 border-l-4 border-l-orange-500">
                <p className="text-[10px] text-zinc-500 font-black uppercase mb-1">Faturamento Total</p>
                <p className="text-3xl font-black italic text-white">R$ {finance.totalRevenue.toLocaleString()}</p>
              </Card>
              <Card className="p-6 border-l-4 border-l-red-500">
                <p className="text-[10px] text-zinc-500 font-black uppercase mb-1">Custos Fixos</p>
                <p className="text-3xl font-black italic text-red-500">R$ {finance.totalExpenses.toLocaleString()}</p>
              </Card>
              <Card className="p-6 border-l-4 border-l-emerald-500">
                <p className="text-[10px] text-zinc-500 font-black uppercase mb-1">Lucro Estimado</p>
                <p className="text-3xl font-black italic text-emerald-500">R$ {finance.profit.toLocaleString()}</p>
              </Card>
            </div>
            <Card className="p-8 space-y-6">
              <h3 className="text-xl font-black text-white uppercase italic border-b border-zinc-800 pb-4">Gerenciar Custos Mensais</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input label="Aluguel" type="number" value={fixedCosts.aluguel} onChange={e => setFixedCosts({...fixedCosts, aluguel: e.target.value})}/>
                <Input label="Materiais/Peças" type="number" value={fixedCosts.material} onChange={e => setFixedCosts({...fixedCosts, material: e.target.value})}/>
                <Input label="Funcionários" type="number" value={fixedCosts.funcionario} onChange={e => setFixedCosts({...fixedCosts, funcionario: e.target.value})}/>
                <Input label="Energia/Luz" type="number" value={fixedCosts.luz} onChange={e => setFixedCosts({...fixedCosts, luz: e.target.value})}/>
                <Input label="Água" type="number" value={fixedCosts.agua} onChange={e => setFixedCosts({...fixedCosts, agua: e.target.value})}/>
                <Input label="Internet" type="number" value={fixedCosts.internet} onChange={e => setFixedCosts({...fixedCosts, internet: e.target.value})}/>
              </div>
              <div className="flex justify-end"><Button onClick={saveFixedCosts} className="px-8"><Save size={18} className="mr-2 inline"/> Salvar Financeiro</Button></div>
            </Card>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="p-6 space-y-6">
             <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Meus Clientes</h2>
             <Card className="overflow-hidden">
                <table className="w-full text-left text-sm">
                   <thead className="bg-zinc-800 text-zinc-400 text-[9px] uppercase font-black tracking-widest">
                      <tr><th className="p-4">Nome</th><th className="p-4">Telefone</th><th className="p-4">Veículo</th></tr>
                   </thead>
                   <tbody className="divide-y divide-zinc-800">
                      {vehicles.map(v => (
                         <tr key={v.id}>
                            <td className="p-4 font-bold text-white uppercase italic">{v.customer_name}</td>
                            <td className="p-4 text-zinc-300">{v.phone}</td>
                            <td className="p-4 text-zinc-500 text-xs">{v.brand} {v.model} ({v.license_plate})</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </Card>
          </div>
        )}

      </main>

      {/* MODAL VIEW VEHICLE */}
      {viewingVehicle && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[150] flex items-center justify-center p-4">
           <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto relative flex flex-col">
              <div className="bg-orange-600 p-8 flex justify-between items-start">
                  <div>
                    <h2 className="text-4xl font-black text-black italic uppercase leading-none">{viewingVehicle.brand} {viewingVehicle.model}</h2>
                    <p className="text-black font-black uppercase text-xs mt-2 tracking-widest">{viewingVehicle.license_plate} • {viewingVehicle.color}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="bg-black/20 text-black border-none" onClick={() => generateBudgetPDF(viewingVehicle)}><Download size={18} /></Button>
                    <button onClick={() => setViewingVehicle(null)} className="text-black bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all"><X size={24}/></button>
                  </div>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-zinc-500 text-[10px] font-black uppercase tracking-tighter">Cliente</p><p className="text-white font-bold">{viewingVehicle.customer_name}</p></div>
                    <div><p className="text-zinc-500 text-[10px] font-black uppercase tracking-tighter">Telefone</p><p className="text-white font-bold">{viewingVehicle.phone}</p></div>
                    <div><p className="text-zinc-500 text-[10px] font-black uppercase tracking-tighter">Profissional</p><p className="text-white font-bold">{viewingVehicle.professional || "-"}</p></div>
                    <div><p className="text-zinc-500 text-[10px] font-black uppercase tracking-tighter">Entrada</p><p className="text-white font-bold">{viewingVehicle.entry_time}</p></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-800/50 rounded-2xl border border-zinc-700">
                    <div><p className="text-zinc-500 text-[10px] font-black uppercase">Valor do Serviço</p><p className="text-emerald-500 font-black text-xl">R$ {Number(viewingVehicle.price).toLocaleString()}</p></div>
                    <div><p className="text-zinc-500 text-[10px] font-black uppercase">Custo Material</p><p className="text-red-500 font-black text-xl">R$ {Number(viewingVehicle.cost).toLocaleString()}</p></div>
                  </div>

                  <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                    <p className="text-zinc-500 text-[10px] uppercase font-black mb-2">Descrição do Serviço</p>
                    <p className="text-zinc-200 italic leading-relaxed">"{viewingVehicle.service_description}"</p>
                  </div>
                </div>

                <div className="space-y-4">
                   <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest ml-1">Check-list de Imagens</p>
                   <div className="grid grid-cols-2 gap-4">
                      {['Frente', 'Trás', 'Lado D', 'Lado E', 'Teto'].map(pos => (
                        <div key={pos} className="aspect-video bg-zinc-800 rounded-xl overflow-hidden border border-white/5 relative">
                           {viewingVehicle.photos?.[pos] ? (
                             <img src={viewingVehicle.photos[pos]} className="w-full h-full object-cover" alt={pos} />
                           ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
                                <ImageIcon size={24}/>
                                <span className="text-[8px] mt-1">Sem Foto: {pos}</span>
                             </div>
                           )}
                           <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[8px] font-black uppercase text-white">{pos}</div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
           </Card>
        </div>
      )}

      {/* MODAL NOVO VEÍCULO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl p-8 relative space-y-8 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white p-2"><X size={24}/></button>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Entrada de Veículo</h2>
            <form onSubmit={handleAddVehicle} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Dono" value={newVehicle.customerName} onChange={e => setNewVehicle({...newVehicle, customerName: e.target.value})} placeholder="Ex: João" required />
                <Input label="Contato" value={newVehicle.phone} onChange={e => setNewVehicle({...newVehicle, phone: e.target.value})} placeholder="(11) 99999-9999" required />
                <Input label="Marca" value={newVehicle.brand} onChange={e => setNewVehicle({...newVehicle, brand: e.target.value})} placeholder="Ex: BMW" required />
                <Input label="Modelo" value={newVehicle.model} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})} placeholder="Ex: M3" required />
                <Input label="Placa" value={newVehicle.licensePlate} onChange={e => setNewVehicle({...newVehicle, licensePlate: e.target.value.toUpperCase()})} placeholder="ABC-1234" required />
                <Input label="Orçamento" type="number" value={newVehicle.price} onChange={e => setNewVehicle({...newVehicle, price: e.target.value})} placeholder="1500" required />
                <Input label="Custo Material (Gasto)" type="number" value={newVehicle.cost} onChange={e => setNewVehicle({...newVehicle, cost: e.target.value})} placeholder="Ex: 450" required />
                <Input label="Profissional" value={newVehicle.professional} onChange={e => setNewVehicle({...newVehicle, professional: e.target.value})} placeholder="Ex: Ricardo Silva" required />
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-widest">Status Inicial</label>
                  <select className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-orange-600 appearance-none cursor-pointer text-sm" value={newVehicle.workStatus} onChange={e => setNewVehicle({...newVehicle, workStatus: e.target.value})} required><option value="Aguardando Aprovação">Orçamento (Aguardando Aprovação)</option><option value="Cadastrado">Confirmado (Pátio)</option></select>
                </div>
                <Input label="Cor" value={newVehicle.color} onChange={e => setNewVehicle({...newVehicle, color: e.target.value})} placeholder="Ex: Cinza Nardo" required />
              </div>
              <Input label="Descrição do Serviço" placeholder="Pintura parachoque e polimento..." value={newVehicle.serviceDescription} onChange={e => setNewVehicle({...newVehicle, serviceDescription: e.target.value})} required />
              <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-widest">Fotos Check-list</p>
                  <div className="grid grid-cols-5 gap-2">
                      {['Frente', 'Trás', 'Lado D', 'Lado E', 'Teto'].map(pos => (
                        <div key={pos} onClick={() => document.getElementById(`photo-${pos}`).click()} className="aspect-square bg-zinc-800 rounded-xl border border-zinc-700 border-dashed flex flex-col items-center justify-center text-zinc-600 cursor-pointer overflow-hidden relative group hover:border-orange-600/50 transition-colors">{newVehicle.photos[pos] ? (<img src={newVehicle.photos[pos]} className="w-full h-full object-cover" alt={pos} />) : (<><Camera size={20} className="group-hover:text-orange-600 transition-colors" /><span className="text-[8px] font-black uppercase mt-1">{pos}</span></>)}<input type="file" id={`photo-${pos}`} className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(pos, e)} /></div>
                      ))}
                  </div>
              </div>
              <div className="flex gap-3"><Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">Cancelar</Button><Button type="submit" className="flex-1">Registrar</Button></div>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL NOVO ITEM ESTOQUE */}
      {isInventoryModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <Card className="w-full max-w-xl p-8 relative space-y-8 animate-in zoom-in-95">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3"><Package className="text-orange-500"/> Novo Item no Estoque</h2>
            <form onSubmit={handleAddInventory} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nome do Item" placeholder="Ex: Verniz PU" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} required />
                <Input label="Marca" placeholder="Ex: Sherwin Williams" value={newItem.brand} onChange={e => setNewItem({...newItem, brand: e.target.value})} required />
                <Input label="Quantidade" type="number" placeholder="Ex: 10" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: e.target.value})} required />
                <Input label="Preço Unitário (R$)" type="number" placeholder="Ex: 85.50" value={newItem.unitPrice} onChange={e => setNewItem({...newItem, unitPrice: e.target.value})} required />
              </div>
              <div className="flex gap-3 pt-4"><Button variant="secondary" onClick={() => setIsInventoryModalOpen(false)} className="flex-1">Cancelar</Button><Button type="submit" className="flex-1">Cadastrar Material</Button></div>
            </form>
          </Card>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `body { background: black; } .no-scrollbar::-webkit-scrollbar { display: none; }` }} />
    </div>
  );
}
