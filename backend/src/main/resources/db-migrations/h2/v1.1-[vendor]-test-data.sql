-- email definition

INSERT INTO [email]
(
  [id],
  [address]
)
VALUES
  (1, 'one@hrsdc-rhdcc.gc.ca'),
  (2, 'two@hrsdc-rhdcc.gc.ca'),
  (3, 'three@hrsdc-rhdcc.gc.ca'),
  (4, 'four@hrsdc-rhdcc.gc.ca'),
  (5, 'five@hrsdc-rhdcc.gc.ca'),
  (6, 'hadvisor1@hrsdc-rhdcc.gc.ca'),
  (7, 'hadvisor2@hrsdc-rhdcc.gc.ca'),
  (8, 'six@personal.prv'),
  (9, 'seven@personal.prv'),
  (10, 'eight@personal.prv'),
  (11, 'nine@personal.prv'),
  (12, 'ten@personal.prv');

-- name definition

INSERT INTO [name]
(
  [id],
  [value]
)
VALUES
  (1, 'John Doe'),
  (2, 'Jack Doe'),
  (3, 'Jane Doe'),
  (4, 'Jane Smith'),
  (5, 'Jamie Smith'),
  (6, 'HR Advisor Name 1'),
  (7, 'HR Advisor Name 2');

-- phone definition

INSERT INTO [phone]
(
  [id],
  [number]
)
VALUES
  (1, '11111111111'),
  (2, '11111111112'),
  (3, '11111111113'),
  (4, '11111111114'),
  (5, '11111111115'),
  (6, '11111111116'),
  (7, '11111111117'),
  (8, '11111111161'),
  (9, '11111111171'),
  (10, '11111111181'),
  (11, '11111111191'),
  (12, '11111111101');

-- title definition

INSERT INTO [title] 
(
  [id],
  [name]
)
VALUES
  (1, 'Position Title 1'),
  (2, 'position Title 2'),
  (3, 'posItion Title 4'),
  (4, 'Position title 8'),
  (5, 'position title 5');

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
  (1, 1, 1, 3, 1, 'e15a1fa3-27ae-1111-a9d7-3ce5ad613780', 'Doe, John', 1, 1),
  (2, 2, 2, 2, 2, '83b5de63-7d69-2222-a98f-f8013fc28a04', 'Doe, Jack', 2, 2),
  (3, 3, 3, 1, 3, '83b5de63-7d69-3333-a98f-f8013fc28a04', 'Doe, Jane', 3, 3),
  (4, 4, 4, 3, 4, '83b5de63-7d69-4444-a98f-f8013fc28a04', 'Smith, Jane', 4, 4),
  (5, 5, 5, 2, 5, '83b5de63-7d69-5555-a98f-f8013fc28a04', 'Smith, Jamie', 5, 5),
  (6, 6, 6, 2, 6, '83b5de63-7d69-6666-a98f-f8013fc28a04', 'Advisor, John', 6, 6),
  (7, 7, 7, 2, 7, '83b5de63-7d69-7777-a98f-f8013fc28a04', 'Advisor, Jane', 7, 7);

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
  (1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1),
  (2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2),
  (3, 3, 3, 2, 3, 1, 1, 3, 3, 3, 3),
  (4, 4, 4, 4, 4, 1, 3, 4, 4, 4, 4),
  (5, 5, 5, 5, 4, 2, 1, 5, 5, 5, 5);

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
  (1, 'free_text 1', 'feedback 1', 'assessment_result 1', 6, 6),
  (2, 'free_text 2', 'feedback 2', 'assessment_result 2', 7, 7),
  (3, 'free_text 3', 'feedback 3', 'assessment_result 3', 6, 6),
  (4, 'free_text 4', 'feedback 4', 'assessment_result 4', 7, 7),
  (5, 'free_text 5', 'feedback 5', 'assessment_result 5', 6, 6);

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
  (1, 1, 1, 1, 1, 1, 8, 8, 1, 3, 1, 6, 1, 1),
  (2, 2, 2, 2, 2, 2, 9, 9, 2, 2, 2, 7, 2, 2),
  (3, 3, 3, 3, 3, 1, 10, 10, 3, 1, 3, 6, 3, 3),
  (4, 4, 4, 4, 4, 2, 11, 11, 4, 3, 4, 7, 4, 4),
  (5, 5, 5, 5, 5, 1, 12, 12, 5, 2, 5, 6, 5, 5);

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
