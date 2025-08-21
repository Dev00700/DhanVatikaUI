import { Component } from '@angular/core';
import { NavbarComponent } from "../shared/navbar/navbar.component";
import { FooterComponent } from "../shared/footer/footer.component";

@Component({
  selector: 'app-user-registration-list',
  imports: [NavbarComponent, FooterComponent],
  templateUrl: './user-registration-list.component.html',
  styleUrl: './user-registration-list.component.css'
})
export class UserRegistrationListComponent {

}
