const Promise = require('bluebird');

class PeopleService {
  constructor(peopleRepository, peopleDataRepository, config, errors, moment) {
    this.peopleRepository = peopleRepository;
    this.peopleDataRepository = peopleDataRepository;
    this.config = config;
    this.errors = errors;
    this.moment = moment;

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

      this.peopleRepository.create(person)
        .then(data => {
          person.id = data.dataValues.id;
          resolve(data);
        })
        .catch(reject);
    });
  }

  createPersonData(personData) {
    const personId = parseInt(personData.personId);

    return new Promise((resolve, reject) => {
      if (isNaN(personId)) {
        reject(this.errors.invalidId);
        return;
      }

      this.peopleDataRepository.create(personData)
        .then(res => {
          if (res) resolve(res.dataValues);
          else reject(this.errors.notFound);
        })
        .catch(reject);
    });
  }

  read(id) {
    id = parseInt(id);

    return new Promise((resolve, reject) => {
      if (isNaN(id)) {
        reject(this.errors.invalidId);
        return;
      }

      this.peopleRepository.findById(id)
      .then(res => {
        if (res) resolve(res.dataValues);
        else reject(this.errors.notFound);
      })
      .catch(reject);
    });
  }

  isIntersection(id, anotherId) {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.getStatuses(id),
        this.getStatuses(anotherId)
      ])
      .spread((first, second) => ({ isWorkingTogetherNow: this.isInWork(first) && this.isInWork(second) }))
      .then(resolve)
      .catch(reject);
    });
  }

  isInWork(personData) {
    return personData.some(pd => pd.status === 'In work');
  }

  getStatuses(id) {
    id = parseInt(id);

    return new Promise((resolve, reject) => {
      this.getPersonData(id)
      .then(personData => personData.map(pdItem => this.formatPersonDataItem(pdItem)))
      .then(resolve)
      .catch(reject);
    });
  }

  getPersonData(id) {
    id = parseInt(id);

    return new Promise((resolve, reject) => {
      this.peopleRepository.findById(id)
      .then(p => p.getPeopleData())
      .then(resolve)
      .catch(reject);
    });
  }

  formatPersonDataItem(personDataItem) {
    const now = this.moment.tz(personDataItem.timezone);
    const workTime = this.moment(personDataItem.workTime, 'HH:mm');

    const workStarts = this.moment.tz(personDataItem.workStarts, 'HH:mm', personDataItem.timezone);
    const workEnds = workStarts.clone().add({ hour: workTime.hour(), minute: workTime.minute() });

    return this.formatWorkStatus(personDataItem, workStarts, workEnds, now);
  }

  formatWorkStatus(personDataItem, startTime, endTime, now) {
    const isInWork = now.isBetween(startTime, endTime);

    return {
      personDataItem,
      workStarts: startTime.format(),
      workEnds: endTime.format(),
      now: now.format(),
      status: isInWork ? 'In work' : 'Sleep'
    };
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

  update(id, person) {
    let p = {
      realName: person.realName,
      teamId: person.teamId
    };

    let validationErrors = this._getValidationErrors(p);
    
    return new Promise((resolve, reject) => {
      if (validationErrors.length > 0) {
        reject(validationErrors);
        return;
      }

      if (!id) {
        reject(this.errors.invalidEntity);
        return;
      }

      person.id = id;

      return this.peopleRepository.update(p, { where: { id }, limit: 1 })
      .then(resolve)
      .catch(reject);
    });
  }

  remove(id) {
    return new Promise((resolve, reject) => {
      this.peopleRepository.destroy({ where: { id } })
      .then(resolve)
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
