import { Component, ElementRef, ViewChild } from '@angular/core';
import { p2tHttpService } from '../Services/p2tHttpService';
import { MatStepper } from '@angular/material/stepper';
import * as vis from 'vis';
import { HttpResponse } from '@angular/common/http';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  defer,
  first,
  fromEvent,
  merge,
  mergeMap,
  switchMap,
  takeUntil,
  tap,
  windowWhen,
} from 'rxjs';
import { SpinnerService } from '../utilities/SpinnerService';
import { t2pHttpService } from '../Services/t2pHttpService';
import { ModelDisplayer } from '../utilities/modelDisplayer';

//global variable to store the file content
declare global {
  interface Window {
    fileContent: string;
    dropfileContent: string;
  }
}

@Component({
  selector: 'app-p2t',
  templateUrl: './p2t.component.html',
  styleUrls: ['./p2t.component.css'],
  template: `'
    <p>p2t works!</p>
    '`,
})
export class P2tComponent {
  response: any;
  test: string;
  fileType: string;

  // ViewChild decorator to get a reference to MatStepper
  @ViewChild('stepperRef') stepper!: MatStepper;

  // ViewChild decorator to get a reference to the drop zone element
  @ViewChild('dropZone', { static: true }) dropZone: ElementRef<HTMLDivElement>;

  isFileDropped = false;
  droppedFileName = '';

  // ViewChild decorator to get a reference to the HTML file input element
  @ViewChild('fileInputRef') fileInputRef!: ElementRef<HTMLInputElement>;

  // This method is called when a file is dragged on the drop zone
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  constructor(
    private p2tHttpService: p2tHttpService,
    private t2phttpService: t2pHttpService,
    public spinnerService: SpinnerService
  ) {}

  // This method generates the text based on the selected file type and content.Allows only pnml and bpmn files
  generateText() {
    const paragraph = document.createElement('p');
    if (this.fileType == 'bpmn') {
      ModelDisplayer.displayBPMNModel(window.dropfileContent);
    } else if (this.fileType == 'pnml') {
      //P2tComponent.displayPNMLModel(window.dropfileContent);
      ModelDisplayer.generatePetriNet(window.dropfileContent);
    }
    // check if the file content or dropfile is not empty, then calls the postP2T method and the loading spinner is displayed
    if (
      window.fileContent !== undefined ||
      window.dropfileContent !== undefined
    ) {
      this.spinnerService.show();
      this.p2tHttpService.postP2T(window.dropfileContent);
    } else {
      this.p2tHttpService.displayText('No files uploaded');
    }
    event.preventDefault();
    this.stepper.next();
  }

  // This method is called when files are dropped on the drop zone
  onDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    // check if the files are not empty and the file type is allowed
    if (files && files.length > 0) {
      const allowedExtensions = ['pnml', 'bpmn'];
      const hasAllowedFiles = Array.from(files).some((file) => {
        const fileExtension = file.name
          .substring(file.name.lastIndexOf('.') + 1)
          .toLowerCase();
        return allowedExtensions.includes(fileExtension);
      });
      // if the file type is allowed, then process the dropped files
      if (hasAllowedFiles) {
        this.processDroppedFiles(files);
        this.isFileDropped = true;
        this.droppedFileName = files.item(0)?.name || '';
      } else {
        alert('Please upload only files with .pnml or .bpmn format');
      }
    }
  }
  // Process the dropped files and read their contents
  processDroppedFiles(files: FileList) {
    // read the file content
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e) => {
        window.dropfileContent = reader.result as string;
      };
      reader.readAsText(file);
    }
  }

  // Download the generated text as a txt file
  downloadText() {
    const text = this.p2tHttpService.getText();
    const filename = 'p2t';
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
    );
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  // Trigger the file input to select files
  selectFiles() {
    this.fileInputRef.nativeElement.click();
  }

  // Handle the file selection event
  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    const files = fileInput.files;
    // check if the files are not empty and the file type is allowed
    if (files && files.length > 0) {
      this.processDroppedFiles(files);
      this.isFileDropped = true;
      this.droppedFileName = files[0].name;
      const allowedExtensions = ['pnml', 'bpmn'];
      const hasAllowedFiles = Array.from(files).some((file) => {
        const fileExtension = file.name
          .substring(file.name.lastIndexOf('.') + 1)
          .toLowerCase();
        //check if the file extension is allowed
        if (fileExtension == 'pnml') this.fileType = 'pnml';
        else if (fileExtension == 'bpmn') this.fileType = 'bpmn';
        return allowedExtensions.includes(fileExtension);
      });
      // if the file type is allowed, then process the dropped files
      if (hasAllowedFiles) {
        this.processDroppedFiles(files);
        this.isFileDropped = true;
        this.droppedFileName = files.item(0)?.name || '';
      } else {
        alert('Please upload only files with .pnml or .bpmn format');
      }
    }
  }
}
