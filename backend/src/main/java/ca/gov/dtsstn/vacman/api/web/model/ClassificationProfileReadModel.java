package ca.gov.dtsstn.vacman.api.web.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "ClassificationProfile", description = "Classification profile association model")
public class ClassificationProfileReadModel {

    @Schema(description = "Classification profile ID", example = "123")
    @JsonProperty("id")
    private Long id;

    @Schema(description = "Classification ID", example = "456")
    @JsonProperty("classificationId")
    private Long classificationId;

    @Schema(description = "Profile ID", example = "789")
    @JsonProperty("profileId")
    private Long profileId;

    @Schema(description = "Classification code", example = "AS-01")
    @JsonProperty("classificationCode")
    private String classificationCode;

    @Schema(description = "Classification name (English)", example = "Administrative Services 01")
    @JsonProperty("classificationNameEn")
    private String classificationNameEn;

    @Schema(description = "Classification name (French)", example = "Services administratifs 01")
    @JsonProperty("classificationNameFr")
    private String classificationNameFr;

    public ClassificationProfileReadModel() {
        // intentionally empty
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getClassificationId() {
        return classificationId;
    }

    public void setClassificationId(Long classificationId) {
        this.classificationId = classificationId;
    }

    public Long getProfileId() {
        return profileId;
    }

    public void setProfileId(Long profileId) {
        this.profileId = profileId;
    }

    public String getClassificationCode() {
        return classificationCode;
    }

    public void setClassificationCode(String classificationCode) {
        this.classificationCode = classificationCode;
    }

    public String getClassificationNameEn() {
        return classificationNameEn;
    }

    public void setClassificationNameEn(String classificationNameEn) {
        this.classificationNameEn = classificationNameEn;
    }

    public String getClassificationNameFr() {
        return classificationNameFr;
    }

    public void setClassificationNameFr(String classificationNameFr) {
        this.classificationNameFr = classificationNameFr;
    }

}
