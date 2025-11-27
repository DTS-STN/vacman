package ca.gov.dtsstn.vacman.api.event.listener;

import static java.util.stream.Collectors.toSet;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import ca.gov.dtsstn.vacman.api.config.properties.ApplicationProperties;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes;
import ca.gov.dtsstn.vacman.api.data.entity.EventEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageEntity;
import ca.gov.dtsstn.vacman.api.data.entity.LanguageRequirementEntity;
import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.repository.EventRepository;
import ca.gov.dtsstn.vacman.api.data.repository.MatchRepository;
import ca.gov.dtsstn.vacman.api.data.repository.RequestRepository;
import ca.gov.dtsstn.vacman.api.event.MatchStatusChangeEvent;
import ca.gov.dtsstn.vacman.api.event.RequestCompletedEvent;
import ca.gov.dtsstn.vacman.api.event.RequestCreatedEvent;
import ca.gov.dtsstn.vacman.api.event.RequestFeedbackCompletedEvent;
import ca.gov.dtsstn.vacman.api.event.RequestFeedbackPendingEvent;
import ca.gov.dtsstn.vacman.api.event.RequestStatusChangeEvent;
import ca.gov.dtsstn.vacman.api.event.RequestSubmittedEvent;
import ca.gov.dtsstn.vacman.api.event.RequestUpdatedEvent;
import ca.gov.dtsstn.vacman.api.service.NotificationService;
import ca.gov.dtsstn.vacman.api.service.NotificationService.RequestEvent;
import ca.gov.dtsstn.vacman.api.service.dto.RequestEventDto;
import ca.gov.dtsstn.vacman.api.service.email.data.EmailTemplateModel;

/**
 * Listener for request-related events.
 */
@Component
public class RequestEventListener {

	private static final Logger log = LoggerFactory.getLogger(RequestEventListener.class);

	private final ApplicationProperties applicationProperties;
	private final EventRepository eventRepository;
	private final LookupCodes lookupCodes;
	private final MatchRepository matchRepository;
	private final NotificationService notificationService;
	private final RequestRepository requestRepository;

	private final ObjectMapper objectMapper = new ObjectMapper()
		.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
		.findAndRegisterModules();

	public RequestEventListener(
			EventRepository eventRepository,
			LookupCodes lookupCodes,
			NotificationService notificationService,
			ApplicationProperties applicationProperties,
			MatchRepository matchRepository,
			RequestRepository requestRepository) {
		this.eventRepository = eventRepository;
		this.lookupCodes = lookupCodes;
		this.notificationService = notificationService;
		this.applicationProperties = applicationProperties;
		this.matchRepository = matchRepository;
		this.requestRepository = requestRepository;
	}

	@Async
	@EventListener({ RequestCreatedEvent.class })
	public void handleRequestCreated(RequestCreatedEvent event) throws JsonProcessingException {
		eventRepository.save(EventEntity.builder()
			.type("REQUEST_CREATED")
			.details(objectMapper.writeValueAsString(event))
			.build());

		log.info("Event: request created - ID: {}", event.dto().id());
	}

	@Async
	@EventListener({ RequestUpdatedEvent.class })
	public void handleRequestUpdated(RequestUpdatedEvent event) throws JsonProcessingException {
		eventRepository.save(EventEntity.builder()
			.type("REQUEST_UPDATED")
			.details(objectMapper.writeValueAsString(event))
			.build());

		log.info("Event: request updated - ID: {}", event.dto().id());
	}

	/**
	 * Handles the RequestFeedbackPendingEvent and sends a notification to the request owner and matched profiles
	 */
	@Async
	@EventListener({ RequestFeedbackPendingEvent.class })
	public void sendRequestFeedbackPendingNotification(RequestFeedbackPendingEvent event) {
		final var request = event.dto();
		final var language = Optional.ofNullable(request.languageCode())
			.orElse(lookupCodes.languages().english());

		final var emails = Stream.of(
			request.additionalContactEmails(),
			request.submitterEmails(),
			request.hiringManagerEmails(),
			request.subDelegatedManagerEmails(),
			List.of(applicationProperties.gcnotify().hrGdInboxEmail())
		).flatMap(List::stream).collect(toSet());

		emails.forEach(email -> notificationService.sendRequestNotification(
			email,
			request.id(),
			request.nameEn(),
			RequestEvent.FEEDBACK_PENDING,
			language
		));

		sendJobOpportunityNotificationsToMatchedProfiles(request);
	}

