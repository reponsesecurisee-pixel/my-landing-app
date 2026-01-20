"use client";

import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, Loader2, Shield, Briefcase, Scale, AlertTriangle, XCircle, Mail, FileText, BarChart3, MessageSquare, Lock, PartyPopper, ArrowRight, Users, Zap, CreditCard, Target } from 'lucide-react';

const LEMON_SQUEEZY_LINK = "https://reponse-securisee.lemonsqueezy.com/checkout/buy/d4e3b498-d99e-4d28-bb39-af9e1ef5de6b"; 

export default function ReclamationApp() {
  const [step, setStep] = useState('form');
  const [complaint, setComplaint] = useState('');
  const [email, setEmail] = useState(''); 
  const [situation, setSituation] = useState('');
  const [loading, setLoading] = useState(false);
  const [freeResponse, setFreeResponse] = useState('');
  const [paidResponse, setPaidResponse] = useState('');
  const [error, setError] = useState('');
  const [hasUsedFree, setHasUsedFree] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [supportName, setSupportName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSent, setSupportSent] = useState(false);
  const [stats, setStats] = useState({ views: 0, tests: 0, sales: 0 });

  useEffect(() => {
    const v = parseInt(localStorage.getItem('stats_v') || '0');
    const t = parseInt(localStorage.getItem('stats_t') || '0');
    const s = parseInt(localStorage.getItem('stats_s') || '0');
    setStats({ views: v, tests: t, sales: s });
    localStorage.setItem('stats_v', (v + 1).toString());

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') setIsAdmin(true);
    
    if (urlParams.get('paid') === 'true') {
      const savedComplaint = localStorage.getItem('pending_complaint');
      const savedEmail = localStorage.getItem('pending_email');
      const savedSituation = localStorage.getItem('pending_situation');
      if (savedComplaint && savedEmail) autoGeneratePaid(savedComplaint, savedSituation, savedEmail);
    } else {
      if (localStorage.getItem('used_free_test')) setHasUsedFree(true);
    }
  }, []);

  const trackAction = (key) => {
    const val = parseInt(localStorage.getItem(key) || '0');
    localStorage.setItem(key, (val + 1).toString());
  };

  const autoGeneratePaid = async (msg, sit, mail) => {
    setLoading(true); setStep('payment'); 
    try {
      const result = await callOpenAI('paid', msg, sit, mail);
      setPaidResponse(result); setStep('paid-result');
      localStorage.removeItem('pending_complaint');
      window.history.replaceState({}, document.title, "/"); 
    } catch (err) { setError('Erreur.'); } finally { setLoading(false); }
  };

  const callOpenAI = async (type, userMessage, userSit, userEmail = null) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, complaint: userMessage, situation: userSit, email: userEmail }),
    });
    const data = await response.json();
    return data.result;
  };

  const handleSubmitFree = async () => {
    if (!complaint || !situation) return alert("Champs requis.");
    setLoading(true);
    try {
      const result = await callOpenAI('free', complaint, situation);
      setFreeResponse(result);
      trackAction('stats_t');
      if (!isAdmin) {
        localStorage.setItem('used_free_test', 'true');
        setHasUsedFree(true);
      }
      setStep('free-result');
    } catch (err) { setError('Erreur.'); } finally { setLoading(false); }
  };

  const handlePaymentClick = () => {
    if (!email.includes('@')) return alert("Email requis.");
    trackAction('stats_s');
    localStorage.setItem('pending_complaint', complaint);
    localStorage.setItem('pending_email', email);
    localStorage.setItem('pending_situation', situation);
    window.location.href = LEMON_SQUEEZY_LINK;
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#1E293B] font-sans">
      <div className="max-w-5xl mx-auto px-4 py-12">
        
        {isAdmin && (
           <div className="bg-[#0F172A] text-white p-8 rounded-3xl mb-12 shadow-2xl border-b-4 border-blue-500">
             <div className="flex items-center gap-3 mb-8 border-b border-slate-700 pb-4">
                <BarChart3 className="w-8 h-8 text-blue-400" />
                <h2 className="text-xl font-black uppercase tracking-widest text-blue-100 italic">Business Monitor</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700">
                    <p className="text-[10px] text-slate-400 uppercase font-black mb-2 tracking-widest">Visiteurs</p>
                    <p className="text-4xl font-black">{stats.views}</p>
                </div>
                <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700">
                    <p className="text-[10px] text-slate-400 uppercase font-black mb-2 tracking-widest">Tests Gratuits</p>
                    <p className="text-4xl font-black text-yellow-400">{stats.tests}</p>
                </div>
                <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700">
                    <p className="text-[10px] text-slate-400 uppercase font-black mb-2 tracking-widest">Intents d'achat</p>
                    <p className="text-4xl font-black text-green-400">{stats.sales}</p>
                </div>
             </div>
           </div>
        )}

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8 border border-slate-200 shadow-sm">
            <Shield className="w-3 h-3 text-blue-600"/> Gilet Pare-balles Administratif
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#1E293B] mb-8 leading-[1.2] tracking-tight">
            Une mauvaise réponse écrite peut créer un risque juridique
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed">
            Générez une réponse professionnelle и juridiquement neutre, sans reconnaissance de faute ni engagement.
          </p>
          <p className="text-sm md:text-base text-slate-400 italic mt-4 font-bold text-center">
             Pour les artisans и petites entreprises du bâtiment confrontés à des réclamations clients
          </p>
        </div>

        {step === 'form' && (
          <div className="bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-200/50">
            <div className="space-y-8 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 ml-2 block">Message du client *</label>
                  <textarea value={complaint} onChange={(e) => setComplaint(e.target.value)} rows={8} className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:border-blue-600 focus:bg-white outline-none transition-all text-lg shadow-inner" placeholder="Collez le contenu ici..." />
                </div>
                <div className="space-y-4">
                   <label className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 ml-2 block">Nature du conflit *</label>
                   <div className="grid grid-cols-1 gap-4">
                      {['retard', 'qualite', 'facturation', 'autre'].map((sit) => (
                        <button key={sit} onClick={() => setSituation(sit)} className={`px-6 py-5 rounded-2xl border-2 text-left font-black transition-all flex items-center justify-between ${situation === sit ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-md' : 'border-slate-100 hover:border-slate-300 bg-white text-slate-600'}`}>
                          {sit === 'retard' ? 'Retard de travaux' : sit === 'qualite' ? 'Défaut / Finitions' : sit === 'facturation' ? 'Contestation Facture' : 'Autre situation'}
                          {situation === sit ? <Check className="w-5 h-5"/> : <div className="w-5 h-5 rounded-full border-2 border-slate-100"/>}
                        </button>
                      ))}
                   </div>
                </div>
              </div>

              {hasUsedFree && !isAdmin ? (
                <div className="bg-[#0F172A] p-10 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl border-b-8 border-green-600">
                  <div className="bg-blue-500/10 p-5 rounded-full border border-blue-500/20"><Lock className="w-10 h-10 text-blue-400"/></div>
                  <div className="flex-grow text-center md:text-left">
                    <p className="text-2xl font-black mb-2 uppercase tracking-tight text-white italic">Version complète requise.</p>
                    <p className="text-slate-400 font-bold text-sm">Le test gratuit est terminé. Sécurisez ce dossier maintenant.</p>
                  </div>
                  <button onClick={() => setStep('payment')} className="w-full md:w-auto bg-green-600 hover:bg-green-500 text-white font-black px-12 py-6 rounded-2xl transition shadow-xl uppercase tracking-widest text-sm flex items-center justify-center gap-4">
                    Sécuriser <ArrowRight className="w-5 h-5"/>
                  </button>
                </div>
              ) : (
                <button onClick={handleSubmitFree} disabled={loading} className="w-full bg-[#1E293B] text-white font-black py-7 rounded-2xl hover:bg-black transition-all text-xl shadow-xl flex items-center justify-center gap-4 uppercase tracking-widest">
                  {loading ? <Loader2 className="animate-spin" /> : 'Générer l\'ébauche gratuite'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* --- ЭТОТ ЭКРАН С ТРИГГЕРАМИ ВОССТАНОВЛЕН --- */}
        {step === 'free-result' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-200">
              <h2 className="text-2xl font-black mb-8 flex items-center gap-4 text-[#1E293B] text-left"><FileText className="w-8 h-8 text-blue-600"/> Ébauche indicative</h2>
              <div className="bg-slate-50 p-10 rounded-[2rem] border-2 border-dashed border-slate-200 mb-12 shadow-inner"><p className="text-slate-500 italic font-bold leading-relaxed text-xl text-center">{freeResponse}</p></div>
              
              <div className="text-center mb-16">
                 <h3 className="text-2xl font-black text-[#1E293B] mb-2 uppercase tracking-tight italic">Protégez votre entreprise</h3>
                 <p className="text-slate-500 font-bold text-center">Comparez les options avant d'envoyer votre réponse.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-12 items-stretch">
                <div className="bg-slate-50 border-2 border-slate-200 rounded-[2rem] p-8 flex flex-col transition-all hover:bg-white hover:border-red-200 group text-center">
                   <AlertTriangle className="w-10 h-10 text-slate-400 mb-6 group-hover:text-red-500 mx-auto" />
                   <h4 className="font-black text-xl mb-4 text-slate-700">Seul</h4>
                   <ul className="text-xs space-y-4 mb-8 text-slate-500 font-bold leading-relaxed px-2 text-left">
                     <li className="flex gap-2"><XCircle className="w-4 h-4 text-red-400 flex-shrink-0"/> Risque d'aveu de faute</li>
                     <li className="flex gap-2"><XCircle className="w-4 h-4 text-red-400 flex-shrink-0"/> Impact émotionnel</li>
                     <li className="flex gap-2"><XCircle className="w-4 h-4 text-red-400 flex-shrink-0"/> Pas de base légale</li>
                   </ul>
                   <div className="mt-auto text-center font-black text-red-600 text-[10px] tracking-widest uppercase py-2 bg-red-50 rounded-full">Risque Élevé</div>
                </div>

                <div className="bg-slate-50 border-2 border-slate-200 rounded-[2rem] p-8 flex flex-col transition-all hover:bg-white hover:border-blue-200 group text-center">
                   <Scale className="w-10 h-10 text-slate-400 mb-6 group-hover:text-blue-500 mx-auto" />
                   <h4 className="font-black text-xl mb-4 text-slate-700">Avocat</h4>
                   <ul className="text-xs space-y-4 mb-8 text-slate-500 font-bold leading-relaxed px-2 text-left">
                     <li className="flex gap-2"><Check className="w-4 h-4 text-green-500 flex-shrink-0"/> Protection Totale</li>
                     <li className="flex gap-2"><Check className="w-4 h-4 text-green-500 flex-shrink-0"/> Délai de 48h-72h</li>
                   </ul>
                   <div className="mt-auto text-center font-black text-slate-700 text-[10px] tracking-widest uppercase py-2 bg-slate-200 rounded-full">Min. 250€ HT</div>
                </div>

                <div className="bg-[#0F172A] rounded-[2rem] p-8 flex flex-col text-white shadow-2xl border-b-8 border-green-600 relative overflow-hidden transform hover:scale-[1.02] transition-all text-center">
                   <Shield className="w-12 h-12 text-green-500 mb-6 mx-auto" />
                   <h4 className="font-black text-2xl mb-4 tracking-tight text-white italic">IA EXPERTE</h4>
                   <ul className="text-xs space-y-4 mb-8 text-slate-300 font-bold leading-relaxed px-2 text-left">
                     <li className="flex gap-2"><Check className="w-4 h-4 text-green-500 flex-shrink-0"/> Neutralisation totale</li>
                     <li className="flex gap-2"><Check className="w-4 h-4 text-green-500 flex-shrink-0"/> Ton ferme и pro</li>
                     <li className="flex gap-2"><Check className="w-4 h-4 text-green-500 flex-shrink-0"/> Immédiat (10 sec)</li>
                   </ul>
                   <div className="mt-auto text-center font-black text-green-400 text-3xl tracking-tighter uppercase">9,90€ <span className="text-[10px] tracking-widest text-green-400/70 italic">TTC</span></div>
                </div>
              </div>

              <button onClick={() => setStep('payment')} className="w-full bg-[#0F172A] text-white font-black py-8 rounded-[2rem] hover:bg-black transition-all shadow-2xl text-2xl flex items-center justify-center gap-6 tracking-tight uppercase border-2 border-transparent hover:border-green-600">
                 <Shield className="w-8 h-8 text-green-500" /> Obtenir le dossier complet
              </button>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="bg-white rounded-[3rem] shadow-2xl p-12 max-w-xl mx-auto border-t-8 border-green-600 text-center">
            <h2 className="font-black text-3xl mb-8 text-[#1E293B] tracking-tight">Réception du dossier</h2>
            <div className="mb-10 text-center">
              <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block ml-2">Email professionnel *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@entreprise.fr" className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-2xl outline-none focus:border-blue-600 text-xl font-bold shadow-inner" />
            </div>
            <button onClick={handlePaymentClick} className="w-full bg-green-600 text-white font-black py-7 rounded-2xl shadow-xl hover:bg-green-500 transition-all text-xl uppercase tracking-widest italic">Payer 9,90€ и Recevoir</button>
            <button onClick={() => setStep('form')} className="w-full text-slate-400 text-xs font-black uppercase tracking-widest mt-6 hover:text-slate-600 transition text-center">Retour</button>
          </div>
        )}

        {step === 'paid-result' && (
           <div className="space-y-8 animate-in zoom-in-95 duration-700 text-center">
             <div className="bg-white rounded-[3rem] shadow-2xl p-10 border-t-8 border-green-500">
               <div className="flex items-center gap-5 mb-10 text-[#1E293B] justify-center text-center"><Check className="w-14 h-14 text-green-500" /><h2 className="font-black text-4xl tracking-tight italic text-center">Réponse Sécurisée</h2></div>
               <div className="bg-slate-50 p-10 rounded-[2.5rem] border-2 border-slate-100 text-slate-800 leading-relaxed font-serif text-2xl mb-12 shadow-inner whitespace-pre-wrap italic text-center text-center">{paidResponse}</div>
               <button onClick={() => { navigator.clipboard.writeText(paidResponse); alert('Copié !'); }} className="w-full bg-[#1E293B] text-white font-black py-7 rounded-2xl hover:bg-black transition-all shadow-xl flex items-center justify-center gap-6 text-2xl uppercase italic">
                  <FileText className="w-10 h-10 text-blue-500"/> Copier le texte
               </button>
             </div>

             <div className="bg-[#0F172A] text-white rounded-[4rem] p-16 shadow-2xl text-center relative overflow-hidden border-b-8 border-green-600 text-center text-center">
                <PartyPopper className="w-24 h-24 text-green-500 mx-auto mb-10 animate-bounce text-center" />
                <h3 className="text-5xl font-black mb-8 tracking-tighter leading-none text-white italic">FÉLICITATIONS !<br/>DOSSIER СЛОЖЕН.</h3>
                <p className="text-slate-400 mb-12 text-2xl font-bold max-w-2xl mx-auto leading-relaxed italic text-center text-center">Un problème de moins. Repreneз le contrôle de vos chantiers.</p>
                <button onClick={() => window.location.href = '/'} className="bg-green-600 text-white font-black py-7 px-14 rounded-full transition-all transform hover:scale-105 shadow-[0_25px_60px_rgba(34,197,94,0.4)] flex items-center justify-center gap-6 mx-auto uppercase tracking-widest text-lg italic">
                  Nouveau Dossier <ArrowRight className="w-8 h-8 text-white" />
                </button>
             </div>
           </div>
        )}

        <div className="mt-28 pt-12 border-t-2 border-slate-200 text-center">
            <p className="font-black text-[#1E293B] text-2xl mb-2 tracking-tighter uppercase italic">Réponse Sécurisée</p>
            <p className="text-slate-400 text-[10px] mb-12 font-black uppercase tracking-[0.3em]">Protection Administrative • Zero Data Log</p>
            <div className="flex flex-wrap justify-center items-center gap-8 mb-16">
                <span className="flex items-center gap-3 px-6 py-3 bg-white rounded-full border border-slate-200 shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-500"><Lock className="w-4 h-4 text-blue-600"/> Confidentialité</span>
                <span className="flex items-center gap-3 px-6 py-3 bg-white rounded-full border border-slate-200 shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-500"><Shield className="w-4 h-4 text-blue-600"/> RGPD</span>
            </div>
            <button onClick={() => setShowSupport(true)} className="text-slate-400 text-xs hover:text-[#1E293B] font-black transition-all flex items-center gap-2 mx-auto uppercase tracking-widest border-b-2 border-transparent hover:border-slate-800 pb-2">
               <MessageSquare className="w-4 h-4"/> Support / Contact
            </button>
        </div>
      </div>

      {showSupport && (
        <div className="fixed inset-0 bg-[#0F172A]/90 backdrop-blur-xl flex items-center justify-center p-4 z-50 text-center">
           <div className="bg-white rounded-[3.5rem] p-12 w-full max-w-lg shadow-2xl relative border-t-[12px] border-blue-600 text-center">
              <button onClick={() => setShowSupport(false)} className="absolute top-10 right-10 text-slate-300 hover:text-red-600 text-3xl font-black transition-all">✕</button>
              <h3 className="font-black text-4xl text-[#1E293B] mb-10 tracking-tight italic">Support</h3>
              {supportSent ? (<div className="text-green-600 text-center py-12 text-center text-center"><Check className="w-24 h-24 mx-auto mb-8 animate-pulse text-green-600 text-center" /><p className="font-black text-3xl tracking-tight uppercase text-green-600 text-center">Envoyé !</p></div>) : (
                <form onSubmit={async (e) => { e.preventDefault(); setLoading(true); await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ type: 'feedback', name: supportName, email: supportEmail, message: supportMessage }) }); setSupportSent(true); setTimeout(() => setShowSupport(false), 2000); }} className="space-y-6 text-center">
                  <input required placeholder="Nom / Entreprise" className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-2xl focus:border-blue-600 outline-none font-bold text-lg text-center" value={supportName} onChange={e => setSupportName(e.target.value)} />
                  <input required type="email" placeholder="Email de contact" className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-2xl focus:border-blue-600 outline-none font-bold text-lg text-center" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} />
                  <textarea required rows={4} placeholder="Votre question..." className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-2xl focus:border-blue-600 outline-none font-bold text-lg text-center" value={supportMessage} onChange={e => setSupportMessage(e.target.value)} />
                  <button type="submit" className="w-full bg-[#1E293B] text-white font-black py-6 rounded-2xl hover:bg-black transition-all uppercase tracking-widest shadow-2xl text-xl text-center italic">Envoyer</button>
                </form>
              )}
           </div>
        </div>
      )}
    </div>
  );
}

