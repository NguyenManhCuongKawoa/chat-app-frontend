import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-images-preview',
  templateUrl: './images-preview.component.html',
  styleUrls: ['./images-preview.component.css']
})
export class ImagesPreviewComponent implements OnInit {


  @Input() imageUrl!: string 
  

  constructor() { }

  ngOnInit() {
  }

}
