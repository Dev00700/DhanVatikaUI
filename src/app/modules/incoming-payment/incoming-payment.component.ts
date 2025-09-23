import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { Router, RouterModule } from '@angular/router';
import { AddIncomingPaymentDto, ApproveIncommingPaymentReqDto, CancelIncomingPaymentReqDto, IIncommingPaymentReqDto, IncomingPaymentDto } from '../../models/incomingpayment.model';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { CommonReqDto, CommonResDto } from '../../models/common.model';
import { FormsModule } from '@angular/forms';
import { incommingpaymentservice } from '../../services/incoming-payment.service';
import { PaginationComponent } from '../shared/pagination/pagination.component';
import { DropdownDataService } from '../../services/dropdown-select-data.service';
import { FilterComponent } from '../shared/filter/filter.component';

@Component({
  selector: 'app-incoming-payment',
  imports: [CommonModule, NavbarComponent, RouterModule, FormsModule, PaginationComponent, FooterComponent],
  templateUrl: './incoming-payment.component.html',
  styleUrl: './incoming-payment.component.css'
})
export class IncomingPaymentComponent {
  fullpageloader: boolean = false;
  loading: boolean = false;
  incomingpaymentlist: IncomingPaymentDto[] = [];
  approveincommingpayment: ApproveIncommingPaymentReqDto = {} as ApproveIncommingPaymentReqDto;
  isappoved: boolean = false;
  approvaltitlechanged: string | "" = "";
  issuperadmin: boolean = localStorage.getItem("isSuperAdmin") == 'true' ? true : false;
  isAdmin: boolean = localStorage.getItem("isAdmin") == '0' ? false : true;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 5;
  yearlist: any | null;
  monthlist: any | null;
  paymentSourceList: any | null;
  paymentModeList: any | null;
  cancelincommingpayment: CancelIncomingPaymentReqDto = {} as CancelIncomingPaymentReqDto;
  incomingPaymentFilterReqDto: IIncommingPaymentReqDto = {} as IIncommingPaymentReqDto;


  // Filter configuration
  filters = {
    year: 0,
    month: 0,
    paymentType: null,
    paymentsource: null,
    paymentmode: null
  };

  constructor(
    private apiService: ApiService,
    private router: Router,
    private toast: ToastService,
    private incominpaymentser: incommingpaymentservice,
    private dropdownData: DropdownDataService) { }


  ngOnInit() {
    this.getYearData();
    this.fetchPaymentSourceList();
    this.getIncommingpaymentList();
    this.fetchPaymentModeList();
    //    this.filterConfig.forEach(f => {
    //   if (f.type === 'select') {
    //     this.filters[f.key] = f.options[0].value; // default first option
    //   } else {
    //     this.filters[f.key] = '';
    //   }
    // });

  }

  openapprovalmodel(payGuid: string, approvedStatus?: number) {
    this.approveincommingpayment.iPaymentGuid = payGuid;
    this.approveincommingpayment.approveRemarks = '';
    if (approvedStatus && approvedStatus == 1) {
      this.approvaltitlechanged = "Admin Approval";
    }
    else {
      this.approvaltitlechanged = "Super Admin Approval";
    }
  }

