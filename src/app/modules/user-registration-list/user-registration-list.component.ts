import { Component } from '@angular/core';
import { NavbarComponent } from "../shared/navbar/navbar.component";
import { FooterComponent } from "../shared/footer/footer.component";
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserDto, UserRegistrtionDto } from '../../models/user.model';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { CommonReqDto, CommonResDto } from '../../models/common.model';
import { userregistrationlistservice } from '../../services/user-registration-list.service';
import { PaginationComponent } from "../shared/pagination/pagination.component";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-registration-list',
  imports: [CommonModule, NavbarComponent, RouterModule, FormsModule, PaginationComponent, FooterComponent],
  templateUrl: './user-registration-list.component.html',
  styleUrl: './user-registration-list.component.css'
})
export class UserRegistrationListComponent {
  fullpageloader: boolean = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 10;
  userlist: UserRegistrtionDto[] = [];

  // Filter configuration
  filters = {
    userCode: null,
    userName: null,
    email: null,
    mobileNo: null,
  };


  constructor(
    private userregservice: userregistrationlistservice,
    private router: Router,
    private toast: ToastService,
  ) { }

  ngOnInit() {
    this.getUserList();
  }
  getUserList() {
    this.fullpageloader = true;
    const UserId = parseInt(localStorage.getItem("userId") || '0', 10)

    const Data = {
      "UserCode": this.filters.userCode || '',
      "UserName": this.filters.userName || '',
      "Email": this.filters.email || '',
      "MobileNo": this.filters.mobileNo || '',
      "Password": '',

    };

    this.userregservice.getUserRegistrationList(1, this.currentPage, this.pageSize, UserId, Data)
      .subscribe({
        next: (response) => {
          this.fullpageloader = false;
          if (response.data !== null) {
            this.userlist = response.data;
            this.totalRecords = response.totalRecordCount;
          } else {
            this.userlist = [];
            this.toast.warning('No user records found');
          }
        },
        error: (error) => {
          this.fullpageloader = false;
          this.toast.error('Failed to load user records');
        }
      });
  }


  selectedChips: { key: string; label: string }[] = [];

  applyFilters() {
    this.selectedChips = [];




    if (this.filters.userCode) {
      this.selectedChips.push({
        key: 'userCode',
        label: `User Code: ${this.filters.userCode}`
      });
    }

    if (this.filters.userName) {
      this.selectedChips.push({
        key: 'userName',
        label: `User Name: ${this.filters.userName}`
      });
    }

    if (this.filters.email) {
      this.selectedChips.push({
        key: 'email',
        label: `Email: ${this.filters.email}`
      });
    }


    if (this.filters.mobileNo) {
      this.selectedChips.push({
        key: 'mobileNo',
        label: `Mobile No: ${this.filters.mobileNo}`
      });
    }

    this.getUserList();
  }

  removeChip(key: string) {
    this.filters[key as keyof typeof this.filters] = null;
    this.applyFilters();
  }



  onPageChange(page: number) {
    this.currentPage = page;
    this.getUserList();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.getUserList();
  }

  onFilterChange() {
    this.currentPage = 1; // reset to first page
    this.getUserList();
  }
}
