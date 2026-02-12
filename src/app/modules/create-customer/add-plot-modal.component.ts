import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-plot-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h5 class="modal-title">Select Plot</h5>
          <button type="button" class="btn-close" (click)="closeModal()"></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="plotSelect" class="form-label">Choose Plot</label>
            
            <div class="custom-dropdown">
              <input 
                type="text"
                class="form-control dropdown-input"
                placeholder="Search or select..."
                [(ngModel)]="searchText"
                (input)="filterPlots()"
                (focus)="openDropdown()"
                (blur)="closeDropdownDelay()"
                name="plotSearch"
              />
              
              <div class="dropdown-list" *ngIf="isDropdownOpen">
                <div 
                  *ngFor="let plot of filteredPlots"
                  class="dropdown-item"
                  [class.active]="selectedPlot ===(plot.value)"
                  (mousedown)="selectFromDropdown(plot)"
                >
                  {{ plot.text }}
                </div>
                <div *ngIf="filteredPlots.length === 0" class="dropdown-empty">
                  No plots found
                </div>
              </div>
            </div>
           
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="closeModal()">
            Cancel
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            (click)="addPlot()"
            [disabled]="!selectedPlot"
          >
            Add Plot
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .modal-content {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      min-width: 400px;
      max-width: 500px;
    }
    
    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .modal-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6c757d;
    }
    
    .modal-body {
      padding: 1.5rem;
    }

    .custom-dropdown {
      position: relative;
    }

    .dropdown-input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 1rem;
    }

    .dropdown-input:focus {
      outline: none;
      border-color: #0d6efd;
      box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    }

    .dropdown-list {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #ced4da;
      border-top: none;
      border-radius: 0 0 4px 4px;
      max-height: 250px;
      overflow-y: auto;
      z-index: 1001;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .dropdown-item {
      padding: 0.75rem;
      cursor: pointer;
      border-bottom: 1px solid #f0f0f0;
      transition: background-color 0.2s ease;
    }

    .dropdown-item:last-child {
      border-bottom: none;
    }

    .dropdown-item:hover {
      background-color: #f8f9fa;
    }

    .dropdown-item.active {
      background-color: #0d6efd;
      color: white;
    }

    .dropdown-empty {
      padding: 1rem;
      text-align: center;
      color: #666;
    }
    
    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e9ecef;
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
  `]
})
export class AddPlotModalComponent {
  @Input() isOpen = false;
  @Input() availablePlots: any[] = [];
  @Input() selectedPlots: any[] = [];
  @Output() plotAdded = new EventEmitter<any>();
  @Output() modalClosed = new EventEmitter<void>();

  selectedPlot: string = '';
  searchText: string = '';
  filteredPlots: any[] = [];
  isDropdownOpen = false;
  closeDropdownTimeout: any;

  ngOnInit() {
    this.filteredPlots = this.availablePlots;
  }

  ngOnChanges() {
    if (this.isOpen) {
      this.filteredPlots = this.availablePlots;
      this.searchText = '';
      this.selectedPlot = '';
      this.isDropdownOpen = false;
    }
  }

  openDropdown() {
    this.isDropdownOpen = true;
    if (this.closeDropdownTimeout) {
      clearTimeout(this.closeDropdownTimeout);
    }
  }

  closeDropdownDelay() {
    this.closeDropdownTimeout = setTimeout(() => {
      this.isDropdownOpen = false;
    }, 200);
  }

  filterPlots() {
    if (!this.searchText.trim()) {
      this.filteredPlots = this.availablePlots;
    } else {
      const searchLower = this.searchText.toLowerCase();
      this.filteredPlots = this.availablePlots.filter(plot => {
        const textLower = String(plot.text).toLowerCase();
        const valueLower = String(plot.value).toLowerCase();
        return textLower.includes(searchLower) || valueLower.includes(searchLower);
      });
    }
  }

  selectFromDropdown(plot: any) {
    this.selectedPlot = String(plot.value);
    this.searchText = plot.text;
    // Close dropdown immediately without delay
    this.isDropdownOpen = false;
    // Clear the timeout if it exists
    if (this.closeDropdownTimeout) {
      clearTimeout(this.closeDropdownTimeout);
    }
  }

  addPlot() {
    if (this.selectedPlot) {
      const plot = this.availablePlots.find(p => String(p.value) === String(this.selectedPlot));
      if (plot) {
        // Extract plot code and sub plot code from text if available
        // Example: "PLOT-97-SubPlot-1"


        const plotWithBookingFlag = {
          plotId: plot.value,
          plotCode: plot.text,
          bookingFlag: 0
        };
        this.plotAdded.emit(plotWithBookingFlag);
        this.selectedPlot = '';
        this.closeModal();
      }
    }
  }

  closeModal() {
    this.selectedPlot = '';
    this.searchText = '';
    this.filteredPlots = this.availablePlots;
    this.isDropdownOpen = false;
    if (this.closeDropdownTimeout) {
      clearTimeout(this.closeDropdownTimeout);
    }
    this.modalClosed.emit();
  }
}
