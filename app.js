const Express = require('express');
const Sequelize = require('sequelize');

const Jwt = require('jsonwebtoken');
const CookieParser = require('cookie-parser');
const BodyParser = require('body-parser');
const BCrypt = require('bcryptjs');
const Js2XmlParser = require('js2xmlparser');

const Request = require('request');

const CONFIG_PATH = process.env.NODE_ENV === 'production' ? './config' : './config-dev';
const Config = require(CONFIG_PATH);
const Errors = require('./helpers/errors');
const DbContext = require('./helpers/sequelize');
const ExpressExtensions = require('./helpers/express')(Express, Config, Js2XmlParser);

const PeopleService = require('./services/person');

const PeopleRouter = require('./routers/person');

// -- // -- // -- // -- // -- // -- // -- // -- // -- // -- // -- // -- // -- //

const app = Express();

const context = new DbContext(Sequelize, Config);

const peopleService = new PeopleService(context.people, BCrypt, Config, Errors);

const peopleRouter = new PeopleRouter(Express, peopleService, Jwt, Config, Errors);

// -- // -- // -- // -- // -- // -- // -- // -- // -- // -- // -- // -- // -- //

app.use(BodyParser.json());
app.use(CookieParser(Config.cookies.secret));

app.use('/people', peopleRouter);

const server = app.listen(process.env.PORT || 3000, function() {
    console.log('Server running...');
});

module.exports = server;
