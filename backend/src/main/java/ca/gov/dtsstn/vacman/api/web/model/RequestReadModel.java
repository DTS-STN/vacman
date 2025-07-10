package ca.gov.dtsstn.vacman.api.web.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "Request", description = "Request model")
public class RequestReadModel {

    @Schema(description = "Request ID", example = "123")
    @JsonProperty("id")
    private Long id;

    @Schema(description = "Request name (English)", example = "Software Developer Position")
    @JsonProperty("requestNameEn")
    private String requestNameEn;

    @Schema(description = "Request name (French)", example = "Poste de développeur de logiciels")
    @JsonProperty("requestNameFr")
    private String requestNameFr;

    @Schema(description = "Security clearance code", example = "SECRET")
    @JsonProperty("securityClearanceCode")
    private String securityClearanceCode;

    @Schema(description = "Work unit code", example = "ITSB")
    @JsonProperty("workUnitCode")
    private String workUnitCode;

    @Schema(description = "Classification code", example = "CS-02")
    @JsonProperty("classificationCode")
    private String classificationCode;

    @Schema(description = "Request status code", example = "OPEN")
    @JsonProperty("requestStatusCode")
    private String requestStatusCode;

    @Schema(description = "Educational requirement text", example = "Bachelor's degree in Computer Science")
    @JsonProperty("educationalRequirementText")
    private String educationalRequirementText;

    @Schema(description = "Priority clearance number", example = "PCN-2024-001")
    @JsonProperty("priorityClearanceNumber")
    private String priorityClearanceNumber;

    @Schema(description = "Request posting date", example = "2024-01-15")
    @JsonProperty("requestPostingDate")
    private String requestPostingDate;

    @Schema(description = "Allow telework indicator", example = "true")
    @JsonProperty("allowTeleworkIndicator")
    private Boolean allowTeleworkIndicator;

    @Schema(description = "Start date", example = "2024-02-01")
    @JsonProperty("startDate")
    private String startDate;

    @Schema(description = "End date", example = "2025-02-01")
    @JsonProperty("endDate")
    private String endDate;

    public RequestReadModel() {
        // intentionally empty
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRequestNameEn() {
        return requestNameEn;
    }

    public void setRequestNameEn(String requestNameEn) {
        this.requestNameEn = requestNameEn;
    }

    public String getRequestNameFr() {
        return requestNameFr;
    }

    public void setRequestNameFr(String requestNameFr) {
        this.requestNameFr = requestNameFr;
    }

    public String getSecurityClearanceCode() {
        return securityClearanceCode;
    }

    public void setSecurityClearanceCode(String securityClearanceCode) {
        this.securityClearanceCode = securityClearanceCode;
    }

    public String getWorkUnitCode() {
        return workUnitCode;
    }

    public void setWorkUnitCode(String workUnitCode) {
        this.workUnitCode = workUnitCode;
    }

    public String getClassificationCode() {
        return classificationCode;
    }

    public void setClassificationCode(String classificationCode) {
        this.classificationCode = classificationCode;
    }

    public String getRequestStatusCode() {
        return requestStatusCode;
    }

    public void setRequestStatusCode(String requestStatusCode) {
        this.requestStatusCode = requestStatusCode;
    }

    public String getEducationalRequirementText() {
        return educationalRequirementText;
    }

    public void setEducationalRequirementText(String educationalRequirementText) {
        this.educationalRequirementText = educationalRequirementText;
    }

    public String getPriorityClearanceNumber() {
        return priorityClearanceNumber;
    }

    public void setPriorityClearanceNumber(String priorityClearanceNumber) {
        this.priorityClearanceNumber = priorityClearanceNumber;
    }

    public String getRequestPostingDate() {
        return requestPostingDate;
    }

    public void setRequestPostingDate(String requestPostingDate) {
        this.requestPostingDate = requestPostingDate;
    }

    public Boolean getAllowTeleworkIndicator() {
        return allowTeleworkIndicator;
    }

    public void setAllowTeleworkIndicator(Boolean allowTeleworkIndicator) {
        this.allowTeleworkIndicator = allowTeleworkIndicator;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

}
