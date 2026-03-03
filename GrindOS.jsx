import { useState, useEffect, useRef } from "react";

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/8x2eVd9br9xR3dddkM2oE01";
const CLAUDE_MODEL = "claude-sonnet-4-20250514";
const FREE_LIMIT = 3;

const C = {
  bg:"#080810",surface:"#0F0F1A",card:"#15151F",border:"#1E1E2E",
  accent:"#00FF87",accentGlow:"rgba(0,255,135,0.25)",accentSoft:"rgba(0,255,135,0.08)",
  red:"#FF3D57",redSoft:"rgba(255,61,87,0.1)",
  yellow:"#FFD60A",yellowSoft:"rgba(255,214,10,0.1)",
  text:"#EEEEF5",muted:"#6B6B8A",dim:"#2A2A4A",
};
const F = {
  display:"'Archivo Black','Impact',sans-serif",
  body:"'Sora','Segoe UI',sans-serif",
  mono:"'JetBrains Mono','Fira Code',monospace",
};
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Sora:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{background:#080810;color:#EEEEF5;font-family:'Sora','Segoe UI',sans-serif;-webkit-font-smoothing:antialiased}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes glow{0%,100%{box-shadow:0 0 0 0 rgba(0,255,135,0.3)}50%{box-shadow:0 0 20px 4px rgba(0,255,135,0.12)}}
.fu{animation:fadeUp 0.4s ease both}
button{cursor:pointer;border:none;outline:none;font-family:'Sora','Segoe UI',sans-serif}
input,textarea{font-family:'Sora','Segoe UI',sans-serif;outline:none;border:none;background:none;color:#EEEEF5;resize:none}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#080810}::-webkit-scrollbar-thumb{background:#1E1E2E;border-radius:2px}
`;

const Spinner=({size=16})=><span style={{width:size,height:size,borderRadius:"50%",border:`2px solid #2A2A4A`,borderTopColor:"#00FF87",animation:"spin 0.7s linear infinite",display:"inline-block",flexShrink:0}}/>;

const Tag=({children,color="green"})=>{
  const map={green:["#00FF87","rgba(0,255,135,0.08)"],red:["#FF3D57","rgba(255,61,87,0.1)"],yellow:["#FFD60A","rgba(255,214,10,0.1)"]};
  const[col,bg]=map[color]||map.green;
  return <span style={{display:"inline-block",padding:"3px 10px",borderRadius:99,background:bg,color:col,fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",fontFamily:F.mono}}>{children}</span>;
};

function Btn({onClick,children,variant="primary",small,disabled,full}){
  const[hov,setHov]=useState(false);
  const s={
    primary:{bg:hov&&!disabled?"#00FF87":"transparent",color:hov&&!disabled?"#080810":(disabled?"#2A2A4A":"#00FF87"),bdr:`1.5px solid ${disabled?"#2A2A4A":"#00FF87"}`,sh:hov&&!disabled?"0 0 20px rgba(0,255,135,0.3)":"none"},
    ghost:{bg:hov?"#0F0F1A":"transparent",color:hov?"#EEEEF5":"#6B6B8A",bdr:`1.5px solid ${hov?"#1E1E2E":"#2A2A4A"}`,sh:"none"},
    danger:{bg:hov?"#FF3D57":"transparent",color:hov?"#fff":"#FF3D57",bdr:"1.5px solid #FF3D57",sh:hov?"0 0 16px rgba(255,61,87,0.3)":"none"},
  }[variant]||{};
  return <button onClick={onClick} disabled={disabled} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{padding:small?"7px 16px":"12px 24px",background:s.bg,color:s.color,border:s.bdr,borderRadius:8,fontWeight:600,fontSize:small?12:14,letterSpacing:0.3,transition:"all 0.18s",boxShadow:s.sh,display:"inline-flex",alignItems:"center",gap:8,opacity:disabled?0.4:1,width:full?"100%":"auto",justifyContent:"center"}}>{children}</button>;
}

const Card=({children,style={},glow})=><div style={{background:"#15151F",border:`1px solid ${glow?"#00FF8733":"#1E1E2E"}`,borderRadius:14,padding:24,boxShadow:glow?"0 0 40px rgba(0,255,135,0.12)":"none",...style}}>{children}</div>;

function Logo({size="md"}){
  const[iSz,fSz]={sm:[20,22],md:[28,30],lg:[40,44]}[size]||[28,30];
  return <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:iSz,height:iSz,borderRadius:6,background:"linear-gradient(135deg,#00FF87,#00BFFF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:iSz*0.55}}>⚡</div><span style={{fontFamily:F.display,fontSize:fSz,letterSpacing:2,color:"#EEEEF5"}}>GRIND<span style={{color:"#00FF87"}}>OS</span></span></div>;
}

function Landing({onEnter,sessionsUsed}){
  const rem=FREE_LIMIT-sessionsUsed;
  return(
    <div style={{maxWidth:600,margin:"0 auto",padding:"0 20px"}}>
      <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"24px 0",borderBottom:"1px solid #1E1E2E",marginBottom:64}}>
        <Logo size="md"/>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <Tag color={rem>0?"green":"red"}>{rem>0?`${rem} free sessions`:"Limit reached"}</Tag>
          <Btn small onClick={()=>window.open(STRIPE_PAYMENT_LINK,"_blank")}>Upgrade $9/mo</Btn>
        </div>
      </nav>
      <div className="fu" style={{textAlign:"center",marginBottom:64}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(0,255,135,0.08)",border:"1px solid rgba(0,255,135,0.2)",borderRadius:99,padding:"6px 16px",marginBottom:28}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:"#00FF87",animation:"glow 2s ease infinite",display:"inline-block"}}/>
          <span style={{fontSize:12,color:"#00FF87",fontFamily:F.mono,letterSpacing:1}}>AI DEEP WORK ENGINE</span>
        </div>
        <h1 style={{fontFamily:F.display,fontSize:"clamp(48px,10vw,80px)",lineHeight:0.95,letterSpacing:-1,marginBottom:20}}>
          YOUR WORK.<br/><span style={{color:"#00FF87",textShadow:"0 0 40px rgba(0,255,135,0.4)"}}>UPGRADED.</span>
        </h1>
        <p style={{color:"#6B6B8A",fontSize:16,lineHeight:1.7,maxWidth:420,margin:"0 auto 36px"}}>
          Tell GrindOS your goal. AI breaks it into laser-focused sessions, coaches you live, and rewards every win.
        </p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <Btn onClick={onEnter} disabled={rem<=0}>{rem>0?"⚡ Start Free Session":"🔒 Upgrade to Continue"}</Btn>
          {rem<=0&&<Btn variant="ghost" onClick={()=>window.open(STRIPE_PAYMENT_LINK,"_blank")}>Get Pro Access →</Btn>}
        </div>
        {rem>0&&<p style={{color:"#2A2A4A",fontSize:12,marginTop:12,fontFamily:F.mono}}>{rem} of {FREE_LIMIT} free sessions remaining</p>}
      </div>
      <div className="fu" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:64}}>
        {[["⚡","AI Plans","Goal → sessions in seconds"],["🤖","Live Coach","Real-time focus nudges"],["🏆","XP System","Level up as you work"]].map(([icon,title,desc])=>(
          <Card key={title} style={{textAlign:"center",padding:20}}>
            <div style={{fontSize:28,marginBottom:8}}>{icon}</div>
            <div style={{fontWeight:700,fontSize:13,marginBottom:4}}>{title}</div>
            <div style={{color:"#6B6B8A",fontSize:11,lineHeight:1.5}}>{desc}</div>
          </Card>
        ))}
      </div>
      <div className="fu" style={{marginBottom:64}}>
        <h2 style={{fontFamily:F.display,fontSize:32,letterSpacing:1,textAlign:"center",marginBottom:24}}>ONE SIMPLE <span style={{color:"#00FF87"}}>PRICE</span></h2>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Card style={{padding:24}}>
            <Tag color="yellow">Free</Tag>
            <div style={{fontFamily:F.display,fontSize:36,margin:"12px 0 4px"}}>$0</div>
            <div style={{color:"#6B6B8A",fontSize:13,marginBottom:20}}>Get started</div>
            {["3 AI sessions/month","Basic focus timer","AI plan generation"].map(f=>(
              <div key={f} style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,fontSize:13,color:"#6B6B8A"}}><span style={{color:"#00FF87"}}>✓</span>{f}</div>
            ))}
          </Card>
          <Card style={{padding:24,border:"1.5px solid rgba(0,255,135,0.3)"}} glow>
            <Tag>Pro</Tag>
            <div style={{fontFamily:F.display,fontSize:36,margin:"12px 0 4px",color:"#00FF87"}}>$9<span style={{fontSize:16,color:"#6B6B8A"}}>/mo</span></div>
            <div style={{color:"#6B6B8A",fontSize:13,marginBottom:20}}>Serious grinders</div>
            {["Unlimited sessions","Live AI coaching","XP & leveling system","Session history","Priority support"].map(f=>(
              <div key={f} style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,fontSize:13}}><span style={{color:"#00FF87"}}>✓</span>{f}</div>
            ))}
            <div style={{marginTop:20}}><Btn full onClick={()=>window.open(STRIPE_PAYMENT_LINK,"_blank")}>Get Pro →</Btn></div>
          </Card>
        </div>
      </div>
      <div style={{textAlign:"center",paddingBottom:40,borderTop:"1px solid #1E1E2E",paddingTop:28}}>
        <Logo size="sm"/>
        <p style={{color:"#2A2A4A",fontSize:11,marginTop:8,fontFamily:F.mono}}>grindos.app · Built with AI · © 2025</p>
      </div>
    </div>
  );
}

