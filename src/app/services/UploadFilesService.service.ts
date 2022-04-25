import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})

export class UploadFilesService {
  api = "http://localhost:8080";
  constructor(private http: HttpClient) {}

  uploadFile(files: File[]) {
    let formData = new FormData();
    console.log(files);
    files.map(file => {
        formData.append('files', file);
    })
    let headers = new HttpHeaders();
    headers.set('Content-Type', 'multipart/form-data');
    // @ts-ignore
    return this.http.post(this.api+'/messages/upload-file', formData, { headers: headers });
  }

//   getFileFromServer(fileRequestModel: FileRequestModel) {
//     const param = new HttpParams().set('id', fileRequestModel.id).set('type',fileRequestModel.type);
//     return this.http.get(this.api+'/file/find-all', {params: param});
//   }

  requestDownload(url: string): any {
    return this.http.get(url, {responseType: 'blob'});
  }

}
