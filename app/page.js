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

  // Состояние для формы поддержки
  const [showSupport, setShowSupport] = useState(false);
  const [supportName, setSupportName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSent, setSupportSent] = useState(false);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isPaid = urlParams.get('paid');
    const adminCheck = urlParams.get('admin');

    if (adminCheck === 'true') {
      setIsAdmin(true);
    }

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
        if (localUsed) {
          setHasUsedFree(true);
        }
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
        body: JSON.stringify({ 
          type: 'feedback', 
          name: supportName,
          email: supportEmail,
          message: supportMessage
        }),
      });
      setSupportSent(true);
      setTimeout(() => {
        setShowSupport(false);
        setSupportSent(false);
        setSupportMessage('');
      }, 3000);
    } catch (err) {
      alert("Erreur d'envoi");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFree = async () => {
    setError('');
    
    if (hasUsedFree && !isAdmin) {
      return; 
    }

    if (!complaint || !situation) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setLoading(true);
    try {
      const result = await callOpenAI('free', complaint, situation);
      setFreeResponse(result);
      markFreeAsUsed(); 
      setStep('free-result');
    } catch (err) {
      setError('Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectBuy = () => {
    if (!complaint || !situation) {
      setError('Veuillez décrire la situation avant de continuer.');
      return;
    }
    setStep('payment');
  };

  const handlePaymentClick = () => {
    if (!email || !email.includes('@')) {
       alert("Veuillez entrer votre email pour recevoir le dossier.");
       return;
    }

    localStorage.setItem('pending_complaint', complaint);
    localStorage.setItem('pending_email', email);
    localStorage.setItem('pending_situation', situation);

    if (LEMON_SQUEEZY_LINK && LEMON_SQUEEZY_LINK.includes('http')) {
        window.location.href = LEMON_SQUEEZY_LINK;
    } else {
        alert("Lien de commande manquant");
    }
  };

  const resetForm = () => {
    setStep('form');
    setComplaint('');
    setFreeResponse('');
    setPaidResponse('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 font-sans text-slate-800 flex flex-col">
      <div className="max-w-4xl mx-auto flex-grow w-full">
        
        {/* АДМИН ПАНЕЛЬ */}
        {isAdmin && (
           <div className="bg-slate-800 text-white p-4 rounded-lg mb-8 shadow-lg border border-slate-600">
             <div className="flex items-center gap-2 mb-3 border-b border-slate-600 pb-2">
                <BarChart3 className="w-5 h-5 text-green-400" />
                <span className="font-bold">ADMIN DASHBOARD</span>
                <span className="text-xs bg-green-600 px-2 py-0.5 rounded text-white ml-auto">Mode Test Actif</span>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <a href="https://vercel.com/dashboard" target="_blank" className="bg-slate-700 p-3 rounded hover:bg-slate-600 transition text-center">
                    <span className="block font-bold text-lg">👁️ Trafic</span>
                    <span className="text-xs text-slate-300">Logs Vercel</span>
                </a>
                <a href="https://app.lemonsqueezy.com/orders" target="_blank" className="bg-slate-700 p-3 rounded hover:bg-slate-600 transition text-center">
                    <span className="block font-bold text-lg">📦 Commandes</span>
                    <span className="text-xs text-slate-300">Lemon Squeezy</span>
                </a>
             </div>
           </div>
        )}

        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 leading-tight">
            Une mauvaise réponse écrite peut vous coûter cher
          </h1>
          <p className="text-slate-600 text-base md:text-lg mb-3 max-w-3xl mx-auto">
            Évitez les pièges juridiques. Générez une réponse neutre, professionnelle et sans reconnaissance de faute.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* ШАГ 1: ФОРМА */}
        {step === 'form' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
             <div className="grid grid-cols-3 gap-4 mb-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                  <Shield className="w-6 h-6 text-slate-700" />
                </div>
                <div className="text-xs font-semibold text-slate-700">Sécurité</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                  <Briefcase className="w-6 h-6 text-slate-700" />
                </div>
                <div className="text-xs font-semibold text-slate-700">Professionnel</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                  <Check className="w-6 h-6 text-slate-700" />
                </div>
                <div className="text-xs font-semibold text-slate-700">Rapide</div>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-slate-800 mb-6">Générer une réponse</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Message du client *</label>
                <textarea
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 text-sm"
                  placeholder="Collez le message du client ici..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Situation *</label>
                <select
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                >
                  <option value="">Choisir...</option>
                  <option value="retard">Retard de travaux</option>
                  <option value="qualite">Défaut / Finitions</option>
                  <option value="facturation">Contestation facture</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              {/* ЛОГИКА КНОПОК */}
              {hasUsedFree && !isAdmin ? (
                // 🔴 Если тест использован
                <div className="space-y-3">
                  <div className="bg-orange-50 text-orange-800 text-sm p-3 rounded flex items-center gap-2">
                    <Lock className="w-4 h-4"/>
                    Test gratuit déjà utilisé. Passez à la version complète pour traiter ce cas.
                  </div>
                  <button
                    onClick={handleDirectBuy}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-lg transition shadow-lg flex items-center justify-center gap-2"
                  >
                    Obtenir ma réponse sécurisée (9,90€) →
                  </button>
                </div>
              ) : (
                // 🟢 Если новый пользователь
                <button
                  onClick={handleSubmitFree}
                  disabled={loading}
                  className="w-full bg-slate-700 hover:bg-slate-800 text-white font-semibold py-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Générer une ébauche GRATUITE'}
                </button>
              )}
              
            </div>
          </div>
        )}

        {/* ШАГ 2: РЕЗУЛЬТАТ (Free) */}
        {step === 'free-result' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-slate-600 mb-4">Votre ébauche (Brouillon indicatif)</h2>
              
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 mb-8">
                <p className="text-slate-600 italic whitespace-pre-wrap">{freeResponse}</p>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">
                  ⚠️ Attention : Une réponse imprécise peut être utilisée contre vous
                </h3>
                <p className="text-slate-600 text-sm mt-1">Comparatif des options pour sécuriser votre entreprise :</p>
              </div>

              {/* Таблица сравнения */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {/* Ответить самому */}
                <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center text-center opacity-70 hover:opacity-100 transition">
                   <div className="bg-slate-100 p-3 rounded-full mb-3">
                     <AlertTriangle className="w-6 h-6 text-slate-500" />
                   </div>
                   <h4 className="font-bold text-slate-700 mb-2">Répondre seul</h4>
                   <ul className="text-xs text-slate-600 space-y-2 mb-4 text-left w-full">
                     <li className="flex gap-2"><XCircle className="w-3 h-3 text-red-400"/> Risque d'émotion</li>
                     <li className="flex gap-2"><XCircle className="w-3 h-3 text-red-400"/> Formulations risquées</li>
                   </ul>
                   <div className="mt-auto pt-4 border-t w-full">
                     <span className="block text-xs text-slate-500">Coût potentiel</span>
                     <span className="font-bold text-red-600">Risque élevé</span>
                   </div>
                </div>

                {/* Юрист */}
                <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center text-center">
                   <div className="bg-blue-50 p-3 rounded-full mb-3">
                     <Scale className="w-6 h-6 text-blue-600" />
                   </div>
                   <h4 className="font-bold text-slate-700 mb-2">Avocat</h4>
                   <ul className="text-xs text-slate-600 space-y-2 mb-4 text-left w-full">
                     <li className="flex gap-2"><Check className="w-3 h-3 text-green-500"/> Sécurité juridique</li>
                     <li className="flex gap-2"><Check className="w-3 h-3 text-green-500"/> Professionnel</li>
                   </ul>
                   <div className="mt-auto pt-4 border-t w-full">
                     <span className="block text-xs text-slate-500">Coût moyen</span>
                     <span className="font-bold text-slate-800">~250€ / heure</span>
                   </div>
                </div>

                {/* Наш сервис */}
                <div className="border-2 border-slate-800 bg-slate-50 rounded-xl p-4 flex flex-col items-center text-center relative shadow-lg transform scale-105 z-10">
                   <div className="absolute -top-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                     Recommandé
                   </div>
                   <div className="bg-slate-800 p-3 rounded-full mb-3">
                     <Shield className="w-6 h-6 text-white" />
                   </div>
                   <h4 className="font-bold text-slate-800 mb-2">Notre IA Experte</h4>
                   <ul className="text-xs text-slate-700 space-y-2 mb-4 text-left w-full">
                     <li className="flex gap-2"><Check className="w-3 h-3 text-green-600"/> <strong>Immédiat</strong> (10 sec)</li>
                     <li className="flex gap-2"><Check className="w-3 h-3 text-green-600"/> Neutre & Factuel</li>
                   </ul>
                   <div className="mt-auto pt-4 border-t border-slate-300 w-full">
                     <span className="block text-xs text-slate-500">Participation</span>
                     <span className="font-bold text-2xl text-green-600">9,90€</span>
                   </div>
                </div>
              </div>
              
              {/* Кнопка заказа */}
              <div className="text-center mt-6">
                <button
                  onClick={handleDirectBuy}
                  className="w-full md:w-auto px-8 bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-lg transition shadow-xl text-lg flex items-center justify-center gap-3 mx-auto"
                >
                  <Shield className="w-5 h-5" />
                  Obtenir ma réponse sécurisée - 9,90€
                </button>
              </div>

            </div>
            
            <button onClick={resetForm} className="text-slate-500 hover:text-slate-700 mx-auto block text-sm">
              Recommencer
            </button>
          </div>
        )}

        {/* ШАГ 3: ВВОД EMAIL И ЗАКАЗ */}
        {step === 'payment' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Dernière étape</h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6 text-sm text-yellow-800">
              <strong>Sécurisation du dossier :</strong> Veuillez renseigner votre email pour recevoir le document final.
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Votre email professionnel *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
              />
            </div>

            <button
              onClick={handlePaymentClick}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg mb-4 transition shadow-md"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Valider et recevoir le dossier (9,90€)'}
            </button>

            <button onClick={() => setStep('form')} className="w-full text-slate-500 py-2">Retour</button>
          </div>
        )}

        {/* ШАГ 4: ФИНАЛ (ОТВЕТ) */}
        {step === 'paid-result' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center gap-2 mb-6 text-green-600">
                <Check className="w-6 h-6" />
                <h2 className="text-2xl font-semibold text-slate-800">Dossier sécurisé généré</h2>
              </div>

              <div className="bg-slate-50 rounded-lg p-8 border border-slate-200 mb-6 shadow-inner">
                <p className="text-slate-800 whitespace-pre-wrap leading-relaxed font-serif text-justify">{paidResponse}</p>
              </div>

              <button
                onClick={() => { navigator.clipboard.writeText(paidResponse); alert('Copié !'); }}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-4 rounded-lg transition shadow-lg flex items-center justify-center gap-2"
              >
                📋 Copier le texte
              </button>
              <p className="text-center text-sm text-slate-500 mt-4">
                 Une copie est en cours d'envoi à {email}
              </p>
            </div>
             <button onClick={resetForm} className="text-slate-500 hover:text-slate-700 mx-auto block">Nouveau dossier</button>
          </div>
        )}
      </div>

      {/* FOOTER & CONTACT */}
      <footer className="w-full mt-12 py-6 border-t border-slate-200 text-center">
          <button 
             onClick={() => setShowSupport(true)}
             className="text-slate-500 text-sm hover:text-slate-800 flex items-center justify-center gap-2 mx-auto"
          >
             <MessageSquare className="w-4 h-4" />
             Support / Signaler un problème
          </button>
      </footer>

      {/* МОДАЛЬНОЕ ОКНО ПОДДЕРЖКИ */}
      {showSupport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-slate-800">Contact / Support</h3>
                  <button onClick={() => setShowSupport(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              
              {supportSent ? (
                <div className="text-green-600 text-center py-8">
                   <Check className="w-12 h-12 mx-auto mb-2" />
                   <p>Message envoyé !</p>
                </div>
              ) : (
                <form onSubmit={handleSupportSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Votre Nom</label>
                    <input 
                      required
                      className="w-full border p-2 rounded"
                      value={supportName}
                      onChange={e => setSupportName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Email pour la réponse</label>
                    <input 
                      required
                      type="email"
                      className="w-full border p-2 rounded"
                      value={supportEmail}
                      onChange={e => setSupportEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Votre Message</label>
                    <textarea 
                      required
                      rows={4}
                      className="w-full border p-2 rounded"
                      value={supportMessage}
                      onChange={e => setSupportMessage(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-slate-800 text-white font-bold py-3 rounded hover:bg-slate-700"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : 'Envoyer le message'}
                  </button>
                </form>
              )}
           </div>
        </div>
      )}
    </div>
  );
}
