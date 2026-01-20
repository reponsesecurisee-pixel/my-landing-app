import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Resend } from 'resend';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "reponse.securisee@gmail.com"; 

// --- ВАШИ ОРИГИНАЛЬНЫЕ ПРОМПТЫ С УЧЕТОМ СТРАТЕГИИ МИНИМАЛИЗМА ---

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

RÈGLES IMPÉRATIVES DE SÉCURITÉ :
* Ne jamais reconnaître une faute, une erreur ou une responsabilité, explicitement ou implicitement
* Ne jamais présenter d'excuses ou exprimer des regrets
* Ne jamais promettre de remboursement, de compensation ou de geste commercial
* Ne pas valider les reproches du client
* Utiliser un registre professionnel, factuel et posé

PHILOSOPHIE DU "MOINS EN DIT, MOINS ON S'EXPOSE" :
* La sobriété est ta meilleure protection : chaque mot inutile est une opportunité pour un avocat adverse.
* Sois poli et attentif, mais extrêmement laconique.
* Ne donne aucune explication technique superflue qui pourrait être interprétée comme une justification.
* Ton but est de ne laisser AUCUNE prise juridique à la partie adverse.

IMPORTANT - INTÉGRATION DES DÉTAILS :
* Analyse le message du client et INTÈGRE directement les détails spécifiques (travaux, dates, nature) sans placeholders [crochets].
* La réponse doit être DIRECTEMENT utilisable sans modification.

STRUCTURE ATTENDUE :
1. Formule d'introduction polie et accusé de réception neutre.
2. Prise en compte factuelle des éléments mentionnés (sans validation).
3. Position neutre : "les éléments en notre possession ne permettent pas d'établir une responsabilité".
4. Cadre d'analyse : maintien de l'échange de manière factuelle et constructive.
5. Formule de conclusion polie.

CONSEILS TACTIQUES (À AJOUTER APRÈS LA LETTRE) :
- Envoi LRAR : seule preuve légale de votre réactivité.
- RÈGLE DES 48H : Ne répondez à aucun appel téléphonique pendant les 48h suivant l'envoi. Figez l'échange sur l'écrit pour éviter les dérapages émotionnels.

AVERTISSEMENT LÉGAL OBLIGATOIRE (EN GRAS À LA FIN) :
"Avertissement : Ce document est un outil d'aide à la rédaction administrative et ne constitue pas un conseil juridique professionnel. En cas de litige grave, consultez un avocat."`;

export async function POST(req) {
  try {
    const body = await req.json();
    const { type, email, message, name, complaint, situation } = body;

    if (type === 'feedback') {
      if (process.env.RESEND_API_KEY) {
        try {
          await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: ADMIN_EMAIL,
            subject: `🔔 SUPPORT: Message de ${name}`,
            html: `<h3>Support</h3><p><strong>Nom:</strong> ${name}</p><p><strong>Message:</strong> ${message}</p>`
          });
        } catch (err) { console.error(err); }
      }
      return NextResponse.json({ result: "Message reçu" });
    }

    const systemPrompt = type === 'free' ? PROMPT_FREE : PROMPT_PAID;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Situation: ${situation}. Message client: ${complaint}` },
      ],
      temperature: 0.7, // Вариативность для уникальности ответов
      max_tokens: type === 'free' ? 400 : 1200,
    });

    const generatedText = completion.choices[0].message.content;

    if (type === 'paid' && process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: ADMIN_EMAIL,
          subject: `💰 COMMANDE RÉUSSIE (${email})`,
          html: `<div style="white-space: pre-wrap;">${generatedText}</div>`
        });
      } catch (e) { console.error(e); }
    }

    return NextResponse.json({ result: generatedText });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
