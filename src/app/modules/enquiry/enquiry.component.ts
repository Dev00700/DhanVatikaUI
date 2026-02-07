import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../shared/pagination/pagination.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { ClosedEnquiryReqDto, EnquiryResponeDto } from '../../models/enquiry.model';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { enquiryservice } from '../../services/enquiry.service';
import { DropdownDataService } from '../../services/dropdown-select-data.service';
import { CommonReqDto, CommonResDto } from '../../models/common.model';
import { Toast } from "ngx-toastr";

@Component({
  selector: 'app-enquiry',
  imports: [CommonModule, NavbarComponent, RouterModule, FormsModule, PaginationComponent, FooterComponent],
  templateUrl: './enquiry.component.html',
  styleUrl: './enquiry.component.css'
})
export class EnquiryComponent {
  fullpageloader: boolean = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 10;
  enquiryslist: EnquiryResponeDto[] = [];
  closedEnqReqDto: ClosedEnquiryReqDto = {} as ClosedEnquiryReqDto;
  loading: boolean = false;
  filters = {
    plotName: "",
    plotCode: "",
    locationName: "",
    name: "",
    email: "",
    mobile: "",
    status: false,
    date: null
  };
  constructor(
    private apiService: ApiService,
    private router: Router,
    private toast: ToastService,
    private enquirydata: enquiryservice,
    private dropdownData: DropdownDataService
  ) { }
  ngOnInit() {
    this.getenquirylist();
  }

  getenquirylist() {
    this.fullpageloader = true;
    const UserId = parseInt(localStorage.getItem("userId") || '0', 10);
    const Data = {
      "PlotName": this.filters.plotName,
      "LocationName": this.filters.locationName,
      "PlotCode": this.filters.plotCode,
      "Name": this.filters.name,
      "Email": this.filters.email,
      "Mobile": this.filters.mobile,
      "Status": this.filters.status,
      "Date": this.filters.date
    };
    //const Data = null;
    this.enquirydata.getenquirylist(1, this.currentPage, this.pageSize, UserId, Data)
      .subscribe({
        next: (response) => {
          this.fullpageloader = false;
          if (response.data !== null) {
            this.enquiryslist = response.data;
            this.totalRecords = response.totalRecordCount;
          } else {
            this.enquiryslist = [];
            this.toast.warning('No enquiry records found');
          }
        },
        error: (error) => {
          this.fullpageloader = false;
          this.toast.error('Failed to load enquiry records');
        }
      });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getenquirylist();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.getenquirylist();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.getenquirylist();
  }


  selectedChips: { key: string; label: string }[] = [];
  applyFilters() {
    this.selectedChips = [];

    if (this.filters.plotName) {
      this.selectedChips.push({
        key: 'plotName',
        label: `Plot Name: ${this.filters.plotName}`
      });
    }

    if (this.filters.plotCode) {
      this.selectedChips.push({
        key: 'plotCode',
        label: `Plot Code: ${this.filters.plotCode}`
      });
    }

    if (this.filters.locationName) {
      this.selectedChips.push({
        key: 'locationName',
        label: `Location : ${this.filters.locationName}`
      });
    }
    if (this.filters.name) {
      this.selectedChips.push({
        key: 'name',
        label: `Name : ${this.filters.name}`
      });
    }

    if (this.filters.mobile) {
      this.selectedChips.push({
        key: 'mobile',
        label: `Mobile No : ${this.filters.mobile}`
      });
    }

    if (this.filters.email) {
      this.selectedChips.push({
        key: 'email',
        label: `Email : ${this.filters.email}`
      });
    }


    if (this.filters.date) {
      this.selectedChips.push({
        key: 'date',
        label: `Date : ${this.filters.date}`
      });
    }
    this.getenquirylist();
  }

  removeChip(key: string) {
    (this.filters as any)[key] = key === 'date' || key === 'date' ? null : null;
    this.applyFilters();
  }

  ClosedEnquiryModel(enquiryGuid: string) {
    this.closedEnqReqDto.enquiryGuid = enquiryGuid;
    this.closedEnqReqDto.remarks = '';
  }
  ClosedEnquiry() {
    if (!this.closedEnqReqDto.remarks) {
      this.toast.error('Please enter a reason for closing the enquiry');
      return;
    }
    if (confirm('Are you sure you want to close this enquiry?')) {
      this.loading = true;
      const cancelorderreq: CommonReqDto<ClosedEnquiryReqDto> = {
        PageSize: 1,
        PageRecordCount: 10,
        Data: {
          enquiryGuid: this.closedEnqReqDto.enquiryGuid,
          remarks: this.closedEnqReqDto.remarks
        },
        UserId: parseInt(localStorage.getItem("userId") || '0', 10),
      };
      this.apiService.post<CommonResDto<any>>('Enquiry/CloseEnquiryService', cancelorderreq).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.data) {
            this.toast.success('Enquiry Closed successfully');
            window.location.reload();
          } else {
            this.toast.error('Failed to close enquiry');
          }
        },
        error: (error) => {
          this.loading = false;
          this.toast.error('Failed to close enquiry');
        }
      });
    }
  }


  AddCustomer(enquiryId: number) {
    if (confirm('Are you sure you want to create the customer?')) {
      this.loading = true;
      const req: CommonReqDto<any> = {
        PageSize: 1,
        PageRecordCount: 10,
        Data: {
          "EnquiryId": enquiryId,
        },
        UserId: parseInt(localStorage.getItem("userId") || '0', 10),
      };
      this.apiService.post<CommonResDto<any>>('Customer/AddCustomerService', req).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.data) {
            this.toast.success('customer added successfully');
            window.location.reload();
          } else {
            this.toast.error('Failed to add customer');
          }
        },
        error: (error) => {
          this.loading = false;
          this.toast.error('Failed to add customer');
        }
      });
    }
  }

  // ConvertIntoCustomer(enquiryId: string) {
  //   if (!enquiryId) {
  //     return;
  //   }
  //   if (confirm('Are you sure you want to close enquiry?')) {
  //     this.loading = true;
  //     const customerreqdto: CommonReqDto<PlotImageDeleteDto> = {
  //       PageSize: 1,
  //       PageRecordCount: 10,
  //       Data: {
  //         enquiryId:enquiryId
  //       },
  //       UserId: parseInt(localStorage.getItem("userId") || '0', 10),
  //     };
  //     this.apiService.post<CommonResDto<any>>('Customer/AddCustomerService', customerreqdto).subscribe({
  //       next: (response) => {
  //         this.loading = false;
  //         if (response.data) {
  //           this.toast.success('customer saved successfully');
  //           window.location.reload();
  //         } else {
  //           this.toast.error('Failed to save customer');
  //         }
  //       },
  //       error: (error) => {
  //         this.loading = false;
  //         this.toast.error('Failed to save customer');
  //       }
  //     });
  //   }
  // }


}




