function parseOptions() {
    var devServerOptions = document.getElementById("dev-server");
    if (devServerOptions && devServerOptions.innerText) {
        return JSON.parse(devServerOptions.innerText);
    }

    var otherOptions = document.getElementById("raml-doc");
    if (otherOptions && otherOptions.innerText) {
        return JSON.parse(otherOptions.innerText);
    }

}


module.exports = parseOptions;
