import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import type { AnalysisResult, LabValueStatus } from './types';
import { sortLabValues } from './helpers';

const SYSTEM_PROMPT = `You are LabLens, a medical lab report translator. Your job is to take raw lab result text and convert it into plain English that a non-medical person can understand.

Rules:
- NEVER diagnose or give medical advice
- NEVER say "you should" or "you need to" — instead say "you may want to ask your doctor about..."
- Explain each lab value in 1–2 simple sentences
- Flag values outside the reference range as ABNORMAL (red) or BORDERLINE (amber)
- Use analogies when helpful (e.g. "Think of HDL cholesterol as the cleanup crew in your blood vessels")
- End every explanation with what the value measures and why it matters in everyday terms
- Generate 3–5 specific questions the patient should ask their doctor, based on the flagged values
- Always include the disclaimer: "This is not medical advice. Please consult your healthcare provider."

Respond in this exact JSON format only, no markdown:
{
  "summary": "A 2–3 sentence overview of the report",
  "values": [
    {
      "name": "Test name",
      "originalValue": "value + unit as shown in report",
      "referenceRange": "range as shown in report",
      "status": "normal" | "borderline" | "abnormal",
      "explanation": "Plain English explanation (1–2 sentences)",
      "analogy": "Optional simple analogy if it helps"
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
  const parsed = JSON.parse(jsonMatch[0]) as AnalysisResult;

  parsed.values = sortLabValues(
    (parsed.values || []).map((v) => ({
      ...v,
      status: (v.status || 'normal') as LabValueStatus,
    }))
  );

  parsed.disclaimer =
    parsed.disclaimer ||
    'This is not medical advice. Please consult your healthcare provider for interpretation of your results.';

  return parsed;
}

export function getDemoAnalysisResult(): AnalysisResult {
  return {
    summary:
      'Your complete blood count and metabolic panel show mostly normal results, with a few values worth discussing with your doctor — particularly your liver enzymes and cholesterol levels.',
    values: sortLabValues([
      {
        name: 'ALT (Alanine Aminotransferase)',
        originalValue: '78 U/L',
        referenceRange: '7 – 56 U/L',
        status: 'abnormal',
        explanation:
          'This enzyme lives in your liver. When the level is higher than normal, it can mean your liver is working harder than usual — often due to medications, alcohol, or fatty liver.',
        analogy: 'Think of it like a "check engine" light for your liver.',
      },
      {
        name: 'AST (Aspartate Aminotransferase)',
        originalValue: '45 U/L',
        referenceRange: '10 – 40 U/L',
        status: 'abnormal',
        explanation:
          'AST is another liver enzyme. Elevated levels alongside ALT may suggest your liver needs attention, though mild elevations can also come from exercise.',
      },
      {
        name: 'White Blood Cell Count',
        originalValue: '11.8 x10⁹/L',
        referenceRange: '4.0 – 10.0 x10⁹/L',
        status: 'borderline',
        explanation:
          'White blood cells fight infections. A slightly elevated count may indicate your body is responding to an infection, inflammation, or stress.',
      },
      {
        name: 'HDL Cholesterol',
        originalValue: '38 mg/dL',
        referenceRange: '> 40 mg/dL',
        status: 'borderline',
        explanation:
          'HDL is the "good cholesterol" that helps remove bad cholesterol from your arteries. Lower levels mean less protection for your heart.',
        analogy: 'Think of HDL as the cleanup crew in your blood vessels.',
      },
      {
        name: 'Total Cholesterol',
        originalValue: '218 mg/dL',
        referenceRange: '< 200 mg/dL',
        status: 'abnormal',
        explanation:
          'Total cholesterol measures all cholesterol in your blood. Levels above 200 may increase long-term heart disease risk.',
      },
      {
        name: 'Hemoglobin',
        originalValue: '14.2 g/dL',
        referenceRange: '13.0 – 17.0 g/dL',
        status: 'normal',
        explanation:
          'Hemoglobin carries oxygen in your red blood cells. Your level is within the healthy range, which supports good energy and oxygen delivery.',
      },
      {
        name: 'Platelet Count',
        originalValue: '245 x10⁹/L',
        referenceRange: '150 – 400 x10⁹/L',
        status: 'normal',
        explanation:
          'Platelets help your blood clot when you get a cut. Your count is normal, which is a good sign for healthy healing.',
      },
    ]),
    questions: [
      {
        question:
          'My ALT and AST levels are above normal — could this be related to any medication I am currently taking?',
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
  };
}

export async function analyzeWithBedrock(extractedText: string): Promise<AnalysisResult> {
  if (__DEMO_MODE__) {
    await new Promise((r) => setTimeout(r, 1500));
    return getDemoAnalysisResult();
  }

  const config = getAwsConfig();
  if (!config.credentials) {
    await new Promise((r) => setTimeout(r, 800));
    return getDemoAnalysisResult();
  }

  const client = new BedrockRuntimeClient(config);
  const modelId =
    'anthropic.claude-3-5-sonnet-20240620-v1:0';

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
  return parseJsonFromResponse(content);
}
