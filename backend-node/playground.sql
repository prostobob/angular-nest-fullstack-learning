SELECT a.id, a.author_id, EXISTS (SELECT 1 FROM follows fo WHERE fo.follower_id = NULL AND fo.followed_id = a.author_id) as following FROM articles a;