	/**
	 * Sends job opportunity notifications to the personal and business emails of matched profiles.
	 *
	 * @param request The request DTO
	 */
	private void sendJobOpportunityNotificationsToMatchedProfiles(RequestEventDto request) {
		final var matches = matchRepository.findAll(MatchRepository.hasRequestId(request.id()));

		if (matches.isEmpty()) {
			log.warn("No matches found for request ID: [{}]", request.id());
			return;
		}

		final var emailsByLanguage = Map.of(
			lookupCodes.languages().english(), new ArrayList<String>(),
			lookupCodes.languages().french(), new ArrayList<String>()
		);

		for (final var match : matches) {
			final var profile = match.getProfile();
			final var user = profile.getUser();

			// Get the preferred language of correspondence for this profile
			final var language = Optional.ofNullable(profile.getLanguageOfCorrespondence())
				.map(LanguageEntity::getCode)
				.orElse(Optional.ofNullable(request.languageCode())
					.orElse(lookupCodes.languages().english()));

			// Add personal email if available
			Optional.ofNullable(profile.getPersonalEmailAddress())
				.filter(StringUtils::hasText)
				.ifPresent(email -> emailsByLanguage.get(language).add(email));

			// Add business email if available
			Optional.ofNullable(user)
				.map(UserEntity::getBusinessEmailAddress)
				.filter(StringUtils::hasText)
				.ifPresent(email -> emailsByLanguage.get(language).add(email));
		}

		// Send bulk notifications by language preference
		var totalEmailsSent = 0;

		// Send English emails
		final var englishEmails = emailsByLanguage.get(lookupCodes.languages().english());

		if (!englishEmails.isEmpty()) {
			log.info("Sending bulk job opportunity notifications () {} English-speaking recipients for request ID: [{}]", englishEmails.size(), request.id());

			final var jobModelEn = new EmailTemplateModel.JobOpportunity(
				Optional.ofNullable(request.requestNumber()).orElse(""),
				Optional.ofNullable(request.nameEn()).orElse(""),
				Optional.ofNullable(request.classificationNameEn()).orElse("N/A"),
				Optional.ofNullable(request.languageRequirementNameEn()).orElse("N/A"),
				Optional.ofNullable(request.location()).orElse(""),
				Optional.ofNullable(request.securityClearanceNameEn()).orElse("N/A"),
				Optional.ofNullable(request.submitterName()).orElse("N/A"),
				Optional.ofNullable(request.submitterEmail()).orElse("N/A"),
				request.bilingual(),
				Optional.ofNullable(request.somcAndConditionEmploymentEn()).orElse("N/A")
			);

			notificationService.sendBulkJobOpportunityNotification(
				englishEmails,
				request.id(),
				request.nameEn(),
				jobModelEn,
				lookupCodes.languages().english()
			);

			totalEmailsSent += englishEmails.size();
		}

		final var frenchEmails = emailsByLanguage.get(lookupCodes.languages().french());

		if (!frenchEmails.isEmpty()) {
			log.info("Sending bulk job opportunity notifications () {} French-speaking recipients for request ID: [{}]", frenchEmails.size(), request.id());

			final var jobModelFr = new EmailTemplateModel.JobOpportunity(
				Optional.ofNullable(request.requestNumber()).orElse(""),
				Optional.ofNullable(request.nameFr()).orElse(""),
				Optional.ofNullable(request.classificationNameFr()).orElse("N/A"),
				Optional.ofNullable(request.languageRequirementNameFr()).orElse("N/A"),
				Optional.ofNullable(request.location()).orElse(""),
				Optional.ofNullable(request.securityClearanceNameFr()).orElse("N/A"),
				Optional.ofNullable(request.submitterName()).orElse("N/A"),
				Optional.ofNullable(request.submitterEmail()).orElse("N/A"),
				request.bilingual(),
				Optional.ofNullable(request.somcAndConditionEmploymentFr()).orElse("N/A")
			);

			notificationService.sendBulkJobOpportunityNotification(
				frenchEmails,
				request.id(),
				request.nameFr(),
				jobModelFr,
				lookupCodes.languages().french()
			);
		}

		log.info("Sent job opportunity notifications () {} total recipients for request ID: [{}]", totalEmailsSent, request.id());
	}

