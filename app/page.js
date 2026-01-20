"use client";

import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, Loader2, Shield, Briefcase, Scale, AlertTriangle, XCircle, Mail, FileText, BarChart3, MessageSquare, Lock, Download } from 'lucide-react';

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
        
        {/* АДМИН ПАНЕЛЬ */}
        {isAdmin && (
           <div className="bg-slate-800 text-white p-4 rounded-lg mb-8 shadow-lg flex justify-between items-center">
             <span className="font-bold">ADMIN MODE ACTIF 🎯</span>
             <span className="text-xs opacity-75">Les limites sont désactivées</span>
           </div>
        )}

        {/* ЗАГОЛОВОК (ВЕРНУЛ ВАШ ТЕКСТ) */}
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
             {/* ИКОНКИ ПРЕИМУЩЕСТВ */}
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

              {/* ЛОГИКА КНОПКИ ОПЛАТЫ */}
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
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <h2 className="font-bold text-xl text-slate-700">Votre ébauche (Brouillon indicatif)</h2>
            <div className="bg-slate-50 p-6 rounded border border-slate-200"><p className="italic text-slate-600 whitespace-pre-wrap">{freeResponse}</p></div>
            
            <div className="bg-yellow-50 p-4 rounded border border-yellow-200 text-sm text-yellow-800 flex gap-3">
               <AlertTriangle className="w-5 h-5 flex-shrink-0" />
               <p>Attention : Ce brouillon n'est pas sécurisé. Pour une protection juridique optimale (sans reconnaissance de faute), utilisez la version complète.</p>
            </div>

            <button onClick={handleDirectBuy} className="w-full bg-slate-800 text-white font-bold py-4 rounded-lg hover:bg-slate-900 transition shadow-lg text-lg">
               Obtenir la réponse sécurisée complète (9,90€)
            </button>
          </div>
        )}

        {step === 'payment' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="font-bold text-xl mb-4 text-slate-800">Sécurisation du dossier</h2>
            <div className="bg-blue-50 p-4 rounded mb-6 text-sm text-blue-800">
               Votre document sera généré instantanément après validation.
            </div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email pour recevoir le dossier *</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" className="w-full border p-3 rounded mb-4" />
            <button onClick={handlePaymentClick} className="w-full bg-green-600 text-white font-bold py-4 rounded shadow hover:bg-green-700 transition">
               Valider et accéder au paiement (9,90€)
            </button>
            <button onClick={() => setStep('form')} className="w-full text-slate-400 mt-2 text-sm hover:text-slate-600">Retour</button>
          </div>
        )}

        {step === 'paid-result' && (
           <div className="bg-white rounded-xl shadow-lg p-8">
             <div className="flex items-center gap-2 mb-4 text-green-600">
                <Check className="w-6 h-6" />
                <h2 className="font-bold text-xl">Dossier sécurisé généré</h2>
             </div>
             <div className="bg-slate-50 p-6 rounded mb-4 whitespace-pre-wrap border border-slate-200 text-slate-800 leading-relaxed font-serif">{paidResponse}</div>
             <button onClick={() => { navigator.clipboard.writeText(paidResponse); alert('Copié !'); }} className="w-full bg-slate-800 text-white font-bold py-3 rounded hover:bg-slate-900 mb-4">
                Copier le texte
             </button>
             <p className="text-sm text-center text-slate-500 bg-green-50 p-2 rounded border border-green-100">
                <Check className="w-3 h-3 inline mr-1"/> Une copie a été envoyée par email (après validation).
             </p>
             <button onClick={() => window.location.href = '/'} className="w-full mt-6 text-slate-400 text-sm hover:text-slate-600">Nouveau dossier</button>
           </div>
        )}

        {/* НИЖНИЙ БЛОК ДОВЕРИЯ (ИСПРАВЛЕННЫЙ - БЕЗ ДУБЛЕЙ) */}
        <div className="mt-12 pt-8 border-t border-slate-200 text-center">
            
            <p className="font-bold text-slate-600 mb-1">Réponse Sécurisée</p>
            <p className="text-slate-400 text-sm mb-4">Outil d'aide à la rédaction administrative</p>

            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-xs text-slate-500 uppercase tracking-wider mb-6">
                <span className="flex items-center gap-1"><Lock className="w-3 h-3"/> Confidentialité garantie</span>
                <span>•</span>
                <span>Aucune donnée stockée</span>
                <span>•</span>
                <span>Conforme RGPD</span>
            </div>

            <button onClick={() => setShowSupport(true)} className="text-slate-400 text-xs hover:text-slate-600 underline transition">
                Support / Contact
            </button>
        </div>

      </div>

      {/* МОДАЛКА ПОДДЕРЖКИ */}
      {showSupport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-slate-800">Support Client</h3>
                  <button onClick={() => setShowSupport(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              {supportSent ? (
                <div className="text-green-600 text-center py-8"><Check className="w-12 h-12 mx-auto mb-2" /><p>Message envoyé !</p></div>
              ) : (
                <form onSubmit={handleSupportSubmit} className="space-y-4">
                  <input required placeholder="Votre Nom" className="w-full border p-2 rounded" value={supportName} onChange={e => setSupportName(e.target.value)} />
                  <input required type="email" placeholder="Email" className="w-full border p-2 rounded" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} />
                  <textarea required rows={4} placeholder="Message..." className="w-full border p-2 rounded" value={supportMessage} onChange={e => setSupportMessage(e.target.value)} />
                  <button type="submit" disabled={loading} className="w-full bg-slate-800 text-white font-bold py-3 rounded hover:bg-slate-700">{loading ? '...' : 'Envoyer'}</button>
                </form>
              )}
           </div>
        </div>
      )}
    </div>
  );
}


