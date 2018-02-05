import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import * as jspdf from "jspdf";
import * as _ from "lodash";


//services
import { PinesService } from "../../services/pines.service";
import { StoreFileService } from "../../services/store-file.service";

@Component({
  selector: 'app-panel-pines-generar',
  templateUrl: './panel-pines-generar.component.html',
  styleUrls: ['./panel-pines-generar.component.css']
})
export class PanelPinesGenerarComponent implements OnInit {

  forma:FormGroup;
  result:string;
  error:string;

  

  constructor(public _pines:PinesService, private _fStore:StoreFileService) {

    this.forma = new FormGroup({
      'cedula': new FormControl('', [Validators.required, Validators.min(11111)]),
      'nombres': new FormControl('', [Validators.required, Validators.minLength(4)]),
      'apellidos': new FormControl('', [Validators.required, Validators.minLength(4)]),
      'telefono': new FormControl('', [Validators.required, Validators.min(111111)])

    })

   }

  ngOnInit() {
  }

  generarPin(){

    //Obteniendo datos del formulario
    let campo = this.forma.value;

    //Validando que la cedula mo este duplicada.
    this._pines.obtenerPines().then(data=>{                                             //Obteniendo pines guardados

      let duplicidad = _.find(data, function (o) { return o.cedula == campo.cedula });  //Buscando cedula en pines guardados
      
      if(duplicidad){
        this.result = null;        
        this.error = "Cedula duplicada!"
      }else{

        //Obteniendo codigo de pin
        let pin     = this._pines.generarPin(String(campo.cedula));                   
        campo.pin   = pin;

        //Estableciendo estado del estudiante (1 iniciado, 2 inscrito, 3 Entrevistas, 4 Admitido, 5 Matriculado )
        campo.estado= 1

        //Guardando pin en base de datos
        this._pines.guardarPin(campo);
    
        //Notificando en la interfaz
        this.error = null;
        this.result = "Se genero exitosamente tu pin";


        this.generarPDF(campo, pin);

        this.forma.reset(); //reseteando formulario

      }

    });


  }


  //genrando PDF descargable con pin
  generarPDF(campo, pin){

      //Generando un nuevo docuento PDF  
      let doc = new jspdf();
        
      //Generando pdf para descarga

      doc.setFontSize(45);
      doc.setFont('times');
      doc.setFontType('bold');
      doc.text(71, 45, ` CÓDIGO`);
      doc.text(80, 60, `    DE`);
      doc.text(57, 75, `INSCRIPCIÓN`);
      

      doc.text(84, 155, ` ${pin}`);

      doc.setFontSize(20);
      doc.setFont('times');
      doc.setFontType('nolmal');    
      doc.text(74, 200, `${campo.nombres.toUpperCase()} ${campo.apellidos.toUpperCase()}`);

      doc.setFontSize(18);
      doc.text(84, 210, `CC: ${campo.cedula}`);

      doc.setFontSize(18);
      doc.text(89, 230, `Instrucciones`);
      doc.text(20, 240, `Se debe ingresar a la pagina http://app.happykids.edu.co/pin/login, luego se 
  inserta el codigo obtenido para validarlo y empezar a diligenciar
                              el formulario de inscripción.`);
      
      doc.addImage(this.logo(), 'JPEG', 90, 255, 30, 30);    

      doc.save(`${campo.nombres} ${campo.apellidos}.pdf`);
  }



  logo(){
    return 'data:image/jpeg;base64,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bnRGI1JsdAAAAAAAAAAAAAAAAEJsZCBVbnRGI1JsdAAAAAAAAAAAAAAAAFJzbHRVbnRGI1B4bEBSAAAAAAAAAAAACnZlY3RvckRhdGFib29sAQAAAABQZ1BzZW51bQAAAABQZ1BzAAAAAFBnUEMAAAAATGVmdFVudEYjUmx0AAAAAAAAAAAAAAAAVG9wIFVudEYjUmx0AAAAAAAAAAAAAAAAU2NsIFVudEYjUHJjQFkAAAAAAAAAAAAQY3JvcFdoZW5QcmludGluZ2Jvb2wAAAAADmNyb3BSZWN0Qm90dG9tbG9uZwAAAAAAAAAMY3JvcFJlY3RMZWZ0bG9uZwAAAAAAAAANY3JvcFJlY3RSaWdodGxvbmcAAAAAAAAAC2Nyb3BSZWN0VG9wbG9uZwAAAAAAOEJJTQPtAAAAAAAQAEgAAAABAAIASAAAAAEAAjhCSU0EJgAAAAAADgAAAAAAAAAAAAA/gAAAOEJJTQQNAAAAAAAEAAAAHjhCSU0EGQAAAAAABAAAAB44QklNA/MAAAAAAAkAAAAAAAAAAAEAOEJJTScQAAAAAAAKAAEAAAAAAAAAAjhCSU0D9QAAAAAASAAvZmYAAQBsZmYABgAAAAAAAQAvZmYAAQChmZoABgAAAAAAAQAyAAAAAQBaAAAABgAAAAAAAQA1AAAAAQAtAAAABgAAAAAAAThCSU0D+AAAAAAAcAAA/////////////////////////////wPoAAAAAP////////////////////////////8D6AAAAAD/////////////////////////////A+gAAAAA/////////////////////////////wPoAAA4QklNBAAAAAAAAAIAADhCSU0EAgAAAAAAAgAAOEJJTQQwAAAAAAABAQA4QklNBC0AAAAAAAYAAQAAAAM4QklNBAgAAAAAABAAAAABAAACQAAAAkAAAAAAOEJJTQQeAAAAAAAEAAAAADhCSU0EGgAAAAADSwAAAAYAAAAAAAAAAAAAAFAAAABQAAAACwBoAGUAYQBkAGUAcgBsAG8AZwBvADIAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAFAAAABQAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAEAAAAAAABudWxsAAAA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UABoAG8AdABvAHMAaABvAHAAIABDAFMANgAAAAEAOEJJTQQGAAAAAAAHAAgBAQABAQD/4Q4AaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxNS0xMi0wMlQxNjozMzo1NC0wNTowMCIgeG1wOk1vZGlmeURhdGU9IjIwMTUtMTItMTBUMTU6Mjc6NDgtMDU6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMTUtMTItMTBUMTU6Mjc6NDgtMDU6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvanBlZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozOTNEMUNCQzc5OUZFNTExQjg1QkE1QUU5NUU5REMyRSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozODNEMUNCQzc5OUZFNTExQjg1QkE1QUU5NUU5REMyRSIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjM4M0QxQ0JDNzk5RkU1MTFCODVCQTVBRTk1RTlEQzJFIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDozODNEMUNCQzc5OUZFNTExQjg1QkE1QUU5NUU5REMyRSIgc3RFdnQ6d2hlbj0iMjAxNS0xMi0wMlQxNjozMzo1NC0wNTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBpbWFnZS9wbmcgdG8gaW1hZ2UvanBlZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MzkzRDFDQkM3OTlGRTUxMUI4NUJBNUFFOTVFOURDMkUiIHN0RXZ0OndoZW49IjIwMTUtMTItMTBUMTU6Mjc6NDgtMDU6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg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'
  }


}
