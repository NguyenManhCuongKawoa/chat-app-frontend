import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-files-preview',
  templateUrl: './files-preview.component.html',
  styleUrls: ['./files-preview.component.css']
})
export class FilesPreviewComponent implements OnInit {

  @Input() 
  private filePreviews: String[] = []
  
  @Output() 
  private deleteFilePreview = new EventEmitter<String>()

  @Input() 
  private action: String


  constructor() { }

  ngOnInit() {
  }

  removeFile(filePreview: String) {
    if(this.action == 'delete') {
      this.deleteFilePreview.emit(filePreview)
    }
  }


}
