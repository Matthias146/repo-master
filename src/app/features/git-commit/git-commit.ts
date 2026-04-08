import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toast } from '@spartan-ng/brain/sonner';

export interface CommitFormValue {
  type: string;
  scope: string | null;
  subject: string;
  body: string | null;
  breaking: boolean;
}

@Component({
  selector: 'app-git-commit',
  imports: [ReactiveFormsModule],
  templateUrl: './git-commit.html',
  styleUrl: './git-commit.scss',
})
export class GitCommit {
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  commitTypes = [
    { value: 'feat', label: 'feat (Neues Feature)' },
    { value: 'fix', label: 'fix (Fehlerbehebung)' },
    { value: 'chore', label: 'chore (Wartung/Build-Prozess)' },
    { value: 'docs', label: 'docs (Dokumentation)' },
    { value: 'style', label: 'style (Formatierung/Code-Style)' },
    { value: 'refactor', label: 'refactor (Code-Refactoring)' },
    { value: 'test', label: 'test (Tests hinzugefügt/angepasst)' },
    { value: 'perf', label: 'perf (Performance-Optimierung)' },
  ];

  commitForm = this.fb.group({
    type: ['feat', Validators.required],
    scope: [''],
    subject: ['', [Validators.required, Validators.maxLength(72)]],
    body: [''],
    breaking: [false],
  });

  generatedCommit = signal<string>('');
  copied = signal<boolean>(false);

  constructor() {
    this.commitForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.updatePreview(this.commitForm.getRawValue() as CommitFormValue);
    });

    this.updatePreview(this.commitForm.getRawValue() as CommitFormValue);
  }

  private updatePreview(val: CommitFormValue) {
    let commit = `${val.type}`;

    if (val.scope) {
      const cleanScope = val.scope
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-');
      commit += `(${cleanScope})`;
    }

    if (val.breaking) {
      commit += '!';
    }

    commit += `: ${val.subject || '<commit message>'}`;

    if (val.body) {
      commit += `\n\n${val.body}`;
    }

    this.generatedCommit.set(commit);
  }

  async copyToClipboard() {
    if (this.commitForm.invalid) {
      toast.error('Unvollständiger Commit', {
        description: 'Bitte fülle mindestens den Subject aus (max. 72 Zeichen).',
      });
      return;
    }

    try {
      const fullCommand = `git commit -m "${this.generatedCommit()}"`;
      await navigator.clipboard.writeText(fullCommand);

      this.copied.set(true);
      this.cdr.detectChanges();

      toast.success('Commit Command kopiert!', { position: 'top-center' });

      setTimeout(() => {
        this.copied.set(false);
        this.cdr.detectChanges();
      }, 2000);
    } catch (err) {
      console.log(err);

      toast.error('Fehler beim Kopieren');
    }
  }

  get subjectLength(): number {
    return this.commitForm.controls.subject.value?.length || 0;
  }
}
