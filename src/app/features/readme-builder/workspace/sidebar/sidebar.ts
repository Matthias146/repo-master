import { Component, inject } from '@angular/core';
import { WorkspaceService } from '../../state/workspace.service';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-sidebar',
  imports: [CdkDropList, CdkDrag],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  public builder = inject(WorkspaceService);
}
