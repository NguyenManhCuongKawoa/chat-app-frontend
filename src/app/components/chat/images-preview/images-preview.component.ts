import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ImagePreview } from 'src/app/interfaces/common';

@Component({
  selector: 'app-images-preview',
  templateUrl: './images-preview.component.html',
  styleUrls: ['./images-preview.component.css']
})
export class ImagesPreviewComponent implements OnInit {


  @Input() 
  private imagePreviews: ImagePreview[] = []
  
  @Output() 
  private deleteImagePreview = new EventEmitter<ImagePreview>()


  constructor() { }

  ngOnInit() {
  }

  removeImage(imagePreview: ImagePreview) {
    this.deleteImagePreview.emit(imagePreview)
  }

}
