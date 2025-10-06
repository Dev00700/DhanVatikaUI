import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { CommonReqDto, CommonResDto } from '../../models/common.model';
import { FormsModule } from '@angular/forms';
import { incommingpaymentservice } from '../../services/incoming-payment.service';
import { PaginationComponent } from '../shared/pagination/pagination.component';
import { DropdownDataService } from '../../services/dropdown-select-data.service';
import { FilterComponent } from '../shared/filter/filter.component';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { numbertowords } from '../../services/number-to-words.service';
import { HttpClient } from '@angular/common/http';
import { AddOutgoingPaymentDto, ApproveOutgoingPaymentReqDto, CancelOutgoingPaymentReqDto, OutgoingPaymentDto, OutgoingPaymentReqDto } from '../../models/outgoingpayment.model';
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
  isAdmin: boolean = localStorage.getItem("isAdmin") == '0' ? false : true;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 5;
  yearlist: any | null;
  monthlist: any | null;
  expenseCategoryList: any | null;
  paymentModeList: any | null;
  canceloutgoingpayment: CancelOutgoingPaymentReqDto = {} as CancelOutgoingPaymentReqDto;
  incomingPaymentFilterReqDto: OutgoingPaymentReqDto = {} as OutgoingPaymentReqDto;



  // Filter configuration
  filters = {
    year: 0,
    month: 0,
    ExpenseTitle: null,
    paymentmode: null,
    ReferenceNo: null
  };

  constructor(
    private apiService: ApiService,
    private router: Router,
    private toast: ToastService,
    private outgoingpayment: outgoingpaymentservice,
    private dropdownData: DropdownDataService,
    private numbertowordsconverter: numbertowords,
    private http: HttpClient) { }


  ngOnInit() {
    this.getYearData();
    this.fetchExpenseCatgeoryList();
    this.getOutgoingpaymentList();
    this.fetchPaymentModeList();

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
      UserId: parseInt(localStorage.getItem("userId") || '0', 10)
    };

    this.apiService.post<CommonResDto<string>>('OutgoingPayment/ApproveOutPaymentService', approvedreq).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.data !== null) {
          this.toast.success('Outgoing payment status updated successfully');
          window.location.reload();
        } else {
          this.toast.error('Failed to update Outgoing payment status');
        }
      },
      error: (error) => {
        this.loading = false;
        this.toast.error('Failed to update Outgoing payment status');
      }
    });
  }

  getOutgoingpaymentList() {
    this.fullpageloader = true;
    const UserId = parseInt(localStorage.getItem("userId") || '0', 10);
    const Data = {
      "ExpenseTitle": this.filters.ExpenseTitle,
      "ReferenceNo": this.filters.ReferenceNo,
      "PaymentModeId": this.filters.paymentmode == 0 ? null : this.filters.paymentmode,
      "Year": this.filters.year == 0 ? null : this.filters.year,
      "Month": this.filters.month == 0 || this.filters.year == null || 0 ? null : this.filters.month
    };
    this.outgoingpayment.getoutgoingpayment(1, this.currentPage, this.pageSize, UserId, Data)
      .subscribe({
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
    this.currentPage = 1;
    this.getOutgoingpaymentList();
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
            this.toast.error('Failed to cancel Outgoing payment');
          }
        },
        error: (error) => {
          this.loading = false;
          this.toast.error('Failed to cancel Outgoing payment');
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
        "SearchDDL": "OutgoingYear"
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
        "SearchDDL": "OutgoingMonth",
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

  GetOutgoingdata() {
    this.getOutgoingpaymentList();
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

  fetchExpenseCatgeoryList() {
    this.fullpageloader = true;
    const dropdownreqdto: CommonReqDto<any> = {
      PageSize: 1,
      PageRecordCount: 1000,
      UserId: parseInt(localStorage.getItem("userId") || '0', 10),
      Data: {
        "SearchDDL": "ExpenseCategory"
      },
    };
    this.dropdownData.getDropdownDataByParam<any>('DropDown/GetDropdownListService', dropdownreqdto).subscribe({
      next: res => {
        console.log(res);
        this.expenseCategoryList = res.data;
        this.fullpageloader = false;
      },
      error: () => {
        this.fullpageloader = false;
      }
    });
  }





  selectedChips: { key: string; label: string }[] = [];

  applyFilters() {
    debugger;
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


    if (this.filters.ExpenseTitle) {
      this.selectedChips.push({
        key: 'ExpenseTitle',
        label: `Expense Title: ${this.filters.ExpenseTitle}`
      });
    }

    if (this.filters.ReferenceNo) {
      this.selectedChips.push({
        key: 'ReferenceNo',
        label: `Reference No: ${this.filters.ReferenceNo}`
      });
    }



    if (this.filters.paymentmode && this.filters.paymentmode !== 0) {
      const paymentMode = this.paymentModeList.find((m: { value: number; text: string }) => m.value == this.filters.paymentmode)?.text;
      this.selectedChips.push({
        key: 'paymentmode',
        label: `Payment Mode: ${paymentMode}`
      });
    }

    this.getOutgoingpaymentList();
  }

  removeChip(key: string) {
    (this.filters as any)[key] = key === 'year' || key === 'month' ? 0 : '';
    this.applyFilters();
  }



  generatePDF(opaymentGuid: string) {

    this.fullpageloader = true;
    if (opaymentGuid) {
      const getItemReqDto: CommonReqDto<any> = {
        PageSize: 1,
        PageRecordCount: 1000,
        UserId: parseInt(localStorage.getItem("userId") || '0', 10),
        Data: {
          "oPaymentGuid": opaymentGuid
        }
      }

      this.apiService.post<CommonResDto<AddOutgoingPaymentDto>>(`OutgoingPayment/GetOutgoingPaymentService`, getItemReqDto).subscribe({
        next: (response) => {
          this.fullpageloader = false;
          const dateObj = new Date(response.data.expenseDate);
          const day = String(dateObj.getDate()).padStart(2, '0');
          const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are 0-based
          const year = dateObj.getFullYear();

          // Format dd-MM-yyyy
          const _expensedate = `${day}-${month}-${year}`;


          const [integerPart, decimalPart] = response.data.amount.toFixed(2).split('.');
          const integerWords = this.numbertowordsconverter.convertNumberToWordsIndian(parseInt(integerPart)); // Convert integer part to words
          let decimalWords = '';

          // Convert decimal part to words if it exists and is not zero
          if (decimalPart && parseInt(decimalPart) > 0) {
            decimalWords = `and ${this.numbertowordsconverter.convertNumberToWordsIndian(parseInt(decimalPart))} paise`;
          }

          // Capitalize first letter and format the output
          const capitalizedWords = integerWords.charAt(0).toUpperCase() + integerWords.slice(1);
          const _amount = `${capitalizedWords} rupees ${decimalWords} only`.trim();


          const element = `
   <html lang="en"><head>
  <meta charset="UTF-8">
  <title>Outgoing Payment</title>
  <head>
  
</head>
<body onload="window.print(); window.onafterprint = window.close;"
 style="font-family: 'Courier New', monospace; font-size: 14px; margin: 20px;">

<div  style="width: 100%; border: 1px solid #000; padding: 3px; position: relative;">
  <div class="original-label" style="position: absolute;
      top: 8px;
      right: 12px;
      font-size: 12px;
      font-weight: bold;
      padding: 2px 6px;">Original for Recipient</div>
   <div style="text-align: center; font-weight: bold; font-size: 18px; margin-bottom: 5px;">Outgoing Payment</div>
<div  style="border-bottom: 2px solid #000; margin: 4px 0px 1px 0;"></div>

  <!-- Company + Consignee + Buyer -->
  <div   style="display: flex; border-bottom: 1px solid #000; text-align: center;">
    <div  style="flex: 1; padding: 5px; border-right: 1px solid #000;">

     <div  style="display: inline-block; gap: 10px; align-items: center; margin-bottom: 6px;">
        <img src="assets/images/brand-logos/desktop-logo.jpeg" alt="Company Logo" style="height: 45px;"/>
        <div>
          <strong>Dhan Vatika Developers</strong>
        </div>
      </div>

       <div style=" font-size: 13px; line-height: 1.4;">
        Address Information Here<br>
        Contact: XXXXXXXXXX <br>
      </div>
    </div>
    
   
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-top: 5px;">
    <tbody> 

      <tr>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;"><strong>Expense Category</strong> </td>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;">${response.data.expenseCategoryName}</td>
      </tr>


    <tr>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;"><strong>Expense Title</strong> </td>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;">${response.data.expenseTitle}</td>
      </tr>

      <tr>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;"><strong>Payment Mode</strong> </td>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;">${response.data.paymentMode}</td>
      </tr>

     

          <tr>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;"><strong>Payment Date</strong> </td>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;">${_expensedate}</td>
      </tr>

        <tr>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;"><strong>Party Name</strong> </td>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;">${response.data.partyName ?? ""}</td>
      </tr>
     

     
      <tr>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;"><strong>Amount</strong> </td>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;text-align:right">${response.data.amount ?? 0}/-</td>
      </tr>
     
    </tr>
  </tbody></table>

   

  <p><strong>Amount in words:</strong> ${_amount}</p>

  <div style="text-align: right; margin-top: 50px;">
    for Dhan Vatika Developers<br><br>
    Authorised Signatory
  </div>

  <p style="text-align: center;font-size: 12px; ">This is a Computer Generated </p>
</div>
</body></html>
  `;
          if (!element) return;

          const opt = {
            margin: 0,
            filename: `Outgoing_Payment_${new Date().getTime()}.pdf`,
            image: { type: "jpeg" as "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { format: 'a4', orientation: "portrait" as "portrait" }
          };


          setTimeout(() => {
            html2pdf().from(element).set(opt).save();
          }, 300);
          this.fullpageloader = false;
        },
        error: () => {
          this.toast.warning('Failed to load incoming payment  details');
          this.fullpageloader = false;
        }
      });
    }
    else {
    }
  }

  downloadImage(imageUrl: string) {
    console.log("Downloading: ", imageUrl);

    const fileName = imageUrl.split('/').pop() || 'downloaded-file.png';

    this.http.get(imageUrl, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        console.log("Blob received:", blob);

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error("Download error:", err);
      }
    });
  }
}

