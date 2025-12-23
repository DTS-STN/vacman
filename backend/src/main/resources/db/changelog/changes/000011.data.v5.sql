--liquibase formatted sql

--changeset system:update-cd-match-feedback-names-dec-2025 dbms:mssql,h2
UPDATE CD_MATCH_FEEDBACK SET NAME_EN = 'Meets requirements - Accepted offer (indeterminate)', NAME_FR = 'Rencontre les exigences - Offre acceptée (indéterminé)' WHERE CODE = 'QA-QOA';
UPDATE CD_MATCH_FEEDBACK SET NAME_EN = 'Meets requirements - Not selected', NAME_FR = 'Rencontre les exigences - Non-sélectionné' WHERE CODE = 'QNS';
UPDATE CD_MATCH_FEEDBACK SET NAME_EN = 'Meets requirements - Refused offer', NAME_FR = 'Rencontre les exigences - Offre refusée' WHERE CODE = 'QRO-QOR';
UPDATE CD_MATCH_FEEDBACK SET NAME_EN = 'Does not meet requirements - Competency', NAME_FR = 'Ne rencontre pas les exigences - Compétences' WHERE CODE = 'NQC';
UPDATE CD_MATCH_FEEDBACK SET NAME_EN = 'Does not meet requirements - Education', NAME_FR = 'Ne rencontre pas les exigences - Études' WHERE CODE = 'NQE';
UPDATE CD_MATCH_FEEDBACK SET NAME_EN = 'Does not meet requirements - Other', NAME_FR = 'Ne rencontre pas les exigences - Autre' WHERE CODE = 'NQO-NQA';

--changeset system:update-cd-wfa-status-names-dec-2025 dbms:mssql,h2
UPDATE CD_WFA_STATUS SET NAME_EN = 'EX - Advance notification', NAME_FR = 'EX - Notification préavis', USER_UPDATED = 'system', DATE_UPDATED = CURRENT_TIMESTAMP WHERE CODE = 'EXAFFECTED';
UPDATE CD_WFA_STATUS SET NAME_EN = 'EX - Opting', NAME_FR = 'EX - Optant', USER_UPDATED = 'system', DATE_UPDATED = CURRENT_TIMESTAMP WHERE CODE = 'OPTING_EX';
UPDATE CD_WFA_STATUS SET NAME_EN = 'EX - Surplus', NAME_FR = 'EX - Excédentaire', USER_UPDATED = 'system', DATE_UPDATED = CURRENT_TIMESTAMP WHERE CODE = 'EXSURPLUSCPA';
