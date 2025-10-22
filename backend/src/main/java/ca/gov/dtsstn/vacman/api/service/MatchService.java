package ca.gov.dtsstn.vacman.api.service;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ca.gov.dtsstn.vacman.api.data.entity.MatchEntity;
import ca.gov.dtsstn.vacman.api.data.repository.MatchRepository;

@Service
public class MatchService {

	private static final Logger log = LoggerFactory.getLogger(MatchService.class);

	private final MatchRepository matchRepository;

	public MatchService(MatchRepository matchRepository) {
		this.matchRepository = matchRepository;
	}

	@Transactional(readOnly = true)
	public Optional<MatchEntity> getMatchById(long id) {
		log.debug("Fetching match with id: [{}]", id);
		return matchRepository.findById(id);
	}

}