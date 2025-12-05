import path from 'path';
import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'next-mdx-remote/serialize';

const holoConfigPath = process.env.HOLO_CONFIG_PATH ?? process.cwd();

async function fetchCoreDocument(logId: string) {
  try {
    // Load holo.json to get Core URL and API key
    const holoJsonPath = path.join(holoConfigPath, 'holo.json');
    const holoConfig = JSON.parse(await fs.readFile(holoJsonPath, 'utf8'));

    const coreUrl = holoConfig.core?.url;
    const coreApiKey = process.env.CORE_API_KEY;

    if (!coreUrl || !coreApiKey) {
      throw new Error('Core URL or API key not configured');
    }

    const response = await fetch(`${coreUrl}/api/v1/logs/${logId}`, {
      headers: {
        Authorization: `Bearer ${coreApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`);
    }

    const data = await response.json();

    return data.log.data.episodeBody;
  } catch (error) {
    console.error('Error fetching CORE document:', error);
    throw error;
  }
}

export async function GET(req: NextRequest) {
  const fileName = req.nextUrl.searchParams.get('fileName');

  try {
    // Check if this is a CORE document request
    const coreMatch = fileName?.match(/^CORE\s+(.+)$/);

    if (coreMatch) {
      const logId = coreMatch[1];
      const episodeBody = await fetchCoreDocument(logId.replace('.mdx', ''));

      // Serialize the markdown content
      const mdxSource = await serialize(episodeBody);

      return NextResponse.json(mdxSource);
    }

    // Original file handling for non-CORE files
    const filePath = path.join(holoConfigPath, `./${fileName}`);
    const fileContents = await fs.readFile(filePath, 'utf8');

    if (fileName?.includes('.json')) {
      return NextResponse.json(JSON.parse(fileContents));
    } else {
      const mdxSource = await serialize(fileContents, {
        parseFrontmatter: true,
      });

      return NextResponse.json(mdxSource);
    }
  } catch (error) {
    console.error('Error in config route:', error);
    return NextResponse.json(
      { error: 'File not found or invalid request' },
      { status: 404 },
    );
  }
}
