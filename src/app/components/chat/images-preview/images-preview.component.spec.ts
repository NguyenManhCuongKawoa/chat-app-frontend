import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagesPreviewComponent } from './images-preview.component';

describe('ImagesPreviewComponent', () => {
  let component: ImagesPreviewComponent;
  let fixture: ComponentFixture<ImagesPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImagesPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImagesPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
