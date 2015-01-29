var devServer = require('./server/server.js');

var app = devServer({
    source: './assets/api.raml',
    bundle: './bundle.html'
});

app.listen(8082);
