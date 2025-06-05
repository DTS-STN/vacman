package ca.gov.dtsstn.vacman.api.data.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity(name = "DocumentType")
@Table(name = "[CD_DOCUMENT_TYPE]")
@AttributeOverride(name = "id", column = @Column(name = "[DOCUMENT_TYPE_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[DOCUMENT_TYPE_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[DOCUMENT_TYPE_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[DOCUMENT_TYPE_NAME_FR]"))
public class DocumentTypeEntity extends AbstractLookupEntity {}
