import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserDto, UserRegistrtionDto } from '../../models/user.model';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { CommonReqDto, CommonResDto } from '../../models/common.model';
import { DropdownDataService } from '../../services/dropdown-select-data.service';

@Component({
  selector: 'app-user-registration',
  imports: [CommonModule,NavbarComponent,RouterModule,FooterComponent,FormsModule],
  templateUrl: './user-registration.component.html',
  styleUrl: './user-registration.component.css'
})
export class UserRegistrationComponent {
  userregistration: UserRegistrtionDto = {} as UserRegistrtionDto;
  userGuid: string| null = null;
  loading = false;
  isActiveDisabled = true;
  loadingroleList=false;
  roleList:any[]=[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService, 
    private toast: ToastService ,
    private dropdownData: DropdownDataService,
  ){}

  ngOnInit() {
      this.fetchRoleList();

      this.userGuid = this.route.snapshot.paramMap.get('userGuid');
     if(this.userGuid){
      this.loading = true;
      this.isActiveDisabled = false;
      const getUserReqDto: CommonReqDto<UserDto> = {
        PageSize: 1,
        PageRecordCount: 1000,
        UserId: parseInt(localStorage.getItem("userId") || '0', 10),
        Data: {
          userGuid: this.userGuid
        }
      }

        this.apiService.post<CommonResDto<UserRegistrtionDto>>(`User/GetUserService`,getUserReqDto).subscribe({
        next: (response) => {
          this.userregistration = response.data ;
          this.loading = false;
        },
        error: () => {
          this.toast.warning('Failed to load user  details');
          this.loading = false;
        }
      });
     }
     else{
         this.userregistration.isActive = true;
         this.isActiveDisabled = true;
     }
  }

  onSubmit() {
  if ( !this.userregistration.userName  || !this.userregistration.password || !this.userregistration.mobileNo) {
    this.toast.warning('Please fill all required fields');
    return;
  }
  this.loading = true;
  if (this.userregistration.remarks == null) {
    this.userregistration.remarks = "";
  }
  const reqBody: CommonReqDto<UserRegistrtionDto> = {
    PageSize: 0,
    PageRecordCount: 0,
    Data: this.userregistration,
    UserId:  parseInt(localStorage.getItem("userId") || '0', 10),
  };

  if (this.userGuid) {
    // Update
    this.apiService.post<CommonResDto<UserRegistrtionDto>>('User/UpdateUserService', reqBody).subscribe({
      next: (response) => {
        if (response.flag === 1) {
          this.toast.success(response.message);
          this.router.navigate(['/user-registration-list']);
        } else {
          this.toast.warning(response.message);
          this.loading = false;
        }
      },
      error: () => {
        this.toast.warning('Update failed');
        this.loading = false;
      }
    });
  } else {
    // Create
    this.userregistration.createdBy= parseInt(localStorage.getItem("userId") || '0', 10); 
    this.userregistration.remarks= this.userregistration.remarks || "";
    this.apiService.post<CommonResDto<UserRegistrtionDto>>('User/AddUserService', reqBody).subscribe({
      next: (response) => {
        if (response.flag === 1) {
          this.toast.success(response.message);
          this.router.navigate(['/user-registration-list']);
        } else {
          this.toast.warning(response.message);
          this.loading = false;
        }
      },
      error: () => {
        this.toast.warning('Creation failed');
        this.loading = false;
      }
    });
  }
}

fetchRoleList(){
  this.loadingroleList = true;
  const dropdownreqdto: CommonReqDto<any> = {
    PageSize: 1,
    PageRecordCount: 1000,
    UserId: parseInt(localStorage.getItem("userId") || '0', 10),
    Data: {
      "SearchDDL":"Role"
    },
  };
  this.dropdownData.getDropdownDataByParam<any>('DropDown/GetRoleListService', dropdownreqdto).subscribe({
    next: res => {
      this.roleList = res.data;
      this.loadingroleList = false;
    },
    error: () => {
      this.loadingroleList = false;
    }
  });
}
}
