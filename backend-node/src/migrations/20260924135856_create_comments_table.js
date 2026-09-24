/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable('comments', function (table) {
    table.increments('id');
    table.text('body').notNullable();
    table.timestamps(true, true);
    table.integer('article_id').notNullable().references('id').inTable('articles').onDelete('CASCADE');
    table.integer('author_id').notNullable().references('id').inTable('users').onDelete('RESTRICT');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTable('comments');
}
