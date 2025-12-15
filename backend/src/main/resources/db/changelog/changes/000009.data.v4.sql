--liquibase formatted sql

--changeset system:update_cd_request_status_names_v4 dbms:mssql,h2 logicalFilePath:BOOT-INF/classes/db/changelog/changes/000009.data.v4.sql
UPDATE [CD_REQUEST_STATUS] SET [NAME_FR] = 'Aucun profil repéré - Revue RH' WHERE [CODE] = 'NO_MATCH_HR_REVIEW';

UPDATE [CD_REQUEST_STATUS] SET [NAME_EN] = 'Pending Feedback (Manager)', [NAME_FR] = 'Attente rétroaction (Gest.)' WHERE [CODE] = 'FDBK_PENDING';

UPDATE [CD_REQUEST_STATUS] SET [NAME_EN] = 'Pending Feedback Approval (HR)', [NAME_FR] = 'Attente approbation rétroaction (RH)' WHERE [CODE] = 'FDBK_PEND_APPR';

UPDATE [CD_REQUEST_STATUS] SET [NAME_EN] = 'Pending PSC Clearance', [NAME_FR] = 'Attente autorisation CFP' WHERE [CODE] = 'PENDING_PSC';

UPDATE [CD_REQUEST_STATUS] SET [NAME_EN] = 'Pending PSC Clearance', [NAME_FR] = 'Attente autorisation CFP' WHERE [CODE] = 'PENDING_PSC_NO_VMS';

UPDATE [CD_REQUEST_STATUS] SET [NAME_EN] = 'Clearance Granted', [NAME_FR] = 'Autorisation accordée' WHERE [CODE] = 'PSC_GRANTED';

UPDATE [CD_REQUEST_STATUS] SET [NAME_EN] = 'Clearance Granted', [NAME_FR] = 'Autorisation accordée' WHERE [CODE] = 'PSC_GRANTED_NO_VMS';

--changeset system:expire-cd-city-nov-2025 dbms:mssql,h2
UPDATE CD_CITY SET EXPIRY_DATE=CURRENT_TIMESTAMP, USER_UPDATED='system', DATE_UPDATED=CURRENT_TIMESTAMP WHERE CODE='ON6' AND PROVINCE_TERRITORY_ID=0 AND NAME_EN='Bracebridge' AND NAME_FR='Bracebridge' AND EXPIRY_DATE IS NULL;
UPDATE CD_CITY SET EXPIRY_DATE=CURRENT_TIMESTAMP, USER_UPDATED='system', DATE_UPDATED=CURRENT_TIMESTAMP WHERE CODE='ON73' AND PROVINCE_TERRITORY_ID=0 AND NAME_EN='Trenton' AND NAME_FR='Trenton' AND EXPIRY_DATE IS NULL;
UPDATE CD_CITY SET EXPIRY_DATE=CURRENT_TIMESTAMP, USER_UPDATED='system', DATE_UPDATED=CURRENT_TIMESTAMP WHERE CODE='ON78' AND PROVINCE_TERRITORY_ID=0 AND NAME_EN='Wlland' AND NAME_FR='Wlland' AND EXPIRY_DATE IS NULL;
UPDATE CD_CITY SET EXPIRY_DATE=CURRENT_TIMESTAMP, USER_UPDATED='system', DATE_UPDATED=CURRENT_TIMESTAMP WHERE CODE='QC56' AND PROVINCE_TERRITORY_ID=1 AND NAME_EN='Sainte-Anne' AND NAME_FR='Sainte-Anne' AND EXPIRY_DATE IS NULL;
UPDATE CD_CITY SET EXPIRY_DATE=CURRENT_TIMESTAMP, USER_UPDATED='system', DATE_UPDATED=CURRENT_TIMESTAMP WHERE CODE='YT1' AND PROVINCE_TERRITORY_ID=12 AND NAME_EN='Yorkton' AND NAME_FR='Yorkton' AND EXPIRY_DATE IS NULL;

--changeset system:add-cd-city-nov-2025-on dbms:mssql
SET IDENTITY_INSERT CD_CITY ON;

--changeset system:add-cd-city-nov-2025 dbms:mssql,h2
INSERT INTO [CD_CITY] ([ID], [CODE], [NAME_EN], [NAME_FR], [EFFECTIVE_DATE], [PROVINCE_TERRITORY_ID], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES
(291, 'AB14', 'Canmore', 'Canmore', '1970-01-01 00:00:00', 3, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(292, 'NL16', 'Nain', 'Nain', '1970-01-01 00:00:00', 6, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(293, 'ON80', 'Huntsville', 'Huntsville', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(294, 'ON81', 'Waterloo', 'Waterloo', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(295, 'ON82', 'Welland', 'Welland', '1970-01-01 00:00:00', 0, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(296, 'QC74', 'Sainte-Anne-des-Monts', 'Sainte-Anne-des-Monts', '1970-01-01 00:00:00', 1, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(297, 'YT2', 'Whitehorse', 'Whitehorse', '1970-01-01 00:00:00', 12, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:add-cd-city-nov-2025-off dbms:mssql
SET IDENTITY_INSERT CD_CITY OFF;

--changeset system:update-cd-selection-process-type-nov-2025 dbms:mssql,h2
UPDATE CD_SELECTION_PROCESS_TYPE
SET CODE='IAPI', NAME_EN='Initiate an Internal Advertised Process', NAME_FR='Initiation d''un processus interne anoncé', USER_UPDATED='system', DATE_UPDATED=CURRENT_TIMESTAMP
WHERE CODE='IAP' AND NAME_EN='Initiate an Avertised Process (Internal or External)' AND NAME_FR='Initiation d''un processus annoncé (Interne ou externe)' AND EXPIRY_DATE IS NULL;

INSERT INTO CD_SELECTION_PROCESS_TYPE (CODE, NAME_EN, NAME_FR, EFFECTIVE_DATE, USER_CREATED, DATE_CREATED, USER_UPDATED, DATE_UPDATED) VALUES
('IAPE', 'Initiate an External Advertised Process', 'Initiation d''un processus externe anoncé', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

UPDATE CD_SELECTION_PROCESS_TYPE
SET CODE='CRV', NAME_EN='Employee referrals from VMS', NAME_FR='Présentation d''employés du SGPV', USER_UPDATED='system', DATE_UPDATED=CURRENT_TIMESTAMP
WHERE CODE='CRV' AND NAME_EN='Candidate referrals from VMS' AND NAME_FR='Présentation de candidats du SGPV' AND EXPIRY_DATE IS NULL;

UPDATE CD_SELECTION_PROCESS_TYPE
SET EXPIRY_DATE=CURRENT_TIMESTAMP, USER_UPDATED='system', DATE_UPDATED=CURRENT_TIMESTAMP
WHERE CODE='DIE' AND NAME_EN='Deployment - Indeterminate (refer to exceptions)' AND NAME_FR='Mutation - Durée indéterminée (veuillez consulter les exceptions)' AND EXPIRY_DATE IS NULL;
