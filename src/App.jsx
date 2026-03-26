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
  Gauge,
  Instagram,
  HelpCircle
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
  const [crmData, setCrmData] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [inventoryLog, setInventoryLog] = useState([]); 
  const [dashboardFilter, setDashboardFilter] = useState('all');
  const [loginForm, setLoginForm] = useState({ email: "", password: "", confirmPassword: "", workshopName: "", cpf: "", fullName: "", address: "" });
  const [loginError, setLoginError] = useState("");
  const [authView, setAuthView] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const [inventorySearch, setInventorySearch] = useState("");

  // Estado para o carrossel de marketing
  const [marketingSlide, setMarketingSlide] = useState(0);
  const marketingContent = useMemo(() => [
    {
      img: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200",
      title: "A Revolução da",
      highlight: "Gestão Automotiva.",
      desc: "A plataforma definitiva para controlo de estética, pintura e cuidados profissionais do seu negócio.",
      features: [
        { icon: Layers, title: "Interface Inteligente", desc: "Design focado na agilidade do dia a dia." },
        { icon: Activity, title: "Métricas de Sucesso", desc: "Visão clara do desempenho da oficina." },
        { icon: Lock, title: "Segurança Total", desc: "Dados protegidos em servidores dedicados." }
      ]
    },
    {
      img: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=1200",
      title: "Controle Total na",
      highlight: "Palma da Mão.",
      desc: "Acompanhe orçamentos, veículos em produção e lucros em tempo real, de onde estiver.",
      features: [
        { icon: LayoutDashboard, title: "Controlo em Tempo Real", desc: "Acompanhe veículos e orçamentos numa tela." },
        { icon: MessageCircle, title: "Experiência via WhatsApp", desc: "Envie links mágicos com o status ao vivo." },
        { icon: Package, title: "Estoque & Custos Integrados", desc: "Debite materiais e calcule lucros na hora." }
      ]
    },
    {
      img: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=1200",
      title: "Experiência Premium",
      highlight: "Para o Cliente.",
      desc: "Envie links de status pelo WhatsApp e fidelize clientes com um serviço de excelência.",
      features: [
        { icon: User, title: "Fidelização Garantida", desc: "Transparência total para o seu cliente." },
        { icon: FileText, title: "Orçamentos Profissionais", desc: "Gere PDFs detalhados com 1 clique." },
        { icon: Sparkles, title: "Padrão de Qualidade", desc: "Eleve a percepção de valor do seu negócio." }
      ]
    }
  ], []);

  useEffect(() => {
    if (!isAuthenticated) {
      const interval = setInterval(() => setMarketingSlide(prev => (prev + 1) % marketingContent.length), 4000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, marketingContent.length]);

  const [profile, setProfile] = useState({
    workshop_name: "", cnpj: "", owner_name: "", address: "", phone: "", email: "", instagram: "",
    subscription_status: "Ativo", subscription_expires_at: null, stripe_customer_id: null
  });

  const [appSettings, setAppSettings] = useState({
    showPolishing: true,
    showInventory: true,
    showFinance: true
  });

  const [serviceOptions, setServiceOptions] = useState([
    "Pintura completa", "Capô", "Porta Esquerda", "Porta Direita", "Teto", 
    "Traseira", "Para-choque (Traseiro)", "Para-choque (Dianteiro)"
  ]);

  const [fixedCosts, setFixedCosts] = useState({
    aluguel: 0, material: 0, funcionario: 0, agua: 0, luz: 0, internet: 0
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  
  const [newVehicle, setNewVehicle] = useState({
    customerName: "", phone: "", brand: "", model: "", licensePlate: "", type: "Sedan", 
    color: "", location: "BOX 01", professional: "", price: "", cost: "", workStatus: "Aguardando Aprovação",
    selectedServices: [], customPieceText: "", customServicesList: [], photos: {} 
  });

  const [budgetForm, setBudgetForm] = useState({
    customer_name: "", phone: "", brand: "", model: "", license_plate: "", color: "", services: [{ description: "", price: "" }]
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
    const appName = "AutoPrime";
    document.title = appName;
    
    // 2. Criar Ícone SVG Personalizado (Quadrado borda laranja, A branco e P laranja)
    const iconSvg = `
      <svg width="192" height="192" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="8" width="176" height="176" rx="36" fill="#09090B" stroke="#EA580C" stroke-width="16"/>
        <text x="92" y="130" font-family="sans-serif" font-weight="900" font-style="italic" font-size="90" text-anchor="middle">
          <tspan fill="#FFFFFF">A</tspan><tspan fill="#EA580C">P</tspan>
        </text>
      </svg>
    `.trim();

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

    // 4. Converter SVG para PNG via Canvas para compatibilidade Mobile (iOS/Android)
    // Sistemas móveis (especialmente iOS) ignoram SVGs para ícones de atalho. É necessário PNG.
    const canvas = document.createElement('canvas');
    canvas.width = 192;
    canvas.height = 192;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL('image/png');
      
      // Forçar a remoção de favicons antigos (Remove o símbolo da Vercel/Vite)
      document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]').forEach(el => el.remove());
      
      const setIcon = (rel, href, sizes = null) => {
        const link = document.createElement('link');
        link.rel = rel;
        link.href = href;
        if (sizes) link.setAttribute('sizes', sizes);
        document.head.appendChild(link);
      };

      setIcon('icon', pngUrl, '192x192');
      setIcon('shortcut icon', pngUrl);
      setIcon('apple-touch-icon', pngUrl, '192x192');

      // 5. Gerar Manifest dinâmico para Android (Garante o funcionamento do "Adicionar à Tela Principal")
      const manifest = {
         name: "AutoPrime",
         short_name: "AutoPrime",
         start_url: window.location.pathname,
         display: "standalone",
         background_color: "#000000",
         theme_color: "#EA580C",
         icons: [{ src: pngUrl, sizes: "192x192", type: "image/png", purpose: "any maskable" }]
      };
      const manifestBlob = new Blob([JSON.stringify(manifest)], {type: 'application/manifest+json'});
      setIcon('manifest', URL.createObjectURL(manifestBlob));
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(iconSvg);
  }, []);

  useEffect(() => {
    const loadScript = (src) => new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

    const initApp = async () => {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
        const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        setSupabase(sb);

        const savedAuth = localStorage.getItem('autoprime_session_active');
        const savedTenant = localStorage.getItem('autoprime_tenant_id');
        if (savedAuth === 'true' && savedTenant) {
          setCurrentTenantId(savedTenant);
          setIsAuthenticated(true);
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

  // SINCRONIZAÇÃO MÁGICA EM TEMPO REAL: Escuta veículos e pagamentos da Stripe
  useEffect(() => {
    if (!supabase || !currentTenantId) return;

    const globalChannel = supabase
      .channel('realtime-autoprime-data')
      // Escuta novos veículos (como já tínhamos)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'autoprime_vehicles' }, () => {
          console.log("Novo veículo! Atualizando tela...");
          fetchData();
      })
      // Escuta mudanças no Perfil (Pagamentos da Stripe entrando no banco)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'autoprime_profile', filter: `tenant_id=eq.${currentTenantId}` }, (payload) => {
          console.log("Status de Assinatura atualizado pela Stripe! Sincronizando tela...");
          // Recarrega os dados imediatamente. Se a Stripe enviou "Ativa", a tela desbloqueia na hora.
          fetchData(); 
      })
      .subscribe();

    return () => {
      supabase.removeChannel(globalChannel);
    };
  }, [supabase, currentTenantId]);

  useEffect(() => {
    if (supabase && isAuthenticated && currentTenantId) fetchData();
  }, [supabase, isAuthenticated, currentTenantId, activeTab]);

  const fetchData = async () => {
    if (!supabase || !currentTenantId) return;
    try {
      // 1. Busca imediata dos veículos (sem await para não bloquear a renderização da tela)
      supabase.from('autoprime_vehicles').select('*').eq('tenant_id', currentTenantId).order('created_at', { ascending: false })
        .then(({ data }) => setVehicles(data || []));

      // 2. Limpeza automática em background
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      supabase.from('autoprime_vehicles').delete().eq('status', 'done').lt('created_at', oneMonthAgo.toISOString()).then();

      // 3. Busca de todos os outros dados em paralelo (muito mais rápido que em cascata)
      const [
        { data: cData }, { data: iData }, { data: logData }, { data: fData }, { data: pData }
      ] = await Promise.all([
        supabase.from('autoprime_crm').select('*').eq('tenant_id', currentTenantId).order('last_entry', { ascending: false }),
        supabase.from('autoprime_inventory').select('*').eq('tenant_id', currentTenantId).order('created_at', { ascending: false }),
        supabase.from('autoprime_inventory_log').select('*').eq('tenant_id', currentTenantId).order('created_at', { ascending: false }),
        supabase.from('autoprime_fixed_costs').select('*').eq('tenant_id', currentTenantId).maybeSingle(),
        supabase.from('autoprime_profile').select('*').eq('tenant_id', currentTenantId).maybeSingle()
      ]);
      
      setCrmData(cData || []);
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
      // Forçar sincronização imediata do perfil e assinatura
      fetchData();
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

    const { data: existingCpf } = await supabase.from('autoprime_profile').select('id').eq('cnpj', loginForm.cpf).maybeSingle();
    if (existingCpf) {
      setLoginError("CPF/CNPJ já cadastrado em outra conta.");
      return;
    }

    // Criar o registro na tabela de administradores
    const { error: adminError } = await supabase.from('autoprime_admins').insert([{
      email: loginForm.email,
      password: loginForm.password,
      tenant_id: tenantId
    }]);

    if (!adminError) {
      // Criar o registro na tabela de perfil
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
      setLoginError("Erro ao cadastrar na tabela de administradores.");
      console.error(adminError);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (!supabase) return;

    if (!loginForm.password || loginForm.password !== loginForm.confirmPassword) {
      setLoginError("As senhas não coincidem ou estão vazias.");
      return;
    }

    // 1. Verificar segurança: E-mail e CPF/CNPJ devem coincidir no perfil
    const { data: profileData, error: profileError } = await supabase
      .from('autoprime_profile')
      .select('tenant_id')
      .eq('email', loginForm.email)
      .eq('cnpj', loginForm.cpf)
      .maybeSingle();

    if (profileError || !profileData) {
      setLoginError("Credenciais inválidas (E-mail ou CPF/CNPJ incorretos).");
      return;
    }

    // 2. Atualizar a senha
    const { error: updateError } = await supabase
      .from('autoprime_admins')
      .update({ password: loginForm.password })
      .eq('tenant_id', profileData.tenant_id);

    if (updateError) {
      setLoginError("Erro ao redefinir a senha no sistema.");
      return;
    }

    showNotification("Senha redefinida com sucesso!");
    setAuthView('login');
    setLoginForm({ ...loginForm, password: "", confirmPassword: "", cpf: "" });
  };

  const handleLogout = () => { setIsAuthenticated(false); localStorage.clear(); window.location.href = window.location.pathname; };

  const handleManageSubscription = async () => {
    if (!supabase) return;
    
    if (profile.stripe_customer_id) {
      try {
        showNotification("A redirecionar para o portal seguro...");
        const { data, error } = await supabase.functions.invoke('stripe_portal', {
          body: { stripe_customer_id: profile.stripe_customer_id }
        });
        
        if (!error && data?.url) {
          window.location.href = data.url;
          return;
        }
      } catch (err) {
        console.error("Erro ao chamar stripe_portal:", err);
      }
    }
    
    // Se a pessoa não tiver ID ainda (nova assinatura), redireciona para o link de pagamento da Stripe com os dados pré-preenchidos
    try {
      showNotification("A redirecionar para o pagamento seguro...");
      const userEmail = encodeURIComponent(profile.email || loginForm.email || "");
      // Redireciona para o link da Stripe enviando o e-mail e o ID da oficina para o Webhook reconhecer o pagamento
      const paymentLink = `https://buy.stripe.com/eVq14f39maOjaWlaHUgIo00?prefilled_email=${userEmail}&client_reference_id=${currentTenantId}`;
      window.location.href = paymentLink;
    } catch (err) {
      console.error("Erro ao redirecionar para pagamento:", err);
      showNotification("Erro ao abrir página de pagamentos.", "danger");
    }
  };

  const generateBudgetPDF = (vehicle) => {
    try {
      if (!window.jspdf) return;
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      const orange = [234, 88, 12];
      const dark = [24, 24, 27];
      const gray = [113, 113, 122];

      // 1. Cabeçalho Principal (Dados da Oficina)
      doc.setFillColor(...dark);
      doc.rect(0, 0, 210, 50, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(profile.workshop_name?.toUpperCase() || "AUTOPRIME", 15, 20);
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`NIF / CNPJ: ${profile.cnpj || '---'} | TEL: ${profile.phone || '---'}`, 15, 28);
      doc.text(`ENDEREÇO: ${profile.address || '---'}`, 15, 33);
      doc.text(`EMAIL: ${profile.email || '---'}`, 15, 38);
      doc.text(`INSTAGRAM: ${profile.instagram || '---'}`, 15, 43);

      // Título do Documento
      doc.setTextColor(...orange);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("ORÇAMENTO TÉCNICO DE SERVIÇOS", 195, 15, { align: "right" });
      doc.setTextColor(255, 255, 255);
      doc.text(`DATA: ${new Date().toLocaleDateString('pt-BR')}`, 195, 20, { align: "right" });

      // 2. Dados do Cliente
      doc.setTextColor(...dark);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("DADOS DO CLIENTE", 15, 60);
      doc.setDrawColor(...orange);
      doc.line(15, 62, 195, 62);

      doc.setFont("helvetica", "normal");
      doc.text(`NOME: ${vehicle.customer_name}`, 15, 70);
      doc.text(`CONTATO: ${vehicle.phone}`, 120, 70);

      // 3. Dados do Veículo
      doc.setFont("helvetica", "bold");
      doc.text("DADOS DO VEÍCULO", 15, 80);
      doc.line(15, 82, 195, 82);

      doc.setFont("helvetica", "normal");
      doc.text(`MARCA / MODELO: ${vehicle.brand} ${vehicle.model}`, 15, 90);
      doc.text(`PLACA: ${vehicle.license_plate}`, 120, 90);
      doc.text(`COR: ${vehicle.color || '---'}`, 15, 96);

      // 4. Seção de Serviços (Tabela)
      const servicesList = (vehicle.services || []).map(s => [
        s.description || '---', 
        `R$ ${Number(s.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      ]);

      if (doc.autoTable) {
        doc.autoTable({
          startY: 105,
          head: [['DESCRIÇÃO TÉCNICA DO SERVIÇO', 'VALOR']],
          body: servicesList,
          theme: 'grid',
          headStyles: { fillColor: orange, textColor: [255, 255, 255], fontSize: 9 },
          styles: { fontSize: 8, cellPadding: 3 },
          margin: { left: 15, right: 15 }
        });
      }

      // 5. Valor Final
      const finalY = doc.lastAutoTable.finalY + 15;
      const totalCalculated = (vehicle.services || []).reduce((acc, curr) => acc + Number(curr.price || 0), 0);

      doc.setFillColor(...dark);
      doc.rect(15, finalY - 8, 180, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`VALOR TOTAL DO ORÇAMENTO: R$ ${totalCalculated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 105, finalY, { align: "center" });

      // 6. Assinaturas (Fim da página)
      const pageHeight = doc.internal.pageSize.height;
      const sigY = pageHeight - 40;
      
      doc.setTextColor(...dark);
      doc.setFontSize(8);
      doc.setDrawColor(...gray);
      
      // Linha Cliente
      doc.line(20, sigY, 90, sigY);
      doc.text("ASSINATURA DO CLIENTE", 55, sigY + 5, { align: "center" });

      // Linha Oficina
      doc.line(120, sigY, 190, sigY);
      doc.text(`RESPONSÁVEL: ${profile.workshop_name?.toUpperCase() || 'AUTOPRIME'}`, 155, sigY + 5, { align: "center" });

      // Rodapé
      doc.setFontSize(7);
      doc.setTextColor(...gray);
      doc.text("Este documento é um orçamento e não possui valor fiscal. Validade: 10 dias.", 105, pageHeight - 15, { align: "center" });

      doc.save(`Orcamento_${vehicle.license_plate}.pdf`);
      showNotification("PDF gerado!");
    } catch (err) { console.error("Erro ao gerar PDF:", err); }
  };

  const generateCRMPDF = () => {
    try {
      if (!window.jspdf) return;
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text(`BASE DE CLIENTES - ${profile.workshop_name?.toUpperCase() || "AUTOPRIME"}`, 15, 20);
      
      const data = crmData.map(c => [
        c.customer_name,
        `${c.last_brand} ${c.last_model}`,
        c.last_license_plate,
        c.phone,
        new Date(c.last_entry || Date.now()).toLocaleDateString('pt-BR')
      ]);

      if (doc.autoTable) {
        doc.autoTable({
          startY: 30,
          head: [['Cliente', 'Último Carro', 'Placa', 'Contato', 'Última Entrada']],
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
    if (!supabase) return;
    try {
      const isDone = newStatus === 'Concluído';
      const polDate = isDone ? new Date(new Date().setDate(new Date().getDate() + 30)).toISOString() : null;
      const currentV = vehicles.find(v => v.id === id);
      
      let scheduledDate = currentV?.scheduled_date || null;
      if (newStatus === 'Agendados') {
        const p = window.prompt("Defina a data para este agendamento (Ex: 15/02):", scheduledDate || "");
        if (p !== null) scheduledDate = p;
      }

      const upd = { 
        work_status: newStatus, 
        status: isDone ? 'done' : 'active', 
        polishing_date: polDate,
        scheduled_date: scheduledDate, 
        current_stage: newStatus === 'Em Produção' ? (currentV?.current_stage || 'Funilaria') : (newStatus === 'Agendados' ? null : currentV?.current_stage)
      };

      const { error } = await supabase.from('autoprime_vehicles').update(upd).eq('id', id);
      if (error) throw error;

      // Disparar Webhook para o n8n informando a mudança de status geral
      try {
        fetch('https://n8n-projeto-n8n.bi9xft.easypanel.host/webhook-test/change_status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            event: 'STATUS_CHANGED', 
            new_status: newStatus, 
            vehicle: currentV,
            tenant_id: currentTenantId 
          })
        }).catch(() => {});
      } catch (err) {}

      setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...upd, scheduled_date: scheduledDate } : v));
      if (viewingVehicle && viewingVehicle.id === id) setViewingVehicle(prev => ({ ...prev, ...upd, scheduled_date: scheduledDate }));
      showNotification("Status atualizado!");
    } catch (e) {
      console.error("Erro ao atualizar status:", e);
      showNotification("Erro na conexão com o servidor.", "danger");
    }
  };

  const updateVehicleStage = async (id, stage) => {
    if (!supabase) return;
    try {
      const upd = { current_stage: stage };
      const { error } = await supabase.from('autoprime_vehicles').update(upd).eq('id', id);
      if (error) throw error;

      const currentV = vehicles.find(v => v.id === id);

      // Disparar Webhook para o n8n informando a mudança de etapa na estufa
      try {
        fetch('COLOQUE_SEU_WEBHOOK_DO_N8N_AQUI', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            event: 'STAGE_CHANGED', 
            new_stage: stage, 
            vehicle: currentV,
            tenant_id: currentTenantId 
          })
        }).catch(() => {});
      } catch (err) {}

      setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...upd } : v));
      if (viewingVehicle && viewingVehicle.id === id) setViewingVehicle(prev => ({ ...prev, ...upd }));
      showNotification(`Etapa: ${stage}`);
    } catch (e) {
      console.error("Erro ao atualizar etapa:", e);
      showNotification("Erro na conexão com o servidor.", "danger");
    }
  };

  const deleteVehicle = async (id) => {
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

    let desc = [...(newVehicle.selectedServices || []), ...(newVehicle.customServicesList || [])].join(", ");
    
    const payload = {
      customer_name: newVehicle.customerName, 
      phone: newVehicle.phone, 
      brand: newVehicle.brand, 
      model: newVehicle.model,
      license_plate: newVehicle.licensePlate, // Corrigido de license_plate para licensePlate
      color: newVehicle.color, 
      entry_time: new Date().toISOString(),
      service_description: desc, 
      status: newVehicle.workStatus === 'Concluído' ? 'done' : 'active',
      work_status: newVehicle.workStatus, 
      price: Number(String(newVehicle.price || 0).replace(',', '.')),
      cost: Number(String(newVehicle.cost || 0).replace(',', '.')), 
      tenant_id: currentTenantId,
      photos: newVehicle.photos, 
      location: newVehicle.location, 
      professional: newVehicle.professional,
      vehicle_type: newVehicle.type || 'Sedan', 
      current_stage: newVehicle.workStatus === 'Em Produção' ? 'Funilaria' : null
    };
    
    // Experiência instantânea: Fecha a tela e limpa os dados antes de esperar a resposta do servidor
    setIsModalOpen(false);
    setNewVehicle({ customerName: "", phone: "", brand: "", model: "", licensePlate: "", type: "Sedan", color: "", location: "BOX 01", professional: "", price: "", cost: "", workStatus: "Aguardando Aprovação", selectedServices: [], customPieceText: "", customServicesList: [], photos: {} });
    showNotification("Registrando veículo...");

    // Inserir Veículo com tratamento de erro
    const { data, error: insertError } = await supabase.from('autoprime_vehicles').insert([payload]).select();

    if (insertError) {
      console.error("Erro Supabase:", insertError);
      showNotification("Erro ao registrar veículo no banco de dados.", "danger");
      return;
    }
    
    // Sincronizar com CRM utilizando os dados capturados no payload
    await supabase.from('autoprime_crm').upsert({
      tenant_id: currentTenantId,
      customer_name: payload.customer_name,
      phone: payload.phone,
      last_brand: payload.brand,
      last_model: payload.model,
      last_license_plate: payload.license_plate,
      last_entry: payload.entry_time
    }, { onConflict: 'tenant_id, phone' });

    if (data && data.length > 0) {
      setVehicles([data[0], ...vehicles]);
      showNotification("Cadastrado!");
      fetchData(); 
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

    const { error: invError = null } = await supabase.from('autoprime_inventory').update({ quantity: newQty }).eq('id', item.id);
    if (invError) return;

    const { error: vehError = null } = await supabase.from('autoprime_vehicles').update({ cost: newVehicleCost }).eq('id', viewingVehicle.id);
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
    
    if (newQty < 5) {
      const msg = `O item "${item.name}" está acabando (Restam ${newQty}).`;
      showNotification(`Atenção: ${msg}`, "danger");
      
      // Dispara a notificação nativa do sistema (estilo WhatsApp/Sistema)
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("AutoPrime: Estoque Baixo", { body: msg });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(permission => {
            if (permission === "granted") {
              new Notification("AutoPrime: Estoque Baixo", { body: msg });
            }
          });
        }
      }
    } else {
      showNotification("Material debitado!");
    }
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

  const clearCRM = async () => {
    if (!supabase || !currentTenantId) return;
    const { error } = await supabase.from('autoprime_crm').delete().eq('tenant_id', currentTenantId);
    if (!error) {
      setCrmData([]);
      showNotification("CRM limpo com sucesso!");
    } else {
      showNotification("Erro ao limpar CRM", "danger");
    }
  };

  const activeVehiclesMemo = useMemo(() => vehicles.filter(v => v.status === 'active'), [vehicles]);
  const historyVehiclesMemo = useMemo(() => vehicles.filter(v => v.status === 'done'), [vehicles]);
  
  const totalInventoryValue = useMemo(() => {
    return (inventory || []).reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
  }, [inventory]);

  const financeMemo = useMemo(() => {
    const rev = vehicles.reduce((acc, v) => acc + (Number(v.price) || 0), 0);
    const exp = Object.values({ ...fixedCosts, material: totalInventoryValue }).reduce((acc, val) => acc + (Number(val) || 0), 0);
    return { rev, exp, profit: rev - exp };
  }, [vehicles, fixedCosts, totalInventoryValue]);

  const filteredVehicles = useMemo(() => {
    if (dashboardFilter === 'budgets') return activeVehiclesMemo.filter(v => v.work_status === 'Aguardando Aprovação');
    if (dashboardFilter === 'registered') return activeVehiclesMemo.filter(v => v.work_status === 'Agendados');
    if (dashboardFilter === 'in_work') return activeVehiclesMemo.filter(v => v.work_status === 'Em Produção');
    if (dashboardFilter === 'done') return historyVehiclesMemo;
    return activeVehiclesMemo;
  }, [dashboardFilter, activeVehiclesMemo, historyVehiclesMemo]);

  const polishingListMemo = useMemo(() => vehicles.filter(v => v.polishing_date).sort((a, b) => new Date(a.polishing_date) - new Date(b.polishing_date)), [vehicles]);

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

  // Validação de Assinatura ligada diretamente ao banco (atualizado pelo Webhook da Stripe)
  const isSubscriptionValid = useMemo(() => {
    const status = (profile.subscription_status || '').toLowerCase();
    
    // 1. Se a Stripe (webhook) ou o banco definiu como expirada/cancelada, bloqueia imediatamente
    if (status === 'expirada' || status === 'cancelada' || status === 'inativa' || status === 'past_due' || status === 'unpaid' || status === 'desativado') {
      return false;
    }
    
    // 2. Fallback de segurança local: Se a data passou, também bloqueia
    if (profile.subscription_expires_at) {
      const expiry = new Date(profile.subscription_expires_at).getTime();
      if (expiry <= Date.now()) return false;
    }
    
    return true; 
  }, [profile.subscription_status, profile.subscription_expires_at]);

  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-800 font-bold uppercase text-[10px] tracking-widest animate-pulse">Sincronizando sistema...</div>;

  if (isPublicView) {
    if (!publicVehicle) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-800 font-bold uppercase text-[10px] tracking-widest animate-pulse">Sincronizando dados...</div>;
    const stages = ['Funilaria', 'Preparação', 'Pintura', 'Polimento', 'Finalizado'];
    const currentIdx = stages.indexOf(publicVehicle.current_stage);
    return (
      <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center font-sans overflow-hidden">
        <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in-95 duration-700 text-center">
           <div className="space-y-2 flex flex-col items-center">
              <h1 className="text-5xl font-black italic uppercase tracking-tighter mt-4">Auto<span className="text-orange-600">Prime</span></h1>
              <div className="h-px w-12 bg-zinc-800 mx-auto mt-4"></div>
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
                      {publicVehicle.work_status === 'Em Produção' ? `Em Produção: ${publicVehicle.current_stage}` : publicVehicle.work_status}
                    </p>
                 </div>
                 {publicVehicle.work_status === 'Em Produção' && (
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
      <div className="flex items-center gap-3 mb-8 px-2 flex-shrink-0">
        <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter mt-1">Auto<span className="text-orange-600">Prime</span></h1>
      </div>
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto no-scrollbar pb-4">
        {[ 
          { id: 'dashboard', label: 'Painel', icon: LayoutDashboard, visible: true }, 
          { id: 'budget_generator', label: 'Orçamentos', icon: FileText, visible: true },
          { id: 'history', label: 'Histórico', icon: History, visible: true }, 
          { id: 'polishing', label: 'Polimento', icon: Sparkles, visible: appSettings.showPolishing }, 
          { id: 'inventory', label: 'Estoque', icon: Package, visible: appSettings.showInventory }, 
          { id: 'finance', label: 'Financeiro', icon: DollarSign, visible: appSettings.showFinance },
          { id: 'settings', label: 'Ajustes', icon: Settings, visible: true }, 
          { id: 'profile', label: 'Oficina', icon: User, visible: true },
          { id: 'crm', label: 'CRM', icon: MessageCircle, visible: true },
          { id: 'subscription_manager', label: 'Assinatura', icon: CreditCard, visible: true },
          { id: 'my_profile', label: 'Meu Perfil', icon: User, visible: true },
          { id: 'about', label: 'Guia de Uso', icon: HelpCircle, visible: true }
        ].filter(item => item.visible).map(item => (
          <button key={item.id} onClick={() => {setActiveTab(item.id); setIsMobileMenuOpen(false);}} className={`flex items-center gap-3 px-3 py-3 rounded-xl font-bold uppercase text-[9px] tracking-widest transition-all flex-shrink-0 ${activeTab === item.id ? 'bg-orange-600 text-black italic shadow-md' : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'}`}><item.icon size={16} /> {item.label}</button>
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-zinc-900/50 flex-shrink-0 space-y-2">
        {profile.subscription_status && (
          <div className={`w-full p-3 rounded-xl border flex items-center gap-3 ${isSubscriptionValid ? 'bg-emerald-600/5 border-emerald-500/20' : 'bg-red-600/5 border-red-500/20'}`}>
            <CreditCard size={14} className={isSubscriptionValid ? 'text-emerald-500' : 'text-red-500'}/>
            <div className="flex-1 min-w-0">
              <p className="text-[7px] font-black uppercase text-zinc-500 tracking-widest">Plano {profile.subscription_status?.toLowerCase() === 'trial' ? 'TRIAL (7 DIAS)' : profile.subscription_status}</p>
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
        <div className="min-h-screen w-full bg-black flex">
           {/* Lado Esquerdo - Autenticação */}
           <div className="w-full lg:w-1/2 flex items-center justify-center p-4 relative z-10">
             <Card className="w-full max-w-[320px] p-6 bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
                <div className="flex flex-col items-center gap-2 mb-6 text-center">
                   <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mt-1">Auto<span className="text-orange-600">Prime</span></h1>
                   <p className="text-[8px] font-bold uppercase text-zinc-500 tracking-widest mt-1">
                      {authView === 'login' ? 'Painel Administrativo' : authView === 'signup' ? 'Criar Nova Oficina' : 'Recuperar Acesso'}
                   </p>
                </div>

                {authView === 'login' && (
                  <form onSubmit={handleLogin} className="space-y-3">
                    <Input label="E-mail" type="email" icon={Mail} value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} placeholder="exemplo@autoprime.com" required />
                    <div className="space-y-1">
                      <Input label="Senha" type="password" icon={Lock} value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} placeholder="••••••••" required />
                      <div className="flex justify-end px-1">
                        <button type="button" onClick={() => setAuthView('forgot')} className="text-[8px] font-black uppercase text-zinc-500 hover:text-orange-500 transition-colors">Esqueci minha senha</button>
                      </div>
                    </div>
                    {loginError && <p className="text-red-500 text-[8px] font-bold text-center">{loginError}</p>}
                    <Button type="submit" className="w-full py-2.5">Acessar</Button>
                    <div className="pt-3 border-t border-zinc-800 text-center">
                      <button type="button" onClick={() => {setAuthView('signup'); setLoginError("");}} className="text-[9px] font-black uppercase text-orange-500 tracking-widest hover:underline">Não tem conta? Cadastrar</button>
                    </div>
                  </form>
                )}

                {authView === 'signup' && (
                  <form onSubmit={handleSignUp} className="space-y-3">
                    <Input label="Oficina" icon={Car} value={loginForm.workshopName} onChange={e => setLoginForm({...loginForm, workshopName: e.target.value})} placeholder="Nome" required />
                    <Input label="Responsável" icon={User} value={loginForm.fullName} onChange={e => setLoginForm({...loginForm, fullName: e.target.value})} placeholder="Nome" required />
                    <Input label="CPF" icon={FileDigit} value={loginForm.cpf} onChange={e => setLoginForm({...loginForm, cpf: e.target.value})} placeholder="000.000.000-00" required />
                    <Input label="Endereço" icon={MapPin} value={loginForm.address} onChange={e => setLoginForm({...loginForm, address: e.target.value})} placeholder="Rua das Flores, 123" required />
                    <Input label="E-mail" type="email" icon={Mail} value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} placeholder="admin@autoprime.com" required />
                    <Input label="Senha" type="password" icon={Lock} value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} placeholder="••••••••" required />
                    <Input label="Confirmar" type="password" icon={Lock} value={loginForm.confirmPassword} onChange={e => setLoginForm({...loginForm, confirmPassword: e.target.value})} placeholder="••••••••" required />
                    {loginError && <p className="text-red-500 text-[8px] font-bold text-center">{loginError}</p>}
                    <Button type="submit" className="w-full py-2.5">Cadastrar</Button>
                    <div className="pt-3 border-t border-zinc-800 text-center">
                      <button type="button" onClick={() => {setAuthView('login'); setLoginError("");}} className="text-[9px] font-black uppercase text-zinc-500 tracking-widest hover:text-white transition-colors">Já tem conta? Entrar</button>
                    </div>
                  </form>
                )}

                {authView === 'forgot' && (
                  <form onSubmit={handleForgotPassword} className="space-y-3">
                    <p className="text-[8px] text-zinc-400 text-center px-2 leading-relaxed font-bold uppercase italic tracking-wider">Confirme seu E-mail e CPF/CNPJ.</p>
                    <Input label="E-mail" type="email" icon={Mail} value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} placeholder="seu-email@exemplo.com" required />
                    <Input label="CPF ou CNPJ" icon={FileDigit} value={loginForm.cpf} onChange={e => setLoginForm({...loginForm, cpf: e.target.value})} placeholder="000.000.000-00" required />
                    <Input label="Nova Senha" type="password" icon={Lock} value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} placeholder="••••••••" required />
                    <Input label="Confirmar" type="password" icon={Lock} value={loginForm.confirmPassword} onChange={e => setLoginForm({...loginForm, confirmPassword: e.target.value})} placeholder="••••••••" required />
                    {loginError && <p className="text-red-500 text-[8px] font-bold text-center">{loginError}</p>}
                    <Button type="submit" className="w-full py-2.5">Redefinir</Button>
                    <div className="pt-3 border-t border-zinc-800 text-center">
                      <button type="button" onClick={() => {setAuthView('login'); setLoginError("");}} className="text-[9px] font-black uppercase text-zinc-500 tracking-widest hover:text-white transition-colors">Voltar para Login</button>
                    </div>
                  </form>
                )}
             </Card>
           </div>
           
           {/* Lado Direito - Marketing */}
           <div className="hidden lg:flex w-1/2 bg-zinc-950 flex-col justify-center relative overflow-hidden border-l border-zinc-900/50">
              {/* Fotos de Marketing - Background (Carrossel) */}
              <div className="absolute inset-0 bg-black">
                 {marketingContent.map((content, idx) => (
                   <img 
                     key={idx} 
                     src={content.img} 
                     alt={`Marketing AutoPrime ${idx + 1}`} 
                     className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${idx === marketingSlide ? 'opacity-40' : 'opacity-0'}`} 
                   />
                 ))}
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
              </div>
              
              {/* Efeitos Visuais */}
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-600/20 blur-[100px] rounded-full pointer-events-none"></div>
              
              <div className="relative z-10 w-full p-12 lg:p-16">
                 <div key={marketingSlide} className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
                    <div>
                       <h2 className="text-3xl lg:text-4xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">{marketingContent[marketingSlide].title} <br/><span className="text-orange-600">{marketingContent[marketingSlide].highlight}</span></h2>
                       <p className="text-zinc-400 text-xs leading-relaxed font-bold max-w-sm">{marketingContent[marketingSlide].desc}</p>
                    </div>
                    
                    <div className="space-y-5">
                       {marketingContent[marketingSlide].features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-4">
                             <div className="bg-orange-600/20 p-2.5 rounded-xl text-orange-500 border border-orange-500/20 backdrop-blur-md">
                                <feature.icon size={18}/>
                             </div>
                             <div className="mt-0.5">
                                <h3 className="text-white font-black uppercase italic text-xs">{feature.title}</h3>
                                <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mt-1">{feature.desc}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      ) : !isSubscriptionValid ? (
        <div className="min-h-screen w-full bg-black flex items-center justify-center p-6">
          <Card className="w-full max-w-md p-10 text-center space-y-6 border-orange-600/30">
            <div className="flex justify-center">
              <div className="bg-orange-600/10 p-5 rounded-full text-orange-600 animate-pulse"><ShieldAlert size={48}/></div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Assinatura Desativada</h2>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed">O período de teste ou sua assinatura ativa terminou. Por favor, renove sua conta para continuar gerenciando sua oficina.</p>
            </div>
            <div className="h-px bg-zinc-800 w-12 mx-auto"></div>
            <div className="space-y-4">
              <Button onClick={handleManageSubscription} className="w-full py-4 tracking-widest">RENOVAR ASSINATURA AGORA</Button>
              <button onClick={handleLogout} className="text-[10px] font-black uppercase text-zinc-600 hover:text-white transition-all tracking-widest">SAIR DA CONTA</button>
            </div>
          </Card>
        </div>
      ) : (
        <>
          <header className="md:hidden flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-900 sticky top-0 z-50">
            <div className="flex items-center gap-2">
               <span className="text-xl font-black text-white italic tracking-tighter uppercase mt-0.5">Auto<span className="text-orange-600">Prime</span></span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-zinc-400 p-2"><Menu size={18} /></button>
          </header>

          {/* MENU MOBILE OVERLAY - CORRIGINDO VISIBILIDADE NO CELULAR */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-[500] md:hidden">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-64 bg-zinc-950 p-6 flex flex-col border-r border-zinc-900 animate-in slide-in-from-left duration-300">
                <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-4 right-4 text-zinc-700 hover:text-white transition-all z-10"><X size={20}/></button>
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
                    { id: 'registered', label: 'Agendados', val: activeVehiclesMemo.filter(v => v.work_status === 'Agendados').length, icon: Car, color: 'text-orange-500' }, 
                    { id: 'in_work', label: 'Em Produção', val: activeVehiclesMemo.filter(v => v.work_status === 'Em Produção').length, icon: Wrench, color: 'text-blue-500' }, 
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
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest">
                              {v.license_plate} • {v.location} 
                            </p>
                            {v.scheduled_date && (
                              <span className="bg-orange-600/10 text-orange-500 px-2 py-0.5 rounded border border-orange-500/20 text-[8px] font-black uppercase italic animate-pulse">
                                Agenda: {v.scheduled_date}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[8px] px-2 py-0.5 rounded-full font-black bg-zinc-950 text-orange-500 border border-zinc-800 uppercase">{v.work_status}</span>
                      </div>
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                          <div className="flex-1 min-w-0 flex flex-nowrap items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-900 overflow-x-auto overflow-y-hidden touch-pan-x" style={{ WebkitOverflowScrolling: 'touch' }}>
                              {['Aguardando Aprovação', 'Agendados', 'Em Produção', 'Concluído'].map(st => (
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

            {activeTab === 'budget_generator' && (
              <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
                 <h2 className="text-lg font-black text-white uppercase italic tracking-tight">Gerador de Orçamentos (PDF)</h2>
                 <Card className="p-6 space-y-6 bg-zinc-900/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <Input label="Nome do Cliente" value={budgetForm.customer_name} onChange={e => setBudgetForm({...budgetForm, customer_name: e.target.value})} icon={User} placeholder="Nome completo" />
                       <Input label="Contacto" value={budgetForm.phone} onChange={e => setBudgetForm({...budgetForm, phone: e.target.value})} icon={Phone} placeholder="Telefone / WhatsApp" />
                       <Input label="Marca" value={budgetForm.brand} onChange={e => setBudgetForm({...budgetForm, brand: e.target.value})} icon={Car} placeholder="Ex: BMW" />
                       <Input label="Modelo" value={budgetForm.model} onChange={e => setBudgetForm({...budgetForm, model: e.target.value})} icon={Car} placeholder="Ex: Série 3" />
                       <Input label="Placa / Matrícula" value={budgetForm.license_plate} onChange={e => setBudgetForm({...budgetForm, license_plate: e.target.value.toUpperCase()})} icon={FileDigit} placeholder="XX-XX-XX" />
                       <Input label="Cor" value={budgetForm.color} onChange={e => setBudgetForm({...budgetForm, color: e.target.value})} icon={Paintbrush} placeholder="Ex: Preto" />
                       <div className="md:col-span-2 space-y-3">
                         <div className="flex justify-between items-center">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Serviços e Valores</label>
                            <button type="button" onClick={() => setBudgetForm({...budgetForm, services: [...budgetForm.services, { description: "", price: "" }]})} className="text-[9px] font-black text-orange-500 hover:text-orange-400 uppercase tracking-widest flex items-center gap-1"><Plus size={12}/> Adicionar Serviço</button>
                         </div>
                         {budgetForm.services.map((srv, idx) => (
                           <div key={idx} className="flex gap-2 items-end animate-in fade-in">
                              <div className="flex-1">
                                <Input placeholder="Ex: Pintura do para-choque" value={srv.description} onChange={e => { const newSrv = [...budgetForm.services]; newSrv[idx].description = e.target.value; setBudgetForm({...budgetForm, services: newSrv}); }} icon={Wrench} />
                              </div>
                              <div className="w-32">
                                <Input placeholder="Valor" type="number" value={srv.price} onChange={e => { const newSrv = [...budgetForm.services]; newSrv[idx].price = e.target.value; setBudgetForm({...budgetForm, services: newSrv}); }} icon={DollarSign} />
                              </div>
                              <button type="button" onClick={() => { const newSrv = budgetForm.services.filter((_, i) => i !== idx); setBudgetForm({...budgetForm, services: newSrv.length ? newSrv : [{ description: "", price: "" }]}); }} className="mb-1 p-2 bg-red-600/10 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16}/></button>
                           </div>
                         ))}
                         <div className="flex justify-end pt-2">
                            <p className="text-sm font-black text-white uppercase tracking-widest bg-zinc-950 px-4 py-2 border border-zinc-800 rounded-lg">Total: <span className="text-emerald-500">R$ {budgetForm.services.reduce((acc, curr) => acc + Number(curr.price || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
                         </div>
                       </div>
                    </div>
                    <Button onClick={() => generateBudgetPDF(budgetForm)} className="w-full py-4 text-sm tracking-[0.2em] font-black italic"><Download size={16}/> Gerar Orçamento (PDF)</Button>
                 </Card>
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
                         <Button variant="outline" className="opacity-0 group-hover:opacity-100 px-2 py-1.5" onClick={(e) => { e.stopPropagation(); updateWorkStatus(v.id, 'Em Produção'); }}><RotateCcw size={12}/></Button>
                      </Card>
                   ))}
                   {historyVehiclesMemo.length === 0 && (
                      <div className="col-span-full py-12 text-center text-zinc-800 font-black uppercase italic tracking-widest">Nenhum veículo no histórico (Excluídos após 30 dias)</div>
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
                    <Card className="p-5 border-l-4 border-l-red-600"><AlertTriangle className="text-red-600 mb-2" size={18}/><p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Custos Fixos</p><p className="text-xl font-black text-yellow-500">R$ {financeMemo.exp.toLocaleString('pt-BR')}</p></Card>
                    <Card className="p-5 border-l-4 border-l-emerald-600"><CheckCircle2 className="text-emerald-600 mb-2" size={18}/><p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Lucro Estimado</p><p className={`text-xl font-black ${financeMemo.profit < 0 ? 'text-red-500' : 'text-emerald-500'}`}>R$ {financeMemo.profit.toLocaleString('pt-BR')}</p></Card>
                  </div>
                  <Card className="p-6 space-y-6">
                     <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-2">Gastos Operacionais Mensais</h3>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <Input label="Aluguel" type="number" value={fixedCosts.aluguel} onChange={e => setFixedCosts({...fixedCosts, aluguel: e.target.value})} icon={MapPin}/>
                        <Input label="Funcionário" type="number" value={fixedCosts.funcionario} onChange={e => setFixedCosts({...fixedCosts, funcionario: e.target.value})} icon={User}/>
                        <Input label="Material (Stock)" type="number" value={totalInventoryValue} readOnly icon={Package}/>
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
                       <Input label="Instagram" value={profile.instagram} onChange={e => setProfile({...profile, instagram: e.target.value})} icon={Instagram} placeholder="@seuinstagram" />
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
                    <div className="flex gap-2">
                      <Button onClick={clearCRM} variant="danger" className="px-4"><Trash2 size={16}/> Limpar Dados</Button>
                      <Button onClick={generateCRMPDF} variant="outline" className="border-orange-600/50 text-orange-500 hover:bg-orange-600/10"><Download size={16}/> Baixar Lista CRM (PDF)</Button>
                    </div>
                 </div>
                 
                 <Card className="overflow-hidden border-zinc-800 bg-zinc-950/50">
                    <table className="w-full text-left text-[10px]">
                      <thead className="bg-zinc-900 text-zinc-500 uppercase font-black">
                        <tr>
                          <th className="p-4">Cliente</th>
                          <th className="p-4">Último Carro</th>
                          <th className="p-4">Placa</th>
                          <th className="p-4">Contato</th>
                          <th className="p-4">Última Entrada</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900">
                        {crmData.map((c, i) => (
                          <tr key={i} className="hover:bg-zinc-900/30 transition-colors">
                            <td className="p-4 font-bold text-white uppercase">{c.customer_name}</td>
                            <td className="p-4 text-zinc-400 font-bold uppercase">{c.last_brand} {c.last_model}</td>
                            <td className="p-4 text-orange-500 font-mono italic">{c.last_license_plate}</td>
                            <td className="p-4 text-white font-bold">{c.phone}</td>
                            <td className="p-4 text-zinc-600 font-mono">{new Date(c.last_entry || Date.now()).toLocaleDateString('pt-BR')}</td>
                          </tr>
                        ))}
                        {crmData.length === 0 && (
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
                             {isSubscriptionValid ? (profile.subscription_status?.toLowerCase() === 'trial' ? 'Ativo - Modo Trial' : `${profile.subscription_status || 'Ativo'} - Acesso total`) : `${profile.subscription_status || 'Desativado'} - Sem acesso`}
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
                          {isSubscriptionValid ? 'Sua licença está válida e todas as funcionalidades estão desbloqueadas.' : 'Seu acesso foi interrompido. Regularize sua assinatura para restaurar o acesso total.'}
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
                    <Button variant={isSubscriptionValid ? "outline" : "primary"} className="mt-2" onClick={handleManageSubscription}>
                       {isSubscriptionValid ? 'Gerenciar faturamento' : 'RENOVAR ASSINATURA AGORA'}
                    </Button>
                 </Card>
              </div>
            )}

            {activeTab === 'my_profile' && (
              <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
                 <h2 className="text-lg font-black text-white uppercase italic tracking-tight">Meu Perfil</h2>
                 <Card className="p-6 space-y-6 bg-zinc-900/50">
                    <div className="flex flex-col items-center gap-4 mb-6">
                       <div className="relative w-24 h-24 rounded-full bg-zinc-950 border-2 border-dashed border-zinc-800 flex items-center justify-center overflow-hidden hover:border-orange-600 transition-all group">
                          {profile.profile_photo ? (
                             <img src={profile.profile_photo} className="w-full h-full object-cover" alt="Perfil" />
                          ) : (
                             <User size={32} className="text-zinc-700" />
                          )}
                          <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                             <Camera size={20} className="text-white mb-1" />
                             <span className="text-[8px] font-black text-white uppercase tracking-widest">Alterar</span>
                             <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                   const reader = new FileReader();
                                   reader.onloadend = () => setProfile({...profile, profile_photo: reader.result});
                                   reader.readAsDataURL(file);
                                }
                             }} />
                          </label>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <Input label="Nome Completo" value={profile.owner_name} onChange={e => setProfile({...profile, owner_name: e.target.value})} icon={User} placeholder="Seu nome" />
                       <Input label="CPF ou CNPJ" value={profile.cnpj} onChange={e => setProfile({...profile, cnpj: e.target.value})} icon={FileDigit} placeholder="000.000.000-00" />
                       <Input label="Senha Atual" type="password" value="*******" readOnly icon={Lock} />
                       <Input label="Nova Senha" type="password" placeholder="Digite para alterar" value={profile.new_password || ""} onChange={e => setProfile({...profile, new_password: e.target.value})} icon={Lock} />
                    </div>
                    
                    <Button onClick={async () => {
                       const { new_password, ...profileDataToSave } = profile;
                       
                       // Salva os dados do perfil (incluindo a foto base64)
                       await supabase.from('autoprime_profile').upsert({ tenant_id: currentTenantId, ...profileDataToSave });
                       
                       // Se o utilizador digitou uma nova senha, atualiza na tabela de admins
                       if (new_password) {
                          const { error } = await supabase.from('autoprime_admins').update({ password: new_password }).eq('tenant_id', currentTenantId);
                          if (error) {
                             showNotification("Erro ao alterar senha", "danger");
                             return;
                          }
                          setProfile({...profile, new_password: ""}); // limpa o campo
                       }
                       showNotification("Perfil atualizado com sucesso!");
                    }} className="w-full py-3"><Save size={16}/> Guardar Meu Perfil</Button>
                 </Card>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in">
                 <div className="text-center space-y-4 mb-8">
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">Guia de <span className="text-orange-600">Uso da Plataforma</span></h2>
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest max-w-2xl mx-auto">Aprenda passo a passo como utilizar as principais ferramentas do seu sistema.</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Guia 1 */}
                    <Card className="overflow-hidden border-zinc-800 bg-zinc-900/50">
                       <div className="h-48 bg-zinc-950 flex flex-col items-center justify-center p-6 border-b border-zinc-800/50 relative overflow-hidden pointer-events-none">
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-transparent"></div>
                          <div className="w-full max-w-sm bg-black border border-zinc-800 rounded-xl p-4 shadow-2xl z-10">
                             <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-black text-white uppercase italic">Painel</span>
                                <div className="bg-orange-600 text-white px-3 py-1.5 rounded-lg font-bold text-[8px] uppercase flex items-center gap-1 shadow-md"><Plus size={12}/> Nova Entrada</div>
                             </div>
                             <div className="grid grid-cols-2 gap-2">
                                <div className="h-10 bg-zinc-900 border border-zinc-800 rounded-lg"></div>
                                <div className="h-10 bg-zinc-900 border border-zinc-800 rounded-lg"></div>
                             </div>
                          </div>
                       </div>
                       <div className="p-6 space-y-3">
                          <h3 className="text-lg font-black text-white uppercase italic flex items-center gap-2"><LayoutDashboard className="text-orange-500" size={18}/> 1. Cadastrar Veículo</h3>
                          <p className="text-zinc-400 text-xs font-bold leading-relaxed">No menu <b>Painel</b>, clique no botão laranja <b>"Nova Entrada"</b> no canto superior direito. Preencha a ficha do cliente, serviços e tire fotos para a vistoria. O veículo entrará na fila imediatamente.</p>
                       </div>
                    </Card>

                    {/* Guia 2 */}
                    <Card className="overflow-hidden border-zinc-800 bg-zinc-900/50">
                       <div className="h-48 bg-zinc-950 flex flex-col items-center justify-center p-6 border-b border-zinc-800/50 relative overflow-hidden pointer-events-none">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent"></div>
                          <div className="w-full max-w-sm bg-black border border-zinc-800 rounded-xl p-4 shadow-2xl z-10 space-y-3">
                             <p className="text-[7px] font-black text-zinc-400 uppercase flex items-center gap-1 italic"><BoxSelect size={10} className="text-blue-500"/> Materiais Aplicados</p>
                             <div className="flex gap-2">
                                <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-2 text-[8px] text-zinc-500 font-bold">Verniz PU</div>
                                <div className="w-10 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-2 text-[8px] text-white font-bold text-center">1</div>
                                <div className="bg-zinc-800 text-zinc-300 font-black text-[7px] uppercase px-3 py-2 rounded-lg border border-zinc-700 leading-tight text-center">Debitar e<br/>Lançar</div>
                             </div>
                          </div>
                       </div>
                       <div className="p-6 space-y-3">
                          <h3 className="text-lg font-black text-white uppercase italic flex items-center gap-2"><Package className="text-orange-500" size={18}/> 2. Debitar Estoque</h3>
                          <p className="text-zinc-400 text-xs font-bold leading-relaxed">Na ficha técnica de um veículo, desça até <b>Materiais Aplicados</b>. Escolha o produto gasto, a quantidade e clique em lançar. O custo abate no lucro e o estoque diminui automaticamente.</p>
                       </div>
                    </Card>

                    {/* Guia 3 */}
                    <Card className="overflow-hidden border-zinc-800 bg-zinc-900/50">
                       <div className="h-48 bg-zinc-950 flex flex-col items-center justify-center p-6 border-b border-zinc-800/50 relative overflow-hidden pointer-events-none">
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent"></div>
                          <div className="w-full max-w-sm bg-black border border-zinc-800 rounded-xl p-4 shadow-2xl z-10 space-y-3">
                             <p className="text-[7px] font-black text-orange-600 uppercase flex items-center gap-1 italic"><Share2 size={10}/> Link de Acompanhamento</p>
                             <div className="flex gap-2 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                                <div className="flex-1 bg-transparent px-2 text-[8px] text-zinc-500 font-mono py-1">autoprime.app/?v=123</div>
                                <div className="bg-emerald-600 px-3 py-1.5 rounded-md text-white flex items-center gap-1"><MessageCircle size={10}/> <span className="text-[7px] font-black uppercase">Enviar</span></div>
                             </div>
                          </div>
                       </div>
                       <div className="p-6 space-y-3">
                          <h3 className="text-lg font-black text-white uppercase italic flex items-center gap-2"><MessageCircle className="text-orange-500" size={18}/> 3. Enviar Status ao Vivo</h3>
                          <p className="text-zinc-400 text-xs font-bold leading-relaxed">Dentro da ficha do veículo, localize a secção <b>Link de Acompanhamento</b>. Clique em <b>Enviar</b> para abrir o WhatsApp e enviar o portal privado ao cliente.</p>
                       </div>
                    </Card>

                    {/* Guia 4 */}
                    <Card className="overflow-hidden border-zinc-800 bg-zinc-900/50">
                       <div className="h-48 bg-zinc-950 flex flex-col items-center justify-center p-6 border-b border-zinc-800/50 relative overflow-hidden pointer-events-none">
                          <div className="absolute inset-0 bg-gradient-to-br from-zinc-600/5 to-transparent"></div>
                          <div className="w-full max-w-sm bg-black border border-zinc-800 rounded-xl p-4 shadow-2xl z-10 space-y-3">
                             <p className="text-[9px] font-black text-white uppercase italic">Orçamentos PDF</p>
                             <div className="grid grid-cols-2 gap-2">
                                <div className="h-8 bg-zinc-900 border border-zinc-800 rounded-lg"></div>
                                <div className="h-8 bg-zinc-900 border border-zinc-800 rounded-lg"></div>
                             </div>
                             <div className="h-10 w-full bg-orange-600 rounded-lg text-white flex items-center justify-center gap-1 mt-2"><Download size={12}/> <span className="text-[8px] font-black uppercase tracking-widest">Gerar Orçamento (PDF)</span></div>
                          </div>
                       </div>
                       <div className="p-6 space-y-3">
                          <h3 className="text-lg font-black text-white uppercase italic flex items-center gap-2"><FileText className="text-orange-500" size={18}/> 4. Gerar Orçamentos</h3>
                          <p className="text-zinc-400 text-xs font-bold leading-relaxed">Clique no menu <b>Orçamentos</b>. Digite os dados do carro e as avarias. O botão inferior gerará imediatamente um documento PDF oficial pronto para ser impresso ou enviado.</p>
                       </div>
                    </Card>
                 </div>
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
                               <option value="Sedan">Sedan</option>
                               <option value="hatch">hatch</option>
                               <option value="SUV">SUV</option>
                               <option value="Picape">Picape</option>
                               <option value="Moto">Moto</option>
                               <option value="Van/Utilitários">Van/Utilitários</option>
                            </select>
                         </div>
                         <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Localização (BOX)</label>
                            <select 
                               className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-600 transition-all"
                               value={newVehicle.location} 
                               onChange={e => setNewVehicle({...newVehicle, location: e.target.value})}
                            >
                               {["BOX 01", "BOX 02", "BOX 03", "BOX 04", "BOX 05", "BOX 06", "BOX 07", "BOX 08", "BOX 09", "BOX 10"]
                                 .filter(box => !activeVehiclesMemo.some(v => v.location === box))
                                 .map(box => (
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
                               let next;
                               if (current.includes(service)) {
                                 next = current.filter(s => s !== service);
                               } else {
                                 if (service === "Pintura completa") {
                                   next = [...serviceOptions];
                                 } else {
                                   next = [...current, service];
                                 }
                               }
                               setNewVehicle({...newVehicle, selectedServices: next});
                             }}
                             className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase text-left transition-all border ${newVehicle.selectedServices?.includes(service) ? 'bg-orange-600 border-orange-600 text-black italic shadow-lg shadow-orange-600/20' : 'bg-zinc-950 border-zinc-900 text-zinc-600 hover:text-white'}`}
                           >
                             {service}
                           </button>
                         ))}
                      </div>
                      <div className="space-y-2">
                         <div className="flex gap-2 items-end">
                            <Input label="Outro Serviço ou Peça Específica" placeholder="Descreva aqui..." value={newVehicle.customPieceText} onChange={e => setNewVehicle({...newVehicle, customPieceText: e.target.value})} />
                            <Button onClick={() => { if(newVehicle.customPieceText.trim()){ setNewVehicle(prev => ({ ...prev, customServicesList: [...(prev.customServicesList || []), prev.customPieceText.trim()], customPieceText: "" })); } }} className="h-9 mb-0.5 px-6">Inserir</Button>
                         </div>
                         <div className="flex flex-wrap gap-2">
                            {newVehicle.customServicesList?.map((s, i) => (
                               <div key={i} className="bg-zinc-800 text-zinc-300 border border-zinc-700 px-3 py-1 rounded-lg text-[8px] font-black uppercase flex items-center gap-2 animate-in fade-in">
                                  {s} <button type="button" onClick={() => setNewVehicle(prev => ({ ...prev, customServicesList: prev.customServicesList.filter((_, idx) => idx !== i) }))} className="text-zinc-500 hover:text-red-500 transition-colors"><X size={10}/></button>
                               </div>
                            ))}
                         </div>
                      </div>
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

                   <Button type="submit" className="w-full py-4 tracking-[0.3em] italic font-black text-sm uppercase">REGISTRAR ENTRADA</Button>
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
                              {item.label === "BOX" ? (
                                <select 
                                  className="bg-transparent font-bold uppercase text-[10px] text-orange-500 outline-none w-full appearance-none cursor-pointer"
                                  value={viewingVehicle.location}
                                  onChange={async (e) => {
                                    const val = e.target.value;
                                    const { error } = await supabase.from('autoprime_vehicles').update({ location: val }).eq('id', viewingVehicle.id);
                                    if (!error) {
                                      setViewingVehicle(prev => ({ ...prev, location: val }));
                                      setVehicles(prev => prev.map(v => v.id === viewingVehicle.id ? { ...v, location: val } : v));
                                      showNotification("Box atualizado!");
                                    }
                                  }}
                                >
                                  {["BOX 01", "BOX 02", "BOX 03", "BOX 04", "BOX 05", "BOX 06", "BOX 07", "BOX 08", "BOX 09", "BOX 10"]
                                    .filter(b => b === viewingVehicle.location || !activeVehiclesMemo.some(v => v.location === b))
                                    .map(b => (
                                      <option key={b} value={b} className="bg-zinc-900 text-white">{b}</option>
                                  ))}
                                </select>
                              ) : (
                                <p className={`font-bold uppercase text-[10px] truncate ${item.highlight ? 'text-orange-500 italic' : 'text-zinc-200'}`}>
                                  {item.value}
                                </p>
                              )}
                           </div>
                         ))}
                      </div>

                      {/* Seção: Data de Agendamento - REFORÇADO VISUALMENTE */}
                      <div className="p-6 bg-zinc-900 border-2 border-orange-600/50 rounded-3xl shadow-2xl shadow-orange-600/10 space-y-4">
                          <p className="text-[11px] font-black text-orange-500 uppercase tracking-[0.2em] flex items-center gap-2 italic leading-none">
                            <Calendar size={18} className="text-orange-600 animate-pulse"/> AGENDAMENTO DO VEÍCULO
                          </p>
                          <div className="flex gap-3">
                             <input 
                               type="date" 
                               className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-3 text-white text-[12px] font-black outline-none focus:border-orange-500 transition-all shadow-inner"
                               value={viewingVehicle.scheduled_date || ""}
                               onChange={(e) => setViewingVehicle(prev => ({ ...prev, scheduled_date: e.target.value }))}
                             />
                             <div className="flex flex-col gap-2">
                               <button 
                                 onClick={async () => {
                                   if (!viewingVehicle.scheduled_date) return showNotification("Selecione uma data", "danger");
                                   const upd = { 
                                      work_status: 'Agendados', 
                                      status: 'active', 
                                      current_stage: null, 
                                      scheduled_date: viewingVehicle.scheduled_date 
                                   };
                                   const { error } = await supabase.from('autoprime_vehicles').update(upd).eq('id', viewingVehicle.id);
                                   if (!error) {
                                     setVehicles(prev => prev.map(v => v.id === viewingVehicle.id ? { ...v, ...upd } : v));
                                     setViewingVehicle(prev => ({ ...prev, ...upd }));
                                     showNotification("Agendamento gravado!");
                                   } else {
                                     console.error(error);
                                     showNotification("Erro ao salvar agendamento!", "danger");
                                   }
                                 }}
                                 className="bg-orange-600 hover:bg-orange-700 text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase italic transition-all active:scale-95 whitespace-nowrap shadow-lg shadow-orange-600/30 flex items-center gap-2"
                               >
                                 <Save size={14}/> Gravar
                               </button>
                               {viewingVehicle.scheduled_date && (
                                 <button 
                                   onClick={async () => {
                                     const upd = { work_status: 'Aguardando Aprovação', scheduled_date: null };
                                     const { error = null } = await supabase.from('autoprime_vehicles').update(upd).eq('id', viewingVehicle.id);
                                     if (!error) {
                                       setVehicles(prev => prev.map(v => v.id === viewingVehicle.id ? { ...v, ...upd } : v));
                                       setViewingVehicle(prev => ({ ...prev, ...upd }));
                                       showNotification("Agendamento cancelado!");
                                     }
                                   }}
                                   className="text-zinc-600 hover:text-red-500 text-[8px] font-black uppercase tracking-widest transition-all text-center leading-none"
                                 >
                                   Cancelar Agenda
                                 </button>
                               )}
                             </div>
                          </div>
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
                            {['Aguardando Aprovação', 'Agendados', 'Em Produção', 'Concluído'].map(st => (
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
