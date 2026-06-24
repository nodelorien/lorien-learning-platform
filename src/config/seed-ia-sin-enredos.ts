import { v4 as uuid } from 'uuid';
import { getDb } from '../shared/infrastructure/database';

const COURSE_TITLE = 'IA Sin enredos';
const MODULES = [
  {
    topic: 'Fundamentos y herramientas',
    exercises: [
      {
        title: '¿Qué es la IA?',
        description: 'Pon a prueba tus conocimientos sobre los fundamentos de la Inteligencia Artificial',
        type: 'trivia',
        content: JSON.stringify({
          question: '¿Cuál de las siguientes afirmaciones sobre la IA es CORRECTA?',
          options: [
            { id: 'a', text: 'La IA posee conciencia y emociones como los humanos', correct: false },
            { id: 'b', text: 'La IA es una disciplina que desarrolla sistemas capaces de analizar información, identificar patrones y generar contenido', correct: true },
            { id: 'c', text: 'La IA siempre tiene la razón y nunca se equivoca', correct: false },
            { id: 'd', text: 'La IA reemplazará completamente todos los empleos humanos', correct: false },
          ],
        }),
        category: 'fundamentos',
      },
      {
        title: 'Mitos de la IA',
        description: 'Identifica qué afirmaciones son mitos y cuáles son realidades sobre la IA',
        type: 'trivia',
        content: JSON.stringify({
          question: '¿Cuál de las siguientes afirmaciones sobre la IA es FALSA (es un mito)?',
          options: [
            { id: 'a', text: 'La IA posee conciencia y emociones humanas', correct: true },
            { id: 'b', text: 'La IA reemplaza tareas repetitivas más que profesiones completas', correct: false },
            { id: 'c', text: 'La IA genera respuestas basadas en probabilidades estadísticas', correct: false },
            { id: 'd', text: 'El valor humano sigue siendo el criterio, liderazgo y experiencia', correct: false },
          ],
        }),
        category: 'fundamentos',
      },
      {
        title: 'Evolución de la IA',
        description: 'Demuestra lo que sabes sobre la línea de tiempo de la IA',
        type: 'trivia',
        content: JSON.stringify({
          question: '¿Qué hito ocurrió en 1997 en la evolución de la IA?',
          options: [
            { id: 'a', text: 'Se creó el Test de Turing', correct: false },
            { id: 'b', text: 'Deep Blue de IBM le ganó al campeón mundial de ajedrez', correct: true },
            { id: 'c', text: 'Surgió el Deep Learning', correct: false },
            { id: 'd', text: 'Nació la IA Generativa', correct: false },
          ],
        }),
        category: 'fundamentos',
      },
      {
        title: 'Crea una explicación de IA',
        description: 'Redacta un prompt profesional para explicar qué es la IA a un compañero de trabajo que no sabe del tema',
        type: 'prompt',
        content: JSON.stringify({
          prompt: 'Redacta un prompt que explique qué es la Inteligencia Artificial a un colega que nunca ha oído hablar del tema. Debe incluir: rol, contexto, objetivo, formato, restricciones y criterios de calidad.',
          expectedAnswer: '',
          structureCheck: {
            role: ['actúa', 'como', 'eres', 'especialista', 'experto', 'profesor'],
            context: ['contexto', 'para', 'dirigido', 'audiencia', 'compañero', 'colega', 'equipo', 'trabajo'],
            objective: ['objetivo', 'explica', 'describe', 'enseña', 'mostrar', 'comunicar'],
            format: ['formato', 'párrafos', 'lista', 'viñetas', 'tabla', 'resumen', 'breve', 'extensión'],
            restrictions: ['restricciones', 'evita', 'sin', 'no uses', 'limitado', 'máximo'],
          },
        }),
        category: 'fundamentos',
      },
    ],
  },
  {
    topic: 'Prompt Engineering, Tokens y Alucinaciones',
    exercises: [
      {
        title: 'Anatomía de un prompt',
        description: 'Identifica los componentes correctos de un prompt profesional',
        type: 'trivia',
        content: JSON.stringify({
          question: '¿Cuáles son los componentes de un prompt profesional según la anatomía presentada?',
          options: [
            { id: 'a', text: 'Saludo, Cuerpo, Despedida, Firma', correct: false },
            { id: 'b', text: 'Rol + Contexto + Objetivo + Formato + Restricciones + Criterios de calidad', correct: true },
            { id: 'c', text: 'Título, Introducción, Desarrollo, Conclusión', correct: false },
            { id: 'd', text: 'Pregunta, Respuesta, Ejemplo, Referencia', correct: false },
          ],
        }),
        category: 'prompt-engineering',
      },
      {
        title: 'Zero Shot vs Few Shot',
        description: 'Diferencia entre las técnicas de prompting',
        type: 'trivia',
        content: JSON.stringify({
          question: '¿Cuál es la principal diferencia entre Zero-Shot y Few-Shot prompting?',
          options: [
            { id: 'a', text: 'Zero-Shot usa ejemplos y Few-Shot no usa ejemplos', correct: false },
            { id: 'b', text: 'Zero-Shot no requiere ejemplos previos, Few-Shot proporciona uno o varios ejemplos antes de la tarea', correct: true },
            { id: 'c', text: 'Zero-Shot solo funciona con imágenes, Few-Shot solo con texto', correct: false },
            { id: 'd', text: 'Zero-Shot es más preciso que Few-Shot en tareas complejas', correct: false },
          ],
        }),
        category: 'prompt-engineering',
      },
      {
        title: 'Mejora este prompt',
        description: 'Transforma un prompt vago en un prompt profesional. Debe incluir: rol, contexto, objetivo, formato y restricciones.',
        type: 'prompt',
        content: JSON.stringify({
          prompt: 'Prompt original:\n"Haz una capacitación SST"\n\nReescribe este prompt aplicando la anatomía profesional:\n• Rol: ¿quién debe actuar la IA?\n• Contexto: ¿para quién y en qué situación?\n• Objetivo: ¿qué debe lograr?\n• Formato: ¿cómo debe presentar la respuesta?\n• Restricciones: ¿qué límites debe respetar?',
          expectedAnswer: '',
          structureCheck: {
            role: ['actúa', 'como', 'eres', 'especialista', 'experto', 'profesional', 'consultor'],
            context: ['contexto', 'para', 'dirigido', 'audiencia', 'personal', 'operativo', 'colombia', 'empresa'],
            objective: ['objetivo', 'diseña', 'crea', 'desarrolla', 'capacitación', 'entrenamiento', 'formación'],
            format: ['formato', 'incluye', 'estructura', 'lista', 'párrafos', 'secciones', 'pasos'],
            restrictions: ['restricciones', 'máximo', 'minutos', 'duración', 'límite', 'solo', 'evita'],
          },
        }),
        category: 'prompt-engineering',
      },
      {
        title: '¿Qué son los tokens?',
        description: 'Evalúa tu comprensión sobre cómo procesan el lenguaje los modelos de IA',
        type: 'trivia',
        content: JSON.stringify({
          question: '¿Qué son los tokens en el contexto de modelos de IA?',
          options: [
            { id: 'a', text: 'Son monedas digitales para pagar por el uso de la IA', correct: false },
            { id: 'b', text: 'Son las unidades que los modelos de lenguaje procesan (no palabras completas)', correct: true },
            { id: 'c', text: 'Son fragmentos de código que ejecutan funciones específicas', correct: false },
            { id: 'd', text: 'Son metadatos que describen la procedencia de los datos', correct: false },
          ],
        }),
        category: 'tokens',
      },
      {
        title: '¿Cuántos tokens gastaste?',
        description: 'Identifica cuántos tokens tiene un prompt mal escrito y aprende a optimizarlo',
        type: 'tokens',
        content: JSON.stringify({
          prompt: 'Oye, mira, necesito que por favor, si no es mucha molestia, me ayudes a hacer un resumen del siguiente texto que te voy a pasar. Es que la verdad no entiendo muy bien de qué se trata y tengo que presentarlo mañana en el trabajo. Si pudieras ser bien detallado y explicarlo todo paso a paso, te lo agradecería muchísimo. Bueno, aquí te va el texto: La inteligencia artificial es una rama de la computación que busca crear sistemas capaces de realizar tareas que normalmente requieren inteligencia humana. Esto incluye cosas como aprender de la experiencia, reconocer patrones, entender lenguaje natural y tomar decisiones. Aunque suena complicado, básicamente se trata de programas que pueden mejorar con la práctica. Hoy en día la usamos en asistentes virtuales, recomendaciones de películas, diagnósticos médicos y mucho más.',
          optimalPrompt: 'Como especialista en divulgación tecnológica, resume en 3 líneas un texto sobre IA para un profesional sin experiencia técnica. Usa lenguaje claro y evita tecnicismos.',
          expectedTokensLow: 50,
          expectedTokensHigh: 120,
        }),
        category: 'tokens',
      },
      {
        title: 'Alucinaciones',
        description: 'Comprende por qué la IA puede inventar información',
        type: 'trivia',
        content: JSON.stringify({
          question: '¿Por qué ocurren las alucinaciones en los modelos de IA?',
          options: [
            { id: 'a', text: 'Porque los modelos tienen intención de engañar a los usuarios', correct: false },
            { id: 'b', text: 'Porque los modelos predicen texto probable a partir de patrones y pueden completar vacíos con información errónea', correct: true },
            { id: 'c', text: 'Porque los datos de entrenamiento siempre contienen errores', correct: false },
            { id: 'd', text: 'Porque los modelos no tienen suficiente memoria para almacenar respuestas', correct: false },
          ],
        }),
        category: 'alucinaciones',
      },
      {
        title: 'Evita alucinaciones',
        description: 'Redacta un prompt que incluya estrategias para prevenir alucinaciones',
        type: 'prompt',
        content: JSON.stringify({
          prompt: 'Redacta un prompt para que una IA genere información verificable y evite alucinar. Debe incluir:\n• Rol de la IA\n• Instrucciones para indicar incertidumbre\n• Solicitud de fuentes o referencias\n• Contexto específico\n• Formato estructurado',
          expectedAnswer: '',
          structureCheck: {
            role: ['actúa', 'como', 'eres', 'especialista', 'experto', 'analista', 'investigador'],
            context: ['contexto', 'basado', 'según', 'fundamento', 'fuente', 'referencia', 'documento'],
            objective: ['objetivo', 'verifica', 'valida', 'confirma', 'comprueba', 'asegura'],
            format: ['formato', 'lista', 'enumera', 'tabla', 'organiza', 'estructura'],
            restrictions: ['restricciones', 'incierto', 'no sabes', 'duda', 'fuentes', 'referencia', 'cita'],
          },
        }),
        category: 'alucinaciones',
      },
    ],
  },
  {
    topic: 'Seguridad',
    exercises: [
      {
        title: 'Información sensible',
        description: 'Aprende qué datos no debes compartir con la IA',
        type: 'trivia',
        content: JSON.stringify({
          question: '¿Qué tipo de información NO deberías compartir con una IA pública?',
          options: [
            { id: 'a', text: 'Datos salariales, contratos e información confidencial de la empresa', correct: true },
            { id: 'b', text: 'Recetas de cocina', correct: false },
            { id: 'c', text: 'Preguntas sobre temas de cultura general', correct: false },
            { id: 'd', text: 'Información disponible en sitios web públicos', correct: false },
          ],
        }),
        category: 'seguridad',
      },
      {
        title: 'Prompt Injection',
        description: 'Identifica qué es un ataque de prompt injection',
        type: 'trivia',
        content: JSON.stringify({
          question: '¿Qué es un ataque de "prompt injection"?',
          options: [
            { id: 'a', text: 'Un método para mejorar la velocidad de respuesta de la IA', correct: false },
            { id: 'b', text: 'Un ataque donde se introducen instrucciones maliciosas para manipular el comportamiento de la IA', correct: true },
            { id: 'c', text: 'Una técnica para inyectar datos de entrenamiento adicionales', correct: false },
            { id: 'd', text: 'Un método para comprimir prompts largos en versiones más cortas', correct: false },
          ],
        }),
        category: 'seguridad',
      },
      {
        title: 'Identifica riesgos de seguridad',
        description: 'Analiza un prompt que expone información sensible y redacta una versión segura',
        type: 'prompt',
        content: JSON.stringify({
          prompt: 'El siguiente prompt tiene problemas de seguridad. Identifica los riesgos:\n\n"Eres un experto en Excel. En el archivo adjunto están los salarios y datos personales de todos los empleados de la empresa, incluyendo números de identificación y direcciones. Modifica las columnas para ordenar por salario descendente y envíame el resultado."\n\nEscribe tu versión segura del prompt sin exponer datos sensibles.',
          expectedAnswer: '',
          structureCheck: {
            role: ['actúa', 'como', 'eres', 'experto', 'especialista'],
            context: ['contexto', 'ejemplo', 'muestra', 'hipotético', 'simula', 'genérico'],
            objective: ['objetivo', 'ordena', 'organiza', 'modifica', 'clasifica', 'analiza'],
            format: ['formato', 'pasos', 'instrucciones', 'cómo', 'guía'],
            restrictions: ['restricciones', 'datos sensibles', 'confidencial', 'seguridad', 'sin exponer', 'privacidad'],
          },
        }),
        category: 'seguridad',
      },
    ],
  },
  {
    topic: 'Buenas prácticas y plan de adopción',
    exercises: [
      {
        title: 'Plan de adopción',
        description: 'Conoce las fases para adoptar IA en tu organización',
        type: 'trivia',
        content: JSON.stringify({
          question: '¿Cuál es el plan de adopción de IA propuesto en el taller?',
          options: [
            { id: 'a', text: 'Semana 1: Comprar, Semana 2: Instalar, Semana 3: Capacitar, Semana 4: Evaluar', correct: false },
            { id: 'b', text: 'Semana 1: Experimentar, Semana 2: Automatizar, Semana 3: Estandarizar, Semana 4: Medir impacto', correct: true },
            { id: 'c', text: 'Semana 1: Investigar, Semana 2: Desarrollar, Semana 3: Lanzar, Semana 4: Celebrar', correct: false },
            { id: 'd', text: 'Semana 1: Analizar, Semana 2: Diseñar, Semana 3: Implementar, Semana 4: Mantener', correct: false },
          ],
        }),
        category: 'buenas-practicas',
      },
      {
        title: 'Técnicas de prompting',
        description: 'Identifica la técnica de prompting más adecuada según la tarea',
        type: 'trivia',
        content: JSON.stringify({
          question: '¿Cuándo es más apropiado usar la técnica de Cadena de Pensamiento (Chain of Thought)?',
          options: [
            { id: 'a', text: 'Para tareas simples como resumir un correo breve', correct: false },
            { id: 'b', text: 'Para análisis complejos, auditorías e investigaciones que requieren razonamiento estructurado paso a paso', correct: true },
            { id: 'c', text: 'Solo cuando se necesita generar imágenes', correct: false },
            { id: 'd', text: 'Cuando no se tiene acceso a internet', correct: false },
          ],
        }),
        category: 'buenas-practicas',
      },
      {
        title: 'Diseña un plan de adopción',
        description: 'Crea un prompt profesional para que la IA genere un plan de adopción de IA en una empresa',
        type: 'prompt',
        content: JSON.stringify({
          prompt: 'Diseña un prompt completo (con rol, contexto, objetivo, formato y restricciones) para que una IA genere un plan de adopción de inteligencia artificial en una empresa de 100 empleados durante 4 semanas.',
          expectedAnswer: '',
          structureCheck: {
            role: ['actúa', 'como', 'eres', 'consultor', 'experto', 'especialista', 'líder'],
            context: ['contexto', 'empresa', 'empleados', 'organización', 'equipo', 'compañía'],
            objective: ['objetivo', 'diseña', 'crea', 'desarrolla', 'plan', 'adopción', 'implementa'],
            format: ['formato', 'semanas', 'cronograma', 'calendario', 'pasos', 'fases', 'etapas'],
            restrictions: ['restricciones', 'presupuesto', 'recursos', 'limitado', 'máximo', 'mínimo'],
          },
        }),
        category: 'buenas-practicas',
      },
    ],
  },
];

