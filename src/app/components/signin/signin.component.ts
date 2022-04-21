import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {login} from '../../utils/ApiUtil'

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {

  username!: string;

  constructor(private router: Router) {
    this.router = router;
  }

  ngOnInit() {
  }

  login() {
    login(this.username)
      .then(json => {
        console.log(json)
        this.router.navigate(['/chat/' + json.id]);
      })
      .catch(err => console.log(err.message))
  }

}
