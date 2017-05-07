const TestsBase = require('../base');
const server = require('../../app');
const request = require('supertest');
const Errors = require('../../helpers/errors');

describe('app tests', async () => {
  afterEach(done => {
    server.close();
    done();
  });

  ////////////////////////////////////
  // available-domains tests        //
  ////////////////////////////////////

  it('>> domain-available router: is available domain', async () => {
    const user = TestsBase.generateUser();
    await signUp(user);

    const signInResult = await signIn(user);
    const token = signInResult.header['set-cookie'];

    const reqResult = await isDomainAvailable('every-day-im-belarus.by', token);
    expect(reqResult.isAvailable).toBeTruthy();
  });


  ////////////////////////////////////
  // permission tests               //
  ////////////////////////////////////

  it('>> permission route: read users without token', async () => {
    await get('/users', 200);
  });

  it('>> permission route: post session without data', async () => {
    await post('/sessions', 422);
  });

  it('>> permission route: get user without token', async () => {
    await get('/users/1123', 403);
  });

  it('>> permission route: get user with token', async () => {
    const user = TestsBase.generateUser();
    await signUp(user);

    const signInResult = await signIn(user);
    const res = JSON.parse(signInResult.text);
    const token = signInResult.header['set-cookie'];
    const id = res.id;

    await get(`/users/${id}`, 200, token);
  });
  

  ////////////////////////////////////
  // users tests                    //
  ////////////////////////////////////

  it('>> users router: read', async () => {
    const user = TestsBase.generateUser();
    await signUp(user);

    const signInResult = await signIn(user);
    const res = JSON.parse(signInResult.text);
    const token = signInResult.header['set-cookie'];
    const id = res.id;

    await get(`/users/${id}`, 200, token);
  });

  it('>> users router: read many', async () => {
    await get('/users', 200);
  });

  it('>> users router: update', async () => {
    const user = TestsBase.generateUser();
    await signUp(user);

    const signInResult = await signIn(user);
    const res = JSON.parse(signInResult.text);
    const token = signInResult.header['set-cookie'];
    const id = res.id;

    const updatedUser = TestsBase.generateUser();
    await put(`/users/${id}`, 200, token, { message: updatedUser });

    const updatedSignInResult = await signIn(updatedUser);
    const updatedRes = JSON.parse(signInResult.text);
    const updatedToken = signInResult.header['set-cookie'];
    const updatedId = res.id;

    expect(id).toEqual(updatedId);

    await get(`/users/${id}`, 200, updatedToken);
  });

  it('>> users router: delete', async () => {
    const user = TestsBase.generateUser();
    await signUp(user);

    const signInResult = await signIn(user);
    const res = JSON.parse(signInResult.text);
    const token = signInResult.header['set-cookie'];
    const id = res.id;

    await deleteRequest(`/users/${id}`, 200, token);
    await get(`/users/${id}`, 404, token);
  });
  

  ////////////////////////////////////
  // domains tests                  //
  ////////////////////////////////////

  it('>> domains router: create', async () => {
    const domain = TestsBase.generateDomain();

    const user = TestsBase.generateUser();
    await signUp(user);

    const signInResult = await signIn(user);
    const res = JSON.parse(signInResult.text);
    const token = signInResult.header['set-cookie'];
    const id = res.id;

    const data = { message: { userId: id, domain: domain.name }};
    const domainBuyResult = await post('/domains', 200, token, data);
  });

  it('>> domains router: read', async () => {
    const domain = TestsBase.generateDomain();

    const user = TestsBase.generateUser();
    await signUp(user);

    const signInResult = await signIn(user);
    const res = JSON.parse(signInResult.text);
    const token = signInResult.header['set-cookie'];
    const id = res.id;

    const data = { message: { userId: id, domain: domain.name }};
    const domainBuyResult = await post('/domains', 200, token, data);
    const resBuy = JSON.parse(domainBuyResult.text);

    const readResult = await get(`/domains/${resBuy.id}`, 200, token);
    const resRead = JSON.parse(readResult.text);
    expect(domain.name).toEqual(resRead.name);
  });

  it('>> domains router: update', async () => {
    const domain = TestsBase.generateDomain();

    const user = TestsBase.generateUser();
    await signUp(user);

    const signInResult = await signIn(user);
    const res = JSON.parse(signInResult.text);
    const token = signInResult.header['set-cookie'];
    const id = res.id;

    const data = { message: { userId: id, domain: domain.name }};
    const domainBuyResult = await post('/domains', 200, token, data);
    const resBuy = JSON.parse(domainBuyResult.text);

    const updatedDomain = TestsBase.generateDomain();
    await put(`/domains/${resBuy.id}`, 200, token, { message: { name: updatedDomain.name } });

    const readResult = await get(`/domains/${resBuy.id}`, 200, token);
    const resRead = JSON.parse(readResult.text);
    expect(updatedDomain.name).toEqual(resRead.name);
  });

  it('>> domains router: delete', async () => {
    const domain = TestsBase.generateDomain();

    const user = TestsBase.generateUser();
    await signUp(user);

    const signInResult = await signIn(user);
    const res = JSON.parse(signInResult.text);
    const token = signInResult.header['set-cookie'];
    const id = res.id;

    const data = { message: { userId: id, domain: domain.name }};
    const domainBuyResult = await post('/domains', 200, token, data);
    const resBuy = JSON.parse(domainBuyResult.text);

    await deleteRequest(`/domains/${resBuy.id}`, 200, token);

    const readResult = await get(`/domains/${resBuy.id}`, 404, token);
  });
});



////////////////////////////////////
// helpers tests                  //
////////////////////////////////////

function signUp(user) {
  return post('/users', 201, null, { message: user });
}

function signIn(user) {
  return post('/sessions', 200, null, { message: user });
}

function isDomainAvailable(domain, token) {
  return get('/available-domains', 200, token, { domain: domain })
  .then(res => res.body);
}

function get(url, status, token, query) {
  return request(server)
  .get(url)
  .query(query)
  .set('Cookie', [token])
  .expect(status);
}

function post(url, status, token, data) {
  return request(server)
  .post(url)
  .set('Cookie', [token])
  .send(data)
  .expect(status);
}

function put(url, status, token, data) {
  return request(server)
  .put(url)
  .set('Cookie', [token])
  .send(data)
  .expect(status);
}

function deleteRequest(url, status, token) {
  return request(server)
  .delete(url)
  .set('Cookie', [token])
  .expect(status);
}
