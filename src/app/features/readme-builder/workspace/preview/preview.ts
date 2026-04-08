import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { WorkspaceService } from '../../state/workspace.service';
import { toast } from '@spartan-ng/brain/sonner';
import { MarkdownModule } from 'ngx-markdown';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-preview',
  imports: [MarkdownModule, HlmButtonImports],
  templateUrl: './preview.html',
  styleUrl: './preview.scss',
})
export class Preview {
  public builder = inject(WorkspaceService);
  private cdr = inject(ChangeDetectorRef);
  copied = signal<boolean>(false);

  async copyToClipboard() {
    if (this.builder.selectedBlocks().length === 0) return;
    try {
      await navigator.clipboard.writeText(this.builder.generatedMarkdown());
      this.copied.set(true);
      this.cdr.detectChanges();
      toast.success('In die Zwischenablage kopiert', { position: 'bottom-right' });
      setTimeout(() => {
        this.copied.set(false);
        this.cdr.detectChanges();
      }, 2000);
    } catch {
      toast.error('Fehler beim Kopieren');
    }
  }
}
