import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Resend } from 'resend';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "reponse.securisee@gmail.com"; 

// --- ВАШИ ОРИГИНАЛЬНЫЕ ПРОМПТЫ ---

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

NOUVELLES INSTRUCTIONS TACTIQUES (À AJOUTER APRÈS LA LETTRE) :
* [CONSEILS TACTIQUES] : 
  - Recommandez l'envoi impératif en Recommandé avec Accusé de Réception (LRAR).
  - RÈGLE DES 48H : Conseillez de ne répondre à aucun appel téléphonique du client pendant les 48h suivant l'envoi pour figer l'écrit et laisser les émotions retomber.

IMPORTANT - AVERTISSEMENT LÉGAL :
Ajoute obligatoirement ce texte en gras à la fin :
"Avertissement : Ce document est un outil d'aide à la rédaction administrative et ne constitue pas un conseil juridique professionnel. En cas de litige grave, consultez un avocat."

IMPORTANT :
* La réponse doit être prête à l'envoi
* Varie les formulations à chaque génération
* Intègre les détails spécifiques du cas sans utiliser de crochets`;

// --- ЛОГИКА СЕРВЕРА ---

export async function POST(req) {
  try {
    const body = await req.json();
    const { type, email, message, name, complaint, situation } = body;

    // 1. ОБРАБОТКА ПОДДЕРЖКИ
    if (type === 'feedback') {
      if (process.env.RESEND_API_KEY) {
        try {
          await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: ADMIN_EMAIL,
            subject: `🔔 SUPPORT: Message de ${name}`,
            html: `<h3>Nouveau message de support</h3><p><strong>Nom:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong> ${message}</p>`
          });
        } catch (err) { console.error("Support email error:", err); }
      }
      return NextResponse.json({ result: "Message reçu" });
    }

    // 2. ГЕНЕРАЦИЯ ОТВЕТА (AI)
    const systemPrompt = type === 'free' ? PROMPT_FREE : PROMPT_PAID;
    const currentTemp = type === 'free' ? 0.5 : 0.7; // Повышенная вариативность для платных

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Situation: ${situation}. Message client: ${complaint}` },
      ],
      temperature: currentTemp,
      max_tokens: type === 'free' ? 400 : 1500,
    });

    const generatedText = completion.choices[0].message.content;

    // 3. УВЕДОМЛЕНИЕ О ЗАКАЗЕ
    if (type === 'paid' && process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: ADMIN_EMAIL,
          subject: `💰 COMMANDE RÉUSSIE (${email})`,
          html: `<div style="white-space: pre-wrap;">${generatedText}</div>`
        });
      } catch (e) { console.error("Order email error:", e); }
    }

    return NextResponse.json({ result: generatedText });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