function Paywall({onBack}){
  return(
    <div className="fu" style={{maxWidth:480,margin:"0 auto",padding:"60px 20px",textAlign:"center"}}>
      <div style={{fontSize:56,marginBottom:16}}>🔒</div>
      <h2 style={{fontFamily:F.display,fontSize:40,letterSpacing:2,marginBottom:8}}>FREE LIMIT <span style={{color:"#00FF87"}}>REACHED</span></h2>
      <p style={{color:"#6B6B8A",fontSize:15,marginBottom:36,lineHeight:1.7}}>You've used your {FREE_LIMIT} free sessions. Upgrade to GrindOS Pro for unlimited deep work.</p>
      <Card style={{marginBottom:24,textAlign:"left"}} glow>
        <Tag>Pro — $9/month</Tag>
        <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:12}}>
          {["Unlimited AI sessions","Live coaching nudges","XP leveling system","Session history & insights","Cancel anytime"].map(f=>(
            <div key={f} style={{display:"flex",gap:10,alignItems:"center",fontSize:14}}><span style={{color:"#00FF87",fontSize:16}}>✓</span>{f}</div>
          ))}
        </div>
        <div style={{marginTop:24}}><Btn full onClick={()=>window.open(STRIPE_PAYMENT_LINK,"_blank")}>⚡ Upgrade Now — $9/mo</Btn></div>
        <p style={{color:"#2A2A4A",fontSize:11,textAlign:"center",marginTop:10,fontFamily:F.mono}}>Powered by Stripe · Secure · Cancel anytime</p>
      </Card>
      <Btn variant="ghost" onClick={onBack}>← Back to home</Btn>
    </div>
  );
}

