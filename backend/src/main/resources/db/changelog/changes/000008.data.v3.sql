--liquibase formatted sql

--changeset system:cd_request_status_psc_granted_no_vms_on dbms:mssql logicalFilePath:BOOT-INF/classes/db/changelog/changes/data/db.data.v3.sql
SET IDENTITY_INSERT CD_REQUEST_STATUS ON;

--changeset system:cd_request_status_psc_granted_no_vms dbms:mssql,h2 logicalFilePath:BOOT-INF/classes/db/changelog/changes/data/db.data.v3.sql
INSERT INTO [CD_REQUEST_STATUS] ([ID], [CODE], [NAME_EN], [NAME_FR], [EFFECTIVE_DATE], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES
(11, 'PSC_GRANTED_NO_VMS', 'PSC Clearance Granted - No VMS', 'Autorisation de la CFP accordée - Pas de VMS', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:cd_request_status_psc_granted_no_vms_off dbms:mssql logicalFilePath:BOOT-INF/classes/db/changelog/changes/data/db.data.v3.sql
SET IDENTITY_INSERT CD_REQUEST_STATUS OFF;
