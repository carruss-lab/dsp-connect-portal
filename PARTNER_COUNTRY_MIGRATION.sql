-- Partner country, so payouts go the right way: Stripe in the United States, PartnerStack elsewhere.
-- Additive only: a new nullable column and two new functions. Existing functions are unchanged.
-- A partner with no country (everyone who applied before this) is treated as United States.
alter table public.partners add column if not exists country text;

create or replace function public.partner_set_country(p_secret text, p_email text, p_country text)
returns void language plpgsql security definer set search_path to '' as $function$
begin
  perform private.check_secret(p_secret);
  if p_country !~ '^[A-Z]{2}$' then return; end if;
  update public.partners set country = p_country
    where lower(email) = lower(trim(coalesce(p_email, ''))) and status = 'applied' and country is null;
end $function$;

create or replace function public.partner_country_by_token(p_secret text, p_token uuid)
returns text language plpgsql security definer set search_path to '' as $function$
begin
  perform private.check_secret(p_secret);
  return (select coalesce(p.country, 'US') from public.partners p where p.invite_token = p_token);
end $function$;

revoke all on function public.partner_set_country(text, text, text) from public, authenticated;
revoke all on function public.partner_country_by_token(text, uuid) from public, authenticated;
grant execute on function public.partner_set_country(text, text, text) to anon, service_role;
grant execute on function public.partner_country_by_token(text, uuid) to anon, service_role;
