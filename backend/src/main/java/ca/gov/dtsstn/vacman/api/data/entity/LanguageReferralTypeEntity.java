package ca.gov.dtsstn.vacman.api.data.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity(name = "LanguageReferralType")
@Table(name = "[CD_LANGUAGE_REFERRAL_TYPE]", uniqueConstraints = {
    @UniqueConstraint(name = "LNGRFRTYP_UK", columnNames = "[LANGUAGE_REFERRAL_TYPE_NAME_EN]")
})
@AttributeOverride(name = "id", column = @Column(name = "[LANGUAGE_REFERRAL_TYPE_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[LANGUAGE_REFERRAL_TYPE_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[LANGUAGE_REFERRAL_TYPE_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[LANGUAGE_REFERRAL_TYPE_NAME_FR]"))
public class LanguageReferralTypeEntity extends AbstractLookupEntity {}
