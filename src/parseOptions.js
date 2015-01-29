function parseOptions() {
    var devServerOptions = document.getElementById("dev-server");
    if (devServerOptions) {
        return JSON.parse(devServerOptions.innerText);
    }

    var otherOptions = document.getElementById("raml-doc");
    if (otherOptions) {
        return JSON.parse(otherOptions.innerText);
    }

}


module.exports = parseOptions;
