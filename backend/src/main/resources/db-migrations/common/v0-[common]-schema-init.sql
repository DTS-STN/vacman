-- city definition

CREATE TABLE [city]
(
  [id] BIGINT PRIMARY KEY IDENTITY(1,1),
  [name] NVARCHAR(64) NOT NULL
);

-- education_level definition

CREATE TABLE [education_level]
(
  [id] BIGINT PRIMARY KEY IDENTITY(1,1),
  [name] NVARCHAR(64) NOT NULL
);

-- email definition

CREATE TABLE [email]
(
  [id] BIGINT PRIMARY KEY IDENTITY(1,1),
  [address] NVARCHAR(128) NOT NULL
);

-- group definition

CREATE TABLE [group]
(
  [id] BIGINT PRIMARY KEY IDENTITY(1,1),
  [name] NVARCHAR(10)
);

-- lang_pref definition

CREATE TABLE [lang_pref]
(
  [id] BIGINT PRIMARY KEY IDENTITY(1,1),
  [name] NVARCHAR(10) NOT NULL
);

-- lang_equivalents definition

CREATE TABLE [lang_equivalents]
(
  [id] BIGINT PRIMARY KEY IDENTITY(1,1),
  [name] NVARCHAR(19)
);

-- level definition

CREATE TABLE [level]
(
  [id] BIGINT PRIMARY KEY IDENTITY(1,1),
  [name] NVARCHAR(5)
);

-- name definition

CREATE TABLE [name]
(
  [id] BIGINT PRIMARY KEY IDENTITY(1,1),
  [value] NVARCHAR(64) NOT NULL
);

-- phone definition

CREATE TABLE [phone]
(
  [id] BIGINT PRIMARY KEY IDENTITY(1,1),
  [number] NVARCHAR(12)
);

-- province_territory definition

CREATE TABLE [province_territory]
(
  [id] BIGINT PRIMARY KEY IDENTITY(1,1),
  [name] NVARCHAR(2) NOT NULL
);

-- region definition

CREATE TABLE [region]
(
  [id] BIGINT PRIMARY KEY IDENTITY(1,1)
);

-- request_status definition

CREATE TABLE [request_status]
(
  [id] BIGINT PRIMARY KEY IDENTITY(1,1),
  [name] NVARCHAR(64)
);

-- security_clearance definition

CREATE TABLE [security_clearance]
(
  [id] BIGINT PRIMARY KEY IDENTITY(1,1),
  [name] NVARCHAR(64)
);

-- timezone definition

CREATE TABLE [timezone]
(
  [id] BIGINT PRIMARY KEY IDENTITY(1,1),
  [name] NVARCHAR(5) NOT NULL,
  [gm_diff] INT NOT NULL
);

-- title definition

CREATE TABLE [title] 
(
  [id] BIGINT PRIMARY KEY IDENTITY(1,1),
  [name] NVARCHAR(64) NOT NULL
);

-- wfa_status definition

CREATE TABLE [wfa_status]
(
  [id] BIGINT PRIMARY KEY IDENTITY(1,1),
  [name] NVARCHAR(64)
);

-- location definition

CREATE TABLE [location]
(
  [id] BIGINT PRIMARY KEY IDENTITY(1,1),
  [name] NVARCHAR(64),
  [fk_province_territory_id] BIGINT,
  [fk_timezone_id] BIGINT,
  [fk_city_id] BIGINT,

  CONSTRAINT location_city_FK FOREIGN KEY (fk_city_id) REFERENCES city(id),
  CONSTRAINT location_provterr_FK FOREIGN KEY (fk_province_territory_id) REFERENCES province_territory(id),
  CONSTRAINT location_timezone_FK FOREIGN KEY (fk_timezone_id) REFERENCES timezone(id)
);

-- user definition

CREATE TABLE [user]
(
  [id] BIGINT PRIMARY KEY IDENTITY(1,1),
  [fk_name_id] BIGINT,
  [fk_email_id] BIGINT,
  [fk_lang_pref_id] BIGINT,
  [fk_phone_id] BIGINT,
  [uuid] NVARCHAR(64),
  [network_id] NVARCHAR(64),

  -- audit fields
  [created_by] BIGINT NOT NULL,
  [created_date] DATETIME2,
  [last_modified_by] BIGINT,
  [last_modified_date] DATETIME2,

  CONSTRAINT user_email_FK FOREIGN KEY (fk_email_id) REFERENCES email(id),
  CONSTRAINT user_name_FK FOREIGN KEY (fk_name_id) REFERENCES [name](id),
  CONSTRAINT user_lang_FK FOREIGN KEY (fk_lang_pref_id) REFERENCES lang_pref(id),
  CONSTRAINT user_phone_FK FOREIGN KEY (fk_phone_id) REFERENCES phone(id),
  CONSTRAINT user_user_create_FK FOREIGN KEY (created_by) REFERENCES [user](id),
  CONSTRAINT user_user_mod_FK_1 FOREIGN KEY (last_modified_by) REFERENCES [user](id)
);

-- actions definition

CREATE TABLE [actions]
(
  [id] BIGINT PRIMARY KEY IDENTITY(1,1),
  [free_text] NTEXT,
  [feedback] NTEXT, 
  [assessment_result] NTEXT,
  [created_by] BIGINT NOT NULL,
  [created_date] DATETIME2,
  [last_modified_by] BIGINT,
  [last_modified_date] DATETIME2,

  CONSTRAINT actions_user_FK FOREIGN KEY (created_by) REFERENCES [user](id),
  CONSTRAINT actions_user_FK_1 FOREIGN KEY (last_modified_by) REFERENCES [user](id)
);

