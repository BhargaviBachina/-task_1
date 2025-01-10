import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  imports: [CommonModule, HttpClientModule,ReactiveFormsModule] // Include necessary modules
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;
  message: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    // Initialize form group with validation rules
    this.resetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/
          ),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
    });

    // Prepopulate email if available in localStorage
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
      this.resetPasswordForm.controls['email'].setValue(storedEmail);
    }
  }

  onResetPasswordSubmit() {
    if (this.resetPasswordForm.invalid) {
      return;
    }

    const { email, newPassword, confirmPassword } = this.resetPasswordForm.value;

    // Ensure passwords match
    if (newPassword !== confirmPassword) {
      this.message = 'Passwords do not match.';
      return;
    }

    // Call the backend API to reset the password
    this.http.post('http://localhost:5000/api/v1/auth/reset-password', this.resetPasswordForm.value).subscribe({
      next: (response: any) => {
        this.message = response.message; // Show success message
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err: any) => {
        if (err.error?.message === 'New password cannot be the same as the old password') {
          this.message = 'New password cannot be the same as the old password. Please choose a different password.';
        } else {
          console.error('Error resetting password:', err);
          this.message = 'Error resetting password.';
        }
      },
    });
  }
}
