--Work Item 7257 Manager request flow revisions

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

UPDATE [CD_EMPLOYMENT_TENURE] SET [NAME_FR] = 'Déterminée' WHERE [CODE] = 'TERM';

UPDATE [CD_SECURITY_CLEARANCE]
SET [NAME_FR] = CASE [CODE]
    WHEN 'ES-SA' THEN 'Secret avec fiabilité approfondie'
    WHEN 'ETS-TSA' THEN 'Très secret avec fiabilité approfondie'
    ELSE [NAME_FR]
END
WHERE [CODE] IN ('ES-SA', 'ETS-TSA');
