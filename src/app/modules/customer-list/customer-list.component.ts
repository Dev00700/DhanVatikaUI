import { Component } from '@angular/core';
import { customerListResponseDto } from '../../models/customer.model';
import { ApiService } from '../../services/api.service';
import { Router, RouterModule } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { customerservice } from '../../services/customer.service';
import { DropdownDataService } from '../../services/dropdown-select-data.service';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../shared/pagination/pagination.component';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  selector: 'app-customer-list',
  imports: [CommonModule, NavbarComponent, RouterModule, FormsModule, PaginationComponent, FooterComponent],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.css'
})
export class CustomerListComponent {
  fullpageloader: boolean = false;
  loading: boolean = false;
  customerlist: customerListResponseDto[] = [];
  totalRecords = 0;
  currentPage = 1;
  pageSize = 5;
  filters = {
    name: "",
    emailId: "",
    mobile: "",
  };

  constructor(
    private apiService: ApiService,
    private router: Router,
    private toast: ToastService,
    private customerser: customerservice,
    private dropdownData: DropdownDataService,
  ) { }

  ngOnInit() {
    this.getcustomerlist();
  }

  getcustomerlist() {
    this.fullpageloader = true;
    const UserId = parseInt(localStorage.getItem("userId") || '0', 10);
    const Data = {
      "Name": this.filters.name,
      "Mobile": this.filters.mobile,
      "EmailId": this.filters.emailId,
    }
    this.customerser.getcustomerlist(1, this.currentPage, this.pageSize, UserId, Data)
      .subscribe({
        next: (response) => {
          this.fullpageloader = false;
          if (response.data !== null) {
            this.customerlist = response.data;
            this.totalRecords = response.totalRecordCount;
          } else {
            this.customerlist = [];
            this.toast.warning('No customer records found');
          }
        },
        error: (error) => {
          this.fullpageloader = false;
          this.toast.error('Failed to load customer records');
        }
      });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getcustomerlist();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.getcustomerlist();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.getcustomerlist();
  }

  selectedChips: { key: string; label: string }[] = [];

  applyFilters() {
    this.selectedChips = [];
    if (this.filters.name) {
      this.selectedChips.push({
        key: 'name',
        label: `Name: ${this.filters.name}`
      });
    }
    if (this.filters.mobile) {
      this.selectedChips.push({
        key: 'mobile',
        label: `Mobile: ${this.filters.mobile}`
      });
    }
    if (this.filters.emailId) {
      this.selectedChips.push({
        key: 'emailId',
        label: `EmailId: ${this.filters.emailId}`
      });
    }
    this.getcustomerlist();
  }

  removeChip(key: string) {
    this.applyFilters();
  }

  openIncomingPayment(plotId: number, customerId: number, customerName: string, plotName: string) {
    //const params: any = {};
    this.router.navigate(['/create-incoming-payment'], {
      state: { plotId, customerId }
    });
    // if (plotId != null) params.plotId = plotId;
    //if (customerId != null) params.customerId = customerId;
    localStorage.setItem('plotname', plotName || '');
    localStorage.setItem('customerName', customerName || '');
    // this.router.navigate(['/create-incoming-payment'], { queryParams: params });
  }

  openplotbooking(plotId: number, customerId: number) {
    const params: any = {};
    if (plotId != null) params.plotId = plotId;
    if (customerId != null) params.customerId = customerId;
    this.router.navigate(['/create-plot-booking'], { queryParams: params });
  }

  opencustomerinstallments(plotId: number, customerId: number) {
    const params: any = {};
    if (plotId != null) params.plotId = plotId;
    if (customerId != null) params.customerId = customerId;
    this.router.navigate(['/customer-installments'], { queryParams: params });
  }

}
