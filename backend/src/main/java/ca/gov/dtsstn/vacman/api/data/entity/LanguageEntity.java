package ca.gov.dtsstn.vacman.api.data.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity(name = "Language")
@Table(name = "[CD_LANGUAGE]", uniqueConstraints = {
    @UniqueConstraint(name = "LNG_UK", columnNames = "[LANGUAGE_NAME_EN]")
})
@AttributeOverride(name = "id", column = @Column(name = "[LANGUAGE_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[LANGUAGE_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[LANGUAGE_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[LANGUAGE_NAME_FR]"))
public class LanguageEntity extends AbstractLookupEntity {}
