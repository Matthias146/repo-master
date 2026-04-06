import { Component } from '@angular/core';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-workspace',
  imports: [CdkDropList, CdkDrag, CdkDropListGroup],
  templateUrl: './workspace.html',
  styleUrl: './workspace.scss',
})
export class Workspace {
  availableBlocks = [
    'Projekt-Titel & Header',
    'Beschreibung',
    'Installation',
    'Features',
    'Nutzung (Usage)',
    'Technologien',
    'Lizenz',
  ];

  selectedBlocks: string[] = [];

  drop(event: CdkDragDrop<string[]>) {
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
