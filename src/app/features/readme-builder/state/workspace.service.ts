import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Supabase } from '../../../core/db/supabase';

export interface ReadmeBlock {
  id: string;
  name: string;
  markdown: string;
  isCustom?: boolean;
}

const DEFAULT_BLOCKS: ReadmeBlock[] = [
  {
    id: 'header',
    name: 'Projekt-Titel & Header',
    markdown:
      '# Mein Großartiges Projekt\n\nEine kurze Beschreibung, was dieses Projekt so besonders macht.',
  },
  { id: 'install', name: 'Installation', markdown: '## Installation\n\n```bash\nnpm install\n```' },
  { id: 'features', name: 'Features', markdown: '## Features\n\n- Feature 1\n- Feature 2' },
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
  private supabase = inject(Supabase);
  availableBlocks = signal<ReadmeBlock[]>(DEFAULT_BLOCKS);
  selectedBlocks = signal<ReadmeBlock[]>([]);
  activeBlockId = signal<string | null>(null);

  constructor() {
    effect(
      () => {
        const session = this.supabase.session();

        if (!session) {
          this.availableBlocks.set([...DEFAULT_BLOCKS]);
          this.selectedBlocks.set([]);
        } else {
          this.loadCustomBlocksFromCloud(session.user.id);
        }
      },
      { allowSignalWrites: true },
    );
  }

  private async loadCustomBlocksFromCloud(userId: string) {
    const { data, error } = await this.supabase.client
      .from('custom_blocks')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Fehler beim Laden der Bausteine:', error);
      return;
    }

    if (data) {
      const cloudBlocks: ReadmeBlock[] = data.map((row) => ({
        id: row.id,
        name: row.name,
        markdown: row.markdown,
        isCustom: true,
      }));

      this.availableBlocks.set([...DEFAULT_BLOCKS, ...cloudBlocks]);
    }
  }

  async updateBlockMarkdown(id: string, newMarkdown: string) {
    const updateFn = (blocks: ReadmeBlock[]) =>
      blocks.map((b) => (b.id === id ? { ...b, markdown: newMarkdown } : b));

    this.selectedBlocks.update(updateFn);

    if (this.supabase.session() && !id.startsWith('custom-')) {
      await this.supabase.client
        .from('custom_blocks')
        .update({ markdown: newMarkdown })
        .eq('id', id);
    }
  }

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

  async addCustomBlock() {
    const session = this.supabase.session();
    const newName = 'Neuer Baustein';
    const newMarkdown = '## Neuer Abschnitt\n\nSchreibe hier deinen Text...';

    if (!session) {
      const localBlock: ReadmeBlock = {
        id: `custom-${Date.now()}`,
        name: newName,
        markdown: newMarkdown,
        isCustom: true,
      };
      this.availableBlocks.update((blocks) => [...blocks, localBlock]);
      return;
    }

    const { data, error } = await this.supabase.client
      .from('custom_blocks')
      .insert({
        user_id: session.user.id,
        name: newName,
        markdown: newMarkdown,
      })
      .select()
      .single();

    if (error) {
      console.error('Fehler beim Speichern in Supabase:', error);
      return;
    }

    if (data) {
      const cloudBlock: ReadmeBlock = {
        id: data.id,
        name: data.name,
        markdown: data.markdown,
        isCustom: true,
      };
      this.availableBlocks.update((blocks) => [...blocks, cloudBlock]);
    }
  }
  async updateBlockName(id: string, newName: string) {
    const updateFn = (blocks: ReadmeBlock[]) =>
      blocks.map((b) => (b.id === id ? { ...b, name: newName } : b));

    this.availableBlocks.update(updateFn);
    this.selectedBlocks.update(updateFn);

    if (this.supabase.session() && !id.startsWith('custom-')) {
      await this.supabase.client.from('custom_blocks').update({ name: newName }).eq('id', id);
    }
  }

  async removeBlock(id: string) {
    const block = this.selectedBlocks().find((b) => b.id === id);
    if (!block) return;

    this.selectedBlocks.update((blocks) => blocks.filter((b) => b.id !== id));

    if (block.isCustom) {
      this.availableBlocks.update((blocks) => blocks.filter((b) => b.id !== id));
      if (this.supabase.session() && !id.startsWith('custom-')) {
        await this.supabase.client.from('custom_blocks').delete().eq('id', id);
      }
    } else {
      this.availableBlocks.update((prev) => [...prev, block]);
    }
  }

  setAvailableBlocks(blocks: ReadmeBlock[]) {
    this.availableBlocks.set(blocks);
  }

  setSelectedBlocks(blocks: ReadmeBlock[]) {
    this.selectedBlocks.set(blocks);
  }

  handleDrop(event: CdkDragDrop<ReadmeBlock[]>) {
    const prevId = event.previousContainer.id;
    const currId = event.container.id;

    const currentData = [...event.container.data];
    const previousData = prevId === currId ? currentData : [...event.previousContainer.data];

    if (prevId === currId) {
      moveItemInArray(currentData, event.previousIndex, event.currentIndex);
      this.updateListState(currId, currentData);
    } else {
      transferArrayItem(previousData, currentData, event.previousIndex, event.currentIndex);
      this.updateListState(prevId, previousData);
      this.updateListState(currId, currentData);
    }
  }

  private updateListState(containerId: string, data: ReadmeBlock[]) {
    if (containerId === 'available-list') this.availableBlocks.set(data);
    if (containerId === 'selected-list') this.selectedBlocks.set(data);
  }

  setScannedBlocks(scannedBlocks: ReadmeBlock[]) {
    const standardBlocksToRescue = this.selectedBlocks().filter((b) => !b.isCustom);

    if (standardBlocksToRescue.length > 0) {
      this.availableBlocks.update((prev) => [...prev, ...standardBlocksToRescue]);
    }

    this.selectedBlocks.set(scannedBlocks);
  }
}
