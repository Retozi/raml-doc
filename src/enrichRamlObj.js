// We would like to add some handy attributes to the ramlObj methods
function enrich(ramlObj, parentUrl, allUriParameters) {
    if (!ramlObj.resources) {
        return;
    }
    ramlObj.resources.forEach((r) => {
        r.parentUrl = parentUrl || '';
        r.absUrl = r.parentUrl + r.relativeUri;
        r.allUriParameters = [].concat(allUriParameters || []);
        r.allUriParameters = r.allUriParameters.concat(r.uriParameters || []);
        enrich(r, r.absUrl, r.allUriParameters);
    });
}

module.exports = enrich;
