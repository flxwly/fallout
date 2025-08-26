create table public.user_profiles (
                                      id uuid not null default gen_random_uuid (),
                                      username text not null,
                                      email text not null,
                                      role text not null default 'student'::text,
                                      knowledge_points bigint not null default '0'::bigint,
                                      dose_msv double precision not null default '0'::double precision,
                                      created_at timestamp with time zone not null default now(),
                                      constraint user_profiles_pkey primary key (id),
                                      constraint user_profiles_id_fkey foreign KEY (id) references auth.users (id)
) TABLESPACE pg_default;