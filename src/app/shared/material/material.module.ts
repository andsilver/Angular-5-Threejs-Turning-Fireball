import { NgModule } from '@angular/core';

import {
    MatDialogModule,
    MatButtonModule

 } from '@angular/material';

@NgModule({
  imports: [
    MatDialogModule,
    MatButtonModule
  ],
  exports : [
      MatDialogModule,
      MatButtonModule
  ],
  declarations: []
})
export class MaterialModule { }
