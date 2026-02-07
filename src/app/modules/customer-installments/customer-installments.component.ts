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
import { numbertowords } from "../../services/number-to-words.service";
import { AddIncomingPaymentDto } from "../../models/incomingpayment.model";
import html2pdf from "html2pdf.js";

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
    private toast: ToastService,
    private numbertowordsconverter: numbertowords) {
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

  generatePDFEMI(ipaymentGuid: string) {

    this.fullpageloader = true;
    if (ipaymentGuid) {
      const getItemReqDto: CommonReqDto<any> = {
        PageSize: 1,
        PageRecordCount: 1000,
        UserId: parseInt(localStorage.getItem("userId") || '0', 10),
        Data: {
          "iPaymentGuid": ipaymentGuid
        }
      }

      this.apiService.post<CommonResDto<AddIncomingPaymentDto>>(`IncommingPayment/GetPaymentService`, getItemReqDto).subscribe({
        next: (response) => {
          this.fullpageloader = false;
          const dateObj = new Date(response.data.paymentDate);
          const customerId = response.data.customerId || 0;
          const day = String(dateObj.getDate()).padStart(2, '0');
          const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are 0-based
          const year = dateObj.getFullYear();

          // Format dd-MM-yyyy
          const _paymentdate = `${day}-${month}-${year}`;


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
  <title>Incoming Payment</title>
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
   <div style="text-align: center; font-weight: bold; font-size: 18px; margin-bottom: 5px;">Incoming Payment</div>
<div  style="border-bottom: 2px solid #000; margin: 4px 0px 1px 0;"></div>

  <!-- Company + Consignee + Buyer -->
  <div   style="display: flex; border-bottom: 1px solid #000; text-align: center;">
    <div  style="flex: 1; padding: 5px; border-right: 1px solid #000;">

     <div  style="display: inline-block; gap: 10px; align-items: center; margin-bottom: 6px;">
        <img src="assets/images/brand-logos/desktop-logo.jpeg" alt="Company Logo" style="height: 45px;"/>
        <div>
          <strong>DhanVatikaa Developers Pvt. Ltd.</strong>
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
     <tr ${customerId > 0 ? '' : 'style="display:none"'}>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;"><strong>Customer Name</strong> </td>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;">${response.data.customerName}</td>
      </tr>
      <tr ${customerId > 0 ? '' : 'style="display:none"'}>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;"><strong>Plot Name</strong> </td>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;">${response.data.plotName} (${response.data.plot_Code})</td>
      </tr>
        <tr ${customerId > 0 ? '' : 'style="display:none"'}>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;"><strong>Plot Status</strong> </td>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;">${response.data.plotStatusName} </td>
      </tr>
      
    <tr>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;"><strong>Payment Type</strong> </td>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;">${response.data.paymentType}</td>
      </tr>

      <tr>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;"><strong>Payment Mode</strong> </td>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;">${response.data.paymentMode}</td>
      </tr>

         <tr>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;"><strong>Payment Source</strong> </td>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;">${response.data.paymentSourceName}</td>
      </tr>

          <tr>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;"><strong>Payment Date</strong> </td>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;">${_paymentdate}</td>
      </tr>

        <tr>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;"><strong>Bank Name</strong> </td>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;">${response.data.bankName ?? ""}</td>
      </tr>
     

        <tr>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;"><strong>Branch Name</strong> </td>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;">${response.data.branchName ?? ""}</td>
      </tr>

      <tr>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;"><strong>Amount</strong> </td>
      <td style="border: 1px solid #000; padding: 4px; font-size: 13px;text-align:right">${response.data.amount ?? 0}/-</td>
      </tr>
     
    </tr>
  </tbody></table>

   

  <p><strong>Amount in words:</strong> ${_amount}</p>

  <div   style="text-align: right; margin-top: 50px;">
    for DhanVatikaa Developers Pvt. Ltd.<br><br>
    Authorised Signatory
  </div>

  <p  style="text-align: center;font-size: 12px; ">This is a Computer Generated </p>
</div>
</body></html>
  `;
          if (!element) return;

          const opt = {
            margin: 0,
            filename: `Incoming_Payment_${new Date().getTime()}.pdf`,
            image: { type: "jpeg" as "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { format: 'a4', orientation: "portrait" as "portrait" }
          };


          // Ensure Angular bindings render before capturing
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


}
