--liquibase formatted sql

--changeset system:max_dummy_user_on context:dev dbms:mssql
SET IDENTITY_INSERT [USER] ON;

--changeset system:max_dummy_user context:dev dbms:mssql,h2
INSERT INTO [USER] ([ID], [BUSINESS_EMAIL_ADDRESS], [BUSINESS_PHONE_NUMBER], [FIRST_NAME], [INITIAL], [LANGUAGE_ID], [LAST_NAME], [MS_ENTRA_ID], [MIDDLE_NAME], [PERSONAL_RECORD_IDENTIFIER], [USER_TYPE_ID], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES
(40000, 'the-worm-who-is-god@example.com', '1021913728', 'Leto II', null, '1', 'Atriedes', 'f38b7d5e-f49f-4abc-ad2c-695e4494e4ee', null, '2', '0', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40001, 'faiza.jahanzeb@hrsdc-rhdcc.gc.ca', '1123456789', 'Faiza', null, '1', 'Jahanzeb', 'f38b7d5e-e49f-4abc-ad2c-695e4494e4ee', null, '2', '3', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40002, 'dario.au@hrsdc-rhdcc.gc.ca', '1123456789', 'Dario', null, '1', 'Au', 'f38b7d5e-f49f-4abc-fd2c-695e4494e4ee', null, '2', '3', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40003, 'marco.flores@hrsdc-rhdcc.gc.ca', '1123456789', 'Marco', null, '1', 'Flores', 'f38b7d5e-f49f-5abc-ad2c-695e4494e4ee', null, '2', '3', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40004, 'landon.a.harrison@hrsdc-rhdcc.gc.ca', '1123456789', 'Landon', null, '1', 'Harrison', 'f38b7d6e-f49f-4abc-ad2c-695e4494e4ee', null, '2', '3', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40005, 'jordan.willis@hrsdc-rhdcc.gc.ca', '1123456789', 'Jordan', null, '1', 'Willis', 'f38b7d5e-f496-4abc-ad2c-695e4494e4ee', null, '2', '3', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40006, 'gregory.j.baker@hrsdc-rhdcc.gc.ca', '1123456789', 'Gregory', null, '1', 'Baker', 'f38b7d5e-f4af-4abc-ad2c-695e4494e4ee', null, '2', '3', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40007, 'xuan.zhang@hrsdc-rhdcc.gc.ca', '1123456789', 'Xuan', null, '1', 'Zhang', 'f38b7d5e-f49f-4abc-af2c-695e4494e4ee', null, '2', '3', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40008, 'mazin.alkarkhi@hrsdc-rhdcc.gc.ca', '1123456789', 'Mazin', null, '1', 'Alkarkhi', 'f38b7d5e-f491-4abc-ad2c-695e4494e4ee', null, '2', '3', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40009, 'alex.soloviev@servicecanada.gc.ca', '1123456789', 'Alex', null, '1', 'Soloviev', 'f38b7d5e-f492-4abc-ad2c-695e4494e4ee', null, '2', '3', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40010, 'jacqueline.leclaire@hrsdc-rhdcc.gc.ca', '1123456789', 'Jacqueline', null, '1', 'Leclaire', 'f38c7d5e-f49f-4abc-ad2c-695e4494e4ee', null, '2', '3', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40011, 'marcus.blais@hrsdc-rhdcc.gc.ca', '1123456789', 'Marcus', null, '1', 'Blais', 'f38b7d5e-f49f-4abd-ad2c-695e4494e4ee', null, '2', '3', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40012, 'sebastien.comeau@hrsdc-rhdcc.gc.ca', '1123456789', 'Sébastien', null, '1', 'Comeau', 'f38b7d5e-a49f-4abc-ad2c-695e4494e4ee', null, '2', '3', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40013, 'adam.pcolinsky@hrsdc-rhdcc.gc.ca', '1123456789', 'Adam', null, '1', 'Pcolinsky', 'f38b7d5e-f49f-7abc-ad2c-695e4494e4ee', null, '2', '3', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40014, 'frank.basham@hrsdc-rhdcc.gc.ca', '1123456789', 'Frank', null, '1', 'Basham', 'f38b7d5e-f49f-4abc-bd2c-695e4494e4fe', null, '2', '3', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(840, 'maxwell.haley@hrsdc-rhdcc.gc.ca', '18196434806', 'Maxwell', 'R', '1', 'Haley', '04cce928-acc3-491f-805e-2a82e540e2f8', 'Read', '4', '3', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:max_dummy_user_off context:dev dbms:mssql
SET IDENTITY_INSERT [USER] OFF;

--changeset system:max_dummy_profile_on context:dev dbms:mssql
SET IDENTITY_INSERT [PROFILE] ON;

--changeset system:max_dummy_profile context:dev dbms:mssql,h2
INSERT INTO [PROFILE] ([ID], [USER_ID], [USER_ID_HR_ADVISOR], [WFA_STATUS_ID], [CLASSIFICATION_ID], [CITY_ID], [WORK_UNIT_ID], [LANGUAGE_ID], [PROFILE_STATUS_ID], [PERSONAL_PHONE_NUMBER], [PERSONAL_EMAIL_ADDRESS], [PRIVACY_CONSENT_IND], [AVAILABLE_FOR_REFERRAL_IND], [INTERESTED_IN_ALTERNATION_IND], [ADDITIONAL_COMMENT], [WFA_START_DATE], [WFA_END_DATE], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES
(40000, 40000, 840, 1, 1, 1, 1, 1, 1, '5551113333', 'noah-arkwright@example.com', 'true', 'true', 'true', 'A giant worm God.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40001, 840, 840, 1, 1, 1, 1, 1, 1, '5551113333', 'maxwell.r.haley@gmail.com', 'false', 'false', 'false', 'A normal sized human.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40015, 40001, 40001, 1, 1, 1, 1, 1, 1, '1987654321', 'faiza.jahanzeb@example.com', 'false', 'false', 'false', 'A normal sized human.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40016, 40002, 40002, 1, 1, 1, 1, 1, 1, '1987654321', 'dario.au@example.com', 'false', 'false', 'false', 'A normal sized human.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40003, 40003, 40003, 1, 1, 1, 1, 1, 1, '1987654321', 'marco.flores@example.com', 'false', 'false', 'false', 'A normal sized human.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40004, 40004, 40004, 1, 1, 1, 1, 1, 1, '1987654321', 'landon.a.harrison@example.com', 'false', 'false', 'false', 'A normal sized human.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40005, 40005, 40005, 1, 1, 1, 1, 1, 1, '1987654321', 'jordan.willis@example.com', 'false', 'false', 'false', 'A normal sized human.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40006, 40006, 40006, 1, 1, 1, 1, 1, 1, '1987654321', 'gregory.j.baker@example.com', 'false', 'false', 'false', 'A normal sized human.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40007, 40007, 40007, 1, 1, 1, 1, 1, 1, '1987654321', 'xuan.zhang@example.com', 'false', 'false', 'false', 'A normal sized human.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40008, 40008, 40008, 1, 1, 1, 1, 1, 1, '1987654321', 'mazin.alkarkhi@example.com', 'false', 'false', 'false', 'A normal sized human.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40009, 40009, 40009, 1, 1, 1, 1, 1, 1, '1987654321', 'alex.soloviev@example.com', 'false', 'false', 'false', 'A normal sized human.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40010, 40010, 40010, 1, 1, 1, 1, 1, 1, '1987654321', 'jacqueline.leclaire@example.com', 'false', 'false', 'false', 'A normal sized human.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40011, 40011, 40011, 1, 1, 1, 1, 1, 1, '1987654321', 'marcus.blais@example.com', 'false', 'false', 'false', 'A normal sized human.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40012, 40012, 40012, 1, 1, 1, 1, 1, 1, '1987654321', 'sebastien.comeau@example.com', 'false', 'false', 'false', 'A normal sized human.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40013, 40013, 40013, 1, 1, 1, 1, 1, 1, '1987654321', 'adam.pcolinsky@example.com', 'false', 'false', 'false', 'A normal sized human.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40014, 40014, 40014, 1, 1, 1, 1, 1, 1, '1987654321', 'frank.basham@example.com', 'false', 'false', 'false', 'A normal sized human.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(40002, 840, 840, 1, 1, 1, 1, 1, 2, '5551113333', 'maxwell.r.haley@gmail.com', 'false', 'false', 'false', 'A normaler sized human.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:max_dummy_profile_off context:dev dbms:mssql
SET IDENTITY_INSERT [PROFILE] OFF;

--changeset system:max_dummy_profile_connections context:dev dbms:mssql,h2
INSERT INTO [PROFILE_CITY] ([PROFILE_ID], [CITY_ID], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES
(40000, 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

INSERT INTO [CLASSIFICATION_PROFILE] ([PROFILE_ID], [CLASSIFICATION_ID], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES
(40000, 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

INSERT INTO [PROFILE_EMPLOYMENT_OPPORTUNITY] ([PROFILE_ID], [EMPLOYMENT_OPPORTUNITY_ID], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES
(40000, 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

INSERT INTO [PROFILE_LANGUAGE_REFERRAL_TYPE] ([PROFILE_ID], [LANGUAGE_REFERRAL_TYPE_ID], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES
(40000, 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);
