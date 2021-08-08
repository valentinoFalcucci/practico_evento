const {Fecha} = require('../modelos/fecha'); 
const {Evento} = require('../modelos/evento');
const express = require('express');
const router = express.Router();


////// RETORNAS LAS DIFERENTES FECHAS CON EL EVENTO CORRESPONDIENTE
///El LISTADO ESTA ORDENADO POR FECHA DESCENDENTE
/// SOLO MUESTRA LAS FECHAS NO VENCIDAS
router.get(`/`, async (req, res) =>{
    const fechaLista = await Fecha.find({fechaDate:{ $gt:Date.now() }}).populate('evento').sort({fechaDate:-1}).select('-fechaDate');//ordena los eventos por fecha
 
    if(!fechaLista) {
        res.status(500).json({mensaje:'NO EXISTEN FECHAS VIGENTES'})
    } 
    res.status(200).send(fechaLista);
})



///// BUSCAR UNA FECHA RELACIONADA A UN EVENTO EN PARTICULAR
router.get('/:id', async(req,res)=>{
    const fecha = await Fecha.findById(req.params.id);

    if(!fecha) {
        res.status(500).json({mensaje: 'NO SE ENCONTRO LA FECHA CON ESE ID'})
    } 
    res.status(200).send(fecha);
})


/// RETORNA LA FECHA EN STRING
function retornarFecha(fechaEvento){

    let fecha=fechaEvento.split(' ')[0];
        let dia=fecha.split('/')[0];
        let mes=fecha.split('/')[1];
         
    
        let horario=fechaEvento.split(' ')[1];
        let hora=horario.split(':')[0];
        let minutos=horario.split(':')[1];
         
        let mensaje='';
        let salida=[];
        switch(mes)
        {
          case '01':  mensaje='ENERO';break;
          case '02':  mensaje='FEBRERO';break;
          case '03':  mensaje='MARZO';break;
          case '04':  mensaje='ABRIL';break;
          case '05':  mensaje='MAYO';break;
          case '06':  mensaje='JUNIO';break;
          case '07':  mensaje='JULIO';break;
          case '08':  mensaje='AGOSTO';break;
          case '09':  mensaje='SEPTIEMBRE';break;
          case '10':  mensaje='OCTUBRE';break;
          case '11':  mensaje='NOVIEMBRE';break;
          case '12':  mensaje='DICIEMBRE';break;
          default:  mensaje='NO ENCONTRADO';break;
        }

        salida[0]=dia;//dia
        salida[1]=mensaje;//mes
        salida[2]=`${hora}:${minutos}`;//mes
        return salida;
}


/////// RETORNA EL MENSAJE PARA COMPARTIR POR TWITTER
router.get('/mensaje/:id', async(req,res)=>{
    const fecha = await Fecha.findById(req.params.id);
    const evento=await Evento.findById(fecha.evento);
    if(!fecha) {
        res.status(500).json({mensaje: 'NO SE ENCONTRO LA FECHA CON ESE ID'})
    } 

    if(!evento) {
        res.status(500).json({mensaje: 'NO SE ENCONTRO EL EVENTO CON ESE ID'})
    } 

    let salida=retornarFecha(fecha.fecha);
    let mensaje=`IRE AL EVENTO ${evento.titulo}@ ${salida[0]} ${salida[1]} ${salida[2]} `; 
    res.status(200).send(mensaje);
})


 
//// PERMITE INGRESAR UNA FECHA

router.post('/', async (req,res)=>{
    let fecha=req.body.fecha.split(' ')[0];
    let dia=fecha.split('/')[0];
    let mes=fecha.split('/')[1];
    let anio=fecha.split('/')[2];


    let horario=req.body.fecha.split(' ')[1];
    let hora=horario.split(':')[0];
    let minutos=horario.split(':')[1];
    let segundos=horario.split(':')[2];

    console.log(dia +' '+mes+' '+anio);
    console.log(hora +' '+minutos+' '+segundos);

    let fechaDate=new Date(anio,mes,dia,hora,minutos,segundos)
 
    console.log(fechaDate);


      fecha = new Fecha({
        fecha: req.body.fecha,
        fechaDate: fechaDate,
        precio: req.body.precio  
    })
    fecha = await fecha.save();

    if(!fecha)
    return res.status(400).send('LA FECHA NO PUDO SER CREADA')

    res.send(fecha);
 
})

 
//RETORNA UN LISTADO DE LAS FECHAS CON los Eventos destacados
router.get('/get/destacado', async (req, res) => { 
    const eventosDestacados = await Fecha.find({fechaDate:{ $gt:Date.now()}}).populate('evento').sort({fechaDate:-1}).select('-fechaDate');//ordena los eventos por fecha
  
    if (!eventosDestacados) {
        res.status(500).json({ mensaje:'NO HAY EVENTOS DESTACADOS'});
    }
    res.send(eventosDestacados);
});


 

module.exports =router;