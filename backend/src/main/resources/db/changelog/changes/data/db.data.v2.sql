--liquibase formatted sql

--------------------------------------------------------------------------------

--
-- Remove the CASUAL and STUDENT codes from CD_EMPLOYMENT_TENURE
--

--changeset system:remove_cd_employment_tenure_rows dbms:mssql,h2
DELETE FROM [CD_EMPLOYMENT_TENURE] WHERE [ID] IN (2, 3);

--------------------------------------------------------------------------------

--
-- Remove the CASUAL and TERM codes from CD_WORK_SCHEDULE
--

--changeset system:remove_cd_work_schedule_rows dbms:mssql,h2
DELETE FROM [CD_WORK_SCHEDULE] WHERE [ID] IN (2, 3);

--------------------------------------------------------------------------------

--
-- Adding the DIE code to CD_SELECTION_PROCESS_TYPE  AB#7208
--

--changeset system:cd_selection_process_type_adding_DIE_on dbms:mssql
SET IDENTITY_INSERT CD_SELECTION_PROCESS_TYPE ON;

--changeset system:cd_selection_process_type_adding_DIE dbms:mssql,h2
INSERT INTO [CD_SELECTION_PROCESS_TYPE] ([ID], [CODE], [NAME_EN], [NAME_FR], [EFFECTIVE_DATE], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES
(10, 'DIE', 'Deployment - Indeterminate (refer to exceptions)', 'Mutation - Durée indéterminée (veuillez consulter les exceptions)', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:cd_selection_process_type_adding_DIE_off dbms:mssql
SET IDENTITY_INSERT CD_SELECTION_PROCESS_TYPE OFF;

--------------------------------------------------------------------------------

--
-- Update French names for selection process types, employment tenure, and security clearance
--

--changeset system:update_cd_selection_process_type_fr_names dbms:mssql,h2
UPDATE [CD_SELECTION_PROCESS_TYPE]
SET [NAME_FR] = CASE [CODE]
  WHEN 'AEA' THEN 'Nomination - Externe annoncée (de l''extérieur de la fonction publique)'
  WHEN 'AENA' THEN 'Nomination - Externe non-annoncée (de l''extérieur de la fonction publique)'
  WHEN 'AIA' THEN 'Nomination - Interne annoncée (au sein de la fonction publique)'
  WHEN 'AINA' THEN 'Nomination - Interne non-annoncée (au sein de la fonction publique)'
  WHEN 'IAP' THEN 'Initiation d''un processus annoncée (Interne ou externe)'
  ELSE [NAME_FR]
END
WHERE [CODE] IN ('AEA', 'AENA', 'AIA', 'AINA', 'IAP');

--changeset system:update_cd_employment_tenure_fr_name dbms:mssql,h2
UPDATE [CD_EMPLOYMENT_TENURE] SET [NAME_FR] = 'Déterminée' WHERE [CODE] = 'TERM';

--changeset system:update_cd_security_clearance_fr_names dbms:mssql,h2
UPDATE [CD_SECURITY_CLEARANCE]
SET [NAME_FR] = CASE [CODE]
  WHEN 'ES-SA' THEN 'Secret avec fiabilité approfondie'
  WHEN 'ETS-TSA' THEN 'Très secret avec fiabilité approfondie'
  ELSE [NAME_FR]
END
WHERE [CODE] IN ('ES-SA', 'ETS-TSA');

--------------------------------------------------------------------------------

--
-- Add the NA-PD code to CD_MATCH_FEEDBACK
--

--changeset system:cd_match_feedback_adding_NA_PD_on dbms:mssql
SET IDENTITY_INSERT CD_MATCH_FEEDBACK ON;

--changeset system:cd_match_feedback_adding_NA_PD dbms:mssql,h2
INSERT INTO [CD_MATCH_FEEDBACK] ([ID], [CODE], [NAME_EN], [NAME_FR], [EFFECTIVE_DATE], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES
(8, 'NA-PD', 'Not available', 'Pas disponible', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:cd_match_feedback_adding_NA_PD_off dbms:mssql
SET IDENTITY_INSERT CD_MATCH_FEEDBACK OFF;

--------------------------------------------------------------------------------

--
-- Update the row for CAREERTRANSITION code to RELOCATION code in CD_WFA_STATUS
--

--changeset system:update_cd_wfa_status_row dbms:mssql,h2
UPDATE [CD_WFA_STATUS]
SET [CODE] = 'RELOCATION',
  [NAME_EN] = 'Relocation of a work unit',
  [NAME_FR] = 'Réinstallation d''une unité de travail',
  [SORT_ORDER] = 7,
  [EFFECTIVE_DATE] = '1970-01-01 00:00:00',
  [USER_UPDATED] = 'system',
  [DATE_UPDATED] = CURRENT_TIMESTAMP
WHERE [ID] = 7;


--------------------------------------------------------------------------------

--
-- Add the ALTERNATE_DELIVERY code to CD_WFA_STATUS
--

--changeset system:cd_wfa_status_on dbms:mssql
SET IDENTITY_INSERT CD_WFA_STATUS ON;

--changeset system:cd_wfa_status dbms:mssql,h2
INSERT INTO [CD_WFA_STATUS] ([ID], [CODE], [NAME_EN], [NAME_FR], [SORT_ORDER], [EFFECTIVE_DATE], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES (8, 'ALTERNATE_DELIVERY', 'Alternative delivery initiative', 'Diversification des modes d''exécution', 8, '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:cd_wfa_status_off dbms:mssql
SET IDENTITY_INSERT CD_WFA_STATUS OFF;

--------------------------------------------------------------------------------

--
-- Add the CRV code to CD_SELECTION_PROCESS_TYPE
--

--changeset system:cd_selection_process_type_on dbms:mssql
SET IDENTITY_INSERT CD_SELECTION_PROCESS_TYPE ON;

--changeset system:cd_selection_process_type dbms:mssql,h2
INSERT INTO [CD_SELECTION_PROCESS_TYPE] ([ID], [CODE], [NAME_EN], [NAME_FR], [EFFECTIVE_DATE], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES (11, 'CRV', 'Candidate referrals from VMS', 'Présentation de candidats du SGPV', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:cd_selection_process_type_off dbms:mssql
SET IDENTITY_INSERT CD_SELECTION_PROCESS_TYPE OFF;