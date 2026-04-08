import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GitCommit } from './git-commit';

describe('GitCommit', () => {
  let component: GitCommit;
  let fixture: ComponentFixture<GitCommit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GitCommit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GitCommit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
