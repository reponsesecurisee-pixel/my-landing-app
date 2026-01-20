import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { type, complaint, situation, email, name, message } = await req.json();

    if (type === 'feedback') {
      return NextResponse.json({ result: "Message envoyé au support." });
    }

    // --- ГЛУБОКИЙ СИСТЕМНЫЙ ПРОМПТ (BOUCLIER ADMINISTRATIF) ---
    const systemPrompt = `
      Tu es l'expert n°1 en France en gestion des litiges administratifs pour le secteur du bâtiment (BTP). 
      Ton rôle est d'agir comme un bouclier (gilet pare-balles) pour l'artisan face à un client difficile.

      CONTEXTE JURIDIQUE :
      En France, toute reconnaissance de faute peut entraîner la déchéance des garanties d'assurance (Décennale). 
      Ta mission est de répondre sans JAMAIS admettre de retard, de malfaçon ou de responsabilité.

      TON ET STYLE :
      - Professionnel, formel, neutre, mais extrêmement ferme.
      - Utilise le "Nous" de majesté ou de l'entreprise.
      - Évite les excuses ("Désolé", "Veuillez nous excuser"). Remplace par "Nous avons pris bonne note de vos observations".
      - Transforme les plaintes émotionnelles du client en faits administratifs.
    `;

    let userPrompt = "";
    let currentTemperature = 0.5; // По умолчанию для тестов

    if (type === 'free') {
      userPrompt = `
        Génère une réponse de test gratuite (Brouillon indicatif). 
        Le client se plaint de : "${complaint}". 
        La situation est : "${situation}".
        
        INSTRUCTIONS POUR LE TEST :
        1. Rédige un texte professionnel mais volontairement incomplet.
        2. Ne donne pas de stratégie d'envoi.
        3. Ajoute à la fin : "Ceci est un brouillon généré par l'IA. La version sécurisée complète comprend une analyse de risques et un protocole d'envoi."
      `;
    } else {
      currentTemperature = 0.7; // Повышенная вариативность для платных заказов
      userPrompt = `
        GÉNÈRE LE DOSSIER DE PROTECTION COMPLET (Gilet pare-balles). 
        Client : "${complaint}". 
        Conflit : "${situation}".

        STRUCTURE DU RÉSULTAT PAYANT :
        1. [COURRIER SÉCURISÉ] : 
           Une lettre formelle imbattable. Utilise des termes techniques : "règles de l'art", "DTU", "réception sans réserve", "mise en demeure abusive". 
           La lettre doit figer la situation sans ouvrir de porte à la négociation sur la faute.

        2. [ANALYSE TACTIQUE DE L'EXPERT] : 
           Explique pourquoi tu as utilisé telles formulations pour protéger l'artisan. 
           Démontre comment tu as évité les pièges de la plainte client.

        3. [CONSEILS TACTIQUES ET PROTOCOLE] : 
           - Recommandé LRAR : Explique pourquoi c'est la seule preuve valable.
           - Règle des 48h : Conseille de ne pas répondre aux appels téléphoniques pendant 48h pour forcer le client à rester sur le terrain de l'écrit et laisser les émotions retomber.
           - Précise bien que ce sont des recommandations basées sur la gestion de litiges et non un conseil juridique.

        4. [AVERTISSEMENT LÉGAL OBLIGATOIRE] : 
           Ajoute en gras à la fin : "IMPORTANT : Ce document est un outil d'aide à la rédaction administrative visant à préserver vos intérêts commerciaux. Il ne constitue en aucun cas un conseil juridique ou une consultation d'avocat. En cas de procédure judiciaire, consultez un professionnel du droit."
      `;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: currentTemperature,
    });

    return NextResponse.json({ result: completion.choices[0].message.content });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur lors de la génération." }, { status: 500 });
  }
}
