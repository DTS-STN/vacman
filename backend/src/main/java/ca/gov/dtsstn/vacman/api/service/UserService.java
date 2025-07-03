package ca.gov.dtsstn.vacman.api.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import ca.gov.dtsstn.vacman.api.data.entity.UserEntity;
import ca.gov.dtsstn.vacman.api.data.repository.NotificationPurposeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.PriorityLevelRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileRepository;
import ca.gov.dtsstn.vacman.api.data.repository.ProfileStatusRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserRepository;
import ca.gov.dtsstn.vacman.api.data.repository.UserTypeRepository;
import ca.gov.dtsstn.vacman.api.data.repository.WorkUnitRepository;
import ca.gov.dtsstn.vacman.api.web.model.UserCreateModel;
import ca.gov.dtsstn.vacman.api.web.model.mapper.ProfileModelMapper;
import ca.gov.dtsstn.vacman.api.web.model.mapper.UserModelMapper;

@Service
public class UserService {

	private final UserRepository userRepository;
	private final ProfileRepository profileRepository;
	private final NotificationPurposeRepository notificationPurposeRepository;
	private final ProfileStatusRepository profileStatusRepository;
	private final ProfileModelMapper profileModelMapper;
	private final PriorityLevelRepository priorityLevelRepository;
	private final UserTypeRepository userTypeRepository;
	private final WorkUnitRepository workUnitRepository;
	private final UserModelMapper userModelMapper;

	public UserService(UserRepository userRepository,
					   ProfileRepository profileRepository,
					   NotificationPurposeRepository notificationPurposeRepository,
					   ProfileStatusRepository profileStatusRepository,
					   ProfileModelMapper profileModelMapper,
					   PriorityLevelRepository priorityLevelRepository,
					   UserTypeRepository userTypeRepository,
					   WorkUnitRepository workUnitRepository,
					   UserModelMapper userModelMapper) {
		this.userRepository = userRepository;
		this.profileRepository = profileRepository;
		this.notificationPurposeRepository = notificationPurposeRepository;
		this.profileStatusRepository = profileStatusRepository;
		this.profileModelMapper = profileModelMapper;
		this.priorityLevelRepository = priorityLevelRepository;
		this.userTypeRepository = userTypeRepository;
		this.workUnitRepository = workUnitRepository;
		this.userModelMapper = userModelMapper;
	}


	public UserEntity createUser(UserCreateModel createModel) {
		// Create and setup profile
		ProfileEntity profile = profileModelMapper.toEntity(createModel);

		// Set required relationships
		profile.setProfileStatus(profileStatusRepository.findByCode("PENDING")
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
						"Default profile status not found")));
		profile.setNotificationPurpose(notificationPurposeRepository.findByCode("GENERAL")
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
						"Default notification purpose not found")));

		// Save profile
		ProfileEntity savedProfile = profileRepository.save(profile);

		// Create user entity from model
		UserEntity user = userModelMapper.toEntity(createModel);

		// Set required relationships for user
		user.setProfile(savedProfile);
		user.setPriorityLevel(priorityLevelRepository.findByCode("NORMAL")
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
						"Default priority level not found")));

		// Set user type based on role
		user.setUserType(userTypeRepository.findByCode(createModel.role())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
						"User type not found for role: " + createModel.role())));

		// Set default work unit
		user.setWorkUnit(workUnitRepository.findByCode("LABOUR")
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
						"Default work unit not found")));

		// Save and return user
		return userRepository.save(user);
	}


	public Optional<UserEntity> getUserById(Long id) {
		return userRepository.findById(id);
	}

	public List<UserEntity> getAllUsers() {
		return List.copyOf(userRepository.findAll());
	}

	public Page<UserEntity> getUsers(Pageable pageable) {
		return userRepository.findAll(pageable);
	}

}
