import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { GithubScannerService } from '../../services/github-scanner.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private scanner = inject(GithubScannerService);

  repoControl = new FormControl('');

  triggerScan() {
    const value = this.repoControl.value;
    if (value) {
      this.scanner.scanRepository(value);
      this.repoControl.reset();
    }
  }
}
