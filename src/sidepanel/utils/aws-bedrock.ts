import {
  BedrockRuntimeClient,
  ConverseCommand,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import type { AnalysisResult } from './types';
import { normalizeAnalysisResult } from './normalize-analysis';

function debugLog(message: string, data?: unknown) {
  if (!__DEBUG_LOGS__) return;
  if (data !== undefined) {
    console.log(`[LabLens][Bedrock] ${message}`, data);
    return;
  }
  console.log(`[LabLens][Bedrock] ${message}`);
}

const SYSTEM_PROMPT = `You are LabLens, a medical lab report translator. Your job is to take raw lab result text and convert it into plain English that a non-medical person can understand.

Rules:
- NEVER diagnose or give medical advice
- NEVER say "you should" or "you need to" — instead say "you may want to ask your doctor about..."
- Group results by body system, NOT individual tests — users care about "is my liver OK?" not "what is ALT?"
- For each body system group, write a topline (1–2 sentences) in warm, reassuring plain English — this is the HERO text. Bold-worthy words: body system names, status words like elevated/low/normal
- Use analogies for abnormal/borderline groups when helpful
- Flag values outside reference range as abnormal or borderline
- Generate 3–5 specific doctor questions based on flagged values
- Always include the disclaimer

Group tests into these systems (only include systems present in the report):
- Liver Health (🫁): ALT, AST, ALP, Bilirubin, Albumin
- Blood Count (🩸): Hemoglobin, WBC, RBC, Platelet, Hematocrit, MCV, MCH, MCHC
- Cholesterol & Heart (💛): Total Cholesterol, HDL, LDL, Triglycerides
- Kidney Function (🦴): Creatinine, BUN, eGFR
- Blood Sugar (🍬): Glucose, HbA1c

Set urgency:
- "action_needed" if ANY value is abnormal
- "worth_monitoring" if only borderline values (no abnormal)
- "all_clear" if all values normal

Set each group's status using worst value in group: abnormal > borderline > normal

Respond in this exact JSON format only, no markdown:
{
  "summary": "A 2–3 sentence overview of the report",
  "urgency": "action_needed" | "worth_monitoring" | "all_clear",
  "groups": [
    {
      "system": "Liver Health",
      "icon": "🫁",
      "status": "abnormal" | "borderline" | "normal",
      "topline": "Your liver enzymes are higher than normal. This could be caused by medication, alcohol, or fatty liver. Worth discussing with your doctor.",
      "analogy": "Think of liver enzymes like a check engine light — they don't tell you exactly what's wrong, but they say something's worth checking.",
      "values": [
        {
          "name": "ALT",
          "fullName": "Alanine Aminotransferase",
          "value": "78",
          "unit": "U/L",
          "referenceRange": "7–56",
          "status": "abnormal"
        }
      ]
    }
  ],
  "questions": [
    {
      "question": "The question to ask",
      "context": "Why this question matters based on the results"
    }
  ],
  "disclaimer": "This is not medical advice. Please consult your healthcare provider for interpretation of your results."
}`;

function getAwsConfig() {
  return {
    region: __AWS_REGION__,
    credentials:
      __AWS_ACCESS_KEY_ID__ && __AWS_SECRET_ACCESS_KEY__
        ? {
            accessKeyId: __AWS_ACCESS_KEY_ID__,
            secretAccessKey: __AWS_SECRET_ACCESS_KEY__,
          }
        : undefined,
  };
}

function parseJsonFromResponse(text: string): AnalysisResult {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid AI response format');
  const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  return normalizeAnalysisResult(parsed);
}

function getProvider(): 'anthropic' | 'amazon' {
  const provider = (__BEDROCK_PROVIDER__ || 'anthropic').toLowerCase();
  return provider === 'amazon' ? 'amazon' : 'anthropic';
}

function getModelId(provider: 'anthropic' | 'amazon'): string {
  const configured = __BEDROCK_MODEL_ID__?.trim();
  if (configured) return configured;
  if (provider === 'amazon') return 'amazon.nova-lite-v1:0';
  return 'anthropic.claude-3-5-sonnet-20240620-v1:0';
}

export function getDemoAnalysisResult(): AnalysisResult {
  return normalizeAnalysisResult({
    summary:
      'Your complete blood count looks mostly **normal**, with a few areas worth discussing — particularly your **liver** enzymes and **cholesterol** levels.',
    urgency: 'action_needed',
    groups: [
      {
        system: 'Liver Health',
        icon: '🫁',
        status: 'abnormal',
        topline:
          'Your liver enzymes are higher than normal. This could be caused by medication, alcohol, or fatty liver. Worth discussing with your doctor.',
        analogy:
          "Think of liver enzymes like a check engine light — they don't tell you exactly what's wrong, but they say something's worth checking.",
        values: [
          {
            name: 'ALT',
            fullName: 'Alanine Aminotransferase',
            value: '78',
            unit: 'U/L',
            referenceRange: '7–56',
            status: 'abnormal',
          },
          {
            name: 'AST',
            fullName: 'Aspartate Aminotransferase',
            value: '45',
            unit: 'U/L',
            referenceRange: '10–40',
            status: 'abnormal',
          },
          {
            name: 'ALP',
            fullName: 'Alkaline Phosphatase',
            value: '82',
            unit: 'U/L',
            referenceRange: '44–147',
            status: 'normal',
          },
          {
            name: 'Bili',
            fullName: 'Total Bilirubin',
            value: '0.9',
            unit: 'mg/dL',
            referenceRange: '0.1–1.2',
            status: 'normal',
          },
          {
            name: 'Alb',
            fullName: 'Albumin',
            value: '4.2',
            unit: 'g/dL',
            referenceRange: '3.5–5.0',
            status: 'normal',
          },
        ],
      },
      {
        system: 'Cholesterol & Heart',
        icon: '💛',
        status: 'abnormal',
        topline:
          'Your cholesterol levels are elevated, with HDL slightly low. This is common and often improves with lifestyle changes — but worth a conversation with your doctor.',
        analogy:
          'Think of HDL as the cleanup crew in your blood vessels — lower levels mean less protection for your heart.',
        values: [
          {
            name: 'Total Chol',
            fullName: 'Total Cholesterol',
            value: '218',
            unit: 'mg/dL',
            referenceRange: '< 200',
            status: 'abnormal',
          },
          {
            name: 'HDL',
            fullName: 'HDL Cholesterol',
            value: '38',
            unit: 'mg/dL',
            referenceRange: '> 40',
            status: 'borderline',
          },
          {
            name: 'LDL',
            fullName: 'LDL Cholesterol',
            value: '148',
            unit: 'mg/dL',
            referenceRange: '< 100',
            status: 'abnormal',
          },
          {
            name: 'Trig',
            fullName: 'Triglycerides',
            value: '160',
            unit: 'mg/dL',
            referenceRange: '< 150',
            status: 'abnormal',
          },
        ],
      },
      {
        system: 'Blood Count',
        icon: '🩸',
        status: 'borderline',
        topline:
          'Your blood count is mostly normal, with white blood cells slightly elevated. This can happen with mild infection or stress and is often temporary.',
        values: [
          {
            name: 'Hgb',
            fullName: 'Hemoglobin',
            value: '14.2',
            unit: 'g/dL',
            referenceRange: '13.0–17.0',
            status: 'normal',
          },
          {
            name: 'WBC',
            fullName: 'White Blood Cell',
            value: '11.8',
            unit: 'x10⁹/L',
            referenceRange: '4.0–10.0',
            status: 'borderline',
          },
          {
            name: 'RBC',
            fullName: 'Red Blood Cell',
            value: '4.85',
            unit: 'x10¹²/L',
            referenceRange: '4.50–5.50',
            status: 'normal',
          },
          {
            name: 'Plt',
            fullName: 'Platelet Count',
            value: '245',
            unit: 'x10⁹/L',
            referenceRange: '150–400',
            status: 'normal',
          },
        ],
      },
    ],
    questions: [
      {
        question:
          'My liver enzymes are above normal — could this be related to any medication I am currently taking?',
        context:
          'Certain medications like statins, pain relievers, and some antibiotics can temporarily raise liver enzymes.',
      },
      {
        question:
          'My cholesterol levels are elevated — what lifestyle changes would you recommend before considering medication?',
        context:
          'Diet, exercise, and weight management can significantly improve cholesterol levels for many patients.',
      },
      {
        question:
          'My white blood cell count is slightly high — should I be tested for any underlying infection or inflammation?',
        context: 'Mild WBC elevation can be temporary but may warrant follow-up if persistent.',
      },
      {
        question: 'Should I schedule a follow-up test in 4 weeks as noted on the report?',
        context: 'Retesting helps confirm whether elevated values are improving or need further investigation.',
      },
    ],
    disclaimer:
      'This is not medical advice. Please consult your healthcare provider for interpretation of your results.',
  });
}

export async function analyzeWithBedrock(extractedText: string): Promise<AnalysisResult> {
  debugLog('analyzeWithBedrock called', { demoMode: __DEMO_MODE__, textLength: extractedText.length });
  if (__DEMO_MODE__) {
    debugLog('DEMO_MODE=true, returning demo result');
    await new Promise((r) => setTimeout(r, 1500));
    return getDemoAnalysisResult();
  }

  const config = getAwsConfig();
  if (!config.credentials) {
    debugLog('AWS credentials missing, returning demo result');
    await new Promise((r) => setTimeout(r, 800));
    return getDemoAnalysisResult();
  }

  const client = new BedrockRuntimeClient(config);
  const provider = getProvider();
  const modelId = getModelId(provider);
  debugLog('Resolved provider/model', { provider, modelId, region: config.region });

  if (provider === 'amazon') {
    debugLog('Invoking Amazon model with ConverseCommand');
    const response = await client.send(
      new ConverseCommand({
        modelId,
        system: [{ text: SYSTEM_PROMPT }],
        messages: [
          {
            role: 'user',
            content: [
              {
                text: `Analyze this lab report text and respond with the JSON format specified:\n\n${extractedText}`,
              },
            ],
          },
        ],
        inferenceConfig: {
          maxTokens: 4096,
          temperature: 0.2,
        },
      })
    );

    const content = (response.output?.message?.content ?? [])
      .map((block) => ('text' in block ? block.text : ''))
      .join('\n');
    debugLog('Amazon response received', { outputLength: content.length });
    return parseJsonFromResponse(content);
  }

  debugLog('Invoking Anthropic model with InvokeModelCommand');
  const body = JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Analyze this lab report text and respond with the JSON format specified:\n\n${extractedText}`,
      },
    ],
  });

  const response = await client.send(
    new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body,
    })
  );

  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  const content = responseBody.content?.[0]?.text ?? '';
  debugLog('Anthropic response received', { outputLength: content.length });
  return parseJsonFromResponse(content);
}
