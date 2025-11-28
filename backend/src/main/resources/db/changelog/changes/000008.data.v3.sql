--liquibase formatted sql

--changeset system:cd_request_status_psc_granted_no_vms_on dbms:mssql
SET IDENTITY_INSERT CD_REQUEST_STATUS ON;

--changeset system:cd_request_status_psc_granted_no_vms dbms:mssql,h2
INSERT INTO [CD_REQUEST_STATUS] ([ID], [CODE], [NAME_EN], [NAME_FR], [EFFECTIVE_DATE], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES
(11, 'PSC_GRANTED_NO_VMS', 'PSC Clearance Granted - No VMS', 'Autorisation de la CFP accordée - Pas de VMS', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:cd_request_status_psc_granted_no_vms_off dbms:mssql
SET IDENTITY_INSERT CD_REQUEST_STATUS OFF;

--changeset system:update-cd-request-status-names-nov-2025 dbms:mssql,h2
UPDATE CD_REQUEST_STATUS SET NAME_EN = 'No match - HR Review', NAME_FR = 'Aucun profil repéré - Revue RH' WHERE CODE = 'NO_MATCH_HR_REVIEW';
UPDATE CD_REQUEST_STATUS SET NAME_EN = 'Approved - Assessment Feedback Pending', NAME_FR = 'Approuvée - En attente de rétroaction d''évaluation' WHERE CODE = 'FDBK_PENDING';
UPDATE CD_REQUEST_STATUS SET NAME_EN = 'Pending - Feedback Pending Approval', NAME_FR = 'En attente - rétroaction d''évaluation en attente d''approbation' WHERE CODE = 'FDBK_PEND_APPR';
UPDATE CD_REQUEST_STATUS SET NAME_EN = 'VMS request on Hold - Pending PSC clearance', NAME_FR = 'Demande VMS en suspens - En attente de l''autorisation de la CFP' WHERE CODE = 'PENDING_PSC';
UPDATE CD_REQUEST_STATUS SET NAME_EN = 'VMS not required - Pending PSC clearance', NAME_FR = 'Demande VMS non-requise - En attente de l''autorisation de la CFP' WHERE CODE = 'PENDING_PSC_NO_VMS';
UPDATE CD_REQUEST_STATUS SET NAME_EN = 'Clearance Granted', NAME_FR = 'Autorisation accordée' WHERE CODE = 'CLR_GRANTED';
UPDATE CD_REQUEST_STATUS SET NAME_EN = 'PSC Clearance Granted', NAME_FR = 'Autorisation de la CFP accordée' WHERE CODE = 'PSC_GRANTED';

