import { Component, Host, h, Prop, State, Event, EventEmitter } from '@stencil/core';

/**
 * Defines the structure for a single column in the grid.
 */
export interface ColumnDef {
  id: string;
  title: string;
  type?: 'string' | 'html' | 'actions' | 'checkbox';
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select';
  filterOptions?: { value: string; label: string }[];
  hidden?: boolean;
}

/**
 * Defines the payload for row action events.
 */
export interface ActionEventPayload {
  action: string;
  rowData: any;
  rowId: string | number;
}

/**
 * Defines the payload for data request events (sorting, filtering, pagination).
 */
export interface DataRequestPayload {
  page: number;
  sort: { key: string; direction: 'asc' | 'desc' };
  filters: { [key: string]: any };
}

@Component({
  tag: 'reusable-grid',
  styleUrl: 'reusable-grid.css',
  shadow: true,
})
export class ReusableGrid {
  /**
   * An array of column definitions that describe the grid's structure.
   */
  @Prop() columns: ColumnDef[] = [];

  /**
   * An array of data objects to be displayed in the grid.
   * Each object should have keys that match the 'id' in the ColumnDef.
   */
  @Prop() data: any[] = [];

  /**
   * The total number of items available on the server. Used for pagination.
   */
  @Prop() totalItems: number = 0;

  /**
   * The number of items to display per page.
   */
  @Prop() itemsPerPage: number = 25;

  /**
   * The current active page. Can be modified by the component's pagination controls.
   */
  @Prop({ mutable: true, reflect: true }) currentPage: number = 1;

  /**
   * Internal state for the current sorting configuration.
   */
  @State() sortConfig: { key: string; direction: 'asc' | 'desc' } = { key: '', direction: 'asc' };

  /**
   * Internal state for the current filter values.
   */
  @State() filterValues: { [key: string]: any } = {};

  /**
   * Event emitted when data needs to be refetched due to sorting, filtering, or pagination.
   * The parent application should listen for this event to make an API call.
   */
  @Event() dataRequest: EventEmitter<DataRequestPayload>;

  /**
   * Event emitted when a user clicks an action within a row (e.g., 'edit', 'delete').
   */
  @Event() rowAction: EventEmitter<ActionEventPayload>;

  private visibleColumns(): ColumnDef[] {
    return this.columns.filter(col => !col.hidden);
  }

  private handleSort(columnId: string) {
    const newDirection = this.sortConfig.key === columnId && this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
    this.sortConfig = { key: columnId, direction: newDirection };
    this.emitDataRequest();
  }

  private handleFilterChange(columnId: string, value: any) {
    this.filterValues = {
      ...this.filterValues,
      [columnId]: value,
    };
    // Reset to page 1 when filtering
    this.currentPage = 1;
    this.emitDataRequest();
  }

  private handlePageChange(newPage: number) {
    if (newPage > 0 && newPage <= Math.ceil(this.totalItems / this.itemsPerPage)) {
      this.currentPage = newPage;
      this.emitDataRequest();
    }
  }

  private handleActionClick(event: MouseEvent, row: any) {
    const target = event.target as HTMLElement;
    const actionElement = target.closest('[data-action]');
    if (actionElement) {
      const action = actionElement.getAttribute('data-action');
      this.rowAction.emit({
        action: action,
        rowData: row,
        rowId: row.id, // Assuming each row data has an 'id' property
      });
    }
  }

  private emitDataRequest() {
    this.dataRequest.emit({
      page: this.currentPage,
      sort: this.sortConfig,
      filters: this.filterValues,
    });
  }

  private renderHeader() {
    return (
      <thead>
        {/* Row for Column Titles and Sorting */}
        <tr class="title-row">
          {this.visibleColumns().map(col => (
            <th class={col.sortable ? 'sortable' : ''} onClick={() => col.sortable && this.handleSort(col.id)} style={{ textAlign: col.align || 'left' }}>
              {col.title}
              {col.sortable && this.sortConfig.key === col.id && <span class={`sort-icon ${this.sortConfig.direction}`}>&#x25B2;</span>}
            </th>
          ))}
        </tr>
        {/* Row for Filters */}
        <tr class="filter-row">
          {this.visibleColumns().map(col => (
            <th>
              {col.filterable && col.filterType === 'text' && <input type="text" placeholder="Filter..." onInput={(e: any) => this.handleFilterChange(col.id, e.target.value)} />}
              {col.filterable && col.filterType === 'select' && (
                <select onChange={(e: any) => this.handleFilterChange(col.id, e.target.value)}>
                  <option value="">All</option>
                  {col.filterOptions?.map(opt => (
                    <option value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              )}
            </th>
          ))}
        </tr>
      </thead>
    );
  }

  private renderCell(row: any, column: ColumnDef) {
    const cellData = row[column.id];

    // To replicate the original PHP behavior, we allow rendering raw HTML.
    // Ensure that the HTML passed into the `data` prop is properly sanitized on the server.
    if (column.type === 'html' || column.type === 'actions') {
      return <td style={{ textAlign: column.align || 'left' }} innerHTML={cellData} onClick={e => this.handleActionClick(e, row)}></td>;
    }

    return <td style={{ textAlign: column.align || 'left' }}>{cellData}</td>;
  }

  private renderBody() {
    return (
      <tbody>
        {this.data.map(row => (
          <tr key={row.id}>{this.visibleColumns().map(col => this.renderCell(row, col))}</tr>
        ))}
        {this.data.length === 0 && (
          <tr>
            <td colSpan={this.visibleColumns().length} class="no-data-cell">
              No records found.
            </td>
          </tr>
        )}
      </tbody>
    );
  }

  private renderPagination() {
    if (this.totalItems <= this.itemsPerPage) {
      return null;
    }
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);

    return (
      <div class="pagination-wrapper">
        <div class="pagination-info">
          Showing {startItem} - {endItem} of {this.totalItems}
        </div>
        <div class="pagination-controls">
          <button onClick={() => this.handlePageChange(this.currentPage - 1)} disabled={this.currentPage === 1}>
            Previous
          </button>
          <span>
            {' '}
            Page {this.currentPage} of {totalPages}{' '}
          </span>
          <button onClick={() => this.handlePageChange(this.currentPage + 1)} disabled={this.currentPage === totalPages}>
            Next
          </button>
        </div>
      </div>
    );
  }

  render() {
    return (
      <Host>
        <div class="grid-wrapper">
          <table>
            {this.renderHeader()}
            {this.renderBody()}
          </table>
        </div>
        {this.renderPagination()}
      </Host>
    );
  }
}
