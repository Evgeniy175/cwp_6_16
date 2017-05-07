const TestsBase = require('../base');

const BCrypt = require('bcryptjs');
const Errors = require('../../helpers/errors');

const CONFIG_PATH = process.env.NODE_ENV === 'production' ? '../../config' : '../../config-dev';
const Config = require(CONFIG_PATH);

const PersonRepository = require('../mocks/repositories/base');
const personRepo = new PersonRepository();

const PersonService = require('../../services/person');
const service = new PersonService(personRepo, BCrypt, Config, Errors);

describe('Tests person service', async () => {
  beforeEach(() => personRepo.mockClear());

  it('>> create test', async () => {
    const person = TestsBase.generatePerson();
    await service.create(person);

    expect(person.id).toBeDefined();
  });

  it('>> read test', async () => {
    const person = TestsBase.generatePerson();
    await service.create(person);
    const readResult = await service.read(person.id);

    expect(readResult).toEqual(person);
  });

  it('>> read many test', async () => {
    const persons = [];

    for (let i = 0; i < 20; i++) {
      const person = TestsBase.generatePerson();
      persons.push(person);
      await service.create(person);
    }

    const readResult = await service.readMany({ params: { limit: 100 } });
    const isContains = readResult.rows.every(row => persons.includes(row));

    expect(isContains).toBeTruthy();
  });

  it('>> update test', async () => {
    const person = TestsBase.generatePerson();
    await service.create(person);

    const updatedPerson = TestsBase.generatePerson();
    await service.update(person.id, updatedPerson);

    const readResult = await service.read(person.id);
    const isUpdated = isPersonsEquals(updatedPerson, readResult) && !isPersonsEquals(person, updatedPerson);

    expect(isUpdated).toBeTruthy();
  });

  function isPersonsEquals(t1, t2) {
    return t1.name === t2.name
        && t1.id === t2.id;
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
