"use client";

import React, { useState, useEffect } from 'react';
import { Mail, Check, AlertCircle, Loader2, Shield, FileCheck } from 'lucide-react';

// --- НАСТРОЙКИ ---
// 👇 Сюда потом вставите ссылку от Lemon Squeezy
const LEMON_SQUEEZY_LINK = ""; 
// ----------------

const PROMPT_FREE = `Tu es un assistant spécialisé dans la rédaction de réponses professionnelles à des réclamations clients en France.
Ta mission est de proposer une première ébauche de réponse, à titre indicatif.
RÈGLES STRICTES :
* Ne jamais reconnaître une faute, une erreur ou une responsabilité
* Ne jamais présenter d'excuses ou exprimer des regrets
* Ne jamais proposer de remboursement, de compensation ou de geste commercial
* Ne pas entrer dans des formulations détaillées ou définitives
OBJECTIF :
* Montrer un ton professionnel, calme et maîtrisé
* Donner une orientation générale de réponse
STRUCTURE :
1. Accusé de réception neutre
2. Prise en compte générale de la demande
3. Indication qu'un échange complémentaire permettrait d'aller plus loin
Longueur : 4 à 6 lignes maximum.`;

const PROMPT_PAID = `Tu es un assistant expert en rédaction de réponses professionnelles à des réclamations clients pour des entreprises de services en France.
Ta mission est de rédiger une réponse écrite COMPLÈTE, PRÊTE À ENVOYER.
RÈGLES IMPÉRATIVES :
* Ne jamais reconnaître une faute, erreur ou responsabilité
* Ne jamais présenter d'excuses
* Ne jamais promettre de remboursement
* Ton professionnel, factuel et posé
IMPORTANT :
* Analyse le message du client et INTÈGRE les détails (travaux, dates, nature réclamation)
* NE JAMAIS utiliser de [placeholder]
* La réponse doit être DIRECTEMENT utilisable
STRUCTURE :
1. Introduction polie
2. Prise en compte des éléments sans valider les reproches
3. Position neutre (pas de responsabilité établie à ce stade)
4. Rappel de la nécessité d'un examen contradictoire
5. Proposition de poursuite de l'échange
6. Conclusion polie`;

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
  const [stats, setStats] = useState({ free: 0, paidClicks: 0, paidComplete: 0 });

  useEffect(() => {
    // Безопасная проверка хранилища
    if (typeof window !== 'undefined') {
      const localUsed = localStorage.getItem('used_free_test');
      if (localUsed) setHasUsedFree(true);
      const localStats = localStorage.getItem('stats');
      if (localStats) setStats(JSON.parse(localStats));
    }
  }, []);

  const updateStats = (type) => {
    const updated = { ...stats };
    if (type === 'free') updated.free++;
    if (type === 'paidClick') updated.paidClicks++;
    if (type === 'paidComplete') updated.paidComplete++;
    setStats(updated);
    localStorage.setItem('stats', JSON.stringify(updated));
  };

  // 🔥 ЗАПРОС К ВАШЕМУ СЕРВЕРУ (БЕЗОПАСНО)
  const callOpenAI = async (systemPrompt, userMessage) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPrompt, userMessage }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur API');
    return data.result;
  };

  const handleSubmitFree = async () => {
    setError('');
    if (!complaint || !situation) { setError('Remplissez tous les champs.'); return; }
    if (hasUsedFree) { setError('Test gratuit déjà utilisé.'); return; }

    setLoading(true);
    try {
      const res = await callOpenAI(PROMPT_FREE, `Situation: ${situation}. Message: ${complaint}`);
      setFreeResponse(res);
      localStorage.setItem('used_free_test', 'true');
      setHasUsedFree(true);
      updateStats('free');
      setStep('free-result');
    } catch (err) {
      console.error(err);
      setError('Erreur technique. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClick = () => {
    updateStats('paidClick');
    if (LEMON_SQUEEZY_LINK && LEMON_SQUEEZY_LINK.startsWith('http')) {
      window.location.href = LEMON_SQUEEZY_LINK;
    } else {
      setStep('payment'); // Демо режим, если ссылки нет
    }
  };

  const handlePaidGeneration = async () => {
    if (!email) { setError('Email requis.'); return; }
    setLoading(true);
    try {
      const res = await callOpenAI(PROMPT_PAID, `Situation: ${situation}. Message: ${complaint}`);
      setPaidResponse(res);
      updateStats('paidComplete');
      setStep('paid-result');
    } catch (err) {
      setError('Erreur technique.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('form');
    setComplaint('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto">
        
        {/* ЗАГОЛОВОК */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold mb-4">Une mauvaise réponse crée un risque juridique</h1>
          <p className="text-slate-600">Générez une réponse professionnelle, neutre, sans reconnaissance de faute.</p>
        </div>

        {/* ОШИБКИ */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 mb-4 text-red-800 rounded flex gap-2">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        {/* ШАГ 1: ФОРМА */}
        {step === 'form' && (
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <div className="flex justify-center gap-8 mb-8 text-xs font-semibold text-slate-500">
              <div className="flex flex-col items-center"><Shield className="w-8 h-8 mb-2 text-slate-700"/>Sans faute</div>
              <div className="flex flex-col items-center"><FileCheck className="w-8 h-8 mb-2 text-slate-700"/>Sans engagement</div>
              <div className="flex flex-col items-center"><Check className="w-8 h-8 mb-2 text-slate-700"/>Ton neutre</div>
            </div>

            <label className="block text-sm font-bold mb-2">Message du client</label>
            <textarea 
              className="w-full p-3 border rounded-lg mb-4 focus:ring-2 ring-slate-400 outline-none" 
              rows={6}
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="Copiez le message du client ici..."
            />

            <label className="block text-sm font-bold mb-2">Situation</label>
            <select 
              className="w-full p-3 border rounded-lg mb-6"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
            >
              <option value="">Choisir...</option>
              <option value="retard">Retard</option>
              <option value="qualite">Qualité</option>
              <option value="facturation">Facturation</option>
              <option value="comportement">Communication</option>
            </select>

            <button 
              onClick={handleSubmitFree}
              disabled={loading || hasUsedFree}
              className="w-full bg-slate-800 text-white py-4 rounded-lg font-bold hover:bg-slate-700 disabled:opacity-50 transition"
            >
              {loading ? <Loader2 className="animate-spin mx-auto"/> : hasUsedFree ? 'Test déjà utilisé' : 'Générer réponse TEST'}
            </button>
          </div>
        )}

        {/* ШАГ 2: РЕЗУЛЬТАТ БЕСПЛАТНЫЙ */}
        {step === 'free-result' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold mb-4">Aperçu (Version Test)</h2>
            <div className="bg-slate-100 p-6 rounded-lg mb-6 text-sm whitespace-pre-wrap">{freeResponse}</div>
            
            <div className="border-2 border-blue-100 bg-blue-50 p-6 rounded-xl text-center">
              <h3 className="font-bold text-lg mb-2">Obtenir la réponse complète (Prête à envoyer)</h3>
              <p className="text-sm text-slate-600 mb-4">Juridiquement neutre • Sans risque • 9,90€</p>
              <button 
                onClick={handlePaymentClick}
                className="w-full bg-slate-800 text-white py-4 rounded-lg font-bold hover:bg-slate-700 transition"
              >
                Débloquer la réponse complète - 9,90€
              </button>
            </div>
            <button onClick={reset} className="block mx-auto mt-4 text-slate-500 text-sm">Retour</button>
          </div>
        )}

        {/* ШАГ 3: ОПЛАТА (ДЕМО) */}
        {step === 'payment' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="bg-yellow-50 text-yellow-800 p-4 rounded mb-6 text-sm">
              <strong>DEMO:</strong> Ajoutez le lien Lemon Squeezy dans le code pour activer le vrai paiement.
            </div>
            <input 
              type="email" 
              placeholder="Votre email" 
              className="w-full p-3 border rounded-lg mb-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button 
              onClick={handlePaidGeneration}
              disabled={loading}
              className="w-full bg-slate-800 text-white py-4 rounded-lg font-bold"
            >
              {loading ? <Loader2 className="animate-spin mx-auto"/> : 'Simuler paiement (9,90€)'}
            </button>
            <button onClick={() => setStep('free-result')} className="block mx-auto mt-4 text-slate-500 text-sm">Retour</button>
          </div>
        )}

        {/* ШАГ 4: ФИНАЛ */}
        {step === 'paid-result' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="bg-green-100 text-green-800 p-3 rounded mb-4 text-center font-bold">✅ Réponse Complète</div>
            <div className="bg-slate-50 border p-6 rounded-lg mb-6 whitespace-pre-wrap">{paidResponse}</div>
            <button 
              onClick={() => {navigator.clipboard.writeText(paidResponse); alert('Copié!');}}
              className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold"
            >
              Copier le texte
            </button>
            <button onClick={reset} className="block mx-auto mt-4 text-slate-500 text-sm">Nouvelle réclamation</button>
          </div>
        )}

      </div>
    </div>
  );
}
