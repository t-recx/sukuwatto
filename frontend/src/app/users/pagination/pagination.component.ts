import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Paginated } from '../paginated';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnInit, OnChanges {
  @Input() paginatedRecords: Paginated<any>;
  @Input() currentPage: number;
  @Input() link: any;
  @Output() navigateToPage = new EventEmitter<number>();

  faArrowLeft = faArrowLeft;
  faArrowRight = faArrowRight;

  previousPage: number;
  nextPage: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  
  constructor(
  ) { }

  ngOnInit() {
  }

  getHasPreviousPage(): boolean {
    if (this.paginatedRecords && this.paginatedRecords.previous) {
      return true;
    }

    return false;
  }
  
  getHasNextPage(): boolean {
    if (this.paginatedRecords && this.paginatedRecords.next) {
      return true;
    }

    return false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.hasPreviousPage = this.getHasPreviousPage();
    this.hasNextPage = this.getHasNextPage();
    this.previousPage = this.currentPage - 1;
    this.nextPage = this.currentPage + 1;
  }

  goToPreviousPage() {
    if (this.hasPreviousPage) {
      this.navigateToPage.emit(this.previousPage);
    }
  }

  goToNextPage() {
    if (this.hasNextPage) {
      this.navigateToPage.emit(this.nextPage);
    }
  }

  goToPage(page) {
    if (page > 0) {
      this.navigateToPage.emit(page);
    }
  }
}
