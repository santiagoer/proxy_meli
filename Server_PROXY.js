var utilidades = require('./Utilidades.js');
var http = require('http');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const shortid = require('shortid') ;   

//----------- MongoDB -------------------------------
var MongoClient = require('mongodb').MongoClient;
var url_mongo = "mongodb://localhost:27017/";
//---------------------------------------------------

if (cluster.isMaster) {
  f_generarHilos();
} else if(cluster.isWorker) {
  console.log('Se creo hilo');
  http.createServer(f_atiende_peticion).listen(8081);
}

//artillery quick --count 10 -n 1 http://localhost:8081/

function f_generarHilos(){
   for (let i = 0; i < numCPUs; i++) {
    console.log('Forking process number:: ' + i);
    cluster.fork();
  }
}
/*--------------- Funcion para administrar cada solicitud ----------------------- */
function onRequest(client_req, client_res) {
/*
  console.log('serve: ' + client_req.url);
  console.log('method: ' + client_req.method);
  console.log('headers: ' + client_req.headers);
*/
  var v_id_sol = shortid.generate()+shortid.generate();// ID propio de longitud 14
  //console.log("shortid::" + v_id_sol);
  var v_log = { id_solicitud   : v_id_sol,
                ip_origen      : client_req.connection.remoteAddress, 
                path_destino   : client_req.url,
		estado	       : 'INI',
		fecha_solicitud: new Date() };
  
  f_insertar_log(MongoClient, url_mongo, v_log);
  //utilidades.sleep(10000);
  var options = {
    hostname: '127.0.0.1',//'www.google.com',
    port: 8090,
    path: client_req.url,
    method: client_req.method,
    headers: client_req.headers
  };
  
  var proxy = http.request(options, function (res) {
    client_res.writeHead(res.statusCode, res.headers)
    res.pipe(client_res, { end: true });

    v_log = { id_solicitud   : v_id_sol,
              ip_origen      : client_req.connection.remoteAddress, 
              path_destino   : client_req.url,
	      estado	     : 'FIN',
	      fecha_solicitud: new Date() };
  
    f_insertar_log(MongoClient, url_mongo, v_log);

  });
  
  client_req.pipe(proxy, { end: true });
  
  proxy.on('error', function(err) {
    // Log de error
    var v_log_error = { id_solicitud   : v_id_sol,
                        ip_origen      : client_req.connection.remoteAddress, 
		        path_destino   : client_req.url,
			estado	       : 'ERR',
			fecha_solicitud: new Date(),
		        inf_adicional  : err };

    f_insertar_log(MongoClient, url_mongo, v_log_error);
    client_res.statusCode = 400;
    client_res.end();
    console.log(err);
  });
}
/*----------------------------------------------------------------------------------------*/
/*------------------ Funcion para insertar logs ------------------------------------------*/
function f_insertar_log(p_MongoClient, 
                        p_url_mongo, 
			p_datos_log){

p_MongoClient.connect(p_url_mongo,{ useNewUrlParser: true } , function(error , db) {
	if (error){ throw error; }

	var dbase = db.db('dbproxy');

  	dbase.collection('log_proxy').insertOne(p_datos_log, function(err, res) {
    	       if (err) throw err;
    	       //console.log("1 document inserted");
  	    });   
	db.close();
	});

}
/*----------------------------------------------------------------------------------------*/
function f_atiende_peticion(p_request, p_response){

var v_options = {
  host: '127.0.0.1',
  port: 8085,
  path: '/valida_peticion',
  method: 'GET',
  json: true
};

v_options.path = v_options.path + '/'+ p_request.connection.remoteAddress + p_request.url;

//console.log('ruta::'+v_options.path);
http.request(v_options, function(res) {

   res.setEncoding('utf8');
   var body = '';
   res.on('data', function(chunk) {
     body += chunk;
   });

   res.on('end', function () {
     //console.log('BODY: ' + body);
     if(JSON.parse(body).respuesta == "ACEPTAR"){
        onRequest(p_request, p_response);
     }else{
        p_response.statusCode = 400;
        p_response.write("PETICION RECHAZADA");
        p_response.end();
     }
   });

}).end();

}
/*----------------------------------------------------------------------------------------*/
