"use client";

import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, Loader2, Shield, Briefcase, Scale, AlertTriangle, XCircle } from 'lucide-react';

// 👇 СЮДА ВСТАВИТЬ ССЫЛКУ LEMON SQUEEZY
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
  
  useEffect(() => {}, []);
  const markFreeAsUsed = () => {};

  // Функция отправляет тип запроса ('free' или 'paid') на сервер
  const callOpenAI = async (type, userMessage, userEmail = null) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: type, 
          complaint: userMessage, 
          situation: situation, 
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

  const handleSubmitFree = async () => {
    setError('');
    if (!complaint || !situation) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setLoading(true);
    try {
      const result = await callOpenAI('free', complaint);
      setFreeResponse(result);
      markFreeAsUsed(); 
      setStep('free-result');
    } catch (err) {
      setError('Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClick = () => {
    if (LEMON_SQUEEZY_LINK && LEMON_SQUEEZY_LINK.includes('http')) {
        window.location.href = LEMON_SQUEEZY_LINK;
    } else {
        setStep('payment'); 
    }
  };

  const handlePaidGeneration = async () => {
    if (!email || !email.includes('@')) {
      setError('Veuillez saisir une adresse email valide.');
      return;
    }
    setLoading(true);
    try {
      const result = await callOpenAI('paid', complaint, email);
      setPaidResponse(result);
      setStep('paid-result');
    } catch (err) {
      setError('Une erreur technique est survenue.');
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto">
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

              <button
                onClick={handleSubmitFree}
                disabled={loading}
                className="w-full bg-slate-700 hover:bg-slate-800 text-white font-semibold py-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Générer une ébauche GRATUITE'}
              </button>
            </div>
          </div>
        )}

        {/* 📋 ЭКРАН РЕЗУЛЬТАТА - НОВЫЙ БЛОК ПРОДАЖ */}
        {step === 'free-result' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-slate-600 mb-4">Votre ébauche (Brouillon indicatif)</h2>
              
              {/* Текст бесплатного ответа */}
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 mb-8">
                <p className="text-slate-600 italic whitespace-pre-wrap">{freeResponse}</p>
              </div>

              {/* ЗАГОЛОВОК СРАВНЕНИЯ */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">
                  ⚠️ Attention : Une réponse imprécise peut être utilisée contre vous
                </h3>
                <p className="text-slate-600 text-sm mt-1">Comparatif des options pour sécuriser votre entreprise :</p>
              </div>

              {/* ТАБЛИЦА СРАВНЕНИЯ (ТРИГГЕРЫ) */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {/* 1. Делать самому */}
                <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center text-center opacity-70 hover:opacity-100 transition">
                   <div className="bg-slate-100 p-3 rounded-full mb-3">
                     <AlertTriangle className="w-6 h-6 text-slate-500" />
                   </div>
                   <h4 className="font-bold text-slate-700 mb-2">Répondre seul</h4>
                   <ul className="text-xs text-slate-600 space-y-2 mb-4 text-left w-full">
                     <li className="flex gap-2"><XCircle className="w-3 h-3 text-red-400"/> Risque d'émotion</li>
                     <li className="flex gap-2"><XCircle className="w-3 h-3 text-red-400"/> Formulations risquées</li>
                     <li className="flex gap-2"><XCircle className="w-3 h-3 text-red-400"/> Stress inutile</li>
                   </ul>
                   <div className="mt-auto pt-4 border-t w-full">
                     <span className="block text-xs text-slate-500">Coût potentiel</span>
                     <span className="font-bold text-red-600">Risque élevé</span>
                   </div>
                </div>

                {/* 2. Юрист */}
                <div className="
