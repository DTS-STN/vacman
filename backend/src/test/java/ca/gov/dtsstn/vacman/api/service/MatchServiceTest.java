package ca.gov.dtsstn.vacman.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import ca.gov.dtsstn.vacman.api.data.entity.MatchEntity;
import ca.gov.dtsstn.vacman.api.data.entity.MatchStatusEntity;
import ca.gov.dtsstn.vacman.api.data.repository.MatchRepository;
import ca.gov.dtsstn.vacman.api.event.MatchStatusChangeEvent;

@ExtendWith(MockitoExtension.class)
class MatchServiceTest {

	@Mock MatchRepository matchRepository;
	@Mock ApplicationEventPublisher eventPublisher;

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

	@Test
	void testUpdateMatch_WhenStatusChangesFromPendingToApproved_ShouldPublishEvent() {
		// Create a match status entity with code "MATCH_PENDING"
		MatchStatusEntity pendingStatus = new MatchStatusEntity();
		pendingStatus.setCode("MATCH_PENDING");

		// Create a match status entity with code "APPROVED"
		MatchStatusEntity approvedStatus = new MatchStatusEntity();
		approvedStatus.setCode("APPROVED");

		// Create a match entity with the pending status
		MatchEntity existingMatch = MatchEntity.builder()
			.id(1L)
			.matchStatus(pendingStatus)
			.build();

		// Create an updated match entity with the approved status
		MatchEntity updatedMatch = MatchEntity.builder()
			.id(1L)
			.matchStatus(approvedStatus)
			.build();

		// Mock the repository to return the existing match when findById is called
		when(matchRepository.findById(1L)).thenReturn(Optional.of(existingMatch));

		// Mock the repository to return the updated match when save is called
		when(matchRepository.save(any(MatchEntity.class))).thenReturn(updatedMatch);

		// Call the updateMatch method
		MatchEntity result = matchService.updateMatch(updatedMatch);

		// Verify that the result is the updated match
		assertThat(result).isEqualTo(updatedMatch);

		// Verify that the event publisher was called with a MatchStatusChangeEvent
		verify(eventPublisher).publishEvent(any(MatchStatusChangeEvent.class));
	}

	@Test
	void testUpdateMatch_WhenStatusDoesNotChange_ShouldNotPublishEvent() {
		// Create a match status entity with code "MATCH_PENDING"
		MatchStatusEntity pendingStatus = new MatchStatusEntity();
		pendingStatus.setCode("MATCH_PENDING");

		// Create a match entity with the pending status
		MatchEntity existingMatch = MatchEntity.builder()
			.id(1L)
			.matchStatus(pendingStatus)
			.build();

		// Create an updated match entity with the same pending status
		MatchEntity updatedMatch = MatchEntity.builder()
			.id(1L)
			.matchStatus(pendingStatus)
			.build();

		// Mock the repository to return the existing match when findById is called
		when(matchRepository.findById(1L)).thenReturn(Optional.of(existingMatch));

		// Mock the repository to return the updated match when save is called
		when(matchRepository.save(any(MatchEntity.class))).thenReturn(updatedMatch);

		// Call the updateMatch method
		MatchEntity result = matchService.updateMatch(updatedMatch);

		// Verify that the result is the updated match
		assertThat(result).isEqualTo(updatedMatch);

		// Verify that the event publisher was not called
		verifyNoInteractions(eventPublisher);
	}

	@Test
	void testUpdateMatch_WhenStatusChangesToSomethingElse_ShouldNotPublishEvent() {
		// Create a match status entity with code "MATCH_PENDING"
		MatchStatusEntity pendingStatus = new MatchStatusEntity();
		pendingStatus.setCode("MATCH_PENDING");

		// Create a match status entity with code "REJECTED"
		MatchStatusEntity rejectedStatus = new MatchStatusEntity();
		rejectedStatus.setCode("REJECTED");

		// Create a match entity with the pending status
		MatchEntity existingMatch = MatchEntity.builder()
			.id(1L)
			.matchStatus(pendingStatus)
			.build();

		// Create an updated match entity with the rejected status
		MatchEntity updatedMatch = MatchEntity.builder()
			.id(1L)
			.matchStatus(rejectedStatus)
			.build();

		// Mock the repository to return the existing match when findById is called
		when(matchRepository.findById(1L)).thenReturn(Optional.of(existingMatch));

		// Mock the repository to return the updated match when save is called
		when(matchRepository.save(any(MatchEntity.class))).thenReturn(updatedMatch);

		// Call the updateMatch method
		MatchEntity result = matchService.updateMatch(updatedMatch);

		// Verify that the result is the updated match
		assertThat(result).isEqualTo(updatedMatch);

		// Verify that the event publisher was not called
		verifyNoInteractions(eventPublisher);
	}

}