export function seedIASinEnredos(): void {
  const db = getDb();

  const existing = db.prepare('SELECT id FROM trainings WHERE title = ?').get(COURSE_TITLE) as { id: string } | undefined;
  if (existing) return;

  const trainingId = uuid();
  let position = 0;

  const timeForType = (type: string): number =>
    type === 'trivia' ? 15 : type === 'prompt' ? 150 : 120;

  const insertExercise = db.prepare(
    'INSERT INTO exercises (id, title, description, type, content, category, topic, enabled, time_limit_seconds, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, datetime(\'now\'), datetime(\'now\'))',
  );

  const insertTrainingExercise = db.prepare(
    'INSERT INTO training_exercises (id, training_id, exercise_id, position) VALUES (?, ?, ?, ?)',
  );

  const insertTraining = db.prepare(
    'INSERT INTO trainings (id, title, description, enabled, created_at, updated_at) VALUES (?, ?, ?, 1, datetime(\'now\'), datetime(\'now\'))',
  );

  const tx = db.transaction(() => {
    insertTraining.run(
      trainingId,
      COURSE_TITLE,
      'Curso completo sobre fundamentos de IA, prompt engineering, tokens, alucinaciones, seguridad y buenas prácticas para usar la IA en el trabajo.',
    );

    for (const module of MODULES) {
      const topicId = uuid();
      // Insert a placeholder exercise for the module topic marker
      // (not needed, just use topic field on real exercises)

      for (const ex of module.exercises) {
        const exerciseId = uuid();
        insertExercise.run(
          exerciseId,
          ex.title,
          ex.description,
          ex.type,
          ex.content,
          ex.category,
          module.topic,
          timeForType(ex.type),
        );

        insertTrainingExercise.run(uuid(), trainingId, exerciseId, position);
        position++;
      }
    }
  });

  tx();
  console.log(`Seeded course: ${COURSE_TITLE} with ${position} exercises`);
  console.log(`  Training ID: ${trainingId}`);
}
