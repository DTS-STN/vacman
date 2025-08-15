--liquibase formatted sql

--changeset system:max_dummy_user_on context:mssql AND dev
SET IDENTITY_INSERT [USER] ON;

--changeset system:max_dummy_user context:dev
INSERT INTO [USER] ([ID], [BUSINESS_EMAIL_ADDRESS], [BUSINESS_PHONE_NUMBER], [FIRST_NAME], [INITIAL], [LANGUAGE_ID], [LAST_NAME], [MS_ENTRA_ID], [MIDDLE_NAME], [PERSONAL_RECORD_IDENTIFIER], [USER_TYPE_ID], [USER_CREATED], [DATE_CREATED])
VALUES
('400000000', 'the-worm-who-is-god@example.com', '1021913728', 'Leto II', null, '1', 'Atriedes', 'f38b7d5e-f49f-4abc-ad2c-695e4494e4ee', null, '2', '0', 'system', CURRENT_TIMESTAMP),
('840', 'maxwell.haley@hrsdc-rhdcc.gc.ca', '18196434806', 'Maxwell', 'R', '1', 'Haley', '04cce928-acc3-491f-805e-2a82e540e2f8', 'Read', '4', '3', 'system', CURRENT_TIMESTAMP);

--changeset system:max_dummy_user_off context:mssql AND dev
SET IDENTITY_INSERT [USER] OFF;

--changeset system:max_dummy_profile_on context:mssql AND dev
SET IDENTITY_INSERT [PROFILE] ON;

--changeset system:max_dummy_profile context:dev
INSERT INTO [PROFILE] ([ID], [USER_ID], [USER_ID_HR_ADVISOR], [WFA_STATUS_ID], [CLASSIFICATION_ID], [CITY_ID], [WORK_UNIT_ID], [LANGUAGE_ID], [PROFILE_STATUS_ID], [PERSONAL_PHONE_NUMBER], [PERSONAL_EMAIL_ADDRESS], [PRIVACY_CONSENT_IND], [AVAILABLE_FOR_REFERRAL_IND], [INTERESTED_IN_ALTERNATION_IND], [ADDITIONAL_COMMENT], [USER_CREATED], [DATE_CREATED], [WFA_START_DATE], [WFA_END_DATE])
VALUES
(1, '400000000', '840', 1, 1, 1, 1, 1, 1, '5551113333', 'noah-arkwright@example.com', 'true', 'true', 'true', 'A giant worm God.', 'system', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, '840', '840', 1, 1, 1, 1, 1, 1, '5551113333', 'maxwell.r.haley@gmail.com', 'false', 'false', 'false', 'A normal sized human.', 'system', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, '840', '840', 1, 1, 1, 1, 1, 2, '5551113333', 'maxwell.r.haley@gmail.com', 'false', 'false', 'false', 'A normaler sized human.', 'system', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

--changeset system:max_dummy_profile_off context:mssql AND dev
SET IDENTITY_INSERT [PROFILE] OFF;

INSERT INTO [PROFILE_CITY] ([PROFILE_ID], [CITY_ID], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES
(1, 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

INSERT INTO [CLASSIFICATION_PROFILE] ([PROFILE_ID], [CLASSIFICATION_ID], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES
(1, 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

INSERT INTO [PROFILE_EMPLOYMENT_OPPORTUNITY] ([PROFILE_ID], [EMPLOYMENT_OPPORTUNITY_ID], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES
(1, 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

INSERT INTO [PROFILE_LANGUAGE_REFERRAL_TYPE] ([PROFILE_ID], [LANGUAGE_REFERRAL_TYPE_ID], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES
(1, 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);
