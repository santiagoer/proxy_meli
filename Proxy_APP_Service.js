var express = require('express');  
var http = require('http');
var fs = require('fs');
var html_parte_arriba;
var html_parte_abajo;

var app = express();

/*-- Cargo partes de la pagina --*/
f_cargar_partes_html();

/*---------- Definimos ROUTING ----------------------------*/
app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.route('/log/proxy')
   .get(function(req, res){
      f_printPage(res);
      //res.json(datosLog);
   });
/*---------------------------------------------------------*/

//----------------- Iniciamos la App
app.listen(8080);
console.log('APP Proxy Service iniciada!');

//------------------------------------------------------------------------//



/*------- Dibuja la pagina con los datos de log del proxy ----------------*/
/*-- Solo agrega las filas con los datos --*/
function f_printPage(p_response){

var v_filas_html = '';

var v_options = {
  host: '127.0.0.1',
  port: 8085,
  path: '/log_proxy',
  method: 'GET',
  json: true,
};
//v_options.body = { myDato : 'hoele'};
http.request(v_options, function(res) {

   var body = '';
   res.setEncoding('utf8');
   res.on('data', function(chunk) {
     body += chunk;
   });
   res.on('end', function () {
   //console.log('BODY: ' + cuerpo);
   var array_log = JSON.parse(body);
   for(var i = 0; i < array_log.length; i++){
      //console.log(array_log[i]);
      v_filas_html = v_filas_html + 
        '<tr class="">' +
        '<td class="">'+array_log[i].id_solicitud+'</td>' +
	'<td class="">'+array_log[i].ip_origen+'</td>' +
	'<td class="">'+array_log[i].path_destino+'</td>' +
	'<td class="">'+array_log[i].estado+'</td>' +
	'<td class="">'+array_log[i].fecha_solicitud+'</td>' +
	'<td class="">'+JSON.stringify(array_log[i].inf_adicional)+'</td>' +
        '</tr>';
   }
   p_response.end(html_parte_arriba + v_filas_html + html_parte_abajo);


  });
}).end();

}
/*-------------------------------------------------------------------------------*/
/*-------- Carga la parte superior e inferior de la pagina ----------------------*/
function f_cargar_partes_html(){

	fs.readFile('./parte_arriba.html',null, function (err, html) {
	    if (err) {
		throw err; 
	    }
	   html_parte_arriba = html;
	});
	fs.readFile('./parte_abajo.html',null, function (err, html) {
	    if (err) {
		throw err; 
	    }
	   html_parte_abajo = html;
	});

}
/*-------------------------------------------------------------------------------*/
