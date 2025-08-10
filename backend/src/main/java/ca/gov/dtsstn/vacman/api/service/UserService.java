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
import ca.gov.dtsstn.vacman.api.event.UserCreatedEvent;
import ca.gov.dtsstn.vacman.api.event.UserDeletedEvent;
import ca.gov.dtsstn.vacman.api.event.UserReadEvent;
import ca.gov.dtsstn.vacman.api.event.UserUpdatedEvent;
<<<<<<< Upstream, based on origin/main
import ca.gov.dtsstn.vacman.api.service.mapper.UserEntityMapper;
=======
import ca.gov.dtsstn.vacman.api.web.model.UserUpdateModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.UserModelMapper;
import ca.gov.dtsstn.vacman.api.web.exception.ResourceNotFoundException;
>>>>>>> 9b719ab allow PUT if user is updating themselves or done by hr-advisor

@Service
public class UserService {

	private static final Logger log = LoggerFactory.getLogger(UserService.class);

	private final ApplicationEventPublisher eventPublisher;

	private final CodeService codeService;

	private final UserEntityMapper userEntityMapper = Mappers.getMapper(UserEntityMapper.class);

	private final UserRepository userRepository;

	public UserService(CodeService codeService, ApplicationEventPublisher eventPublisher, UserRepository userRepository) {
		this.codeService = codeService;
		this.eventPublisher = eventPublisher;
		this.userRepository = userRepository;
	}

	public UserEntity createUser(UserEntity user, long languageId) {
		// Set language based on languageCode (validation ensures it exists)
		user.setLanguage(codeService.getLanguages(Pageable.unpaged()).stream()
			.filter(byId(languageId))
			.findFirst().orElseThrow());

		// Set user type based on role (validation ensures it exists)
		user.setUserType(codeService.getUserTypes(Pageable.unpaged()).stream()
			.filter(byCode(AppConstants.UserType.EMPLOYEE))
			.findFirst().orElseThrow());

		// Save the user (profiles are created separately as needed)
		final var createdUser = userRepository.save(user);

		// Publish created event
		eventPublisher.publishEvent(new UserCreatedEvent(createdUser));
		log.info("User created with ID: {}", createdUser.getId());

		return createdUser;
	}

	public Optional<UserEntity> getUserById(long id) {
		return userRepository.findById(id).map(user -> {
			eventPublisher.publishEvent(new UserReadEvent(user));
			return user;
		});
	}

	public Optional<UserEntity> getUserByMicrosoftEntraId(String entraId) {
		// No need to emit an event here because this is used
		// in intermediary steps by other methods that emit events

		// XXX ::: GjB ::: I think we should still consider emitting an event here

		final var example = Example.of(new UserEntityBuilder()
			.microsoftEntraId(entraId)
			.build());

		return userRepository.findOne(example);
	}

	public List<UserEntity> getAllUsers() {
		return List.copyOf(userRepository.findAll());
	}

	public Page<UserEntity> getUsers(Pageable pageable) {
		return userRepository.findAll(pageable);
	}

<<<<<<< Upstream, based on origin/main
	public UserEntity updateUser(long id, UserEntity updates) {
		final var existingUser = userRepository.findById(id).orElseThrow();
		userEntityMapper.update(updates, existingUser);
		final var updatedUser = userRepository.save(existingUser);
=======
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
>>>>>>> 9b719ab allow PUT if user is updating themselves or done by hr-advisor

<<<<<<< Upstream, based on origin/main
		eventPublisher.publishEvent(new UserUpdatedEvent(updatedUser));
		log.info("User updated with ID: {}", updatedUser.getId());
=======
 	// Publish updated event
 	eventPublisher.publishEvent(new UserUpdatedEvent(updatedUser));
 	log.info("User updated with ID: {}", updatedUser.getId());
>>>>>>> 9b719ab allow PUT if user is updating themselves or done by hr-advisor

 	return updatedUser;
 }

 /**
  * Gets a user by ID and updates it.
  * This method does not perform authorization checks.
  * The updateModel must have its ID set to match the userId parameter.
  *
  * @param userId the ID of the user to update
  * @param updateModel the model containing the updated user data (with ID matching userId)
  * @return the updated user entity
  * @throws ResourceNotFoundException if the user does not exist
  */
 public UserEntity updateUserWithoutAuth(Long userId, UserUpdateModel updateModel) {
 	// Check if user exists
 	userRepository.findById(userId)
 		.orElseThrow(() -> new ResourceNotFoundException("User with id=[" + userId + "] not found"));

 	// Verify that the ID in the model matches the userId parameter
 	if (!userId.equals(updateModel.id())) {
 		throw new IllegalArgumentException("ID in update model must match the user ID parameter");
 	}

 	// Update the user directly with the provided model
 	return updateUser(updateModel);
 }

	public void deleteUser(long id) {
		userRepository.findById(id).ifPresent(user -> {
			userRepository.deleteById(id);
			eventPublisher.publishEvent(new UserDeletedEvent(user));
			log.info("User deleted with ID: {}", id);
		});
	}

}
