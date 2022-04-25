import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FilePreview } from 'src/app/interfaces/common';

@Component({
  selector: 'app-images-preview',
  templateUrl: './images-preview.component.html',
  styleUrls: ['./images-preview.component.css']
})
export class ImagesPreviewComponent implements OnInit {


  @Input() 
  private imagePreviews: FilePreview[] = []
  
  @Output() 
  private deleteImagePreview = new EventEmitter<FilePreview>()

  @Input() 
  private action: String


  constructor() { }

  ngOnInit() {
  }

  removeImage(imagePreview: FilePreview) {
    if(this.action == 'delete') {
      this.deleteImagePreview.emit(imagePreview)
    }
  }

}
