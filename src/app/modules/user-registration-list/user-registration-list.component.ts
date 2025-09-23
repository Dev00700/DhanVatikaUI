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

@Component({
  selector: 'app-user-registration-list',
  imports: [CommonModule, NavbarComponent, PaginationComponent, FooterComponent, RouterModule],
  templateUrl: './user-registration-list.component.html',
  styleUrl: './user-registration-list.component.css'
})
export class UserRegistrationListComponent {
  fullpageloader: boolean = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 10;
  userlist: UserRegistrtionDto[] = [];
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

    this.userregservice.getUserRegistrationList(1, this.currentPage, this.pageSize, UserId, null)
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
