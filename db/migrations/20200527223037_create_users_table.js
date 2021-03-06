exports.up = knex => {
  return knex.schema.createTable('users', t => {
    t.uuid('id')
      .unique()
      .notNullable()
      .primary()
      .defaultTo(knex.raw('gen_random_uuid()'));
    t.dateTime('created_at').nullable();
    t.dateTime('updated_at').nullable();
    t.dateTime('deleted_at').nullable();

    t.string('display_name').nullable();
    t.string('first_name').nullable();
    t.string('last_name').nullable();
    t.string('photo_url').nullable();

    t.string('email').notNull();
    t.string('username').notNull();
    t.string('password').nullable();

    t.string('provider').nullable();
    t.string('provider_id').nullable();

    t.enu('account_type', ['admin', 'photographer', 'client']);
  });
};

exports.down = knex => {
  return knex.schema.dropTable('users');
};
