package ca.gov.dtsstn.vacman.api.service;

import static ca.gov.dtsstn.vacman.api.data.entity.AbstractCodeEntity.byCode;
import static ca.gov.dtsstn.vacman.api.data.entity.AbstractCodeEntity.byId;

import java.util.List;
import java.util.Optional;

import org.mapstruct.factory.Mappers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import ca.gov.dtsstn.vacman.api.constants.AppConstants;

import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntityBuilder;
import ca.gov.dtsstn.vacman.api.data.repository.UserRepository;
import ca.gov.dtsstn.vacman.api.event.CurrentUserReadEvent;
import ca.gov.dtsstn.vacman.api.event.UserCreatedEvent;
import ca.gov.dtsstn.vacman.api.event.UserDeletedEvent;
import ca.gov.dtsstn.vacman.api.event.UserReadEvent;
import ca.gov.dtsstn.vacman.api.event.UserUpdatedEvent;
import ca.gov.dtsstn.vacman.api.web.model.UserUpdateModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.UserModelMapper;

@Service
public class UserService {

	private static final Logger log = LoggerFactory.getLogger(UserService.class);

	private final ApplicationEventPublisher eventPublisher;

	private final CodeService codeService;

	private final UserModelMapper userModelMapper = Mappers.getMapper(UserModelMapper.class);

	private final UserRepository userRepository;

	public UserService(ApplicationEventPublisher eventPublisher, CodeService codeService, UserRepository userRepository) {
		this.userRepository = userRepository;
		this.eventPublisher = eventPublisher;
		this.codeService = codeService;
	}

	public UserEntity createUser(UserEntity user, Long languageId) {
		return createUser(user, languageId, AppConstants.UserType.EMPLOYEE);
	}

	public UserEntity createUser(UserEntity user, Long languageId, String userType) {
		// Set language based on languageCode (validation ensures it exists)
		user.setLanguage(codeService.getLanguages(Pageable.unpaged()).stream()
			.filter(byId(languageId))
			.findFirst().orElseThrow());

		// Set user type based on role (validation ensures it exists)
		user.setUserType(codeService.getUserTypes(Pageable.unpaged()).stream()
			.filter(byCode(userType))
			.findFirst().orElseThrow());

		// Save the user (profiles are created separately as needed)
		final var createdUser = userRepository.save(user);

		// Publish created event
		eventPublisher.publishEvent(new UserCreatedEvent(createdUser));
		log.info("User created with ID: {}", createdUser.getId());

		return createdUser;
	}


	public Optional<UserEntity> getUserById(Long id) {
		final var userOptional = userRepository.findById(id);
		userOptional.ifPresent(user -> {
			eventPublisher.publishEvent(new UserReadEvent(user.getId()));
			log.info("User read with ID: {}", user.getId());
		});
		return userOptional;
	}

	// No need to emit an event here because this is used in intermediary steps by other methods that emit events.
	public Optional<UserEntity> getUserByMicrosoftEntraId(String microsoftEntraId) {
		return userRepository.findOne(Example.of(new UserEntityBuilder().microsoftEntraId(microsoftEntraId).build()));
	}

	public Optional<UserEntity> getCurrentUserByMicrosoftEntraId(String microsoftEntraId) {
		final var userOptional = userRepository.findOne(Example.of(new UserEntityBuilder().microsoftEntraId(microsoftEntraId).build()));
		// HACK(Max) - Commented out as this appears to be causing a SO.
		/*
		userOptional.ifPresent(user -> {
			eventPublisher.publishEvent(new CurrentUserReadEvent(user.getId(), microsoftEntraId));
			log.info("Current user read with Microsoft Entra ID: {}", microsoftEntraId);
		});
		 */
		return userOptional;
	}

	public List<UserEntity> getAllUsers() {
		return List.copyOf(userRepository.findAll());
	}

	public Page<UserEntity> getUsers(Pageable pageable) {
		return userRepository.findAll(pageable);
	}

	//
	// TODO ::: GjB ::: this should not use a REST model; it should use an entity (or DTO)
	//
	public UserEntity updateUser(UserUpdateModel updateModel) {
		final var existingUser = userRepository.findById(updateModel.id()).orElseThrow();
		userModelMapper.updateEntityFromModel(updateModel, existingUser);

		// Handle role update if provided (validation ensures it exists)
		Optional.ofNullable(updateModel.userTypeId()).ifPresent(role -> {
			existingUser.setUserType(codeService.getUserTypes(Pageable.unpaged()).stream()
				.filter(byId(updateModel.userTypeId()))
				.findFirst().orElseThrow());
		});

		// Handle language update if provided (validation ensures it exists)
		Optional.ofNullable(updateModel.languageId()).ifPresent(languageCode -> {
			existingUser.setLanguage(codeService.getLanguages(Pageable.unpaged()).stream()
					.filter(byId(updateModel.languageId()))
					.findFirst().orElseThrow());
		});

		final var updatedUser = userRepository.save(existingUser);

		// Publish updated event
		eventPublisher.publishEvent(new UserUpdatedEvent(updatedUser));
		log.info("User updated with ID: {}", updatedUser.getId());

		return updatedUser;
	}

	public void deleteUser(Long id) {
		userRepository.findById(id)
			.ifPresent(user -> {
				userRepository.deleteById(id);
				eventPublisher.publishEvent(new UserDeletedEvent(user));
				log.info("User deleted with ID: {}", id);
			});
	}

}
