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
