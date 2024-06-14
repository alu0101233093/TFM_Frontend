import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email: string = ''
  password: string = ''

  constructor(private userService: UserService, private router: Router){}

  ngOnInit(){
    this.userService.getBasicUserData().then((user) => {
      if(user){
        this.router.navigate(['/home'])
      }
    })
  }

  public loginEmailAndPassword() {
    Swal.fire({
      title: 'Iniciando sesión...',
      text: 'Por favor espere.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    this.userService.logInEmailAndPassword(this.email, this.password)
      .then((message) => {
        Swal.fire({
          title: 'Sesión iniciada',
          icon: 'success',
          text: message,
          showCloseButton: true
        }).then(() => {
          window.location.reload()
        })
      }).catch((error) => {
        Swal.fire({
          title: 'Sesión no iniciada',
          text: error,
          icon: 'error',
          showCloseButton: true
        })
      });
  }
}
