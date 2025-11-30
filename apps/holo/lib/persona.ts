// Cache for persona with 30-minute expiration
let personaCache: {
  data: string;
  timestamp: number;
} | null = null;

const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Fetch persona from Core API with 30-minute caching
 * @returns The persona string from the /api/v1/me endpoint
 */
export async function fetchPersona(coreConfig: {
  coreUrl: string;
  apiKey?: string;
  labels?: string[];
}): Promise<string> {
  const now = Date.now();

  // Return cached data if it exists and hasn't expired
  if (personaCache && now - personaCache.timestamp < CACHE_DURATION_MS) {
    return personaCache.data;
  }

  // Fetch fresh data

  const response = await fetch(`${coreConfig.coreUrl}/api/v1/me`, {
    headers: {
      Authorization: `Bearer ${coreConfig.apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch persona: ${response.statusText}`);
  }

  const data = await response.json();
  const persona = data.persona;

  // Update cache
  personaCache = {
    data: persona,
    timestamp: now,
  };

  return persona;
}
