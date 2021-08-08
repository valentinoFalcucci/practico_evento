const {Evento} = require('../modelos/evento');
const {Fecha} = require('../modelos/fecha');
const express = require('express');
const router = express.Router(); 
const multer = require('multer');
const path = require('path');




const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var filetypes = /jpeg|jpg|png/; 
        var extname = filetypes.test(path.extname(file.originalname).toLowerCase());  
        let uploadError = new Error('invalid image type');

        if (extname) {
            uploadError = null;
          }

        
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        var filetypes = /jpeg|jpg/; 
        var extension = path.extname(file.originalname).toLowerCase(); 

        const fileName = file.originalname.split(' ').join('-');  
        cb(null,`${fileName}-${Date.now()}.${extension}`);
    } 
});

 

const subirImagen = multer({ storage: storage });



// RETORNA TODOS LOS EVENTOS mostrando las fecha de cada uno
router.get(`/`, async (req, res) =>{
  
    const eventoListado = await Evento.find().populate('fechas','precio');
 
    if(!eventoListado) {
        res.status(500).json({mensaje:'NO EXISTEN EVENTOS VIGENTES'})
    } 
    res.status(200).send(eventoListado);
})


/// RETORNA UN EVENTO ESPECIFICO
// como paràmetro paso el ID
router.get('/:id', async(req,res)=>{
    const evento = await Evento.findById(req.params.id);

    if(!evento) {
        res.status(500).json({mensaje: 'NO SE ENCONTRO LA PERSONA CON ESE ID'})
    } 
    res.status(200).send(evento);
})

 
////// GENERA UN NUEVO EVENTO

router.post('/', subirImagen.single('imagen'), async (req,res)=>{

    const file = req.file;
    if (!file) return res.status(400).send('DEBE INSERTAR UNA IMAGEN');
    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    const listadoFechasId = Promise.all(req.body.fechas.map(async (elemento) =>{ 

        let fecha=elemento.fecha.split(' ')[0];
        let dia=fecha.split('/')[0];
        let mes=fecha.split('/')[1];
        let anio=fecha.split('/')[2];
    
    
        let horario=elemento.fecha.split(' ')[1];
        let hora=horario.split(':')[0];
        let minutos=horario.split(':')[1];
        let segundos=horario.split(':')[2];
    
        console.log(dia +' '+mes+' '+anio);
        console.log(hora +' '+minutos+' '+segundos);
    
        let fechaDate=new Date(anio,mes,dia,hora,minutos,segundos)
    
        // Genera un objeto fecha por cada item del listado de fechas
             let fechaObjNuevo = new Fecha({
                fecha: elemento.fecha,
                fechaDate: fechaDate,
                precio: elemento.precio
            })
    
             fechaNuevo = await fechaObjNuevo.save();
    
            return fechaNuevo._id;
       

        })).catch(error=>res.send(error))

        const listadoFechasIdNuevo =  await listadoFechasId; 
      

        //Genera el evento con el listado de fechas
        let evento = new Evento({
            titulo: req.body.titulo,
            descripcion: req.body.descripcion,
            destacado: req.body.destacado,
            imagen: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232"  
            fechas:listadoFechasIdNuevo  
        })
       
        evento = await evento.save(); 
   
        if(!evento)
        return res.status(400).send('LA PERSONA NO PUDO SER CREADA') 

        console.log('PERSONA',evento);

        ///Por cada fecha nueva generada
        //busca la fecha y la relaciona con el evento creado 

       const  listadoEventoId = Promise.all(listadoFechasIdNuevo.map(async (elemento) =>{ 
           console.log('fecha id',elemento._id);
           console.log('evento id',evento._id); 
            let nuevo=await Fecha.findById(elemento._id);
            nuevo.evento=evento._id;
            console.log('fecha nuevo',nuevo);
           await Fecha.findByIdAndUpdate(nuevo._id,nuevo);
        })).catch(error=>res.send(error))

        const listadoEventoIdNuevo =  await listadoEventoId; 

    res.send(evento);
})
 



//// ACTUALIZA UN EVENTO DETERMINADO

