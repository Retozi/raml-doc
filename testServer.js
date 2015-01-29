var devServer = require('./server/server.js');

var app = devServer({
    source: './assets/api.raml'
});

app.listen(8082);
