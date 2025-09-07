CREATE TYPE public.task_type AS ENUM ('MC', 'FREE');

create table public.tasks
(
    id                  text                     not null default gen_random_uuid(),
    level_id            text                     not null default gen_random_uuid(),
    type                public.task_type         not null default 'MC'::public.task_type,
    prompt_text         text                     not null default ''::text,
    evaluation_criteria text                     not null default ''::text,
    example_answer      text                     not null default ''::text,
    ordering            bigint                   not null,
    is_active           boolean                  not null default false,
    created_at          timestamp with time zone not null default now(),
    constraint tasks_pkey primary key (id),
    constraint tasks_level_id_fkey foreign KEY (level_id) references public.levels (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;