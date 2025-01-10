import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';  // Import Router for navigation
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Reactive Form imports
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  // Define gender options
  genderOptions: string[] = ['Male', 'Female'];

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    // Initializing the reactive form with validation rules
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      gender: ['', [Validators.required, Validators.pattern(/^(Male|Female)$/)]],  // Gender validation
      dob: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';

    // Ensure passwords match
    if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    // Remove confirmPassword from the registration data
    const { confirmPassword, ...registrationData } = this.registerForm.value;

    this.isLoading = true;

    // Send registration data to the backend
    this.http.post('http://localhost:5000/api/v1/auth/register', registrationData).subscribe({
      next: () => {
        this.successMessage = 'Registration successful. Redirecting to login page...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('Registration error:', err);
        this.errorMessage = 'Failed to register. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
