import fs from 'node:fs';
import path from 'node:path';
import {
  BedrockRuntimeClient,
  ConverseCommand,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const equals = trimmed.indexOf('=');
    if (equals === -1) continue;
    const key = trimmed.slice(0, equals).trim();
    const value = trimmed.slice(equals + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(path.resolve(process.cwd(), '.env.local'));

const region = process.env.AWS_REGION || 'ap-southeast-1';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';
const provider = (process.env.BEDROCK_PROVIDER || 'amazon').toLowerCase();
const modelId = process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0';

if (!accessKeyId || !secretAccessKey) {
  console.error('Missing AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY in .env.local');
  process.exit(1);
}

const client = new BedrockRuntimeClient({
  region,
  credentials: { accessKeyId, secretAccessKey },
});

const prompt = 'Reply with exactly this JSON: {"ok": true, "provider": "test"}';

async function runAmazon() {
  const response = await client.send(
    new ConverseCommand({
      modelId,
      system: [{ text: 'You are a test assistant.' }],
      messages: [{ role: 'user', content: [{ text: prompt }] }],
      inferenceConfig: { maxTokens: 200, temperature: 0 },
    })
  );
  const text = (response.output?.message?.content ?? [])
    .map((block) => ('text' in block ? block.text : ''))
    .join('\n');
  return text;
}

async function runAnthropic() {
  const body = JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 200,
    system: 'You are a test assistant.',
    messages: [{ role: 'user', content: prompt }],
  });

  const response = await client.send(
    new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body,
    })
  );

  const parsed = JSON.parse(new TextDecoder().decode(response.body));
  return parsed?.content?.[0]?.text ?? JSON.stringify(parsed);
}

async function main() {
  console.log('Testing Bedrock invocation with:');
  console.log(`- AWS_REGION=${region}`);
  console.log(`- BEDROCK_PROVIDER=${provider}`);
  console.log(`- BEDROCK_MODEL_ID=${modelId}`);

  try {
    const text = provider === 'amazon' ? await runAmazon() : await runAnthropic();
    console.log('\nInvocation succeeded. Model output:\n');
    console.log(text);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('\nInvocation failed:\n');
    console.error(message);
    process.exit(1);
  }
}

main();
