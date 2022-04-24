import { Component, Input, OnInit } from '@angular/core';
import { ImagePreview } from 'src/app/interfaces/common';

@Component({
  selector: 'app-images-preview',
  templateUrl: './images-preview.component.html',
  styleUrls: ['./images-preview.component.css']
})
export class ImagesPreviewComponent implements OnInit {


  @Input() 
  private imagePreviews: ImagePreview[] = []
  

  constructor() { }

  ngOnInit() {
  }

  removeImage(imagePreview: ImagePreview) {
    this.imagePreviews = this.imagePreviews.filter(i => i.id !== imagePreview.id)
  }

}
