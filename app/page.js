"use client";

import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, Loader2, Shield, FileCheck } from 'lucide-react';

// 👇 СЮДА ВСТАВИТЬ ССЫЛКУ LEMON SQUEEZY (когда создадите товар)
const LEMON_SQUEEZY_LINK = ""; 

// 🔴 ПРОМПТ БЕСПЛАТНЫЙ
const PROMPT_FREE = `Tu es un assistant administratif basique.
Ta mission est de rédiger un simple ACCUSÉ DE RÉCEPTION.
RÈGLES :
* Fais très COURT (2 ou 3 phrases maximum).
* Dis seulement : "Nous avons bien reçu votre réclamation concernant [sujet]. Nous allons étudier votre dossier. Sans réponse de notre part sous 15 jours, considérez le dossier clos."
* Sois froid et robotique.
* Ne donne AUCUNE explication, AUCUNE excuse, AUCUN détail.`;

// 🟢 ПРОМПТ ПЛАТНЫЙ
const PROMPT_PAID = `Tu es un expert juridique senior spécialisé dans la gestion des litiges du bâtiment et des services.
Ta mission est de rédiger une réponse OFFICIELLE, DÉTAILLÉE et STRATÉGIQUE.

IMPORTANT - INTÉGRATION DES DÉTAILS :
* Analyse le message du client et INTÈGRE directement les détails spécifiques
* NE JAMAIS utiliser de placeholders comme [date], [sujet], [nom]
* Si une information manque, utilise une formulation neutre générique
* La réponse doit être DIRECTEMENT utilisable sans modification

STRUCTURE OBLIGATOIRE :
1. "Objet : Réponse à votre signalement" (Sans crochets)
2. Formule d'appel formelle.
3. Corps de la lettre : Rappel factuel, Analyse technique/juridique (vocabulaire soutenu), Rejet motivé de la demande (pas d'indemnisation).
4. Ouverture procédurale stricte.
5. Formule de politesse très formelle.

TON :
* Professionnel, courtois mais ferme.
* Juridique et "Corporate".
* Ne JAMAIS s'excuser.
* Longueur : 15-20 lignes minimum.`;

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

  useEffect(() => {
    // Я ОТКЛЮЧИЛ ПРОВЕРКУ ПАМЯТИ БРАУЗЕРА
    // Теперь сайт "забывает", что вы уже были здесь
    /*
    if (typeof window !== 'undefined') {
      const localUsed = localStorage.getItem('used_free_test');
      if (localUsed) {
        setHasUsedFree(true);
      }
    }
    */
  }, []);

  const markFreeAsUsed = () => {
    // Я ОТКЛЮЧИЛ ЗАПИСЬ В ПАМЯТЬ
    // localStorage.setItem('used_free_test', 'true');
    // setHasUsedFree(true);
  };

  const callOpenAI = async (systemPrompt, userMessage) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          systemPrompt: systemPrompt, 
          userMessage: userMessage 
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

    // Я ОТКЛЮЧИЛ БЛОКИРОВКУ
    /*
    if (hasUsedFree) {
      setError('Vous avez déjà utilisé votre test gratuit. Pour obtenir une réponse complète, procédez au paiement de 9,90€.');
      return;
    }
    */

    setLoading(true);
    try {
      const response = await callOpenAI(PROMPT_FREE, `Situation: ${situation}. Message client: ${complaint}`);
      setFreeResponse(response);
      markFreeAsUsed(); 
      setStep('free-result');
    } catch (err) {
      console.error('Error:', err);
      setError('Une erreur est survenue lors de la génération. Veuillez réessayer.');
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
    // ОБЯЗАТЕЛЬНАЯ проверка Email для платной версии
    if (!email || !email.includes('@')) {
      setError('Veuillez saisir une adresse email valide pour recevoir votre dossier.');
      return;
    }
    
    setLoading(true);
    try {
      const fullMessage = `Situation: ${situation}. Message client: ${complaint}. (Email client: ${email})`;
      
      const response = await callOpenAI(PROMPT_PAID, fullMessage);
      setPaidResponse(response);
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
            Une mauvaise réponse écrite peut créer un risque juridique
          </h1>
          <p className="text-slate-600 text-base md:text-lg mb-3 max-w-3xl mx-auto">
            Générez une réponse professionnelle et juridiquement neutre, sans reconnaissance de faute ni engagement.
          </p>
          <p className="text-sm text-slate-500 mb-4">
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
             {/* Иконки преимуществ */}
             <div className="grid grid-cols-3 gap-4 mb-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                  <Shield className="w-6 h-6 text-slate-700" />
                </div>
                <div className="text-xs font-semibold text-slate-700">Sans reconnaissance de faute</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                  <FileCheck className="w-6 h-6 text-slate-700" />
                </div>
                <div className="text-xs font-semibold text-slate-700">Sans promesse de compensation</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                  <Check className="w-6 h-6 text-slate-700" />
                </div>
                <div className="text-xs font-semibold text-slate-700">Ton neutre et factuel</div>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-slate-800 mb-6">Voir un exemple de réponse</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Message de réclamation du client *
                </label>
                <textarea
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm"
                  placeholder="Exemple : Bonjour, je vous contacte concernant les travaux réalisés chez moi le mois dernier. La qualité du travail ne correspond pas à ce qui était prévu dans le devis..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Type de situation *</label>
                <select
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                >
                  <option value="">Sélectionnez...</option>
                  <option value="retard">Retard de travaux</option>
                  <option value="qualite">Qualité contestée</option>
                  <option value="facturation">Facturation</option>
                  <option value="comportement">Communication</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              {/* Кнопка бесплатного теста */}
              <button
                onClick={handleSubmitFree}
                disabled={loading}
                className="w-full bg-slate-700 hover:bg-slate-800 text-white font-semibold py-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  'Générer une réponse test'
                )}
              </button>
            </div>

            {/* БЛОК КОНФИДЕНЦИАЛЬНОСТИ */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-700">
                  <p className="font-semibold text-slate-800 mb-1">Confidentialité garantie</p>
                  <p className="text-xs text-slate-600">Aucune donnée stockée • Conforme RGPD</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ЭКРАН РЕЗУЛЬТАТА (БЕСПЛАТНЫЙ) */}
        {step === 'free-result' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-6">Votre aperçu - Version TEST</h2>

              <div className="bg-slate-50 rounded-lg p-6 mb-6 border border-slate-200">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{freeResponse}</p>
              </div>

              <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-slate-800 mb-3">✓ Ce que vous avez reçu (TEST)</h3>
                <p className="text-sm text-slate-600 mb-4">Simple accusé de réception automatique</p>
                
                <h3 className="font-bold text-slate-800 mb-3 mt-4">Ce qui manque pour une réponse professionnelle</h3>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>• Analyse juridique du problème</li>
                  <li>• Argumentaire de défense complet</li>
                  <li>• Vocabulaire technique et formel</li>
                  <li>• Protection contre les recours</li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-2 border-slate-300 rounded-xl p-6">
                <h3 className="font-bold text-slate-800 text-lg mb-4">Réponse complète - 9,90€</h3>
                
                <div className="bg-white rounded-lg p-4 mb-4 border-l-4 border-slate-600">
                  <p className="text-sm text-slate-700 mb-2">
                    💡 <strong>Lettre officielle prête à l'envoi</strong>
                  </p>
                  <p className="text-xs text-slate-600">
                    Inclut: Références juridiques, ton ferme, et rejet de responsabilité justifié.
                  </p>
                </div>

                <button
                  onClick={handlePaymentClick}
                  className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-4 rounded-lg transition"
                >
                  Accéder à la réponse complète - 9,90€
                </button>
              </div>
            </div>
            
            <button onClick={resetForm} className="text-slate-600 hover:text-slate-800 mx-auto block">
              ← Nouvelle réclamation
            </button>
          </div>
        )}

        {/* ЭКРАН ОПЛАТЫ (ДЕМО) */}
        {step === 'payment' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Accès à la réponse complète</h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6 text-sm text-yellow-800">
              <strong>MODE DÉMO:</strong> Simulation. Ajoutez votre lien Lemon Squeezy dans le code.
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Votre email (obligatoire pour recevoir le dossier) *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
              />
            </div>

            <button
              onClick={handlePaidGeneration}
              disabled={loading}
              className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-4 rounded mb-4 disabled:opacity-50 transition"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Simuler le paiement (9,90€)'}
            </button>

            <button onClick={() => setStep('free-result')} className="w-full text-slate-600 hover:text-slate-800 py-2">
              ← Retour
            </button>
          </div>
        )}

        {/* ЭКРАН ФИНАЛА (ПОСЛЕ ОПЛАТЫ) */}
        {step === 'paid-result' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-6">Votre réponse complète</h2>

              <div className="bg-green-50 border border-green-200 rounded p-4 mb-6 text-sm text-green-800">
                ✅ Réponse générée avec succès. <br/>
                <span className="text-xs">