-- request definition

CREATE TABLE [request]
(
  [id] BIGINT PRIMARY KEY IDENTITY(1,1),
  [fk_title_id] BIGINT,
  [fk_location_id] BIGINT,
  [fk_group_id] BIGINT,
  [fk_level_id] BIGINT,
  [fk_education_req_id] BIGINT,
  [fk_language_profile_id] BIGINT,
  [fk_security_clearance_id] BIGINT,
  [fk_lang_equivalent_id] BIGINT,

  -- audit fields
  [created_by] BIGINT NOT NULL,
  [created_date] DATETIME2,
  [last_modified_by] BIGINT,
  [last_modified_date] DATETIME2,

  CONSTRAINT request_group_FK FOREIGN KEY (fk_group_id) REFERENCES [group](id),
  CONSTRAINT request_level_FK FOREIGN KEY (fk_level_id) REFERENCES [level](id),
  CONSTRAINT request_location_FK FOREIGN KEY (fk_location_id) REFERENCES location(id),
  CONSTRAINT request_title_FK FOREIGN KEY (fk_title_id) REFERENCES title(id),
  CONSTRAINT request_secclear_FK FOREIGN KEY (fk_security_clearance_id) REFERENCES security_clearance(id),
  CONSTRAINT request_education_req_FK FOREIGN KEY (fk_education_req_id) REFERENCES education_level(id),
  CONSTRAINT request_lang_equivalents_FK FOREIGN KEY (fk_lang_equivalent_id) REFERENCES lang_equivalents(id),
  CONSTRAINT request_user_FK FOREIGN KEY (created_by) REFERENCES [user](id),
  CONSTRAINT request_user_FK_1 FOREIGN KEY (last_modified_by) REFERENCES [user](id)
);

-- profile definition

CREATE TABLE [profile]
(
  [id] BIGINT PRIMARY KEY IDENTITY(1,1),
  [fk_work_location_id] BIGINT,
  [fk_substantive_group_id] BIGINT,
  [fk_substantive_level_id] BIGINT,
  [fk_security_clearance_id] BIGINT,
  [fk_wfa_status_id] BIGINT,
  [fk_education_level] BIGINT,
  [fk_user_id] BIGINT,
  [fk_personal_email_id] BIGINT,
  [fk_personal_phone_id] BIGINT,
  [fk_hr_advisor_id] BIGINT,
  [fk_lang_equivalents_id] BIGINT,

  -- audit fields
  [created_by] BIGINT NOT NULL,
  [created_date] DATETIME2,
  [last_modified_by] BIGINT,
  [last_modified_date] DATETIME2,

  CONSTRAINT profile_security_FK FOREIGN KEY (fk_security_clearance_id) REFERENCES security_clearance(id),
  CONSTRAINT profile_education_FK FOREIGN KEY (fk_education_level) REFERENCES education_level(id),
  CONSTRAINT profile_group_FK FOREIGN KEY (fk_substantive_group_id) REFERENCES [group](id),
  CONSTRAINT profile_hradvisor_FK FOREIGN KEY (fk_hr_advisor_id) REFERENCES [user](id),
  CONSTRAINT profile_level_FK FOREIGN KEY (fk_substantive_level_id) REFERENCES [level](id),
  CONSTRAINT profile_peremail_FK FOREIGN KEY (fk_personal_email_id) REFERENCES email(id),
  CONSTRAINT profile_perphone_FK FOREIGN KEY (fk_personal_phone_id) REFERENCES phone(id),
  CONSTRAINT profile_user_FK FOREIGN KEY (fk_user_id) REFERENCES [user](id),
  CONSTRAINT profile_wfastatus_FK FOREIGN KEY (fk_wfa_status_id) REFERENCES wfa_status(id),
  CONSTRAINT profile_location_FK FOREIGN KEY (fk_work_location_id) REFERENCES [location](id),
  CONSTRAINT profile_langequiv_FK FOREIGN KEY (fk_lang_equivalents_id) REFERENCES lang_equivalents(id),
  CONSTRAINT profile_user_create_FK FOREIGN KEY (created_by) REFERENCES [user](id),
  CONSTRAINT profile_user_mod_FK_1 FOREIGN KEY (last_modified_by) REFERENCES [user](id)
);

-- join_profile_request definition

CREATE TABLE [join_profile_request]
(
  [id] BIGINT PRIMARY KEY IDENTITY(1,1),
  [fk_profile_id] BIGINT,
  [fk_request_id] BIGINT,
  [fk_request_status_id] BIGINT,
  [fk_actions_id] BIGINT,
  [created_by] BIGINT NOT NULL,
  [created_date] DATETIME2,
  [last_modified_by] BIGINT,
  [last_modified_date] DATETIME2,

  CONSTRAINT jprofreq_profile_FK FOREIGN KEY (fk_profile_id) REFERENCES profile(id),
  CONSTRAINT jprofreq_request_FK FOREIGN KEY (fk_request_id) REFERENCES request(id),
  CONSTRAINT jprofreq_requeststatus_FK FOREIGN KEY (fk_request_status_id) REFERENCES request_status(id),
  CONSTRAINT jprofreq_actions_FK FOREIGN KEY (fk_actions_id) REFERENCES actions(id),
  CONSTRAINT jprofreq_user_FK FOREIGN KEY (created_by) REFERENCES [user](id),
  CONSTRAINT jprofreq_user_FK_1 FOREIGN KEY (last_modified_by) REFERENCES [user](id)
);
