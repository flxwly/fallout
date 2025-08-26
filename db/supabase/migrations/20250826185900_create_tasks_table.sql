create table public.tasks
(
    id          text                     not null default gen_random_uuid(),
    level_id    text                     not null default gen_random_uuid(),
    type        text                     not null default ''::text,
    prompt_text text                     not null default ''::text,
    ordering    bigint                   not null,
    is_active   boolean                  not null default false,
    created_at  timestamp with time zone not null default now(),
    constraint tasks_pkey primary key (id),
    constraint tasks_level_id_fkey foreign KEY (level_id) references public.levels (id) on update CASCADE
) TABLESPACE pg_default;