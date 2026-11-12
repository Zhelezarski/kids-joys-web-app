-- =====================================================================
--  Kids Joy – baza
--  Zaženi v Supabase: SQL Editor → New query → prilepi → Run.
--  Skripto lahko zaženeš večkrat.
-- =====================================================================

-- ---------- Admini ----------
create table if not exists public.admini (
  user_id uuid primary key references auth.users on delete cascade
);

create or replace function public.je_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admini where user_id = auth.uid());
$$;
grant execute on function public.je_admin() to anon, authenticated;

-- ---------- Nastavitve (ena vrstica, JSON) ----------
create table if not exists public.nastavitve (
  id int primary key default 1 check (id = 1),
  podatki jsonb not null default '{}'::jsonb,
  posodobljeno timestamptz not null default now()
);

-- ---------- Ponudba: igrala in dekoracije ----------
create table if not exists public.ponudba (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  kategorija text not null check (kategorija in ('igralo', 'dekoracija')),
  ime text not null,
  kratek_opis text not null default '',
  opis text not null default '',
  cena numeric(8, 2),
  mere text not null default '',
  starost text not null default '',
  nosilnost text not null default '',
  znacilnosti text[] not null default '{}',
  slike text[] not null default '{}',
  barve text[] not null default '{}',
  oblika text not null default 'grad' check (oblika in ('grad', 'tobogan', 'zogice', 'baloni')),
  aktivno boolean not null default true,
  vrstni_red int not null default 0,
  ustvarjeno timestamptz not null default now()
);

-- ---------- Rezervacije ----------
create table if not exists public.rezervacije (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  datum date not null,
  kraj text not null check (char_length(kraj) between 1 and 200),
  prostor text not null default 'zunaj' check (prostor in ('zunaj', 'notri')),
  ime text not null check (char_length(ime) between 1 and 200),
  telefon text not null check (char_length(telefon) between 3 and 40),
  email text not null default '' check (char_length(email) <= 200),
  opomba text not null default '' check (char_length(opomba) <= 2000),
  postavke jsonb not null default '[]'::jsonb,
  skupaj numeric(8, 2) not null default 0,
  status text not null default 'nova' check (status in ('nova', 'potrjena', 'zavrnjena', 'zakljucena')),
  opomba_admin text not null default ''
);
create index if not exists rezervacije_datum on public.rezervacije (datum);

-- ---------- Pravice (Row Level Security) ----------
alter table public.admini enable row level security;
alter table public.nastavitve enable row level security;
alter table public.ponudba enable row level security;
alter table public.rezervacije enable row level security;

drop policy if exists "admini berejo" on public.admini;
create policy "admini berejo" on public.admini for select using (public.je_admin());

drop policy if exists "javno branje" on public.nastavitve;
create policy "javno branje" on public.nastavitve for select using (true);
drop policy if exists "admin ureja" on public.nastavitve;
create policy "admin ureja" on public.nastavitve for all using (public.je_admin()) with check (public.je_admin());

drop policy if exists "javno branje aktivnih" on public.ponudba;
create policy "javno branje aktivnih" on public.ponudba for select using (aktivno or public.je_admin());
drop policy if exists "admin ureja" on public.ponudba;
create policy "admin ureja" on public.ponudba for all using (public.je_admin()) with check (public.je_admin());

-- Obiskovalci lahko samo oddajo novo rezervacijo, ne morejo je brati.
drop policy if exists "oddaja rezervacije" on public.rezervacije;
create policy "oddaja rezervacije" on public.rezervacije for insert to anon, authenticated
  with check (status = 'nova' and opomba_admin = '' and datum >= current_date);
drop policy if exists "admin ureja" on public.rezervacije;
create policy "admin ureja" on public.rezervacije for all using (public.je_admin()) with check (public.je_admin());

-- Katera igrala so na dan že zasedena (brez osebnih podatkov).
create or replace function public.zasedena_igrala(d date) returns setof text
language sql stable security definer set search_path = public as $$
  select distinct p->>'slug'
  from public.rezervacije r cross join lateral jsonb_array_elements(r.postavke) p
  where r.datum = d and r.status in ('nova', 'potrjena') and p->>'kategorija' = 'igralo';
