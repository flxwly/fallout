create table public.user_level_progress
(
    id           uuid                        not null default gen_random_uuid(),
    user_id      uuid                        not null default gen_random_uuid(),
    level_id     text                        not null default gen_random_uuid(),
    completed    boolean                     not null default false,
    started_at   timestamp without time zone not null default now(),
    completed_at timestamp without time zone null,
    constraint user_level_progress_pkey primary key (id),
    constraint user_level_progress_user_id_fkey foreign KEY (user_id) references user_profiles (user_id) on update CASCADE on delete CASCADE,
    constraint user_level_progress_level_id_fkey foreign KEY (level_id) references levels (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;