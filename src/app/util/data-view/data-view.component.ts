import { Component } from '@angular/core';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-data-view',
  standalone: true,
  imports: [DataViewModule, ButtonModule, TagModule, CommonModule],
  templateUrl: './data-view.component.html',
  styleUrl: './data-view.component.scss'
})
export class DataViewComponent {

  products!: any[];

  constructor() {}

    ngOnInit() {
       
    }


}
