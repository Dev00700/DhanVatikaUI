import { Component } from '@angular/core';
import { PlotResponseDto } from '../../models/plot.model';
import { ApiService } from '../../services/api.service';
import { Router, RouterModule } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { plotservice } from '../../services/plot.service';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../shared/pagination/pagination.component';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  selector: 'app-plot',
  imports: [CommonModule, NavbarComponent, RouterModule, FormsModule, PaginationComponent, FooterComponent],
  templateUrl: './plot.component.html',
  styleUrl: './plot.component.css'
})
export class PlotComponent {
  fullpageloader: boolean = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 5;
  plotlist: PlotResponseDto[] = [];
  filters = {
    plotName: null,
  };
  constructor(
    private apiService: ApiService,
    private router: Router,
    private toast: ToastService,
    private plotdata: plotservice,
  ) { }
  ngOnInit() {
    this.getplotslist();
  }

  getplotslist() {
    this.fullpageloader = true;
    const UserId = parseInt(localStorage.getItem("userId") || '0', 10);
    const Data = null;
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
}
