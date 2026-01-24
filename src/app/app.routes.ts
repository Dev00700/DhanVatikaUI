import { Routes } from '@angular/router';
import { LoginComponent } from './modules/login/login.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { UserRegistrationComponent } from './modules/user-registration/user-registration.component';
import { AuthGuard } from './services/auth.guard';
import { UserRegistrationListComponent } from './modules/user-registration-list/user-registration-list.component';
import { UserMenuListComponent } from './modules/user-menu-list/user-menu-list.component';
import { CreateIncomingPaymentComponent } from './modules/create-incoming-payment/create-incoming-payment.component';
import { IncomingPaymentComponent } from './modules/incoming-payment/incoming-payment.component';
import { OutgoingPaymentComponent } from './modules/outgoing-payment/outgoing-payment.component';
import { CreateOutgoingPaymentComponent } from './modules/create-outgoing-payment/create-outgoing-payment.component';
import { CreatePlotComponent } from './modules/create-plot/create-plot.component';
import { PlotComponent } from './modules/plot/plot.component';
import { CreatePlotBookingComponent } from './modules/create-plot-booking/create-plot-booking.component';
import { LocationComponent } from './modules/location/location.component';
import { CreateLocationComponent } from './modules/create-location/create-location.component';
import { EnquiryComponent } from './modules/enquiry/enquiry.component';
import { CustomerListComponent } from './modules/customer-list/customer-list.component';
import { CustomerInstallmentsComponent } from './modules/customer-installments/customer-installments.component';
import { PlotBookingComponent } from './modules/plot-booking/plot-booking.component';
import { PlotBookingDetailsComponent } from './modules/plot-booking-details/plot-booking-details.component';
import { CreateCustomerComponent } from './modules/create-customer/create-customer.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'user-assignmenu-list', component: UserMenuListComponent, canActivate: [AuthGuard] },
    { path: 'user-registration', component: UserRegistrationComponent, canActivate: [AuthGuard] },
    { path: 'user-registration-list', component: UserRegistrationListComponent, canActivate: [AuthGuard] },
    { path: 'create-incoming-payment', component: CreateIncomingPaymentComponent, canActivate: [AuthGuard] },
    { path: 'incoming-payment', component: IncomingPaymentComponent, canActivate: [AuthGuard] },
    { path: 'create-incoming-payment/:iPaymentGuid', component: CreateIncomingPaymentComponent, canActivate: [AuthGuard] },
    { path: 'user-registration/:userGuid', component: UserRegistrationComponent, canActivate: [AuthGuard] },
    { path: 'outgoing-payment', component: OutgoingPaymentComponent, canActivate: [AuthGuard] },
    { path: 'create-outgoing-payment', component: CreateOutgoingPaymentComponent, canActivate: [AuthGuard] },
    { path: 'create-outgoing-payment/:oPaymentGuid', component: CreateOutgoingPaymentComponent, canActivate: [AuthGuard] },
    { path: 'create-plot', component: CreatePlotComponent, canActivate: [AuthGuard] },
    { path: 'plot', component: PlotComponent, canActivate: [AuthGuard] },
    { path: 'create-plot/:plotGuid', component: CreatePlotComponent, canActivate: [AuthGuard] },
    { path: 'create-plot-booking', component: CreatePlotBookingComponent, canActivate: [AuthGuard] },
    { path: 'create-plot-booking/:plotbookingGuid', component: CreatePlotBookingComponent, canActivate: [AuthGuard] },
    { path: 'location', component: LocationComponent, canActivate: [AuthGuard] },
    { path: 'create-location', component: CreateLocationComponent, canActivate: [AuthGuard] },
    { path: 'create-location/:locationGuid', component: CreateLocationComponent, canActivate: [AuthGuard] },
    { path: 'enquiry', component: EnquiryComponent, canActivate: [AuthGuard] },
    { path: 'customer-list', component: CustomerListComponent, canActivate: [AuthGuard] },
    { path: 'customer-installments', component: CustomerInstallmentsComponent, canActivate: [AuthGuard] },
    { path: 'plot-booking', component: PlotBookingComponent, canActivate: [AuthGuard] },
    { path: 'plot-booking-details', component: PlotBookingDetailsComponent, canActivate: [AuthGuard] },
    { path: 'create-customer', component: CreateCustomerComponent, canActivate: [AuthGuard] },
    { path: 'create-customer/:customerGuid', component: CreateCustomerComponent, canActivate: [AuthGuard] },
];
