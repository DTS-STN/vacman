package ca.gov.dtsstn.vacman.api.data.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.jdbc.DataJdbcTest;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.context.annotation.Import;
import org.springframework.data.jdbc.core.JdbcAggregateTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import ca.gov.dtsstn.vacman.api.SecurityAuditor;
import ca.gov.dtsstn.vacman.api.config.DataSourceConfig;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;

@DataJdbcTest
@ActiveProfiles("test")
@Import({ DataSourceConfig.class })
@DisplayName("UserRepository tests")
@AutoConfigureTestDatabase(replace = Replace.NONE)
class UserRepositoryTest {

	@Autowired
	JdbcAggregateTemplate jdbcAggregateTemplate;

	@Autowired
	UserRepository userRepository;

	@MockitoBean
	SecurityAuditor securityAuditor;

	@Test
	@DisplayName("findById should return empty Optional when user does not exist")
	void whenFindById_givenUserDoesNotExist_thenReturnEmptyOptional() {
		assertThat(userRepository.findById("00000000-0000-0000-0000-000000000000")).isNotPresent();
	}

	@Test
	@DisplayName("findById should return User when user exists")
	void whenFindById_givenUserExists_thenReturnUser() {
		when(securityAuditor.getCurrentAuditor()).thenReturn(Optional.of("test-auditor"));

		jdbcAggregateTemplate.save(UserEntity.builder()
			.id("00000000-0000-0000-0000-000000000000")
			.name("Test User")
			.build());

		final var user = userRepository.findById("00000000-0000-0000-0000-000000000000");

		assertThat(user).isPresent()
			.get().extracting(UserEntity::id, UserEntity::name)
			.containsExactly("00000000-0000-0000-0000-000000000000", "Test User");
	}

}
