const db_util = require('../../../utils/db.util');
const Photo = require('../../../lib/models/photo.model');

exports.get = async ctx => {
  const photo_id = ctx.checkParams('id').isUUID().value;

  if (ctx.errors) {
    ctx.status = 400;
    ctx.body = ctx.errors;
    return;
  }

  const photo = await Photo.get({ id: photo_id, author_id: ctx.state.user.id });
  if (!photo) {
    return;
  }
  ctx.status = 200;
  ctx.body = photo;
};

exports.index = async ctx => {
  const query = ctx.state.user.getPhotosQuery();

  const body = await db_util.paginate(query, ctx);
  if (ctx.errors) {
    ctx.status = 400;
    ctx.body = ctx.errors;
    return;
  }

  ctx.status = 200;
  ctx.body = body;
};

exports.create = async ctx => {
  const portfolio_id = ctx
    .checkBody('portfolio_id')
    .optional()
    .isUUID().value;

  var photo_obj = {};
  photo_obj.author_id = ctx.state.user.id;
  photo_obj.title = ctx.checkBody('title').value;
  photo_obj.description = ctx.checkBody('description').optional().value;

  var file;
  file = ctx.checkFile('file').value;
  if(file != null && file.type != 'image/jpeg'){
    ctx.checkFile('file').addError('Filetype must be jpeg');
  }

  if (ctx.errors) {
    ctx.status = 400;
    ctx.body = ctx.errors;
    return;
  }
  const photo = await Photo.create(photo_obj);

  try {
    await photo.moveAndSize(file);
  } catch (err) {
    ctx.status = 500;
    ctx.body = err;
    return;
  }

  if (portfolio_id) {
    const pivot_db = require('../../lib/db')('portfolios_photos');
    pivot_db.insert({ portfolio_id, photo_id: photo.id });
  }

  ctx.status = 200;
  ctx.body = photo;
};

exports.update = async ctx => {
  const id = ctx.checkParams('id').isUUID().value;
  var photo = {};
  photo.title = ctx.checkBody('title').value;
  photo.description = ctx.checkBody('description').optional().value;

  if (ctx.errors) {
    ctx.status = 400;
    ctx.body = ctx.errors;
    return;
  }

  db_util.clean(photo);
  if (!photo) {
    ctx.status = 400;
    return;
  }
  photo = await Photo.update(id, photo);
  ctx.status = 200;
  ctx.body = photo;
};

exports.del = async ctx => {
  const id = ctx.checkParams('id').isUUID().value;

  if (ctx.errors) {
    ctx.status = 400;
    ctx.body = ctx.errors;
    return;
  }

  const ret = await Photo.remove(id, ctx.state.user.id);
  if (ret != 1) {
    return;
  }
  ctx.status = 204;
};
