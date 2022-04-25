import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesPreviewComponent } from './files-preview.component';

describe('FilesPreviewComponent', () => {
  let component: FilesPreviewComponent;
  let fixture: ComponentFixture<FilesPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilesPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
