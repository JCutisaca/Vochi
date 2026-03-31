import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';
import { toFile } from 'groq-sdk';

interface Message {
  role: 'ai' | 'user';
  text: string;
}

export interface FeedbackMetric {
  label: string;
  score: number; // 0-10
  comment: string;
}

export interface FeedbackMoment {
  question: string;
  answer: string;
  tag: 'fuerte' | 'aceptable' | 'debil';
}

export interface FeedbackImprovement {
  title: string;
  priority: 'alta' | 'media' | 'baja';
  body: string;
  quote: string;
  action: string;
}

export interface FeedbackResult {
  score: number;
  summary: string;
  tags: string[];
  positives: string[];
  improvements: FeedbackImprovement[];
  metrics: FeedbackMetric[];
  moments: FeedbackMoment[];
  nextSteps: string[];
}

export interface JobValidationResult {
  valid: boolean;
  role?: string;
  company?: string;
  stack?: string[];
  prepFacts?: string[];
  reason?: string;
}

@Injectable()
export class GroqService {
  private clients: Groq[];
  private currentIndex = 0;

  constructor() {
    // this.client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const raw = process.env.GROQ_API_KEY ?? '';
    const keys = raw
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    if (keys.length === 0) {
      throw new Error('GROQ_API_KEY no configurada');
    }

    this.clients = keys.map((key) => new Groq({ apiKey: key }));
  }

