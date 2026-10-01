import 'dotenv/config';
import { db } from './db';

const viewerId: number | null = 3;

const query = db('articles as a')
  .select(
    'a.id',
    'a.author_id',
    db('favorites as f').select(db.raw('count(*)::int')).whereRaw('f.article_id = a.id').as('favorites_count'),
    db.raw("COALESCE(array_agg(t.name ORDER BY t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tag_list"),
    viewerId === null
      ? db.raw('false AS following')
      : db.raw('EXISTS (?) AS following', [
          db('follows as fo')
            .select(db.raw('1'))
            .where('fo.follower_id', viewerId)
            .whereRaw('fo.followed_id = a.author_id'),
        ]),
  )
  .leftJoin('article_tags as at', 'at.article_id', 'a.id')
  .leftJoin('tags as t', 't.id', 'at.tag_id')
  .groupBy('a.id');

console.log(query.toQuery());
console.log(await query);

await db.destroy();
