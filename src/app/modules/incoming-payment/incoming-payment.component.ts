import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { Router, RouterModule } from '@angular/router';
import { AddIncomingPaymentDto, IncomingPaymentDto } from '../../models/incomingpayment.model';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { CommonReqDto, CommonResDto } from '../../models/common.model';

@Component({
  selector: 'app-incoming-payment',
  imports: [CommonModule,NavbarComponent,FooterComponent,RouterModule],
  templateUrl: './incoming-payment.component.html',
  styleUrl: './incoming-payment.component.css'
})
export class IncomingPaymentComponent {
   loading: boolean = false;
   incomingpaymentlist:IncomingPaymentDto[] = [];
   constructor( 
    private apiService: ApiService,
    private router: Router,
    private toast: ToastService){}

     ngOnInit() {
    this.loading = true;
    const reqData: CommonReqDto<number>= {
            PageSize: 1,
            PageRecordCount: 1000,
            Data: parseInt(localStorage.getItem("userId") || '0', 10),
            UserId: parseInt(localStorage.getItem("userId") || '0', 10),
    };
  
    this.apiService.post<CommonResDto<IncomingPaymentDto[]>>('IncommingPayment/GetPaymentListService', reqData).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.data!== null ) {
          this.incomingpaymentlist = response.data;
        } else {
          this.incomingpaymentlist = [];
          this.toast.warning('No incoming payment records found');
        }
      },
      error: (error) => {
        this.loading = false;
        this.toast.error('Failed to load incoming payment records');
      }
    }); 
  }
}