  incommingpaymentapprove() {
    if (!this.approveincommingpayment.iPaymentGuid || this.approveincommingpayment.iPaymentGuid.trim() === '') {
      this.toast.error('Invalid payment identifier');
      return;
    }

    if (!this.approveincommingpayment.approveStatus || this.approveincommingpayment.approveStatus <= 0) {
      this.toast.warning('Please select approve status');
      return;
    }

    if (!this.approveincommingpayment.approveRemarks || this.approveincommingpayment.approveRemarks.trim() === '') {
      this.toast.warning('Please enter remarks');
      return;
    }

    this.loading = true;
    const approvedreq: CommonReqDto<ApproveIncommingPaymentReqDto> = {
      PageSize: 1,
      PageRecordCount: 1000,
      Data: {
        iPaymentGuid: this.approveincommingpayment.iPaymentGuid,
        approveStatus: this.approveincommingpayment.approveStatus,
        approveRemarks: this.approveincommingpayment.approveRemarks,
      },
      UserId: parseInt(localStorage.getItem("userId") || '0', 10)
    };

    this.apiService.post<CommonResDto<string>>('IncommingPayment/ApprovePaymentService', approvedreq).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.data !== null) {
          this.toast.success('Incoming payment status updated successfully');
          window.location.reload();
        } else {
          this.toast.error('Failed to update incoming payment status');
        }
      },
      error: (error) => {
        this.loading = false;
        this.toast.error('Failed to update incoming payment status');
      }
    });
  }

  getIncommingpaymentList() {
    this.fullpageloader = true;
    const UserId = parseInt(localStorage.getItem("userId") || '0', 10);
    const Data = {
      "PaymentType": this.filters.paymentType,
      "PaymentSource": this.filters.paymentsource == 0 ? null : this.filters.paymentsource,
      "PaymentModeId": this.filters.paymentmode == 0 ? null : this.filters.paymentmode,
      "PaymentDate": null,
      "Year": this.filters.year == 0 ? null : this.filters.year,
      "Month": this.filters.month == 0 || this.filters.year == null || 0 ? null : this.filters.month
    };
    this.incominpaymentser.getincomingpayment(1, this.currentPage, this.pageSize, UserId, Data)
      .subscribe({
        next: (response) => {
          this.fullpageloader = false;
          if (response.data !== null) {
            this.incomingpaymentlist = response.data;
            this.totalRecords = response.totalRecordCount;
          } else {
            this.incomingpaymentlist = [];
            this.toast.warning('No incoming payment records found');
          }
        },
        error: (error) => {
          this.fullpageloader = false;
          this.toast.error('Failed to load incoming payment records');
        }
      });
  }



  onPageChange(page: number) {
    this.currentPage = page;
    this.getIncommingpaymentList();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.getIncommingpaymentList();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.getIncommingpaymentList();
  }




  openCancelModel(opaymentGuid: string) {
    this.cancelincommingpayment.IPaymentGuid = opaymentGuid;
    this.cancelincommingpayment.remarks = '';
  }
  CancelOrder() {
    if (!this.cancelincommingpayment.remarks) {
      this.toast.error('Please enter a cancellation remark');
      return;
    }
    if (confirm('Are you sure you want to cancel this incoming Payment?')) {
      this.loading = true;
      const cancelorderreq: CommonReqDto<CancelIncomingPaymentReqDto> = {
        PageSize: 1,
        PageRecordCount: 10,
        Data: {
          IPaymentGuid: this.cancelincommingpayment.IPaymentGuid,
          remarks: this.cancelincommingpayment.remarks
        },
        UserId: parseInt(localStorage.getItem("userId") || '0', 10),
      };
      this.apiService.post<CommonResDto<any>>('IncommingPayment/IncommingPaymentCancelService', cancelorderreq).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.data) {
            this.toast.success('Incoming Payment cancelled successfully');
            window.location.reload();
          } else {
            this.toast.error('Failed to cancel incoming payment');
          }
        },
        error: (error) => {
          this.loading = false;
          this.toast.error('Failed to cancel incoming payment');
        }
      });
    }
  }

  getYearData() {
    this.fullpageloader = true;
    const dropdownreqdto: CommonReqDto<any> = {
      PageSize: 1,
      PageRecordCount: 1000,
      UserId: parseInt(localStorage.getItem("userId") || '0', 10),
      Data: {
        "SearchDDL": "IncommingYear"
      },
    };
    this.dropdownData.getDropdownDataByParam<any>('DropDown/GetDropdownListService', dropdownreqdto).subscribe({
      next: res => {
        this.yearlist = res.data;
        this.fullpageloader = false;
      },
      error: () => {
        this.fullpageloader = false;
      }
    });
  }

  GetMonthDataOnYearchange() {
    //  this.getIncommingpaymentList();
    const yearvalue = this.filters.year || 0;
    this.getMonthData(yearvalue);
  }

  getMonthData(yearvalue: number) {
    this.fullpageloader = true;
    const dropdownreqdto: CommonReqDto<any> = {
      PageSize: 1,
      PageRecordCount: 1000,
      UserId: parseInt(localStorage.getItem("userId") || '0', 10),
      Data: {
        "SearchDDL": "IncommingMonth",
        "ParentId": yearvalue
      },
    };
    this.dropdownData.getDropdownDataByParam<any>('DropDown/GetDropdownListService', dropdownreqdto).subscribe({
      next: res => {
        this.monthlist = res.data;
        this.fullpageloader = false;
      },
      error: () => {
        this.fullpageloader = false;
      }
    });
  }

  GetIncommingdata() {
    this.getIncommingpaymentList();
  }




  fetchPaymentModeList() {
    this.fullpageloader = true;
    const dropdownreqdto: CommonReqDto<any> = {
      PageSize: 1,
      PageRecordCount: 1000,
      UserId: parseInt(localStorage.getItem("userId") || '0', 10),
      Data: {
        "SearchDDL": "PaymentMode"
      },
    };
    this.dropdownData.getDropdownDataByParam<any>('DropDown/GetDropdownListService', dropdownreqdto).subscribe({
      next: res => {
        debugger;
        this.paymentModeList = res.data;
        this.fullpageloader = false;
      },
      error: () => {
        this.fullpageloader = false;
      }
    });
  }

  fetchPaymentSourceList() {
    this.fullpageloader = true;
    const dropdownreqdto: CommonReqDto<any> = {
      PageSize: 1,
      PageRecordCount: 1000,
      UserId: parseInt(localStorage.getItem("userId") || '0', 10),
      Data: {
        "SearchDDL": "PaymentSource"
      },
    };
    this.dropdownData.getDropdownDataByParam<any>('DropDown/GetDropdownListService', dropdownreqdto).subscribe({
      next: res => {
        console.log(res);
        this.paymentSourceList = res.data;
        this.fullpageloader = false;
      },
      error: () => {
        this.fullpageloader = false;
      }
    });
  }





  selectedChips: { key: string; label: string }[] = [];

  applyFilters() {
    this.selectedChips = [];

    if (this.filters.year && this.filters.year !== 0) {
      this.selectedChips.push({
        key: 'year',
        label: `Year: ${this.filters.year}`
      });
    }

    if (this.filters.month && this.filters.month !== 0) {
      const month = this.monthlist.find((m: { value: number; text: string }) => m.value == this.filters.month)?.text;
      this.selectedChips.push({
        key: 'month',
        label: `Month: ${month}`
      });
    }


    if (this.filters.paymentType) {
      this.selectedChips.push({
        key: 'paymentType',
        label: `Payment Type: ${this.filters.paymentType}`
      });
    }

    if (this.filters.paymentsource && this.filters.paymentsource !== 0) {
      const paymentsource = this.paymentSourceList.find((m: { value: number; text: string }) => m.value == this.filters.paymentsource)?.text;
      this.selectedChips.push({
        key: 'paymentsource',
        label: `Payment Source: ${paymentsource}`
      });
    }

    if (this.filters.paymentmode && this.filters.paymentmode !== 0) {
      const paymentMode = this.paymentModeList.find((m: { value: number; text: string }) => m.value == this.filters.paymentmode)?.text;
      this.selectedChips.push({
        key: 'paymentmode',
        label: `Payment Mode: ${paymentMode}`
      });
    }

    this.getIncommingpaymentList();
  }

  removeChip(key: string) {
    (this.filters as any)[key] = key === 'year' || key === 'month' ? 0 : '';
    this.applyFilters();
  }

}
