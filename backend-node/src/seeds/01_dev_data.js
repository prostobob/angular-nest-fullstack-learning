/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Deletes ALL existing entries (CASCADE also clears articles, article_tags, favorites, ...)
  await knex.raw('TRUNCATE users, tags RESTART IDENTITY CASCADE');

  const [alice, bob, carol] = await knex('users')
    .insert([
      { username: 'alice', email: 'alice@test.io', password_hash: 'x' },
      { username: 'bob', email: 'bob@test.io', password_hash: 'x' },
      { username: 'carol', email: 'carol@test.io', password_hash: 'x' },
    ])
    .returning('id');

  // Article 1: 2 tags + 3 favorites. Article 2: nothing (empty-case check).
  const [popular] = await knex('articles')
    .insert([
      {
        slug: 'popular-tagged',
        title: 'Popular & tagged',
        description: '2 tags, 3 favorites',
        body: 'Lorem ipsum',
        author_id: alice.id,
      },
      {
        slug: 'lonely',
        title: 'Lonely',
        description: 'No tags, no favorites',
        body: 'Lorem ipsum',
        author_id: bob.id,
      },
    ])
    .returning('id');

  const [node, angular] = await knex('tags')
    .insert([{ name: 'node' }, { name: 'angular' }])
    .returning('id');

  await knex('article_tags').insert([
    { article_id: popular.id, tag_id: node.id },
    { article_id: popular.id, tag_id: angular.id },
  ]);

  await knex('favorites').insert([
    { user_id: alice.id, article_id: popular.id },
    { user_id: bob.id, article_id: popular.id },
    { user_id: carol.id, article_id: popular.id },
  ]);

  await knex('follows').insert([
    { follower_id: carol.id, followed_id: alice.id },
    { follower_id: alice.id, followed_id: bob.id },
  ]);
}
