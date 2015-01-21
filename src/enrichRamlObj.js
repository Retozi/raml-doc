// We would like to add some handy attributes to the ramlObj methods

function order(a, b) {
    if (a.absUrl < b.absUrl) {
        return -1;
    }
    if (a.absUrl > b.absUrl) {
        return 1;
    }
    return 0;
}

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

    // make sure the resources have a predictable order
    ramlObj.resources.sort(order);
}

module.exports = enrich;
