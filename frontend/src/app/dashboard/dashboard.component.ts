import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  username: string | null = null;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  // Fetch user profile data
  fetchUserProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.http
      .get<any>('http://localhost:5000/api/v1/auth/profile', {
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
      })
      .subscribe(
        (response) => {
          this.username = response.data.user.username;
        },
        (error) => {
          this.error = 'Failed to fetch profile data.';
        }
      );
  }

  // On Component Initialization
  ngOnInit() {
    this.fetchUserProfile();  // Fetch user profile when the component loads
  }

  // Handle logout
  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
