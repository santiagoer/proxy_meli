var express = require('express');  
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
var url_mongo = "mongodb://localhost:27017/";

var app = express();

app.route('/proxy_config/:ip_origen?/:path_destino?')
   .get(function(req, res){
      f_consulta_config(req, res);
   });

app.route('/log_proxy/:ip_origen?/:path_destino?/:estado?/:contar?')
   .get(function(req, res){
      f_consulta_log(req, res);
   });

app.route('/valida_peticion/:ip_origen?/:path_destino?')
   .get(function(req, res){
      f_aceptar_peticion(req, res);
   });

// Iniciamos la App
app.listen(8085);
console.log("Proxy_REST_Service iniciado!");


/*----------- Funcion de Consulta para obtener datos de la configuracion del proxy -------------------------*/
function f_consulta_config(req, res){

MongoClient.connect(url_mongo, { useNewUrlParser: true }, function(error , db) {
	if (error){ throw error; }

	var dbase = db.db("dbproxy");
	//console.log(req.params.path_destino);
	var criterios = {};
        if(req.params.ip_origen != null){
            criterios = {ip_origen: req.params.ip_origen};
        }
        if(req.params.ip_origen != null && req.params.path_destino != null){
            criterios = {ip_origen: req.params.ip_origen, path_destino: req.params.path_destino};
        }
	dbase.collection("proxy_config").find(criterios).toArray(function(err, result) {
	if (err) throw err;
	//console.log(result);
	db.close();
        res.json(result);
	res.end();
	});
});

}
/*---------------------------------------------------------------------------------------------------------*/
/*----------- Funcion de Consulta para obtener datos de los logs del proxy -----------------*/
function f_consulta_log(req, res){

MongoClient.connect(url_mongo,{ useNewUrlParser: true } , function(error , db) {
	if (error){ throw error; }
    
	var dbase = db.db("dbproxy");
	//console.log(req.params.path_destino);
        var v_param_path_destino = req.params.path_destino;
        
        if(req.params.path_destino == "home"){
           v_param_path_destino = '/';
        }
	var criterios = {};
        if(req.params.ip_origen != null){
            criterios.ip_origen = req.params.ip_origen;
        }
        if(req.params.path_destino != null){
            criterios.path_destino = v_param_path_destino;
        }
        if(req.params.estado != null){
            criterios.estado = req.params.estado;
        }

	dbase.collection("log_proxy").find(criterios).toArray(function(err, result) {
	if (err) throw err;
	//console.log(result);
	db.close();
        if(req.params.contar == "CONTAR"){
	   res.json({ "cantidad" : result.length });
        }else{
           res.json(result);
        }
	res.end();
	});
});

}
/*---------------------------------------------------------------------------------------------------------*/
function f_aceptar_peticion(req, res){

MongoClient.connect(url_mongo,{ useNewUrlParser: true } , async function(error , db) {
	if (error){ throw error; }

	var dbase = db.db("dbproxy");

	var criterios = { ip_origen : req.params.ip_origen, path_destino : '/'+req.params.path_destino };
        //console.log("ip_origen::" + req.params.ip_origen);
        var v_configuracion = await dbase.collection("proxy_config").find(criterios).toArray();
        //console.log("config::"+v_configuracion[0].limite_solicitudes);
        if(v_configuracion.length == 0){ //No hay configuracion para la solicitud
            res.json({ "respuesta" : "ACEPTAR" });
            res.end();
        }else{
		
		criterios = { ip_origen : req.params.ip_origen, path_destino : '/'+req.params.path_destino, estado : "INI" };
		var v_iniciados = await dbase.collection("log_proxy").find(criterios).toArray();
                
		criterios = { ip_origen : req.params.ip_origen, path_destino : '/'+req.params.path_destino, $or : [{"estado" : "FIN"},{"estado" : "ERR"}] };
		var v_finalizados = await dbase.collection("log_proxy").find(criterios).toArray();
                
		var v_cant_pendientes = v_iniciados.length - v_finalizados.length;
                //console.log('v_cant_pendientes::'+v_cant_pendientes);
		if(v_configuracion[0].limite_solicitudes - v_cant_pendientes > 0){ //Queda lugar para aceptarle solicitudes
                   res.json({ respuesta : "ACEPTAR" });
                }else{
                   res.json({ respuesta : "RECHAZAR" });
                }
                res.end();
        }
});

}
/*----------- Funcion para actualizar el estado de las peticiones -----------------------------------------*/
function f_actualizar_log(req, res){

MongoClient.connect(url_mongo,{ useNewUrlParser: true } , function(error , db) {
	if (error){ throw error; }

	var dbase = db.db("dbproxy");
	console.log(req.params.estado);
	var v_clave = { _id: ObjectId(req.params.id_log) };
	var v_nuevo_estado = { $set: {estado: req.params.estado } };
	dbase.collection("log_proxy").updateOne(v_clave, v_nuevo_estado, function(err, result) {
	    if (err) { throw err };
	    //console.log("1 document updated");
            //console.log(result);
	    db.close();
	});
});
       res.end();
}
/*---------------------------------------------------------------------------------------------------------*/

