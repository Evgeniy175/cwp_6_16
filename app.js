const Express = require('express');
const Sequelize = require('sequelize');
const moment = require('moment-timezone');

const CookieParser = require('cookie-parser');
const BodyParser = require('body-parser');
const Js2XmlParser = require('js2xmlparser');

const CONFIG_PATH = process.env.NODE_ENV === 'production' ? './config' : './config-dev';
const Config = require(CONFIG_PATH);
const Errors = require('./helpers/errors');
const DbContext = require('./helpers/sequelize');
const ExpressExtensions = require('./helpers/express')(Express, Config, Js2XmlParser);
const tasksIntersectionHelper = require('./helpers/tasks-intersection');

const TeamsService = require('./services/team');
const PeopleService = require('./services/person');

const PermissionsRouter = require('./routers/permission');
const TeamsRouter = require('./routers/team');
const PeopleRouter = require('./routers/person');

// -- // -- // -- // -- // -- // -- // -- // -- // -- // -- // -- // -- // -- //

const app = Express();

const context = new DbContext(Sequelize, Config);

const teamsService = new TeamsService(context.teams, Config, Errors);
const peopleService = new PeopleService(context.people, context.peopleData, tasksIntersectionHelper, Config, Errors, moment);

const permissionsRouter = new PermissionsRouter(Express, Config);
const teamsRouter = new TeamsRouter(Express, teamsService);
const peopleRouter = new PeopleRouter(Express, peopleService);

// -- // -- // -- // -- // -- // -- // -- // -- // -- // -- // -- // -- // -- //

app.use(BodyParser.json());
app.use(CookieParser(Config.cookies.secret));

app.use('*', permissionsRouter);
app.use('/teams', teamsRouter);
app.use('/people', peopleRouter);

const server = app.listen(process.env.PORT || 3000, function() {
  console.log('Server running...');
});

module.exports = server;
