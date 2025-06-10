package ca.gov.dtsstn.vacman.api.data.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import ca.gov.dtsstn.vacman.api.SecurityAuditor;
import ca.gov.dtsstn.vacman.api.config.DataSourceConfig;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntityBuilder;

@DataJpaTest
@ActiveProfiles("test")
@Import({ DataSourceConfig.class })
@DisplayName("UserRepository tests")
@AutoConfigureTestDatabase(replace = Replace.NONE)
class UserRepositoryTest {

	@Autowired UserRepository userRepository;

	@MockitoBean SecurityAuditor securityAuditor;

	@Test
	@DisplayName("findById should return empty Optional when user does not exist")
	void whenFindById_givenUserDoesNotExist_thenReturnEmptyOptional() {
		assertThat(userRepository.findById(0L)).isNotPresent();
	}

	@Test
	@Disabled("Needs to be updated to latest entity models")
	@DisplayName("save and findById should retrieve the saved user")
	void whenUserIsSaved_thenFindByIdShouldReturnUser() {
		when(securityAuditor.getCurrentAuditor()).thenReturn(Optional.of("test-auditor"));

		final var savedUser = userRepository.save(
			new UserEntityBuilder()
				.firstName("Jane")
				.lastName("Doe")
				.build());

		assertThat(savedUser).isNotNull();
		assertThat(savedUser.getId()).isNotNull();
		assertThat(savedUser.getFirstName()).isEqualTo("Jane Doe");

		final var foundUserOptional = userRepository.findById(savedUser.getId());

		assertThat(foundUserOptional).isPresent();

		final var foundUser = foundUserOptional.get();
		assertThat(foundUser.getId()).isEqualTo(savedUser.getId());
		assertThat(foundUser.getFirstName()).isEqualTo("Jane Doe");

		assertThat(foundUser.getCreatedBy()).isEqualTo("test-auditor"); // Example assertion
		assertThat(foundUser.getCreatedDate()).isNotNull();
		assertThat(foundUser.getLastModifiedBy()).isEqualTo("test-auditor");
		assertThat(foundUser.getLastModifiedDate()).isNotNull();
	}


}
