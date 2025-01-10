import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AuthGuard } from './auth.guard';
import { TableUploadComponent } from './table-upload/table-upload.component';
import { FileUploadComponent } from './file-upload/file-upload.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: "table-upload", component:TableUploadComponent, canActivate: [AuthGuard] },
  { path: 'file-upload', component: FileUploadComponent, canActivate: [AuthGuard]},
  { path: 'register', component: RegisterComponent },
  {path:'forgot-password',component:ForgotPasswordComponent},
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: "login",component:LoginComponent}
  // Add other routes as necessary
];