	@Async
	@EventListener({ RequestSubmittedEvent.class })
	public void handleRequestSubmitted(RequestSubmittedEvent event) throws JsonProcessingException {
		eventRepository.save(EventEntity.builder()
			.type("REQUEST_SUBMITTED")
			.details(objectMapper.writeValueAsString(event))
			.build()
		);

		log.info(
			"Event: request submitted - ID: {}, from status: {}, to status: {}",
			event.dto().id(), event.previousStatusCode(), event.newStatusCode()
		);

		sendSubmittedNotification(event.dto());
	}

	/**
	 * Handles the RequestStatusChangeEvent and sends a notification based on the status change.
	 */
	@Async
	@EventListener({ RequestStatusChangeEvent.class })
	public void handleRequestStatusChange(RequestStatusChangeEvent event) throws JsonProcessingException {
		eventRepository.save(EventEntity.builder()
			.type("REQUEST_STATUS_CHANGE")
			.details(objectMapper.writeValueAsString(event))
			.build());

		log.info("Event: request status changed - ID: {}, from status: {}, () status: {}",
			event.dto().id(), event.previousStatusCode(), event.newStatusCode());

		final var request = event.dto();
		final var newStatusCode = event.newStatusCode();

		// Determine which users () notify based on the status change
		if ("PENDING_PSC_NO_VMS".equals(newStatusCode) || "PENDING_PSC".equals(newStatusCode)) {
			sendPscRequiredNotification(request);
		} else if ("CLR_GRANTED".equals(newStatusCode)) {
			sendPscNotRequiredNotification(request);
		} else if ("CANCELLED".equals(newStatusCode)) {
			sendCancelledNotification(request);
		}
		// Add more status change handlers here as needed
	}

	/**
	 * Handles the RequestFeedbackCompletedEvent and sends a notification to the HR advisor (if their email is available)
	 * and always sends a notification to the generic HR inbox. If the HR advisor's email is missing, a warning is logged.
	 */
	@Async
	@EventListener({ RequestFeedbackCompletedEvent.class })
	public void sendRequestFeedbackCompletedNotification(RequestFeedbackCompletedEvent event) {
		final var request = event.dto();
		final var language = Optional.ofNullable(request.languageCode()).orElse("en");

		Optional.ofNullable(request.hrAdvisorEmail()).ifPresentOrElse(
			email -> notificationService.sendRequestNotification(
				email,
				request.id(),
				request.nameEn(),
				RequestEvent.FEEDBACK_COMPLETED,
				language
			),
			() -> log.warn("No HR advisor email found for request ID: [{}]", request.id())
		);

		final var hrEmail = applicationProperties.gcnotify().hrGdInboxEmail();

		log.info("Sending feedback completed notification to generic HR inbox for request ID: [{}]", request.id());

		notificationService.sendRequestNotification(
			hrEmail,
			request.id(),
			request.nameEn(),
			RequestEvent.FEEDBACK_COMPLETED,
			language
		);
	}

	/**
	 * Handles the RequestCompletedEvent and sends an email notification.
	 * The notification is sent to the submitter, hiring manager, HR delegate, and the HR advisor's business email.
	 */
	@Async
	@EventListener({ RequestCompletedEvent.class })
	public void handleRequestCompleted(RequestCompletedEvent event) throws JsonProcessingException {
		final var request = event.dto();

		eventRepository.save(EventEntity.builder()
			.type("REQUEST_COMPLETED")
			.details(objectMapper.writeValueAsString(event))
			.build());

		log.info("Event: request completed - ID: {}", request.id());

		final var language = Optional.ofNullable(request.languageCode()).orElse("en");

		final var emails = Stream.of(
			request.additionalContactEmails(),
			request.submitterEmails(),
			request.hiringManagerEmails(),
			request.subDelegatedManagerEmails(),
			Optional.ofNullable(request.hrAdvisorEmail()).map(List::of).orElse(List.<String>of()),
			List.of(applicationProperties.gcnotify().hrGdInboxEmail())
		).flatMap(List::stream).collect(toSet());

		if (emails.isEmpty()) {
			log.warn("No email addresses found for request ID: [{}]", request.id());
			return;
		}

		// Determine the appropriate event type based on the status code in the event
		final var requestEvent = event.statusCode() != null && event.statusCode().equals(lookupCodes.requestStatuses().pscClearanceGrantedNoVms())
			? RequestEvent.COMPLETED_NO_VMS
			: RequestEvent.COMPLETED;

		emails.forEach(email -> {
			notificationService.sendRequestNotification(
				email,
				request.id(),
				request.nameEn(),
				requestEvent,
				language,
				request.priorityClearanceNumber(),
				request.pscClearanceNumber()
			);
		});
	}

