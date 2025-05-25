-- city data

INSERT INTO [city]
(
  [id],
  [name]
)
VALUES
  (1, 'City1'),
  (2, 'City2'),
  (3, 'City3'),
  (4, 'City4'),
  (5, 'City5');

-- education_level definition

INSERT INTO [education_level]
(
  [id],
  [name]
)
VALUES
  (1, 'level1'),
  (2, 'level2');

-- group definition

INSERT INTO [group]
(
  [id],
  [name]
)
VALUES
  (1, 'group1'),
  (2, 'group2'),
  (3, 'group3'),
  (4, 'group4'),
  (5, 'group5');

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

-- lang_equivalents definition

INSERT INTO [lang_equivalents]
(
  [id],
  [name]
)
VALUES
  (1, 'xx-xx, xx-xx, xx-xx'),
  (2, 'yy-yy, yy-yy, yy-yy'),
  (3, 'zz-zz, zz-zz, zz-zz'),
  (4, 'aa-aa, aa-aa, aa-aa'),
  (5, 'bb-bb, bb-bb, bb-bb');

-- level definition

INSERT INTO [level]
(
  [id],
  [name]
)
VALUES
  (1, '01'),
  (2, '02'),
  (3, '03'),
  (4, '04'),
  (5, '05');

-- province_territory definition

INSERT INTO [province_territory]
(
  [id],
  [name]
)
VALUES
  (1, 'AB'),
  (2, 'BC'),
  (3, 'MB'),
  (4, 'NB'),
  (5, 'NL'),
  (6, 'NT'),
  (7, 'NS'),
  (8, 'NU'),
  (9, 'ON'),
  (10, 'PE'),
  (11, 'QC'),
  (12, 'SK'),
  (13, 'YT');

-- region definition

INSERT INTO [region]
(
  [id]
)
VALUES
  (1),
  (2),
  (3),
  (4),
  (5);

-- request_status definition

INSERT INTO [request_status]
(
  [id],
  [name]
)
VALUES
  (1, 'status1'),
  (2, 'status2'),
  (3, 'status3'),
  (4, 'status4'),
  (5, 'status5');

-- security_clearance definition

INSERT INTO [security_clearance]
(
  [id],
  [name]
)
VALUES
  (1, 'clearance1'),
  (2, 'clearance2'),
  (3, 'clearance3'),
  (4, 'clearance4'),
  (5, 'clearance5');

-- timezone definition

INSERT INTO [timezone]
(
  [id],
  [name],
  [gm_diff]
)
VALUES
  (1, 'PDT', -7),
  (2, 'MDT', -6),
  (3, 'CDT', -5),
  (4, 'EDT', -4),
  (5, 'ADT', -3),
  (6, 'NDT', -2.5);

-- wfa_status definition

INSERT INTO [wfa_status]
(
  [id],
  [name]
)
VALUES
  (1, 'wfa status 1'),
  (2, 'wfa status 2'),
  (3, 'wfa status 3'),
  (4, 'wfa status 4'),
  (5, 'wfa status 5');

-- location definition

INSERT INTO [location]
(
  [id],
  [name],
  [fk_province_territory_id],
  [fk_city_id],
  [fk_timezone_id]
)
VALUES
  (1, 'location 1', 1, 1, 2),
  (2, 'location 2', 2, 2, 1),
  (3, 'location 3', 1, 4, 6),
  (4, 'location 4', 4, 3, 2),
  (5, 'location 5', 5, 1, 3);
