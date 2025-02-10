create table
  public.profiles (
    id uuid not null,
    email character varying not null,
    first_name text not null,
    last_name text null,
    role text not null default 'employee'::text,
    constraint profiles_pkey primary key (id),
    constraint profiles_id_fkey foreign key (id) references auth.users (id) on delete cascade,
    constraint valid_role check (
      (
        role = any (
          array[
            'superadmin'::text,
            'admin'::text,
            'employee'::text
          ]
        )
      )
    )
  ) tablespace pg_default;