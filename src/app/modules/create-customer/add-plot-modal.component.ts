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
            <select 
              id="plotSelect"
              class="form-select" 
              [(ngModel)]="selectedPlot" 
              name="plotSelect"
            >
              <option value="">-- Select a Plot --</option>
              <option *ngFor="let plot of availablePlots" [value]="plot.value">
                {{ plot.text }}
              </option>
            </select>
           
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
    
    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e9ecef;
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }
    
    .form-group {
      margin-bottom: 0;
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

  addPlot() {
    if (this.selectedPlot) {
      const plot = this.availablePlots.find(p => String(p.value) === String(this.selectedPlot));
      if (plot) {
        // Extract plot code and sub plot code from text if available
        // Example: "PLOT-97-SubPlot-1"
        let plotCode = plot.value?.toString() || '';
        let subPlotCode = '';

        // Try to parse from text property
        if (plot.text && plot.text.includes('-')) {
          const parts = plot.text.split('-');
          if (parts.length >= 2) {
            plotCode = parts[0] + '-' + parts[1]; // e.g., "PLOT-97"
            if (parts.length > 2) {
              subPlotCode = parts.slice(2).join('-'); // e.g., "SubPlot-1"
            }
          }
        }

        const plotWithBookingFlag = {
          ...plot,
          plotCode: plotCode,
          subPlotCode: subPlotCode,
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
    this.modalClosed.emit();
  }
}