function SetupView({onPlan}){
  const[goal,setGoal]=useState("");const[dl,setDl]=useState("");
  const[loading,setLoading]=useState(false);const[err,setErr]=useState("");
  async function gen(){
    if(!goal.trim())return;setLoading(true);setErr("");
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:CLAUDE_MODEL,max_tokens:1000,system:`You are GrindOS AI. Return ONLY valid JSON (no markdown, no backticks): {"title":"SHORT PUNCHY NAME","summary":"one fierce motivational sentence","sessions":[{"id":1,"label":"Session name","duration":25,"task":"specific concrete action","tip":"one sharp focus tip"}],"xp":120}. Include 4-5 sessions.`,messages:[{role:"user",content:`Goal: ${goal}${dl?`. Deadline: ${dl}`:""}`}]})});
      const data=await res.json();
      const raw=data.content.map(b=>b.text||"").join("").replace(/```json|```/g,"").trim();
      onPlan(JSON.parse(raw),goal);
    }catch(e){setErr("AI unreachable. Check your connection.");}
    setLoading(false);
  }
  return(
    <div className="fu" style={{maxWidth:520,margin:"0 auto",padding:"40px 20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:40}}><Logo/></div>
      <div style={{marginBottom:32}}>
        <h2 style={{fontFamily:F.display,fontSize:38,letterSpacing:1,marginBottom:6}}>NEW <span style={{color:"#00FF87"}}>SESSION</span></h2>
        <p style={{color:"#6B6B8A",fontSize:14}}>Tell GrindOS what you need to crush today.</p>
      </div>
      <Card style={{display:"flex",flexDirection:"column",gap:20}}>
        <div>
          <label style={{fontSize:10,color:"#6B6B8A",letterSpacing:2,textTransform:"uppercase",fontFamily:F.mono,display:"block",marginBottom:8}}>Your Goal</label>
          <textarea rows={3} placeholder="e.g. Finish the first draft of my pitch deck..." value={goal} onChange={e=>setGoal(e.target.value)} style={{width:"100%",background:"#0F0F1A",border:`1.5px solid ${goal?"rgba(0,255,135,0.4)":"#1E1E2E"}`,borderRadius:10,padding:"12px 14px",fontSize:15,lineHeight:1.6,transition:"border-color 0.2s"}}/>
        </div>
        <div>
          <label style={{fontSize:10,color:"#6B6B8A",letterSpacing:2,textTransform:"uppercase",fontFamily:F.mono,display:"block",marginBottom:8}}>Deadline <span style={{color:"#2A2A4A"}}>(optional)</span></label>
          <input type="text" placeholder="e.g. Tonight by 9pm" value={dl} onChange={e=>setDl(e.target.value)} style={{width:"100%",background:"#0F0F1A",border:"1.5px solid #1E1E2E",borderRadius:10,padding:"12px 14px",fontSize:14}}/>
        </div>
        {err&&<p style={{color:"#FF3D57",fontSize:13}}>{err}</p>}
        <Btn onClick={gen} disabled={!goal.trim()||loading} full>{loading?<><Spinner/>Building your plan…</>:"⚡ Generate AI Plan"}</Btn>
      </Card>
    </div>
  );
}

function PlanView({plan,goal,onStart,onBack}){
  const total=plan.sessions.reduce((a,s)=>a+s.duration,0);
  return(
    <div className="fu" style={{maxWidth:520,margin:"0 auto",padding:"40px 20px"}}>
      <div style={{marginBottom:24}}><Btn variant="ghost" small onClick={onBack}>← Back</Btn></div>
      <Tag>AI Plan Ready</Tag>
      <h2 style={{fontFamily:F.display,fontSize:40,letterSpacing:1,marginTop:10,marginBottom:6}}>{plan.title}</h2>
      <p style={{color:"#6B6B8A",fontSize:14,marginBottom:28,lineHeight:1.6}}>{plan.summary}</p>
      <div style={{display:"flex",gap:12,marginBottom:24}}>
        {[["Sessions",plan.sessions.length],["Total",`${total}m`],["XP",`+${plan.xp}`]].map(([lbl,val])=>(
          <Card key={lbl} style={{flex:1,textAlign:"center",padding:"14px 8px"}}>
            <div style={{fontFamily:F.display,fontSize:26,color:"#00FF87"}}>{val}</div>
            <div style={{fontSize:10,color:"#6B6B8A",fontFamily:F.mono,letterSpacing:1,marginTop:2,textTransform:"uppercase"}}>{lbl}</div>
          </Card>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28}}>
        {plan.sessions.map((s,i)=>(
          <div key={s.id} className="fu" style={{animationDelay:`${i*70}ms`,background:"#15151F",border:"1px solid #1E1E2E",borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:34,height:34,borderRadius:8,background:"rgba(0,255,135,0.08)",color:"#00FF87",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F.display,fontSize:18,flexShrink:0}}>{i+1}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:600,fontSize:14,marginBottom:2}}>{s.label}</div>
              <div style={{color:"#6B6B8A",fontSize:12,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.task}</div>
            </div>
            <div style={{color:"#00FF87",fontFamily:F.mono,fontSize:13,flexShrink:0}}>{s.duration}m</div>
          </div>
        ))}
      </div>
      <Btn onClick={onStart} full>🔥 Lock In & Start</Btn>
    </div>
  );
}

function TimerView({plan,goal,onDone}){
  const[idx,setIdx]=useState(0);
  const[secs,setSecs]=useState(plan.sessions[0].duration*60);
  const[running,setRunning]=useState(false);
  const[done,setDone]=useState(false);
  const[nudge,setNudge]=useState("");const[nudgeLoad,setNudgeLoad]=useState(false);
  const[completed,setCompleted]=useState([]);
  const ref=useRef(null);
  const session=plan.sessions[idx];
  const total=session.duration*60;
  const pct=((total-secs)/total)*100;
  const mm=String(Math.floor(secs/60)).padStart(2,"0");
  const ss=String(secs%60).padStart(2,"0");

  useEffect(()=>{
    if(running&&secs>0){ref.current=setInterval(()=>setSecs(s=>s-1),1000);}
    else if(secs===0){setRunning(false);advance();}
    return()=>clearInterval(ref.current);
  },[running,secs]);

  function advance(){
    setCompleted(p=>[...p,session.id]);
    if(idx<plan.sessions.length-1){const n=idx+1;setIdx(n);setSecs(plan.sessions[n].duration*60);}
    else setDone(true);
  }

  async function getNudge(){
    setNudgeLoad(true);setNudge("");
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:CLAUDE_MODEL,max_tokens:1000,system:"You are GrindOS, an intense productivity coach. 2 sentences max. Be direct, fierce, motivating. No fluff.",messages:[{role:"user",content:`Goal: ${goal}. Task: ${session.task}. ${secs}s left. Fire me up.`}]})});
      const data=await res.json();
      setNudge(data.content.map(b=>b.text||"").join(""));
    }catch{setNudge("No distractions. Pure execution. Now.");}
    setNudgeLoad(false);
  }

  if(done)return <CompleteView plan={plan} goal={goal} onDone={onDone}/>;

  const R=100,CX=130,CY=130;
  const a=(pct/100)*2*Math.PI-Math.PI/2;
  const ex=CX+R*Math.cos(a),ey=CY+R*Math.sin(a);
  const la=pct>50?1:0;
  const arc=`M ${CX} ${CY-R} A ${R} ${R} 0 ${la} 1 ${ex} ${ey}`;

  return(
    <div className="fu" style={{maxWidth:520,margin:"0 auto",padding:"32px 20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32}}>
        <Logo/>
        <Tag color={running?"green":"yellow"}>{running?"IN THE ZONE":"PAUSED"}</Tag>
      </div>
      <div style={{display:"flex",justifyContent:"center",marginBottom:24}}>
        <div style={{position:"relative",width:260,height:260}}>
          <svg width="260" height="260" style={{position:"absolute",inset:0}}>
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="#1E1E2E" strokeWidth={5}/>
            {pct>0&&<path d={arc} fill="none" stroke="#00FF87" strokeWidth={5} strokeLinecap="round" style={{filter:"drop-shadow(0 0 10px #00FF87)"}}/>}
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <div style={{fontFamily:F.display,fontSize:58,letterSpacing:3,lineHeight:1,color:running?"#EEEEF5":"#6B6B8A"}}>{mm}:{ss}</div>
            <div style={{color:"#6B6B8A",fontSize:11,marginTop:6,fontFamily:F.mono,letterSpacing:2}}>SESSION {idx+1}/{plan.sessions.length}</div>
          </div>
        </div>
      </div>
      <Card style={{marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>{session.label}</div>
        <div style={{color:"#6B6B8A",fontSize:13,marginBottom:14}}>{session.task}</div>
        <div style={{background:"rgba(0,255,135,0.08)",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#00FF87"}}>💡 {session.tip}</div>
      </Card>
      <div style={{display:"flex",gap:10,marginBottom:14}}>
        <div style={{flex:1}}><Btn onClick={()=>setRunning(r=>!r)} full>{running?"⏸ Pause":"▶ Start"}</Btn></div>
        <Btn variant="ghost" small onClick={getNudge} disabled={nudgeLoad}>{nudgeLoad?<Spinner/>:"🤖 Coach"}</Btn>
        <Btn variant="ghost" small onClick={advance}>Skip →</Btn>
      </div>
      {nudge&&<div className="fu" style={{background:"rgba(0,255,135,0.08)",border:"1px solid rgba(0,255,135,0.2)",borderRadius:12,padding:"12px 16px",fontSize:13,color:"#EEEEF5",lineHeight:1.7,marginBottom:14}}><span style={{color:"#00FF87"}}>⚡ </span>{nudge}</div>}
      <div style={{display:"flex",gap:6,marginTop:4}}>
        {plan.sessions.map((s,i)=>(
          <div key={s.id} style={{flex:1,height:3,borderRadius:99,background:completed.includes(s.id)?"#00FF87":i===idx?"rgba(0,255,135,0.4)":"#2A2A4A",transition:"background 0.3s"}}/>
        ))}
      </div>
    </div>
  );
}

function CompleteView({plan,goal,onDone}){
  const[refl,setRefl]=useState("");const[insight,setInsight]=useState("");const[loading,setLoading]=useState(false);
  async function getInsight(){
    if(!refl.trim())return;setLoading(true);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:CLAUDE_MODEL,max_tokens:1000,system:"You are GrindOS AI. 2-3 sentences. Celebrate the win, spot a pattern, give one sharp improvement tip. Be direct.",messages:[{role:"user",content:`Goal: ${goal}. Reflection: ${refl}`}]})});
      const data=await res.json();
      setInsight(data.content.map(b=>b.text||"").join(""));
    }catch{setInsight("Solid execution. Reflect on what slowed you down and eliminate it next time.");}
    setLoading(false);
  }
  return(
    <div className="fu" style={{maxWidth:520,margin:"0 auto",padding:"60px 20px",textAlign:"center"}}>
      <div style={{fontSize:64,marginBottom:12}}>🏆</div>
      <h2 style={{fontFamily:F.display,fontSize:52,letterSpacing:2,marginBottom:6}}>GRIND <span style={{color:"#00FF87"}}>COMPLETE</span></h2>
      <p style={{color:"#6B6B8A",marginBottom:32,fontSize:14}}><span style={{color:"#FFD60A",fontWeight:700}}>+{plan.xp} XP earned</span> · {plan.title}</p>
      <Card style={{marginBottom:20,textAlign:"left"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:10,fontSize:13}}>
          <span style={{color:"#6B6B8A"}}>Level 1 → Level 2</span>
          <span style={{fontFamily:F.mono,color:"#FFD60A"}}>{plan.xp} / 500 XP</span>
        </div>
        <div style={{height:6,background:"#2A2A4A",borderRadius:99,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${Math.min((plan.xp/500)*100,100)}%`,background:"linear-gradient(90deg,#00FF87,#00BFFF)",borderRadius:99,boxShadow:"0 0 12px rgba(0,255,135,0.4)",transition:"width 1.2s ease"}}/>
        </div>
      </Card>
      <Card style={{marginBottom:20,textAlign:"left"}}>
        <label style={{fontSize:10,color:"#6B6B8A",letterSpacing:2,textTransform:"uppercase",fontFamily:F.mono,display:"block",marginBottom:8}}>Reflect on your session</label>
        <textarea rows={3} placeholder="What did you nail? What got in the way?" value={refl} onChange={e=>setRefl(e.target.value)} style={{width:"100%",background:"#0F0F1A",border:"1.5px solid #1E1E2E",borderRadius:10,padding:"12px 14px",fontSize:14,lineHeight:1.6}}/>
        <div style={{marginTop:12}}><Btn small onClick={getInsight} disabled={!refl.trim()||loading}>{loading?<><Spinner/>Analyzing…</>:"🤖 Get AI Insight"}</Btn></div>
        {insight&&<div className="fu" style={{marginTop:14,background:"rgba(0,255,135,0.08)",borderRadius:10,padding:"12px 16px",fontSize:13,lineHeight:1.7,textAlign:"left"}}><span style={{color:"#00FF87"}}>⚡ </span>{insight}</div>}
      </Card>
      <Btn onClick={onDone} full>⚡ Start New Goal</Btn>
      <p style={{marginTop:14,fontSize:12,color:"#2A2A4A",fontFamily:F.mono}}>Want unlimited sessions? <span onClick={()=>window.open(STRIPE_PAYMENT_LINK,"_blank")} style={{color:"#00FF87",cursor:"pointer",textDecoration:"underline"}}>Upgrade to Pro →</span></p>
    </div>
  );
}

export default function GrindOS(){
  const[screen,setScreen]=useState("landing");
  const[plan,setPlan]=useState(null);
  const[goal,setGoal]=useState("");
  const[sessionsUsed,setSessionsUsed]=useState(()=>{try{return parseInt(localStorage.getItem("grindos_sessions")||"0");}catch{return 0;}});

  function handleEnter(){
    if(sessionsUsed>=FREE_LIMIT){setScreen("paywall");return;}
    setScreen("setup");
  }
  function handlePlan(p,g){setPlan(p);setGoal(g);setScreen("plan");}
  function handleStart(){
    const n=sessionsUsed+1;setSessionsUsed(n);
    try{localStorage.setItem("grindos_sessions",n.toString());}catch{}
    setScreen("timer");
  }
  function handleDone(){setPlan(null);setGoal("");setScreen("landing");}

  return(
    <>
      <style>{CSS}</style>
      <div style={{minHeight:"100vh",background:"#080810",backgroundImage:"radial-gradient(ellipse at 10% 10%, rgba(0,255,135,0.05) 0%, transparent 55%), radial-gradient(ellipse at 90% 90%, rgba(0,191,255,0.04) 0%, transparent 55%)"}}>
        {screen==="landing"&&<Landing onEnter={handleEnter} sessionsUsed={sessionsUsed}/>}
        {screen==="paywall"&&<Paywall onBack={()=>setScreen("landing")}/>}
        {screen==="setup"&&<SetupView onPlan={handlePlan}/>}
        {screen==="plan"&&plan&&<PlanView plan={plan} goal={goal} onStart={handleStart} onBack={()=>setScreen("setup")}/>}
        {screen==="timer"&&plan&&<TimerView plan={plan} goal={goal} onDone={handleDone}/>}
      </div>
    </>
  );
}
