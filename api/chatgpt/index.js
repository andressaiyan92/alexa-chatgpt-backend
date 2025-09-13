// api/chatgpt/index.js

export default async function handler(req, res) {
  const { body } = req;

  // Validar que sea una solicitud de Alexa
  if (!body?.session?.application?.applicationId) {
    return res.status(400).json({ error: "No es una solicitud válida de Alexa" });
  }

  // Reemplaza con tu Skill ID real (lo encuentras en Alexa Developer Console > Settings)
  const YOUR_SKILL_ID = "amzn1.ask.skill.9c181a28-f8af-413a-98d3-8a22b1ef9279"; // ⚠️ CAMBIA ESTO!
  if (body.session.application.applicationId !== YOUR_SKILL_ID) {
    return res.status(403).json({ error: "Invalid Skill ID" });
  }

  const intentName = body.request.intent?.name;

  if (intentName === "ChatGPTIntent") {
    const consulta = body.request.intent.slots.consulta.value;
    const respuesta = await enviarAChatGPT(consulta);
    return res.status(200).json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: respuesta,
        },
        shouldEndSession: false,
      },
    });
  }

  if (body.request.type === "LaunchRequest") {
    return res.status(200).json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: "¡Hola! Puedes preguntarme lo que quieras. Por ejemplo: ¿Qué es la inteligencia artificial?",
        },
        shouldEndSession: false,
      },
    });
  }

  if (intentName === "AMAZON.HelpIntent") {
    return res.status(200).json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: "Puedes preguntarme cualquier cosa. Ejemplo: 'Dime qué es la programación'.",
        },
        shouldEndSession: false,
      },
    });
  }

  if (intentName === "AMAZON.CancelIntent" || intentName === "AMAZON.StopIntent") {
    return res.status(200).json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: "Hasta luego.",
        },
        shouldEndSession: true,
      },
    });
  }

  return res.status(200).json({
    version: "1.0",
    response: {
      outputSpeech: {
        type: "PlainText",
        text: "No entendí. Prueba diciendo: 'Dime qué es la inteligencia artificial'.",
      },
      shouldEndSession: false,
    },
  });
}

async function enviarAChatGPT(consulta) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Eres un asistente amable y útil que responde en español.",
        },
        { role: "user", content: consulta },
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  const data = await response.json();

  if (data.error) {
    return "Lo siento, no pude responder ahora. Intenta de nuevo.";
  }

  return data.choices[0].message.content.trim();
}
