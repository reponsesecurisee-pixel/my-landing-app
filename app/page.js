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
        {isAdmin && (
           <div className="bg-slate-800 text-white p-4 rounded-lg mb-8 shadow-lg">
             <span className="font-bold">ADMIN MODE ACTIF 🎯</span>
           </div>
        )}

        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Une mauvaise réponse peut coûter cher 🎯</h1>
          <p className="text-slate-600">Générez une réponse professionnelle instantanément.</p>
        </div>

        {step === 'form' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">Générer une réponse</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Message du client *</label>
                <textarea value={complaint} onChange={(e) => setComplaint(e.target.value)} rows={6} className="w-full px-4 py-3 border rounded-lg" placeholder="Collez le message..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Situation *</label>
                <select value={situation} onChange={(e) => setSituation(e.target.value)} className="w-full px-4 py-3 border rounded-lg">
                  <option value="">Choisir...</option>
                  <option value="retard">Retard</option>
                  <option value="qualite">Défaut</option>
                  <option value="facturation">Facture</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              {/* 👇 ВОТ ЭТА ЛОГИКА МЕНЯЕТ КНОПКУ 👇 */}
              {hasUsedFree && !isAdmin ? (
                <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-orange-800 text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4"/> Test gratuit terminé.
                  </div>
                  <button onClick={handleDirectBuy} className="w-full bg-slate-800 text-white font-bold py-4 rounded-lg hover:bg-slate-900 transition">
                    Obtenir ma réponse sécurisée (9,90€) →
                  </button>
                </div>
              ) : (
                <button onClick={handleSubmitFree} disabled={loading} className="w-full bg-slate-700 text-white font-semibold py-4 rounded-lg hover:bg-slate-800 transition">
                  {loading ? <Loader2 className="animate-spin" /> : 'Essai Gratuit'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Остальные шаги (Resultats, Payment) */}
        {step === 'free-result' && (
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <h2 className="font-bold text-xl">Résultat (Brouillon)</h2>
            <div className="bg-slate-50 p-6 rounded border"><p className="italic">{freeResponse}</p></div>
            <button onClick={handleDirectBuy} className="w-full bg-green-600 text-white font-bold py-4 rounded-lg hover:bg-green-700">Sécuriser ma réponse (9,90€)</button>
          </div>
        )}

        {step === 'payment' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="font-bold text-xl mb-4">Où envoyer le dossier ?</h2>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email..." className="w-full border p-3 rounded mb-4"/>
            <button onClick={handlePaymentClick} className="w-full bg-green-600 text-white font-bold py-4 rounded">Aller au paiement (9,90€)</button>
            <button onClick={() => setStep('form')} className="w-full text-slate-400 mt-2 text-sm">Retour</button>
          </div>
        )}

        {step === 'paid-result' && (
           <div className="bg-white rounded-xl shadow-lg p-8">
             <h2 className="text-green-600 font-bold text-xl mb-4">Dossier Prêt ✅</h2>
             <div className="bg-slate-50 p-6 rounded mb-4 whitespace-pre-wrap">{paidResponse}</div>
             <p className="text-sm text-slate-500 bg-green-50 p-2 rounded">Une copie a été envoyée par email (après validation).</p>
             <button onClick={() => window.location.href = '/'} className="w-full mt-4 text-slate-500">Nouveau dossier</button>
           </div>
        )}
      </div>
    </div>
  );
}



