const TestsBase = require('../base');

const Errors = require('../../helpers/errors');

const CONFIG_PATH = process.env.NODE_ENV === 'production' ? '../../config' : '../../config-dev';
const Config = require(CONFIG_PATH);

const TeamRepository = require('../mocks/repositories/base');
const teamRepo = new TeamRepository();

const PersonDataRepository = require('../mocks/repositories/base');
const personDataRepo = new PersonDataRepository();

const PersonRepository = require('../mocks/repositories/person');
const personRepo = new PersonRepository(personDataRepo);

const TeamService = require('../../services/team');
const teamService = new TeamService(teamRepo, Config, Errors);

const PersonService = require('../../services/person');
const personService = new PersonService(personRepo, personDataRepo, Config, Errors);

describe('Tests people data service', async () => {
  beforeEach(() => {
    teamRepo.mockClear();
    personRepo.mockClear();
    personDataRepo.mockClear();
  });

  it('>> read person data test', async () => {
    const personDatas = [];

    const team = TestsBase.generateTeam();
    await teamService.create(team);

    const person = TestsBase.generatePerson(team.id);
    await personService.create(person);

    for (let i = 0; i < 20; i++) {
      const personData = TestsBase.generatePersonData(person.id);
      await personService.createPersonData(personData);
      personDatas.push(personData);
    }

    const readResult = await personService.getPersonData(person.id);
    const isContains = personDatas.every(row => readResult.dataValues.includes(row));

    expect(isContains).toBeTruthy();
  });
});
