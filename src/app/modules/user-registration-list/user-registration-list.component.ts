import { Component } from '@angular/core';
import { NavbarComponent } from "../shared/navbar/navbar.component";
import { FooterComponent } from "../shared/footer/footer.component";
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserDto, UserRegistrtionDto } from '../../models/user.model';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { CommonReqDto, CommonResDto } from '../../models/common.model';

@Component({
  selector: 'app-user-registration-list',
imports: [CommonModule,NavbarComponent,FooterComponent,RouterModule],
  templateUrl: './user-registration-list.component.html',
  styleUrl: './user-registration-list.component.css'
})
export class UserRegistrationListComponent {
  loading: boolean = false;
  userlist: UserRegistrtionDto[] = [];
   constructor( 
    private apiService: ApiService,
    private router: Router,
    private toast: ToastService){}

  ngOnInit() {
    this.loading = true;
    const reqData: CommonReqDto<number>= {
            PageSize: 1,
            PageRecordCount: 1000,
            Data: parseInt(localStorage.getItem("userId") || '0', 10),
            UserId: parseInt(localStorage.getItem("userId") || '0', 10),
    };
  
    this.apiService.post<CommonResDto<UserRegistrtionDto[]>>('User/GetUserListService', reqData).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.data!== null ) {
          this.userlist = response.data;
        } else {
          this.userlist = [];
          this.toast.warning('No user records found');
        }
      },
      error: (error) => {
        this.loading = false;
        this.toast.error('Failed to load user records');
      }
    }); 
  }
}
