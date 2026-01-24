import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FooterComponent } from '../shared/footer/footer.component';
import { LocationReqDto } from '../../models/location.model';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { CommonReqDto, CommonResDto } from '../../models/common.model';

@Component({
  selector: 'app-create-location',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FormsModule,
    RouterModule,
    FooterComponent
  ],
  templateUrl: './create-location.component.html',
  styleUrl: './create-location.component.css'
})
export class CreateLocationComponent {
  locationreqdto: LocationReqDto = {} as LocationReqDto;
  loading = false;
  locationGuid: string | null = null;
  isActiveDisabled = true;
  selectedFile: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService,
  ) { }

  ngOnInit() {
    this.fetchlocationGuidFromRoute();
  }

  fetchlocationGuidFromRoute() {
    this.locationGuid = this.route.snapshot.paramMap.get('locationGuid');
    if (this.locationGuid) {
      this.loading = true;
      this.isActiveDisabled = false;
      const requestDto: CommonReqDto<any> = {
        PageSize: 1,
        PageRecordCount: 1000,
        UserId: parseInt(localStorage.getItem("userId") || '0', 10),
        Data: {
          "locationGuid": this.locationGuid
        }
      }

      this.apiService.post<CommonResDto<LocationReqDto>>(`Location/GetLocationService`, requestDto).subscribe({
        next: (response) => {
          this.locationreqdto = response.data;

          this.locationreqdto.image = response.data.image != "" ? response.data.image : null;
          this.loading = false;
        },
        error: () => {
          this.toast.warning('Failed to load location details');
          this.loading = false;
        }
      });
    }
    else {
      this.locationreqdto.isActive = true;
      this.isActiveDisabled = true;
    }
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.selectedFile = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {

        this.locationreqdto.image = e.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);
      // ...baaki file upload logic
    }
  }

  onSubmit() {
    if (!this.locationreqdto.locationName) {
      this.toast.error("Please enter a location name");
      return;
    }
    if (!this.locationreqdto.image) {
      this.toast.error("Please select a image");
      return;
    }
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('images', this.selectedFile);

      this.apiService.post('IncommingPayment/UploadPaymentImages', formData).subscribe({
        next: (res: any) => {
          this.savelocation(res.data[0] || "");
        },
        error: (err) => {
          this.toast.error("Image upload failed");
          this.savelocation(""); // Image upload fail ho to blank bheje
        }
      });
    } else {
      // Agar image select nahi kiya, to pehle se image bheje ya blank
      this.savelocation(this.locationreqdto.image || "");
    }
  }

  savelocation(imageName: string) {
    debugger;
    //this.locationreqdto.isActive = this.locationreqdto.isActive || true;
    this.locationreqdto.image = imageName;
    this.locationreqdto.remarks = this.locationreqdto.remarks || "";
    this.locationreqdto.locationGuid = this.locationGuid || null;

    const reqBody: CommonReqDto<LocationReqDto> = {
      UserId: parseInt(localStorage.getItem("userId") || '0', 10),
      PageSize: 1,
      PageRecordCount: 1000,
      Data: this.locationreqdto
    };
    this.loading = true;
    const apiUrl = this.locationGuid
      ? 'Location/UpdateLocationService'
      : 'Location/AddLocationService';
    this.apiService.post<any>(apiUrl, reqBody).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.flag === 1) {
          this.toast.success(response.message);
          this.router.navigate(['/location']);
        } else {
          this.toast.warning(response.message);
        }
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to save location details');
      }
    });
  }

}
