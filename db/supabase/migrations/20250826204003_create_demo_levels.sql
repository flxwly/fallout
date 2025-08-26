INSERT INTO public.levels (id, title, intro_text, topic_tag, ordering, is_active, created_at,
                               updated_at)
VALUES ('demo-level-1', 'Die verstrahlten Ruinen - Der Klamottenladen', 'Du erwachst in den Trümmern einer einst blühenden Stadt. Überall siehst du seltsame Warnschilder mit dem Strahlensymbol. Die Luft flimmert merkwürdig, und dein Geigerzähler klickt bedrohlich.

Auf der Ecke findest du einen halb-zerstörten Klamottenladen, in den du hineingehst. Ein alter Mann verkauft dort übrig gebliebene Kleidung und andere nützliche Dinge.

Du hast wie in jedem Computerspiel eine Gesundheitsleiste, ein gewisses Budget und eine Wissensleiste. Dein Ziel ist es am Ende die beiden Leisten möglichst voll zu haben. Das Geld spielt am Ende keine große Rolle.

Deine Wissensleiste ist zu Beginn leer (0 WP), dein Dosimeter hat keine Strahlung gemessen (0mSv) und du besitzt 120€.

Doch Achtung: Zu viel Ausgaben direkt am Ende lassen euch wenig Geld für die weiteren Aufgaben. Die Gesundheitsleiste geht aufgrund der Radioaktivität so oder so runter. Ihr könnt sie nur verlangsamen. Einmal erlittene Schäden werden immer wieder abgezogen, sofern sie nicht geheilt werden.',
        'radioactivity', '1', 'true', '2025-08-26 19:49:04.391888+00', '2025-08-26 19:49:04.391888');


INSERT INTO public.tasks (id, level_id, type, prompt_text, ordering, is_active, created_at)
VALUES ('demo-task-2', 'demo-level-1', 'free',
        'Ein alter Wissenschaftler fragt dich: "Warum sind manche Atomkerne instabil und zerfallen radioaktiv?" Erkläre ihm deine Überlegungen zum Verhältnis von Protonen zu Neutronen.',
        '2', 'true', '2025-08-26 20:35:19.566144+00'),
       ('demo-task-shopping', 'demo-level-1', 'mc',
        'Du findest einen halb-zerstörten Klamottenladen, in den du hineingehst. Ein alter Mann verkauft dort übrig gebliebene Kleidung und andere nützliche Dinge. Du musst entscheiden, was du dort kaufen willst:',
        '1', 'true', '2025-08-26 20:34:51.32364+00');

INSERT INTO public.options (id, task_id, option_text, points_awarded, dose_delta_msv, is_correct)
VALUES ('demo-option-radiation-suit', 'demo-task-shopping',
        'B) Gelber Strahlenschutzanzug (50€) - Professioneller Schutz vor radioaktiver Strahlung', '8', '0', 'true'),
       ('demo-option-tshirt', 'demo-task-shopping', 'A) T-Shirt (0€) - Bietet keinen Schutz vor Strahlung', '2', '3',
        'false');

