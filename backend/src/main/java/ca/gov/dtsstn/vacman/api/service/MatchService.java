package ca.gov.dtsstn.vacman.api.service;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ca.gov.dtsstn.vacman.api.data.entity.MatchEntity;
import ca.gov.dtsstn.vacman.api.data.repository.MatchRepository;
import io.micrometer.core.annotation.Counted;

@Service
public class MatchService {

	private static final Logger log = LoggerFactory.getLogger(MatchService.class);

	private final MatchRepository matchRepository;

	public MatchService(MatchRepository matchRepository) {
		this.matchRepository = matchRepository;
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
		return matchRepository.save(match);
	}

}