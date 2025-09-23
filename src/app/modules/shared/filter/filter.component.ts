import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter',
  imports: [CommonModule, FormsModule],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.css'
})
export class FilterComponent {
  @Input() yearList: { value: number, text: string }[] = [];
  @Input() monthList: { value: string, text: string }[] = [];
  @Input() statusList: { value: string, text: string }[] = [];

  // layout = "bar" (default) or "sidebar"
  @Input() layout: 'bar' | 'sidebar' = 'bar';

  filters = {
    year: 0,
    month: '',
    status: '',
    search: ''
  };

  @Output() filtersChanged = new EventEmitter<any>();

  applyFilters() {
    this.filtersChanged.emit({ ...this.filters });
  }

  resetFilters() {
    this.filters = { year: 0, month: '', status: '', search: '' };
    this.applyFilters();
  }

  removeFilter(key: string) {
    (this.filters as any)[key] = '';
    if (key === 'year') this.filters.year = 0;
    this.applyFilters();
  }
}
