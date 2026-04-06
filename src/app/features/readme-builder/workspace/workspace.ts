import { Component } from '@angular/core';
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

export interface ReadmeBlock {
  id: string;
  name: string;
  markdown: string;
}

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
  copied = false;
  availableBlocks: ReadmeBlock[] = [
    {
      id: 'header',
      name: 'Projekt-Titel & Header',
      markdown:
        '# Mein Großartiges Projekt\n\nEine kurze Beschreibung, was dieses Projekt so besonders macht.',
    },
    {
      id: 'install',
      name: 'Installation',
      markdown: '## Installation\n\n```bash\nnpm install\n```',
    },
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

  selectedBlocks: ReadmeBlock[] = [];
  activeBlock: ReadmeBlock | null = null;

  markdownControl = new FormControl<string>('', { nonNullable: true });

  constructor() {
    this.markdownControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((newValue) => {
      if (this.activeBlock) {
        this.activeBlock.markdown = newValue;
      }
    });
  }

  get generatedMarkdown(): string {
    if (this.selectedBlocks.length === 0) {
      return 'Vorschau generiert sich später dynamisch...';
    }
    return this.selectedBlocks.map((block) => block.markdown).join('\n\n');
  }

  drop(event: CdkDragDrop<ReadmeBlock[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  selectBlock(block: ReadmeBlock) {
    this.activeBlock = block;
    this.markdownControl.setValue(block.markdown, { emitEvent: false });
  }

  async copyToClipboard() {
    if (this.selectedBlocks.length === 0) return;

    try {
      await navigator.clipboard.writeText(this.generatedMarkdown);

      this.copied = true;

      setTimeout(() => (this.copied = false), 2000);
    } catch (err) {
      console.error('Fehler beim Kopieren:', err);
    }
  }
}
