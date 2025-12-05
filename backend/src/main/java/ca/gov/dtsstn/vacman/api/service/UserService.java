package ca.gov.dtsstn.vacman.api.service;

import static ca.gov.dtsstn.vacman.api.data.entity.AbstractCodeEntity.byCode;

import java.util.Optional;

import org.mapstruct.factory.Mappers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ca.gov.dtsstn.vacman.api.config.properties.ApplicationProperties;
import ca.gov.dtsstn.vacman.api.config.properties.EntraIdProperties.RolesProperties;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes;
import ca.gov.dtsstn.vacman.api.config.properties.LookupCodes.UserTypes;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.repository.UserRepository;
import ca.gov.dtsstn.vacman.api.event.UserCreatedEvent;
import ca.gov.dtsstn.vacman.api.event.UserDeletedEvent;
import ca.gov.dtsstn.vacman.api.event.UserReadEvent;
import ca.gov.dtsstn.vacman.api.event.UserUpdatedEvent;
import ca.gov.dtsstn.vacman.api.security.SecurityUtils;
import ca.gov.dtsstn.vacman.api.service.mapper.UserEntityEventMapper;
import ca.gov.dtsstn.vacman.api.service.mapper.UserEntityMapper;
import io.micrometer.core.annotation.Counted;

@Service
public class UserService {

	private static final Logger log = LoggerFactory.getLogger(UserService.class);

	private final ApplicationEventPublisher eventPublisher;

	private final CodeService codeService;

	private final RolesProperties entraRoles;

	private final UserEntityEventMapper userEntityEventMapper = Mappers.getMapper(UserEntityEventMapper.class);

	private final UserEntityMapper userEntityMapper;

	private final UserRepository userRepository;

	private final UserTypes userTypeCodes;

	public UserService(
			ApplicationProperties applicationProperties,
			CodeService codeService,
			ApplicationEventPublisher eventPublisher,
			UserEntityMapper userEntityMapper,
			UserRepository userRepository,
			LookupCodes lookupCodes) {
		this.entraRoles = applicationProperties.entraId().roles();
		this.codeService = codeService;
		this.eventPublisher = eventPublisher;
		this.userEntityMapper = userEntityMapper;
		this.userRepository = userRepository;
		this.userTypeCodes = lookupCodes.userTypes();
	}

	@Transactional(readOnly = false)
	@Counted("service.user.createUser.count")
	public UserEntity createUser(UserEntity user) {
		final var userTypeCode = SecurityUtils.hasAuthority(entraRoles.hrAdvisor())
			? userTypeCodes.hrAdvisor()
			: userTypeCodes.employee();

		user.setUserType(codeService.getUserTypes(Pageable.unpaged()).stream()
			.filter(byCode(userTypeCode))
			.findFirst().orElseThrow());

		// Save the user (profiles are created separately as needed)
		final var createdUser = userRepository.save(user);

		// Publish created event
		eventPublisher.publishEvent(new UserCreatedEvent(userEntityEventMapper.toEventDto(createdUser)));
		log.info("User created with ID: {}", createdUser.getId());

		return createdUser;
	}

	@Transactional(readOnly = true)
	@Counted("service.user.getUserById.count")
	public Optional<UserEntity> getUserById(long id) {
		return userRepository.findById(id).map(user -> {
			eventPublisher.publishEvent(new UserReadEvent(userEntityEventMapper.toEventDto(user)));
			return user;
		});
	}

	@Transactional(readOnly = true)
	@Counted("service.user.getUserByMicrosoftEntraId.count")
	public Optional<UserEntity> getUserByMicrosoftEntraId(String entraId) {
		// No need to emit an event here because this is used
		// in intermediary steps by other methods that emit events

		// XXX ::: GjB ::: I think we should still consider emitting an event here

		final var example = Example.of(UserEntity.builder()
			.microsoftEntraId(entraId)
			.build());

		return userRepository.findOne(example);
	}

	@Transactional(readOnly = true)
	@Counted("service.user.getUsers.count")
	public Page<UserEntity> getUsers(Pageable pageable) {
		final var users = userRepository.findAll(pageable);
		users.forEach(user -> eventPublisher.publishEvent(new UserReadEvent(userEntityEventMapper.toEventDto(user))));
		return users;
	}

	/**
	 * Finds users based on an example entity with pagination support.
	 *
	 * @param example  The {@link UserEntity} instance to use as a query example.
	 *                 Fields with non-null values will be used as query criteria.
	 * @param pageable The {@link Pageable} object that specifies the page number,
	 *                 page size, and sorting order.
	 * @return A {@link Page} of {@link UserEntity} objects that match the example.
	 *         Will never be {@code null}.
	 */
	@Transactional(readOnly = true)
	@Counted("service.user.findUsers.count")
	public Page<UserEntity> findUsers(UserEntity example, Pageable pageable) {
		final var users = userRepository.findAll(Example.of(example), pageable);
		users.forEach(user -> eventPublisher.publishEvent(new UserReadEvent(userEntityEventMapper.toEventDto(user))));
		return users;
	}

	@Transactional(readOnly = false)
	@Counted("service.user.overwriteUser.count")
	public UserEntity overwriteUser(long id, UserEntity updates) {
		final var existingUser = userRepository.findById(id).orElseThrow();
		userEntityMapper.overwrite(updates, existingUser);
		final var updatedUser = userRepository.save(existingUser);
		eventPublisher.publishEvent(new UserUpdatedEvent(userEntityEventMapper.toEventDto(updatedUser)));
		log.info("User updated with ID: {}", updatedUser.getId());
		return updatedUser;
	}

	@Transactional(readOnly = false)
	@Counted("service.user.updateUser.count")
	public UserEntity updateUser(long id, UserEntity updates) {
		final var existingUser = userRepository.findById(id).orElseThrow();
		userEntityMapper.update(updates, existingUser);
		final var updatedUser = userRepository.save(existingUser);
		eventPublisher.publishEvent(new UserUpdatedEvent(userEntityEventMapper.toEventDto(updatedUser)));
		log.info("User updated with ID: {}", updatedUser.getId());
		return updatedUser;
	}

	@Transactional(readOnly = false)
	@Counted("service.user.deleteUser.count")
	public void deleteUser(long id) {
		userRepository.findById(id).ifPresent(user -> {
			userRepository.deleteById(id);
			eventPublisher.publishEvent(new UserDeletedEvent(userEntityEventMapper.toEventDto(user)));
			log.info("User deleted with ID: {}", id);
		});
	}

}
