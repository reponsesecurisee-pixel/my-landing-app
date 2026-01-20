import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Resend } from 'resend';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = 'reponsesecurisee@gmail.com';

const PROMPT_FREE = `Tu es un assistant spécialisé dans la rédaction de réponses professionnelles à des réclamations clients en France.
Ta mission est de proposer une première ébauche de réponse, à titre indicatif.
RÈGLES STRICTES :
* Ne jamais reconnaître une faute, une erreur ou une responsabilité
* Ne jamais présenter d'excuses ou exprimer des regrets
* Ne jamais proposer de remboursement, de compensation ou de geste commercial
* Ne pas entrer dans des formulations détaillées ou définitives

RECOMMANDATIONS GÉNÉRALES :
- Rester factuel
- Éviter toute reconnaissance
- Proposer un échange constructif

STRUCTURE :
1. Accusé de réception neutre
2. Prise en compte générale de la demande
3. Indication qu'un échange complémentaire permettrait d'aller plus loin
Ajoute à la fin : "Version d'essai : Cette réponse est incomplète et ne contient pas la protection contre les pièges de langage."`;

const PROMPT_PAID = `Tu es un assistant expert en rédaction de réponses professionnelles à des réclamations clients pour des entreprises de services en France.
Ta mission est de rédiger une réponse écrite COMPLÈTE, PRÊTE À ENVOYER, destinée à être utilisée telle quelle par le client.

RÈGLES IMPÉRATIVES :
* Ne jamais reconnaître une faute, une erreur ou une responsabilité, explicitement ou implicitement
* Ne jamais présenter d'excuses ou exprimer des regrets
* Ne jamais promettre de remboursement, de compensation ou de geste commercial
* Ne pas valider les reproches du client
* Utiliser un registre professionnel, factuel et posé

IMPORTANT - INTÉGRATION DES DÉTAILS :
* Analyse le message du client et INTÈGRE directement les détails spécifiques (travaux, dates, nature) sans placeholders
* NE JAMAIS utiliser de placeholders comme [date], [sujet], [nom]
* La réponse doit être DIRECTEMENT utilisable sans modification

STRUCTURE DU DOSSIER COMPLET (WAOUH EFFECT) :
1. [COURRIER SÉCURISÉ] : La lettre prête à l'envoi.
2. [ANALYSE TACTIQUE] : Explique pourquoi ce texte évite tous les pièges de langage.
3. [PROTOCOLE DE SÉCURITÉ 48H] : 
   - Recommandez l'envoi LRAR (preuve juridique).
   - RÈGLE DES 48H : Ne répondez à aucun appel téléphonique pendant les 48h suivant l'envoi. Moins vous en dites, moins vous donnez de prises juridiques.

IMPORTANT - AVERTISSEMENT LÉGAL :
Ajoute obligatoirement en gras à la fin : 
"Avertissement : Ce document est un outil d'aide à la rédaction administrative et ne constitue pas un conseil juridique professionnel. En cas de litige grave, consultez un avocat."`;

export async function POST(req) {
  try {
    const body = await req.json();
    const { type, email, message, name, complaint, situation } = body;

    if (type === 'feedback') {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: ADMIN_EMAIL,
        subject: `🔔 SUPPORT: ${name}`,
        html: `<p><strong>Email:</strong> ${email}</p><p>${message}</p>`
      });
      return NextResponse.json({ result: "Message reçu" });
    }

    const systemPrompt = type === 'free' ? PROMPT_FREE : PROMPT_PAID;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Situation: ${situation}. Message client: ${complaint}` },
      ],
      temperature: type === 'free' ? 0.5 : 0.7, // Вариативность для платных
    });

    const generatedText = completion.choices[0].message.content;

    if (type === 'paid') {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: ADMIN_EMAIL,
        subject: `💰 COMMANDE: ${email}`,
        html: `<div style="white-space: pre-wrap;">${generatedText}</div>`
      });
    }

    return NextResponse.json({ result: generatedText });
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
