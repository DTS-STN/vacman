package ca.gov.dtsstn.vacman.api.service;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ca.gov.dtsstn.vacman.api.data.entity.MatchEntity;
import ca.gov.dtsstn.vacman.api.data.repository.MatchRepository;
import ca.gov.dtsstn.vacman.api.event.MatchStatusChangeEvent;
import io.micrometer.core.annotation.Counted;

@Service
public class MatchService {

	private static final Logger log = LoggerFactory.getLogger(MatchService.class);
	private static final String MATCH_PENDING = "MATCH_PENDING";
	private static final String APPROVED = "APPROVED";

	private final MatchRepository matchRepository;
	private final ApplicationEventPublisher eventPublisher;

	public MatchService(MatchRepository matchRepository, ApplicationEventPublisher eventPublisher) {
		this.matchRepository = matchRepository;
		this.eventPublisher = eventPublisher;
	}

	@Transactional(readOnly = true)
	@Counted("service.match.getMatchById.count")
	public Optional<MatchEntity> getMatchById(long id) {
		log.debug("Fetching match with id: [{}]", id);
		return matchRepository.findById(id);
	}

	@Transactional
	@Counted("service.match.updateMatch.count")
	public MatchEntity updateMatch(MatchEntity match) {
		log.debug("Updating match with id: [{}]", match.getId());

		// Get the current match from the database to check its status
		String previousStatusCode = null;
		if (match.getId() != null) {
			final var existingMatch = matchRepository.findById(match.getId());
			if (existingMatch.isPresent() && existingMatch.get().getMatchStatus() != null) {
				previousStatusCode = existingMatch.get().getMatchStatus().getCode();
			}
		}

		// Save the updated match
		MatchEntity savedMatch = matchRepository.save(match);

		// Check if the status has changed from MATCH_PENDING to APPROVED
		final var newStatusCode = savedMatch.getMatchStatus() != null ? savedMatch.getMatchStatus().getCode() : null;
		if (MATCH_PENDING.equals(previousStatusCode) && APPROVED.equals(newStatusCode)) {
			log.info("Match feedback was approved for match id: [{}]", match.getId());
			eventPublisher.publishEvent(new MatchStatusChangeEvent(savedMatch, previousStatusCode, newStatusCode));
		}

		return savedMatch;
	}

}
