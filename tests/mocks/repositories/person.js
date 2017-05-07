const Base = require('./base');

class UsersRepository extends Base {
  constructor(peopleDataRepo) {
    super();
    this.peopleDataRepo = peopleDataRepo;
  }

  findById(id) {
    const result = this.objects.find(object => object.id === id);
    const user = result ? { dataValues: result } : null;

    if (user) {
      user.createPeopleData = this.createPeopleData.bind(this);
      user.getPeopleData = this.getPeopleData.bind(this);
    }
    
    return Promise.resolve(user);
  }

  createPeopleData(peopleData) {
    return this.peopleDataRepo.create(peopleData);
  }

  getPeopleData(personId) {
    return this.peopleDataRepo.findAll({ where: { personId } });
  }
}

module.exports = UsersRepository;