	/**
	 * Sends a notification when a request is submitted.
	 * The notification is sent to the HR inbox email.
	 *
	 * @param request The request DTO
	 */
	private void sendSubmittedNotification(RequestEventDto request) {
		final var language = Optional.ofNullable(request.languageCode())
			.orElse(lookupCodes.languages().english());

		final var hrEmail = applicationProperties.gcnotify().hrGdInboxEmail();

		notificationService.sendRequestNotification(
			hrEmail,
			request.id(),
			request.nameEn(),
			RequestEvent.SUBMITTED,
			language
		);
	}

	/**
	 * Sends a notification when a request is marked as VMS not required.
	 * The notification is sent to the PIMS SLE team email.
	 *
	 * @param request The request DTO
	 */
	private void sendVmsNotRequiredNotification(RequestEventDto request) {
		final var language = Optional.ofNullable(request.languageCode())
			.orElse(lookupCodes.languages().english());

		final var pimsEmail = applicationProperties.gcnotify().pimsSleTeamEmail();

		notificationService.sendRequestNotification(
			pimsEmail,
			request.id(),
			request.nameEn(),
			RequestEvent.VMS_NOT_REQUIRED,
			language
		);
	}

	/**
	 * Sends a notification when a request is marked as PSC not required.
	 * The notification is sent to the request owner which could be the submitter,
	 * the hiring manager or the hr delegate. Send email to all 3.
	 *
	 * @param request The request DTO
	 */
	private void sendPscNotRequiredNotification(RequestEventDto request) {
		final var language = Optional.ofNullable(request.languageCode()).
			orElse(lookupCodes.languages().english());

		final var emails = Stream.of(
			request.additionalContactEmails(),
			request.submitterEmails(),
			request.hiringManagerEmails(),
			request.subDelegatedManagerEmails()
		).flatMap(List::stream).collect(toSet());

		emails.forEach(email -> notificationService.sendRequestNotification(
			email,
			request.id(),
			request.nameEn(),
			RequestEvent.PSC_NOT_REQUIRED,
			language,
			request.priorityClearanceNumber(),
			request.pscClearanceNumber()
		));
	}

	/**
	 * Sends a notification when a request is marked as PSC required.
	 * The notification is sent to the PIMS team email.
	 *
	 * @param request The request DTO
	 */
	private void sendPscRequiredNotification(RequestEventDto request) {
		final var language = Optional.ofNullable(request.languageCode())
			.orElse(lookupCodes.languages().english());

		final var pimsEmail = applicationProperties.gcnotify().pimsSleTeamEmail();

		notificationService.sendRequestNotification(
			pimsEmail,
			request.id(),
			request.nameEn(),
			RequestEvent.PSC_REQUIRED,
			language
		);
	}



	/**
	 * Sends a notification when a request is cancelled.
	 * The notification is sent to the submitter, hiring manager, and HR delegate.
	 *
	 * @param request The request DTO
	 */
	private void sendCancelledNotification(RequestEventDto request) {
		final var language = Optional.ofNullable(request.languageCode())
			.orElse(lookupCodes.languages().english());

		final var emails = Stream.of(
			request.additionalContactEmails(),
			request.submitterEmails(),
			request.hiringManagerEmails(),
			request.subDelegatedManagerEmails()
		).flatMap(List::stream).collect(toSet());

		emails.forEach(email -> notificationService.sendRequestNotification(
			email,
			request.id(),
			request.nameEn(),
			RequestEvent.CANCELLED,
			language
		));
	}

