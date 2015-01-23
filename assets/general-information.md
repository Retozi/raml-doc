### Requests

* Requests with method type _POST_ or _PUT_ supply their payload JSON-encoded in the request body. The HTTP-Header _Content-Type_ is set to _application/json_.

* Requests with method type _GET_ may contain parameters in the query string.

* PUT Requests will always supply the full resource for the write operation

### Responses

* Responses will deliver their payload JSON-encoded in the response body. The HTTP-Header _Content-Type_ is always set to _application/json_
* Responses always use meaningful HTTP-Status Codes. Specifically, they will use the [full range](http://en.wikipedia.org/wiki/List_of_HTTP_status_codes) of possible status codes.

### Errors

If a request cannot be processed, the API returns a response with a status code in the range 4xx. The response body contains an error object. An error object at least contains an _errorCode_ and an _errorMessage_.
