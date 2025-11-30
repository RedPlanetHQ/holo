import { AISDKClient } from './client';
import type { LLMClient, AIProviderConfig } from './types/index';

// Custom error class for configuration errors that need special UI handling
export class ConfigurationError extends Error {
  constructor(
    message: string,
    public configPath: string,
    public cwdPath?: string,
    public isEmptyConfig: boolean = false,
  ) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export async function createAISDKClient(
  config: AIProviderConfig,
): Promise<{ client: LLMClient }> {
  const errors: string[] = [];

  try {
    // Test provider connection
    await testProviderConnection(config);

    const client = await AISDKClient.create(config);

    return { client };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    errors.push(`${config.name}: ${errorMessage}`);
    const combinedError = `No providers available: ${
      errors[0]?.split(': ')[1] || 'Unknown error'
    }\n\nPlease create an agents.config.json file with provider configuration.`;
    throw new Error(combinedError);
  }
}

async function testProviderConnection(
  providerConfig: AIProviderConfig,
): Promise<void> {
  // Test local servers for connectivity
  if (
    providerConfig.config.baseURL &&
    providerConfig.config.baseURL.includes('localhost')
  ) {
    try {
      await fetch(providerConfig.config.baseURL, {
        signal: AbortSignal.timeout(5000),
      });
      // Don't check response.ok as some servers return 404 for root path
      // We just need to confirm the server responded (not a network error)
    } catch (error) {
      // Only throw if it's a network error, not a 404 or other HTTP response
      if (error instanceof TypeError) {
        throw new Error(
          `Server not accessible at ${providerConfig.config.baseURL}`,
        );
      }
      // For AbortError (timeout), also throw
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(
          `Server not accessible at ${providerConfig.config.baseURL}`,
        );
      }
      // Other errors (like HTTP errors) mean the server is responding, so pass
    }
  }
  // Require API key for hosted providers
  if (
    !providerConfig.config.apiKey &&
    !providerConfig.config.baseURL?.includes('localhost')
  ) {
    throw new Error('API key required for hosted providers');
  }
}

export * from './types';
export * from './prompts';
