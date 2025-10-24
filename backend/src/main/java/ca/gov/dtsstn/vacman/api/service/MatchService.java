package ca.gov.dtsstn.vacman.api.service;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ca.gov.dtsstn.vacman.api.data.entity.MatchEntity;
import ca.gov.dtsstn.vacman.api.data.repository.MatchRepository;
import io.micrometer.core.instrument.MeterRegistry;

@Service
public class MatchService {

	private static final Logger log = LoggerFactory.getLogger(MatchService.class);

	private final MatchRepository matchRepository;

	private final MeterRegistry meterRegistry;

	public MatchService(MatchRepository matchRepository, MeterRegistry meterRegistry) {
		this.matchRepository = matchRepository;
		this.meterRegistry = meterRegistry;
	}

	@Transactional(readOnly = true)
	public Optional<MatchEntity> getMatchById(long id) {
		log.debug("Fetching match with id: [{}]", id);
		return matchRepository.findById(id);
	}

	@Transactional
	public MatchEntity updateMatch(MatchEntity match) {
		log.debug("Updating match with id: [{}]", match.getId());
		final var updated = matchRepository.save(match);
		meterRegistry.counter("matches.updated").increment();
		return updated;
	}

}