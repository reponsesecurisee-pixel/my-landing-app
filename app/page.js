"use client";

import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, Loader2, Shield, Briefcase, Scale, AlertTriangle, XCircle, Mail, FileText, BarChart3, MessageSquare, Lock, Download, PartyPopper } from 'lucide-react';

// 👇 ВАША ССЫЛКА LEMON SQUEEZY
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
  
  useEffect(() => {
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
        const localUsed = localStorage.getItem('used_free_test');
        if (localUsed) setHasUsedFree(true);
      }
    }
  }, []);

  const markFreeAsUsed = () => {
    if (!isAdmin) {
      localStorage.setItem('used_free_test', 'true');
      setHasUsedFree(true);
    }
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
    } catch (err) {
      setError('Erreur lors de la génération. Contactez le support.');
    } finally {
      setLoading(false);
    }
  };

  const callOpenAI = async (type, userMessage, userSit, userEmail = null) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: type, 
          complaint: userMessage, 
          situation: userSit, 
          email: userEmail 
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur API');
      return data.result;
    } catch (error) {
      console.error("API Call Error:", error);
      throw error;
    }
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'feedback', name: supportName, email: supportEmail, message: supportMessage }),
      });
      setSupportSent(true);
      setTimeout(() => { setShowSupport(false); setSupportSent(false); setSupportMessage(''); }, 3000);
    } catch (err) { alert("Erreur d'envoi"); } finally { setLoading(false); }
  };

  const handleSubmitFree = async () => {
    setError('');
    if (hasUsedFree && !isAdmin) return; 
    if (!complaint || !situation) {
      alert("✍️ Veuillez décrire la situation !");
      return;
    }
    setLoading(true);
    try {
      const result = await callOpenAI('free', complaint, situation);
      setFreeResponse(result);
      markFreeAsUsed(); 
      setStep('free-result');
    } catch (err) { setError('Une erreur est survenue.'); } finally { setLoading(false); }
  };

  const handleDirectBuy = () => {
    if (!complaint || !situation) {
      alert("✍️ Veuillez remplir le message !");
      return;
    }
    setStep('payment');
  };

  const handlePaymentClick = () => {
    if (!email || !email.includes('@')) { alert("✉️ Email requis !"); return; }
    localStorage.setItem('pending_complaint', complaint);
    localStorage.setItem('pending_email', email);
    localStorage.setItem('pending_situation', situation);
    if (LEMON_SQUEEZY_LINK) window.location.href = LEMON_SQUEEZY_LINK;
  };

  const resetForm = () => {
    setStep('form'); setComplaint(''); setFreeResponse(''); setPaidResponse(''); setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 font-sans text-slate-800 flex flex-col">
      <div className="max-w-4xl mx-auto flex-grow w-full">
        
        {isAdmin && (
           <div className="bg-slate-800 text-white p-4 rounded-lg mb-8 shadow-lg flex justify-between items-center">
             <span className="font-bold">ADMIN MODE ACTIF 🎯</span>
             <span className="text-xs opacity-75">Les limites sont désактиvées</span>
           </div>
        )}

        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 leading-tight">
            Une mauvaise réponse écrite peut créer un risque juridique
          </h1>
          <p className="text-slate-600 text-base md:text-lg mb-2 max-w-3xl mx-auto">
            Générez une réponse professionnelle et juridiquement neutre, sans reconnaissance de faute ni engagement.
          </p>
          <p className="text-slate-500 text-sm md:text-base italic max-w-3xl mx-auto">
             Pour les artisans et petites entreprises du bâtiment confrontés à des réclamations clients
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {step === 'form' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
             <div className="grid grid-cols-3 gap-4 mb-8 text-center border-b pb-6 border-slate-100">
              <div className="flex flex-col items-center">
                <Shield className="w-8 h-8 text-slate-700 mb-2" />
                <div className="text-xs font-semibold text-slate-600">Juridiquement Neutre</div>
              </div>
              <div className="flex flex-col items-center">
                <Briefcase className="w-8 h-8 text-slate-700 mb-2" />
                <div className="text-xs font-semibold text-slate-600">Professionnel</div>
              </div>
              <div className="flex flex-col items-center">
                <Lock className="w-8 h-8 text-slate-700 mb-2" />
                <div className="text-xs font-semibold text-slate-600">Confidentialité</div>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-slate-800 mb-6">Générer une réponse</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Message du client *</label>
                <textarea value={complaint} onChange={(e) => setComplaint(e.target.value)} rows={6} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 text-sm" placeholder="Collez le message du client ici..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Situation *</label>
                <select value={situation} onChange={(e) => setSituation(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg">
                  <option value="">Choisir...</option>
                  <option value="retard">Retard de travaux</option>
                  <option value="qualite">Défaut / Finitions</option>
                  <option value="facturation">Contestation facture</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              {hasUsedFree && !isAdmin ? (
                <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-orange-800 text-sm flex items-center gap-2 font-medium">
                    <Lock className="w-4 h-4"/> Test gratuit déjà utilisé.
                  </div>
                  <button onClick={handleDirectBuy} className="w-full bg-slate-800 text-white font-bold py-4 rounded-lg hover:bg-slate-900 transition shadow-lg flex items-center justify-center gap-2">
                    Obtenir ma réponse sécurisée (9,90€) →
                  </button>
                  <p className="text-center text-xs text-slate-500">Aucune donnée stockée • Paiement sécurisé</p>
                </div>
              ) : (
                <button onClick={handleSubmitFree} disabled={loading} className="w-full bg-slate-700 text-white font-semibold py-4 rounded-lg hover:bg-slate-800 transition flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" /> : 'Générer une ébauche GRATUITE'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Результат теста */}
        {step === 'free-result' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="font-bold text-xl text-slate-700 mb-4">Votre ébauche (Brouillon indicatif)</h2>
              <div className="bg-slate-50 p-6 rounded border border-slate-200 mb-8"><p className="italic text-slate-600 whitespace-pre-wrap">{freeResponse}</p></div>
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">⚠️ Attention : Une réponse imprécise peut être utilisée contre vous</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center text-center opacity-70">
                   <AlertTriangle className="w-6 h-6 text-slate-500 mb-3" />
                   <h4 className="font-bold text-slate-700 mb-2 text-sm">Répondre seul</h4>
                   <div className="mt-auto pt-4 border-t w-full font-bold text-red-600 text-xs">Risque élevé</div>
                </div>
                <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center text-center">
                   <Scale className="w-6 h-6 text-blue-600 mb-3" />
                   <h4 className="font-bold text-slate-700 mb-2 text-sm">Avocat</h4>
                   <div className="mt-auto pt-4 border-t w-full font-bold text-slate-800 text-xs">~250€ / heure</div>
                </div>
                <div className="border-2 border-slate-800 bg-slate-50 rounded-xl p-4 flex flex-col items-center text-center shadow-lg transform scale-105">
                   <Shield className="w-6 h-6 text-slate-800 mb-3" />
                   <h4 className="font-bold text-slate-800 mb-2 text-sm">Notre IA Experte</h4>
                   <div className="mt-auto pt-4 border-t border-slate-300 w-full font-bold text-green-600">9,90€</div>
                </div>
              </div>

              <button onClick={handleDirectBuy} className="w-full bg-slate-800 text-white font-bold py-4 rounded-lg hover:bg-slate-900 transition shadow-lg text-lg flex items-center justify-center gap-3">
                 <Shield className="w-5 h-5" />
                 Obtenir la réponse sécurisée complète (9,90€)
              </button>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="font-bold text-xl mb-4 text-slate-800">Sécurisation du dossier</h2>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email..." className="w-full border p-3 rounded mb-4" />
            <button onClick={handlePaymentClick} className="w-full bg-green-600 text-white font-bold py-4 rounded shadow hover:bg-green-700 transition">
               Valider et accéder au paiement (9,90€)
            </button>
          </div>
        )}

        {/* 👇 ЭКРАН УСПЕХА С ПРИЗЫВОМ К ПОВТОРНОЙ ПРОДАЖЕ 👇 */}
        {step === 'paid-result' && (
           <div className="space-y-6 animate-in fade-in duration-500">
             <div className="bg-white rounded-xl shadow-lg p-8">
               <div className="flex items-center gap-3 mb-4 text-green-600">
                  <Check className="w-8 h-8" />
                  <h2 className="font-bold text-2xl">Dossier sécurisé généré !</h2>
               </div>
               
               <div className="bg-slate-50 p-6 rounded mb-6 whitespace-pre-wrap border border-slate-200 text-slate-800 leading-relaxed font-serif shadow-inner">
                  {paidResponse}
               </div>

               <button onClick={() => { navigator.clipboard.writeText(paidResponse); alert('Copié !'); }} className="w-full bg-slate-800 text-white font-bold py-4 rounded-lg hover:bg-slate-900 mb-4 flex items-center justify-center gap-2 shadow-lg">
                  <FileText className="w-5 h-5"/> Copier le texte de la réponse
               </button>
               
               <div className="text-sm text-center text-slate-500 bg-green-50 p-3 rounded border border-green-100 flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4 text-green-600"/> 
                  <span>Une copie de sauvegarde arrive sur votre email.</span>
               </div>
             </div>

             {/* Блок допродажи (Upsell) */}
             <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl p-8 shadow-2xl border-t-4 border-green-500 text-center">
                <PartyPopper className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-3">Félicitations ! Un dossier de moins à gérer.</h3>
                <p className="text-slate-300 mb-6 text-lg">
                  Ne laissez plus les réclamations polluer votre quotidien. Avez-vous une autre demande client à sécuriser dès maintenant ?
                </p>
                <button 
                  onClick={() => window.location.href = '/'} 
                  className="bg-green-600 hover:bg-green-500 text-white font-black py-4 px-8 rounded-full transition transform hover:scale-105 shadow-xl flex items-center justify-center gap-3 mx-auto uppercase tracking-wider"
                >
                  Sécuriser un autre dossier <ArrowRight className="w-5 h-5" />
                </button>
                <p className="mt-4 text-xs text-slate-500">
                  Protégez votre entreprise dossier après dossier.
                </p>
             </div>
           </div>
        )}

        <div className="mt-12 pt-8 border-t border-slate-200 text-center">
            <p className="font-bold text-slate-600 mb-1">Réponse Sécurisée</p>
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-xs text-slate-500 uppercase tracking-wider mb-6">
                <span className="flex items-center gap-1"><Lock className="w-3 h-3"/> Confidentialité garantie</span>
                <span>•</span>
                <span>Aucune donnée stockée</span>
                <span>•</span>
                <span>Conforme RGPD</span>
            </div>
            <button onClick={() => setShowSupport(true)} className="text-slate-400 text-xs hover:text-slate-600 underline">Support / Contact</button>
        </div>
      </div>
      {/* (Модалка поддержки остается без изменений) */}
    </div>
  );
}

// Вспомогательная иконка для кнопки
function ArrowRight({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}