$$;
grant execute on function public.zasedena_igrala(date) to anon, authenticated;

-- ---------- Shramba slik ----------
insert into storage.buckets (id, name, public) values ('slike', 'slike', true)
  on conflict (id) do nothing;

drop policy if exists "kidsjoy javne slike" on storage.objects;
create policy "kidsjoy javne slike" on storage.objects for select using (bucket_id = 'slike');
drop policy if exists "kidsjoy admin nalaga" on storage.objects;
create policy "kidsjoy admin nalaga" on storage.objects for insert to authenticated
  with check (bucket_id = 'slike' and public.je_admin());
drop policy if exists "kidsjoy admin posodablja" on storage.objects;
create policy "kidsjoy admin posodablja" on storage.objects for update to authenticated
  using (bucket_id = 'slike' and public.je_admin());
drop policy if exists "kidsjoy admin brise" on storage.objects;
create policy "kidsjoy admin brise" on storage.objects for delete to authenticated
  using (bucket_id = 'slike' and public.je_admin());

-- =====================================================================
--  ADMIN UPORABNIK
--  1. Authentication → Users → Add user → Create new user (e-pošta + geslo,
--     označi "Auto Confirm User").
--  2. Spodaj vpiši isto e-pošto in zaženi samo ta stavek:
--
--  insert into public.admini (user_id)
--  select id from auth.users where email = 'tvoj@email.si'
--  on conflict do nothing;
--
--  Priporočeno: Authentication → Sign In / Providers → izklopi
--  "Allow new users to sign up", da se nihče drug ne more registrirati.
-- =====================================================================

-- ---------- Samodejne admin pravice za izbrane e-pošte ----------
create table if not exists public.admin_emaili (email text primary key);
alter table public.admin_emaili enable row level security;
drop policy if exists "admini berejo emaile" on public.admin_emaili;
create policy "admini berejo emaile" on public.admin_emaili for select using (public.je_admin());
insert into public.admin_emaili (email) values ('bzelezarski@gmail.com'), ('kidsjoy.igrala@gmail.com') on conflict do nothing;

create or replace function public.nov_uporabnik_admin() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.admin_emaili where lower(email) = lower(new.email)) then
    insert into public.admini (user_id) values (new.id) on conflict do nothing;
  end if;
  return new;
end;
$$;
revoke execute on function public.nov_uporabnik_admin() from public, anon, authenticated;

drop trigger if exists kidsjoy_nov_uporabnik_admin on auth.users;
create trigger kidsjoy_nov_uporabnik_admin
  after insert on auth.users
  for each row execute function public.nov_uporabnik_admin();

-- ---------- GDPR: potrditev pogojev in samodejno brisanje ----------
alter table public.rezervacije add column if not exists sprejeti_pogoji boolean not null default false;

alter policy "oddaja rezervacije" on public.rezervacije
  with check (status = 'nova' and opomba_admin = '' and datum >= current_date and sprejeti_pogoji = true);

-- Rezervacije se izbrišejo 12 mesecev po datumu dogodka (vsak dan ob 3:17 UTC).
create extension if not exists pg_cron with schema pg_catalog;
select cron.unschedule('kidsjoy-brisanje-starih-rezervacij')
  where exists (select 1 from cron.job where jobname = 'kidsjoy-brisanje-starih-rezervacij');
select cron.schedule(
  'kidsjoy-brisanje-starih-rezervacij',
  '17 3 * * *',
  $$delete from public.rezervacije where datum < current_date - interval '12 months'$$
);

-- ---------- E-poštna obvestila ----------
-- Edge Function "obvestila" (supabase/functions/obvestila) pošilja e-pošto prek Brevo.
-- Baza jo kliče prek pg_net; zahtevo podpiše skrivnost iz Vaulta, ki jo funkcija preveri
-- z RPC obvestila_skrivnost() (dostopen samo service_role). Ročno je treba nastaviti le
-- skrivnost BREVO_API_KEY v Supabase → Edge Functions → Secrets (glej ADMIN.md).
create extension if not exists pg_net with schema extensions;

select vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'kidsjoy_obvestila_skrivnost', 'Podpis zahtev baza → Edge Function obvestila')
  where not exists (select 1 from vault.secrets where name = 'kidsjoy_obvestila_skrivnost');

create or replace function public.obvestila_skrivnost() returns text
language sql stable security definer set search_path = public as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'kidsjoy_obvestila_skrivnost';
$$;
revoke execute on function public.obvestila_skrivnost() from public, anon, authenticated;
grant execute on function public.obvestila_skrivnost() to service_role;

-- Dnevnik poslanih e-poštnih sporočil (brez vsebine; za prikaz v adminu in preprečevanje dvojnikov).
create table if not exists public.email_dnevnik (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  rezervacija_id uuid references public.rezervacije on delete cascade,
  vrsta text not null,
  uspeh boolean not null default false,
  napaka text not null default ''
);
create index if not exists email_dnevnik_rezervacija on public.email_dnevnik (rezervacija_id);
alter table public.email_dnevnik enable row level security;
drop policy if exists "admini berejo" on public.email_dnevnik;
create policy "admini berejo" on public.email_dnevnik for select using (public.je_admin());

-- Pošlje dogodek Edge Functionu (asinhrono, po commitu transakcije). Napaka nikoli ne ustavi rezervacije.
-- Ob prenosu na drug projekt zamenjaj ref v URL-ju.
create or replace function public.obvestila_poslji(dogodek text, rez uuid default null) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare s text;
begin
  s := public.obvestila_skrivnost();
  if s is null then return; end if;
  perform net.http_post(
    url := 'https://ndbekxmysqgmqrrllbfm.supabase.co/functions/v1/obvestila',
    body := jsonb_build_object('dogodek', dogodek, 'id', rez),
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-kidsjoy-skrivnost', s),
    timeout_milliseconds := 15000
  );
exception when others then
  raise warning 'kidsjoy obvestila: %', sqlerrm;
end;
$$;
revoke execute on function public.obvestila_poslji(text, uuid) from public, anon, authenticated;

-- Nova rezervacija s strani → lastnik + stranka; ročno vnesena potrjena (admin) → potrditev stranki;
-- sprememba statusa v potrjena/zavrnjena → stranki.
create or replace function public.rezervacija_obvestila() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if public.je_admin() then
      if new.status = 'potrjena' then perform public.obvestila_poslji('potrjena', new.id); end if;
    else
      perform public.obvestila_poslji('nova', new.id);
    end if;
  elsif new.status is distinct from old.status and new.status in ('potrjena', 'zavrnjena') then
    perform public.obvestila_poslji(new.status, new.id);
  end if;
  return new;
end;
$$;
revoke execute on function public.rezervacija_obvestila() from public, anon, authenticated;

drop trigger if exists kidsjoy_rezervacija_obvestila on public.rezervacije;
create trigger kidsjoy_rezervacija_obvestila
  after insert or update of status on public.rezervacije
  for each row execute function public.rezervacija_obvestila();

-- Vsak dan ob 16:07 UTC (17:07 / 18:07 po slovenskem času): opomniki strankam za jutri in povzetek lastniku.
select cron.unschedule('kidsjoy-dnevna-obvestila')
  where exists (select 1 from cron.job where jobname = 'kidsjoy-dnevna-obvestila');
select cron.schedule('kidsjoy-dnevna-obvestila', '7 16 * * *', $$select public.obvestila_poslji('dnevno')$$);

-- Brisanje starih rezervacij zdaj briše tudi stare vnose dnevnika e-pošte.
select cron.unschedule('kidsjoy-brisanje-starih-rezervacij')
  where exists (select 1 from cron.job where jobname = 'kidsjoy-brisanje-starih-rezervacij');
select cron.schedule(
  'kidsjoy-brisanje-starih-rezervacij',
  '17 3 * * *',
  $$delete from public.rezervacije where datum < current_date - interval '12 months';
    delete from public.email_dnevnik where created_at < now() - interval '12 months'$$
);
