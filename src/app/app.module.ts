import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

//ng2-charts
import { ChartsModule } from 'ng2-charts';

import { AppComponent } from './app.component';
import { ConfigPainelComponent } from './config-painel/config-painel.component';
import { SliderModule } from 'primeng/slider';
import {ChartModule} from 'primeng/chart';
import {TableModule} from 'primeng/table';
import {AccordionModule} from 'primeng/accordion';
import {RadioButtonModule} from 'primeng/radiobutton';
import {CheckboxModule} from 'primeng/checkbox';
import { GameBoardComponent } from './game-board/game-board.component';



@NgModule({
  declarations: [
    AppComponent,
    ConfigPainelComponent,
    GameBoardComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    SliderModule,
    BrowserAnimationsModule,
    ChartModule,
    TableModule,
    AccordionModule,
    RadioButtonModule,
    CheckboxModule,
    ChartsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
