import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FooterComponent } from '../shared/footer/footer.component';
import { PlotBookingReqDto } from '../../models/plotbooking.model';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { CommonReqDto } from '../../models/common.model';

@Component({
  selector: 'app-create-plot-booking',
  imports: [CommonModule, NavbarComponent, FormsModule, RouterModule, FooterComponent],
  templateUrl: './create-plot-booking.component.html',
  styleUrl: './create-plot-booking.component.css'
})
export class CreatePlotBookingComponent {
  addplotbookingreq: PlotBookingReqDto = {} as PlotBookingReqDto;
  loading = false;
  plotBookingGuid: string | null = null;
  isActiveDisabled = true;
  constructor(private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService,) { }
  ngOnInit() { }

  onSubmit() {

    this.saveplotbooking();
    // if (!this.addplot.plotName) {
    //   this.toast.error("Please enter a plot name");
    //   return;
    // }
    // if (!this.addplot.plotType) {
    //   this.toast.error("Please enter a plot type.");
    //   return;
    // }
    // if (!this.addplot.locationId) {
    //   this.toast.error("Please select a Location.");
    //   return;
    // }
    // if (!this.addplot.unitTypeId) {
    //   this.toast.error("Please select a Unit type.");
    //   return;
    // }
    // if (!this.addplot.price || this.addplot.price <= 0) {
    //   this.toast.error("Please enter a price which is greater than zero.");
    //   return;
    // }

    // if (this.selectedFiles && this.selectedFiles.length > 0) {

    // } else {

    // }
  }

  saveplotbooking() {
    this.addplotbookingreq.isActive = true;
    this.addplotbookingreq.remarks = this.addplotbookingreq.remarks || "";
    this.addplotbookingreq.bookingGuid = this.plotBookingGuid || null;

    const reqBody: CommonReqDto<PlotBookingReqDto> = {
      UserId: parseInt(localStorage.getItem("userId") || '0', 10),
      PageSize: 1,
      PageRecordCount: 1000,
      Data: this.addplotbookingreq
    };
    this.loading = true;
    const apiUrl = this.plotBookingGuid
      ? 'Plot/UpdatePlotBookingService'
      : 'Plot/AddPlotBookingService';
    this.apiService.post<any>(apiUrl, reqBody).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.flag === 1) {
          // if (this.selectedFiles && this.selectedFiles.length > 0) {
          //   this.uploadImages(response.data.plotId);
          // }
          this.toast.success(response.message);
          this.router.navigate(['/plot-booking']);
        } else {
          this.toast.warning(response.message);
        }
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to save plot booking details');
      }
    });
  }
}
