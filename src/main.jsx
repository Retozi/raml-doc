require("bootstrap/dist/css/bootstrap.min.css");
var React = require('react');

var Router = require('react-router');
var Route = Router.Route;

var App = require('./components/App');
var ApiRoute = require('./components/ApiRoute');

// This is kind of a rape of react-router, but the urls look nice...
var routes = (
    <Route path="/" handler={App}>
        <Route path="/:l0" handler={ApiRoute}/>
        <Route path="/:l0/:l1" handler={ApiRoute}/>
        <Route path="/:l0/:l1/:l2" handler={ApiRoute}/>
        <Route path="/:l0/:l1/:l2/:l3" handler={ApiRoute}/>
        <Route path="/:l0/:l1/:l2/:l3/:l4" handler={ApiRoute}/>
        <Route path="/:l0/:l1/:l2/:l3/:l4/:l5" handler={ApiRoute}/>
        <Route path="/:l0/:l1/:l2/:l3/:l4/:l5/:l6" handler={ApiRoute}/>
    </Route>
);


Router.run(routes, function (Handler) {
    React.render(
        <Handler ramlPath="./assets/api.raml"/>,
        document.getElementById('app-container')
    );
});
