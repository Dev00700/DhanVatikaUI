import { Routes } from '@angular/router';
import { LoginComponent } from './modules/login/login.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { UserRegistrationComponent } from './modules/user-registration/user-registration.component';
import { AuthGuard } from './services/auth.guard';
import { UserRegistrationListComponent } from './modules/user-registration-list/user-registration-list.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent,canActivate: [AuthGuard]  },
    { path: 'user-registration',component: UserRegistrationComponent,canActivate: [AuthGuard]  },
    { path: 'user-registration-list',component: UserRegistrationListComponent,canActivate: [AuthGuard]  },
];
