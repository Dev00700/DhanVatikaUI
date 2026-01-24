import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FooterComponent } from '../shared/footer/footer.component';
import { addcustomerRequestDto } from '../../models/customer.model';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { CommonReqDto, CommonResDto } from '../../models/common.model';
import { DropdownDataService } from '../../services/dropdown-select-data.service';

@Component({
  selector: 'app-create-customer',
  imports: [
    CommonModule,
    NavbarComponent,
    FormsModule,
    RouterModule,
    FooterComponent
  ],
  templateUrl: './create-customer.component.html',
  styleUrl: './create-customer.component.css'
})
export class CreateCustomerComponent {
  addcustomerreqdto: addcustomerRequestDto = {} as addcustomerRequestDto;
  loading = false;
  customerGuid: string | null = null;
  isActiveDisabled = true;
  selectedFile: File | null = null;
  loadingplotList = false;
  plotList: any[] = [];


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService,
    private dropdownData: DropdownDataService,
  ) { this.addcustomerreqdto.bookingFlag == null || this.addcustomerreqdto.bookingFlag == undefined ? this.addcustomerreqdto.bookingFlag = 0 : this.addcustomerreqdto.bookingFlag = this.addcustomerreqdto.bookingFlag; }

  ngOnInit() {
    this.fetchPlotList();
    this.fetchcustomerGuidFromRoute();
  }

  fetchPlotList() {
    this.loadingplotList = true;
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
        debugger;
        this.plotList = res.data;
        this.loadingplotList = false;
      },
      error: () => {
        this.loadingplotList = false;
      }
    });
  }
  fetchcustomerGuidFromRoute() {
    this.customerGuid = this.route.snapshot.paramMap.get('customerGuid');
    if (this.customerGuid) {
      this.loading = true;
      this.isActiveDisabled = false;
      const requestDto: CommonReqDto<any> = {
        PageSize: 1,
        PageRecordCount: 1000,
        UserId: parseInt(localStorage.getItem("userId") || '0', 10),
        Data: {
          "customerGuid": this.customerGuid
        }
      }

      this.apiService.post<CommonResDto<addcustomerRequestDto>>(`Customer/GetCustomerService`, requestDto).subscribe({
        next: (response) => {
          this.addcustomerreqdto = response.data;


          this.addcustomerreqdto.image = response.data.image != "" ? response.data.image : null;
          this.loading = false;
        },
        error: () => {
          this.toast.warning('Failed to load customer details');
          this.loading = false;
        }
      });
    }
    else {
      this.addcustomerreqdto.isActive = true;
      this.isActiveDisabled = true;
    }
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.selectedFile = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {

        this.addcustomerreqdto.image = e.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);
      // ...baaki file upload logic
    }
  }

  onSubmit() {
    if (!this.addcustomerreqdto.name || this.addcustomerreqdto.name.trim() === "") {
      this.toast.error("Please enter a  name");
      return;
    }

    if (!this.addcustomerreqdto.mobile) {
      this.toast.error("Please enter a  mobile");
      return;
    }

    if (!this.addcustomerreqdto.emailId || this.addcustomerreqdto.emailId.trim() === "") {
      this.toast.error("Please enter a  emailId");
      return;
    }
    // if (!this.locationreqdto.image) {
    //   this.toast.error("Please select a image");
    //   return;
    // }
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('images', this.selectedFile);

      this.apiService.post('IncommingPayment/UploadPaymentImages', formData).subscribe({
        next: (res: any) => {
          this.savecustomer(res.data[0] || "");
        },
        error: (err) => {
          this.toast.error("Image upload failed");
          this.savecustomer(""); // Image upload fail ho to blank bheje
        }
      });
    } else {
      // Agar image select nahi kiya, to pehle se image bheje ya blank
      this.savecustomer(this.addcustomerreqdto.image || "");
    }
  }

  savecustomer(imageName: string) {
    //this.locationreqdto.isActive = this.locationreqdto.isActive || true;
    this.addcustomerreqdto.image = imageName;
    this.addcustomerreqdto.remarks = this.addcustomerreqdto.remarks || "";
    this.addcustomerreqdto.customerGuid = this.customerGuid || null;


    const reqBody: CommonReqDto<addcustomerRequestDto> = {
      UserId: parseInt(localStorage.getItem("userId") || '0', 10),
      PageSize: 1,
      PageRecordCount: 1000,
      Data: this.addcustomerreqdto
    };
    this.loading = true;
    const apiUrl = this.customerGuid
      ? 'Customer/UpdateCustomerService'
      : 'Customer/AddCustomerService';
    this.apiService.post<any>(apiUrl, reqBody).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.flag === 1) {
          this.toast.success(response.message);
          this.router.navigate(['/customer-list']);
        } else {
          this.toast.warning(response.message);
        }
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to save customer details');
      }
    });
  }
}
