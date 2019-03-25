var utilidades = require('./Utilidades.js');
var http = require("http");

function sleep(time, callback) {
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) {
        ;
    }
    callback();
}

http.createServer(function (request, response) {
   // Send the HTTP header 
   // HTTP Status: 200 : OK
   // Content Type: text/plain
   response.writeHead(200, {'Content-Type': 'text/plain'});

/*   
   // Send the response body as "Hello World"
sleep(10000, function() {
   // executes after one second, and blocks the thread
});
*/
   response.end('Hello World\n');
}).listen(8090);

// Console will print the message
console.log('Server running at http://127.0.0.1:8090/');
