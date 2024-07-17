import 'dotenv/config'

const __dirname = import.meta.dirname;


import express from "express";
import { createServer} from 'http';
import { Server } from 'socket.io';
import fetch from 'node-fetch';
import { parseStringPromise } from 'xml2js';
import multer from 'multer';
import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});



import mysql from 'mysql2/promise';
const apiKey = process.env.APiKeyopenweather;

var Clima = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Santiago&appid=${apiKey}&units=metric&lang=es`);
var ClimaCL = await Clima.json();

var CMF={Dolar:947,
  EUR:1016,
  UF:37575
};


import pkg from 'transbank-sdk';
const { WebpayPlus, Options, Environment } = pkg;


const app = express();
const server = createServer(app);
const io = new Server(server);

const port = process.env.PUERTO;


WebpayPlus.configureForTesting();

const poolFerremax = mysql.createPool({
  host: '127.0.0.1',
  user: process.env.DB_User,
  password: process.env.DB_Pass,
  database: 'ferremax',
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0
});


async function getCMFData(apiKey2=process.env.APikeyCMF) {
  const urls = {
    dolar: `https://api.cmfchile.cl/api-sbifv3/recursos_api/dolar?apikey=${apiKey2}&formato=xml`,
    uf: `https://api.cmfchile.cl/api-sbifv3/recursos_api/uf?apikey=${apiKey2}&formato=xml`,
    euro: `https://api.cmfchile.cl/api-sbifv3/recursos_api/euro?apikey=${apiKey2}&formato=xml`
  };

  try {
    const [dolarResponse, ufResponse, euroResponse] = await Promise.all([
      fetch(urls.dolar),
      fetch(urls.uf),
      fetch(urls.euro)
    ]);

    const [dolarText, ufText, euroText] = await Promise.all([
      dolarResponse.text(),
      ufResponse.text(),
      euroResponse.text()
    ]);

    const [dolarJson, ufJson, euroJson] = await Promise.all([
      parseStringPromise(dolarText),
      parseStringPromise(ufText),
      parseStringPromise(euroText)
    ]);

    const dolarValue = parseFloat(dolarJson.IndicadoresFinancieros.Dolares[0].Dolar[0].Valor[0].replace(',', '.'));
    const ufValue = parseFloat(ufJson.IndicadoresFinancieros.UFs[0].UF[0].Valor[0].replace('.', '').replace(',', '.'));
    const euroValue = parseFloat(euroJson.IndicadoresFinancieros.Euros[0].Euro[0].Valor[0].replace(',', '.'));

    return {
      Dolar: dolarValue,
      UF: ufValue,
      EUR: euroValue
    };

  } catch (error) {
    console.error('Error fetching CMF data:', error);
    return {
      Dolar:947,
      EUR:1016,
      UF:37575
    };
  }
}





app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


app.set('view engine', 'ejs');
app.set('views', './viewsejs');


app.get('/',async (req, res) => {
    res.render('views/index.ejs', { weather: ClimaCL });
});

app.get('/productos',async (req, res) => {
    res.render('views/productos.ejs', { weather: ClimaCL });
});
app.get('/bodeguero',async (req, res) => {
    res.render('views/bodeguero.ejs', { weather: ClimaCL });
});
app.get('/login',async (req, res) => {
    res.render('views/login.ejs', { weather: ClimaCL });
});

app.get('/dashboard',async (req, res) => {
  try{
    let [results] = await poolFerremax.query('SELECT * FROM tipo_producto;');
    res.render('views/dashboard.ejs', { weather: ClimaCL, tipos: results });

  }catch(err){
    console.log(err)
  }
    
});
app.get('/orden',async (req, res) => {
    res.render('views/orden.ejs', { weather: ClimaCL });
});

