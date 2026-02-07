import { Component } from '@angular/core';
import { PlotResponseDto, PlotStatusReqDto } from '../../models/plot.model';
import { ApiService } from '../../services/api.service';
import { Router, RouterModule } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { plotservice } from '../../services/plot.service';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../shared/pagination/pagination.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { CommonReqDto, CommonResDto } from '../../models/common.model';
import { DropdownDataService } from '../../services/dropdown-select-data.service';
import { PlotStatus } from '../../models/incomingpayment.model';

@Component({
  selector: 'app-plot',
  imports: [CommonModule, NavbarComponent, RouterModule, FormsModule, PaginationComponent, FooterComponent],
  templateUrl: './plot.component.html',
  styleUrl: './plot.component.css'
})
export class PlotComponent {
  loading: boolean = false;
  locationList: any[] = [];
  fullpageloader: boolean = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 10;
  plotStatusOptions: { value: number; text: string }[] = [];
  changeplotstatus: PlotStatusReqDto = {} as PlotStatusReqDto;
  plotlist: PlotResponseDto[] = [];
  filters = {
    plotName: "",
    plotType: "",
    locationId: 0,
    plot_Code: "",
    subPlotCode: ""
  };
  constructor(
    private apiService: ApiService,
    private router: Router,
    private toast: ToastService,
    private plotdata: plotservice,
    private dropdownData: DropdownDataService
  ) { }
  ngOnInit() {
    this.fetchLocationList();
    this.getplotslist();
    this.loadPlotStatuses();
  }

  getplotslist() {
    this.fullpageloader = true;
    const UserId = parseInt(localStorage.getItem("userId") || '0', 10);
    const Data = {
      "PlotName": this.filters.plotName,
      "PlotType": this.filters.plotType,
      "Plot_Code": this.filters.plot_Code,
      "SubPlotCode": this.filters.subPlotCode,
      "PaymentModeId": this.filters.locationId == 0 ? null : this.filters.locationId,
    };
    this.plotdata.getplotlist(1, this.currentPage, this.pageSize, UserId, Data)
      .subscribe({
        next: (response) => {
          this.fullpageloader = false;
          if (response.data !== null) {
            this.plotlist = response.data;
            this.totalRecords = response.totalRecordCount;
          } else {
            this.plotlist = [];
            this.toast.warning('No plots records found');
          }
        },
        error: (error) => {
          this.fullpageloader = false;
          this.toast.error('Failed to load plots records');
        }
      });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getplotslist();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.getplotslist();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.getplotslist();
  }

  fetchLocationList() {
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
      },
      error: () => {
      }
    });
  }
  selectedChips: { key: string; label: string }[] = [];
  applyFilters() {
    this.selectedChips = [];

    if (this.filters.plotName) {
      this.selectedChips.push({
        key: 'plotName',
        label: `Plot Name: ${this.filters.plotName}`
      });
    }

    if (this.filters.plot_Code) {
      this.selectedChips.push({
        key: 'plot_Code',
        label: `Plot Code: ${this.filters.plot_Code}`
      });
    }


    if (this.filters.subPlotCode) {
      this.selectedChips.push({
        key: 'subPlotCode',
        label: `Sub Plot Code: ${this.filters.subPlotCode}`
      });
    }

    if (this.filters.plotType && this.filters.plotType !== "1") {

      this.selectedChips.push({
        key: 'plotType',
        label: `plotType: ${this.filters.plotType}`
      });
    }
    if (this.filters.locationId && this.filters.locationId !== 0) {
      const locationname = this.locationList.find((m: { value: number; text: string }) => m.value == this.filters.locationId)?.text;
      this.selectedChips.push({
        key: 'locationId',
        label: `Location: ${locationname}`
      });
    }
    this.getplotslist();
  }

  removeChip(key: string) {
    (this.filters as any)[key] = key === 'plotName' || key === 'plotType' ? '' : '';
    this.applyFilters();
  }

  ChangePlotStatus(plotId: number,) {
    this.changeplotstatus.PlotId = plotId;
  }
  loadPlotStatuses() {
    debugger;
    this.plotStatusOptions = [
      { value: PlotStatus.Select, text: 'Select Plot Status' },
      { value: PlotStatus.Available, text: 'Available' },
      { value: PlotStatus.PreBooked, text: 'PreBooked' },
      { value: PlotStatus.Booked, text: 'Booked' },
      { value: PlotStatus.Sale, text: 'Sale' },
      { value: PlotStatus.Registry, text: 'Registry' },
      { value: PlotStatus.Hold, text: 'Hold' }
    ];
  }
  ChangeStatus() {
    if (this.changeplotstatus.PlotStatus == 0 || this.changeplotstatus.PlotStatus === undefined) {
      this.toast.error('Pleases select plot status');
      return;
    }
    if (confirm('Are you sure you want to change the plot status?')) {
      this.loading = true;
      const cancelorderreq: CommonReqDto<PlotStatusReqDto> = {
        PageSize: 1,
        PageRecordCount: 10,
        Data: {
          PlotId: this.changeplotstatus.PlotId,
          PlotStatus: this.changeplotstatus.PlotStatus
        },
        UserId: parseInt(localStorage.getItem("userId") || '0', 10),
      };
      this.apiService.post<CommonResDto<any>>('Plot/UpdatePlotStatusService', cancelorderreq).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.flag) {
            if (response.flag == 1) {
              this.toast.success(response.message);
              //after some time reload the page

              setTimeout(() => {
                window.location.reload();
              }, 2000);
            }
            else {
              this.toast.error(response.message);
            }

          } else {
            this.toast.error('Failed to change plot status');
          }
        },
        error: (error) => {
          this.loading = false;
          this.toast.error('Failed to change plot status');
        }
      });
    }
  }

}
