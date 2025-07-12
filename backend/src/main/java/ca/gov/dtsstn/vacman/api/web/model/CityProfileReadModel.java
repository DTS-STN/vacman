package ca.gov.dtsstn.vacman.api.web.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "CityProfile", description = "City profile association model")
public class CityProfileReadModel {

    @Schema(description = "City profile ID", example = "123")
    @JsonProperty("id")
    private Long id;

    @Schema(description = "Profile ID", example = "456")
    @JsonProperty("profileId")
    private Long profileId;

    @Schema(description = "City ID", example = "789")
    @JsonProperty("cityId")
    private Long cityId;

    @Schema(description = "City code", example = "ON52")
    @JsonProperty("cityCode")
    private String cityCode;

    @Schema(description = "City name (English)", example = "Ottawa")
    @JsonProperty("cityNameEn")
    private String cityNameEn;

    @Schema(description = "City name (French)", example = "Ottawa")
    @JsonProperty("cityNameFr")
    private String cityNameFr;

    public CityProfileReadModel() {
        // intentionally empty
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProfileId() {
        return profileId;
    }

    public void setProfileId(Long profileId) {
        this.profileId = profileId;
    }

    public Long getCityId() {
        return cityId;
    }

    public void setCityId(Long cityId) {
        this.cityId = cityId;
    }

    public String getCityCode() {
        return cityCode;
    }

    public void setCityCode(String cityCode) {
        this.cityCode = cityCode;
    }

    public String getCityNameEn() {
        return cityNameEn;
    }

    public void setCityNameEn(String cityNameEn) {
        this.cityNameEn = cityNameEn;
    }

    public String getCityNameFr() {
        return cityNameFr;
    }

    public void setCityNameFr(String cityNameFr) {
        this.cityNameFr = cityNameFr;
    }

}
