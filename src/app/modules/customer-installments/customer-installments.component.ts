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

  // EMI Date Update Properties
  editingEmiIndex: number = -1;
  newEmiDate: string = '';
  showEditModal: boolean = false;

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

  openEditEmiDateModal(index: number) {
    this.editingEmiIndex = index;
    const currentDate = this.PlotAndCustomerEmiResDtoList[index].emiDate;
    if (currentDate) {
      const date = new Date(currentDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      this.newEmiDate = `${year}-${month}-${day}`;
    }
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingEmiIndex = -1;
    this.newEmiDate = '';
  }

  confirmUpdateEmiDate() {
    if (this.editingEmiIndex === -1 || !this.newEmiDate) {
      this.toast.warning('Please select a valid date.');
      return;
    }

    const selectedEmi = this.PlotAndCustomerEmiResDtoList[this.editingEmiIndex];
    const confirmMsg = `Are you sure you want to change the EMI date from ${selectedEmi.emiDate ? new Date(selectedEmi.emiDate).toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'N/A'} to ${new Date(this.newEmiDate).toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' })}?`;

    if (confirm(confirmMsg)) {
      this.updateEmiDateApi();
    }
  }

  updateEmiDateApi() {
    this.fullpageloader = true;
    const selectedEmi = this.PlotAndCustomerEmiResDtoList[this.editingEmiIndex];

    const updateEmiDateReqDto: CommonReqDto<any> = {
      UserId: parseInt(localStorage.getItem("userId") || '0', 10),
      PageSize: 1,
      PageRecordCount: 1000,
      Data: {
        "CustomerPaymentId": selectedEmi.customerPaymentId,
        "Date": this.newEmiDate,
        "CustomerId": selectedEmi.customerId
      }
    };

    this.apiService.post<CommonResDto<any>>('Customer/UpdateEmiDateService', updateEmiDateReqDto).subscribe({
      next: (response) => {
        this.fullpageloader = false;
        if (response.data.flag === 1) {
          // Update the local data
          this.PlotAndCustomerEmiResDtoList[this.editingEmiIndex].emiDate = new Date(this.newEmiDate);
          this.toast.success(response.data.message || 'EMI date updated successfully.');
          //location.reload(); // Reload the page to reflect changes, can be optimized to update only the changed item without reload
          this.closeEditModal();
        } else {
          this.toast.error(response.data.message || 'Failed to update EMI date.');
        }
      },
      error: (error) => {
        this.fullpageloader = false;
        console.error('Error updating EMI date:', error);
        this.toast.error('Failed to update EMI date. Please try again.');
      }
    });
  }

  generateMainPagePDF() {
    if (!this.PlotAndCustomerEmiResDtoList || this.PlotAndCustomerEmiResDtoList.length === 0) {
      this.toast.warning('No data available for PDF generation.');
      return;
    }

    const customerData = this.PlotAndCustomerEmiResDtoList[0];
    const customerName = customerData?.customerName || 'Customer';
    const filename = `EMI_${customerName}_${new Date().getTime()}.pdf`;

    // Format date helper
    const formatDate = (date: any) => {
      if (!date) return 'N/A';
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    };

    // Get status text
    const getStatusBadge = (emi: any) => {
      if (emi.isrejected === true) {
        return 'REJECTED';
      }
      if (emi.dueAmount === 0 && emi.isrejected === false) {
        return emi.isPaid ? 'PAID' : 'PENDING';
      }
      if (emi.dueAmount > 0) {
        return emi.isPaid ? 'PARTIAL' : 'PENDING';
      }
      return 'PENDING';
    };

    // Build table rows
    let tableRows = '';
    this.PlotAndCustomerEmiResDtoList.forEach((emi, index) => {
      const status = getStatusBadge(emi);
      tableRows += `
        <tr>
          <td style="text-align: center; padding: 8px; border: 1px solid #ddd;">${index + 1}</td>
          <td style="text-align: center; padding: 8px; border: 1px solid #ddd;">${emi.emiNo}</td>
          <td style="text-align: center; padding: 8px; border: 1px solid #ddd;">${formatDate(emi.emiDate)}</td>
          <td style="text-align: center; padding: 8px; border: 1px solid #ddd;">${emi.paymentDate}</td>
          <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">₹${emi.amount || 0}</td>
          <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">₹${emi.previousDue || 0}</td>
          <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">₹${(emi.amount || 0) + (emi.previousDue || 0)}</td>
          <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">₹${emi.paidAmount || 0}</td>
          <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">₹${emi.dueAmount || 0}</td>
          <td style="text-align: center; padding: 8px; border: 1px solid #ddd; font-weight: bold;">${status}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${emi.remarks || '-'}</td>
        </tr>
      `;
    });

    const totalAmount = this.PlotAndCustomerEmiResDtoList.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalPaid = this.PlotAndCustomerEmiResDtoList.reduce((sum, e) => sum + (e.paidAmount || 0), 0);
    const totalDue = this.PlotAndCustomerEmiResDtoList.reduce((sum, e) => sum + (e.dueAmount || 0), 0);

    const htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; }
          
            
            .page {
              width: 100%;
              max-width: 900px;
              margin: 0 auto;
              padding: 20px;
              background: white;
            }
            
            .header-section {
              text-align: center;
              border-bottom: 3px solid #000;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            
            .company-name {
              font-size: 18px;
              font-weight: bold;
              letter-spacing: 1px;
              margin-bottom: 5px;
            }
            
            .document-title {
              font-size: 14px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 2px;
              margin-top: 10px;
            }
            
            .info-section {
              display: table;
              width: 100%;
              margin-bottom: 20px;
              font-size: 11px;
            }
            
            .info-col {
              display: table-cell;
              vertical-align: top;
              width: 50%;
              padding-right: 20px;
            }
            
            .info-col:last-child {
              padding-right: 0;
            }
            
            .info-label {
              font-weight: bold;
              margin-top: 8px;
              text-transform: uppercase;
              font-size: 10px;
              border-bottom: 1px solid #000;
              padding-bottom: 5px;
            }
            
            .info-item {
              margin-top: 4px;
              padding-left: 10px;
            }
            
            .info-item-label {
              font-weight: bold;
              width: 120px;
              display: inline-block;
            }
            
            .info-item-value {
              display: inline-block;
            }
            
            .table-section {
              margin-bottom: 20px;
            }
            
            .section-title {
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
              margin-bottom: 10px;
              padding-bottom: 5px;
              border-bottom: 2px solid #000;
              letter-spacing: 1px;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
            }
            
            thead {
              background: #f5f5f5;
            }
            
            thead th {
              padding: 8px;
              text-align: left;
              font-weight: bold;
              font-size: 10px;
              border: 1px solid #000;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            tbody td {
              padding: 7px 8px;
              border: 1px solid #ddd;
              font-size: 10px;
            }
            
            .summary-section {
              margin-top: 20px;
              padding: 15px;
              border: 2px solid #000;
              background: #fafafa;
            }
            
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
              border-bottom: 1px solid #ddd;
              font-size: 11px;
            }
            
            .summary-row:last-child {
              border-bottom: none;
              font-weight: bold;
              padding-top: 8px;
              border-top: 2px solid #000;
            }
            
            .summary-label {
              font-weight: bold;
            }
            
            .summary-value {
              text-align: right;
            }
            
            .footer-section {
              margin-top: 30px;
              display: table;
              width: 100%;
              font-size: 10px;
            }
            
            .footer-col {
              display: table-cell;
              width: 33.33%;
              text-align: center;
              vertical-align: top;
              padding: 40px 10px 10px 10px;
            }
            
            .signature-line {
              border-top: 1px solid #000;
              margin-bottom: 5px;
              padding-top: 30px;
            }
            
            .signature-label {
              font-weight: bold;
              text-transform: uppercase;
              font-size: 9px;
              margin-top: 5px;
            }
            
            .notes {
              margin-top: 20px;
              padding: 15px;
              border: 1px solid #ddd;
              background: #fafafa;
              font-size: 9px;
            }
            
            .notes-title {
              font-weight: bold;
              margin-bottom: 8px;
            }
          </style>
        </head>
        <body style="font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.5; color: #000; background: #fff;">
          <div class="page">
            <!-- Header -->
            <div class="header-section">
              <div class="company-name">DhanVatikaa Developers Pvt. Ltd.</div>
              <div class="document-title">EMI STATEMENT</div>
            </div>

            <!-- Customer & Document Info -->
            <div class="info-section">
              <div class="info-col">
                 
                <div class="info-item">
                  <div class="info-item-label">Customer Name:</div>
                  <div class="info-item-value">${customerData.customerName || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-item-label">Email:</div>
                  <div class="info-item-value">${customerData.emailId || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-item-label">Phone:</div>
                  <div class="info-item-value">${customerData.mobile || 'N/A'}</div>
                </div>
              </div>
              <div class="info-col">
                
                <div class="info-item">
                  <div class="info-item-label">Date:</div>
                  <div class="info-item-value">${new Date().toLocaleDateString('en-IN')}</div>
                </div>
                <div class="info-item">
                  <div class="info-item-label">Plot Name:</div>
                  <div class="info-item-value">${customerData.plotName || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="info-item-label">Plot Code:</div>
                  <div class="info-item-value">${customerData.plot_Code || 'N/A'}</div>
                </div>
              </div>
            </div>

            <!-- EMI Table -->
            <div class="table-section">
              <div class="section-title">EMI Schedule Details</div>
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>EMI No</th>
                    <th>EMI Date</th>
                    <th>Pay Date</th>
                    <th>Original Amt</th>
                    <th>Prev Due</th>
                    <th>Final Amt</th>
                    <th>Paid Amt</th>
                    <th>Due Amt</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  ${tableRows}
                </tbody>
              </table>
            </div>

            
            

            <!-- Footer Notes -->
            <div class="notes">
              <p>This is a computer-generated document. No signature is required for digital validation.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const element = document.createElement('div');
    element.innerHTML = htmlContent;

    document.body.appendChild(element);

    const opt = {
      margin: 8,
      filename: filename,
      image: { type: 'jpeg' as 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { format: 'a4', orientation: 'portrait' as 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      document.body.removeChild(element);
    }).catch(() => {
      if (document.body.contains(element)) {
        document.body.removeChild(element);
      }
    });
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
