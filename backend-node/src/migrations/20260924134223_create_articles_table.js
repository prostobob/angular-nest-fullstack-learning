/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable('articles', function (table) {
    table.increments('id');
    table.string('slug').notNullable().unique();
    table.string('title').notNullable();
    table.text('description').notNullable();
    table.text('body').notNullable();
    table.integer('author_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTable('articles');
};
