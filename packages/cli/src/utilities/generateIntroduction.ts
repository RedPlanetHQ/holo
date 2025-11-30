import { confirm, isCancel, cancel, note, spinner, log } from '@clack/prompts';
import fs from 'node:fs';
import path from 'node:path';
import {
  createAISDKClient,
  INTRODUCTION_GENERATION_PROMPT,
  INTRODUCTION_SYSTEM_PROMPT,
} from 'ai-client';
import type { AIProviderConfig } from 'ai-client';

/**
 * Generates introduction.mdx using AI based on persona from Core API
 */
export async function generateIntroduction(
  coreUrl: string,
  coreApiKey: string,
  providerConfig: {
    name: string;
    model: string;
    baseUrl: string;
    apiKey: string;
  },
) {
  const introPath = path.join(process.cwd(), 'introduction.mdx');
  let shouldGenerateIntro = true;

  // Check if introduction.mdx already exists
  if (fs.existsSync(introPath)) {
    const regenerate = await confirm({
      message: 'introduction.mdx already exists. Do you want to regenerate it?',
      initialValue: false,
    });

    if (isCancel(regenerate)) {
      cancel('Setup cancelled.');
      process.exit(0);
    }

    shouldGenerateIntro = regenerate as boolean;

    if (!shouldGenerateIntro) {
      log.info('Keeping existing introduction.mdx');
      return;
    }
  }

  if (shouldGenerateIntro) {
    await fetchPersonaAndGenerate(
      coreUrl,
      coreApiKey,
      providerConfig,
      introPath,
    );
  }
}

/**
 * Fetches persona from Core API and generates introduction.mdx
 */
async function fetchPersonaAndGenerate(
  coreUrl: string,
  coreApiKey: string,
  providerConfig: {
    name: string;
    model: string;
    baseUrl: string;
    apiKey: string;
  },
  introPath: string,
) {
  let spin = spinner();
  let introSpin: ReturnType<typeof spinner> | null = null;

  try {
    spin.start('Fetching persona information from Core...');

    // Create AI client config
    const aiConfig: AIProviderConfig = {
      name: providerConfig.name,
      type: 'openai-compatible',
      model: providerConfig.model,
      config: {
        baseURL: providerConfig.baseUrl,
        apiKey: providerConfig.apiKey,
      },
    };

    // Create AI client
    const { client } = await createAISDKClient(aiConfig);

    // Fetch persona from Core API
    const response = await fetch(`${coreUrl}/api/v1/me`, {
      headers: {
        Authorization: `Bearer ${coreApiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch persona: ${response.statusText}`);
    }

    const data = await response.json();
    const persona = data.persona;

    spin.stop('Persona fetched successfully!');

    // Generate introduction.mdx using AI
    introSpin = spinner();
    introSpin.start('Generating introduction.mdx...');

    const result = await client.chat(
      [
        {
          role: 'system',
          content: INTRODUCTION_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `${INTRODUCTION_GENERATION_PROMPT}\n\nPersona information:\n\n${persona}`,
        },
      ],
      {},
    );

    const introContent = result.choices[0].message.content;

    // Save introduction.mdx
    fs.writeFileSync(introPath, introContent, 'utf-8');

    introSpin.stop('Generated introduction.mdx');
    log.info(`Created introduction.mdx at ${introPath}`);
  } catch (error) {
    // Stop whichever spinner is currently active
    if (introSpin) {
      introSpin.stop('Failed to generate introduction');
    } else {
      spin.stop('Failed to fetch persona');
    }
    log.error(
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    log.info('You can manually create introduction.mdx later');
  }
}
