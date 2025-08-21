import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AutoLogoutService } from './services/autologout.service';

declare function layout_change(arg: string): void;
declare function layout_theme_sidebar_change(arg: string): void;
declare function change_box_container(arg: string): void;
declare function layout_caption_change(arg: string): void;
declare function layout_rtl_change(arg: string): void;
declare function preset_change(arg: string): void;
declare function main_layout_change(arg: string): void;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})




export class AppComponent implements OnInit {
  title = 'DHANVATIKA';

  constructor(private autoLogoutService: AutoLogoutService) {}

  ngOnInit() {
    layout_change("false");
    layout_theme_sidebar_change("dark");
    change_box_container("false");
    layout_caption_change("true");
    layout_rtl_change("false");
    preset_change("preset-1");
    main_layout_change("vertical");
  }
}