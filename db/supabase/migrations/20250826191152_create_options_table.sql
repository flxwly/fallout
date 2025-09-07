create table public.options
(
    id             text   not null default gen_random_uuid(),
    task_id        text   not null default gen_random_uuid(),
    option_text    text   not null default ''::text,
    cost           bigint not null default 0,
    points_awarded bigint not null default 0,
    dose_delta_msv bigint not null default 0,
    correctness    int    not null default 0,
    constraint options_pkey primary key (id),
    constraint options_task_id_fkey foreign KEY (task_id) references public.tasks (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;