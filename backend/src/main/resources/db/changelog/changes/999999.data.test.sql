--liquibase formatted sql



-- =================================================================================================
-- USER DATA INSERTION
-- =================================================================================================

-- changeset system:user_identity_on context:dev dbms:mssql
SET IDENTITY_INSERT [USER] ON;

-- Insert a set of 15 test users into the USER table for development and testing purposes.
-- changeset system:insert_user_data context:dev dbms:mssql,h2
INSERT INTO [USER]
  ([ID],       [FIRST_NAME], [LAST_NAME],   [BUSINESS_EMAIL_ADDRESS],       [BUSINESS_PHONE_NUMBER], [LANGUAGE_ID], [MS_ENTRA_ID],                          [PERSONAL_RECORD_IDENTIFIER], [USER_TYPE_ID], [USER_CREATED], [DATE_CREATED])
VALUES
  (2147400000, 'Test',       'User 001',    'test.user.001@example.com',    '555-555-0001',          '1',           '00000000-0000-0000-0000-000000000000', '000000000',                  '0',            'system',       CURRENT_TIMESTAMP),
  (2147400001, 'Test',       'User 002',    'test.user.002@example.com',    '555-555-0002',          '1',           '00000000-0000-0000-0000-000000000001', '000000001',                  '0',            'system',       CURRENT_TIMESTAMP),
  (2147400002, 'Test',       'User 003',    'test.user.003@example.com',    '555-555-0003',          '1',           '00000000-0000-0000-0000-000000000002', '000000002',                  '0',            'system',       CURRENT_TIMESTAMP),
  (2147400003, 'Test',       'User 004',    'test.user.004@example.com',    '555-555-0004',          '1',           '00000000-0000-0000-0000-000000000003', '000000003',                  '0',            'system',       CURRENT_TIMESTAMP),
  (2147400004, 'Test',       'User 005',    'test.user.005@example.com',    '555-555-0005',          '1',           '00000000-0000-0000-0000-000000000004', '000000004',                  '0',            'system',       CURRENT_TIMESTAMP),
  (2147400005, 'Test',       'User 006',    'test.user.006@example.com',    '555-555-0006',          '1',           '00000000-0000-0000-0000-000000000005', '000000005',                  '0',            'system',       CURRENT_TIMESTAMP),
  (2147400006, 'Test',       'User 007',    'test.user.007@example.com',    '555-555-0007',          '1',           '00000000-0000-0000-0000-000000000006', '000000006',                  '0',            'system',       CURRENT_TIMESTAMP),
  (2147400007, 'Test',       'User 008',    'test.user.008@example.com',    '555-555-0008',          '1',           '00000000-0000-0000-0000-000000000007', '000000007',                  '0',            'system',       CURRENT_TIMESTAMP),
  (2147400008, 'Test',       'User 009',    'test.user.009@example.com',    '555-555-0009',          '1',           '00000000-0000-0000-0000-000000000008', '000000008',                  '0',            'system',       CURRENT_TIMESTAMP),
  (2147400009, 'Test',       'User 010',    'test.user.010@example.com',    '555-555-0010',          '1',           '00000000-0000-0000-0000-000000000009', '000000009',                  '0',            'system',       CURRENT_TIMESTAMP),
  (2147400010, 'Test',       'Advisor 001', 'test.advisor.001@example.com', '555-555-0011',          '1',           '00000000-0000-0000-0000-00000000000a', '000000010',                  '3',            'system',       CURRENT_TIMESTAMP),
  (2147400011, 'Test',       'Advisor 002', 'test.advisor.002@example.com', '555-555-0012',          '1',           '00000000-0000-0000-0000-00000000000b', '000000011',                  '3',            'system',       CURRENT_TIMESTAMP),
  (2147400012, 'Test',       'Advisor 003', 'test.advisor.003@example.com', '555-555-0013',          '1',           '00000000-0000-0000-0000-00000000000c', '000000012',                  '3',            'system',       CURRENT_TIMESTAMP),
  (2147400013, 'Test',       'Advisor 004', 'test.advisor.004@example.com', '555-555-0014',          '1',           '00000000-0000-0000-0000-00000000000d', '000000013',                  '3',            'system',       CURRENT_TIMESTAMP),
  (2147400014, 'Test',       'Advisor 005', 'test.advisor.005@example.com', '555-555-0015',          '1',           '00000000-0000-0000-0000-00000000000e', '000000014',                  '3',            'system',       CURRENT_TIMESTAMP);

-- changeset system:user_identity_off context:dev dbms:mssql
SET IDENTITY_INSERT [USER] OFF;



-- =================================================================================================
-- PROFILE DATA INSERTION
-- =================================================================================================

-- changeset system:profile_identity_on context:dev dbms:mssql
SET IDENTITY_INSERT [PROFILE] ON;

