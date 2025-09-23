import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../shared/footer/footer.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AddIncomingPaymentDto } from '../../models/incomingpayment.model';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { CommonReqDto, CommonResDto } from '../../models/common.model';
import { DropdownDataService } from '../../services/dropdown-select-data.service';

@Component({
  selector: 'app-create-incoming-payment',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FormsModule,
    RouterModule,
    FooterComponent
  ],
  templateUrl: './create-incoming-payment.component.html',
  styleUrl: './create-incoming-payment.component.css'
})
export class CreateIncomingPaymentComponent {
  addincomingpayment: AddIncomingPaymentDto = {} as AddIncomingPaymentDto;
  loading = false;
  incomingpaymentGuid: string | null = null;
  loadingPaymentModeList = false;
  paymentModeList: any[] = [];
  loadingPaymentSouceList = false;
  paymentSourceList: any[] = [];
  isActiveDisabled = true;

  selectedFile: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService,
    private dropdownData: DropdownDataService,
  ) { }

  ngOnInit() {
    this.fetchPaymentModeList();
    this.fetchPaymentSourceList();
    this.fetchincomingPaymentGuidFromRoute();

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
        debugger;
        this.paymentModeList = res.data;
        this.loadingPaymentModeList = false;
      },
      error: () => {
        this.loadingPaymentModeList = false;
      }
    });
  }

  fetchPaymentSourceList() {
    this.loadingPaymentSouceList = true;
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
        this.loadingPaymentSouceList = false;
      },
      error: () => {
        this.loadingPaymentSouceList = false;
      }
    });
  }



  fetchincomingPaymentGuidFromRoute() {

    this.incomingpaymentGuid = this.route.snapshot.paramMap.get('iPaymentGuid');
    if (this.incomingpaymentGuid) {
      this.loading = true;
      this.isActiveDisabled = false;
      const getItemReqDto: CommonReqDto<any> = {
        PageSize: 1,
        PageRecordCount: 1000,
        UserId: parseInt(localStorage.getItem("userId") || '0', 10),
        Data: {
          "iPaymentGuid": this.incomingpaymentGuid
        }
      }

      this.apiService.post<CommonResDto<AddIncomingPaymentDto>>(`IncommingPayment/GetPaymentService`, getItemReqDto).subscribe({
        next: (response) => {
          this.addincomingpayment = response.data;
          if (this.addincomingpayment.paymentDate) {
            const dateObj = new Date(this.addincomingpayment.paymentDate);
            const yyyyMMdd = dateObj.toISOString().slice(0, 10);
            this.addincomingpayment.paymentDate = yyyyMMdd;
          }
          this.addincomingpayment.imageUrl = response.data.image != "" ? response.data.image : null;
          this.loading = false;
        },
        error: () => {
          this.toast.warning('Failed to load incoming payment  details');
          this.loading = false;
        }
      });
    }
    else {
      this.addincomingpayment.isActive = true;
      this.isActiveDisabled = true;
    }
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.selectedFile = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {

        this.addincomingpayment.imageUrl = e.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);
      // ...baaki file upload logic
    }
  }

  onSubmit() {
    if (!this.addincomingpayment.paymentType) {
      this.toast.error("Please enter a payment Type");
      return;
    }
    if (!this.addincomingpayment.paymentModeId) {
      this.toast.error("Please select a payment mode.");
      return;
    }
    if (!this.addincomingpayment.paymentSource) {
      this.toast.error("Please select a paymemt Source.");
      return;
    }

    if (!this.addincomingpayment.amount || this.addincomingpayment.amount <= 0) {
      this.toast.error("Please enter a amount which is greater than zero.");
      return;
    }

    if (!this.addincomingpayment.paymentDate) {
      this.toast.error("Please selcet a Payment Date.");
      return;
    }
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('images', this.selectedFile);

      this.apiService.post('IncommingPayment/UploadPaymentImages', formData).subscribe({
        next: (res: any) => {
          this.saveincommingpayment(res.data[0] || "");
        },
        error: (err) => {
          this.toast.error("Image upload failed");
          this.saveincommingpayment(""); // Image upload fail ho to blank bheje
        }
      });
    } else {
      // Agar image select nahi kiya, to pehle se image bheje ya blank
      this.saveincommingpayment(this.addincomingpayment.image || "");
    }








  }




  saveincommingpayment(imageName: string) {
    this.addincomingpayment.isActive = true;
    this.addincomingpayment.customerId = 0;
    this.addincomingpayment.image = imageName;
    this.addincomingpayment.remarks = this.addincomingpayment.remarks || "";
    this.addincomingpayment.iPaymentGuid = this.incomingpaymentGuid || null;
    this.addincomingpayment.referenceNo = this.addincomingpayment.referenceNo || "";
    this.addincomingpayment.bankName = this.addincomingpayment.bankName || "";
    this.addincomingpayment.branchName = this.addincomingpayment.branchName || "";

    const reqBody: CommonReqDto<AddIncomingPaymentDto> = {
      UserId: parseInt(localStorage.getItem("userId") || '0', 10),
      PageSize: 1,
      PageRecordCount: 1000,
      Data: this.addincomingpayment
    };
    this.loading = true;
    const apiUrl = this.incomingpaymentGuid
      ? 'IncommingPayment/UpdatePaymentService'
      : 'IncommingPayment/AddPaymentService';
    this.apiService.post<any>(apiUrl, reqBody).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.flag === 1) {
          this.toast.success(response.message);
          this.router.navigate(['/incoming-payment']);
        } else {
          this.toast.warning(response.message);
        }
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to save incoming payment details');
      }
    });
  }



}
