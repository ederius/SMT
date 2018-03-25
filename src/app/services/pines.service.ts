import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireObject, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { Pin } from "../components/collecciones/Pin";
import * as _ from "lodash";
import * as moment from "moment";
import 'moment/locale/es-us';
moment.locale('es');

@Injectable()
export class PinesService {

  pines: Observable<any>; 
  
  constructor(private db: AngularFireDatabase) {  }

 generarPin(cc:any){
     cc = parseInt(cc);
     return cc.toString( 36 );
  }

  guardarPin(campos){
    campos.creado = moment().format(); //obteniendo fecha y hora actual  
    this.db.database.ref(`pines/${campos.pin}`).set(campos);
  }

  obtenerPines(){
    return this.db.database.ref('pines').once('value').then(function(data){
      return _.map(data.val());
    });
  }

  listarPines(){
    return this.db.list('pines').valueChanges()
  }

  actualizarEstado(pin, estado){
    return this.db.database.ref(`pines/${pin}`).update({estado:estado}).then(function(data){
      return data;
    }).catch((error)=>{
      return error
    });
  }
  
  

}
