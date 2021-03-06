const request = require('supertest');
const app = require('../../../../server');
const route = require('../../../factories/route.factory').route('/gate/users');
const jwt_factory = require('../../../factories/jwt.factory');
const user_factory = require('../../../factories/user.factory');

require('should');

describe('API /gate/users', function() {
  let server;
  var user;
  var token;
  this.beforeEach(async () => {
    server = app.listen();
    user = await user_factory.admin(true, {}, ['password']);
    token = jwt_factory.default(user.id);
  });
  afterEach(async function() {
    server.close();
  });
  it('get / - not admin', async function() {
    var _user = await user_factory.default(true, {}, ['password']);
    var _token = jwt_factory.default(_user.id);
    request(server)
      .get(`${route}/${_user.id}`)
      .set({ Token: _token })
      .expect(401);
  });
  it('get /', async function() {
    request(server)
      .get(`${route}/${user.id}`)
      .set({ Token: token })
      .expect(200);
  });
  it('get / - wrong id', async function() {
    request(server)
      .get(`${route}/00000000-0000-0000-0000-000000000000`)
      .set({ Token: token })
      .expect(404);
  });
  it('index / ', async function() {
    request(server)
      .get(`${route}`)
      .set({ Token: token })
      .expect(200);
  });
  it('index / - paginate', async function() {
    request(server)
      .get(`${route}`)
      .set({ Token: token })
      .query({ page: 1 })
      .expect(200);
  });
  it('delete /{id}', async function() {
    request(server)
      .del(`${route}/${user.id}`)
      .set({ Token: token })
      .expect(204);
  });
});
