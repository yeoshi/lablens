import {
  TextractClient,
  AnalyzeDocumentCommand,
  Block,
} from '@aws-sdk/client-textract';

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
  if (!config.credentials || __DEMO_MODE__) {
    return null;
  }

  const client = new TextractClient(config);
  const bytes = Uint8Array.from(atob(base64Pdf), (c) => c.charCodeAt(0));

  try {
    const response = await client.send(
      new AnalyzeDocumentCommand({
        Document: { Bytes: bytes },
        FeatureTypes: ['TABLES', 'FORMS'],
      })
    );
    const text = blocksToText(response.Blocks);
    return text.trim().length > 50 ? text : null;
  } catch {
    return null;
  }
}
