import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';  // Import FormBuilder, FormGroup, and Validators
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  imports:[ReactiveFormsModule, CommonModule], // Updated to use SCSS
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;  // Declare the form group
  message: string = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    // Initialize the form group with controls and validations
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]  // Add email validation
    });
  }

  onForgotPasswordSubmit() {
    if (this.forgotPasswordForm.valid) {
      const emailData = { email: this.forgotPasswordForm.value.email };

      this.http.post('http://localhost:5000/api/v1/auth/forgot-password', emailData).subscribe({
        next: (response: any) => {
          console.log('Email exists for password reset', response);
          this.message = response.message;  // Show the success message
          localStorage.setItem('email', this.forgotPasswordForm.value.email);
          // Redirect to reset password page after email validation
          this.router.navigate(['/reset-password']);
        },
        error: (err) => {
          console.error('Error checking email:', err);
          this.message = 'No email found. Register now';
        }
      });
    }
  }
}
