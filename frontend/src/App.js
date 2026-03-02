import { useState, useEffect, useRef } from "react";

const C = {
  blue: "#1e90ff",
  blueDark: "#0066cc",
  blueLight: "#e8f4ff",
  blueMid: "#b3d9ff",
  sky: "#87ceeb",
  skyLight: "#f0f8ff",
  yellow: "#ffd700",
  yellowLight: "#fffbe6",
  yellowMid: "#ffe066",
  white: "#ffffff",
  offWhite: "#f7fbff",
  gray: "#6b7a99",
  grayLight: "#e8edf8",
  dark: "#1a2340",
  darkMid: "#2d3a5a",
  green: "#22c55e",
  red: "#ef4444",
  purple: "#7c3aed",
  purpleLight: "#ede9fe",
  gold: "#f59e0b",
};

const grad = {
  hero: "linear-gradient(135deg, #e8f4ff 0%, #fffbe6 50%, #f0f8ff 100%)",
  btn: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`,
  btnY: `linear-gradient(135deg, ${C.yellow}, ${C.gold})`,
  card: "linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%)",
  nav: "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(240,248,255,0.98))",
  pro: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
  proBtn: "linear-gradient(135deg, #7c3aed, #4f46e5)",
  skyBlue: `linear-gradient(135deg, ${C.blueLight}, ${C.skyLight})`,
  badge: `linear-gradient(135deg, ${C.blue}22, ${C.sky}22)`,
};

const legalTopics = ["Constitutional Law","Criminal Law (IPC)","Civil Law","Family Law","Property Law","Labour Law","Consumer Rights","RTI & PIL","Cyber Law","Traffic & Motor"];
const tips = [
  "Article 21 guarantees the Right to Life and Personal Liberty to every person in India.",
  "Under Section 41A CrPC, police must issue a notice before arresting for offenses under 7 years.",
  "You have the right to free legal aid under Article 39A of the Constitution.",
  "An FIR can be filed at any police station in India under Section 154 CrPC.",
  "Under RTI Act 2005, citizens can seek government information within 30 days.",
  "Section 498A IPC deals with cruelty by husband or his relatives towards wife.",
  "Consumer complaints can be filed online at the National Consumer Helpline portal.",
  "POCSO Act 2012 provides strong protection to children from sexual offences.",
];
const initialUsers = [
  { id:1, name:"Demo User", email:"demo@nyaymitra.in", password:"demo123", role:"common", pro:false, avatar:"DU", joined:"Jan 2025" },
  { id:2, name:"Adv. Priya Sharma", email:"priya@nyaymitra.in", password:"priya123", role:"professional", pro:true, avatar:"PS", joined:"Feb 2025" },
];

export default function NyayMitra() {
  const [page, setPage] = useState("landing");
  const [users, setUsers] = useState(initialUsers);
  const [currentUser, setCurrentUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("All Topics");
  const [history, setHistory] = useState([]);
  const [proInput, setProInput] = useState({ type:"", court:"", parties:"", charges:"", status:"" });
  const [proResult, setProResult] = useState("");
  const [proLoading, setProLoading] = useState(false);
  const [lang, setLang] = useState("English");
  const [responseStyle, setResponseStyle] = useState("simple");
  const [loginForm, setLoginForm] = useState({ email:"", password:"" });
  const [registerForm, setRegisterForm] = useState({ name:"", email:"", password:"", role:"common" });
  const [authError, setAuthError] = useState("");
  const [notification, setNotification] = useState("");
  const [tipIndex, setTipIndex] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [chatMessages]);
  useEffect(() => { const t = setInterval(() => setTipIndex(i => (i+1)%tips.length), 5000); return () => clearInterval(t); }, []);

  const showNotif = msg => { setNotification(msg); setTimeout(() => setNotification(""), 3000); };
  const nav = p => { setPage(p); setMobileMenu(false); };

  const handleLogin = () => {
    const u = users.find(u => u.email===loginForm.email && u.password===loginForm.password);
    if (u) { setCurrentUser(u); setAuthError(""); nav("dashboard"); showNotif(`Welcome back, ${u.name}! 👋`); }
    else setAuthError("Invalid email or password.");
  };

  const handleRegister = () => {
    if (!registerForm.name||!registerForm.email||!registerForm.password) { setAuthError("All fields required."); return; }
    if (users.find(u => u.email===registerForm.email)) { setAuthError("Email already registered."); return; }
    const newUser = { id:users.length+1, ...registerForm, pro:false, avatar:registerForm.name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2), joined:new Date().toLocaleDateString("en-IN",{month:"short",year:"numeric"}) };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setAuthError("");
    nav("dashboard");
    showNotif(`Welcome to NyayMitra, ${newUser.name}! 🎉`);
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role:"user", content:chatInput, time:new Date().toLocaleTimeString() };
    const msgs = [...chatMessages, userMsg];
    setChatMessages(msgs);
    setChatInput("");
    setChatLoading(true);
    try {
      const systemPrompt = `You are NyayMitra, an expert AI legal assistant specializing in Indian laws, Constitution, IPC, CrPC. Provide ${responseStyle==="simple"?"simple, citizen-friendly":"detailed professional"} answers. Respond in ${lang}. Always cite relevant sections and landmark judgments. Add disclaimer to consult a lawyer.`;
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system:systemPrompt, messages:msgs.map(m=>({role:m.role,content:m.content})) })
      });
      const data = await response.json();
      const reply = data.content?.map(b=>b.text||"").join("") || "Sorry, could not process your query.";
      const botMsg = { role:"assistant", content:reply, time:new Date().toLocaleTimeString() };
      const finalMsgs = [...msgs, botMsg];
      setChatMessages(finalMsgs);
      setHistory(h => [{ id:Date.now(), topic:selectedTopic, question:userMsg.content.slice(0,60)+"...", date:new Date().toLocaleDateString(), msgs:finalMsgs }, ...h]);
    } catch {
      setChatMessages([...msgs, { role:"assistant", content:"Connection error. Please try again.", time:new Date().toLocaleTimeString() }]);
    }
    setChatLoading(false);
  };

  const analyzeCase = async () => {
    if (!proInput.type) return;
    setProLoading(true); setProResult("");
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000,
          messages:[{ role:"user", content:`You are a senior Indian legal strategist. Case: Type: ${proInput.type}, Court: ${proInput.court}, Parties: ${proInput.parties}, Charges: ${proInput.charges}, Status: ${proInput.status}. Provide comprehensive strategy, loopholes, relevant sections, landmark precedents, and step-by-step action plan.` }] })
      });
      const data = await response.json();
      setProResult(data.content?.map(b=>b.text||"").join("") || "Unable to analyze.");
    } catch { setProResult("Connection error. Please try again."); }
    setProLoading(false);
  };

  const logout = () => { setCurrentUser(null); setChatMessages([]); setHistory([]); nav("landing"); showNotif("Logged out successfully."); };

  const renderMd = text => {
    if (!text) return null;
    return text.split("\n").map((line,i) => {
      let el = line.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\*(.*?)\*/g,"<em>$1</em>");
      if (line.startsWith("# ")) return <h2 key={i} style={{color:C.blueDark,margin:"12px 0 6px"}} dangerouslySetInnerHTML={{__html:el.replace("# ","")}} />;
      if (line.startsWith("## ")) return <h3 key={i} style={{color:C.blue,margin:"10px 0 4px"}} dangerouslySetInnerHTML={{__html:el.replace("## ","")}} />;
      if (line.startsWith("- ")||line.startsWith("• ")) return <div key={i} style={{paddingLeft:16,marginBottom:4,color:C.dark}} dangerouslySetInnerHTML={{__html:"• "+el.replace(/^[-•] /,"")}} />;
      if (line.match(/^\d+\./)) return <div key={i} style={{paddingLeft:16,marginBottom:4,color:C.dark}} dangerouslySetInnerHTML={{__html:el}} />;
      if (!line.trim()) return <br key={i}/>;
      return <p key={i} style={{margin:"4px 0",color:C.dark}} dangerouslySetInnerHTML={{__html:el}} />;
    });
  };

  // Styles
  const s = {
    app: { minHeight:"100vh", background:C.offWhite, color:C.dark, fontFamily:"'Segoe UI',sans-serif" },
    navbar: { background:grad.nav, borderBottom:`1px solid ${C.blueMid}`, padding:"0 28px", display:"flex", alignItems:"center", justifyContent:"space-between", height:65, position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 20px rgba(30,144,255,0.1)", backdropFilter:"blur(12px)" },
    logo: { display:"flex", alignItems:"center", gap:10, cursor:"pointer" },
    logoText: { fontSize:24, fontWeight:900, background:`linear-gradient(135deg, ${C.blue}, ${C.blueDark})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" },
    navBtn: { background:"none", border:"none", color:C.gray, cursor:"pointer", padding:"8px 14px", borderRadius:8, fontSize:13, fontWeight:600, transition:"all 0.2s" },
    navBtnActive: { background:C.blueLight, color:C.blue, borderBottom:`2px solid ${C.blue}` },
    btn: { padding:"10px 22px", borderRadius:10, border:"none", cursor:"pointer", fontWeight:700, fontSize:14, transition:"all 0.2s" },
    btnPrimary: { background:grad.btn, color:"#fff", boxShadow:`0 4px 15px ${C.blue}44` },
    btnYellow: { background:grad.btnY, color:C.dark, boxShadow:`0 4px 15px ${C.yellow}66` },
    btnOutline: { background:"none", border:`2px solid ${C.blue}`, color:C.blue },
    btnPro: { background:grad.proBtn, color:"#fff", boxShadow:"0 4px 15px #7c3aed44" },
    btnRed: { background:`${C.red}11`, border:`1px solid ${C.red}33`, color:C.red },
    card: { background:"#fff", border:`1px solid ${C.blueMid}`, borderRadius:16, padding:24, boxShadow:"0 4px 20px rgba(30,144,255,0.07)" },
    cardGrad: { background:grad.card, border:`1px solid ${C.blueMid}`, borderRadius:16, padding:24, boxShadow:"0 4px 20px rgba(30,144,255,0.1)" },
    input: { width:"100%", padding:"11px 15px", borderRadius:10, border:`1.5px solid ${C.blueMid}`, background:"#fff", color:C.dark, fontSize:14, outline:"none", boxSizing:"border-box", transition:"border 0.2s" },
    page: { maxWidth:1100, margin:"0 auto", padding:"32px 20px" },
    badge: { padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:700 },
    notif: { position:"fixed", top:75, right:20, background:grad.btn, color:"#fff", padding:"12px 22px", borderRadius:12, zIndex:999, fontWeight:700, boxShadow:"0 6px 25px rgba(30,144,255,0.4)", display:"flex", alignItems:"center", gap:8 },
    section: { maxWidth:1100, margin:"0 auto", padding:"0 20px" },
  };

  const navItems = currentUser ? [
    {label:"Dashboard",page:"dashboard",icon:"🏠"},
    {label:"Chat",page:"chat",icon:"💬"},
    {label:"Pro",page:"pro",icon:"🔐"},
    {label:"History",page:"history",icon:"📜"},
    {label:"Profile",page:"profile",icon:"👤"},
    {label:"About",page:"about",icon:"ℹ️"},
    {label:"Customize",page:"customize",icon:"⚙️"},
  ] : [];

  const pages = {

    landing: (
      <div>
        {/* Floating shapes */}
        <div style={{position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-60,right:-60,width:300,height:300,borderRadius:"50%",background:`radial-gradient(circle, ${C.blueLight}, transparent)`,zIndex:0,pointerEvents:"none"}} />
          <div style={{position:"absolute",top:100,left:-80,width:200,height:200,borderRadius:"50%",background:`radial-gradient(circle, ${C.yellowLight}, transparent)`,zIndex:0,pointerEvents:"none"}} />

          {/* Hero */}
          <div style={{background:grad.hero,padding:"90px 20px 70px",textAlign:"center",position:"relative",zIndex:1}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"#fff",border:`1.5px solid ${C.blueMid}`,borderRadius:20,padding:"6px 18px",marginBottom:24,fontSize:13,color:C.blue,fontWeight:600,boxShadow:`0 2px 12px ${C.blue}22`}}>
              ⚖️ India's First AI Legal Assistant
            </div>
            <h1 style={{fontSize:60,fontWeight:900,margin:"0 0 8px",lineHeight:1.1,color:C.dark}}>
              Nyay<span style={{background:grad.btn,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Mitra</span>
            </h1>
            <p style={{fontSize:18,color:C.gray,marginBottom:6,fontWeight:500}}>न्याय मित्र — Your Trusted AI Justice Friend</p>
            <p style={{fontSize:16,color:C.gray,maxWidth:520,margin:"0 auto 36px",lineHeight:1.7}}>
              Instant answers on Indian Laws, Constitution, IPC, CrPC & more.<br/>For every citizen and legal professional.
            </p>
            <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
              <button style={{...s.btn,...s.btnPrimary,fontSize:16,padding:"14px 36px"}} onClick={()=>nav("register")}>Get Started Free →</button>
              <button style={{...s.btn,...s.btnOutline,fontSize:16,padding:"14px 36px"}} onClick={()=>nav("login")}>Login</button>
            </div>

            {/* Stats */}
            <div style={{display:"flex",gap:32,justifyContent:"center",marginTop:48,flexWrap:"wrap"}}>
              {[["10+","Legal Acts Covered"],["AI","Powered Answers"],["Free","Forever Plan"],["Pro","Case Strategy"]].map(([v,l],i)=>(
                <div key={i} style={{textAlign:"center"}}>
                  <div style={{fontSize:28,fontWeight:900,color:C.blue}}>{v}</div>
                  <div style={{fontSize:12,color:C.gray,fontWeight:500}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div style={{...s.section,padding:"60px 20px"}}>
          <div style={{textAlign:"center",marginBottom:44}}>
            <h2 style={{fontSize:36,fontWeight:800,color:C.dark,marginBottom:8}}>Why <span style={{color:C.blue}}>NyayMitra?</span></h2>
            <p style={{color:C.gray,fontSize:16}}>Everything you need for Indian legal guidance</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20}}>
            {[
              {icon:"🤖",title:"AI-Powered Chat",desc:"Ask any question about Indian law and get instant, accurate answers with cited sections.",color:C.blue},
              {icon:"⚖️",title:"All Laws Covered",desc:"IPC, CrPC, CPC, Constitution, Evidence Act, RTI, Consumer Protection & more.",color:C.gold},
              {icon:"🔐",title:"Pro Case Strategy",desc:"Personal legal strategies, loopholes & precedents for your ongoing court cases.",color:C.purple},
              {icon:"🌐",title:"Multi-Language",desc:"Get legal information in English and Hindi for wider accessibility across India.",color:C.green},
              {icon:"📜",title:"Chat History",desc:"Save and revisit all your legal consultations anytime, anywhere.",color:C.blue},
              {icon:"👤",title:"Role-Based Access",desc:"Tailored experience for common citizens, law students & legal professionals.",color:C.gold},
            ].map((f,i)=>(
              <div key={i} style={{...s.cardGrad,textAlign:"center",transition:"transform 0.2s",cursor:"default"}}>
                <div style={{width:56,height:56,borderRadius:14,background:`${f.color}15`,border:`1.5px solid ${f.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,margin:"0 auto 14px"}}>{f.icon}</div>
                <h3 style={{color:C.dark,marginBottom:8,fontWeight:700}}>{f.title}</h3>
                <p style={{color:C.gray,fontSize:14,lineHeight:1.7}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tip Ticker */}
        <div style={{background:`linear-gradient(135deg, ${C.blueLight}, ${C.yellowLight})`,padding:"20px 28px",borderTop:`1px solid ${C.blueMid}`,borderBottom:`1px solid ${C.blueMid}`}}>
          <div style={{maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",gap:12}}>
            <span style={{background:grad.btn,color:"#fff",padding:"4px 12px",borderRadius:8,fontSize:12,fontWeight:700,whiteSpace:"nowrap"}}>💡 Legal Tip</span>
            <span style={{color:C.dark,fontSize:14,fontWeight:500}}>{tips[tipIndex]}</span>
          </div>
        </div>

        {/* How it works */}
        <div style={{...s.section,padding:"60px 20px"}}>
          <div style={{textAlign:"center",marginBottom:44}}>
            <h2 style={{fontSize:36,fontWeight:800,color:C.dark,marginBottom:8}}>How It <span style={{color:C.blue}}>Works</span></h2>
          </div>
          <div style={{display:"flex",gap:0,justifyContent:"center",flexWrap:"wrap"}}>
            {[
              {step:"01",title:"Register Free",desc:"Create your account in 30 seconds",icon:"📝"},
              {step:"02",title:"Ask Your Question",desc:"Type any legal question in plain language",icon:"💬"},
              {step:"03",title:"Get AI Answer",desc:"Receive cited, accurate legal information",icon:"⚖️"},
              {step:"04",title:"Upgrade to Pro",desc:"Unlock personal case strategy room",icon:"🔐"},
            ].map((s2,i)=>(
              <div key={i} style={{flex:"1 1 200px",textAlign:"center",padding:"20px 16px",position:"relative"}}>
                <div style={{width:60,height:60,borderRadius:"50%",background:grad.btn,color:"#fff",fontWeight:900,fontSize:20,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",boxShadow:`0 4px 15px ${C.blue}44`}}>{s2.step}</div>
                <div style={{fontSize:26,marginBottom:8}}>{s2.icon}</div>
                <h4 style={{color:C.dark,marginBottom:6,fontWeight:700}}>{s2.title}</h4>
                <p style={{color:C.gray,fontSize:13}}>{s2.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div style={{background:`linear-gradient(135deg, ${C.blue}, ${C.blueDark})`,padding:"60px 20px",textAlign:"center"}}>
          <h2 style={{fontSize:34,fontWeight:900,color:"#fff",marginBottom:12}}>Know Your Rights. Fight for Justice.</h2>
          <p style={{color:C.blueMid,marginBottom:28,fontSize:16}}>Join thousands of Indians using NyayMitra for legal guidance.</p>
          <button style={{...s.btn,...s.btnYellow,fontSize:16,padding:"14px 40px"}} onClick={()=>nav("register")}>Start for Free — No Credit Card →</button>
        </div>
      </div>
    ),

    login: (
      <div style={{...s.page,maxWidth:440}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:72,height:72,borderRadius:20,background:grad.skyBlue,border:`2px solid ${C.blueMid}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,margin:"0 auto 16px",boxShadow:`0 4px 20px ${C.blue}22`}}>⚖️</div>
          <h2 style={{fontSize:28,fontWeight:800,color:C.dark,marginBottom:4}}>Welcome Back</h2>
          <p style={{color:C.gray}}>Login to your NyayMitra account</p>
        </div>
        <div style={s.card}>
          {authError && <div style={{background:`${C.red}11`,border:`1px solid ${C.red}33`,color:C.red,padding:"10px 14px",borderRadius:10,marginBottom:16,fontSize:13,fontWeight:600}}>⚠️ {authError}</div>}
          {[{label:"Email Address",key:"email",type:"text",ph:"you@email.com"},{label:"Password",key:"password",type:"password",ph:"••••••••"}].map(f=>(
            <div key={f.key} style={{marginBottom:16}}>
              <label style={{fontSize:13,color:C.gray,display:"block",marginBottom:6,fontWeight:600}}>{f.label}</label>
              <input style={s.input} type={f.type} placeholder={f.ph} value={loginForm[f.key]} onChange={e=>setLoginForm({...loginForm,[f.key]:e.target.value})} onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
            </div>
          ))}
          <button style={{...s.btn,...s.btnPrimary,width:"100%",fontSize:15,padding:"13px",marginTop:4}} onClick={handleLogin}>Login to NyayMitra →</button>
          <p style={{textAlign:"center",fontSize:13,color:C.gray,marginTop:16}}>No account? <span style={{color:C.blue,cursor:"pointer",fontWeight:700}} onClick={()=>{setAuthError("");nav("register");}}>Register free</span></p>
          <div style={{marginTop:16,padding:14,background:C.blueLight,borderRadius:10,fontSize:12,color:C.gray,border:`1px solid ${C.blueMid}`}}>
            <strong style={{color:C.blue}}>Demo Login:</strong> demo@nyaymitra.in / demo123<br/>
            <strong style={{color:C.purple}}>Pro Login:</strong> priya@nyaymitra.in / priya123
          </div>
        </div>
      </div>
    ),

    register: (
      <div style={{...s.page,maxWidth:460}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:72,height:72,borderRadius:20,background:grad.skyBlue,border:`2px solid ${C.blueMid}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,margin:"0 auto 16px",boxShadow:`0 4px 20px ${C.blue}22`}}>⚖️</div>
          <h2 style={{fontSize:28,fontWeight:800,color:C.dark,marginBottom:4}}>Join NyayMitra</h2>
          <p style={{color:C.gray}}>Create your free account today</p>
        </div>
        <div style={s.card}>
          {authError && <div style={{background:`${C.red}11`,border:`1px solid ${C.red}33`,color:C.red,padding:"10px 14px",borderRadius:10,marginBottom:16,fontSize:13,fontWeight:600}}>⚠️ {authError}</div>}
          {[{label:"Full Name",key:"name",type:"text",ph:"Rahul Kumar"},{label:"Email Address",key:"email",type:"email",ph:"you@email.com"},{label:"Password",key:"password",type:"password",ph:"Create a password"}].map(f=>(
            <div key={f.key} style={{marginBottom:14}}>
              <label style={{fontSize:13,color:C.gray,display:"block",marginBottom:6,fontWeight:600}}>{f.label}</label>
              <input style={s.input} type={f.type} placeholder={f.ph} value={registerForm[f.key]} onChange={e=>setRegisterForm({...registerForm,[f.key]:e.target.value})} />
            </div>
          ))}
          <div style={{marginBottom:20}}>
            <label style={{fontSize:13,color:C.gray,display:"block",marginBottom:6,fontWeight:600}}>I am a</label>
            <select style={{...s.input}} value={registerForm.role} onChange={e=>setRegisterForm({...registerForm,role:e.target.value})}>
              <option value="common">👤 Common Citizen</option>
              <option value="professional">⚖️ Legal Professional (Advocate/Lawyer)</option>
              <option value="student">📚 Law Student</option>
            </select>
          </div>
          <button style={{...s.btn,...s.btnPrimary,width:"100%",fontSize:15,padding:13}} onClick={handleRegister}>Create Free Account →</button>
          <p style={{textAlign:"center",fontSize:13,color:C.gray,marginTop:16}}>Already have an account? <span style={{color:C.blue,cursor:"pointer",fontWeight:700}} onClick={()=>{setAuthError("");nav("login");}}>Login here</span></p>
        </div>
      </div>
    ),

    dashboard: currentUser && (
      <div style={s.page}>
        {/* Header */}
        <div style={{background:`linear-gradient(135deg, ${C.blueLight}, ${C.yellowLight})`,borderRadius:20,padding:"28px 32px",marginBottom:28,border:`1.5px solid ${C.blueMid}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
          <div>
            <h1 style={{fontSize:26,fontWeight:800,color:C.dark,marginBottom:4}}>Welcome back, <span style={{color:C.blue}}>{currentUser.name}</span> 👋</h1>
            <p style={{color:C.gray,fontSize:14}}>Your legal dashboard — {new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:52,height:52,borderRadius:"50%",background:grad.btn,color:"#fff",fontWeight:800,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 15px ${C.blue}44`}}>{currentUser.avatar}</div>
            {currentUser.pro && <span style={{...s.badge,background:grad.proBtn,color:"#fff"}}>🔐 PRO</span>}
          </div>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16,marginBottom:28}}>
          {[
            {icon:"💬",label:"Total Chats",value:history.length,color:C.blue},
            {icon:"📚",label:"Topics Explored",value:new Set(history.map(h=>h.topic)).size||0,color:C.gold},
            {icon:"🔐",label:"Account Type",value:currentUser.pro?"Pro":"Free",color:C.purple},
            {icon:"📅",label:"Member Since",value:currentUser.joined,color:C.green},
          ].map((st,i)=>(
            <div key={i} style={{...s.cardGrad,textAlign:"center"}}>
              <div style={{width:44,height:44,borderRadius:12,background:`${st.color}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,margin:"0 auto 10px"}}>{st.icon}</div>
              <div style={{fontSize:22,fontWeight:800,color:st.color,marginBottom:2}}>{st.value}</div>
              <div style={{fontSize:12,color:C.gray,fontWeight:500}}>{st.label}</div>
            </div>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          {/* Quick Actions */}
          <div style={s.card}>
            <h3 style={{color:C.dark,marginBottom:16,fontWeight:700}}>⚡ Quick Actions</h3>
            {[
              {icon:"💬",label:"Start New Chat",sub:"Ask a legal question",action:()=>{setChatMessages([]);nav("chat");}},
              {icon:"📜",label:"View History",sub:"Past conversations",action:()=>nav("history")},
              {icon:"🔐",label:"Case Strategy Room",sub:"Pro AI analysis",action:()=>nav("pro")},
              {icon:"⚙️",label:"Customize",sub:"Theme & preferences",action:()=>nav("customize")},
            ].map((a,i)=>(
              <div key={i} onClick={a.action} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",borderRadius:12,cursor:"pointer",marginBottom:8,background:C.blueLight,border:`1px solid ${C.blueMid}`,transition:"all 0.2s"}}>
                <span style={{fontSize:22}}>{a.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:14,color:C.dark}}>{a.label}</div>
                  <div style={{fontSize:12,color:C.gray}}>{a.sub}</div>
                </div>
                <span style={{color:C.blue,fontWeight:700}}>→</span>
              </div>
            ))}
          </div>

          <div>
            {/* Tip */}
            <div style={{...s.card,marginBottom:16,background:`linear-gradient(135deg, ${C.yellowLight}, #fff)`,borderColor:`${C.gold}44`}}>
              <h4 style={{color:C.gold,marginBottom:8,fontWeight:700}}>💡 Legal Tip of the Day</h4>
              <p style={{fontSize:14,lineHeight:1.7,color:C.dark}}>{tips[tipIndex]}</p>
            </div>
            {/* Pro Upgrade */}
            {!currentUser.pro && (
              <div style={{...s.card,background:grad.pro,borderColor:"#c4b5fd",padding:20}}>
                <h4 style={{color:C.purple,marginBottom:8,fontWeight:700}}>🚀 Upgrade to Pro</h4>
                <p style={{fontSize:13,color:"#5b21b6",marginBottom:14,lineHeight:1.6}}>Unlock Case Strategy Room, personal loophole analysis & priority AI responses.</p>
                <button style={{...s.btn,...s.btnPro,fontSize:13,padding:"8px 18px"}} onClick={()=>nav("pro")}>Explore Pro Features →</button>
              </div>
            )}
          </div>
        </div>
      </div>
    ),

    chat: (
      <div style={{...s.page,maxWidth:820}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
          <div>
            <h2 style={{color:C.blue,fontWeight:800,marginBottom:4}}>⚖️ Legal Chat</h2>
            <p style={{color:C.gray,fontSize:13}}>Ask anything about Indian laws & Constitution</p>
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
            <select style={{...s.input,width:"auto"}} value={selectedTopic} onChange={e=>setSelectedTopic(e.target.value)}>
              <option>All Topics</option>
              {legalTopics.map(t=><option key={t}>{t}</option>)}
            </select>
            <button style={{...s.btn,...s.btnPrimary,padding:"9px 16px",fontSize:13}} onClick={()=>{setChatMessages([]);setSelectedTopic("All Topics");showNotif("✏️ New chat started!");}}>✏️ New Chat</button>
          </div>
        </div>

        {/* Chat window */}
        <div style={{...s.card,height:430,overflowY:"auto",marginBottom:14,display:"flex",flexDirection:"column",gap:14,background:C.offWhite}}>
          {chatMessages.length===0 && (
            <div style={{textAlign:"center",margin:"auto",color:C.gray}}>
              <div style={{width:72,height:72,borderRadius:20,background:grad.skyBlue,border:`2px solid ${C.blueMid}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 14px"}}>⚖️</div>
              <p style={{fontWeight:700,color:C.dark,marginBottom:6}}>Ask NyayMitra anything about Indian Law</p>
              <p style={{fontSize:13,marginBottom:16}}>I can help with IPC, CrPC, Constitution, Consumer Rights & more</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center"}}>
                {["What are my fundamental rights?","Explain Section 498A IPC","How to file an FIR?","What is anticipatory bail?","How to file RTI?"].map(q=>(
                  <span key={q} onClick={()=>setChatInput(q)} style={{background:"#fff",border:`1.5px solid ${C.blueMid}`,borderRadius:20,padding:"7px 16px",fontSize:12,cursor:"pointer",color:C.blue,fontWeight:600}}>{q}</span>
                ))}
              </div>
            </div>
          )}
          {chatMessages.map((m,i)=>(
            <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",gap:10,alignItems:"flex-end"}}>
              {m.role==="assistant" && <div style={{width:32,height:32,borderRadius:10,background:grad.btn,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>⚖️</div>}
              <div style={{maxWidth:"80%",padding:"12px 16px",borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",background:m.role==="user"?grad.btn:"#fff",color:m.role==="user"?"#fff":C.dark,fontSize:14,lineHeight:1.7,border:m.role==="assistant"?`1px solid ${C.blueMid}`:"none",boxShadow:m.role==="assistant"?`0 2px 10px ${C.blue}11`:`0 2px 10px ${C.blue}33`}}>
                {m.role==="assistant"?renderMd(m.content):m.content}
                <div style={{fontSize:11,opacity:0.6,marginTop:6,textAlign:"right"}}>{m.time}</div>
              </div>
              {m.role==="user" && <div style={{width:32,height:32,borderRadius:10,background:grad.btnY,color:C.dark,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,fontWeight:700}}>{currentUser?.avatar||"U"}</div>}
            </div>
          ))}
          {chatLoading && (
            <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
              <div style={{width:32,height:32,borderRadius:10,background:grad.btn,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>⚖️</div>
              <div style={{padding:"12px 16px",borderRadius:"18px 18px 18px 4px",background:"#fff",border:`1px solid ${C.blueMid}`,fontSize:14,color:C.gray}}>⚖️ NyayMitra is thinking...</div>
            </div>
          )}
          <div ref={chatEndRef}/>
        </div>

        <div style={{display:"flex",gap:10}}>
          <input style={{...s.input,flex:1,fontSize:15}} placeholder="Ask about any Indian law, rights, procedures..." value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!chatLoading&&sendChat()} />
          <button style={{...s.btn,...s.btnPrimary,padding:"11px 24px"}} onClick={sendChat} disabled={chatLoading}>Send →</button>
        </div>
        <p style={{fontSize:11,color:C.gray,marginTop:8}}>⚠️ For informational purposes only. Consult a qualified lawyer for legal advice.</p>
      </div>
    ),

    pro: (
      <div style={s.page}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:28,flexWrap:"wrap"}}>
          <div style={{width:56,height:56,borderRadius:16,background:grad.pro,border:"1.5px solid #c4b5fd",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>🔐</div>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
              <h2 style={{color:C.purple,fontWeight:800}}>Case Strategy Room</h2>
              <span style={{...s.badge,background:grad.proBtn,color:"#fff"}}>PRO</span>
            </div>
            <p style={{color:C.gray,fontSize:13}}>AI-powered personal legal strategy for your ongoing court cases</p>
          </div>
        </div>

        {!currentUser?.pro ? (
          <div style={{...s.card,background:grad.pro,borderColor:"#c4b5fd",textAlign:"center",padding:48}}>
            <div style={{fontSize:52,marginBottom:16}}>🚀</div>
            <h3 style={{color:C.purple,marginBottom:10,fontSize:24,fontWeight:800}}>Unlock Pro Features</h3>
            <p style={{color:"#5b21b6",marginBottom:20,maxWidth:440,margin:"0 auto 20px",lineHeight:1.7}}>Get personal case strategies, legal loopholes, landmark precedents & step-by-step action plans for your ongoing cases.</p>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",marginBottom:24}}>
              {["Personal Strategy","Legal Loopholes","Precedent Cases","Weakness Analysis","Action Plans"].map(f=>(
                <span key={f} style={{background:"#fff",border:"1px solid #c4b5fd",color:C.purple,padding:"5px 14px",borderRadius:20,fontSize:12,fontWeight:600}}>✓ {f}</span>
              ))}
            </div>
            <button style={{...s.btn,...s.btnPro,fontSize:15,padding:"13px 36px"}} onClick={()=>{setCurrentUser({...currentUser,pro:true});showNotif("🎉 Pro unlocked! Welcome to Case Strategy Room.");}}>
              Activate Pro (Demo) →
            </button>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
            <div style={s.card}>
              <h3 style={{color:C.dark,marginBottom:20,fontWeight:700}}>📋 Enter Your Case Details</h3>
              {[
                {label:"Case Type",key:"type",ph:"e.g., Criminal, Civil, Family, Property..."},
                {label:"Court Level",key:"court",ph:"e.g., District Court, High Court, Supreme Court"},
                {label:"Parties Involved",key:"parties",ph:"e.g., Petitioner vs Respondent"},
                {label:"Charges / Claims",key:"charges",ph:"e.g., Section 302 IPC, Property dispute..."},
                {label:"Current Status",key:"status",ph:"e.g., Next hearing on 15 March, Bail pending..."},
              ].map(f=>(
                <div key={f.key} style={{marginBottom:14}}>
                  <label style={{fontSize:13,color:C.gray,display:"block",marginBottom:6,fontWeight:600}}>{f.label}</label>
                  <input style={s.input} placeholder={f.ph} value={proInput[f.key]} onChange={e=>setProInput({...proInput,[f.key]:e.target.value})} />
                </div>
              ))}
              <button style={{...s.btn,...s.btnPro,width:"100%",fontSize:15,padding:13}} onClick={analyzeCase} disabled={proLoading}>
                {proLoading?"⏳ Analyzing your case...":"🔍 Analyze My Case →"}
              </button>
            </div>
            <div style={s.card}>
              <h3 style={{color:C.dark,marginBottom:16,fontWeight:700}}>⚖️ Strategy Analysis</h3>
              {!proResult&&!proLoading && (
                <div style={{textAlign:"center",color:C.gray,marginTop:60}}>
                  <div style={{fontSize:48,marginBottom:12}}>🔐</div>
                  <p style={{fontWeight:600,color:C.dark,marginBottom:6}}>Ready to Analyze</p>
                  <p style={{fontSize:13}}>Fill in your case details and click Analyze to get your personalized legal strategy.</p>
                </div>
              )}
              {proLoading && (
                <div style={{textAlign:"center",color:C.gray,marginTop:60}}>
                  <div style={{fontSize:40,marginBottom:12}}>⚖️</div>
                  <p style={{fontWeight:600,color:C.dark}}>Analyzing your case...</p>
                  <p style={{fontSize:13}}>Identifying loopholes & building strategy</p>
                </div>
              )}
              {proResult && (
                <div style={{fontSize:14,lineHeight:1.8,overflowY:"auto",maxHeight:380}}>
                  {renderMd(proResult)}
                  <div style={{marginTop:16,padding:12,background:`${C.red}08`,border:`1px solid ${C.red}22`,borderRadius:10,fontSize:12,color:C.red}}>
                    ⚠️ For informational purposes only. Please consult a qualified advocate for legal representation.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    ),

    history: (
      <div style={s.page}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:12}}>
          <div>
            <h2 style={{color:C.blue,fontWeight:800,marginBottom:4}}>📜 Chat History</h2>
            <p style={{color:C.gray,fontSize:13}}>{history.length} conversation{history.length!==1?"s":""} saved</p>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button style={{...s.btn,...s.btnPrimary,fontSize:13,padding:"9px 18px"}} onClick={()=>{setChatMessages([]);nav("chat");}}>✏️ New Chat</button>
            {history.length>0 && <button style={{...s.btn,...s.btnRed,fontSize:13,padding:"9px 18px"}} onClick={()=>{if(window.confirm("Delete all history?")){setHistory([]);showNotif("🗑️ All history cleared.");}}}>🗑️ Clear All</button>}
          </div>
        </div>
        {history.length===0 ? (
          <div style={{...s.card,textAlign:"center",padding:60,background:C.blueLight}}>
            <div style={{fontSize:52,marginBottom:14}}>📭</div>
            <h3 style={{color:C.dark,marginBottom:8}}>No conversations yet</h3>
            <p style={{color:C.gray,marginBottom:20}}>Start chatting to see your history here</p>
            <button style={{...s.btn,...s.btnPrimary}} onClick={()=>{setChatMessages([]);nav("chat");}}>✏️ Start New Chat</button>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {history.map(h=>(
              <div key={h.id} style={{...s.cardGrad,display:"flex",alignItems:"center",gap:16}}>
                <div style={{width:44,height:44,borderRadius:12,background:C.blueLight,border:`1.5px solid ${C.blueMid}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>💬</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,color:C.dark,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.question}</div>
                  <div style={{fontSize:12,color:C.gray}}><span style={{background:C.blueLight,color:C.blue,padding:"2px 8px",borderRadius:6,fontWeight:600,marginRight:8}}>{h.topic}</span>{h.date} · {h.msgs.length} messages</div>
                </div>
                <button style={{...s.btn,...s.btnOutline,padding:"7px 16px",fontSize:13,flexShrink:0}} onClick={()=>{setChatMessages(h.msgs);nav("chat");}}>Resume →</button>
                <button style={{...s.btn,...s.btnRed,padding:"7px 14px",fontSize:13,flexShrink:0}} onClick={()=>{setHistory(prev=>prev.filter(x=>x.id!==h.id));showNotif("🗑️ Chat deleted.");}}>🗑️</button>
              </div>
            ))}
          </div>
        )}
      </div>
    ),

    profile: currentUser && (
      <div style={{...s.page,maxWidth:620}}>
        <h2 style={{color:C.blue,fontWeight:800,marginBottom:24}}>👤 My Profile</h2>
        <div style={{...s.card,marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:20,paddingBottom:24,borderBottom:`1.5px solid ${C.grayLight}`,marginBottom:24}}>
            <div style={{width:80,height:80,borderRadius:"50%",background:grad.btn,color:"#fff",fontWeight:900,fontSize:28,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 20px ${C.blue}44`}}>{currentUser.avatar}</div>
            <div>
              <h3 style={{fontSize:22,fontWeight:800,color:C.dark,marginBottom:4}}>{currentUser.name}</h3>
              <p style={{color:C.gray,fontSize:14,marginBottom:8}}>{currentUser.email}</p>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <span style={{...s.badge,background:C.blueLight,color:C.blue,border:`1px solid ${C.blueMid}`}}>
                  {currentUser.role==="professional"?"⚖️ Legal Professional":currentUser.role==="student"?"📚 Law Student":"👤 Common Citizen"}
                </span>
                {currentUser.pro && <span style={{...s.badge,background:grad.proBtn,color:"#fff"}}>🔐 PRO Member</span>}
              </div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[
              {label:"Member Since",value:currentUser.joined,icon:"📅"},
              {label:"Total Chats",value:history.length,icon:"💬"},
              {label:"Topics Explored",value:new Set(history.map(h=>h.topic)).size||0,icon:"📚"},
              {label:"Account Status",value:currentUser.pro?"Pro Member":"Free Plan",icon:"🔐"},
            ].map((f,i)=>(
              <div key={i} style={{background:C.blueLight,padding:"16px 18px",borderRadius:12,border:`1px solid ${C.blueMid}`}}>
                <div style={{fontSize:20,marginBottom:6}}>{f.icon}</div>
                <div style={{fontSize:11,color:C.gray,marginBottom:4,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px"}}>{f.label}</div>
                <div style={{fontWeight:700,color:C.blue,fontSize:15}}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),

    about: (
      <div style={s.page}>
        <div style={{maxWidth:720,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:44}}>
            <div style={{width:88,height:88,borderRadius:24,background:grad.skyBlue,border:`2px solid ${C.blueMid}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:42,margin:"0 auto 20px",boxShadow:`0 6px 30px ${C.blue}22`}}>⚖️</div>
            <h1 style={{fontSize:38,fontWeight:900,color:C.dark,marginBottom:8}}>About <span style={{color:C.blue}}>NyayMitra</span></h1>
            <p style={{color:C.gray,fontSize:16}}>न्याय मित्र — Your Trusted AI Justice Friend</p>
          </div>
          <div style={{...s.card,marginBottom:20}}>
            <h3 style={{color:C.blue,marginBottom:12,fontWeight:700}}>What is NyayMitra?</h3>
            <p style={{color:C.dark,lineHeight:1.8,fontSize:15}}>NyayMitra is an AI-powered legal assistant designed specifically for Indian citizens and legal professionals. It provides instant, accurate information about Indian laws, the Constitution, IPC, CrPC, and more — in simple language for common citizens and detailed analysis for professionals.</p>
          </div>
          <div style={{...s.card,marginBottom:20}}>
            <h3 style={{color:C.blue,marginBottom:14,fontWeight:700}}>📚 Legal Coverage</h3>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {["Indian Constitution","IPC 1860","CrPC 1973","CPC 1908","Evidence Act","RTI Act 2005","Consumer Protection","IT Act 2000","POCSO Act","Labour Laws","Property Law","Family Law","Motor Vehicles Act","Negotiable Instruments Act"].map(l=>(
                <span key={l} style={{background:C.blueLight,border:`1px solid ${C.blueMid}`,borderRadius:20,padding:"5px 14px",fontSize:12,color:C.blue,fontWeight:600}}>{l}</span>
              ))}
            </div>
          </div>
          <div style={{...s.card,background:"#fff5f5",borderColor:`${C.red}22`}}>
            <h3 style={{color:C.red,marginBottom:10,fontWeight:700}}>⚠️ Important Disclaimer</h3>
            <p style={{color:"#7f1d1d",fontSize:14,lineHeight:1.8}}>NyayMitra provides legal information for educational purposes only. The AI responses do not constitute legal advice. For any legal matter, always consult a qualified advocate or lawyer. The accuracy of information may vary and laws may change over time.</p>
          </div>
        </div>
      </div>
    ),

    customize: (
      <div style={{...s.page,maxWidth:520}}>
        <h2 style={{color:C.blue,fontWeight:800,marginBottom:24}}>⚙️ Customize Your Experience</h2>
        <div style={s.card}>
          {[
            {label:"🌐 Language",opts:["English","Hindi"],cur:lang,set:setLang},
            {label:"📝 Response Style",opts:["simple","professional"],cur:responseStyle,set:setResponseStyle},
          ].map((setting,i)=>(
            <div key={i} style={{marginBottom:24}}>
              <label style={{fontSize:14,fontWeight:700,display:"block",marginBottom:10,color:C.dark}}>{setting.label}</label>
              <div style={{display:"flex",gap:10}}>
                {setting.opts.map(opt=>(
                  <button key={opt} onClick={()=>{setting.set(opt);showNotif(`✅ ${setting.label} set to ${opt}`);}} style={{...s.btn,flex:1,...(setting.cur===opt?s.btnPrimary:s.btnOutline),fontSize:14}}>
                    {opt.charAt(0).toUpperCase()+opt.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div style={{padding:16,background:C.blueLight,borderRadius:12,fontSize:13,color:C.gray,border:`1px solid ${C.blueMid}`}}>
            <strong style={{color:C.dark}}>Active Settings:</strong><br/>
            🌐 Language: <strong style={{color:C.blue}}>{lang}</strong> &nbsp;·&nbsp; 📝 Style: <strong style={{color:C.blue}}>{responseStyle}</strong>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div style={s.app}>
      {notification && (
        <div style={s.notif}>
          <span>{notification}</span>
        </div>
      )}

      {/* Navbar */}
      <nav style={s.navbar}>
        <div style={s.logo} onClick={()=>nav(currentUser?"dashboard":"landing")}>
          <div style={{width:38,height:38,borderRadius:10,background:grad.btn,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,boxShadow:`0 2px 10px ${C.blue}44`}}>⚖️</div>
          <div>
            <div style={s.logoText}>NyayMitra</div>
            <div style={{fontSize:9,color:C.gray,marginTop:-2,fontWeight:500}}>न्याय मित्र</div>
          </div>
        </div>

        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          {navItems.map(item=>(
            <button key={item.page} style={{...s.navBtn,...(page===item.page?s.navBtnActive:{})}} onClick={()=>nav(item.page)}>
              <span style={{marginRight:4}}>{item.icon}</span>{item.label}
            </button>
          ))}
          {!currentUser ? (
            <>
              <button style={{...s.btn,...s.btnOutline,padding:"8px 18px",fontSize:13,marginLeft:4}} onClick={()=>nav("login")}>Login</button>
              <button style={{...s.btn,...s.btnPrimary,padding:"8px 18px",fontSize:13}} onClick={()=>nav("register")}>Register Free</button>
            </>
          ) : (
            <button style={{...s.navBtn,color:C.red,fontWeight:700,marginLeft:4}} onClick={logout}>🚪 Logout</button>
          )}
        </div>
      </nav>

      <main>{pages[page]||pages.landing}</main>

      {/* Footer */}
      <footer style={{background:`linear-gradient(135deg, ${C.blueLight}, ${C.yellowLight})`,borderTop:`1.5px solid ${C.blueMid}`,padding:"24px 20px",textAlign:"center",marginTop:40}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:6}}>
          <span style={{fontSize:18}}>⚖️</span>
          <span style={{fontWeight:800,color:C.blue,fontSize:16}}>NyayMitra</span>
          <span style={{color:C.gray,fontSize:13}}>— न्याय मित्र</span>
        </div>
        <p style={{color:C.gray,fontSize:12}}>© 2025 NyayMitra · For informational purposes only · Always consult a qualified lawyer</p>
      </footer>
    </div>
  );
}