	/**
	 * Handles the MatchStatusChangeEvent and sends a notification when a match status changes from MATCH_PENDING to APPROVED.
	 * The notification is sent to the profile owner's personal and business emails.
	 */
	@Async
	@EventListener({ MatchStatusChangeEvent.class })
	public void handleMatchStatusChange(MatchStatusChangeEvent event) throws JsonProcessingException {
		// Save the event to the repository
		eventRepository.save(EventEntity.builder()
			.type("MATCH_STATUS_CHANGE")
			.details(objectMapper.writeValueAsString(event))
			.build());

		log.info("Event: match status changed - ID: {}, from status: {}, to status: {}",
			event.entity().getId(), event.previousStatusCode(), event.newStatusCode());

		// Check if the status has changed from MATCH_PENDING to APPROVED
		if ("MATCH_PENDING".equals(event.previousStatusCode()) && "APPROVED".equals(event.newStatusCode())) {
			final var match = event.entity();
			final var profile = match.getProfile();
			final var request = match.getRequest();

			List<String> profileEmails = new ArrayList<>();

			// Add personal and business emails if available
			if (StringUtils.hasText(profile.getPersonalEmailAddress())) {
				profileEmails.add(profile.getPersonalEmailAddress());
			}

			if (profile.getUser() != null && StringUtils.hasText(profile.getUser().getBusinessEmailAddress())) {
				profileEmails.add(profile.getUser().getBusinessEmailAddress());
			}

			if (profileEmails.isEmpty()) {
				log.warn("No emails found for profile ID: [{}]", profile.getId());
				return;
			}

			// Get the profile owner's language preference
			final var language = Optional.ofNullable(profile.getLanguageOfCorrespondence())
				.map(LanguageEntity::getCode)
				.orElse(lookupCodes.languages().english());

			log.info("Sending job opportunity HR notification () profile owner for match ID: [{}]", match.getId());

			final var jobModel = createJobModel(request, language);

			// Get match feedback if available
			final var matchFeedback = Optional.ofNullable(match.getMatchFeedback())
				.map(feedback -> lookupCodes.languages().english().equals(language) ? feedback.getNameEn() : feedback.getNameFr())
				.orElse("N/A");

			final var jobOpportunityHR = new EmailTemplateModel.JobOpportunityHR(
				jobModel.requestNumber(),
				jobModel.positionTitle(),
				jobModel.classification(),
				jobModel.languageRequirement(),
				jobModel.location(),
				jobModel.securityClearance(),
				matchFeedback,
				jobModel.submitterName(),
				jobModel.submitterEmail()
			);

			notificationService.sendJobOpportunityHRNotification(profileEmails, jobOpportunityHR, language);

			log.info("Sent job opportunity HR notifications () {} recipient(s) for match ID: [{}]",
				profileEmails.size(), match.getId());
		}
	}

	/**
	 * Creates a job opportunity model for an email template based on the specified language.
	 *
	 * @param request The request entity
	 * @param language The language code ("en" or "fr")
	 * @return A job opportunity model with properties in the specified language
	 */
	private EmailTemplateModel.JobOpportunity createJobModel(RequestEntity request, String language) {
		boolean isEnglish = lookupCodes.languages().english().equals(language);

		// Get location cities
		final var location = request.getCities().stream()
			.map(city -> isEnglish ? city.getNameEn() : city.getNameFr())
			.collect(Collectors.joining(", "));

		// Get classification name
		final var classification = Optional.ofNullable(request.getClassification())
			.map(cls -> isEnglish ? cls.getNameEn() : cls.getNameFr())
			.orElse("N/A");

		// Get language requirement
		final var languageRequirement = Optional.ofNullable(request.getLanguageRequirement())
			.map(req -> isEnglish ? req.getNameEn() : req.getNameFr())
			.orElse("N/A");

		// Get security clearance
		final var securityClearance = Optional.ofNullable(request.getSecurityClearance())
			.map(sec -> isEnglish ? sec.getNameEn() : sec.getNameFr())
			.orElse("N/A");

		// Get submitter information
		final var submitterName = Optional.ofNullable(request.getSubmitter())
			.map(submitter -> submitter.getFirstName() + " " + submitter.getLastName())
			.orElse("N/A");

		final var submitterEmail = Optional.ofNullable(request.getSubmitter())
			.map(UserEntity::getBusinessEmailAddress)
			.orElse("N/A");

		// Set bilingual flag based on language requirement code
		final var languageRequirementCode = Optional.ofNullable(request.getLanguageRequirement())
			.map(LanguageRequirementEntity::getCode)
			.orElse("");
		final var bilingual = "BI".equals(languageRequirementCode) || "BNI".equals(languageRequirementCode);

		// Get statement of merit criteria
		final var statementOfMeritCriteria = Optional.ofNullable(
			isEnglish ? request.getSomcAndConditionEmploymentEn() : request.getSomcAndConditionEmploymentFr()
		).orElse("N/A");

		return new EmailTemplateModel.JobOpportunity(
			request.getRequestNumber(),
			isEnglish ? request.getNameEn() : request.getNameFr(),
			classification,
			languageRequirement,
			location,
			securityClearance,
			submitterName,
			submitterEmail,
			bilingual,
			statementOfMeritCriteria
		);
	}
}
