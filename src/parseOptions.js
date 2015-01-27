function parseOptions() {
    var devServerOptions = document.getElementById("dev-server");
    if (devServerOptions) {
        var options = JSON.parse(devServerOptions.innerText);
        options.hotReload = true;
        return options;
    }

}


module.exports = parseOptions;
