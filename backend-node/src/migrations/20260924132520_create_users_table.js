/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable('users', function (table) {
    table.increments('id');
    table.string('username').notNullable().unique();
    table.string('email').notNullable().unique();
    table.string('password_hash').notNullable();
    table.string('bio');
    table.string('image');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTable('users');
};
