import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FooterComponent } from '../shared/footer/footer.component';
import { addcustomerRequestDto, AddMultiplePlotReqDto } from '../../models/customer.model';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { CommonReqDto, CommonResDto } from '../../models/common.model';
import { DropdownDataService } from '../../services/dropdown-select-data.service';
import { AddPlotModalComponent } from './add-plot-modal.component';

@Component({
  selector: 'app-create-customer',
  imports: [
    CommonModule,
    NavbarComponent,
    FormsModule,
    RouterModule,
    FooterComponent,
    AddPlotModalComponent
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
  selectedPlots: any[] = [];
  originalPlots: any[] = []; // Track original plots in edit mode
  showPlotModal = false;
  pendingPlotToAdd: any = null; // Store plot waiting for save confirmation
  showSaveConfirmation = false; // Show confirmation dialog
  addmultipleplotreqdto: AddMultiplePlotReqDto = {} as AddMultiplePlotReqDto;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService,
    private dropdownData: DropdownDataService,
  ) { }

  ngOnInit() {
    // Initialize bookingFlag

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

          // If customer has a plot, add it as original (read-only)
          if (response.data.pLotList != null && response.data.pLotList.length > 0) {
            for (let plot of response.data.pLotList) {
              const originalPlot = {
                plotId: plot.plotId,
                plotName: plot.plotName,
                bookingFlag: plot.bookingFlag,
                plotCode: plot.plotCode,
                isOriginal: true
              };
              this.originalPlots.push(originalPlot);
              this.selectedPlots.push(originalPlot);
            }
          }

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

  openPlotModal() {

    // For new customer, only allow adding if no plots selected yet
    if (!this.customerGuid && this.selectedPlots.length > 0) {
      this.toast.warning("For new customer, only one plot can be selected. Save first to add more.");
      return;
    }
    this.showPlotModal = true;
  }

  closePlotModal() {
    this.showPlotModal = false;
  }

  onPlotAdded(plot: any) {
    debugger;
    if (this.selectedPlots.some(p => p.plotId === plot.value)) {
      this.toast.warning("This plot is already selected!");
      return;
    }

    // For new customer - only allow 1 plot, don't ask for confirmation
    if (!this.customerGuid) {
      if (this.selectedPlots.length > 0) {
        this.toast.warning("For new customer, only one plot can be selected. Save first to add more.");
        return;
      }
      // Add directly without confirmation
      this.addPlotToSelection(plot);
      return;
    }

    // For existing customer - ask for confirmation to save first
    if (this.customerGuid) {
      this.pendingPlotToAdd = plot;
      this.showSaveConfirmation = true;
      return;
    }

    // Otherwise, add plot directly
    this.addPlotToSelection(plot);
  }

  addPlotToSelection(plot: any) {
    debugger;
    // Mark as newly added (not original) and set bookingFlag to 0 by default
    const newPlot = {
      plotId: plot.plotId || plot.value,
      plotCode: plot.plotCode,
      plotName: plot.text || plot.plotCode,
      isOriginal: false,
      bookingFlag: plot.bookingFlag !== undefined ? plot.bookingFlag : 0
    };
    this.selectedPlots.push(newPlot);
    this.toast.success(`Plot "${plot.plotCode}" added successfully!`);

    // Always set the plot as primary in addcustomerreqdto
    this.addcustomerreqdto.plotId = plot.plotId || plot.value;
    //this.addcustomerreqdto.plotName = plot.text || plot.plotCode;
    //this.addcustomerreqdto.bookingFlag = 0;
  }

  onSaveAndAddPlot() {
    // Save customer first
    this.saveCustomerQuick(() => {
      // After saving, add the pending plot
      if (this.pendingPlotToAdd) {
        this.addPlotToSelection(this.pendingPlotToAdd);
        this.pendingPlotToAdd = null;
      }
      this.showSaveConfirmation = false;
      // Refresh plot list
      this.fetchPlotList();
    });
  }

  onCancelSaveAndAdd() {
    // Don't save, just add the plot and close dialog
    if (this.pendingPlotToAdd) {
      this.addPlotToSelection(this.pendingPlotToAdd);
      this.pendingPlotToAdd = null;
    }
    this.showSaveConfirmation = false;
  }

  removePlot(index: number) {
    const plotToRemove = this.selectedPlots[index];

    if (plotToRemove.bookingFlag != 0) {
      this.toast.warning("Cannot delete booked plots!");
      return;
    }

    if (plotToRemove.bookingFlag == 0 && plotToRemove.isOriginal) {
      this.removeOriginalPlot(plotToRemove, index);
    } else {
      // Newly added plot - just remove from local array
      this.selectedPlots.splice(index, 1);

      // If we removed the primary plot, set first plot as primary
      if (this.selectedPlots.length > 0) {
        this.addcustomerreqdto.plotId = this.selectedPlots[0].plotId;
      } else {
        this.addcustomerreqdto.plotId = 0;
      }

      this.toast.success("Plot removed successfully!");
    }
  }

  removeOriginalPlot(plotToRemove: any, index: number) {
    // Call API to remove the plot from backend
    const removeReqDto: CommonReqDto<AddMultiplePlotReqDto> = {
      UserId: parseInt(localStorage.getItem("userId") || '0', 10),
      PageSize: 1,
      PageRecordCount: 1000,
      Data: {
        customerId: this.addcustomerreqdto.customerId,
        plotId: plotToRemove.plotId,
        flag: 2 // Assuming flag=2 means remove plot from existing customer
      }
    };

    this.loading = true;
    this.apiService.post<CommonResDto<any>>('Customer/CustomerAddMultiplePlotService', removeReqDto).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.data && response.data.flag === 1) {
          // Remove from local array after API success
          this.selectedPlots.splice(index, 1);

          // If we removed the primary plot, set first plot as primary
          if (this.selectedPlots.length > 0) {
            this.addcustomerreqdto.plotId = this.selectedPlots[0].plotId;
          } else {
            this.addcustomerreqdto.plotId = 0;
          }

          this.toast.success(response.data.message || "Plot removed successfully!");
        } else {
          this.toast.warning(response.data?.message || "Failed to remove plot");
        }
      },
      error: (error) => {
        this.loading = false;
        this.toast.error("Failed to remove plot. Please try again.");
      }
    });
  }

  selectPrimaryPlot(plot: any) {
    this.addcustomerreqdto.plotId = plot.value;
    // this.addcustomerreqdto.plotName = plot.text;
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

    // Validate plot selection for non-booked customers
    if (this.addcustomerreqdto.customerGuid == null && this.selectedPlots.length == 0) {
      this.toast.error("Please select at least one plot");
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
    this.addcustomerreqdto.image = imageName;
    this.addcustomerreqdto.remarks = this.addcustomerreqdto.remarks || "";
    this.addcustomerreqdto.customerGuid = this.customerGuid || null;
    this.addcustomerreqdto.mobile = String(this.addcustomerreqdto.mobile);

    // For UPDATE - don't send plot data, only update name/mobile/email
    if (this.customerGuid) {
      // Create a copy with only name, mobile, email for update
      const updateData: any = {
        ...this.addcustomerreqdto,
        // Don't include plot-related fields for update
        plotId: undefined,
        plotName: undefined,
        bookingFlag: undefined
      };

      const reqBody: CommonReqDto<any> = {
        UserId: parseInt(localStorage.getItem("userId") || '0', 10),
        PageSize: 1,
        PageRecordCount: 1000,
        Data: updateData
      };

      this.loading = true;
      this.apiService.post<any>('Customer/UpdateCustomerService', reqBody).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.data.flag === 1) {
            this.toast.success(response.data.message);
            this.router.navigate(['/customer-list']);
          } else {
            this.toast.warning(response.data.message);
          }
        },
        error: () => {
          this.loading = false;
          this.toast.error('Failed to update customer details');
        }
      });
    } else {
      // For NEW CUSTOMER - include plot data
      const reqBody: CommonReqDto<addcustomerRequestDto> = {
        UserId: parseInt(localStorage.getItem("userId") || '0', 10),
        PageSize: 1,
        PageRecordCount: 1000,
        Data: this.addcustomerreqdto
      };

      this.loading = true;
      this.apiService.post<any>('Customer/AddCustomerService', reqBody).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.data.flag === 1) {
            this.toast.success(response.data.message);
            this.router.navigate(['/customer-list']);
          } else {
            this.toast.warning(response.data.message);
          }
        },
        error: () => {
          this.loading = false;
          this.toast.error('Failed to save customer details');
        }
      });
    }
  }

  saveCustomerQuick(callback?: () => void) {

    // Quick save without full validation (used for saving plots)
    this.addmultipleplotreqdto.customerId = this.addcustomerreqdto.customerId || 0;
    this.addmultipleplotreqdto.plotId = this.pendingPlotToAdd?.plotId;
    this.addmultipleplotreqdto.flag = 1; // Assuming flag=1 means add plot to existing customer

    const reqBody: CommonReqDto<AddMultiplePlotReqDto> = {
      UserId: parseInt(localStorage.getItem("userId") || '0', 10),
      PageSize: 1,
      PageRecordCount: 1000,
      Data: this.addmultipleplotreqdto
    };

    const apiUrl = this.customerGuid
      ? 'Customer/CustomerAddMultiplePlotService' : "";

    this.apiService.post<any>(apiUrl, reqBody).subscribe({
      next: (response) => {
        if (response.data.flag === 1) {
          this.toast.success(response.data.message);
          if (callback) {
            callback();
          }
        } else {
          this.toast.warning(response.data.message);
        }
      },
      error: () => {
        this.toast.error('Failed to save customer');
      }
    });
  }

  onlyNumber(event: any) {
  const input = event.target;
  input.value = input.value.replace(/[^0-9]/g, '');
  this.addcustomerreqdto.mobile = input.value;
}
}
