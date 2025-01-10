import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';  // Add this import statement

@Component({
  selector: 'app-table-upload',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './table-upload.component.html',
  styleUrls: ['./table-upload.component.scss'],
})
export class TableUploadComponent implements OnInit {
  records: any[] = [];
  file: File | null = null;
  error: string | null = null;
  successMessage: string | null = null; 
  currentPage: number = 1;
  totalPages: number = 1;
  totalRecords: number = 0;
  sessionId: string | null = null;
  columns: string[] = [];
  fileUploadForm: FormGroup;
  searchField: string = '';
  searchValue: string = '';

  constructor(private http: HttpClient, private fb: FormBuilder, private router: Router) {
    this.fileUploadForm = this.fb.group({
      file: [null, Validators.required],
    });
  }

  // Method to fetch records with pagination and filtering
  fetchRecords(page: number = this.currentPage) {
    const token = localStorage.getItem('token');
    const sessionId = localStorage.getItem("sessionId");
    if (!token) {
      return;
    }

    page = page && page > 0 ? page : 1;

    let url = `http://localhost:5000/api/v1/records/records?page=${page}&perPage=10`;

    if (sessionId) {
      url += `&sessionId=${sessionId}`;
    }

    if (this.searchField && this.searchValue) {
      url += `&searchField=${this.searchField}&searchValue=${this.searchValue}`;
    }

    this.http
      .get<any>(url, {
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
      })
      .subscribe(
        (response) => {
          this.records = response.data.records;
          this.currentPage = response.data.currentPage;
          this.totalPages = response.data.totalPages;
          this.totalRecords = response.data.totalRecords;
          this.columns = response.data.validFields;  // Dynamically update valid fields
        },
        (error) => {
          this.error = 'Failed to fetch records.';
        }
      );
  }

  // Handle file upload
  handleFileUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.fileUploadForm.patchValue({ file });
  }

  // Submit the file to the backend
  uploadFile() {
    const token = localStorage.getItem('token');
    if (!token || !this.fileUploadForm.valid) return;

    const formData = new FormData();
    formData.append('file', this.fileUploadForm.get('file')?.value);

    this.http
      .post<any>('http://localhost:5000/api/v1/records/upload-csv', formData, {
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
      })
      .subscribe(
        (response) => {
          localStorage.setItem('sessionId', response.data.sessionId);
          this.sessionId = response.data.sessionId;
          this.fetchRecords();  // Fetch records after uploading the file
          this.successMessage = 'File uploaded successfully!';
          setTimeout(() => this.successMessage = '', 3000);  // Clear the success message after 3 seconds
        },
        (error) => {
          this.error = 'Failed to upload file.';
        }
      );
  }

  // Handle pagination change
  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.fetchRecords(page);
    }
  }

  // Handle search query changes
  onSearchChange() {
    this.currentPage = 1;
    this.fetchRecords();  // Fetch filtered records
  }

  // On Component Initialization
  ngOnInit() {
    this.fetchRecords();  // Fetch records when the component loads
  }

  logout() {
    // Clear the token and sessionId from localStorage
    localStorage.removeItem('token'); 
    // Optionally redirect the user to a login page after logout
    this.router.navigate(['/login']);  // Adjust the route as per your application
  }

}
