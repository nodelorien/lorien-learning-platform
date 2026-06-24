import { env } from '../../config/env';

const DEEPSEEK_API = 'https://api.deepseek.com/v1/chat/completions';

interface GradingResult {
  score: number;
  feedback: string;
  breakdown: {
    role: boolean;
    context: boolean;
    objective: boolean;
    format: boolean;
    restrictions: boolean;
  };
}

function keywordGrade(userPrompt: string): GradingResult {
  const lower = userPrompt.toLowerCase();
  const keywords: Record<string, string[]> = {
    role: ['actúa como', 'eres', 'experto', 'especialista', 'profesor', 'consultor'],
    context: ['contexto', 'para', 'dirigido', 'audiencia', 'compañero', 'equipo'],
    objective: ['objetivo', 'explica', 'describe', 'diseña', 'crea', 'elabora'],
    format: ['formato', 'lista', 'viñetas', 'párrafos', 'estructura', 'pasos'],
    restrictions: ['máximo', 'evita', 'sin', 'solo', 'limitado', 'restricciones'],
  };

  const breakdown: GradingResult['breakdown'] = { role: false, context: false, objective: false, format: false, restrictions: false };
  let count = 0;

  for (const [key, words] of Object.entries(keywords)) {
    if (words.some((w) => lower.includes(w))) {
      breakdown[key as keyof GradingResult['breakdown']] = true;
      count++;
    }
  }

  const score = Math.round((count / 5) * 100);

  const feedbacks: Record<number, string> = {
    0: 'Tu prompt no incluye ninguno de los elementos recomendados. Revisa la anatomía de un prompt profesional.',
    20: 'Incluye solo un elemento. Intenta agregar rol, contexto, objetivo, formato y restricciones.',
    40: 'Incluye algunos elementos. Sigue mejorando agregando los que faltan.',
    60: 'Incluye la mayoría de los elementos. ¡Buen trabajo! Revisa cuál falta.',
    80: 'Casi completo. Solo falta un elemento para ser un prompt profesional.',
    100: '¡Excelente! Tu prompt incluye todos los elementos de un prompt profesional.',
  };

  const closest = Object.keys(feedbacks).map(Number).reduce((a, b) =>
    Math.abs(b - score) < Math.abs(a - score) ? b : a,
  );

  return { score, feedback: feedbacks[closest], breakdown };
}

export async function gradePrompt(
  exerciseTitle: string,
  exerciseDescription: string,
  rubricPrompt: string,
  userPrompt: string,
): Promise<GradingResult> {
  if (!env.deepseekApiKey) {
    return keywordGrade(userPrompt);
  }
  const systemPrompt = `Eres un evaluador de prompts de IA. Tu tarea es calificar prompts escritos por usuarios.

Debes evaluar si el prompt del usuario incluye cada uno de estos 5 elementos:
1. **Rol** - ¿El prompt le asigna un rol o personalidad a la IA? (ej: "actúa como", "eres un experto en", "como especialista")
2. **Contexto** - ¿El prompt describe el contexto o situación? (ej: "para", "dirigido a", "en el contexto de", "en una empresa")
3. **Objetivo** - ¿El prompt indica claramente qué debe hacer la IA? (ej: "objetivo:", "diseña", "crea", "elabora")
4. **Formato** - ¿El prompt especifica cómo debe responder? (ej: "formato:", "en lista", "en párrafos", "estructura")
5. **Restricciones** - ¿El prompt incluye límites o condiciones? (ej: "máximo", "evita", "sin", "solo", "limitado")

Responde ÚNICAMENTE con un objeto JSON sin markdown ni explicaciones adicionales:
{
  "score": (número del 0 al 100, basado en cuántos elementos están presentes, 20 pts c/u),
  "feedback": "texto breve en español explicando qué mejorar",
  "breakdown": {
    "role": true/false,
    "context": true/false,
    "objective": true/false,
    "format": true/false,
    "restrictions": true/false
  }
}`;

  const userMessage = `Ejercicio: ${exerciseTitle}
Descripción: ${exerciseDescription}
Contexto del ejercicio: ${rubricPrompt}

Prompt del usuario a evaluar:
---
${userPrompt}
---`;

  try {
    const response = await fetch(DEEPSEEK_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.deepseekApiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.warn(`DeepSeek API error: ${response.status} — falling back to keyword grading`);
      return keywordGrade(userPrompt);
    }

    const data = await response.json() as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content ?? '';

    try {
      return JSON.parse(content) as GradingResult;
    } catch {
      return keywordGrade(userPrompt);
    }
  } catch (err) {
    console.warn('DeepSeek call failed — falling back to keyword grading:', err);
    return keywordGrade(userPrompt);
  }
}
