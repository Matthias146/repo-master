import { Component } from '@angular/core';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

export interface ReadmeBlock {
  id: string;
  name: string;
  markdown: string;
}

@Component({
  selector: 'app-workspace',
  imports: [CdkDropList, CdkDrag, CdkDropListGroup],
  templateUrl: './workspace.html',
  styleUrl: './workspace.scss',
})
export class Workspace {
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
}
