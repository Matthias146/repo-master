import { TestBed } from '@angular/core/testing';

import { BuilderStore } from './builder.store';

describe('BuilderStore', () => {
  let service: BuilderStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuilderStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
