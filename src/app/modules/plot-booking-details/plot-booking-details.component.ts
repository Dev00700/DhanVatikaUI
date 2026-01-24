import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FooterComponent } from '../shared/footer/footer.component';
import { PlotBookingReqDto } from '../../models/plotbooking.model';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { CommonReqDto, CommonResDto } from '../../models/common.model';

@Component({
  selector: 'app-plot-booking-details',
  imports: [CommonModule, NavbarComponent, FormsModule, RouterModule, FooterComponent],
  templateUrl: './plot-booking-details.component.html',
  styleUrl: './plot-booking-details.component.css'
})
export class PlotBookingDetailsComponent {
  fullpageloader = false;
  plotId?: number;
  customerId?: number;
  plotbookingres: PlotBookingReqDto = {} as PlotBookingReqDto;

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
        this.loadbookingdetails();
      }
    });
  }
  ngOnInit() {

  }

  loadbookingdetails() {
    if (!this.plotId || !this.customerId) return;
    this.fullpageloader = true;
    const apiUrl = `plot/GetPlotBookingService`;
    const reqBody: CommonReqDto<any> = {
      UserId: parseInt(localStorage.getItem("userId") || '0', 10),
      PageSize: 1,
      PageRecordCount: 1000,
      Data: {
        "PlotId": this.plotId,
        "CustomerId": this.customerId
      }
    };

    this.apiService.post<CommonResDto<PlotBookingReqDto>>(apiUrl, reqBody).subscribe({
      next: (response) => {
        if (response.data) {
          this.plotbookingres = response.data;
        } else {
          this.toast.warning('No details found for the selected customer and plot.');
        }
        this.fullpageloader = false;
      },
      error: (error) => {
        this.fullpageloader = false;
        this.toast.error('Failed to load customer and plot details.');
      }
    });
  }

  isImageUrl(url: string): boolean {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  }

  /**
   * Check if URL is a PDF
   */
  isPdfUrl(url: string): boolean {
    if (!url) return false;
    return /\.pdf$/i.test(url);
  }

}
