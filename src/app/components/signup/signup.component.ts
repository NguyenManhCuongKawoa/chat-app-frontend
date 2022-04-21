import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {saveUser} from '../../utils/ApiUtil'

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  username!: string;
  imageUrl!: string;

  constructor(private router: Router) {
    this.router = router;
  }

  ngOnInit() {
  }

  checkVal(){
    saveUser({username: this.username, imageUrl: this.imageUrl})
      .then(json => {
        console.log(json)
        this.router.navigate(['/login'])
      })
      .catch(err => console.log(err.message))
     
  }
}
