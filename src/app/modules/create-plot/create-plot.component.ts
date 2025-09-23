import { Component } from '@angular/core';
import { NavbarComponent } from "../shared/navbar/navbar.component";
import { FooterComponent } from "../shared/footer/footer.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PlotRequestDto } from '../../models/plot.model';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { DropdownDataService } from '../../services/dropdown-select-data.service';
import { CommonReqDto } from '../../models/common.model';

@Component({
  selector: 'app-create-plot',
  imports: [CommonModule,NavbarComponent,FormsModule,RouterModule, FooterComponent],
  templateUrl: './create-plot.component.html',
  styleUrl: './create-plot.component.css'
})
export class CreatePlotComponent {
  addplot: PlotRequestDto = {} as PlotRequestDto;
  loading=false;
  plotGuid: string | null = null;
  isActiveDisabled = true;
  selectedFile: File | null = null;
  loadingLocationList=false;
  locationList:any[]=[];
  loadingUnitTypeList=false;
  unittypeList:any[]=[]

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private apiService: ApiService,
      private toast: ToastService,
      private dropdownData: DropdownDataService,){}

  ngOnInit() {
      this.fetchPlotList(); 
  }

  onSubmit() {
  //  if (!this.addoutgoingpayment.expenseTitle) {
  //     this.toast.error("Please enter a expense Type");
  //     return;
  //   }
  //   if (!this.addoutgoingpayment.paymentModeId) {
  //     this.toast.error("Please select a payment mode.");
  //     return;
  //   }
  //   if (!this.addoutgoingpayment.expenseCategoryId) {
  //     this.toast.error("Please select a expense category.");
  //     return;
  //   }
   
  //   if (!this.addoutgoingpayment.amount || this.addoutgoingpayment.amount <= 0) {
  //     this.toast.error("Please enter a amount which is greater than zero.");
  //     return;
  //   }
 
  //    if (!this.addoutgoingpayment.expenseDate) {
  //     this.toast.error("Please selcet a expense Date.");
  //     return;
  //   }

   if (this.selectedFile) {
    const formData = new FormData();
    formData.append('images', this.selectedFile);

    this.apiService.post('IncommingPayment/UploadPaymentImages', formData).subscribe({
      next: (res: any) => {
     //   this.saveOutgoingPayment(res.data[0] || "");
      },
      error: (err) => {
        this.toast.error("Image upload failed");
       // this.saveOutgoingPayment(""); // Image upload fail ho to blank bheje
      }
    });
  } else {
    // Agar image select nahi kiya, to pehle se image bheje ya blank
   // this.saveOutgoingPayment(this.addoutgoingpayment.image || "");
  }
}

fetchPlotList(){
  this.loadingLocationList = true;
  const dropdownreqdto: CommonReqDto<any> = {
    PageSize: 1,
    PageRecordCount: 1000,
    UserId: parseInt(localStorage.getItem("userId") || '0', 10),
    Data: {
      "SearchDDL":"Location"
    },
  };
  this.dropdownData.getDropdownDataByParam<any>('DropDown/GetDropdownListService', dropdownreqdto).subscribe({
    next: res => {
      this.locationList = res.data;
      this.loadingLocationList = false;
    },
    error: () => {
      this.loadingLocationList = false;
    }
  });
}
fetchUnitTypeList(){
  this.loadingUnitTypeList = true;
  const dropdownreqdto: CommonReqDto<any> = {
    PageSize: 1,
    PageRecordCount: 1000,
    UserId: parseInt(localStorage.getItem("userId") || '0', 10),
    Data: {
      "SearchDDL":"UnitType"
    },
  };
  this.dropdownData.getDropdownDataByParam<any>('DropDown/GetDropdownListService', dropdownreqdto).subscribe({
    next: res => {
      this.unittypeList = res.data;
      this.loadingUnitTypeList = false;
    },
    error: () => {
      this.loadingUnitTypeList = false;
    }
  });
}

}
