import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../shared/pagination/pagination.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { LocationResDto } from '../../models/location.model';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { locationservice } from '../../services/location.service';

@Component({
  selector: 'app-location',
  imports: [CommonModule, NavbarComponent, RouterModule, FormsModule, PaginationComponent, FooterComponent],
  templateUrl: './location.component.html',
  styleUrl: './location.component.css'
})
export class LocationComponent {
  fullpageloader: boolean = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 5;
  locationlist: LocationResDto[] = [];
  filters = {
    locationName: null,
  };

  constructor(
    private apiService: ApiService,
    private router: Router,
    private toast: ToastService,
    private locationData: locationservice,
  ) { }
  ngOnInit() {
    this.getlocationlist();
  }

  getlocationlist() {
    this.fullpageloader = true;
    const UserId = parseInt(localStorage.getItem("userId") || '0', 10);
    const Data = null;
    this.locationData.getLocationList(1, this.currentPage, this.pageSize, UserId, Data)
      .subscribe({
        next: (response) => {
          this.fullpageloader = false;
          if (response.data !== null) {
            this.locationlist = response.data;
            this.totalRecords = response.totalRecordCount;
          } else {
            this.locationlist = [];
            this.toast.warning('No location records found');
          }
        },
        error: (error) => {
          this.fullpageloader = false;
          this.toast.error('Failed to load location records');
        }
      });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getlocationlist();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.getlocationlist();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.getlocationlist();
  }
}
