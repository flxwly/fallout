CREATE TYPE public.role AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');

create table public.user_profiles
(
    user_id          uuid                     not null,
    username         text                     not null,
    email            text                     not null,
    permission_level public.role              not null default 'STUDENT'::public.role,
    created_at       timestamp with time zone not null default now(),
    constraint user_profiles_pkey primary key (user_id),
    constraint user_profiles_user_id_fkey foreign KEY (user_id) references auth.users (id)
) TABLESPACE pg_default;
