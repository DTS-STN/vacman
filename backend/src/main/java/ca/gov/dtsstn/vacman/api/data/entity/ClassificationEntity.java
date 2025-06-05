package ca.gov.dtsstn.vacman.api.data.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity(name = "Classification")
@Table(name = "[CD_CLASSIFICATION]")
@AttributeOverride(name = "id", column = @Column(name = "[CLASSIFICATION_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[CLASSIFICATION_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[CLASSIFICATION_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[CLASSIFICATION_NAME_FR]"))
public class ClassificationEntity extends AbstractLookupEntity {}
