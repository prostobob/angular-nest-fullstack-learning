/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable('article_tags', function (table) {
    table.integer('article_id').notNullable().references('id').inTable('articles').onDelete('CASCADE');
    table.integer('tag_id').notNullable().references('id').inTable('tags').onDelete('CASCADE');
    table.primary(['article_id', 'tag_id']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTable('article_tags');
}
