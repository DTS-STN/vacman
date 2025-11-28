--liquibase formatted sql

--changeset system:update_cd_request_status_names_v4 dbms:mssql,h2 logicalFilePath:BOOT-INF/classes/db/changelog/changes/000009.data.v4.sql
UPDATE [CD_REQUEST_STATUS] SET [NAME_FR] = 'Aucun profil repéré - Revue RH' WHERE [CODE] = 'NO_MATCH_HR_REVIEW';

UPDATE [CD_REQUEST_STATUS] SET [NAME_EN] = 'Pending Feedback (Manager)', [NAME_FR] = 'Attente rétroaction (Gest.)' WHERE [CODE] = 'FDBK_PENDING';

UPDATE [CD_REQUEST_STATUS] SET [NAME_EN] = 'Pending Feedback Approval (HR)', [NAME_FR] = 'Attente approbation rétroaction (RH)' WHERE [CODE] = 'FDBK_PEND_APPR';

UPDATE [CD_REQUEST_STATUS] SET [NAME_EN] = 'Pending PSC Clearance', [NAME_FR] = 'Attente autorisation CFP' WHERE [CODE] = 'PENDING_PSC';

UPDATE [CD_REQUEST_STATUS] SET [NAME_EN] = 'Pending PSC Clearance', [NAME_FR] = 'Attente autorisation CFP' WHERE [CODE] = 'PENDING_PSC_NO_VMS';

UPDATE [CD_REQUEST_STATUS] SET [NAME_EN] = 'Clearance Granted', [NAME_FR] = 'Autorisation accordée' WHERE [CODE] = 'PSC_GRANTED';

UPDATE [CD_REQUEST_STATUS] SET [NAME_EN] = 'Clearance Granted', [NAME_FR] = 'Autorisation accordée' WHERE [CODE] = 'PSC_GRANTED_NO_VMS';
