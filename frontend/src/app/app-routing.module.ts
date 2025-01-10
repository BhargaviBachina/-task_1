import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component'; 
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AuthGuard } from './auth.guard';
import { TableUploadComponent } from './table-upload/table-upload.component';
import { FileUploadComponent } from './file-upload/file-upload.component';

const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  {path: 'table-upload', component: TableUploadComponent, canActivate: [AuthGuard] },
  { path: 'file-upload', component: FileUploadComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)], 
  exports: [RouterModule]
})
export class AppRoutingModule {}
