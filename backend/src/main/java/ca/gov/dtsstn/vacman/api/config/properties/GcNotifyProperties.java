package ca.gov.dtsstn.vacman.api.config.properties;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.lang.Nullable;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;

@Validated
@ConfigurationProperties("application.gcnotify")
public record GcNotifyProperties(
	@NotBlank String apiKey,
	@NotBlank String baseUrl,
	@NotBlank String profileApprovedTemplateIdEng,
	@NotBlank String profileApprovedTemplateIdFra,
	@NotBlank String profilePendingTemplateIdEng,
	@NotBlank String profilePendingTemplateIdFra,
	@NotBlank String profileClosedTemplateIdEng,
	@NotBlank String profileClosedTemplateIdFra,
	@NotBlank String requestCreatedTemplateId,
	@NotBlank String requestFeedbackPendingTemplateId,
	@NotBlank String requestFeedbackApprovedPscTemplateIdEng,
	@NotBlank String requestFeedbackApprovedPscTemplateIdFra,	
	@NotBlank String requestFeedbackApprovedTemplateIdEng,
	@NotBlank String requestFeedbackApprovedTemplateIdFra,
	@NotBlank String requestCancelledTemplateIdEng,
	@NotBlank String requestCancelledTemplateIdFra,
	@NotBlank String hrApprovedManagerTemplateIdEng,
	@NotBlank String hrApprovedManagerTemplateIdFra,
	@NotBlank String jobHrApprovedTemplateIdEng,
	@NotBlank String jobHrApprovedTemplateIdFra,
	@NotBlank String jobOpportunityTemplateIdEng,
	@NotBlank String jobOpportunityTemplateIdFra,
	@NotBlank String requestFeedbackCompletedTemplateId,
	@NotBlank String hrGdInboxEmail,
	@NotBlank String genericTemplateId,
	@Nullable Duration connectTimeout,
	@Nullable Duration readTimeout
) {}
