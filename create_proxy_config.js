var MongoClient = require('mongodb').MongoClient;
var url_mongo = "mongodb://localhost:27017/";

MongoClient.connect(url_mongo,{ useNewUrlParser: true } , function(error , db) {
	if (error){ throw error; }

        var dbase = db.db("dbproxy");
      /*
	var configuracion = [
          { ip_origen: "::ffff:127.0.0.1", path_destino: "/ruta_1", limite_solicitudes: 10 , fecha_alta : new Date()},
          { ip_origen: "::ffff:127.0.0.1", path_destino: "/ruta_2", limite_solicitudes: 20 },
          { ip_origen: "::ffff:127.0.0.1", path_destino: "/ruta_3", limite_solicitudes: 0 },
          { ip_origen: "::ffff:127.0.0.1", path_destino: "/ruta_4", limite_solicitudes: 4 }
        ];
  	dbase.collection("proxy_config").insertMany(configuracion, function(err, res) {
    	   if (err) throw err;
    	   console.log("Se inserto correctamente en proxy_config");
           db.close();
  	}); */
        
      //------ DELETE
	dbase.collection("log_proxy").deleteMany({}, function(err, result) {
	    if (err) throw err;
	    //console.log(result.ip_origen + "||" + result.path_destino  + "||" + result.limite_solicitudes , result.fecha_alta);
	    db.close();
	  });
/*
        //------ CONSULTA UNO
	dbase.collection("proxy_config").findOne({path_destino: "/ruta_1"}, function(err, result) {
	    if (err) throw err;
	    console.log(result.ip_origen + "||" + result.path_destino  + "||" + result.limite_solicitudes , result.fecha_alta);
	    db.close();
	  });*/
/*
	//------ CONSULTA MUCHOS
	dbase.collection("proxy_config").find({}).toArray(function(err, result) {
	    if (err) throw err;
	    console.log(result);
	    db.close();
	  });*/
/*
        //---------- UPDATE
	  var myquery = { address: "Valley 345" };
	  var newvalues = { $set: {name: "Mickey", address: "Canyon 123" } };
	  dbase.collection("customers").updateOne(myquery, newvalues, function(err, res) {
	    if (err) throw err;
	    console.log("1 document updated");
	    db.close();
	  });*/



});

