This document fully describes the features of the API. This, and **only this** document specifies the desired state of the API. 

If the API state differs from this document, the API is not correctly implemented. The API does not implement any behavior that is not specified in this document.

No other document contains any relevant information about the API.

### Layout

Each specified response must contain a _schema_ and an _example_. Requests with a JSON-body must do this as well.

### Schemas

Schemas are provided in the [csonschema format](https://github.com/cybertk/csonschema). They compile into the [JSON-Schema format](http://json-schema.org/). Additional infos about properties should be implemented directly in the schema with comments.
