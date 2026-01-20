"use client";

import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, Loader2, Shield, Briefcase, Scale, AlertTriangle, XCircle, Mail, FileText, BarChart3, MessageSquare, Lock, PartyPopper, ArrowRight, Users, Zap, CreditCard } from 'lucide-react';

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

  // --- ЛОГИКА АДМИН-ПАНЕЛИ (СЧЕТЧИКИ) ---
  const [stats, setStats] = useState({ views: 0, freeTests: 0, paidClicks: 0 });

  useEffect(() => {
    // Имитация сбора данных (в реальном приложении это идет в базу)
    const v = localStorage.getItem('stat_views') || 0;
    const f = localStorage.getItem('stat_free') || 0;
    const p = localStorage.getItem('stat_paid') || 0;
    setStats({ views: parseInt(v), freeTests: parseInt(f), paidClicks: parseInt(p) });

    // Учет визита
    const newViews = parseInt(v) + 1;
    localStorage.setItem('stat_views', newViews);

    const urlParams = new URLSearchParams(window.location.search);
    const isPaid = urlParams.get('paid');
    const adminCheck = urlParams.get('admin');

    if (adminCheck === 'true') setIsAdmin(true);

    if (isPaid === 'true') {
      const savedComplaint = localStorage.getItem('pending_complaint');
      const savedEmail = localStorage.getItem('pending_email');
      const savedSituation = localStorage.getItem('pending_situation');
      if (savedComplaint && savedEmail) {
        setComplaint(savedComplaint);
        setEmail(savedEmail);
        setSituation(savedSituation || '');
        autoGeneratePaid(savedComplaint, savedSituation, savedEmail);
      }
    } else {
      if (adminCheck !== 'true') {
        if (localStorage.getItem('used_free_test')) setHasUsedFree(true);
      }
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
    if (!response.ok) throw new Error(data.error);
    return data.result;
  };

  const handleSubmitFree = async () => {
    if (!complaint || !situation) return alert("Veuillez remplir les champs.");
    setLoading(true);
    try {
      const result = await callOpenAI('free', complaint, situation);
      setFreeResponse(result);
      trackStat('stat_free'); // +1 к бесплатному тесту
      if (!isAdmin) {
        localStorage.setItem('used_free_test', 'true');
        setHasUsedFree(true);
      }
      setStep('free-result');
    } catch (err) { setError('Erreur.'); } finally { setLoading(false); }
  };

  const handlePaymentClick = () => {
    if (!email.includes('@')) return alert("Email requis.");
    trackStat('stat_paid'); // +1 к попытке оплаты
    localStorage.setItem('pending_complaint', complaint);
    localStorage.setItem('pending_email', email);
    localStorage.setItem('pending_situation', situation);
    window.location.href = LEMON_SQUEEZY_LINK;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 font-sans text-slate-800 flex flex-col">
      <div className="max-w-4xl mx-auto flex-grow w-full">
        
        {/* ШАГ 2: УЛУЧШЕННАЯ АДМИН-ПАНЕЛЬ */}
        {isAdmin && (
           <div className="bg-slate-900 text-white p-6 rounded-2xl mb-8 shadow-2xl border border-slate-700">
             <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-4">
                <BarChart3 className="w-6 h-6 text-green-400" />
                <span className="font-bold text-lg uppercase tracking-wider">Tableau de Bord Admin</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center gap-4">
                    <div className="bg-blue-500/20 p-3 rounded-lg"><Users className="text-blue-400"/></div>
                    <div><p className="text-xs text-slate-400 uppercase">Visiteurs</p><p className="text-2xl font-black">{stats.views}</p></div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center gap-4">
                    <div className="bg-yellow-500/20 p-3 rounded-lg"><Zap className="text-yellow-400"/></div>
                    <div><p className="text-xs text-slate-400 uppercase">Tests Gratuits</p><p className="text-2xl font-black">{stats.freeTests}</p></div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center gap-4">
                    <div className="bg-green-500/20 p-3 rounded-lg"><CreditCard className="text-green-400"/></div>
                    <div><p className="text-xs text-slate-400 uppercase">Intents d'achat</p><p className="text-2xl font-black">{stats.paidClicks}</p></div>
                </div>
             </div>
           </div>
        )}

        <div className="text-center mb-12 pt-8">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">
            Une mauvaise réponse écrite peut créer un risque juridique
          </h1>
          <p className="text-slate-600 text-lg mb-4">Générez une réponse professionnelle, neutre и sans reconnaissance de faute.</p>
          <p className="text-slate-500 italic">Pour les artisans и petites entreprises du bâtiment.</p>
        </div>

        {step === 'form' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Message du client *</label>
                <textarea value={complaint} onChange={(e) => setComplaint(e.target.value)} rows={6} className="w-full px-4 py-3 border-2 border-slate-100 rounded-2xl focus:border-slate-800 outline-none transition" placeholder="Copiez-collez le message ici..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Situation *</label>
                <select value={situation} onChange={(e) => setSituation(e.target.value)} className="w-full px-4 py-3 border-2 border-slate-100 rounded-2xl outline-none focus:border-slate-800">
                  <option value="">Choisir la situation...</option>
                  <option value="retard">Retard de travaux</option>
                  <option value="qualite">Défaut / Finitions</option>
                  <option value="facturation">Contestation facture</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              {hasUsedFree && !isAdmin ? (
                <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-xl transform transition hover:scale-[1.02]">
                  <div className="flex items-center gap-3 mb-4"><Lock className="text-yellow-400 w-5 h-5"/> <p className="font-bold">Test gratuit terminé</p></div>
                  <button onClick={() => setStep('payment')} className="w-full bg-green-500 text-white font-black py-4 rounded-xl hover:bg-green-400 transition uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
                    Sécuriser mon entreprise (9,90€) <ArrowRight className="w-5 h-5"/>
                  </button>
                </div>
              ) : (
                <button onClick={handleSubmitFree} disabled={loading} className="w-full bg-slate-800 text-white font-bold py-5 rounded-2xl hover:bg-slate-900 transition flex items-center justify-center gap-3 shadow-lg">
                  {loading ? <Loader2 className="animate-spin" /> : 'Générer une ébauche GRATUITE'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ШАГ 1: ВОЗВРАЩАЕМ ТЕКСТЫ ТРИГГЕРОВ */}
        {step === 'free-result' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
              <h2 className="font-black text-2xl text-slate-900 mb-6 flex items-center gap-2"><FileText className="text-blue-500"/> Votre ébauche indicative</h2>
              <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 mb-10"><p className="italic text-slate-600 leading-relaxed">{freeResponse}</p></div>
              
              <div className="text-center mb-8"><h3 className="text-xl font-black text-red-600 uppercase tracking-tight">⚠️ Attention : Cette réponse est incomplète</h3></div>

              <div className="grid md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 flex flex-col opacity-60">
                   <AlertTriangle className="w-8 h-8 text-slate-400 mb-4" />
                   <h4 className="font-bold mb-3">Répondre seul</h4>
                   <ul className="text-xs space-y-2 mb-6 text-slate-500">
                     <li className="flex gap-2"><XCircle className="w-3 h-3 text-red-400 flex-shrink-0"/> Risque d'émotion</li>
                     <li className="flex gap-2"><XCircle className="w-3 h-3 text-red-400 flex-shrink-0"/> Aveu de faute involontaire</li>
                     <li className="flex gap-2"><XCircle className="w-3 h-3 text-red-400 flex-shrink-0"/> Juridiquement dangereux</li>
                   </ul>
                   <div className="mt-auto pt-4 border-t font-black text-red-600 text-center uppercase tracking-widest text-[10px]">Risque Maximum</div>
                </div>

                <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 flex flex-col">
                   <Scale className="w-8 h-8 text-blue-500 mb-4" />
                   <h4 className="font-bold mb-3">Avocat Cabinet</h4>
                   <ul className="text-xs space-y-2 mb-6 text-slate-500">
                     <li className="flex gap-2"><Check className="w-3 h-3 text-green-500 flex-shrink-0"/> Sécurité totale</li>
                     <li className="flex gap-2"><Check className="w-3 h-3 text-green-500 flex-shrink-0"/> Relecture humaine</li>
                   </ul>
                   <div className="mt-auto pt-4 border-t font-black text-slate-800 text-center uppercase tracking-widest text-[10px]">~250€ HT / Heure</div>
                </div>

                <div className="bg-slate-900 rounded-3xl p-6 flex flex-col text-white shadow-2xl transform scale-105 border-2 border-green-500 relative overflow-hidden">
                   <div className="absolute top-0 right-0 bg-green-500 text-[8px] font-black px-3 py-1 uppercase tracking-tighter">Économique</div>
                   <Shield className="w-8 h-8 text-green-400 mb-4" />
                   <h4 className="font-bold mb-3">Notre IA Experte</h4>
                   <ul className="text-xs space-y-2 mb-6 text-slate-300">
                     <li className="flex gap-2"><Check className="w-3 h-3 text-green-400 flex-shrink-0"/> 0% d'aveu de faute</li>
                     <li className="flex gap-2"><Check className="w-3 h-3 text-green-400 flex-shrink-0"/> Ton ferme и pro</li>
                     <li className="flex gap-2"><Check className="w-3 h-3 text-green-400 flex-shrink-0"/> Instantané (10s)</li>
                   </ul>
                   <div className="mt-auto pt-4 border-t border-slate-700 font-black text-green-400 text-center uppercase tracking-widest text-lg">9,90€ TTC</div>
                </div>
              </div>

              <button onClick={() => setStep('payment')} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-black transition shadow-2xl text-xl flex items-center justify-center gap-4">
                 <Shield className="w-6 h-6 text-green-400" /> Obtenir ma réponse sécurisée
              </button>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md mx-auto">
            <h2 className="font-black text-2xl mb-6 text-slate-900">Finaliser ma protection</h2>
            <div className="bg-blue-50 p-4 rounded-2xl mb-6 text-sm text-blue-700 leading-relaxed font-medium italic">Votre dossier sera généré и envoyé instantanément.</div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Email pour le dossier *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" className="w-full border-2 border-slate-100 p-4 rounded-2xl mb-6 outline-none focus:border-slate-800" />
            <button onClick={handlePaymentClick} className="w-full bg-green-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-green-500 transition uppercase tracking-widest">Payer 9,90€ и Recevoir</button>
            <button onClick={() => setStep('form')} className="w-full text-slate-400 mt-4 text-xs font-bold hover:text-slate-600 uppercase tracking-tighter transition">Retour au message</button>
          </div>
        )}

        {step === 'paid-result' && (
           <div className="space-y-6 animate-in zoom-in-95 duration-500">
             <div className="bg-white rounded-3xl shadow-2xl p-8 border-t-8 border-green-500">
               <div className="flex items-center gap-3 mb-6"><Check className="w-10 h-10 text-green-500" /><h2 className="font-black text-3xl text-slate-900">Dossier Prêt !</h2></div>
               <div className="bg-slate-50 p-8 rounded-3xl border-2 border-slate-100 text-slate-800 leading-relaxed font-serif text-lg mb-8 shadow-inner whitespace-pre-wrap italic">{paidResponse}</div>
               <button onClick={() => { navigator.clipboard.writeText(paidResponse); alert('Copié !'); }} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-black transition shadow-xl flex items-center justify-center gap-3">
                  <FileText className="w-6 h-6"/> Copier le texte
               </button>
             </div>

             <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-[3rem] p-10 shadow-2xl text-center border-b-8 border-green-500">
                <PartyPopper className="w-16 h-16 text-green-400 mx-auto mb-6" />
                <h3 className="text-3xl font-black mb-4 tracking-tight leading-none">Félicitations !<br/>Un dossier de moins à gérer.</h3>
                <p className="text-slate-400 mb-8 text-lg">Ne laissez plus les réclamations polluer votre quotidien. Sécurisez une autre demande dès maintenant.</p>
                <button onClick={() => window.location.href = '/'} className="bg-green-500 text-white font-black py-5 px-10 rounded-full transition transform hover:scale-105 shadow-[0_20px_50px_rgba(34,197,94,0.3)] flex items-center justify-center gap-3 mx-auto uppercase tracking-widest">
                  Sécuriser un autre dossier <ArrowRight className="w-6 h-6" />
                </button>
             </div>
           </div>
        )}

        <div className="mt-20 pt-10 border-t border-slate-200 text-center">
            <p className="font-black text-slate-800 text-lg mb-1 tracking-tighter uppercase">Réponse Sécurisée</p>
            <p className="text-slate-400 text-xs mb-8 font-medium">Outil d'aide à la rédaction administrative pour les Pros</p>
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10">
                <span className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full"><Lock className="w-3 h-3"/> Confidentialité</span>
                <span className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full"><Shield className="w-3 h-3"/> RGPD</span>
                <span className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full">Zero Data Log</span>
            </div>
            <button onClick={() => setShowSupport(true)} className="text-slate-400 text-xs hover:text-slate-900 font-bold transition flex items-center gap-2 mx-auto border-b border-transparent hover:border-slate-900 pb-1">
               <MessageSquare className="w-4 h-4"/> Support Client
            </button>
        </div>
      </div>

      {/* MODALE SUPPORT (БЕЗ ИЗМЕНЕНИЙ) */}
      {showSupport && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setShowSupport(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 text-2xl font-black">✕</button>
              <h3 className="font-black text-2xl text-slate-900 mb-6 flex items-center gap-2"><Mail className="text-blue-500"/> Support</h3>
              {supportSent ? (<div className="text-green-600 text-center py-8"><Check className="w-16 h-16 mx-auto mb-4" /><p className="font-black text-xl tracking-tight">Message envoyé !</p></div>) : (
                <form onSubmit={async (e) => { e.preventDefault(); setLoading(true); await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ type: 'feedback', name: supportName, email: supportEmail, message: supportMessage }) }); setSupportSent(true); setTimeout(() => setShowSupport(false), 2000); }} className="space-y-4">
                  <input required placeholder="Nom" className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-slate-800 outline-none" value={supportName} onChange={e => setSupportName(e.target.value)} />
                  <input required type="email" placeholder="Email" className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-slate-800 outline-none" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} />
                  <textarea required rows={4} placeholder="Votre question..." className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-slate-800 outline-none" value={supportMessage} onChange={e => setSupportMessage(e.target.value)} />
                  <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-black transition uppercase tracking-widest shadow-xl">Envoyer</button>
                </form>
              )}
           </div>
        </div>
      )}
    </div>
  );
}
