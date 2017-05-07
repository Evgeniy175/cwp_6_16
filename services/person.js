class PeopleService {
  constructor(peopleRepository, bcrypt, config, errors) {
    this.peopleRepository = peopleRepository;
    this.bcrypt = bcrypt;
    this.config = config;
    this.errors = errors;

    this.defaultOptions = {
      readMany: {
        limit: 10,
        page: 1,
        order: 'asc',
        orderField: 'id'
      }
    };
  }

  create(person) {
    const validationErrors = this._getValidationErrors(person);

    return new Promise((resolve, reject) => {
      if (validationErrors !== '') {
        reject(validationErrors);
        return;
      }

      this._encodePassword(person);
      
      this.peopleRepository.create(person)
      .then(data => {
        person.id = data.dataValues.id;
        resolve({ success: true });
      })
      .catch(reject);
    });
  }

  _encodePassword(person) {
    let salt = this.bcrypt.genSaltSync(10);
    person.password = this.bcrypt.hashSync(person.password, salt);
  }

  read(id) {
    id = parseInt(id);

    return new Promise((resolve, reject) => {
      if (isNaN(id)) {
        reject(this.errors.invalidId);
        return;
      }

      this.peopleRepository.findById(id)
      .then((res) => {
        if (res) resolve(res.dataValues);
        else reject(this.errors.notFound);
      })
      .catch(reject);
    });
  }

  readMany(params = {}) {
    if (!params.page) params.page = 1;
    
    let findOptions = this._getReadManyOptions(params);

    return new Promise((resolve, reject) => {
      this.peopleRepository
      .findAndCountAll(findOptions)
      .then(data => resolve(this._getReadManyResults(params, findOptions, data)))
      .catch(reject);
    });
  }

  _getReadManyOptions(params) {
    params = Object.assign({}, this.defaultOptions.readMany, params);

    let limit = parseInt(params.limit);
    let page = parseInt(params.page);

    return {
      limit: limit,
      offset: (page - 1) * limit,
      order: [[params.orderField, params.order.toUpperCase()]],
      raw: true
    };
  }

  _getReadManyResults(params, findOptions, data) {
    return {
      portionNumber: params.page,
      nOfPortions: Math.ceil(data.count / findOptions.limit),
      rows: data.rows
    };
  }

  update(id, params) {
    let u = {
      realName: params.realName,
      teamId: params.teamId
    };

    let validationErrors = this._getValidationErrors(u);
    
    return new Promise((resolve, reject) => {
      if (validationErrors.length > 0) {
        reject(validationErrors);
        return;
      }

      if (!id) {
        reject(this.errors.invalidEntity);
        return;
      }
      
      this._encodePassword(u);

      return this.peopleRepository.update(u, { where: { id }, limit: 1 })
      .then(data => resolve({ success: true }))
      .catch(reject);
    });
  }

  remove(id) {
    return new Promise((resolve, reject) => {
      this.peopleRepository.destroy({ where: { id } })
      .then(data => resolve({ success: true }))
      .catch(reject);
    });
  }

  _getValidationErrors(person) {
    let validationErrors = this.validate(person).join('; ');

    if (validationErrors.length === 0) return '';

    let rc = this.errors.invalidEntity;
    rc.message = rc.message + ': ' + validationErrors;
    return rc;
  }

  validate(person) {
    let rc = [];

    if (!person) return ['Person data is wrong'];

    if (!person.realName || person.realName === '') rc.push('Name not set');

    return rc;
  }
}

module.exports = PeopleService;
