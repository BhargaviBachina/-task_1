import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule,ReactiveFormsModule],  
  template: `<router-outlet></router-outlet>`,  
  styleUrls: ['./app.component.scss'],  
})
export class AppComponent {
  title = 'your-app';
}
