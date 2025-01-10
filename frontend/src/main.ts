// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withFetch()),
    provideRouter(routes),  // Set up routing for the app
    importProvidersFrom(FormsModule, CommonModule)  // Provide necessary modules
  ],
}).catch((err) => console.error(err));
