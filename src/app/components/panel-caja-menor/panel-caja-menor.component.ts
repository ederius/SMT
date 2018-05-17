import { Component, OnInit } from '@angular/core';
import * as moment from "moment-timezone";
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import * as _ from "lodash";
moment.locale('es');
moment.tz("America/Los_Angeles");
import { Router } from "@angular/router";


//SERVICES
import { CajaMenorService } from "../../services/caja-menor.service";
import { log } from 'util';
import { AutenticacionService } from "../../services/autenticacion.service";


@Component({
  selector: 'app-panel-caja-menor',
  templateUrl: './panel-caja-menor.component.html',
  styleUrls: ['./panel-caja-menor.component.css']
})
export class PanelCajaMenorComponent implements OnInit {

  debe:Number;
  concepto:String;
  fecha:Date;
  haber:Number;
  fechaApertura:Date;
  saldoApertura:any;
  saldoFila:Number;
  saldoTotal:any;
  gastos:Array<any>;
  gastoEditar:String;
  successUpdate:String;
  errorUpdate:String;

  closeResult:any;


  constructor(
    private _cajaMejorServices:CajaMenorService, 
    private modalService: NgbModal,
    private _auth: AutenticacionService,
    private router: Router

  ) { 
    this.listarGastos();
    this.fecha = moment().format('MMMM Do YYYY, h:mm a');      //obteniendo fecha y hora actual  
    this.fechaApertura = moment().format('MMMM Do YYYY, h:mm a');
    this.saldoApertura = 5000000
  }

  ngOnInit() {
  }

  listarGastos(){
    this._cajaMejorServices.obtenerGastos().then((data)=>{
      this.gastos = data;
      this.haber = 0 ;
      this.debe = 0 ;

      var saldoTotal, saldo=0, saldoApertura=parseInt(this.saldoApertura);
      _.forEach(this.gastos, (o, index)=>{
        saldoApertura -= parseInt(o.haber);
        saldoApertura += parseInt(o.debe);
        this.gastos[index].saldo=saldoApertura;
        if(data.length-1 == index){
          saldoTotal = saldoApertura - saldo;
          this.saldoTotal = saldoTotal;                 
        }
      });

    });
  }

  guardarGasto(){ 
    var gasto = {
      fecha:this.fecha,
      concepto:this.concepto,
      debe:this.debe,
      haber:this.haber
    }
    this._cajaMejorServices.guardarGasto(gasto).then((response)=>{
      this.concepto="";
      this.haber=0;
    }).catch(function(error){
      console.error(error);
    });
    this.listarGastos();
  }


  editarGasto(contentEdit, gasto){
    this.gastoEditar = gasto;
    this.modalService.open(contentEdit, {size: 'sm' as 'sm'}).result.then((result) => {
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  ActualizarUnGasto(){
    this._cajaMejorServices.guardarUnGasto(this.gastoEditar).then((response)=>{
      this.listarGastos();    
      this.successUpdate="Se actualizo exitosamente!!"
    }).catch(function(error){
      this.errorUpdate="Upsss... algo a salido mal, intentalo mas tarde!!";
      console.error(error);
    });
  }

  private getDismissReason(reason: any): string {
    this.successUpdate = "";
    this.errorUpdate = "";
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

}
