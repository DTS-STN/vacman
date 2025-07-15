package ca.gov.dtsstn.vacman.api.data.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity(name = "UserType")
@Table(name = "[CD_USER_TYPE]", uniqueConstraints = {
    @UniqueConstraint(name = "USERTYP_UK", columnNames = "[USER_TYPE_NAME_EN]")
})
@AttributeOverride(name = "id", column = @Column(name = "[USER_TYPE_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[USER_TYPE_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[USER_TYPE_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[USER_TYPE_NAME_FR]"))
public class UserTypeEntity extends AbstractLookupEntity {}
