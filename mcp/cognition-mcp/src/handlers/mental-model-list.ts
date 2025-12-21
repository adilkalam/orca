/**
 * Mental Model List Handler - Read-Only Operation
 * 
 * Returns metadata about available mental model templates.
 * This is a read-only operation that doesn't modify session state.
 */

import type { CognitionRequest, HandlerResult } from '../types.js';
import { SessionState } from '../session/state.js';
import * as fs from 'fs';
import * as path from 'path';

interface MentalModelMetadata {
  name: string;
  title: string;
  description: string;
  tags: string[];
}

/**
 * Parse frontmatter from markdown file to extract metadata
 */
function parseFrontmatter(content: string): { title: string; tags: string[]; description: string } {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return { title: '', tags: [], description: '' };
  }

  const frontmatter = frontmatterMatch[1];
  const titleMatch = frontmatter.match(/title:\s*(.+)/);
  const tagsMatch = frontmatter.match(/tags:\s*\[(.+)\]/);
  
  const title = titleMatch ? titleMatch[1].trim() : '';
  const tags = tagsMatch 
    ? tagsMatch[1].split(',').map(t => t.trim())
    : [];

  // Extract first paragraph after frontmatter as description
  const afterFrontmatter = content.substring(frontmatterMatch[0].length).trim();
  const firstParagraph = afterFrontmatter.split('\n\n')[0];
  const description = firstParagraph.replace(/^#\s+.+\n\n/, '').trim();

  return { title, tags, description };
}

/**
 * Load mental model metadata from filesystem
 */
function loadMentalModels(tagFilter?: string): MentalModelMetadata[] {
  // Path to mental models directory
  const modelsDir = path.join(process.cwd(), 'quick-reference', 'mental-models');
  
  if (!fs.existsSync(modelsDir)) {
    return [];
  }

  const files = fs.readdirSync(modelsDir)
    .filter(f => f.endsWith('.md') && f !== 'README.md');

  const models: MentalModelMetadata[] = [];

  for (const file of files) {
    const filePath = path.join(modelsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { title, tags, description } = parseFrontmatter(content);
    const name = file.replace('.md', '');

    // Apply tag filter if provided
    if (tagFilter && !tags.includes(tagFilter)) {
      continue;
    }

    models.push({
      name,
      title,
      description,
      tags,
    });
  }

  // Sort by name
  return models.sort((a, b) => a.name.localeCompare(b.name));
}

export async function handleListMentalModels(
  args: CognitionRequest,
  session: SessionState
): Promise<HandlerResult> {
  const tagFilter = args.content?.tag as string | undefined;
  const models = loadMentalModels(tagFilter);

  const response = {
    status: 'info',
    models,
    count: models.length,
    filter: tagFilter || null,
    sessionContext: {
      sessionId: session.id,
      entryCount: 0,
      totalEntries: session.getTotalCount(),
      sessionDuration: session.getDuration(),
      continuation: null,
    },
  };

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(response),
    }],
  };
}