-- Insert a corresponding profile for each test employee created above.
-- changeset system:insert_profile_data context:dev dbms:mssql,h2
INSERT INTO [PROFILE]
  ([ID],       [USER_ID],  [USER_ID_HR_ADVISOR], [WFA_STATUS_ID], [CLASSIFICATION_ID], [CITY_ID], [WORK_UNIT_ID], [LANGUAGE_ID], [PROFILE_STATUS_ID], [PERSONAL_PHONE_NUMBER], [PERSONAL_EMAIL_ADDRESS],   [PRIVACY_CONSENT_IND], [AVAILABLE_FOR_REFERRAL_IND], [INTERESTED_IN_ALTERNATION_IND], [ADDITIONAL_COMMENT],               [USER_CREATED], [DATE_CREATED],    [WFA_START_DATE],  [WFA_END_DATE])
VALUES
  (2147400000, 2147400000, 2147400010,           0,               1,                   1,        42,              1,             0,                   '555-555-0001',          'personal.001@example.com', 'false',               'false',                      'false',                         'Generic user profile comment.',    'system',       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2147400001, 2147400001, 2147400011,           1,               1,                   1,        43,              1,             0,                   '555-555-0002',          'personal.002@example.com', 'false',               'false',                      'false',                         'Generic user profile comment.',    'system',       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2147400002, 2147400002, 2147400012,           2,               1,                   1,        44,              1,             0,                   '555-555-0003',          'personal.003@example.com', 'false',               'false',                      'false',                         'Generic user profile comment.',    'system',       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2147400003, 2147400003, 2147400013,           3,               1,                   1,        45,              1,             1,                   '555-555-0004',          'personal.004@example.com', 'false',               'false',                      'false',                         'Generic user profile comment.',    'system',       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2147400004, 2147400004, 2147400014,           4,               1,                   1,        46,              1,             1,                   '555-555-0005',          'personal.005@example.com', 'false',               'false',                      'false',                         'Generic user profile comment.',    'system',       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2147400005, 2147400005, 2147400010,           5,               1,                   1,        47,              1,             1,                   '555-555-0006',          'personal.006@example.com', 'false',               'false',                      'false',                         'Generic user profile comment.',    'system',       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2147400006, 2147400006, 2147400011,           6,               1,                   1,        48,              1,             1,                   '555-555-0007',          'personal.007@example.com', 'false',               'false',                      'false',                         'Generic user profile comment.',    'system',       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2147400007, 2147400007, 2147400012,           7,               1,                   1,        49,              1,             2,                   '555-555-0008',          'personal.008@example.com', 'false',               'false',                      'false',                         'Generic user profile comment.',    'system',       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2147400008, 2147400008, 2147400013,           8,               1,                   1,        50,              1,             2,                   '555-555-0009',          'personal.009@example.com', 'false',               'false',                      'false',                         'Generic user profile comment.',    'system',       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2147400009, 2147400009, 2147400014,           0,               1,                   1,        51,              1,             2,                   '555-555-0010',          'personal.010@example.com', 'false',               'false',                      'false',                         'Generic user profile comment.',    'system',       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- changeset system:profile_identity_off context:dev dbms:mssql
SET IDENTITY_INSERT [PROFILE] OFF;



-- =================================================================================================
-- PROFILE JOIN TABLE DATA
-- =================================================================================================

-- changeset system:profile_city_identity_on context:dev dbms:mssql
SET IDENTITY_INSERT [PROFILE_CITY] ON;

-- Insert records into the PROFILE_CITY join table, linking each test profile to a city.
-- changeset system:insert_profile_city_data context:dev dbms:mssql,h2
INSERT INTO [PROFILE_CITY]
  ([ID],       [PROFILE_ID], [CITY_ID], [USER_CREATED], [DATE_CREATED],    [USER_UPDATED], [DATE_UPDATED])
VALUES
  (2147400000, 2147400000,    1,        'system',       CURRENT_TIMESTAMP, 'system',       CURRENT_TIMESTAMP),
  (2147400001, 2147400001,    2,        'system',       CURRENT_TIMESTAMP, 'system',       CURRENT_TIMESTAMP),
  (2147400002, 2147400002,    3,        'system',       CURRENT_TIMESTAMP, 'system',       CURRENT_TIMESTAMP),
  (2147400003, 2147400003,    4,        'system',       CURRENT_TIMESTAMP, 'system',       CURRENT_TIMESTAMP),
  (2147400004, 2147400004,    5,        'system',       CURRENT_TIMESTAMP, 'system',       CURRENT_TIMESTAMP),
  (2147400005, 2147400005,    6,        'system',       CURRENT_TIMESTAMP, 'system',       CURRENT_TIMESTAMP),
  (2147400006, 2147400006,    7,        'system',       CURRENT_TIMESTAMP, 'system',       CURRENT_TIMESTAMP),
  (2147400007, 2147400007,    8,        'system',       CURRENT_TIMESTAMP, 'system',       CURRENT_TIMESTAMP),
  (2147400008, 2147400008,    9,        'system',       CURRENT_TIMESTAMP, 'system',       CURRENT_TIMESTAMP),
  (2147400009, 2147400009,   10,        'system',       CURRENT_TIMESTAMP, 'system',       CURRENT_TIMESTAMP);

-- changeset system:profile_city_identity_off context:dev dbms:mssql
SET IDENTITY_INSERT [PROFILE_CITY] OFF;

-- changeset system:profile_language_referral_type_identity_on context:dev dbms:mssql
SET IDENTITY_INSERT [PROFILE_LANGUAGE_REFERRAL_TYPE] ON;

-- Insert records into the PROFILE_LANGUAGE_REFERRAL_TYPE join table, linking profiles to language referral types.
-- changeset system:insert_profile_language_referral_type_data context:dev dbms:mssql,h2
INSERT INTO [PROFILE_LANGUAGE_REFERRAL_TYPE]
  ([id],       [PROFILE_ID], [LANGUAGE_REFERRAL_TYPE_ID], [USER_CREATED], [DATE_CREATED],    [USER_UPDATED], [DATE_UPDATED])
VALUES
  (2147400000, 2147400000,   1,                           'system',       CURRENT_TIMESTAMP, 'system',       CURRENT_TIMESTAMP),
  (2147400001, 2147400001,   2,                           'system',       CURRENT_TIMESTAMP, 'system',       CURRENT_TIMESTAMP),
  (2147400002, 2147400002,   1,                           'system',       CURRENT_TIMESTAMP, 'system',       CURRENT_TIMESTAMP),
  (2147400003, 2147400003,   2,                           'system',       CURRENT_TIMESTAMP, 'system',       CURRENT_TIMESTAMP),
  (2147400004, 2147400004,   1,                           'system',       CURRENT_TIMESTAMP, 'system',       CURRENT_TIMESTAMP),
  (2147400005, 2147400005,   2,                           'system',       CURRENT_TIMESTAMP, 'system',       CURRENT_TIMESTAMP),
  (2147400006, 2147400006,   1,                           'system',       CURRENT_TIMESTAMP, 'system',       CURRENT_TIMESTAMP),
  (2147400007, 2147400007,   2,                           'system',       CURRENT_TIMESTAMP, 'system',       CURRENT_TIMESTAMP),
  (2147400008, 2147400008,   1,                           'system',       CURRENT_TIMESTAMP, 'system',       CURRENT_TIMESTAMP),
  (2147400009, 2147400009,   2,                           'system',       CURRENT_TIMESTAMP, 'system',       CURRENT_TIMESTAMP);

-- changeset system:profile_language_referral_type_identity_off context:dev dbms:mssql
SET IDENTITY_INSERT [PROFILE_LANGUAGE_REFERRAL_TYPE] OFF;



-- =================================================================================================
-- RESEED MSSQL IDENTITY COUNTERS
--
-- Resets the identity seed for each table in MSSQL. This prevents collisions with the hardcoded
-- test data IDs. The seed is set to the highest existing ID that is NOT part of the test data
-- range (i.e., less than 2147400000). This ensures that the next auto-generated ID will be
-- max_id + 1, correctly following any pre-existing production data.
-- 'splitStatements:false' is required so Liquibase runs this as a single batch.
-- =================================================================================================

-- changeset splitStatements:false system:reseed_mssql context:dev dbms:mssql
DECLARE @max_user_id BIGINT;
SELECT @max_user_id = ISNULL(MAX([ID]), 0) FROM [USER] WHERE [ID] < 2147400000;
DBCC CHECKIDENT ([USER], RESEED, @max_user_id);

DECLARE @max_profile_id BIGINT;
SELECT @max_profile_id = ISNULL(MAX([ID]), 0) FROM [PROFILE] WHERE [ID] < 2147400000;
DBCC CHECKIDENT ([PROFILE], RESEED, @max_profile_id);

DECLARE @max_profile_city_id BIGINT;
SELECT @max_profile_city_id = ISNULL(MAX([ID]), 0) FROM [PROFILE_CITY] WHERE [ID] < 2147400000;
DBCC CHECKIDENT ([PROFILE_CITY], RESEED, @max_profile_city_id);

DECLARE @max_profile_language_referral_type_id BIGINT;
SELECT @max_profile_language_referral_type_id = ISNULL(MAX([ID]), 0) FROM [PROFILE_LANGUAGE_REFERRAL_TYPE] WHERE [ID] < 2147400000;
DBCC CHECKIDENT ([PROFILE_LANGUAGE_REFERRAL_TYPE], RESEED, @max_profile_language_referral_type_id);



-- =================================================================================================
-- RESEED H2 IDENTITY COUNTERS
--
-- Resets the identity sequence for each table in H2. This is the H2 equivalent of the MSSQL
-- reseeding operation above. It is set to restart at 1, which is suitable for a clean 'dev'
-- environment where no production data exists.
-- =================================================================================================

-- changeset splitStatements:false system:reseed_h2 context:dev dbms:h2
ALTER TABLE [USER] ALTER COLUMN [ID] RESTART WITH 1;
ALTER TABLE [PROFILE] ALTER COLUMN [ID] RESTART WITH 1;
ALTER TABLE [PROFILE_CITY] ALTER COLUMN [ID] RESTART WITH 1;
ALTER TABLE [PROFILE_LANGUAGE_REFERRAL_TYPE] ALTER COLUMN [ID] RESTART WITH 1;