  private getClient(): Groq {
    const client = this.clients[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.clients.length;
    return client;
  }

  async validateJobDescription(text: string): Promise<JobValidationResult> {
    const response = await this.getClient().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `Sos un experto en recursos humanos y recruiting tecnico.
Tu tarea es determinar si el texto proporcionado es una oferta laboral real.

Responde SOLO con JSON valido, sin markdown, usando este formato:
{
  "valid": true,
  "role": "string opcional",
  "company": "string opcional",
  "stack": ["string"],
  "prepFacts": ["string"],
  "reason": "string opcional"
}

Reglas:
- Si NO es una oferta laboral real, responde: {"valid": false, "reason": "explicacion breve"}.
- Si SI es valida, responde "valid": true.
- "role" debe ser el puesto principal detectado.
- "company" solo si aparece explicitamente.
- "stack" debe incluir tecnologias, herramientas o dominios mencionados en el texto.
- "prepFacts" debe incluir entre 3 y 5 puntos breves y concretos para prepararse para la entrevista, basados solamente en el texto.
- No inventes informacion que no aparezca en la oferta.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.1,
      max_tokens: 400,
    });

    const content = response.choices[0].message.content ?? '{"valid": false}';

    try {
      const clean = content.replace(/```json|```/g, '').trim();
      return this.normalizeJobValidationResult(JSON.parse(clean));
    } catch {
      return { valid: false, reason: 'No se pudo analizar el texto' };
    }
  }

  async generateFeedback(
    jobDescription: string,
    type: 'rrhh' | 'tecnica',
    transcript: Message[],
    status: 'finished' | 'abandoned' = 'finished',
  ): Promise<FeedbackResult> {
    const transcriptText = transcript
      .map(
        (message) =>
          `${message.role === 'ai' ? 'Entrevistador' : 'Candidato'}: ${message.text}`,
      )
      .join('\n');

    const statusNote =
      status === 'abandoned'
        ? 'NOTA: El candidato abandonó la entrevista antes de terminarla. Evaluá únicamente lo observado, pero dejá claro qué áreas no pudieron evaluarse.'
        : 'La entrevista fue completada íntegramente.';

    const metricsDefinition =
      type === 'rrhh'
        ? `- "Comunicación": claridad, fluidez y estructura al hablar
- "Motivación": genuinidad del interés por el puesto y la empresa
- "Fit cultural": alineación de valores y forma de trabajar con lo que pide el puesto
- "Adaptabilidad": capacidad de trabajar en entornos cambiantes, remotos o de alta presión
- "Autoconocimiento": capacidad de hablar sobre fortalezas, debilidades y aprendizajes propios`
        : `- "Conocimiento técnico": dominio real de las tecnologías y conceptos requeridos
- "Resolución de problemas": enfoque, lógica y metodología ante situaciones complejas
- "Comunicación técnica": capacidad de explicar conceptos técnicos con claridad
- "Profundidad": nivel de detalle y precisión en las respuestas técnicas
- "Pragmatismo": orientación a soluciones concretas y viables`;

    const response = await this.getClient().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `Sos un coach de carrera experto en preparación para entrevistas laborales.

REGLAS ESTRICTAS:
1. Cada punto de "improvements" y "positives" DEBE citar un momento concreto de la transcripción.
2. Cada "improvement" tiene: title (corto), priority (alta/media/baja), body (qué falló y por qué importa), quote (frase textual del candidato), action (qué hacer concretamente, empieza con verbo).
3. El "summary" es un párrafo honesto de 3-4 oraciones: ¿está listo para el puesto?, ¿qué impresión dejaría?, ¿cuál es el gap más crítico?
4. "tags" son 4-5 pills cortos (máx 3 palabras) que resumen lo más destacado positivo y negativo.
5. "moments" son los 3 momentos que más pesaron en el score: question (pregunta del entrevistador resumida), answer (respuesta textual del candidato, máx 15 palabras), tag (fuerte/aceptable/debil).
6. "nextSteps" son 3 acciones concretas que el candidato puede hacer esta semana para mejorar.
7. "metrics" evalúa cada dimensión con score 0-10 y comment de 1 oración con evidencia de la transcripción.
8. PROHIBIDO frases genéricas sin anclarlas a la transcripción.
9. SÉ BRUTALMENTE HONESTO con el score. No infles la puntuación para motivar al candidato. Si el candidato no respondió ninguna pregunta sustancial de la entrevista, el score no puede superar 15. Si las respuestas fueron superficiales o evasivas, el score debe estar entre 15 y 40. El score tiene que reflejar la realidad del desempeño, no ser generoso.

${metricsDefinition}

Responde SOLO con JSON válido sin markdown:
{
  "score": <0-100>,
  "summary": "<3-4 oraciones>",
  "tags": ["<pill>", ...],
  "positives": ["<fortaleza con cita>", ...],
  "improvements": [
    {
      "title": "<título corto>",
      "priority": "alta|media|baja",
      "body": "<qué falló y por qué importa>",
      "quote": "<frase textual del candidato>",
      "action": "<acción concreta>"
    }
  ],
  "metrics": [{ "label": "<dimensión>", "score": <0-10>, "comment": "<1 oración>" }],
  "moments": [{ "question": "<pregunta resumida>", "answer": "<respuesta corta>", "tag": "fuerte|aceptable|debil" }],
  "nextSteps": ["<acción 1>", "<acción 2>", "<acción 3>"]
}`,
        },
        {
          role: 'user',
          content: `PUESTO AL QUE APLICA:\n${jobDescription}\n\nTIPO DE ENTREVISTA: ${type === 'rrhh' ? 'Recursos Humanos' : 'Técnica'}\n\n${statusNote}\n\nTRANSCRIPCIÓN COMPLETA:\n${transcriptText}\n\nAnalizá esta entrevista en profundidad y dá feedback que realmente le sirva al candidato para mejorar.`,
        },
      ],
      temperature: 0.4,
      max_tokens: 3000,
    });

    const content = response.choices[0].message.content ?? '';

    try {
      const clean = content.replace(/```json|```/g, '').trim();
      return JSON.parse(clean);
    } catch {
      throw new Error('No se pudo parsear el feedback de Groq');
    }
  }

  async transcribeAudio(pcmBytes: Buffer, sampleRate = 16000): Promise<string> {
    const wav = this._buildWav(pcmBytes, sampleRate);
    const file = await toFile(wav, 'audio.wav', { type: 'audio/wav' });

    const response = await this.getClient().audio.transcriptions.create({
      file,
      model: 'whisper-large-v3-turbo',
      language: 'es',
      response_format: 'text',
    });

    return (response as unknown as string).trim();
  }

  private _buildWav(pcmData: Buffer, sampleRate: number): Buffer {
    const channels = 1;
    const bitsPerSample = 16;
    const byteRate = (sampleRate * channels * bitsPerSample) / 8;
    const blockAlign = (channels * bitsPerSample) / 8;
    const dataSize = pcmData.length;
    const headerSize = 44;

    const buf = Buffer.alloc(headerSize + dataSize);
    let offset = 0;

    buf.write('RIFF', offset);
    offset += 4;
    buf.writeUInt32LE(36 + dataSize, offset);
    offset += 4;
    buf.write('WAVE', offset);
    offset += 4;
    buf.write('fmt ', offset);
    offset += 4;
    buf.writeUInt32LE(16, offset);
    offset += 4; // PCM chunk size
    buf.writeUInt16LE(1, offset);
    offset += 2; // PCM format
    buf.writeUInt16LE(channels, offset);
    offset += 2;
    buf.writeUInt32LE(sampleRate, offset);
    offset += 4;
    buf.writeUInt32LE(byteRate, offset);
    offset += 4;
    buf.writeUInt16LE(blockAlign, offset);
    offset += 2;
    buf.writeUInt16LE(bitsPerSample, offset);
    offset += 2;
    buf.write('data', offset);
    offset += 4;
    buf.writeUInt32LE(dataSize, offset);
    offset += 4;
    pcmData.copy(buf, offset);

    return buf;
  }

  private normalizeJobValidationResult(value: unknown): JobValidationResult {
    if (!value || typeof value !== 'object') {
      return { valid: false, reason: 'No se pudo analizar el texto' };
    }

    const raw = value as Record<string, unknown>;

    if (raw.valid !== true) {
      return {
        valid: false,
        reason:
          this.getOptionalString(raw.reason) ??
          'El texto no parece una oferta laboral valida',
      };
    }

    const result: JobValidationResult = { valid: true };
    const role = this.getOptionalString(raw.role);
    const company = this.getOptionalString(raw.company);
    const stack = this.getStringArray(raw.stack);
    const prepFacts = this.getStringArray(raw.prepFacts);

    if (role) {
      result.role = role;
    }

    if (company) {
      result.company = company;
    }

    if (stack.length > 0) {
      result.stack = stack;
    }

    if (prepFacts.length > 0) {
      result.prepFacts = prepFacts;
    }

    return result;
  }

  private getOptionalString(value: unknown): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  private getStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item) => this.getOptionalString(item))
      .filter((item): item is string => Boolean(item));
  }
}
