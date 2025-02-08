create table
  public.claims (
    id uuid not null default gen_random_uuid (),
    employee_id uuid not null,
    amount numeric not null,
    submitted_on timestamp without time zone not null default now(),
    approved_on timestamp without time zone null default now(),
    constraint claims_pkey primary key (id),
    constraint claims_employee_id_fkey foreign key (employee_id) references auth.users (id) on update cascade on delete cascade
  ) tablespace pg_default;