router.put('/:id',subirImagen.single('imagen'),async (req, res)=> {

    const file = req.file; 
    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    
    const evento = await Evento.findById(req.params.id);
    console.log(evento);

    const listadoFechasId = Promise.all(req.body.fechas.map(async (elemento) =>{ 

        let fecha=elemento.fecha.split(' ')[0];
        let dia=fecha.split('/')[0];
        let mes=fecha.split('/')[1];
        let anio=fecha.split('/')[2];
    
    
        let horario=elemento.fecha.split(' ')[1];
        let hora=horario.split(':')[0];
        let minutos=horario.split(':')[1];
        let segundos=horario.split(':')[2];
    
        console.log(dia +' '+mes+' '+anio);
        console.log(hora +' '+minutos+' '+segundos);
    
        let fechaDate=new Date(anio,mes,dia,hora,minutos,segundos)
    
             let fechaObjNuevo = new Fecha({
                fecha: elemento.fecha,
                fechaDate: fechaDate,
                precio: elemento.precio
            })
    
             fechaNuevo = await fechaObjNuevo.save();
    
            return fechaNuevo._id;
       

        })).catch(error=>res.send(error))

        const listadoFechasIdNuevo =  await listadoFechasId; 

        // Si elevento tiene fechas relacionadas 
        //borra esas fechas y actualiza con las nuevas
        if(listadoFechasIdNuevo)
        {

            Evento.findById(req.params.id).then(async evento =>{
                if(evento) {
                    await evento.fechas.map(async fecha => {
                        await Fecha.findByIdAndRemove(fecha)
                    })
                    return res.status(200).json({mensaje:'EVENTO MODIFICADO'})
                } else {
                    return res.status(404).json({mensaje: "EVENTO NO ENCONTRADA"})
                }
            }).catch(err=>{
               return res.status(500).json({error: err}) 
            })
        }

    const eventoNuevo={
        _id:evento._id, 
        titulo: req.body.titulo||evento.titulo,
        descripcion: req.body.descripcion||evento.descripcion,
        destacado: req.body.destacado||evento.destacado,
        imagen: `${basePath}${fileName}`||evento.imagen,  
        fechas:listadoFechasIdNuevo||evento.fechas  
      
    }
   
     ///Por cada fecha nueva generada
        //busca la fecha y la relaciona con el evento creado 

        const  listadoEventoId = Promise.all(listadoFechasIdNuevo.map(async (elemento) =>{ 
            console.log('fecha id',elemento._id);
            console.log('evento id',evento._id); 
             let nuevo=await Fecha.findById(elemento._id);
             nuevo.evento=evento._id;
             console.log('fecha nuevo',nuevo);
            await Fecha.findByIdAndUpdate(nuevo._id,nuevo);
         })).catch(error=>res.send(error))
 
         const listadoEventoIdNuevo =  await listadoEventoId; 
     
 // Actualiza el evento
  const eventoEditada=await Evento.findByIdAndUpdate( req.params.id,eventoNuevo,{ new: true });
    console.log(eventoEditada); 
    if(!eventoEditada)
    return res.status(400).send('EVENTO  NO PUDO SER ACTUALIZADO')

    res.send(eventoEditada);
})



/// ELIMINA EL EVENTO
//busca las fechas relacionadas a ese evento y las elimina
 
router.delete('/:id', (req, res)=>{
    Evento.findByIdAndRemove(req.params.id).then(async evento =>{
        if(evento) {
            await evento.fechas.map(async fecha => {
                await Fecha.findByIdAndRemove(fecha)
            })
            return res.status(200).json({mensaje:'EVENTO ELIMINADO'})
        } else {
            return res.status(404).json({mensaje: "EVENTO NO ENCONTRADO"})
        }
    }).catch(err=>{
       return res.status(500).json({error: err}) 
    })
})



/// RETORNA LA CANTIDAD DE EVENTOS
router.get(`/get/cantidad`, async (req, res) => {
    const eventoCantidad = await Evento.countDocuments((cantidad) => cantidad);

    if (!eventoCantidad) {
        res.status(500).json({mensaje:'NO HAY EVENTOS CARGADOS'});
    }
    res.send({
        cantidad: eventoCantidad
    });
});


/// RETORNA SOLO LOS EVENTOS DESTACADOS
router.get(`/get/destacado`, async (req, res) => { 
    const eventosDestacados = await Evento.find({ destacado: true });

    if (!eventosDestacados) {
        res.status(500).json({ mensaje:'NO HAY EVENTOS DESTACADOS'});
    }
    res.send(eventosDestacados);
});


////// RETORNA LA CANTIDAD DE EVENTOS DESTACADOS

router.get(`/get/destacado/:cantidad`, async (req, res) => {
    const cantidad = req.params.cantidad ? req.params.cantidad : 0;
    console.log(cantidad);
    const eventosDestacados = await Evento.find({ destacado: true }).limit(+cantidad);
    console.log(eventosDestacados);
    if (!eventosDestacados) {
        res.status(500).json({ mensaje:'NO HAY EVENTOS DESTACADOS'});
    }
    res.send(eventosDestacados);
});



//////// ACTUALIZA LA GALERIA DE IMAGAENES
router.put('/galeria-imagenes/:id', subirImagen.array('imagenes', 10), async (req, res) => {
 
    const files = req.files;
    let imagenesPath = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if (files) {
        files.map((file) => {
            imagenesPath.push(`${basePath}${file.filename}`);
        });
    }
 
    const evento = await Evento.findByIdAndUpdate(
        req.params.id,
        {
            imagenes: imagenesPath
        },
        { new: true }
    );

    if (!evento) return res.status(500).send('NO POSEE GALERIA DE IMAGENES');

    res.send(evento); 
 
});


//Paginacion
// RETORNA UN LISTADO INSERTANDO EL LIMITE DE ELEMENTOS POR PAGINA
//Y INSERTANDO LA PAGINA ACTUAL
//http://localhost:3000/api/eventos/get/paginacion?limite=5&pagina=2

router.get(`/get/paginacion`, async (req, res) => { 
    const limite=req.query.limite ||10;
    const paginaActual=req.query.pagina ||1;
    const config={
        limit:limite,
        page:paginaActual
    }

    const eventosDestacados = await Evento.paginate({ destacado: true },config);

    if (!eventosDestacados) {
        res.status(500).json({ mensaje:'NO HAY EVENTOS DESTACADOS'});
    }
    res.send(eventosDestacados);
});




module.exports =router;