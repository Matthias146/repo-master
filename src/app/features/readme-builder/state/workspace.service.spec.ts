import { TestBed } from '@angular/core/testing';

import { WorkspaceService } from './workspace.service';

describe('WorkspaceService', () => {
  let service: WorkspaceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkspaceService);
  });

  it('should be created and load initial data', () => {
    expect(service).toBeTruthy();
    expect(service.availableBlocks().length).toBeGreaterThan(0);
    expect(service.selectedBlocks().length).toBe(0);
    expect(service.activeBlockId()).toBeNull();
  });

  it('should provide a new custom block', () => {
    const initialCount = service.availableBlocks().length;

    service.addCustomBlock();

    const available = service.availableBlocks();
    expect(available.length).toBe(initialCount + 1);

    const newBlock = available[available.length - 1];
    expect(newBlock.id).toContain('custom-');
    expect(newBlock.name).toBe('Neuer Baustein');
  });

  it('should generate markdown correctly when blocks are selected', () => {
    const mockBlocks = [
      { id: '1', name: 'B1', markdown: '# Title' },
      { id: '2', name: 'B2', markdown: 'Text' },
    ];
    service.setSelectedBlocks(mockBlocks);

    expect(service.generatedMarkdown()).toBe('# Title\n\nText');
  });

  it('should update a selected block (Immutability Check)', () => {
    const mockBlocks = [{ id: '1', name: 'Old', markdown: 'Old' }];
    service.setSelectedBlocks(mockBlocks);

    service.updateBlock('1', { name: 'New Name', markdown: 'New  Text' });

    const updatedBlocks = service.selectedBlocks();
    expect(updatedBlocks[0].name).toBe('New Name');
    expect(updatedBlocks[0].markdown).toBe('New  Text');

    expect(updatedBlocks).not.toBe(mockBlocks);
  });

  it('should remove a block from the editor and return it to the available blocks', () => {
    const blockToMove = { id: 'test-1', name: 'Test', markdown: '...' };

    service.setSelectedBlocks([blockToMove]);
    service.setAvailableBlocks([]);
    service.activeBlockId.set('test-1');

    service.removeBlock('test-1');

    expect(service.selectedBlocks().length).toBe(0);
    expect(service.availableBlocks()[0].id).toBe('test-1');

    expect(service.activeBlockId()).toBeNull();
  });
});
