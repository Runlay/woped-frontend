import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import {catchError, retry} from 'rxjs/operators'
import { throwError } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { SpinnerService } from './SpinnerService';
declare global {
  interface Window {
      text: string;
  }
}

const httpOptions = {
      headers: new HttpHeaders({
      'Accept': 'text/plain, */*',
      'Content-Type':  'text/plain', // We send Text
      }),
      responseType: 'text' as 'json'  // We accept plain text as response.
    };
@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-my-component',
  template: `
    <div>{{ asyncText }}</div>`,
})

export class p2tHttpService {
  private url= 'http://localhost:8080/p2t/generateText' // Specifies the interface through which the text is displayed.
  asyncText: String;

  constructor(
    private http: HttpClient,
    public spinnerService: SpinnerService
    ) {


   }
   getDummy(text: string){
     return this.http.get("https://dummyjson.com/products/1").subscribe(data => console.log(data));
   }

   // This method is used to send the text to the server and to display the response.
   postP2T(text: string){

      return this.http.post<string>(this.url, text, httpOptions)
      .subscribe((response: any) => {
        console.log(response);
        // hides the spinner when the response is received.
        this.spinnerService.hide();
        this.displayText(response);
        this.spinnerService.hide();

      },
      (error: any) => {
        this.spinnerService.hide();
        console.log(error);
        // Error handling User Feedback
        document.getElementById('error-box').style.visibility = 'visible';
        document.getElementById('error-content').innerHTML = this.handleError(error);
        document.getElementById('error-content').style.display = 'block';
      }
      );
   }
// This method is used to remove the html tags from the response.
   formText(text: string):string{
   // this.spinnerService.hide();
    text = text.replace(/<[^>]+>/g, '');
    return text;
  }

  // This method is used to display the response.
   async displayText(response: any){
      try {
        response = this.formText(response);
        window.text = response;
        const paragraph = document.createElement('p');
        const text = document.createTextNode(response);
       // paragraph.appendChild(text);
        const container = document.getElementById('result');
        if(container.firstChild){
          container.firstChild.remove();
        }
        paragraph.appendChild(text);
        container.appendChild(paragraph);
        this.spinnerService.hide();
      } catch (err) {
        console.error('error', err);
        this.spinnerService.hide();
      }
   }
// This method is used to get the text from the server.
   getText():string{
    return window.text
   }
// This method is used to handle the errors.
   private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
      return `Client Error`;
    } else {
      switch (error.status) {
        case 450: {
            return `Text could not be generated`;
        }
        case 451: {
            return `RPST Failure`;
        }
        case 452: {
            return `Modell could not be structured`;
        }
        case 453: {
          return `Text could not be parsed`;
        }
        default: {
            return `Unknown Server Error: ${error.message}`;
        }
    }
    }
  }
}

