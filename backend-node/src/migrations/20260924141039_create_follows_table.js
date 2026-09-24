/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable('follows', function (table) {
    table.integer('follower_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('followed_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.primary(['follower_id', 'followed_id']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTable('follows');
}
