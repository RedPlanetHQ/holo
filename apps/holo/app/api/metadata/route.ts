import path from 'path';
import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import matter from 'gray-matter';

const holoConfigPath = process.env.HOLO_CONFIG_PATH ?? process.cwd();

async function fetchCoreDocumentMetadata(
  logId: string,
  coreUrl: string,
  coreApiKey: string,
) {
  try {
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

    return {
      title: data.log.title || 'Untitled',
      description: undefined,
    };
  } catch (error) {
    console.error(`Error fetching CORE document metadata for ${logId}:`, error);
    return {
      title: 'Untitled',
      description: '',
    };
  }
}

async function fetchMdxMetadata(fileName: string) {
  try {
    const filePath = path.join(holoConfigPath, `./${fileName}`);
    const fileContents = await fs.readFile(filePath, 'utf8');

    // Parse frontmatter
    const { data: frontmatter } = matter(fileContents);

    return {
      title: frontmatter.title || fileName.replace('.mdx', ''),
      description: frontmatter.description || '',
      ...frontmatter,
    };
  } catch (error) {
    console.error(`Error fetching MDX metadata for ${fileName}:`, error);
    return {
      title: fileName.replace('.mdx', ''),
      description: '',
    };
  }
}

async function fetchAllMetadata() {
  try {
    // Load holo.json
    const holoJsonPath = path.join(holoConfigPath, 'holo.json');
    const holoConfig = JSON.parse(await fs.readFile(holoJsonPath, 'utf8'));

    const coreUrl = holoConfig.core?.url;
    const coreApiKey = process.env.CORE_API_KEY;

    const metadataMap: Record<string, any> = {};

    // Extract all pages from navigation
    if (holoConfig.navigation && Array.isArray(holoConfig.navigation)) {
      for (const group of holoConfig.navigation) {
        if (group.pages && Array.isArray(group.pages)) {
          for (const page of group.pages) {
            // Check if this is a CORE document
            const coreMatch = page.match(/^CORE\s+(.+)$/);

            if (coreMatch && coreUrl && coreApiKey) {
              const logId = coreMatch[1];
              metadataMap[page] = await fetchCoreDocumentMetadata(
                logId,
                coreUrl,
                coreApiKey,
              );
            } else {
              // Regular MDX file
              const fileName = page.endsWith('.mdx') ? page : `${page}.mdx`;
              metadataMap[page] = await fetchMdxMetadata(fileName);
            }
          }
        }
      }
    }

    return metadataMap;
  } catch (error) {
    console.error('Error fetching all metadata:', error);
    throw error;
  }
}

export async function GET(req: NextRequest) {
  const fileName = req.nextUrl.searchParams.get('fileName');

  try {
    // If no fileName specified, return all metadata
    if (!fileName) {
      const allMetadata = await fetchAllMetadata();
      return NextResponse.json(allMetadata);
    }

    // Single file metadata
    const coreMatch = fileName.match(/^CORE\s+(.+)$/);

    if (coreMatch) {
      const holoJsonPath = path.join(holoConfigPath, 'holo.json');
      const holoConfig = JSON.parse(await fs.readFile(holoJsonPath, 'utf8'));
      const coreUrl = holoConfig.core?.url;
      const coreApiKey = process.env.CORE_API_KEY;

      if (!coreUrl || !coreApiKey) {
        throw new Error('Core URL or API key not configured');
      }

      const logId = coreMatch[1].replace('.mdx', '');
      const metadata = await fetchCoreDocumentMetadata(
        logId,
        coreUrl,
        coreApiKey,
      );
      return NextResponse.json(metadata);
    }

    // Regular MDX file
    const metadata = await fetchMdxMetadata(fileName);
    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error in metadata route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 404 },
    );
  }
}
