const request = require('supertest');
const moment = require('moment-timezone');

const TestsBase = require('../base');
const server = require('./app');
const Errors = require('../../helpers/errors');
const _ = require('lodash');

describe('app tests', async () => {
  afterEach(done => {
    server.close();
    done();
  });

  ////////////////////////////////////
  // teams tests                    //
  ////////////////////////////////////

  it('>> teams router: create', async () => {
    const team = TestsBase.generateTeam();
    await post('/teams', 201, team);
  });

  it('>> teams router: read', async () => {
    const team = TestsBase.generateTeam();
    const createRes = await post('/teams', 201, team);
    const createdTeam = JSON.parse(createRes.text).dataValues;

    const readRes = await get(`/teams/${createdTeam.id}`, 200);
    const readedTeam = JSON.parse(readRes.text);
    const isEquals = compareObjects(createdTeam, readedTeam);

    expect(isEquals).toBeTruthy();
  });

  it('>> teams router: read many', async () => {
    const teams = [];

    for (let i = 0; i < 20; i++) {
      const team = TestsBase.generateTeam();
      const createRes = await post('/teams', 201, team);
      const createdTeam = JSON.parse(createRes.text);
      teams.push(createdTeam.dataValues);
    }

    const readRes = await get('/teams', 200, { limit: 100 });
    const readedTeams = JSON.parse(readRes.text).rows;

    const mappedInitial = mapTeams(teams);
    const mappedUpdated = mapTeams(readedTeams);

    const isEquals = mappedInitial.every(o1 => mappedUpdated.some(o2 => _.isEqual(o1, o2)));
    expect(isEquals).toBeTruthy();
  });

  it('>> teams router: update', async () => {
    const team = TestsBase.generateTeam();
    const createRes = await post('/teams', 201, team);
    const createdTeam = JSON.parse(createRes.text).dataValues;
    const wtf = JSON.stringify(createdTeam);

    const updateTeamData = TestsBase.generateTeam();
    await put(`/teams/${createdTeam.id}`, 200, updateTeamData);

    const readRes = await get(`/teams/${createdTeam.id}`, 200);
    const updatedTeam = JSON.parse(readRes.text);

    const isEqualsWithInitial = compareObjects(createdTeam, updatedTeam);
    const isEqualsWithUpdated = compareObjects(updateTeamData, updatedTeam);

    expect(isEqualsWithInitial).toBeFalsy();
    expect(isEqualsWithUpdated).toBeTruthy();
  });

  it('>> teams router: delete', async () => {
    const team = TestsBase.generateTeam();
    const createRes = await post('/teams', 201, team);
    const createdTeam = JSON.parse(createRes.text).dataValues;
    await post('/teams', 201, team);
    await deleteRequest(`/teams/${createdTeam.id}`, 200);
    await get(`/teams/${createdTeam.id}`, 404);
  });

  ////////////////////////////////////
  // person data tests              //
  ////////////////////////////////////

  it('>> person data: get status', async () => {
    const personDatas = [];

    const person = TestsBase.generatePerson();
    const createRes = await post('/people', 201, person);
    const createdPerson = JSON.parse(createRes.text).dataValues;

    for (let i = 0; i < 20; i++) {
      const personData = TestsBase.generatePersonData(createdPerson.id);
      const personDataRes = await post(`/people/${createdPerson.id}/data`, 201, personData);
      const createdPersonData = JSON.parse(personDataRes.text);
      personDatas.push(createdPersonData);
    }

    const personDataRes = await get(`/people/${createdPerson.id}/statuses`, 200);
    const readedPersonData = JSON.parse(personDataRes.text);

    expect(readedPersonData.length).toBe(personDatas.length);
  });

  it('>> person data: confirm no intersection for 2 persons', async () => {
    const person = TestsBase.generatePerson();
    const createRes = await post('/people', 201, person);
    const createdPerson = JSON.parse(createRes.text).dataValues;

    const anotherPerson = TestsBase.generatePerson();
    const anotherCreateRes = await post('/people', 201, anotherPerson);
    const anotherCreatedPerson = JSON.parse(anotherCreateRes.text).dataValues;

    for (let i = 0; i < 20; i++) {
      const personData = TestsBase.generatePersonData(createdPerson.id);
      await post(`/people/${createdPerson.id}/data`, 201, personData);
    }

    const resp = await get(`/people/${createdPerson.id}/intersection/${anotherCreatedPerson.id}`, 200);
    const result = JSON.parse(resp.text);

    expect(result.isWorkingTogetherNow).toBeFalsy();
  });

  it('>> person data: confirm intersection for 2 persons', async () => {
    const person = TestsBase.generatePerson();
    const createRes = await post('/people', 201, person);
    const createdPerson = JSON.parse(createRes.text).dataValues;

    const anotherPerson = TestsBase.generatePerson();
    const anotherCreateRes = await post('/people', 201, anotherPerson);
    const anotherCreatedPerson = JSON.parse(anotherCreateRes.text).dataValues;

    const personData = TestsBase.generatePersonData(createdPerson.id);
    personData.workStarts = moment.tz(personData.timezone).subtract(15, 'second').format('HH:mm');
    personData.workTime = '00:05';

    await post(`/people/${createdPerson.id}/data`, 201, personData);

    personData.personId = anotherCreatedPerson.id;
    await post(`/people/${anotherCreatedPerson.id}/data`, 201, personData);

    const resp = await get(`/people/${createdPerson.id}/intersection/${anotherCreatedPerson.id}`, 200);
    const result = JSON.parse(resp.text);

    expect(result.isWorkingTogetherNow).toBeTruthy();
  });
});



////////////////////////////////////
// helpers for tests              //
////////////////////////////////////

function compareObjects(o1, o2) {
  return Object.keys(o1).every(key => o1[key] === o2[key]);
}

function mapTeams(teams) {
  return teams.map(team => ({
    id: team.id,
    name: team.name
  }));
}

function isDomainAvailable(domain) {
  return get('/available-domains', 200, token, { domain: domain })
  .then(res => res.body);
}

function get(url, status, query) {
  return request(server)
  .get(url)
  .query(query)
  .expect(status);
}

function post(url, status, message) {
  return request(server)
  .post(url)
  .send({ message })
  .expect(status);
}

function put(url, status, message) {
  return request(server)
  .put(url)
  .send({ message })
  .expect(status);
}

function deleteRequest(url, status) {
  return request(server)
  .delete(url)
  .expect(status);
}
