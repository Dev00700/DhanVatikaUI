import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../shared/pagination/pagination.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { PlotBookingResDto } from '../../models/plotbooking.model';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { plotbookingservice } from '../../services/plotbooking.service';
import { DropdownDataService } from '../../services/dropdown-select-data.service';

@Component({
  selector: 'app-plot-booking',
  imports: [CommonModule, NavbarComponent, RouterModule, FormsModule, PaginationComponent, FooterComponent],
  templateUrl: './plot-booking.component.html',
  styleUrl: './plot-booking.component.css'
})
export class PlotBookingComponent {
  fullpageloader: boolean = false;
  plotbookinglist: PlotBookingResDto[] = [];
  totalRecords = 0;
  currentPage = 1;
  pageSize = 5;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private toast: ToastService,
    private plotbookingser: plotbookingservice,
  ) { }

  ngOnInit() {
    this.getPlotBookingList();
  }

  getPlotBookingList() {
    this.fullpageloader = true;
    const UserId = parseInt(localStorage.getItem("userId") || '0', 10);
    this.plotbookingser.getplotbooking(1, this.currentPage, this.pageSize, UserId, null)
      .subscribe({
        next: (response) => {
          this.plotbookinglist = response.data;
          this.totalRecords = response.totalRecordCount;
          this.fullpageloader = false;
        },
        error: (error) => {
          this.fullpageloader = false;
          this.toast.error('Error', 'Failed to fetch plot booking data.');
        }
      });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getPlotBookingList();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.getPlotBookingList();
  }

  openplotbooking(plotId: number, customerId: number) {
    const params: any = {};
    if (plotId != null) params.plotId = plotId;
    if (customerId != null) params.customerId = customerId;
    this.router.navigate(['/plot-booking-details'], { queryParams: params });
  }
}
