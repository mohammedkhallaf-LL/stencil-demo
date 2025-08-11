export interface FormElement {
  id: string;
  label: string;
  type: string;
}

export interface Submission {
  id: number;
  // Add all the other properties from the PHP submission_entry array
  lead_name: string;
  lead_email: string;
  lead_company: string;
  rating_html: string;
  score: number | null;
  passing_status: 'Passed' | 'Not Passed' | '';
  submit_date: string;
  element_values: { [key: string]: any };
  permissions: {
    can_delete: boolean;
    can_edit: boolean;
    can_preview: boolean;
    can_sync_connectors: boolean;
    can_resubmit_transcription: boolean;
  };
}

export interface ApiResponse {
  totalCount: number;
  posStart: number;
  formElements: FormElement[];
  submissions: Submission[];
}
