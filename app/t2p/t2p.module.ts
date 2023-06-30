import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';

import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepperModule } from '@angular/material/stepper';
import { TextFieldModule } from '@angular/cdk/text-field';
import { T2PComponent } from './t2p.component';
import { MatSelectModule } from '@angular/material/select';
import { SpinnerService } from './t2p.SpinnerService';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [T2PComponent],
  exports: [T2PComponent],
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
    MatSelectModule,
    SpinnerService,
    MatSnackBarModule,
    MatSnackBar,
  ],
  providers: [
    {
      provide: { MAT_FORM_FIELD_DEFAULT_OPTIONS },
      multi: true,
      useValue: { appearance: 'outline' },
    },
  ],

  bootstrap: [T2PComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class T2PModule {}
