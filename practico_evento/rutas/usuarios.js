const {Usuario} = require('../modelos/usuario');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.get(`/`, async (req, res) =>{
    const usuarioLista = await Usuario.find()
   
    if(!usuarioLista) {
        res.status(500).json({success: false})
    } 
    res.send(usuarioLista);
})

router.get('/:id', async(req,res)=>{
     const usuario = await Usuario.findById(req.params.id).select('-passwordEncriptado');//todos menos el password 
    if(!usuario) {
        res.status(500).json({mensaje: 'NO SE ENCONTRO EL USUARIO'})
    } 
    res.status(200).send(usuario);
})

 
router.post('/', async (req,res)=>{
    let usuario = new Usuario({
        nombre: req.body.nombre,
        email: req.body.email,
        passwordEncriptado:bcrypt.hashSync(req.body.password, 10),
        telefono: req.body.telefono,
        esAdministrador: req.body.esAdministrador,
        calle: req.body.calle,
        ciudad: req.body.ciudad,
        pais: req.body.pais  

    })
    usuario = await usuario.save();

    if(!usuario)
    return res.status(400).send('EL USUARIO NO PUDO SE CREADO')

    res.send(usuario);
})



router.put('/:id',async (req, res)=> {

    const usuarioExiste = await Usuario.findById(req.params.id); 
    let clave
    if(req.body.password) {
        clave = bcrypt.hashSync(req.body.password, 10)
    } else {
        clave = usuarioExiste.passwordEncriptado;
    }

    const usuario = await Usuario.findByIdAndUpdate(
        req.params.id,
        { 
            nombre: req.body.nombre,
            email: req.body.email,
            passwordEncriptado:clave,
            telefono: req.body.telefono,
            esAdministrador: req.body.esAdministrador,
            calle: req.body.calle,
            ciudad: req.body.ciudad,
            pais: req.body.pais  

        },
        { new: true}
    )

    if(!usuario)
    return res.status(400).send('EL USUARIO NO PUDO SER CREADO')

    res.send(usuario);
})

router.post('/login', async (req,res) => { 
    const usuario = await Usuario.findOne({email: req.body.email})
   // const secret = process.env.secret; 
    const secret = process.env.SECRET;
    if(!usuario) {
        return res.status(400).send('USUARIO NO ENCONTRADO');
    }

    if(usuario && bcrypt.compareSync(req.body.password, usuario.passwordEncriptado)) {
        const token = jwt.sign(
            {
                userId:  usuario.id,
                isAdmin:usuario.esAdministrador
            },
            secret,
            {expiresIn : '1d'}
        )
       
        res.status(200).send({usuario:usuario.email, token: token}) 
    } else {
       res.status(400).send('LA CONTRASEÑA ES INCORRECTA!');
    }

    
})


router.post('/registrar', async (req,res)=>{
    let usuario = new Usuario({ 
        nombre: req.body.nombre,
        email: req.body.email,
        passwordEncriptado:bcrypt.hashSync(req.body.password, 10),
        telefono: req.body.telefono,
        esAdministrador: req.body.esAdministrador,
        calle: req.body.calle,
        ciudad: req.body.ciudad,
        pais: req.body.pais  

    })
    usuario = await usuario.save();

    if(!usuario)
    return res.status(400).send('EL USUARIO NO PUDO CREARSE')

    res.send(usuario);
})


router.delete('/:id', (req, res)=>{
    Usuario.findByIdAndRemove(req.params.id).then(usuario =>{
        if(usuario) {
            return res.status(200).json({mensaje: 'EL USUARIO FUE ELIMINADO'})
        } else {
            return res.status(404).json({mensaje: "NO SE ENCONTRO EL USUARIO"})
        }
    }).catch(err=>{
       return res.status(500).json({error: err}) 
    })
})

router.get(`/get/cantidad`, async (req, res) =>{
    const cantidadUsuario = await Usuario.countDocuments((cantidad) => cantidad)

    if(!cantidadUsuario) {
        res.status(500).json({mensaje:'NO HAY USUARIOS REGISTRADOS'})
    } 
    res.send({
        cantidad: cantidadUsuario
    });
})


module.exports =router;