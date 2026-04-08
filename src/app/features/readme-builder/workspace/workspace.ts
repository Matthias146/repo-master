import { Component } from '@angular/core';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { Sidebar } from './sidebar/sidebar';
import { Editor } from './editor/editor';
import { Preview } from './preview/preview';

@Component({
  selector: 'app-workspace',
  imports: [CdkDropListGroup, Sidebar, Editor, Preview],
  templateUrl: './workspace.html',
  styleUrl: './workspace.scss',
})
export class Workspace {}
