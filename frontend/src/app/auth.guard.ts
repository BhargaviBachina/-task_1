import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';  // Corrected import
import { isPlatformBrowser } from '@angular/common';  // Import for checking the platform

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    // Check if the code is running in the browser
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');

      if (!token) {
        this.router.navigate(['/login']);
        return false;
      }

      try {
        const decodedToken: any = jwtDecode(token);  
        const currentTime = Math.floor(Date.now() / 1000);  

        // If token is expired, redirect to login page
        if (decodedToken.exp < currentTime) {
          localStorage.removeItem("token");
          this.router.navigate(['/login']);
          return false;
        }

        return true;  // Token is valid
      } catch (error) {
        this.router.navigate(['/login']);
        return false;
      }
    } else {
      // If running on the server, return false or handle SSR-specific logic
      return false;
    }
  }
}
