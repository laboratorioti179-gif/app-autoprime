<h1 className="text-red-500 text-4xl font-bold">
  TAILWIND OK
</h1>

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
  Check
} from 'lucide-react';

// --- CONFIGURAÇÃO DO BANCO DE DADOS (SUPABASE) ---
const SUPABASE_URL = "https://nmuhjnkiktaxvvarcfvt.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_1KEeI_9oX6JkhqPoLcxO-A_vFN77VoA";
const TENANT_ID = "oficina-principal";

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

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">{label}</label>}
    <input 
      {...props} 
      className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-orange-600 transition-colors"
    />
  </div>
);

// --- APP PRINCIPAL ---

export default function App() {
  const [supabase, setSupabase] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewingVehicle, setViewingVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [vehicles, setVehicles] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [dashboardFilter, setDashboardFilter] = useState('all');

  // Sistema de Notificações Interno
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 4000);
  };

  // Perfil da Oficina
  const [profile, setProfile] = useState({
    workshop_name: "",
    cnpj: "",
    owner_name: "",
    address: "",
    phone: "",
    email: ""
  });

  // Estado para custos fixos editáveis
  const [fixedCosts, setFixedCosts] = useState({
    aluguel: 0,
    material: 0,
    funcionario: 0,
    agua: 0,
    luz: 0,
    internet: 0
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  
  const [newVehicle, setNewVehicle] = useState({
    customerName: "", phone: "", brand: "", model: "", licensePlate: "", type: "Normal", 
    color: "", location: "", professional: "", price: "", cost: "", workStatus: "Aguardando Aprovação",
    serviceDescription: "",
    photos: {} 
  });

  const [newItem, setNewItem] = useState({
    name: "",
    brand: "",
    quantity: "",
    unitPrice: "",
    purchaseDate: new Date().toISOString().split('T')[0]
  });

  // --- CARREGAMENTO DO SDK DO SUPABASE E JSPDF ---
  useEffect(() => {
    const scriptSupabase = document.createElement('script');
    scriptSupabase.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    scriptSupabase.async = true;
    scriptSupabase.onload = () => {
      if (window.supabase) {
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        setSupabase(client);
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
    if (supabase) fetchData();
  }, [supabase]);

  const fetchData = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data: vData, error: vError } = await supabase
        .from('autoprime_vehicles')
        .select('*')
        .order('created_at', { ascending: false });
      
      const { data: iData, error: iError } = await supabase
        .from('autoprime_inventory')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: fData, error: fError } = await supabase
        .from('autoprime_fixed_costs')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .maybeSingle(); 

      const { data: pData, error: pError } = await supabase
        .from('autoprime_profile')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .maybeSingle();

      if (!vError) setVehicles(vData || []);
      if (!iError) setInventory(iData || []);
      if (!fError && fData) {
        setFixedCosts({
          aluguel: Number(fData.aluguel) || 0,
          material: Number(fData.material) || 0,
          funcionario: Number(fData.funcionario) || 0,
          agua: Number(fData.agua) || 0,
          luz: Number(fData.luz) || 0,
          internet: Number(fData.internet) || 0
        });
      }
      if (!pError && pData) {
        setProfile(pData);
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- CÁLCULOS E MEMOIZAÇÕES ---

  const activeVehicles = useMemo(() => vehicles.filter(v => v.status === 'active'), [vehicles]);
  const historyVehicles = useMemo(() => vehicles.filter(v => v.status === 'done'), [vehicles]);
  
  const finance = useMemo(() => {
    const totalRevenue = vehicles.reduce((acc, v) => acc + (Number(v.price) || 0), 0);
    const totalExpenses = Object.values(fixedCosts).reduce((acc, val) => acc + (Number(val) || 0), 0);
    const profit = totalRevenue - totalExpenses;
    return { 
      totalRevenue, 
      totalExpenses, 
      profit, 
      ...fixedCosts 
    };
  }, [vehicles, fixedCosts]);

  const dashboardStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const budgetPendings = activeVehicles.filter(v => v.work_status === 'Aguardando Aprovação').length;
    const waitingStart = activeVehicles.filter(v => v.work_status === 'Cadastrado').length;
    const inWorkCount = activeVehicles.filter(v => v.work_status === 'In Work').length;
    
    const doneThisMonth = historyVehicles.filter(v => {
      const d = new Date(v.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    return {
      orcamentos: budgetPendings,
      cadastrados: waitingStart,
      emTrabalho: inWorkCount,
      concluidosMes: doneThisMonth.length,
      concluidosMesList: doneThisMonth
    };
  }, [activeVehicles, historyVehicles]);

  const filteredDashboardVehicles = useMemo(() => {
    if (dashboardFilter === 'budgets') return activeVehicles.filter(v => v.work_status === 'Aguardando Aprovação');
    if (dashboardFilter === 'registered') return activeVehicles.filter(v => v.work_status === 'Cadastrado');
    if (dashboardFilter === 'in_work') return activeVehicles.filter(v => v.work_status === 'In Work');
    if (dashboardFilter === 'done_month') return dashboardStats.concluidosMesList;
    return activeVehicles;
  }, [dashboardFilter, activeVehicles, dashboardStats]);

  const polishingList = useMemo(() => {
    return vehicles
      .filter(v => v.polishing_date)
      .sort((a, b) => new Date(a.polishing_date) - new Date(b.polishing_date));
  }, [vehicles]);

  const capacity = 10;
  const allBoxes = useMemo(() => Array.from({ length: capacity }, (_, i) => `Box ${String(i + 1).padStart(2, '0')}`), []);
  const availableBoxes = useMemo(() => {
    const occupied = activeVehicles.map(v => v.location);
    return allBoxes.filter(box => !occupied.includes(box));
  }, [activeVehicles, allBoxes]);

  // --- FUNÇÕES DE LÓGICA ---

  const generateBudgetPDF = (vehicle) => {
    if (!window.jspdf) {
      showNotification("Aguarde o carregamento do gerador de PDF...", "danger");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(39, 39, 42); 
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(profile.workshop_name || "AUTOPRIME", 15, 20);
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`CNPJ: ${profile.cnpj || "-"}`, 15, 27);
    doc.text(`Endereço: ${profile.address || "-"}`, 15, 32);
    doc.text(`Contato: ${profile.phone || "-"} | ${profile.email || "-"}`, 15, 37);
    
    doc.setFontSize(14);
    doc.text("ORÇAMENTO #"+vehicle.id.substring(0,6).toUpperCase(), 140, 25);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DADOS DO CLIENTE", 15, 55);
    doc.line(15, 57, 195, 57);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Cliente: ${vehicle.customer_name}`, 15, 65);
    doc.text(`Telefone: ${vehicle.phone}`, 15, 72);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 140, 65);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("DADOS DO VEÍCULO", 15, 85);
    doc.line(15, 87, 195, 87);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Marca/Modelo: ${vehicle.brand} ${vehicle.model}`, 15, 95);
    doc.text(`Placa: ${vehicle.license_plate}`, 15, 102);
    doc.text(`Cor: ${vehicle.color}`, 140, 95);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("DESCRIÇÃO DOS SERVIÇOS", 15, 115);
    doc.line(15, 117, 195, 117);
    const splitDescription = doc.splitTextToSize(vehicle.service_description || "Nenhum serviço descrito.", 180);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(splitDescription, 15, 125);
    
    const tableY = 145;
    const autoTableOptions = {
        startY: tableY,
        head: [['Descritivo', 'Total']],
        body: [['Mão de obra e Materiais', `R$ ${Number(vehicle.price).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`]],
        theme: 'striped',
        headStyles: { fillColor: [234, 88, 12] },
    };
    if (typeof doc.autoTable === 'function') {
        doc.autoTable(autoTableOptions);
    } else if (window.autoTable) {
        window.autoTable(doc, autoTableOptions);
    }
    
    const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : tableY + 20) + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`VALOR TOTAL: R$ ${Number(vehicle.price).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 120, finalY + 10);
    
    doc.setFontSize(8);
    doc.text("__________________________________", 35, finalY + 50);
    doc.text(profile.workshop_name || "AUTOPRIME", 55, finalY + 55);
    doc.text("__________________________________", 125, finalY + 50);
    doc.text("CLIENTE", 145, finalY + 55);
    
    doc.save(`Orcamento_${vehicle.license_plate}_${vehicle.customer_name.replace(/\s+/g, '_')}.pdf`);
  };

  const updateWorkStatus = async (id, newWorkStatus) => {
    if (!supabase) return;
    const isDone = newWorkStatus === 'Concluído';
    const polishingDate = isDone ? calculateNextBusinessDay(new Date(), 30) : null;
    const fullUpdate = { 
      work_status: newWorkStatus,
      status: isDone ? 'done' : 'active',
      polishing_date: polishingDate
    };
    try {
      setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...fullUpdate } : v));
      if (viewingVehicle?.id === id) setViewingVehicle(prev => ({ ...prev, ...fullUpdate }));
      await supabase.from('autoprime_vehicles').update(fullUpdate).eq('id', id);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteVehicle = async (id) => {
    if (!supabase) return;
    const { error } = await supabase.from('autoprime_vehicles').delete().eq('id', id);
    if (!error) setVehicles(prev => prev.filter(i => i.id !== id));
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    if (activeVehicles.length >= capacity) {
      showNotification("Oficina lotada!", "danger");
      return;
    }
    const vehicleData = {
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
      service_description: newVehicle.serviceDescription,
      status: 'active',
      work_status: newVehicle.workStatus,
      price: Number(newVehicle.price),
      cost: Number(newVehicle.cost),
      tenant_id: TENANT_ID,
      photos: newVehicle.photos 
    };
    const { data, error } = await supabase.from('autoprime_vehicles').insert([vehicleData]).select();
    if (!error) {
      setVehicles(prev => [data[0], ...prev]);
      setIsModalOpen(false);
      setNewVehicle({ 
        customerName: "", phone: "", brand: "", model: "", licensePlate: "", type: "Normal", 
        color: "", location: "", professional: "", price: "", cost: "", 
        workStatus: "Aguardando Aprovação", serviceDescription: "", photos: {}
      });
      showNotification("Veículo registrado com sucesso!");
    }
  };

  const saveFixedCosts = async () => {
    if (!supabase) return;
    const costsToSave = {
      aluguel: Number(fixedCosts.aluguel) || 0,
      material: Number(fixedCosts.material) || 0,
      funcionario: Number(fixedCosts.funcionario) || 0,
      agua: Number(fixedCosts.agua) || 0,
      luz: Number(fixedCosts.luz) || 0,
      internet: Number(fixedCosts.internet) || 0
    };
    try {
      const { error } = await supabase.from('autoprime_fixed_costs').upsert({
          tenant_id: TENANT_ID,
          ...costsToSave
        }, { onConflict: 'tenant_id' });
      if (!error) {
        showNotification("Perfil financeiro salvo!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveProfile = async () => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('autoprime_profile')
        .upsert({
          tenant_id: TENANT_ID,
          ...profile
        }, { onConflict: 'tenant_id' });
      
      if (!error) {
        showNotification("Dados da oficina salvos com sucesso!", "success");
      } else {
        showNotification("Erro ao salvar dados no banco.", "danger");
      }
    } catch (err) {
      console.error(err);
      showNotification("Erro de conexão.", "danger");
    }
  };

  const calculateNextBusinessDay = (startDate, daysToAdd) => {
    const targetDate = new Date(startDate);
    targetDate.setDate(targetDate.getDate() + daysToAdd);
    const dayOfWeek = targetDate.getDay();
    if (dayOfWeek === 0) targetDate.setDate(targetDate.getDate() + 1);
    else if (dayOfWeek === 6) targetDate.setDate(targetDate.getDate() + 2);
    return targetDate.toISOString();
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

  // --- RENDERS ---

  const renderProfile = () => (
    <div className="p-6 space-y-8 animate-in slide-in-from-right-5 duration-500 max-w-4xl">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Meus Dados</h2>
        <p className="text-zinc-500 text-sm italic">Informações oficiais da sua oficina para orçamentos e recibos.</p>
      </div>

      <Card className="p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <Building2 className="text-orange-500" size={20}/>
          <h3 className="text-xl font-black text-white uppercase italic">Dados da Oficina</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Nome da Funilaria / Estética" 
            placeholder="Ex: AutoPrime Solutions" 
            value={profile.workshop_name} 
            onChange={(e) => setProfile({...profile, workshop_name: e.target.value})} 
          />
          <Input 
            label="CNPJ" 
            placeholder="Ex: 00.000.000/0000-00" 
            value={profile.cnpj} 
            onChange={(e) => setProfile({...profile, cnpj: e.target.value})} 
          />
          <Input 
            label="Nome do Dono / Responsável" 
            placeholder="Ex: João Silva" 
            value={profile.owner_name} 
            onChange={(e) => setProfile({...profile, owner_name: e.target.value})} 
          />
          <Input 
            label="Telefone Comercial" 
            placeholder="Ex: (11) 99999-9999" 
            value={profile.phone} 
            onChange={(e) => setProfile({...profile, phone: e.target.value})} 
          />
          <div className="md:col-span-2">
            <Input 
              label="Endereço Completo" 
              placeholder="Ex: Rua das Flores, 123 - Centro, São Paulo - SP" 
              value={profile.address} 
              onChange={(e) => setProfile({...profile, address: e.target.value})} 
            />
          </div>
          <div className="md:col-span-2">
            <Input 
              label="E-mail de Contato" 
              placeholder="Ex: contato@autoprime.com" 
              value={profile.email} 
              onChange={(e) => setProfile({...profile, email: e.target.value})} 
            />
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-800 flex justify-end">
          <Button onClick={saveProfile} className="px-12 flex items-center gap-2">
            <Save size={18}/> Salvar Dados
          </Button>
        </div>
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
          { id: 'done_month', label: 'Concluídos (Mês)', val: dashboardStats.concluidosMes, color: 'border-l-emerald-600', icon: CheckCircle2, iconColor: 'text-emerald-600', bg: 'bg-emerald-600/10' },
        ].map(st => (
          <Card key={st.id} onClick={() => setDashboardFilter(st.id)} className={`p-4 flex items-center gap-3 border-l-4 transition-all ${dashboardFilter === st.id ? `${st.color} bg-zinc-800` : 'border-l-zinc-800 opacity-60'}`}>
            <div className={`p-2 ${st.bg} rounded-xl ${st.iconColor}`}><st.icon size={24} /></div>
            <div>
              <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest leading-none mb-1">{st.label}</p>
              <h3 className="text-xl font-black text-white">{st.val}</h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-black text-white tracking-tight uppercase italic flex items-center gap-2">
          {dashboardFilter === 'budgets' && <ClipboardList size={24} className="text-zinc-500" />}
          {dashboardFilter === 'budgets' ? 'Orçamentos Pendentes' : dashboardFilter === 'registered' ? 'Veículos Cadastrados' : dashboardFilter === 'in_work' ? 'Em Execução' : 'Pátio Ativo'}
        </h2>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2"><Plus size={18} /> Novo Entrada</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDashboardVehicles.map(v => (
          <Card key={v.id} className={`p-5 flex flex-col gap-4 relative border-t-4 ${v.work_status === 'Aguardando Aprovação' ? 'border-t-zinc-600' : v.work_status === 'In Work' ? 'border-t-orange-600' : v.status === 'done' ? 'border-t-emerald-600' : 'border-t-zinc-700'}`} onClick={() => setViewingVehicle(v)}>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xl font-black text-white uppercase italic">{v.brand} {v.model}</h4>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{v.license_plate} • {v.color}</p>
              </div>
              <div className="text-right">
                 <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase border ${v.work_status === 'Aguardando Aprovação' ? 'bg-zinc-800 text-zinc-400 border-zinc-700' : 'bg-orange-600/10 text-orange-600 border-orange-600/20'}`}>{v.work_status}</span>
                 <p className="text-[10px] text-zinc-500 font-black uppercase mt-1">{v.entry_time.split(',')[0]}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm bg-black/20 p-4 rounded-2xl">
              <div><p className="text-[10px] text-zinc-500 font-black uppercase">Dono</p><p className="text-white font-bold flex items-center gap-1.5"><User size={12}/> {v.customer_name}</p></div>
              <div><p className="text-[10px] text-zinc-500 font-black uppercase">Local</p><p className="text-white font-bold flex items-center gap-1.5"><Wrench size={12}/> {v.location}</p></div>
            </div>

            <div className="bg-zinc-800/50 p-3 rounded-xl border border-white/5">
                <p className="text-[9px] text-zinc-500 font-black uppercase mb-1 flex items-center gap-1.5">
                    <MessageSquare size={10} className="text-orange-500"/> Serviço / Comentários
                </p>
                <p className="text-zinc-200 text-xs italic line-clamp-2">
                    {v.service_description ? `"${v.service_description}"` : "Sem descrição detalhada."}
                </p>
            </div>

            {v.status === 'active' && (
              <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                  <div className="flex-1 flex gap-1 bg-zinc-800 p-1 rounded-xl overflow-x-auto no-scrollbar">
                      {['Aguardando Aprovação', 'Cadastrado', 'In Work', 'Concluído'].map(st => (
                          <button key={st} onClick={() => updateWorkStatus(v.id, st)} className={`whitespace-nowrap px-3 py-2 rounded-lg text-[8px] font-black uppercase transition-all ${v.work_status === st ? 'bg-orange-600 text-black' : 'text-zinc-500 hover:text-white'}`}>{st === 'Aguardando Aprovação' ? 'Aguardando' : st}</button>
                      ))}
                  </div>
                  <Button variant="danger" onClick={() => deleteVehicle(v.id)} className="px-3"><Trash2 size={16}/></Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="p-6 space-y-6 animate-in slide-in-from-bottom-5">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Estoque de Materiais</h2>
        <Button onClick={() => setIsInventoryModalOpen(true)} className="flex items-center gap-2"><Plus size={18}/> Novo Item</Button>
      </div>
      <Card className="overflow-hidden border-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-800 text-zinc-400 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Marca</th>
                <th className="px-6 py-4">Qtd</th>
                <th className="px-6 py-4">Preço Un.</th>
                <th className="px-6 py-4">Total Gasto</th>
                <th className="px-6 py-4">Data Compra</th>
                <th className="px-6 py-4">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {inventory.map(item => (
                <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-white uppercase italic">{item.name}</td>
                  <td className="px-6 py-4 text-zinc-400 uppercase text-xs font-bold">{item.brand || '-'}</td>
                  <td className="px-6 py-4 text-zinc-300">{item.quantity} un</td>
                  <td className="px-6 py-4 text-zinc-300">R$ {Number(item.unit_price || item.price || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-emerald-500 font-bold">R$ {Number(item.total_cost || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-zinc-500 text-xs">{item.purchase_date ? new Date(item.purchase_date).toLocaleDateString('pt-BR') : '-'}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => deleteInventoryItem(item.id)} className="text-zinc-600 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const deleteInventoryItem = async (id) => {
    if (!supabase) return;
    const { error } = await supabase.from('autoprime_inventory').delete().eq('id', id);
    if (!error) setInventory(prev => prev.filter(i => i.id !== id));
  };

  const renderFinance = () => (
    <div className="p-6 space-y-8 animate-in zoom-in-95 duration-300">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Painel Financeiro</h2>
        <p className="text-zinc-500 text-sm italic">Gestão de faturamento e custos fixos.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Faturamento Total', val: finance.totalRevenue, color: 'text-white', icon: DollarSign, bg: 'bg-zinc-800' },
          { label: 'Gastos Fixos', val: finance.totalExpenses, color: 'text-red-400', icon: TrendingUp, bg: 'bg-red-950/20' },
          { label: 'Lucro Líquido', val: finance.profit, color: 'text-emerald-400', icon: Wallet, bg: 'bg-emerald-950/20' },
        ].map(item => (
          <Card key={item.label} className={`p-6 border-l-4 border-zinc-700 ${item.bg}`}>
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-[10px] text-zinc-500 font-black uppercase mb-1 tracking-widest">{item.label}</p>
                  <p className={`text-3xl font-black italic ${item.color}`}>R$ {Number(item.val).toLocaleString()}</p>
               </div>
               <div className={`p-2 rounded-lg ${item.color} bg-white/5`}><item.icon size={20}/></div>
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <TrendingUp className="text-orange-500" size={20}/>
              <h3 className="text-xl font-black text-white uppercase italic">Gestão de Custos Fixos</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <Input label="Aluguel Mensal" type="number" value={fixedCosts.aluguel} onChange={(e) => setFixedCosts({...fixedCosts, aluguel: e.target.value})} />
              <Input label="Material" type="number" value={fixedCosts.material} onChange={(e) => setFixedCosts({...fixedCosts, material: e.target.value})} />
            </div>
            <div className="space-y-4">
              <Input label="Funcionário" type="number" value={fixedCosts.funcionario} onChange={(e) => setFixedCosts({...fixedCosts, funcionario: e.target.value})} />
              <div className="flex gap-4">
                <Input label="Água" type="number" value={fixedCosts.agua} onChange={(e) => setFixedCosts({...fixedCosts, agua: e.target.value})} />
                <Input label="Luz" type="number" value={fixedCosts.luz} onChange={(e) => setFixedCosts({...fixedCosts, luz: e.target.value})} />
              </div>
            </div>
            <div className="space-y-4">
              <Input label="Internet" type="number" value={fixedCosts.internet} onChange={(e) => setFixedCosts({...fixedCosts, internet: e.target.value})} />
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-between">
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest italic">Valores salvos no banco de dados.</p>
              <Button onClick={saveFixedCosts} variant="primary" className="px-8">Salvar Perfil Financeiro</Button>
          </div>
      </Card>
    </div>
  );

  const renderPolishingSchedule = () => (
    <div className="p-6 space-y-6 animate-in fade-in">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
            <Sparkles className="text-orange-500" /> Agenda de polimento
        </h2>
        <p className="text-zinc-500 text-sm italic">Próximos polimentos agendados para 30 dias após conclusão.</p>
      </div>
      <Card className="overflow-hidden border-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-800/50 text-zinc-400 text-[10px] uppercase font-black tracking-widest border-b border-zinc-800">
              <tr>
                <th className="px-6 py-5">Cliente</th>
                <th className="px-6 py-5">Veículo</th>
                <th className="px-6 py-5 text-orange-500">Data de Polimento</th>
                <th className="px-6 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {polishingList.map((v, idx) => {
                const polishDate = new Date(v.polishing_date);
                const isValidDate = !isNaN(polishDate.getTime());
                const isOverdue = isValidDate && polishDate < new Date();
                return (
                  <tr key={idx} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white font-bold uppercase italic">{v.customer_name}</span>
                        <span className="text-zinc-500 text-xs">{v.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="text-white font-bold text-xs">{v.brand} {v.model}</span>
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">{v.license_plate}</p>
                    </td>
                    <td className="px-6 py-4 italic font-black text-orange-500">
                        <Calendar size={14} className="inline mr-2"/> {isValidDate ? polishDate.toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-6 py-4">
                        <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-tighter border ${isOverdue ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                            {isOverdue ? 'Atrasado' : 'Agendado'}
                        </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderCustomers = () => (
    <div className="p-6 space-y-6">
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">CRM & Marketing</h2>
        <Card className="overflow-hidden border-zinc-800">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-800/50 text-zinc-400 text-[10px] uppercase font-black tracking-widest border-b border-zinc-800">
                        <tr><th className="px-6 py-5">Cliente</th><th className="px-6 py-5">Veículo</th><th className="px-6 py-5">Orçamento</th><th className="px-6 py-5">Entrada</th></tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                        {vehicles.map((v, idx) => (
                            <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                                <td className="px-6 py-4 flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-orange-500"><User size={14} /></div><span className="text-white font-bold uppercase italic">{v.customer_name}</span></td>
                                <td className="px-6 py-4 font-bold text-xs">{v.brand} {v.model} ({v.license_plate})</td>
                                <td className="px-6 py-4 font-black text-emerald-500 italic">R$ {Number(v.price).toLocaleString()}</td>
                                <td className="px-6 py-4 text-zinc-500 text-[10px]">{v.entry_time.split(',')[0]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center flex-col gap-4 text-orange-500">
        <Loader2 className="animate-spin" size={48} />
        <p className="font-black uppercase tracking-widest italic animate-pulse text-xs">Sincronizando AutoPrime Cloud...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans flex flex-col md:flex-row relative">
      
      {/* Sistema de Notificações Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-[500] flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl animate-in slide-in-from-top-10 duration-300 ${notification.type === 'success' ? 'bg-emerald-950/90 border-emerald-500 text-emerald-400' : 'bg-red-950/90 border-red-500 text-red-400'}`}>
          {notification.type === 'success' ? <Check size={20}/> : <AlertTriangle size={20}/>}
          <span className="font-bold uppercase text-xs tracking-widest">{notification.message}</span>
        </div>
      )}

      <aside className="hidden md:flex flex-col w-72 bg-zinc-950 border-r border-zinc-800 p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12">
            <div className="bg-orange-600 p-2 rounded-xl text-black rotate-12"><Paintbrush size={24} strokeWidth={3}/></div>
            <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Auto<br/><span className="text-orange-600">Prime</span></h1>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          {[
            { id: 'dashboard', label: 'Painel de controle', icon: LayoutDashboard },
            { id: 'history', label: 'Histórico', icon: History },
            { id: 'polishing', label: 'Agenda de polimento', icon: Sparkles },
            { id: 'inventory', label: 'Estoque', icon: Package },
            { id: 'finance', label: 'Financeiro', icon: DollarSign },
            { id: 'customers', label: 'Clientes', icon: Users },
            { id: 'profile', label: 'Meus dados', icon: User },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all ${activeTab === item.id ? 'bg-orange-600 text-black italic' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}>
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 min-h-screen overflow-y-auto pb-24 md:pb-0">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'inventory' && renderInventory()}
        {activeTab === 'finance' && renderFinance()}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'customers' && renderCustomers()}
        {activeTab === 'polishing' && renderPolishingSchedule()}
        {activeTab === 'history' && (
           <div className="p-6 space-y-6">
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Histórico de Pinturas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {historyVehicles.map(v => (
                    <Card key={v.id} onClick={() => setViewingVehicle(v)} className="p-6 opacity-60 hover:opacity-100 transition-all">
                        <div className="flex justify-between items-center"><h4 className="font-black text-white uppercase italic">{v.brand} {v.model}</h4><CheckCircle2 className="text-emerald-500" size={16}/></div>
                        <p className="text-xs text-zinc-500 mt-1 uppercase font-bold">{v.customer_name} • {v.license_plate} • {v.entry_time}</p>
                        <div className="flex justify-end mt-4 pt-4 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
                           <button onClick={() => updateWorkStatus(v.id, 'In Work')} className="flex items-center gap-2 text-orange-500 text-[10px] font-black uppercase hover:bg-orange-500/10 px-3 py-1.5 rounded-lg transition-all"><RotateCcw size={12} /> Reativar</button>
                        </div>
                    </Card>
                 ))}
              </div>
           </div>
        )}
      </main>

      {viewingVehicle && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[150] flex items-center justify-center p-4">
           <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-0 relative overflow-hidden flex flex-col">
              <div className="bg-orange-600 p-8 flex justify-between items-start">
                  <div>
                    <h2 className="text-4xl font-black text-black italic uppercase leading-none">{viewingVehicle.brand} {viewingVehicle.model}</h2>
                    <div className="mt-4 flex gap-3">
                        <div className="bg-black text-white px-4 py-1 rounded-lg border-2 border-zinc-800 flex items-center gap-2"><Hash size={14} className="text-orange-500" /><span className="font-black uppercase text-sm">{viewingVehicle.license_plate}</span></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" className="bg-black/20 border-black/10 text-black hover:bg-black hover:text-white" onClick={() => generateBudgetPDF(viewingVehicle)}><Download size={18} className="mr-2" /> Gerar Orçamento PDF</Button>
                    <button onClick={() => setViewingVehicle(null)} className="text-black bg-white/10 p-2 rounded-full hover:bg-white/20"><X size={24}/></button>
                  </div>
              </div>
              <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-6">
                        {[
                          { l: 'Dono', v: viewingVehicle.customer_name, i: User },
                          { l: 'Contato', v: viewingVehicle.phone, i: Phone },
                          { l: 'Local', v: viewingVehicle.location, i: Wrench },
                          { l: 'Profissional', v: viewingVehicle.professional, i: Users },
                          { l: 'Cor', v: viewingVehicle.color, i: Paintbrush },
                          { l: 'Entrada', v: viewingVehicle.entry_time, i: Clock }
                        ].map(it => (
                          <div key={it.l}><p className="text-zinc-500 uppercase font-black text-[10px] mb-1">{it.l}</p><p className="text-white font-bold flex items-center gap-2"><it.i size={16} className="text-orange-500"/> {it.v}</p></div>
                        ))}
                      </div>
                      <div className="p-6 bg-black/40 rounded-2xl border border-white/5">
                        <p className="text-zinc-500 uppercase font-black text-[10px] mb-2 tracking-widest">Serviço</p>
                        <p className="text-zinc-200 italic mb-4">"{viewingVehicle.service_description}"</p>
                        <div className="pt-4 border-t border-white/5 grid grid-cols-3 gap-4">
                            <div><p className="text-zinc-500 text-[10px] font-black uppercase">Orçamento</p><p className="text-white font-black text-xl">R$ {Number(viewingVehicle.price).toLocaleString()}</p></div>
                            <div><p className="text-zinc-500 text-[10px] font-black uppercase">Custo</p><p className="text-red-400 font-black text-xl">R$ {Number(viewingVehicle.cost).toLocaleString()}</p></div>
                            <div><p className="text-zinc-500 text-[10px] font-black uppercase">Lucro</p><p className="text-emerald-500 font-black text-xl">R$ {(viewingVehicle.price - viewingVehicle.cost).toLocaleString()}</p></div>
                        </div>
                      </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Fotos Check-list</p>
                    <div className="grid grid-cols-2 gap-3">
                       {['Frente', 'Trás', 'Lado D', 'Lado E', 'Teto'].map((pos, idx) => (
                           <div key={pos} className={`bg-zinc-800 rounded-2xl overflow-hidden relative border border-white/5 ${idx === 0 ? 'col-span-2 aspect-video' : 'aspect-square'}`}>
                               {viewingVehicle.photos?.[pos] ? <img src={viewingVehicle.photos[pos]} alt={pos} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-2"><Camera size={24} /><span className="text-[8px] font-black uppercase">Sem foto</span></div>}
                               <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] uppercase font-black text-white">{pos}</div>
                           </div>
                       ))}
                    </div>
                  </div>
              </div>
           </Card>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl p-8 relative space-y-8 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white bg-zinc-800 hover:bg-zinc-700 p-2 rounded-full transition-all"><X size={20}/></button>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Entrada de Veículo</h2>
            <form onSubmit={handleAddVehicle} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Dono" value={newVehicle.customerName} onChange={e => setNewVehicle({...newVehicle, customerName: e.target.value})} placeholder="Ex: João Silva" required />
                <Input label="Telefone" value={newVehicle.phone} onChange={e => setNewVehicle({...newVehicle, phone: e.target.value})} placeholder="Ex: (11) 99999-9999" required />
                <Input label="Marca" value={newVehicle.brand} onChange={e => setNewVehicle({...newVehicle, brand: e.target.value})} placeholder="Ex: Volkswagen" required />
                <Input label="Modelo" value={newVehicle.model} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})} placeholder="Ex: Golf GTI" required />
                <Input label="Placa" value={newVehicle.licensePlate} onChange={e => setNewVehicle({...newVehicle, licensePlate: e.target.value.toUpperCase()})} placeholder="Ex: ABC-1234" required />
                <Input label="Orçamento" type="number" value={newVehicle.price} onChange={e => setNewVehicle({...newVehicle, price: e.target.value})} placeholder="Ex: 1500" required />
                <Input label="Custo Material" type="number" value={newVehicle.cost} onChange={e => setNewVehicle({...newVehicle, cost: e.target.value})} placeholder="Ex: 450" required />
                <Input label="Profissional" value={newVehicle.professional} onChange={e => setNewVehicle({...newVehicle, professional: e.target.value})} placeholder="Ex: Ricardo Silva" required />
                <div className="flex flex-col gap-1.5"><label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Status Inicial</label><select className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-orange-600 appearance-none cursor-pointer" value={newVehicle.workStatus} onChange={e => setNewVehicle({...newVehicle, workStatus: e.target.value})} required><option value="Aguardando Aprovação">Orçamento (Aguardando Aprovação)</option><option value="Cadastrado">Confirmado (Pátio)</option></select></div>
                <Input label="Cor" value={newVehicle.color} onChange={e => setNewVehicle({...newVehicle, color: e.target.value})} placeholder="Ex: Cinza Nardo" required />
              </div>
              <Input label="Descrição do Serviço" placeholder="Ex: Pintura capô e para-choque..." value={newVehicle.serviceDescription} onChange={e => setNewVehicle({...newVehicle, serviceDescription: e.target.value})} required />
              <div className="grid grid-cols-5 gap-2">
                  {['Lado D', 'Lado E', 'Frente', 'Trás', 'Teto'].map(pos => (
                    <div key={pos} onClick={() => document.getElementById(`photo-${pos}`).click()} className="aspect-square bg-zinc-800 rounded-xl border border-zinc-700 border-dashed flex flex-col items-center justify-center text-zinc-600 cursor-pointer overflow-hidden relative">
                      {newVehicle.photos[pos] ? <img src={newVehicle.photos[pos]} className="w-full h-full object-cover" /> : <><Camera size={20} /><span className="text-[8px] font-black">{pos}</span></>}
                      <input type="file" id={`photo-${pos}`} className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(pos, e)} />
                    </div>
                  ))}
              </div>
              <div className="flex gap-3"><Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">Cancelar</Button><Button type="submit" className="flex-1">Registrar</Button></div>
            </form>
          </Card>
        </div>
      )}

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
                <div className="md:col-span-2"><Input label="Data da Compra" type="date" value={newItem.purchaseDate} onChange={e => setNewItem({...newItem, purchaseDate: e.target.value})} required /></div>
              </div>
              <div className="p-4 bg-emerald-600/10 border border-emerald-600/20 rounded-xl flex justify-between items-center"><span className="text-[10px] font-black uppercase text-emerald-500">Total Gasto Estimado</span><span className="text-xl font-black text-white">R$ {(Number(newItem.quantity || 0) * Number(newItem.unitPrice || 0)).toLocaleString()}</span></div>
              <div className="flex gap-3 pt-4"><Button variant="secondary" onClick={() => setIsInventoryModalOpen(false)} className="flex-1">Cancelar</Button><Button type="submit" className="flex-1">Cadastrar Material</Button></div>
            </form>
          </Card>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `body { background: black; font-family: 'Inter', sans-serif; } .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />
    </div>
  );
}