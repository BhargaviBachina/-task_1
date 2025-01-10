
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-upload',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent implements OnInit {
  fileToUpload: File | null = null;
  uploadedFiles: any[] = [];
  successMessage: string | null = null;
  error: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.fetchUploadedFiles();
  }

  // Fetch the list of uploaded files from the server
  fetchUploadedFiles() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);  // Redirect to login if token is missing
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>('http://localhost:5000/api/v1/files', { headers }).subscribe(
      (response) => {
        this.uploadedFiles = response.files;
      },
      (error) => {
        this.error = 'Failed to fetch files.';
      }
    );
  }

  // Handle file selection
  onFileSelect(event: any) {
    this.fileToUpload = event.target.files[0];
  }

  // Upload the selected file to S3
  uploadFile() {
    if (!this.fileToUpload) {
      this.error = 'Please select a file to upload.';
      return;
    }

    const formData = new FormData();
    formData.append('file', this.fileToUpload);

    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);  // Redirect to login if token is missing
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post<any>('http://localhost:5000/api/v1/files/upload', formData, { headers }).subscribe(
      (response) => {
        this.successMessage = 'File uploaded successfully.';
        this.fetchUploadedFiles(); // Refresh the list of uploaded files
      },
      (error) => {
        this.error = 'Failed to upload the file.';
      }
    );
  }

  // Delete a file from S3
  deleteFile(fileId: string) {
    if (confirm('Are you sure you want to delete this file?')) {
      const token = localStorage.getItem('token');
      if (!token) {
        this.router.navigate(['/login']);  // Redirect to login if token is missing
        return;
      }

      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.delete<any>(`http://localhost:5000/api/v1/files/${fileId}`, { headers }).subscribe(
        (response) => {
          this.successMessage = 'File deleted successfully.';
          this.fetchUploadedFiles(); // Refresh the list of uploaded files
        },
        (error) => {
          this.error = 'Failed to delete the file.';
        }
      );
    }
  }
}
