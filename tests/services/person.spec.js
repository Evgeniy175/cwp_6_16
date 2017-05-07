const TestsBase = require('../base');

const Errors = require('../../helpers/errors');

const CONFIG_PATH = process.env.NODE_ENV === 'production' ? '../../config' : '../../config-dev';
const Config = require(CONFIG_PATH);

const PersonDataRepository = require('../mocks/repositories/base');
const personDataRepo = new PersonDataRepository();

const PersonRepository = require('../mocks/repositories/person');
const personRepo = new PersonRepository(personDataRepo);

const TeamRepository = require('../mocks/repositories/base');
const teamRepo = new TeamRepository();

const PersonService = require('../../services/person');
const service = new PersonService(personRepo, personDataRepo, Config, Errors);

const TeamService = require('../../services/team');
const teamService = new TeamService(teamRepo, Config, Errors);

describe('Tests person service', async () => {
  beforeEach(() => {
    personRepo.mockClear();
    teamRepo.mockClear();
  });

  it('>> create without team test', async () => {
    const person = TestsBase.generatePerson();
    await service.create(person);


    expect(person.id).toBeDefined();
  });

  it('>> create with team test', async () => {
    const team = TestsBase.generateTeam();
    await teamService.create(team);

    const person = TestsBase.generatePerson(team.id);
    await service.create(person);

    expect(person.id).toBeDefined();
    expect(person.teamId).toBeDefined();
  });

  it('>> read test', async () => {
    const team = TestsBase.generateTeam();
    await teamService.create(team);

    const person = TestsBase.generatePerson(team.id);
    await service.create(person);

    const readResult = await service.read(person.id);
    expect(readResult).toEqual(person);
  });

  it('>> read many with one team test', async () => {
    const persons = [];

    const team = TestsBase.generateTeam();
    await teamService.create(team);

    for (let i = 0; i < 20; i++) {
      const person = TestsBase.generatePerson(team.id);
      persons.push(person);
      await service.create(person);
    }

    const readResult = await service.readMany({ params: { limit: 100 } });
    const isContains = readResult.rows.every(row => persons.includes(row));

    expect(isContains).toBeTruthy();
  });

  it('>> read many with many teams test', async () => {
    const persons = [];

    for (let i = 0; i < 20; i++) {
      const team = TestsBase.generateTeam();
      await teamService.create(team);

      const person = TestsBase.generatePerson(team.id);
      await service.create(person);

      persons.push(person);
    }

    const readResult = await service.readMany({ params: { limit: 100 } });
    const isContains = readResult.rows.every(row => persons.includes(row));

    expect(isContains).toBeTruthy();
  });

  it('>> update test: add team', async () => {
    const person = TestsBase.generatePerson();
    await service.create(person);

    const team = TestsBase.generateTeam();
    await teamService.create(team);

    const updatedPerson = TestsBase.generatePerson(team.id);
    await service.update(person.id, updatedPerson);

    const readResult = await service.read(person.id);
    const isUpdated = isPersonsEquals(updatedPerson, readResult) && !isPersonsEquals(person, updatedPerson);

    expect(isUpdated).toBeTruthy();
  });

  function isPersonsEquals(p1, p2) {
    return p1.id === p2.id
        && p1.realName === p2.realName
        && p1.teamId === p2.teamId;
  }

  it('>> remove test', async () => {
    let isErrorThrowed = false;

    const person = TestsBase.generatePerson();
    await service.create(person);

    const deleteResult = await service.remove(person.id);

    try {
      await service.read(person.id);
    }
    catch(err) {

      expect(err).toBe(Errors.notFound);
      isErrorThrowed = true;
    }

    expect(isErrorThrowed).toBeTruthy();
  });
});
