import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators,ReactiveFormsModule} from '@angular/forms';  // Reactive Forms
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;  // Flag to show loading state

  constructor(private http: HttpClient, private router: Router, private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],  // Add validation for email
      password: ['', [Validators.required]]  // Add validation for password
    });
  }

  onLoginSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;  // Set loading state to true
    const loginData = this.loginForm.value;
    console.log('Login data:', loginData);

    this.http.post('http://localhost:5000/api/v1/auth/login', loginData).subscribe({
      next: (response: any) => {
        console.log('Login successful:', response);
        // Save token to localStorage or sessionStorage
        localStorage.setItem('token', response.data.token);
        // Redirect to the dashboard after a successful login
        setTimeout(() => {
          this.isLoading = false;  // Set loading state to false
          this.router.navigate(['/dashboard']);  // Redirect
        }, 1000);  // Optional: Add delay for smoother UX
      },
      error: (err) => {
        console.error('Login error:', err);
        this.errorMessage = 'Invalid login credentials.';
        this.isLoading = false;  // Set loading state to false on error
      }
    });
  }
}
