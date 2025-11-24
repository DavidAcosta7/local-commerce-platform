-- Insert default achievements
insert into public.achievements (name, description, icon, points, requirement_type, requirement_count)
values
  ('Primera Opinión', 'Dejaste tu primer comentario', 'MessageSquare', 10, 'comments', 1),
  ('Comentarista Activo', 'Has dejado 10 comentarios', 'MessageSquarePlus', 50, 'comments', 10),
  ('Experto Local', 'Has dejado 50 comentarios', 'Award', 200, 'comments', 50),
  ('Popular', 'Tus comentarios recibieron 10 likes', 'ThumbsUp', 50, 'likes_received', 10),
  ('Influencer Local', 'Tus comentarios recibieron 50 likes', 'Star', 200, 'likes_received', 50),
  ('Emprendedor', 'Registraste tu primer comercio', 'Store', 100, 'merchants_registered', 1)
on conflict do nothing;

-- Insert sample categories (optional, for testing)
-- You can add sample merchants here if needed
