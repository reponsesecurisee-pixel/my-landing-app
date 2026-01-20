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
  const [stats, setStats] = useState({ views: 0, freeTests: 0, paidClicks: 0 });

  useEffect(() => {
    const v = localStorage.getItem('stat_views') || 0;
    const f = localStorage.getItem('stat_free') || 0;
    const p = localStorage.getItem('stat_paid') || 0;
    setStats({ views: parseInt(v), freeTests: parseInt(f), paidClicks: parseInt(p) });
    localStorage.setItem('stat_views', parseInt(v) + 1);

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

  const trackStat = (key) => {
    const current = localStorage.getItem(key) || 0;
    localStorage.setItem(key, parseInt(current) + 1);
  };

  const autoGeneratePaid = async (msg, sit, mail) => {
    setLoading(true);
    setStep('payment'); 
    try {
      const result = await callOpenAI('paid', msg, sit, mail);
      setPaidResponse(result);
      setStep('paid-result');
      localStorage.removeItem('pending_complaint');
      window.history.replaceState({}, document.title, "/"); 
    } catch (err) { setError('Erreur de génération.'); } finally { setLoading(false); }
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
    if (!complaint || !situation) return alert("Veuillez remplir les champs.");
    setLoading(true);
    try {
      const result = await callOpenAI('free', complaint, situation);
      setFreeResponse(result);
      trackStat('stat_free');
      if (!isAdmin) {
        localStorage.setItem('used_free_test', 'true');
        setHasUsedFree(true);
      }
      setStep('free-result');
    } catch (err) { setError('Erreur.'); } finally { setLoading(false); }
  };

  const handlePaymentClick = () => {
    if (!email.includes('@')) return alert("Email requis.");
    trackStat('stat_paid');
    localStorage.setItem('pending_complaint', complaint);
    localStorage.setItem('pending_email', email);
    localStorage.setItem('pending_situation', situation);
    window.location.href = LEMON_SQUEEZY_LINK;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans">
      <div className="max-w-5xl mx-auto px-4 py-12">
        
        {/* АДМИН ПАНЕЛЬ (Dashboard Style) */}
        {isAdmin && (
           <div className="bg-[#0F172A] text-white p-8 rounded-3xl mb-12 shadow-2xl border-b-4 border-blue-500">
             <div className="flex items-center gap-3 mb-8 border-b border-slate-700 pb-4">
                <BarChart3 className="w-8 h-8 text-blue-400" />
                <h2 className="text-xl font-black uppercase tracking-widest">Business Monitor</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-2">Visiteurs uniques</p>
                    <p className="text-4xl font-black text-white">{stats.views}</p>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-2">Lead Conversion (Free)</p>
                    <p className="text-4xl font-black text-yellow-400">{stats.freeTests}</p>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-2">Ventes Potentielles</p>
                    <p className="text-4xl font-black text-green-400">{stats.paidClicks}</p>
                </div>
             </div>
           </div>
        )}

        {/* HEADER */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-slate-200 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600 mb-6 border border-slate-300">
            <Target className="w-3 h-3"/> Spécialisé Artisans & BTP
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[#0F172A] mb-6 leading-[1.1] tracking-tight">
            Une mauvaise réponse peut <span className="text-red-600">tuer</span> votre entreprise.
          </h1>
          <p className="text-xl text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed">
            Neutralisez les réclamations clients sans admettre de faute. <br/> 
            <strong>Le gilet pare-balles administratif pour votre business.</strong>
          </p>
        </div>

        {/* FORMULAIRE */}
        {step === 'form' && (
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#0F172A]"></div>
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-sm font-black uppercase tracking-wider text-slate-500">Message reçu du client *</label>
                  <textarea value={complaint} onChange={(e) => setComplaint(e.target.value)} rows={8} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-[#0F172A] outline-none transition text-lg" placeholder="Collez le texte ici..." />
                </div>
                <div className="space-y-4">
                   <label className="text-sm font-black uppercase tracking-wider text-slate-500">Nature du conflit *</label>
                   <div className="grid grid-cols-1 gap-3">
                      {['retard', 'qualite', 'facturation', 'autre'].map((sit) => (
                        <button key={sit} onClick={() => setSituation(sit)} className={`px-6 py-4 rounded-2xl border-2 text-left font-bold transition flex items-center justify-between ${situation === sit ? 'border-[#0F172A] bg-[#0F172A] text-white' : 'border-slate-100 hover:border-slate-300 bg-white'}`}>
                          {sit === 'retard' ? 'Retard de travaux' : sit === 'qualite' ? 'Défaut / Finitions' : sit === 'facturation' ? 'Contestation Facture' : 'Autre situation'}
                          {situation === sit && <Check className="w-5 h-5"/>}
                        </button>
                      ))}
                   </div>
                </div>
              </div>

              {hasUsedFree && !isAdmin ? (
                <div className="bg-[#0F172A] p-8 rounded-[2rem] text-white flex flex-col md:flex-row items-center gap-6 shadow-2xl">
                  <div className="bg-yellow-500/20 p-4 rounded-full"><Lock className="w-8 h-8 text-yellow-500"/></div>
                  <div className="flex-grow text-center md:text-left">
                    <p className="text-xl font-black mb-1 uppercase tracking-tight">Test gratuit déjà utilisé.</p>
                    <p className="text-slate-400 text-sm">Sécurisez ce dossier immédiatement avec la version complète.</p>
                  </div>
                  <button onClick={() => setStep('payment')} className="w-full md:w-auto bg-green-500 hover:bg-green-400 text-white font-black px-10 py-5 rounded-2xl transition shadow-xl uppercase tracking-widest text-sm flex items-center justify-center gap-3">
                    Obtenir ma réponse <ArrowRight className="w-5 h-5"/>
                  </button>
                </div>
              ) : (
                <button onClick={handleSubmitFree} disabled={loading} className="w-full bg-[#0F172A] text-white font-black py-6 rounded-2xl hover:bg-black transition text-xl shadow-2xl flex items-center justify-center gap-4">
                  {loading ? <Loader2 className="animate-spin" /> : 'GÉNÉRER MON ÉBAUCHE GRATUITE'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* FREE RESULT (Conversion optimized) */}
        {step === 'free-result' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border-t-8 border-yellow-500">
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-[#0F172A]"><FileText className="w-8 h-8"/> Ébauche de réponse (Standard)</h2>
              <div className="bg-slate-50 p-8 rounded-3xl border-2 border-slate-100 mb-12"><p className="text-slate-500 italic font-medium leading-relaxed text-lg">{freeResponse}</p></div>
              
              <div className="text-center mb-12">
                 <h3 className="text-3xl font-black text-red-600 mb-2 uppercase tracking-tight underline decoration-4 underline-offset-8">VOTRE RÉALITÉ EST ICI :</h3>
                 <p className="text-slate-500 font-bold">Un mauvais mot peut vous coûter des mois de marge.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="bg-white border-4 border-slate-100 rounded-[2rem] p-8 flex flex-col opacity-50 grayscale">
                   <AlertTriangle className="w-10 h-10 text-slate-400 mb-6" />
                   <h4 className="font-black text-xl mb-4">Seul</h4>
                   <ul className="text-sm space-y-3 mb-8 text-slate-500 font-bold">
                     <li className="flex gap-2"><XCircle className="w-4 h-4 text-red-400 flex-shrink-0"/> Aveu involontaire</li>
                     <li className="flex gap-2"><XCircle className="w-4 h-4 text-red-400 flex-shrink-0"/> Perte de contrôle</li>
                   </ul>
                   <div className="mt-auto text-center font-black text-red-600 text-[10px] tracking-[0.2em] uppercase">DANGER MAXIMAL</div>
                </div>

                <div className="bg-white border-4 border-slate-100 rounded-[2rem] p-8 flex flex-col">
                   <Scale className="w-10 h-10 text-blue-500 mb-6" />
                   <h4 className="font-black text-xl mb-4 text-[#0F172A]">Avocat</h4>
                   <ul className="text-sm space-y-3 mb-8 text-slate-500 font-bold">
                     <li className="flex gap-2"><Check className="w-4 h-4 text-green-500 flex-shrink-0"/> Protection Totale</li>
                     <li className="flex gap-2"><Check className="w-4 h-4 text-green-500 flex-shrink-0"/> Délai 48h-72h</li>
                   </ul>
                   <div className="mt-auto text-center font-black text-[#0F172A] text-[10px] tracking-[0.2em] uppercase">MIN. 250€ HT</div>
                </div>

                <div className="bg-[#0F172A] rounded-[2.5rem] p-8 flex flex-col text-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] transform scale-105 border-b-8 border-green-500 relative">
                   <Shield className="w-12 h-12 text-green-400 mb-6" />
                   <h4 className="font-black text-2xl mb-4 tracking-tight">IA EXPERTE</h4>
                   <ul className="text-sm space-y-3 mb-8 text-slate-300 font-bold">
                     <li className="flex gap-2"><Check className="w-4 h-4 text-green-400 flex-shrink-0"/> Zéro aveu de faute</li>
                     <li className="flex gap-2"><Check className="w-4 h-4 text-green-400 flex-shrink-0"/> Ton ferme et pro</li>
                     <li className="flex gap-2"><Check className="w-4 h-4 text-green-400 flex-shrink-0"/> Prêt en 10 sec</li>
                   </ul>
                   <div className="mt-auto text-center font-black text-green-400 text-2xl tracking-tight uppercase">9,90€ TTC</div>
                </div>
              </div>

              <button onClick={() => setStep('payment')} className="w-full bg-[#0F172A] text-white font-black py-8 rounded-3xl hover:bg-black transition shadow-2xl text-2xl flex items-center justify-center gap-4 tracking-tight uppercase">
                 <Shield className="w-8 h-8 text-green-400" /> Sécuriser mon dossier maintenant
              </button>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-12 max-w-xl mx-auto border-t-8 border-green-500">
            <h2 className="font-black text-3xl mb-8 text-[#0F172A] tracking-tight text-center">Finaliser votre protection</h2>
            <div className="mb-8">
              <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Email pro de réception *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@entreprise.fr" className="w-full bg-slate-50 border-4 border-slate-100 p-5 rounded-2xl outline-none focus:border-[#0F172A] text-lg font-bold" />
            </div>
            <button onClick={handlePaymentClick} className="w-full bg-green-600 text-white font-black py-6 rounded-2xl shadow-xl hover:bg-green-500 transition text-xl uppercase tracking-widest mb-4">Payer 9,90€ & Recevoir</button>
            <button onClick={() => setStep('form')} className="w-full text-slate-400 text-xs font-black uppercase tracking-widest hover:text-slate-600 transition">Retour</button>
          </div>
        )}

        {step === 'paid-result' && (
           <div className="space-y-8 animate-in zoom-in-95 duration-500">
             <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border-t-8 border-green-500">
               <div className="flex items-center gap-4 mb-8 text-[#0F172A]"><Check className="w-12 h-12 text-green-500" /><h2 className="font-black text-4xl tracking-tight">Réponse Sécurisée</h2></div>
               <div className="bg-slate-50 p-10 rounded-[2rem] border-4 border-slate-100 text-slate-800 leading-relaxed font-serif text-2xl mb-10 shadow-inner whitespace-pre-wrap">{paidResponse}</div>
               <button onClick={() => { navigator.clipboard.writeText(paidResponse); alert('Copié !'); }} className="w-full bg-[#0F172A] text-white font-black py-6 rounded-2xl hover:bg-black transition shadow-xl flex items-center justify-center gap-4 text-xl">
                  <FileText className="w-8 h-8 text-blue-400"/> Copier le texte complet
               </button>
             </div>

             <div className="bg-[#0F172A] text-white rounded-[3.5rem] p-12 shadow-2xl text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <PartyPopper className="w-20 h-20 text-green-400 mx-auto mb-8" />
                <h3 className="text-4xl font-black mb-6 tracking-tight">TERMINÉ ! <br/> VOUS ÊTES PROTÉGÉ.</h3>
                <p className="text-slate-400 mb-10 text-xl font-medium max-w-2xl mx-auto leading-relaxed">Le dossier est clos administrativement. Ne laissez plus une réclamation perturber votre chantier.</p>
                <button onClick={() => window.location.href = '/'} className="bg-green-500 text-white font-black py-6 px-12 rounded-full transition transform hover:scale-105 shadow-[0_25px_60px_rgba(34,197,94,0.4)] flex items-center justify-center gap-4 mx-auto uppercase tracking-[0.15em] text-sm">
                  Sécuriser une autre demande <ArrowRight className="w-6 h-6" />
                </button>
             </div>
           </div>
        )}

        {/* FOOTER */}
        <div className="mt-24 pt-12 border-t-2 border-slate-200 text-center">
            <p className="font-black text-[#0F172A] text-xl mb-2 tracking-tight uppercase">Réponse Sécurisée</p>
            <p className="text-slate-400 text-xs mb-10 font-black uppercase tracking-[0.2em]">Protection Administrative Professionnelle</p>
            <div className="flex flex-wrap justify-center items-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-12">
                <span className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm"><Lock className="w-3 h-3"/> Confidentialité Garantie</span>
                <span className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm"><Shield className="w-3 h-3"/> RGPD Compliance</span>
                <span className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm">Audit Zero Data</span>
            </div>
            <button onClick={() => setShowSupport(true)} className="text-slate-400 text-xs hover:text-slate-900 font-black transition flex items-center gap-2 mx-auto border-b-2 border-transparent hover:border-[#0F172A] pb-1 uppercase tracking-widest">
               <MessageSquare className="w-4 h-4"/> Support / Contact
            </button>
        </div>
      </div>

      {/* MODALE SUPPORT */}
      {showSupport && (
        <div className="fixed inset-0 bg-[#0F172A]/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl relative border-t-8 border-blue-500">
              <button onClick={() => setShowSupport(false)} className="absolute top-8 right-8 text-slate-300 hover:text-[#0F172A] text-2xl font-black">✕</button>
              <h3 className="font-black text-3xl text-[#0F172A] mb-8 tracking-tight">Support</h3>
              {supportSent ? (<div className="text-green-600 text-center py-8"><Check className="w-20 h-20 mx-auto mb-6" /><p className="font-black text-2xl tracking-tight">Envoyé !</p></div>) : (
                <form onSubmit={async (e) => { e.preventDefault(); setLoading(true); await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ type: 'feedback', name: supportName, email: supportEmail, message: supportMessage }) }); setSupportSent(true); setTimeout(() => setShowSupport(false), 2000); }} className="space-y-5">
                  <input required placeholder="Nom" className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl focus:border-[#0F172A] outline-none font-bold" value={supportName} onChange={e => setSupportName(e.target.value)} />
                  <input required type="email" placeholder="Email" className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl focus:border-[#0F172A] outline-none font-bold" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} />
                  <textarea required rows={4} placeholder="Votre question..." className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl focus:border-[#0F172A] outline-none font-bold" value={supportMessage} onChange={e => setSupportMessage(e.target.value)} />
                  <button type="submit" className="w-full bg-[#0F172A] text-white font-black py-5 rounded-2xl hover:bg-black transition uppercase tracking-widest shadow-2xl">Envoyer au support</button>
                </form>
              )}
           </div>
        </div>
      )}
    </div>
  );
}
