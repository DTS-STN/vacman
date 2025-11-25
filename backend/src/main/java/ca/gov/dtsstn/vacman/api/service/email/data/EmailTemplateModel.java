package ca.gov.dtsstn.vacman.api.service.email.data;

public final class EmailTemplateModel {
	private EmailTemplateModel() {}

	public record ApprovalRequired(
		String employeeName
	) {}

	public record FeedbackApproved(
		String requestNumber,
		String priorityClearanceNumber
	) {}

	public record FeedbackApprovedPSC(
		String requestNumber,
		String priorityClearanceNumber,
		String pscClearanceNumber
	) {}

	public record JobOpportunity(
		String requestNumber,
		String positionTitle,
		String classification,
		String languageRequirement,
		String location,
		String securityClearance,
		String submitterName,
		String submitterEmail,
		boolean bilingual,
		String statementOfMeritCriteria
	) {}

	public record JobOpportunityHR(
		String requestNumber,
		String positionTitle,
		String classification,
		String languageRequirement,
		String location,
		String securityClearance,
		String feedback,
		String submitterName,
		String submitterEmail
	) {}

	public record PrioritiesIdentified(
		String requestNumber
	) {}

	public record RequestCancelled(
		String requestNumber
	) {}

	public record VmsProfileActivation(
		String employeeName
	) {}

	public record VmsProfileClosed(
		String employeeName
	) {}

	public record PendingFeedbackApprovalHR(
		String requestNumber
	) {}

	public record RequestAssigned(
		String requestNumber
	) {}
}
