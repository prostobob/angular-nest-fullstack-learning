/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable('favorites', function (table) {
    table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('article_id').notNullable().references('id').inTable('articles').onDelete('CASCADE');
    table.primary(['user_id', 'article_id']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTable('favorites');
}
