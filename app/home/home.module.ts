import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';

import {MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule} from '@angular/material/form-field';
import {MatTabsModule} from '@angular/material/tabs';
import {MatStepperModule} from '@angular/material/stepper';
import {TextFieldModule} from '@angular/cdk/text-field';
import { HomeComponent } from './home.component';
import { T2PComponent } from '../t2p/t2p.component';
import { T2PModule} from '../t2p/t2p.module';
import { P2tComponent } from '../p2t/p2t.component';


 @NgModule({
  declarations: [
    HomeComponent
  ],
  
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatStepperModule,
    TextFieldModule,
    T2PComponent,
    T2PModule,
    P2tComponent
  
  ],
  providers: [{provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'}}],

  bootstrap: [HomeComponent]
})
export class HomeModule { }
