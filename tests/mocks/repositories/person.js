const Base = require('./base');

class UsersRepository extends Base {
  constructor(domainsRepo) {
    super();
    this.domainsRepo = domainsRepo;
  }

  findById(id) {
    const result = this.objects.find(object => object.id === id);
    const user = result ? { dataValues: result } : null;

    if (user) user.createDomain = this.createDomain.bind(this);
    
    return Promise.resolve(user);
  }

  createDomain(domain) {
    return this.domainsRepo.create(domain);
  }
}

module.exports = UsersRepository;
