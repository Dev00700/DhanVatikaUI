import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginRequest, LoginResponse } from '../../models/login.model';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  error: string = '';
  loading: boolean = false;

  loginResponse: LoginResponse | null = null;

  constructor(
    private apiService:ApiService ,
    private router :Router,
    private toast: ToastrService,  
  ) {}

  ngonit(
  ){
     
  }
  onLogin(){
    localStorage.removeItem('authToken');
    this.error = '';
    if (!this.username || !this.password) {
     this.toast.warning('Enter username or password');
      return;
    }
    this.loading = true;
    const loginData: LoginRequest = {
      userName: this.username,
      password: this.password
    };
   this.apiService.post<LoginResponse>('auth/userlogin', loginData).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.token != null) {
          this.toast.success('Login Successfully');
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('mCompanyGuid', response.mCompanyGuid);
          localStorage.setItem('userId', response.userId.toString());
          localStorage.setItem('userName', response.userName);
          //this.userContext.setUser(response.userId, response.userName, response.mCompanyGuid);
         // this.fetchMenuDetails();
            this.router.navigate(['/dashboard']);
            return;
        } else {
          this.toast.warning(response.message || 'Login failed');
        }
      },
      error: (error) => {
        this.loading = false;
        this.toast.warning('Invalid username or password');
        console.error('Login error:', error);
      },
    });
  }
  
}
