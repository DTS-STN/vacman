--liquibase formatted sql

--changeset system:update-cd-match-feedback-names-dec-2025 dbms:mssql,h2
UPDATE CD_MATCH_FEEDBACK SET NAME_EN = 'Meets requirements - Accepted offer (indeterminate)', NAME_FR = 'Rencontre les exigences - Offre acceptée (indéterminé)' WHERE CODE = 'QA-QOA';
UPDATE CD_MATCH_FEEDBACK SET NAME_EN = 'Meets requirements - Not selected', NAME_FR = 'Rencontre les exigences - Non-sélectionné' WHERE CODE = 'QNS';
UPDATE CD_MATCH_FEEDBACK SET NAME_EN = 'Meets requirements - Refused offer', NAME_FR = 'Rencontre les exigences - Offre refusée' WHERE CODE = 'QRO-QOR';
UPDATE CD_MATCH_FEEDBACK SET NAME_EN = 'Does not meet requirements - Competency', NAME_FR = 'Ne rencontre pas les exigences - Compétences' WHERE CODE = 'NQC';
UPDATE CD_MATCH_FEEDBACK SET NAME_EN = 'Does not meet requirements - Education', NAME_FR = 'Ne rencontre pas les exigences - Études' WHERE CODE = 'NQE';
UPDATE CD_MATCH_FEEDBACK SET NAME_EN = 'Does not meet requirements - Other', NAME_FR = 'Ne rencontre pas les exigences - Autre' WHERE CODE = 'NQO-NQA';
