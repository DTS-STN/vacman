--liquibase formatted sql

--changeset system:update-requests-add-additional-contact dbms:mssql,h2 logicalFilePath:db/changelog/changes/db.schema.v0001.sql

ALTER TABLE REQUEST
    ADD USER_ID_ADDITIONAL_CONTACT BIGINT;

ALTER TABLE REQUEST
    ADD CONSTRAINT REQUEST_USER_ADDITIONAL_CONTACT_FK FOREIGN KEY
    (
     USER_ID_ADDITIONAL_CONTACT
    )
    REFERENCES [USER]
    (
     ID
    )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION;
