import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { NavbarComponent } from "../shared/navbar/navbar.component";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { FooterComponent } from "../shared/footer/footer.component";
import { PlotAndCustomerEmiResDto } from "../../models/customerinstallment.model";
import { ToastService } from "../../services/toast.service";
import { ApiService } from "../../services/api.service";
import { CommonReqDto, CommonResDto } from "../../models/common.model";

@Component({
  selector: 'app-customer-installments',
  imports: [CommonModule, NavbarComponent, FormsModule, RouterModule, FooterComponent],
  templateUrl: './customer-installments.component.html',
  styleUrl: './customer-installments.component.css'
})
export class CustomerInstallmentsComponent {
  fullpageloader = false;
  plotId?: number;
  customerId?: number;
  PlotAndCustomerEmiResDtoList: PlotAndCustomerEmiResDto[] = [];
  constructor(private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService,) {
    this.route.queryParams.subscribe(params => {
      const plotId = params['plotId'];
      const customerId = params['customerId'];
      if (plotId) {
        this.plotId = +plotId;
        this.customerId = customerId;
        this.loadCustomerPlotPaymentDetails();
      }
    });
  }
  ngOnInit() {

  }


  loadCustomerPlotPaymentDetails() {
    if (!this.plotId || !this.customerId) return;
    this.fullpageloader = true;
    const apiUrl = `Customer/GetPlotAndCustomerWiseEmiService`;
    const reqBody: CommonReqDto<any> = {
      UserId: parseInt(localStorage.getItem("userId") || '0', 10),
      PageSize: 1,
      PageRecordCount: 1000,
      Data: {
        "PlotId": this.plotId,
        "CustomerId": this.customerId
      }
    };

    this.apiService.post<CommonResDto<PlotAndCustomerEmiResDto[]>>(apiUrl, reqBody).subscribe({
      next: (response) => {
        this.fullpageloader = false;
        if (response.data && response.data.length > 0) {
          this.PlotAndCustomerEmiResDtoList = response.data;
          console.log(this.PlotAndCustomerEmiResDtoList);
        } else {
          this.PlotAndCustomerEmiResDtoList = [];
          this.toast.warning('No details found for the selected customer and plot.');
        }
      },
      error: (error) => {
        this.fullpageloader = false;
        this.toast.error('Failed to load customer and plot details.');
      }
    });
  }
  openIncomingPayment(plotId: number, customerId: number, customerPaymentId: number, finalAmount: number) {
    this.router.navigate(['/create-incoming-payment'], {
      state: { plotId, customerId, customerPaymentId, finalAmount }
    });
    // const params: any = {};
    // if (plotId != null) params.plotId = plotId;
    // if (customerId != null) params.customerId = customerId;
    // if (customerPaymentId != null) params.customerPaymentId = customerPaymentId;
    // sessionStorage.setItem("TokenAmount", this.PlotAndCustomerEmiResDtoList.find(x => x.customerId == customerId && x.plotId == plotId && x.customerPaymentId == customerPaymentId)?.amount?.toString() || '0');
    // this.router.navigate(['/create-incoming-payment'], { queryParams: params });
  }

}
