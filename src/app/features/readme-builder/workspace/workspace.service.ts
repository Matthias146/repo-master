import { computed, Injectable, signal } from '@angular/core';

export interface ReadmeBlock {
  id: string;
  name: string;
  markdown: string;
}

const INITIAL_BLOCKS: ReadmeBlock[] = [
  {
    id: 'header',
    name: 'Projekt-Titel & Header',
    markdown:
      '# Mein Großartiges Projekt\n\nEine kurze Beschreibung, was dieses Projekt so besonders macht.',
  },
  { id: 'install', name: 'Installation', markdown: '## Installation\n\n```bash\nnpm install\n```' },
  { id: 'features', name: 'Features', markdown: '## Features\n\n- ✨ Feature 1\n- 🚀 Feature 2' },
  {
    id: 'tech',
    name: 'Technologien',
    markdown: '## Technologien\n\n- Angular\n- Tailwind CSS\n- Spartan UI',
  },
  {
    id: 'license',
    name: 'Lizenz',
    markdown: '## Lizenz\n\nDieses Projekt ist lizenziert unter der MIT-Lizenz.',
  },
];

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  availableBlocks = signal<ReadmeBlock[]>(INITIAL_BLOCKS);
  selectedBlocks = signal<ReadmeBlock[]>([]);
  activeBlockId = signal<string | null>(null);

  activeBlock = computed(
    () => this.selectedBlocks().find((b) => b.id === this.activeBlockId()) || null,
  );

  generatedMarkdown = computed(() => {
    const blocks = this.selectedBlocks();
    if (blocks.length === 0) return 'Vorschau generiert sich später dynamisch...';
    return blocks.map((block) => block.markdown).join('\n\n');
  });

  updateBlock(id: string, changes: Partial<ReadmeBlock>) {
    this.selectedBlocks.update((blocks) =>
      blocks.map((b) => (b.id === id ? { ...b, ...changes } : b)),
    );
  }

  addCustomBlock() {
    const newBlock: ReadmeBlock = {
      id: `custom-${Date.now()}`,
      name: 'Neuer Baustein',
      markdown: '## Neuer Abschnitt\n\nSchreibe hier deinen Text...',
    };
    this.availableBlocks.update((blocks) => [...blocks, newBlock]);
  }

  removeBlock(blockId: string) {
    const blockToReturn = this.selectedBlocks().find((b) => b.id === blockId);
    if (!blockToReturn) return;

    this.availableBlocks.update((blocks) => [...blocks, blockToReturn]);
    this.selectedBlocks.update((blocks) => blocks.filter((b) => b.id !== blockId));

    if (this.activeBlockId() === blockId) {
      this.activeBlockId.set(null);
    }
  }

  setAvailableBlocks(blocks: ReadmeBlock[]) {
    this.availableBlocks.set(blocks);
  }

  setSelectedBlocks(blocks: ReadmeBlock[]) {
    this.selectedBlocks.set(blocks);
  }
}
