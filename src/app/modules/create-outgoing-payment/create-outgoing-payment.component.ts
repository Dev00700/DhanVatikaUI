import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AddOutgoingPaymentDto } from '../../models/outgoingpayment.model';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { DropdownDataService } from '../../services/dropdown-select-data.service';
import { CommonReqDto, CommonResDto } from '../../models/common.model';

@Component({
  selector: 'app-create-outgoing-payment',
  imports: [
    CommonModule,
    NavbarComponent,
    FormsModule,
    RouterModule,
    FooterComponent
  ],
  templateUrl: './create-outgoing-payment.component.html',
  styleUrl: './create-outgoing-payment.component.css'
})
export class CreateOutgoingPaymentComponent {
  addoutgoingpayment: AddOutgoingPaymentDto = {} as AddOutgoingPaymentDto;
  loading = false;
  outgoingPaymentGuid: string | null = null;
  loadingPaymentModeList = false;
  paymentModeList: any[] = [];
  isActiveDisabled = true;
  loadingExpenseCatList = false;
  loadingPlotCatList = false;
  expenseCatList: any[] = [];
  plotCatList: any[] = [];
  selectedFile: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService,
    private dropdownData: DropdownDataService,
  ) { }

  ngOnInit() {
    this.addoutgoingpayment.approveStatus = 0;
    this.addoutgoingpayment.approveStatusF = 0;
    this.fetchPaymentModeList();
    this.fetchExpenseCatList();
    this.fetchoutgoingPaymentGuidFromRoute();

  }


  fetchPaymentModeList() {
    this.loadingPaymentModeList = true;
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

        this.paymentModeList = res.data;
        this.loadingPaymentModeList = false;
      },
      error: () => {
        this.loadingPaymentModeList = false;
      }
    });
  }

  fetchExpenseCatList() {
    this.loadingExpenseCatList = true;
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

        this.expenseCatList = res.data;
        this.loadingExpenseCatList = false;
      },
      error: () => {
        this.loadingExpenseCatList = false;
      }
    });
  }

  fetchPlotList() {
    this.loadingPlotCatList = true;
    const dropdownreqdto: CommonReqDto<any> = {
      PageSize: 1,
      PageRecordCount: 1000,
      UserId: parseInt(localStorage.getItem("userId") || '0', 10),
      Data: {
        "SearchDDL": "Plot"
      },
    };
    this.dropdownData.getDropdownDataByParam<any>('DropDown/GetDropdownListService', dropdownreqdto).subscribe({
      next: res => {

        this.plotCatList = res.data;
        this.loadingPlotCatList = false;
      },
      error: () => {
        this.loadingPlotCatList = false;
      }
    });
  }


  onSubmit() {



    if (!this.addoutgoingpayment.expenseTitle) {
      this.toast.error("Please enter a expense Type");
      return;
    }
    if (!this.addoutgoingpayment.paymentModeId) {
      this.toast.error("Please select a payment mode.");
      return;
    }
    if (!this.addoutgoingpayment.expenseCategoryId) {
      this.toast.error("Please select a expense category.");
      return;
    }

    if (!this.addoutgoingpayment.amount || this.addoutgoingpayment.amount <= 0) {
      this.toast.error("Please enter a amount which is greater than zero.");
      return;
    }

    if (!this.addoutgoingpayment.expenseDate) {
      this.toast.error("Please selcet a expense Date.");
      return;
    }


    if (this.addoutgoingpayment.expenseCategoryId == 12 && !this.addoutgoingpayment.plotId) {
      this.toast.error("Please select a plot.");
      return;
    }

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('images', this.selectedFile);

      this.apiService.post('IncommingPayment/UploadPaymentImages', formData).subscribe({
        next: (res: any) => {
          this.saveOutgoingPayment(res.data[0] || "");
        },
        error: (err) => {
          this.toast.error("Image upload failed");
          this.saveOutgoingPayment(""); // Image upload fail ho to blank bheje
        }
      });
    } else {
      // Agar image select nahi kiya, to pehle se image bheje ya blank
      this.saveOutgoingPayment(this.addoutgoingpayment.image || "");
    }
  }

  saveOutgoingPayment(imageName: string) {
    debugger;
    this.addoutgoingpayment.isActive = true;
    this.addoutgoingpayment.remarks = this.addoutgoingpayment.remarks || "";
    this.addoutgoingpayment.oPaymentGuid = this.outgoingPaymentGuid || null;
    this.addoutgoingpayment.image = imageName;
    this.addoutgoingpayment.referenceNo = this.addoutgoingpayment.referenceNo || "";
    this.addoutgoingpayment.partyName = this.addoutgoingpayment.partyName || "";
    this.addoutgoingpayment.createdBy = parseInt(localStorage.getItem("userId") || '0', 10);
    this.addoutgoingpayment.plotId = this.addoutgoingpayment.plotId || 0;

    const reqBody: CommonReqDto<AddOutgoingPaymentDto> = {
      UserId: parseInt(localStorage.getItem("userId") || '0', 10),
      PageSize: 1,
      PageRecordCount: 1000,
      Data: this.addoutgoingpayment
    };
    this.loading = true;
    const apiUrl = this.outgoingPaymentGuid
      ? 'OutgoingPayment/UpdateOutgoingPaymentService'
      : 'OutgoingPayment/AddOutgoingPaymentService';
    this.apiService.post<any>(apiUrl, reqBody).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.flag === 1) {
          this.toast.success(response.message);
          this.router.navigate(['/outgoing-payment']);
        } else {
          this.toast.warning(response.message);
        }
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to save outgoing payment details');
      }
    });
  }



  fetchoutgoingPaymentGuidFromRoute() {

    this.outgoingPaymentGuid = this.route.snapshot.paramMap.get('oPaymentGuid');
    if (this.outgoingPaymentGuid) {
      this.loading = true;
      this.isActiveDisabled = false;
      const getItemReqDto: CommonReqDto<any> = {
        PageSize: 1,
        PageRecordCount: 1000,
        UserId: parseInt(localStorage.getItem("userId") || '0', 10),
        Data: {
          "OPaymentGuid": this.outgoingPaymentGuid
        }
      }

      this.apiService.post<CommonResDto<AddOutgoingPaymentDto>>(`OutgoingPayment/GetOutgoingPaymentService`, getItemReqDto).subscribe({
        next: (response) => {

          this.addoutgoingpayment = response.data;
          if (this.addoutgoingpayment.expenseCategoryId == 12) {
            this.GetPlotList(this.addoutgoingpayment.expenseCategoryId);
          }

          if (this.addoutgoingpayment.expenseDate) {
            const dateObj = new Date(this.addoutgoingpayment.expenseDate);
            // Get YYYY-MM-DD string
            const yyyyMMdd = dateObj.toISOString().slice(0, 10);
            this.addoutgoingpayment.expenseDate = yyyyMMdd;
          }

          this.addoutgoingpayment.imageUrl = response.data.image != "" ? response.data.image : null; // ya jo bhi property me url aata hai
          //this.tryPatchItem();
          this.loading = false;
        },
        error: () => {
          this.toast.warning('Failed to load outgoing payment  details');
          this.loading = false;
        }
      });
    }
    else {
      this.addoutgoingpayment.isActive = true;
      this.isActiveDisabled = true;
    }
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.selectedFile = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {

        this.addoutgoingpayment.imageUrl = e.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);
      // ...baaki file upload logic
    }
  }

  GetPlotList(expenseCategoryId: number) {
    if (expenseCategoryId == 12) {
      this.fetchPlotList();
    }
    else {
      this.addoutgoingpayment.plotId = 0;
      this.plotCatList = [];
    }
  }
}
