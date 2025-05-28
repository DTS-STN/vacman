-- email definition

INSERT INTO [email]
(
  [id],
  [address]
)
VALUES
  (1, 'system@example.org');

-- name definition

INSERT INTO [name]
(
  [id],
  [value]
)
VALUES
  (1, 'system');

-- phone definition

INSERT INTO [phone]
(
  [id],
  [number]
)
VALUES
  (1, '000000000000');

-- lang definition

INSERT INTO [lang_pref]
(
  [id],
  [name]
)
VALUES
  (1, 'EN'),
  (2, 'FR') ,
  (3, 'Bilingual');


-- user definition

INSERT INTO [user]
(
  [id],
  [fk_name_id],
  [fk_email_id],
  [fk_lang_pref_id],
  [fk_phone_id],
  [uuid],
  [network_id],
  [created_by],
  [last_modified_by]
)
VALUES
  (1, 1, 1, 3, 1, '0', 'system', 1, 1);
