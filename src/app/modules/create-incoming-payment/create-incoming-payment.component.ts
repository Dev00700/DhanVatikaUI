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
   loading=false;
   incomingpaymentGuid: string | null = null;
   loadingPaymentModeList=false;
   paymentModeList:any[]=[];
   loadingPaymentSouceList=false;
   paymentSourceList:any[]=[];
    isActiveDisabled = true;
    constructor( 
      private route: ActivatedRoute,
      private router: Router,
      private apiService: ApiService,
      private toast: ToastService,
      private dropdownData: DropdownDataService,
    ){}

    ngOnInit() {
      this.fetchincomingPaymentGuidFromRoute();
       this.fetchPaymentModeList();
       this.fetchPaymentSourceList();
    }

    
  fetchPaymentModeList(){
  this.loadingPaymentModeList = true;
  const dropdownreqdto: CommonReqDto<any> = {
    PageSize: 1,
    PageRecordCount: 1000,
    UserId: parseInt(localStorage.getItem("userId") || '0', 10),
    Data: {
      "SearchDDL":"PaymentMode"
    },
  };
  this.dropdownData.getDropdownDataByParam<any>('DropDown/GetRoleListService', dropdownreqdto).subscribe({
    next: res => {
      this.paymentModeList = res.data;
      this.loadingPaymentModeList = false;
    },
    error: () => {
      this.loadingPaymentModeList = false;
    }
  });
}

fetchPaymentSourceList(){
  this.loadingPaymentSouceList = true;
  const dropdownreqdto: CommonReqDto<any> = {
    PageSize: 1,
    PageRecordCount: 1000,
    UserId: parseInt(localStorage.getItem("userId") || '0', 10),
    Data: {
      "SearchDDL":"PaymentSource"
    },
  };
  this.dropdownData.getDropdownDataByParam<any>('DropDown/GetRoleListService', dropdownreqdto).subscribe({
    next: res => {
      this.paymentSourceList = res.data;
      this.loadingPaymentSouceList = false;
    },
    error: () => {
      this.loadingPaymentSouceList = false;
    }
  });
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
      
      this.addincomingpayment.isActive=true;
      this.addincomingpayment.customerId=0;
      this.addincomingpayment.remarks= this.addincomingpayment.remarks || "";
      this.addincomingpayment.iPaymentGuid= this.incomingpaymentGuid || null;
      this.addincomingpayment.image= "";
      this.addincomingpayment.referenceNo= this.addincomingpayment.referenceNo || "";
      this.addincomingpayment.bankName= this.addincomingpayment.bankName || "";
      this.addincomingpayment.branchName= this.addincomingpayment.branchName || "";


      this.addincomingpayment.createdBy= parseInt(localStorage.getItem("userId") || '0', 10);
      const reqBody:CommonReqDto<AddIncomingPaymentDto> = {
        UserId: parseInt(localStorage.getItem("userId") || '0', 10),
        PageSize: 1,
        PageRecordCount: 1000,
        Data: this.addincomingpayment
      };
      this.loading = true;
      const apiUrl = this.incomingpaymentGuid ?  'IncommingPayment/UpdatePaymentService' :'IncommingPayment/AddPaymentService' ;
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
          this.toast.error('Failed to incoming payment details');
        }
      });
    }

    fetchincomingPaymentGuidFromRoute() {

       this.incomingpaymentGuid = this.route.snapshot.paramMap.get('iPaymentGuid');
     if(this.incomingpaymentGuid){
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

        this.apiService.post<CommonResDto<AddIncomingPaymentDto>>(`IncommingPayment/GetPaymentService`,getItemReqDto).subscribe({
        next: (response) => {
          this.addincomingpayment = response.data ;
          //this.tryPatchItem();
          this.loading = false;
        },
        error: () => {
          this.toast.warning('Failed to load incoming payment  details');
          this.loading = false;
        }
      });
     }
     else{
      this.addincomingpayment.isActive = true;
      this.isActiveDisabled = true;
     }
    }

}
