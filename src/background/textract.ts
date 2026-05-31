import {
  TextractClient,
  AnalyzeDocumentCommand,
  Block,
} from '@aws-sdk/client-textract';

function debugLog(message: string, data?: unknown) {
  if (!__DEBUG_LOGS__) return;
  if (data !== undefined) {
    console.log(`[LabLens][Textract] ${message}`, data);
    return;
  }
  console.log(`[LabLens][Textract] ${message}`);
}

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

function blocksToText(blocks: Block[] | undefined): string {
  if (!blocks) return '';
  return blocks
    .filter((b) => b.BlockType === 'LINE' && b.Text)
    .map((b) => b.Text!)
    .join('\n');
}

export async function extractTextWithTextract(base64Pdf: string): Promise<string | null> {
  const config = getAwsConfig();
  debugLog('extractTextWithTextract called', { demoMode: __DEMO_MODE__, hasCredentials: !!config.credentials });
  if (!config.credentials || __DEMO_MODE__) {
    debugLog('Skipping Textract (demo mode or missing credentials)');
    return null;
  }

  const client = new TextractClient(config);
  const bytes = Uint8Array.from(atob(base64Pdf), (c) => c.charCodeAt(0));

  try {
    debugLog('Invoking Textract AnalyzeDocument');
    const response = await client.send(
      new AnalyzeDocumentCommand({
        Document: { Bytes: bytes },
        FeatureTypes: ['TABLES', 'FORMS'],
      })
    );
    const text = blocksToText(response.Blocks);
    debugLog('Textract response received', { textLength: text.length });
    return text.trim().length > 50 ? text : null;
  } catch (err) {
    debugLog('Textract failed', err);
    return null;
  }
}
