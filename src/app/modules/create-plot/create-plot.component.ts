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
import { CommonReqDto, CommonResDto } from '../../models/common.model';

@Component({
  selector: 'app-create-plot',
  imports: [CommonModule, NavbarComponent, FormsModule, RouterModule, FooterComponent],
  templateUrl: './create-plot.component.html',
  styleUrl: './create-plot.component.css'
})
export class CreatePlotComponent {
  addplot: PlotRequestDto = {} as PlotRequestDto;
  loading = false;
  plotGuid: string | null = null;
  isActiveDisabled = true;
  selectedFile: File | null = null;
  loadingLocationList = false;
  locationList: any[] = [];
  loadingUnitTypeList = false;
  unittypeList: any[] = []
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];

  plotImages: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService,
    private dropdownData: DropdownDataService,) { }

  ngOnInit() {
    this.fetchLocationList();
    this.fetchUnitTypeList();
    this.fetchplotGuidFromRoute();
  }

  onSubmit() {
    if (!this.addplot.plotName) {
      this.toast.error("Please enter a plot name");
      return;
    }
    if (!this.addplot.plotType) {
      this.toast.error("Please enter a plot type.");
      return;
    }
    if (!this.addplot.locationId) {
      this.toast.error("Please select a Location.");
      return;
    }
    if (!this.addplot.unitTypeId) {
      this.toast.error("Please select a Unit type.");
      return;
    }
    if (!this.addplot.price || this.addplot.price <= 0) {
      this.toast.error("Please enter a price which is greater than zero.");
      return;
    }

    if (this.selectedFiles && this.selectedFiles.length > 0) {
      this.saveplot();
    } else {
      this.saveplot();
    }
  }


  uploadImages(plotId: number) {
    if (this.selectedFiles && this.selectedFiles.length > 0) {
      const formData = new FormData();

      this.selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      this.apiService.post('IncommingPayment/UploadPaymentImages', formData).subscribe({
        next: (res: any) => {
          // response should contain list of uploaded image URLs
          const uploadedDtos = res.data.map((img: any) => ({
            plotId: 1,
            image: img.image || img
          }));

          this.plotImages = uploadedDtos;
          this.savePlotImages(this.plotImages);
        },
        error: () => {
          this.toast.error("Image upload failed");
        }
      });
    } else {
      this.toast.warning("Please select at least one image");
    }
  }


  fetchLocationList() {
    this.loadingLocationList = true;
    const dropdownreqdto: CommonReqDto<any> = {
      PageSize: 1,
      PageRecordCount: 1000,
      UserId: parseInt(localStorage.getItem("userId") || '0', 10),
      Data: {
        "SearchDDL": "Location"
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
  fetchUnitTypeList() {
    this.loadingUnitTypeList = true;
    const dropdownreqdto: CommonReqDto<any> = {
      PageSize: 1,
      PageRecordCount: 1000,
      UserId: parseInt(localStorage.getItem("userId") || '0', 10),
      Data: {
        "SearchDDL": "UnitType"
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
  saveplot() {
    this.addplot.isActive = true;
    this.addplot.remarks = this.addplot.remarks || "";
    this.addplot.plotGuid = this.plotGuid || null;

    const reqBody: CommonReqDto<PlotRequestDto> = {
      UserId: parseInt(localStorage.getItem("userId") || '0', 10),
      PageSize: 1,
      PageRecordCount: 1000,
      Data: this.addplot
    };
    this.loading = true;
    const apiUrl = this.plotGuid
      ? 'Plot/UpdatePlotService'
      : 'Plot/AddPlotService';
    this.apiService.post<any>(apiUrl, reqBody).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.flag === 1) {
          if (this.selectedFiles && this.selectedFiles.length > 0) {
            this.uploadImages(response.data.plotId);
          }
          this.toast.success(response.message);
          this.router.navigate(['/plot']);
        } else {
          this.toast.warning(response.message);
        }
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to save plot details');
      }
    });
  }

  fetchplotGuidFromRoute() {
    this.plotGuid = this.route.snapshot.paramMap.get('plotGuid');
    if (this.plotGuid) {
      this.loading = true;
      this.isActiveDisabled = false;
      const getItemReqDto: CommonReqDto<any> = {
        PageSize: 1,
        PageRecordCount: 1000,
        UserId: parseInt(localStorage.getItem("userId") || '0', 10),
        Data: {
          "PlotGuid": this.plotGuid
        }
      }

      this.apiService.post<CommonResDto<PlotRequestDto>>(`Plot/GetPlotService`, getItemReqDto).subscribe({
        next: (response) => {
          debugger;
          this.addplot = response.data;
          this.loading = false;
        },
        error: () => {
          this.toast.warning('Failed to load plot  details');
          this.loading = false;
        }
      });
    }
    else {
      this.addplot.isActive = true;
      this.isActiveDisabled = true;
    }
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;

    if (files && files.length > 0) {
      this.selectedFiles = Array.from(files); // store all selected files
      this.imagePreviews = [];

      for (let file of this.selectedFiles) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result); // store preview for each image
        };
        reader.readAsDataURL(file);
      }
    }
  }

  savePlotImages(plotImages: any[]) {
    const plotimagereq: CommonReqDto<any> = {
      PageSize: 1,
      PageRecordCount: 1000,
      UserId: parseInt(localStorage.getItem("userId") || '0', 10),
      Data: plotImages
    }

    this.apiService.post('Plot/AddPlotImagesService', plotimagereq).subscribe({
      next: () => this.toast.success("Images saved successfully"),
      error: () => this.toast.error("Failed to save images")
    });
  }
}
