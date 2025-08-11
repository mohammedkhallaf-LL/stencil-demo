import { Component, State, h, Method } from '@stencil/core';
import { ApiResponse, Submission, FormElement } from './types';

@Component({
  tag: 'll-form-submits-data',
  styleUrl: 'll-form-submits-data.css',
  shadow: true,
})
export class LlFormSubmitsData {
  @State() private submissions: Submission[] = [];
  @State() private formElements: FormElement[] = [];
  @State() private totalCount: number = 0;
  @State() private isLoading: boolean = true;
  @State() private errorMessage: string | null = null;

  /**
   * Public method to load data from an external source (our PHP page).
   * This replaces the internal fetchData logic.
   * @param data The complete dataset for the grid.
   */
  @Method()
  async loadData(data: ApiResponse) {
    if (!data) {
      this.errorMessage = 'No data was provided to the component.';
      this.isLoading = false;
      return;
    }

    try {
      this.submissions = data.submissions || [];
      this.formElements = data.formElements || [];
      this.totalCount = data.totalCount || 0;
      this.isLoading = false;
    } catch (error) {
      this.errorMessage = `Error processing provided data: ${error.message}`;
      this.isLoading = false;
      console.error(error);
    }
  }

  private renderActions(sub: Submission) {
    // In a real app, you would dispatch events or navigate
    const handleDelete = () => alert(`Request to delete submission ${sub.id}`);
    const handleEdit = () => alert(`Request to edit submission`);

    return (
      <div class="actions-menu">
        <button class="actions-button" title="Actions">
          ⋮
        </button>
        <ul class="actions-dropdown">
          {sub.permissions.can_delete && <li onClick={handleDelete}>Delete</li>}
          {sub.permissions.can_edit && <li onClick={handleEdit}>Edit</li>}
          {/* Add other action list items based on permissions */}
        </ul>
      </div>
    );
  }

  render() {
    if (this.isLoading) {
      return <div class="loader">Waiting for data from page...</div>;
    }

    if (this.errorMessage) {
      return <div class="error-message">{this.errorMessage}</div>;
    }

    return (
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>{/* Actions */}</th>
              <th>Lead</th>
              <th>Rating</th>
              <th>Score</th>
              <th>Status</th>
              <th>Email</th>
              <th>Company</th>
              <th>Submit Date</th>
              {/* Dynamically render headers for each form element */}
              {this.formElements.map(el => (
                <th key={el.id}>{el.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {this.submissions.length > 0 ? (
              this.submissions.map(sub => (
                <tr key={sub.id}>
                  <td>{this.renderActions(sub)}</td>
                  <td innerHTML={sub.lead_name}></td>
                  <td innerHTML={sub.rating_html}></td>
                  <td>{sub.score}</td>
                  <td>{sub.passing_status}</td>
                  <td innerHTML={sub.lead_email}></td>
                  <td>{sub.lead_company}</td>
                  <td>{sub.submit_date}</td>
                  {/* Dynamically render cells for each form element */}
                  {this.formElements.map(el => (
                    <td key={`${sub.id}-${el.id}`} innerHTML={sub.element_values[el.id]}></td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8 + this.formElements.length} class="no-data">
                  No submissions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div class="footer">
          Displaying {this.submissions.length} of {this.totalCount} records.
        </div>
      </div>
    );
  }
}
