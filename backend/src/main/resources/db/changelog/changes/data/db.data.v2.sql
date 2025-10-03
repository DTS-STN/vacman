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
