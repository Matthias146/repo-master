import { Routes } from '@angular/router';
import { Workspace } from './features/readme-builder/workspace/workspace';

export const routes: Routes = [
  {
    path: '',
    component: Workspace,
    title: 'RepoMaster | Workspace',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
