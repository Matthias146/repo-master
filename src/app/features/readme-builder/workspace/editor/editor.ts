import { Component, inject } from '@angular/core';
import { ReadmeBlock, WorkspaceService } from '../../state/workspace.service';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-editor',
  imports: [CdkDropList, CdkDrag, ReactiveFormsModule],
  templateUrl: './editor.html',
  styleUrl: './editor.scss',
})
export class Editor {
  public builder = inject(WorkspaceService);

  markdownControl = new FormControl<string>('', { nonNullable: true });
  nameControl = new FormControl<string>('', { nonNullable: true });

  constructor() {
    this.markdownControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((val) => {
      const id = this.builder.activeBlockId();
      if (id) this.builder.updateBlock(id, { markdown: val });
    });

    this.nameControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((val) => {
      const id = this.builder.activeBlockId();
      if (id) this.builder.updateBlock(id, { name: val.trim() || 'Unbenannt' });
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

  onNameChange(id: string, newName: string) {
    this.builder.updateBlockName(id, newName);
  }

  onContentChange(id: string, value: string) {
    this.builder.updateBlockMarkdown(id, value);
  }
}
