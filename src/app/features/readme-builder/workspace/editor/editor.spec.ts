import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, Mock } from 'vitest';
import { Editor } from './editor';
import { signal, WritableSignal } from '@angular/core';
import { ReadmeBlock, WorkspaceService } from '../../state/workspace.service';

interface MockWorkspaceService {
  activeBlockId: WritableSignal<string | null>;
  selectedBlocks: WritableSignal<ReadmeBlock[]>;
  activeBlock: WritableSignal<ReadmeBlock | null>;
  updateBlock: Mock;
  removeBlock: Mock;
  handleDrop: Mock;
}

describe('Editor', () => {
  let component: Editor;
  let fixture: ComponentFixture<Editor>;
  let mockWorkspaceService: MockWorkspaceService;

  beforeEach(async () => {
    mockWorkspaceService = {
      activeBlockId: signal('1'),
      selectedBlocks: signal([{ id: '1', name: 'Test', markdown: '# Hello' }]),
      activeBlock: signal({ id: '1', name: 'Test', markdown: '# Hello' }),
      updateBlock: vi.fn(),
      removeBlock: vi.fn(),
      handleDrop: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Editor],
      providers: [{ provide: WorkspaceService, useValue: mockWorkspaceService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Editor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('The form should forward any changes to the service.', () => {
    component.nameControl.setValue('New Name');

    expect(mockWorkspaceService.updateBlock).toHaveBeenCalledWith('1', { name: 'New Name' });
  });

  it('should replace empty names with "Unbenannt"', () => {
    component.nameControl.setValue('   ');

    expect(mockWorkspaceService.updateBlock).toHaveBeenCalledWith('1', { name: 'Unbenannt' });
  });
});
