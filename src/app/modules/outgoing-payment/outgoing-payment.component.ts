import { Component } from '@angular/core';
import { CommonReqDto, CommonResDto } from '../../models/common.model';
import { ApproveOutgoingPaymentReqDto, CancelOutgoingPaymentReqDto, OutgoingPaymentDto } from '../../models/outgoingpayment.model';
import { ApiService } from '../../services/api.service';
import { Router, RouterModule } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../shared/pagination/pagination.component';
import { outgoingpaymentservice } from '../../services/outgoing-payment.service';

@Component({
  selector: 'app-outgoing-payment',
  imports: [CommonModule, NavbarComponent, RouterModule, FormsModule, PaginationComponent, FooterComponent],
  templateUrl: './outgoing-payment.component.html',
  styleUrl: './outgoing-payment.component.css'
})
export class OutgoingPaymentComponent {
  fullpageloader: boolean = false;
  loading: boolean = false;
  outgoingpaymentlist: OutgoingPaymentDto[] = [];
  approveoutgoignpayment: ApproveOutgoingPaymentReqDto = {} as ApproveOutgoingPaymentReqDto;
  isappoved: boolean = false;
  approvaltitlechanged: string | "" = "";
  issuperadmin: boolean = localStorage.getItem("isSuperAdmin") == 'true' ? true : false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 5;
  canceloutgoingpayment: CancelOutgoingPaymentReqDto = {} as CancelOutgoingPaymentReqDto;
  constructor(
    private apiService: ApiService,
    private router: Router,
    private toast: ToastService,
    private outgoingpayment: outgoingpaymentservice) { }
  ngOnInit() {
    this.getOutgoingpaymentList();
  }



  openapprovalmodel(payGuid: string, approvedStatus?: number) {
    this.approveoutgoignpayment.OPaymentGuid = payGuid;
    this.approveoutgoignpayment.approveRemarks = '';
    if (approvedStatus && approvedStatus == 1) {
      this.approvaltitlechanged = "Admin Approval";
    }
    else {
      this.approvaltitlechanged = "Super Admin Approval";
    }
  }

  outgoingpaymentapprove() {
    if (!this.approveoutgoignpayment.OPaymentGuid || this.approveoutgoignpayment.OPaymentGuid.trim() === '') {
      this.toast.error('Invalid payment identifier');
      return;
    }

    if (!this.approveoutgoignpayment.approveStatus || this.approveoutgoignpayment.approveStatus <= 0) {
      this.toast.warning('Please select approve status');
      return;
    }

    if (!this.approveoutgoignpayment.approveRemarks || this.approveoutgoignpayment.approveRemarks.trim() === '') {
      this.toast.warning('Please enter remarks');
      return;
    }

    this.loading = true;

    const approvedreq: CommonReqDto<ApproveOutgoingPaymentReqDto> = {
      PageSize: 1,
      PageRecordCount: 1000,
      Data: {
        OPaymentGuid: this.approveoutgoignpayment.OPaymentGuid,
        approveStatus: this.approveoutgoignpayment.approveStatus,
        approveRemarks: this.approveoutgoignpayment.approveRemarks,
      },
      UserId: parseInt(localStorage.getItem("userId") || '0', 10),
    };


    this.apiService.post<CommonResDto<string>>('OutgoingPayment/ApproveOutPaymentService', approvedreq).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.data !== null) {
          this.toast.success('Outgoing payment status updated successfully');
          window.location.reload();
        } else {
          this.toast.error('Failed to update outgoing payment status');
        }
      },
      error: (error) => {
        this.loading = false;
        this.toast.error('Failed to update outgoing payment status');
      }
    });
  }



  getOutgoingpaymentList() {
    this.fullpageloader = true;
    const UserId = parseInt(localStorage.getItem("userId") || '0', 10)
    this.outgoingpayment.getoutgoingpayment(1, this.currentPage, this.pageSize, UserId, null).subscribe({
      next: (response) => {
        this.fullpageloader = false;
        if (response.data !== null) {
          this.outgoingpaymentlist = response.data;
          this.totalRecords = response.totalRecordCount;
        } else {
          this.outgoingpaymentlist = [];
          this.toast.warning('No outgoing payment records found');
        }
      },
      error: (error) => {
        this.fullpageloader = false;
        this.toast.error('Failed to load outgoing payment records');
      }
    });
  }

  openCancelModel(opaymentGuid: string) {
    this.canceloutgoingpayment.OPaymentGuid = opaymentGuid;
    this.canceloutgoingpayment.remarks = '';
  }
  CancelOrder() {
    if (!this.canceloutgoingpayment.remarks) {
      this.toast.error('Please enter a cancellation remark');
      return;
    }
    if (confirm('Are you sure you want to cancel this outgoing Payment?')) {
      this.loading = true;
      const cancelorderreq: CommonReqDto<CancelOutgoingPaymentReqDto> = {
        PageSize: 1,
        PageRecordCount: 10,
        Data: {
          OPaymentGuid: this.canceloutgoingpayment.OPaymentGuid,
          remarks: this.canceloutgoingpayment.remarks
        },
        UserId: parseInt(localStorage.getItem("userId") || '0', 10),
      };
      this.apiService.post<CommonResDto<any>>('OutgoingPayment/OutgoingPaymentCancelService', cancelorderreq).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.data) {
            this.toast.success('Outgoing Payment cancelled successfully');
            window.location.reload();
          } else {
            this.toast.error('Failed to cancel outgoing payment');
          }
        },
        error: (error) => {
          this.loading = false;
          this.toast.error('Failed to cancel outgoing payment');
        }
      });
    }
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getOutgoingpaymentList();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.getOutgoingpaymentList();
  }

  onFilterChange() {
    this.currentPage = 1; // reset to first page
    this.getOutgoingpaymentList();
  }
}
