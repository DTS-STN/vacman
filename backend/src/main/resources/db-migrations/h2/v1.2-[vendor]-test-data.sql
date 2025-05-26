-- email definition

INSERT INTO [email]
(
  [id],
  [address]
)
VALUES
  (2, 'one@example.org'),
  (3, 'two@example.org'),
  (4, 'three@example.org'),
  (5, 'four@example.org'),
  (6, 'hadvisor1@example.org'),
  (7, 'hadvisor2@example.org'),
  (8, 'five@example.org'),
  (9, 'six@example.com'),
  (10, 'seven@example.com'),
  (11, 'eight@example.com'),
  (12, 'nine@example.com'),
  (13, 'ten@example.com');

-- name definition

INSERT INTO [name]
(
  [id],
  [value]
)
VALUES
  (2, 'John Doe'),
  (3, 'Jack Doe'),
  (4, 'Jane Doe'),
  (5, 'Jane Smith'),
  (6, 'Jamie Smith'),
  (7, 'HR Advisor Name 1'),
  (8, 'HR Advisor Name 2');

-- phone definition

INSERT INTO [phone]
(
  [id],
  [number]
)
VALUES
  (2, '11111111111'),
  (3, '11111111112'),
  (4, '11111111113'),
  (5, '11111111114'),
  (6, '11111111115'),
  (7, '11111111116'),
  (8, '11111111117'),
  (9, '11111111161'),
  (10, '11111111171'),
  (11, '11111111181'),
  (12, '11111111191'),
  (13, '11111111101');

-- user definition

INSERT INTO [user]
(
  [id],
  [fk_name_id],
  [fk_email_id],
  [fk_lang_pref_id],
  [fk_phone_id],
  [uuid],
  [network_id],
  [created_by],
  [last_modified_by]
)
VALUES
  (2, 2, 2, 3, 2, 'e15a1fa3-27ae-1111-a9d7-3ce5ad613780', 'Doe, John', 2, 2),
  (3, 3, 3, 2, 3, '83b5de63-7d69-2222-a98f-f8013fc28a04', 'Doe, Jack', 3, 3),
  (4, 4, 4, 1, 4, '83b5de63-7d69-3333-a98f-f8013fc28a04', 'Doe, Jane', 4, 4),
  (5, 5, 5, 3, 5, '83b5de63-7d69-4444-a98f-f8013fc28a04', 'Smith, Jane', 5, 5),
  (6, 6, 6, 2, 6, '83b5de63-7d69-5555-a98f-f8013fc28a04', 'Smith, Jamie', 6, 6),
  (7, 7, 7, 2, 7, '83b5de63-7d69-6666-a98f-f8013fc28a04', 'Advisor, John', 7, 7),
  (8, 8, 8, 2, 8, '83b5de63-7d69-7777-a98f-f8013fc28a04', 'Advisor, Jane', 8, 8);

-- title definition

INSERT INTO [title] 
(
  [id],
  [name],
  [created_by],
  [last_modified_by]
)
VALUES
  (1, 'Position Title 1', 7, 7),
  (2, 'position Title 2', 8, 8),
  (3, 'posItion Title 4', 7, 7),
  (4, 'Position title 8', 8, 8),
  (5, 'position title 5', 7, 7);


-- request definition

INSERT INTO [request]
(
  [id],
  [fk_title_id],
  [fk_location_id],
  [fk_group_id],
  [fk_level_id],
  [fk_education_req_id],
  [fk_language_profile_id],
  [fk_lang_equivalent_id],
  [fk_security_clearance_id],
  [created_by],
  [last_modified_by]
)
VALUES
  (1, 1, 1, 1, 1, 1, 3, 1, 1, 7, 7),
  (2, 2, 2, 1, 2, 2, 2, 2, 2, 8, 8),
  (3, 3, 3, 2, 3, 1, 1, 3, 3, 7, 7),
  (4, 4, 4, 4, 4, 1, 3, 4, 4, 8, 8),
  (5, 5, 5, 5, 4, 2, 1, 5, 5, 7, 7);

-- actions data

INSERT INTO [actions]
(
  [id],
  [free_text],
  [feedback], 
  [assessment_result],
  [created_by],
  [last_modified_by]
)
VALUES
  (1, 'free_text 1', 'feedback 1', 'assessment_result 1', 7, 7),
  (2, 'free_text 2', 'feedback 2', 'assessment_result 2', 8, 8),
  (3, 'free_text 3', 'feedback 3', 'assessment_result 3', 7, 7),
  (4, 'free_text 4', 'feedback 4', 'assessment_result 4', 8, 8),
  (5, 'free_text 5', 'feedback 5', 'assessment_result 5', 7, 7);

-- profile definition

INSERT INTO [profile]
(
  [id],
  [fk_user_id],
  [fk_work_location_id],
  [fk_substantive_group_id],
  [fk_substantive_level_id],
  [fk_education_level],
  [fk_personal_email_id],
  [fk_personal_phone_id],
  [fk_security_clearance_id],
  [fk_lang_equivalents_id],
  [fk_wfa_status_id],
  [fk_hr_advisor_id],
  [created_by],
  [last_modified_by]
)
VALUES
  (1, 2, 1, 1, 1, 1, 9, 9, 1, 3, 1, 7, 2, 2),
  (2, 3, 2, 2, 2, 2, 10, 10, 2, 2, 2, 8, 3, 3),
  (3, 4, 3, 3, 3, 1, 11, 11, 3, 1, 3, 7, 4, 4),
  (4, 5, 4, 4, 4, 2, 12, 12, 4, 3, 4, 8, 5, 5),
  (5, 6, 5, 5, 5, 1, 13, 13, 5, 2, 5, 7, 6, 6);

-- join_profile_request definition

INSERT INTO [join_profile_request]
(
  [id],
  [fk_profile_id],
  [fk_request_id],
  [fk_request_status_id],
  [fk_actions_id],
  [created_by],
  [last_modified_by]
)
VALUES
  (1, 1, 1, 1, 1, 6, 6),
  (2, 2, 2, 2, 2, 7, 7),
  (3, 3, 3, 3, 3, 7, 7),
  (4, 4, 4, 4, 4, 6, 6),
  (5, 5, 5, 5, 5, 7, 7);
