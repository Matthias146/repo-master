import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { GithubScannerService } from '../../services/github-scanner.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Supabase } from '../../db/supabase';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private scanner = inject(GithubScannerService);
  public supabase = inject(Supabase);

  repoControl = new FormControl('');
  isScanning = signal<boolean>(false);

  async triggerScan() {
    const value = this.repoControl.value;
    if (value) {
      this.isScanning.set(true);
      await this.scanner.scanRepository(value);
      this.repoControl.reset();
      this.isScanning.set(false);
    }
  }

  async login() {
    await this.supabase.signInWithGithub();
  }

  async logout() {
    await this.supabase.signOut();
  }
}
