create table public.attempts
(
    id           uuid             not null default gen_random_uuid(),
    user_id      uuid             not null default gen_random_uuid(),
    task_id      text             not null default gen_random_uuid(),
    answer       text             not null default ''::text,
    points_got   bigint           not null default '0'::bigint,
    dose_msv_got double precision not null default '0'::double precision,
    ai_feedback  text null,
    timestamp    timestamp without time zone not null,
    constraint attempts_pkey primary key (id),
    constraint attempts_user_id_fkey foreign KEY (user_id) references user_profiles (id) on update CASCADE,
    constraint attempts_task_id_fkey foreign KEY (task_id) references tasks (id) on update CASCADE
) TABLESPACE pg_default;