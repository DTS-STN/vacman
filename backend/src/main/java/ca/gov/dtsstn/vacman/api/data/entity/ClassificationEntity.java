package ca.gov.dtsstn.vacman.api.data.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity(name = "Classification")
@Table(name = "[CD_CLASSIFICATION]", uniqueConstraints = {
    @UniqueConstraint(name = "CLSFCTN_UK", columnNames = "[CLASSIFICATION_NAME_EN]")
})
@AttributeOverride(name = "id", column = @Column(name = "[CLASSIFICATION_ID]", columnDefinition = "NUMERIC(6) IDENTITY NOT FOR REPLICATION"))
@AttributeOverride(name = "code", column = @Column(name = "[CLASSIFICATION_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[CLASSIFICATION_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[CLASSIFICATION_NAME_FR]"))
public class ClassificationEntity extends AbstractLookupEntity {}
