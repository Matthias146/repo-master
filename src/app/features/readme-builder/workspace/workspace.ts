import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
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
import { ReadmeBlock, WorkspaceService } from './workspace.service';

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
  public builder = inject(WorkspaceService);
  private cdr = inject(ChangeDetectorRef);

  copied = signal<boolean>(false);
  markdownControl = new FormControl<string>('', { nonNullable: true });
  nameControl = new FormControl<string>('', { nonNullable: true });

  constructor() {
    this.markdownControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((newValue) => {
      const id = this.builder.activeBlockId();
      if (id) this.builder.updateBlock(id, { markdown: newValue });
    });

    this.nameControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((newValue) => {
      const id = this.builder.activeBlockId();
      if (id) this.builder.updateBlock(id, { name: newValue.trim() || 'Unbenannt' });
    });
  }

  selectBlock(block: ReadmeBlock) {
    this.builder.activeBlockId.set(block.id);
    this.markdownControl.setValue(block.markdown, { emitEvent: false });
    this.nameControl.setValue(block.name, { emitEvent: false });
  }

  removeBlock(blockId: string, event: Event) {
    event.stopPropagation();
    this.builder.removeBlock(blockId);

    if (!this.builder.activeBlockId()) {
      this.markdownControl.setValue('', { emitEvent: false });
      this.nameControl.setValue('', { emitEvent: false });
    }
  }

  drop(event: CdkDragDrop<ReadmeBlock[]>) {
    const prevId = event.previousContainer.id;
    const currId = event.container.id;

    const currentData = [...event.container.data];
    const previousData = prevId === currId ? currentData : [...event.previousContainer.data];

    if (prevId === currId) {
      moveItemInArray(currentData, event.previousIndex, event.currentIndex);
      this.updateServiceList(currId, currentData);
    } else {
      transferArrayItem(previousData, currentData, event.previousIndex, event.currentIndex);
      this.updateServiceList(prevId, previousData);
      this.updateServiceList(currId, currentData);
    }
  }

  private updateServiceList(containerId: string, data: ReadmeBlock[]) {
    if (containerId === 'available-list') this.builder.setAvailableBlocks(data);
    if (containerId === 'selected-list') this.builder.setSelectedBlocks(data);
  }

  async copyToClipboard() {
    if (this.builder.selectedBlocks().length === 0) return;

    try {
      await navigator.clipboard.writeText(this.builder.generatedMarkdown());
      this.copied.set(true);
      this.cdr.detectChanges();

      toast.success('In die Zwischenablage kopiert', {
        description: 'Dein Markdown-Code ist nun bereit zum Einfügen.',
        position: 'top-center',
      });

      setTimeout(() => {
        this.copied.set(false);
        this.cdr.detectChanges();
      }, 2000);
    } catch (err) {
      console.log(err);

      toast.error('Fehler beim Kopieren', {
        description: 'Es gab ein Problem mit der Zwischenablage.',
      });
    }
  }
}
