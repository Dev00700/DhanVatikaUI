import { Component } from '@angular/core';
import { FooterComponent } from '../shared/footer/footer.component';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { CommonReqDto, CommonResDto } from '../../models/common.model';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { DashboardResponseData } from '../../models/dashboard.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  fullpageloader: boolean = false;
  dashboardresponse: DashboardResponseData[] = [];

  constructor(
    private apiService: ApiService,
    private toastr: ToastService
  ) { }

  ngOnInit() {
    this.getDashboardData()
  }

  getDashboardData() {
    this.fullpageloader = true;
    const reqData: CommonReqDto<string> = {
      PageSize: 1,
      PageRecordCount: 100,
      Data: null,
      UserId: parseInt(localStorage.getItem("userId") || '0', 10),
    };
    this.apiService.post<CommonResDto<DashboardResponseData>>('Dashboard/GetDashboardListService', reqData).subscribe({
      next: (res: any) => {
        this.dashboardresponse = res.data;
        this.fullpageloader = false;
      },
      error: (err: any) => {
        this.toastr.error('Failed to fetch dashboard data', 'Error');
        this.fullpageloader = false;
      }
    });
  }
}
