import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Resend } from 'resend';

// Инициализация сервисов
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

// ВАША ПОЧТА (на которую будут приходить копии заказов и сообщения поддержки)
const ADMIN_EMAIL = 'reponsesecurisee@gmail.com';

// --- ПРОМПТЫ (ИНСТРУКЦИИ ДЛЯ AI) ---

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
* Rester volontairement synthétique et non exhaustif
STRUCTURE :
1. Accusé de réception neutre
2. Prise en compte générale de la demande
3. Indication qu'un échange complémentaire permettrait d'aller plus loin
Longueur : 4 à 6 lignes maximum.`;

const PROMPT_PAID = `Tu es un assistant expert en rédaction de réponses professionnelles à des réclamations clients pour des entreprises de services en France.
Ta mission est de rédiger une réponse écrite COMPLÈTE, PRÊTE À ENVOYER, destinée à être utilisée telle quelle par le client.
RÈGLES IMPÉRATIVES :
* Ne jamais reconnaître une faute, une erreur ou une responsabilité, explicitement ou implicitement
* Ne jamais présenter d'excuses ou exprimer des regrets
* Ne jamais promettre de remboursement, de compensation ou de geste commercial
* Ne pas valider les reproches du client
* Utiliser un registre professionnel, factuel et posé
IMPORTANT - INTÉGRATION DES DÉTAILS :
* Analyse le message du client et INTÈGRE directement les détails spécifiques :
  - Type de travaux/service mentionné
  - Période ou date évoquée
  - Nature précise de la réclamation
* NE JAMAIS utiliser de placeholders comme [date], [sujet], [nom]
* Si une information manque, utilise une formulation neutre générique
* La réponse doit être DIRECTEMENT utilisable sans modification
TON ET STYLE :
* Français professionnel, courtois mais ferme
* Formulations polies et institutionnelles
* Absence totale de familiarité ou d'empathie émotionnelle
* Posture calme, maîtrisée et non défensive
STRUCTURE ATTENDUE :
1. Formule d'introduction polie et accusé de réception
2. Prise en compte des éléments mentionnés, sans validation des reproches
3. Position neutre indiquant que les éléments ne permettent pas, à ce stade, d'établir une responsabilité
4. Rappel du cadre habituel d'analyse (échange factuel / examen contradictoire)
5. Proposition encadrée de poursuite de l'échange, sans engagement
6. Formule de conclusion polie
IMPORTANT :
* La réponse doit être prête à l'envoi
* Varie les formulations à chaque génération
* Intègre les détails spécifiques du cas sans utiliser de crochets`;

// --- ОСНОВНАЯ ЛОГИКА ---

export async function POST(req) {
  try {
    const body = await req.json();
    const { type, email, message, name, complaint, situation } = body;

    // 1. ОБРАБОТКА СООБЩЕНИЙ ПОДДЕРЖКИ (SUPPORT)
    if (type === 'feedback') {
      if (process.env.RESEND_API_KEY) {
        try {
          await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: ADMIN_EMAIL, 
            subject: `🔔 SUPPORT: Message de ${name}`,
            html: `
              <h3>Nouveau message de support</h3>
              <p><strong>Nom:</strong> ${name}</p>
              <p><strong>Email client:</strong> ${email}</p>
              <hr />
              <p><strong>Message:</strong></p>
              <p>${message}</p>
            `
          });
          console.log("✅ Message support envoyé à l'admin");
        } catch (err) {
          console.error("❌ Erreur envoi support:", err);
        }
      }
      return NextResponse.json({ result: "Message reçu" });
    }

    // 2. ГЕНЕРАЦИЯ ОТВЕТА (AI)
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const systemPrompt = type === 'free' ? PROMPT_FREE : PROMPT_PAID;
    const maxTokens = type === 'free' ? 300 : 1000;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Situation: ${situation}. Message client: ${complaint}` },
