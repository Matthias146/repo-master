import { ChangeDetectorRef, Component, computed, inject, signal } from '@angular/core';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { MarkdownModule } from 'ngx-markdown';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { toast } from '@spartan-ng/brain/sonner';

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

@Component({
  selector: 'app-workspace',
  imports: [
    CdkDropList,
    CdkDrag,
    CdkDropListGroup,
    MarkdownModule,
    ReactiveFormsModule,
    HlmButtonImports,
  ],
  templateUrl: './workspace.html',
  styleUrl: './workspace.scss',
})
export class Workspace {
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

  copied = signal<boolean>(false);

  markdownControl = new FormControl<string>('', { nonNullable: true });
  nameControl = new FormControl<string>('', { nonNullable: true });

  private cdr = inject(ChangeDetectorRef);

  constructor() {
    this.markdownControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((newValue) => {
      const id = this.activeBlockId();
      if (id) this.updateBlock(id, { markdown: newValue });
    });

    this.nameControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((newValue) => {
      const id = this.activeBlockId();
      if (id) this.updateBlock(id, { name: newValue.trim() || 'Unbenannt' });
    });
  }

  private updateBlock(id: string, changes: Partial<ReadmeBlock>) {
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

  removeBlock(blockId: string, event: Event) {
    event.stopPropagation();

    const blockToReturn = this.selectedBlocks().find((b) => b.id === blockId);
    if (!blockToReturn) return;

    this.availableBlocks.update((blocks) => [...blocks, blockToReturn]);
    this.selectedBlocks.update((blocks) => blocks.filter((b) => b.id !== blockId));

    if (this.activeBlockId() === blockId) {
      this.activeBlockId.set(null);
      this.markdownControl.setValue('', { emitEvent: false });
      this.nameControl.setValue('', { emitEvent: false });
    }
  }

  selectBlock(block: ReadmeBlock) {
    this.activeBlockId.set(block.id);
    this.markdownControl.setValue(block.markdown, { emitEvent: false });
    this.nameControl.setValue(block.name, { emitEvent: false });
  }

  drop(event: CdkDragDrop<ReadmeBlock[]>) {
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

  async copyToClipboard() {
    if (this.selectedBlocks().length === 0) return;

    try {
      await navigator.clipboard.writeText(this.generatedMarkdown());
      this.copied.set(true);
      this.cdr.detectChanges();

      toast.success('In die Zwischenablage kopiert', {
        description: 'Dein Markdown-Code ist nun bereit zum Einfügen.',
        position: 'bottom-right',
      });

      setTimeout(() => {
        this.copied.set(false);
        this.cdr.detectChanges();
      }, 2000);
    } catch (err) {
      console.log(err);

      toast.error('Fehler beim Kopieren', {
        description: 'Es gab ein Problem mit der Zwischenablage.',
        position: 'bottom-right',
      });
    }
  }
}
