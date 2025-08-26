create table public.levels
(
    id         text                        not null default gen_random_uuid(),
    title      text                        not null default ''::text,
    intro_text text                        null     default ''::text,
    topic_tag  text                        not null default ''::text,
    ordering   bigint                      not null,
    is_active  boolean                     not null default 'false'::boolean,
    created_at timestamp with time zone    not null default now(),
    updated_at timestamp without time zone not null default now(),
    constraint levels_pkey primary key (id)
) TABLESPACE pg_default;