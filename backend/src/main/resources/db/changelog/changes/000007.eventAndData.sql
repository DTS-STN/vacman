--liquibase formatted sql

--changeset system:alter-event-detail-to-nvarcharmax dbms:mssql,h2
-- WARNING: This change increases the column size and may be irreversible if data exceeds the original length.
ALTER TABLE EVENT ALTER COLUMN DETAIL NVARCHAR(MAX);
--rollback ALTER TABLE EVENT ALTER COLUMN DETAIL NVARCHAR(255);

--changeset system:cd_match_feedback_ncpc_on dbms:mssql
SET IDENTITY_INSERT CD_MATCH_FEEDBACK ON;

--changeset system:cd_match_feedback_ncpc dbms:mssql,h2
INSERT INTO [CD_MATCH_FEEDBACK] ([ID], [CODE], [NAME_EN], [NAME_FR], [EFFECTIVE_DATE], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES
(9, 'NC-PC', 'Not considered - Surplus Priority qualified', 'Pas considéré - Priorité excédentaire qualifiée', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:cd_match_feedback_ncpc_off dbms:mssql
SET IDENTITY_INSERT CD_MATCH_FEEDBACK OFF;


--changeset system:cd_appointment_non_advertised_lcpbcl_three_new_on dbms:mssql
SET IDENTITY_INSERT CD_APPOINTMENT_NON_ADVERTISED ON;

--changeset system:cd_appointment_non_advertised_lcpbcl_three_new dbms:mssql,h2
INSERT INTO [CD_APPOINTMENT_NON_ADVERTISED] ([ID], [CODE], [NAME_EN], [NAME_FR], [INTERNAL_IND], [EFFECTIVE_DATE], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES
(15, 'LCPRL_BCLOSRE', 'Limited candidate pool - Remote location', 'Bassin de candidats limité - Poste situé en région éloignée', '0', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(16, 'LCPSG_BCLGP', 'Limited candidate pool - Shortage group', 'Bassin de candidats limité - Groupe en pénurie', '0', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(17, 'LCPSS_BCLCS', 'Limited candidate pool - Specialized skills', 'Bassin de candidats limité - Compétences spécialisées', '0', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:cd_appointment_non_advertised_lcpbcl_three_new_off dbms:mssql
SET IDENTITY_INSERT CD_APPOINTMENT_NON_ADVERTISED OFF;

--changeset system:cd_classification_nov242025_on dbms:mssql
SET IDENTITY_INSERT CD_CLASSIFICATION ON;

--changeset system:cd_classification_nov242025 dbms:mssql,h2
INSERT INTO [CD_CLASSIFICATION] ([ID], [CODE], [NAME_EN], [NAME_FR], [EFFECTIVE_DATE], [USER_CREATED], [DATE_CREATED], [USER_UPDATED], [DATE_UPDATED])
VALUES
(88, 'EC-01', 'EC-01', 'EC-01', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(89, 'IS-02', 'IS-02', 'IS-02', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(90, 'IS-03', 'IS-03', 'IS-03', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(91, 'IS-04', 'IS-04', 'IS-04', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(92, 'IS-05', 'IS-05', 'IS-05', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(93, 'IS-06', 'IS-06', 'IS-06', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(94, 'PM-MCO-03', 'PM-MCO-03', 'PM-MCO-03', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP),
(95, 'PM-MCO-04', 'PM-MCO-04', 'PM-MCO-04', '1970-01-01 00:00:00', 'system', CURRENT_TIMESTAMP, 'system', CURRENT_TIMESTAMP);

--changeset system:cd_classification_nov242025_off dbms:mssql
SET IDENTITY_INSERT CD_CLASSIFICATION OFF;
