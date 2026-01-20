"use client";

import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, Loader2, Shield, Briefcase, Star, Clock, FileText } from 'lucide-react';

// 👇 СЮДА ВСТАВИТЬ ССЫЛКУ LEMON SQUEEZY
const LEMON_SQUEEZY_LINK = ""; 

// 🔴 ПРОМПТ БЕСПЛАТНЫЙ (Вежливый "режим ожидания")
const PROMPT_FREE = `Tu es un assistant administratif poli et courtois.
Ta mission est de rédiger un ACCUSÉ DE RÉCEPTION D'ATTENTE.
RÈGLES :
* Ton objectif est de temporiser (gagner du temps) sans énerver le client.
* Remercie pour le message de façon professionnelle.
* Dis simplement : "Nous avons bien pris en compte votre remarque concernant [sujet]. Nous allons transmettre les éléments à l'équipe technique pour analyse. Nous reviendrons vers vous une fois les vérifications effectuées."
* Ne donne AUCUN délai précis.
* Ne prends AUCUN engagement, ni refus, ni acceptation. Juste "on regarde".`;

// 🟢 ПРОМПТ ПЛАТНЫЙ (Ваш строгий оригинал)
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
  
  // Отключили ограничения для теста
  useEffect(() => {}, []);
  const markFreeAsUsed = () => {};

  const callOpenAI = async (systemPrompt, userMessage) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, userMessage }),
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
      const response = await callOpenAI(PROMPT_FREE, `Situation: ${situation}. Message client: ${complaint}`);
      setFreeResponse(response);
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
            Gérez les réclamations abusives sans perdre votre calme
          </h1>
          <p className="text-slate-600 text-base md:text-lg mb-3 max-w-3xl mx-auto">
            Obtenez une réponse professionnelle, ferme et factuelle pour clore les discussions stériles.
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
                <div className="text-xs font-semibold text-slate-700">Protection image</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                  <Briefcase className="w-6 h-6 text-slate-700" />
                </div>
                <div className="text-xs font-semibold text-slate-700">Ton expert</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                  <Check className="w-6 h-6 text-slate-700" />
                </div>
                <div className="text-xs font-semibold text-slate-700">Sans faute</div>
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
                  <option value="retard">Retard de chantier</option>
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
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Générer réponse TEST'}
              </button>
            </div>
          </div>
        )}

        {/* 📋 ЭКРАН РЕЗУЛЬТАТА - БИЗНЕС ПОДХОД */}
        {step === 'free-result' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-slate-600 mb-4">Résultat du Test (Version Standard)</h2>
              
              {/* Сам текст ответа */}
              <div className="bg-slate-50 rounded-lg p-6 mb-8 border border-slate-200">
                <p className="text-slate-600 italic">"{freeResponse}"</p>
              </div>

              {/* Блок Экспертного Совета (Сравнение) */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Star className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">Analyse de l'expert</h3>
                    <p className="text-sm text-slate-700 mb-4 leading-relaxed">
                      Ce message est poli, mais c'est une <strong>réponse d'attente</strong> (passif). Elle ne règle pas le litige.
                      <br/>
                      Pour clore le dossier, vous devez passer d'une posture "d'écoute" à une posture "d'autorité".
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-white p-3 rounded border border-slate-200 opacity-80">
                        <div className="flex items-center gap-2 mb-1">
                             <Clock className="w-4 h-4 text-slate-400"/>
                             <span className="text-xs font-bold text-slate-500 uppercase">Version Gratuite</span>
                        </div>
                        <span className="text-sm text-slate-600">"Nous allons regarder..." <br/>(Le client attend et relance)</span>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                             <FileText className="w-4 h-4 text-green-600"/>
                             <span className="text-xs font-bold text-green-600 uppercase">Version Payante</span>
                        </div>
                        <span className="text-sm text-slate-800">"Conformément au devis..." <br/>(Le dossier est clos)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 text-white rounded-xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Obtenez la réponse Ferme & Définitive</h3>
                  <span className="font-bold text-2xl">9,90€</span>
                </div>
                <ul className="text-sm text-slate-300 space-y-2 mb-6">
                  <li className="flex gap-2"><Check className="w-4 h-4 text-green-400"/> Argumentation technique et factuelle</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-green-400"/> Ton professionnel qui impose le respect</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-green-400"/> Objectif : Clore le dossier sans suite</li>
                </ul>
                
                <button
                  onClick={handlePaymentClick}
                  className="w-full bg-white text-slate-900 font-bold py-4 rounded-lg hover:bg-slate-100 transition shadow-md"
                >
                  Télécharger la réponse complète
                </button>
              </div>

            </div>
            
            <button onClick={resetForm} className="text-slate-500 hover:text-slate-700 mx-auto block text-sm">
              Recommencer le test
            </button>
          </div>
        )}

        {/* ЭКРАН ОПЛАТЫ */}
        {step === 'payment' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Dernière étape</h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6 text-sm text-yellow-800">
              <strong>MODE DÉMO:</strong> Le paiement est simulé.
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Où envoyer le dossier complet ? *
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
              onClick={handlePaidGeneration}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg mb-4 transition shadow-md"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Accéder à la réponse (Simulation 9,90€)'}
            </button>

            <button onClick={() => setStep('free-result')} className="w-full text-slate-500 py-2">Retour</button>
          </div>
        )}

        {/* ЭКРАН ФИНАЛА */}
        {step === 'paid-result' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center gap-2 mb-6 text-green-600">
                <Check className="w-6 h-6" />
                <h2 className="text-2xl font-semibold text-slate-800">Dossier généré</h2>
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
              <p className="text-center text-sm text-slate-500 mt-4">Une copie a été envoyée à {email}</p>
            </div>
             <button onClick={resetForm} className="text-slate-500 hover:text-slate-700 mx-auto block">Nouveau dossier</button>
          </div>
        )}
      </div>
    </div>
  );
}
