package ca.gov.dtsstn.vacman.api.data.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity(name = "ProfileStatus")
@Table(name = "[CD_PROFILE_STATUS]", uniqueConstraints = {
    @UniqueConstraint(name = "PRFLSTS_UK", columnNames = "[PROFILE_STATUS_NAME_EN]")
})
@AttributeOverride(name = "id", column = @Column(name = "[PROFILE_STATUS_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[PROFILE_STATUS_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[PROFILE_STATUS_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[PROFILE_STATUS_NAME_FR]"))
public class ProfileStatusEntity extends AbstractLookupEntity {}
