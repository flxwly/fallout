create table public.attempts
(
    id           uuid                        not null default gen_random_uuid(),
    user_id      uuid                        not null default gen_random_uuid(),
    level_id     text                        not null,
    task_id      text                        not null,

    option_id    text                        null     default null,
    answer       text                        not null default ''::text,
    reasoning    text                        null     default ''::text,
    correctness  int                         not null default 0,

    points_got   bigint                      not null default '0'::bigint,
    dose_msv_got double precision            not null default '0'::double precision,

    ai_score     double precision            not null default '0'::double precision,
    ai_summary   text                        not null default ''::text,
    ai_good      text[]                      not null default '{}'::text[],
    ai_bad       text[]                      not null default '{}'::text[],

    timestamp    timestamp without time zone not null,


    constraint attempts_pkey primary key (id),
    constraint attempts_user_id_fkey foreign KEY (user_id) references user_profiles (user_id) on update CASCADE on delete CASCADE,
    constraint attempts_level_id_fkey foreign KEY (level_id) references levels (id) on update CASCADE on delete CASCADE,
    constraint attempts_task_id_fkey foreign KEY (task_id) references tasks (id) on update CASCADE on delete CASCADE,
    constraint attempts_option_id_fkey foreign KEY (option_id) references options (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;