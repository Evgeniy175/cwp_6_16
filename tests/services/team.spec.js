const TestsBase = require('../base');

const BCrypt = require('bcryptjs');
const Errors = require('../../helpers/errors');

const CONFIG_PATH = process.env.NODE_ENV === 'production' ? '../../config' : '../../config-dev';
const Config = require(CONFIG_PATH);

const TeamRepository = require('../mocks/repositories/base');
const teamRepo = new TeamRepository();

const TeamService = require('../../services/team');
const service = new TeamService(teamRepo, BCrypt, Config, Errors);

describe('Tests team service', async () => {
  beforeEach(() => teamRepo.mockClear());

  it('>> create test', async () => {
    const team = TestsBase.generateTeam();
    await service.create(team);

    expect(team.id).toBeDefined();
  });

  it('>> read test', async () => {
    const team = TestsBase.generateTeam();
    await service.create(team);
    const readResult = await service.read(team.id);

    expect(readResult).toEqual(team);
  });

  it('>> read many test', async () => {
    const teams = [];

    for (let i = 0; i < 20; i++) {
      const team = TestsBase.generateTeam();
      teams.push(team);
      await service.create(team);
    }

    const readResult = await service.readMany({ params: { limit: 100 } });
    const isContains = readResult.rows.every(row => teams.includes(row));
    
    expect(isContains).toBeTruthy();
  });

  it('>> update test', async () => {
    const team = TestsBase.generateTeam();
    await service.create(team);

    const updatedTeam = TestsBase.generateTeam();
    await service.update(team.id, updatedTeam);

    const readResult = await service.read(team.id);
    const isUpdated = isTeamsEquals(updatedTeam, readResult) && !isTeamsEquals(team, updatedTeam);

    expect(isUpdated).toBeTruthy();
  });

  function isTeamsEquals(t1, t2) {
    return t1.name === t2.name
        && t1.id === t2.id;
  }

  it('>> remove test', async () => {
    let isErrorThrowed = false;

    const team = TestsBase.generateTeam();
    await service.create(team);
    
    const deleteResult = await service.remove(team.id);
    
    try {
      await service.read(team.id);
    }
    catch(err) {
      expect(err).toBe(Errors.notFound);
      isErrorThrowed = true;
    }

    expect(isErrorThrowed).toBeTruthy();
  });
});