app.get('/ttt',async(req,res)=>{
  res.status(200).json({
    "status": "OK",
    "response": {
        "basket": {
            "EnableCheckout": true,
            "cartStatus": [
                {
                    "status": "OK",
                    "code": "",
                    "message": "OK"
                }
            ],
            "productLineItems": [
                {
                    "productLineItemID": "JBLBAR1000PROBLKAM",
                    "productLineItemName": "JBL BAR 1000",
                    "productLineItemQuantity": 1,
                    "productLineItemRegularPrice": 1199990,
                    "productLineItemSellPrice": 1099990,
                    "productLineItemTotal": 109999,
                    "productLineItemTax": 0,
                    "productLineItemIsBonus": false,
                    "bundledProducts": [],
                    "variations": {
                        "color": "Black"
                    },
                    "uuid": "9411c16916900aeeeb3b53bee0",
                    "parentLineItemUUID": null,
                    "productLineItemGiftWrapOption": false,
                    "productLineItemGiftWrapQuantity": null,
                    "productLineItemGiftWrapUnitPrice": null,
                    "productLineItemGiftWrapCost": "0.0",
                    "productLineItemwithoutGiftwrapTotal": 109999,
                    "isCustomProduct": false,
                    "wareHouseLocation": null,
                    "shipmentId": null,
                    "shipmentLength": 1,
                    "prop_65_disclaimer": false,
                    "productLineItemColor": "Black",
                    "productLineItemSize": null,
                    "productLineItemWidth": null,
                    "productLineItemImage": "",
                    "productLimitAddlMessage": "",
                    "inStock": true,
                    "productLineItemInventoryType": "",
                    "productLineItemMessage": "",
                    "productLineItemInventoryAddlMessage": "",
                    "productLineItemDiscount": 989991
                }
            ],
            "customerEmail": "ethant.leiva@gmail.com",
            "customerName": null,
            "customerNumber": null,
            "showGiftMessage": false,
            "giftMessage": null,
            "giftMessageFlag": false,
            "variations": [],
            "checkSpecialPromotion": false,
            "couponApplied": "BIENVENIDOJBL",
            "couponRemoved": "",
            "removeCouponEvent": null,
            "addCouponEvent": "true"
        },
        "orderSummary": {
            "subTotal": 1099990,
            "shippingTotal": 0,
            "orderDiscountTotal": 989991,
            "shippingDiscount": 0,
            "orderTotal": 109999,
            "customOrder": false,
            "mcfOrder": false,
            "showGiftMessage": false,
            "isSparePart": false,
            "taxTotal": 0,
            "promotionCallouts": [],
            "priceAdjustments": [
                {
                    "callout": "",
                    "basedOnCoupon": true,
                    "priceValue": -989991,
                    "promotionID": "BIENVENIDOJBL",
                    "couponCode": "BIENVENIDOJBL"
                }
            ],
            "couponCodes": {
                "BIENVENIDOJBL": ""
            },
            "wareHouseType": "01",
            "giftMessage": null,
            "giftMessageFlag": false,
            "subVatTotal": 0,
            "weee": 0,
            "giftwrap": 0,
            "gst": 0,
            "pst": 0,
            "hst": 0,
            "fee": 0,
            "qst": 0,
            "codTax": 0,
            "approachingDiscounts": "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\t\t\t\n\t\n\n\t\n\t\n\t\n\t\n\t\n",
            "productDiscount": -989991
        },
        "shippingMethods": {
            "list": []
        },
        "InstallmentsOptions": {
            "success": true,
            "options": [
                {
                    "value": 1,
                    "amount": 109999
                },
                {
                    "value": 2,
                    "amount": 54999.5
                },
                {
                    "value": 3,
                    "amount": 36666.33
                },
                {
                    "value": 4,
                    "amount": 27499.75
                },
                {
                    "value": 5,
                    "amount": 21999.8
                },
                {
                    "value": 6,
                    "amount": 18333.17
                }
            ]
        }
    }
}
);
});

app.get('/api/productos/', async (req, res) => {
  try {
    let query = 'SELECT * FROM productos_vista';
    let params = [];

    if (req.query.ID) {
      query += ' WHERE ID = ?';
      params.push(req.query.ID);
    } else if (req.query.Nombre) {
      query += ' WHERE Nombre = ?';
      params.push(req.query.Nombre);
    } else if (req.query.Tipo) {
      query += ' WHERE Tipo = ?';
      params.push(req.query.Tipo);
    }

    var [result] = await poolFerremax.query(query, params);

    // Convertir la imagen a base64
    result = result.map(producto => {
      if (producto.Img && Buffer.isBuffer(producto.Img)) {
        producto.Img = producto.Img.toString('base64');
      }
      return producto;
    });

    result = result.map(producto => ({ ...producto, CMF }));
    res.send(result);

  } catch (err) {
    res.send({ "error": "Error interno" });
  }
});


