package ca.gov.dtsstn.vacman.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import ca.gov.dtsstn.vacman.api.data.entity.MatchEntity;
import ca.gov.dtsstn.vacman.api.data.repository.MatchRepository;

@ExtendWith(MockitoExtension.class)
class MatchServiceTest {

	@Mock MatchRepository matchRepository;

	@InjectMocks MatchService matchService;

	@Test
	void testGetMatchById_WhenFound() {
		when(matchRepository.findById(1L))
			.thenReturn(Optional.of(MatchEntity.builder()
				.id(1L)
				.build()));

		final var result = matchService.getMatchById(1L);

		assertThat(result).isNotEmpty()
			.hasValueSatisfying(match -> {
				assertThat(match)
					.extracting(MatchEntity::getId)
					.isEqualTo(1L);
			});
	}

	@Test
	void testGetMatchById_WhenNotFound() {
		when(matchRepository.findById(any()))
			.thenReturn(Optional.empty());

		final var result = matchService.getMatchById(1L);

		assertThat(result).isEmpty();
	}

}