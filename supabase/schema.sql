-- A coller dans Supabase > SQL Editor > New query > Run.
-- Cree la table, active le temps reel, et ouvre l'acces a la cle anon.

create table if not exists public.events (
  id          uuid primary key,
  kind        text not null check (kind in ('pipi', 'caca', 'repas', 'promenade', 'dodo')),
  -- Debut de l'evenement. Pour un type instantane, c'est le moment tout court.
  happened_at timestamptz not null,
  -- Fin, pour les types a duree (promenade, dodo). NULL = instantane, ou en cours.
  ended_at    timestamptz,
  author      text not null,
  note        text,
  created_at  timestamptz not null default now(),
  constraint events_end_after_start check (ended_at is null or ended_at >= happened_at)
);

-- Si la table existait deja sans les durees, cette ligne suffit a la mettre a jour.
alter table public.events add column if not exists ended_at timestamptz;

create index if not exists events_happened_at_idx on public.events (happened_at desc);

-- Diffusion temps reel vers les deux telephones.
alter publication supabase_realtime add table public.events;

alter table public.events enable row level security;

-- MODELE DE SECURITE : n'importe qui connaissant l'URL du site peut lire et
-- ecrire. C'est volontaire pour une app a deux, sans compte a creer. Le lien
-- de deploiement est donc un secret : ne le publie pas.
-- Si tu veux verrouiller plus tard, remplace ces policies par une regle basee
-- sur auth.uid() et ajoute un vrai login Supabase.
drop policy if exists "acces partage" on public.events;
create policy "acces partage" on public.events
  for all
  using (true)
  with check (true);