app.get('/api/ordenes/', async (req, res) => {
  try {
    let query = 'SELECT * FROM Boletas';
    let params = [];

    if (req.query.Orden) {
      query += ' WHERE Numero_Orden = ?';
      params.push(req.query.Orden);
    } 
    

    var [result] = await poolFerremax.query(query, params);

    
   res.send(result);

  } catch (err) {
    res.send({ "error": "Error interno" });
  }
});

app.post('/api/estadoOrden', async (req, res) => {
  try {
    const { numeroOrden, nuevoEstado } = req.body;
    const query = 'UPDATE Boletas SET Aceptado = ? WHERE Numero_Orden = ?';
    const [result] = await poolFerremax.query(query, [nuevoEstado, numeroOrden]);

    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: 'Error interno' });
  }
});



app.post('/contacto/info', async (req, res) => {
  const { name, email, subject, message } = req.body;

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER, 
    subject: subject || 'Contacto desde el formulario',
    text: `Nombre: ${name}\nCorreo Electrónico: ${email}\nMensaje: ${message}`
  };

  try {
    await transporter.sendMail(mailOptions);

  } catch (error) {
    console.error('Error al enviar el correo:', error);
    res.status(500).json({ error: 'Error al enviar el correo' });
  }
});

app.get('/api/tipos/', async(req,res)=>{
  try{
    let queryTipos = 'SELECT * FROM tipo_producto';
    const [tipos] = await poolFerremax.query(queryTipos);

    res.json(tipos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los tipos de productos' });
  }
});

app.post('/api/crearProducto', upload.single('Img'), async (req, res) => {
  try {
    const { Nombre, tipoInput, Precio, Cantidad, Peso, Color, Garantia, Modelo } = req.body;
    const Img = req.file ? req.file.buffer : null;

    const query = `
      INSERT INTO productos (Nombre,ID_Tipo,Precio,Cantidad,Peso,Color,Garantia,Modelo,Img) VALUES (?,?,?,?,?,?,?,?,?);`;

    await poolFerremax.query(query, [Nombre, tipoInput, Precio, Cantidad, Peso, Color, Garantia, Modelo, Img]);

    res.status(200).json({ message: 'Producto creado exitosamente' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error al crear el producto' });
  }
});


app.post('/api/agregarOrden', async (req, res) => {
  try {
    const { numeroOrden, items, precios, cantidades, fechaActual, fechaDespacho, total, totaldespacho } = req.body;

    // Verificar si ya existe una orden con el mismo número de orden
    const checkQuery = 'SELECT COUNT(*) AS count FROM Boletas WHERE Numero_Orden = ?';
    const [rows] = await poolFerremax.query(checkQuery, [numeroOrden]);

    if (rows[0].count > 0) {
      return res.status(400).json({ error: 'Número de orden ya existe' });
    }

    // Insertar nueva orden si no existe
    const insertQuery = `
      INSERT INTO Boletas (Numero_Orden, Items, Precios, Cantidades, Fecha_Actual, Fecha_Despacho, Total, Total_Despacho)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;

    await poolFerremax.query(insertQuery, [
      numeroOrden,
      items,
      precios,
      cantidades,
      fechaActual,
      fechaDespacho,
      total,
      totaldespacho
    ]);

    res.status(200).json({ message: 'Orden guardada exitosamente en la base de datos' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error al guardar la orden en la base de datos' });
  }
});

app.get('/orden/:numeroOrden', async (req, res) => {
  const { numeroOrden } = req.params;

  try {
    const query = 'SELECT * FROM Boletas WHERE Numero_Orden = ?';
    const [rows] = await poolFerremax.query(query, [numeroOrden]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    const orden = rows[0];
    orden.Items = JSON.parse(orden.Items);
    orden.Precios = JSON.parse(orden.Precios);
    orden.Cantidades = JSON.parse(orden.Cantidades);

    res.render('views/seguimiento.ejs', { orden });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error al obtener la orden de la base de datos' });
  }
});








app.post('/api/actualizarProducto', upload.single('Img'), async (req, res) => {
  try {
    const { ID, Nombre, ID_Tipo, Precio, Cantidad, Peso, Color, Garantia, Modelo } = req.body;
    const Img = req.file ? req.file.buffer : null;

    let query = `
      UPDATE productos
      SET 
        Nombre = ?, 
        ID_Tipo = ?, 
        Precio = ?, 
        Cantidad = ?, 
        Peso = ?, 
        Color = ?, 
        Garantia = ?, 
        Modelo = ?
      WHERE ID = ?`;

    const params = [Nombre, ID_Tipo, Precio, Cantidad, Peso, Color, Garantia, Modelo, ID];

    if (Img) {
      const paramsImg = [Nombre, ID_Tipo, Precio, Cantidad, Peso, Color, Garantia, Modelo, Img, ID];
      query = `
        UPDATE productos
        SET 
          Nombre = ?, 
          ID_Tipo = ?, 
          Precio = ?, 
          Cantidad = ?, 
          Peso = ?, 
          Color = ?, 
          Garantia = ?, 
          Modelo = ?,
          Img = ?
        WHERE ID = ?`;
        await poolFerremax.query(query, paramsImg);
        res.status(200).json({ message: 'Producto actualizado exitosamente' });
        return


    }

    await poolFerremax.query(query, params);

    res.status(200).json({ message: 'Producto actualizado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});

app.post('/api/eliminarProducto/', async (req, res) => {
  try {
    const { ID } = req.body;

    if (!ID) {
      return res.status(400).json({ message: 'ID del producto es requerido' });
    }

    const query = `DELETE FROM productos WHERE ID = ?`;

    await poolFerremax.query(query, [ID]);
    res.status(200).json({ message: 'Producto eliminado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

app.get('/api/obtenerCMF/',async(req,res)=>{
  try{
    res.send(CMF);

  }catch (err){
    res.send({"error":"Error interno"});
  }
});
app.get('/api/obtenerClima/',async(req,res)=>{
  try{
    res.send(ClimaCL);

  }catch (err){
    res.send({"error":"Error interno"});
  }
});

app.get('/api/suscriptions/',async(req,res)=>{
  try{

    var [result] = await poolFerremax.query('SELECT * FROM usuario');
    res.send(result);
  }catch (err){
    res.send({"error":"Error interno"});
  }
});

app.post('/api/suscriptions/',async(req,res)=>{
  try{
    const usuario = req.body;
    if(!usuario.correo){
      res.status(404).send({"error":"missing parametrer"});
      return;
    }
    var [result] = await poolFerremax.query('INSERT INTO `suscriptions` (`ID`, `correo`) VALUES (NULL, ?);',[usuario.correo]);
    res.send({"Correcto":"Agregado correctamente"});
  }catch (err){
    if(err.errno===1062){    
      res.status(404).send({"error":"Correo ya registrado!"});
      return;
    }
    res.status(404).send({"error":err.message});
  }
});


app.get('/pagarwebpay', async (req, res) => {
  const total = req.query.total;

  if (!total) {
    return res.status(400).send('Total no proporcionado');
  }

  const producto = 'Taladro';
  const cantidad = 1;

  const buyOrder = `O-${Math.floor(Math.random() * 10000)}`;
  const sessionId = `S-${Math.floor(Math.random() * 10000)}`;
  const returnUrl = `https://ferremax.tecbit.cl/return`;
  const amount = total; // Utilizar el total pasado en la URL

  try {
    const createResponse = await (new WebpayPlus.Transaction()).create(
      buyOrder,
      sessionId,
      amount,
      returnUrl
    );

    const { token } = createResponse;
    const { url } = createResponse;

    res.render('views/orden.ejs', { url, token , weather: ClimaCL });
  } catch (error) {
    console.error('Error al crear la transacción:', error);
    res.status(500).send('Error al crear la transacción');
  }
});


app.get('/return', async (req, res) => {
  const { token_ws } = req.query;

  try {
    const commitResponse = await (new WebpayPlus.Transaction()).commit(token_ws);
    res.render('views/returnPositivo.ejs', { commitResponse , weather: ClimaCL });
  } catch (error) {
     
    console.error('Error al confirmar la transacción:', error);

    res.status(500).render('views/return.ejs', { error: 'Error al confirmar la transacción', weather: ClimaCL });
  }
});

setInterval(async function(){
  Clima = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Santiago&appid=${apiKey}&units=metric&lang=es`);
  ClimaCL = await Clima.json();
  console.log(ClimaCL);
}, 60000*30);


setInterval(async function(){
  ///Desactivado bloqueados por muchas peticiones
  ///CMF=await getCMFData();
}, 60000*30);

server.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});