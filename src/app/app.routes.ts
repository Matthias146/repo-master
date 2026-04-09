import { Routes } from '@angular/router';
import { Workspace } from './features/readme-builder/workspace/workspace';
import { Shell } from './core/layout/shell/shell';
import { GitCommit } from './features/git-commit/git-commit';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', redirectTo: 'readme', pathMatch: 'full' },
      { path: 'readme', component: Workspace },
      { path: 'commits', component: GitCommit },
    ],
  },
  {
    path: 'impressum',
    loadComponent: () => import('./features/legal/impressum/impressum').then((m) => m.Impressum),
  },
  {
    path: 'datenschutz',
    loadComponent: () =>
      import('./features/legal/datenschutz/datenschutz').then((m) => m.Datenschutz),
  },
];
