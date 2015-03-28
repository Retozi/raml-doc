// We would like to add some handy attributes to the ramlObj methods
"use strict";

function order(a, b) {
    if (a.absUrl < b.absUrl) {
        return -1;
    }
    if (a.absUrl > b.absUrl) {
        return 1;
    }
    return 0;
}

function enrich(ramlObj, parentUrl, allUriParameters, nestingLevel) {
    if (!ramlObj.resources) {
        return;
    }
    if (nestingLevel === undefined) {
        nestingLevel = 0;
    }
    ramlObj.resources.forEach(function(r) {
        r.parentUrl = parentUrl || '';
        r.absUrl = r.parentUrl + r.relativeUri;
        r.nestingLevel = nestingLevel;
        r.allUriParameters = [].concat(allUriParameters || []);
        r.allUriParameters = r.allUriParameters.concat(r.uriParameters || []);
        enrich(r, r.absUrl, r.allUriParameters, nestingLevel + 1);
    });

    // make sure the resources have a predictable order
    ramlObj.resources.sort(order);
}

module.exports = function(ramlObj) {
    // make a copy
    if (!ramlObj) {
        return null;
    }
    ramlObj = JSON.parse(JSON.stringify(ramlObj));
    enrich(ramlObj);
    return ramlObj;
};
