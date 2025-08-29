package ca.gov.dtsstn.vacman.api.constants;

/**
 * Constants used throughout the backend codebase.
 * Organized into nested classes by domain/category.
 */
public final class AppConstants {

	private AppConstants() {}

	public static final class Role {
		public static final String ADMIN = "admin";
		public static final String HR_ADVISOR = "hr-advisor";
		public static final String HIRING_MANAGER = "hiring-manager";
		public static final String EMPLOYEE = "employee";

		private Role() {}
	}

	public static final class UserType {
		public static final String ADMIN = "admin";
		public static final String HR_ADVISOR = "HRA";
		public static final String HIRING_MANAGER = "hiring-manager";
		public static final String EMPLOYEE = "employee";

		/**
		 * Maps JWT role authorities to user type codes.
		 *
		 * @param role the role authority from JWT claims
		 * @return the corresponding user type code, defaults to EMPLOYEE for unknown roles
		 */
		public static String fromRole(String role) {
			return switch (role) {
				case Role.ADMIN -> ADMIN;
				case Role.HR_ADVISOR -> HR_ADVISOR;
				case Role.HIRING_MANAGER -> HIRING_MANAGER;
				case Role.EMPLOYEE -> EMPLOYEE;
				default -> EMPLOYEE; // Default to employee for unknown roles
			};
		}

		/**
		 * Checks if the given role is a known/valid role.
		 *
		 * @param role the role to check
		 * @return true if the role is recognized, false otherwise
		 */
		public static boolean isKnownRole(String role) {
			return switch (role) {
				case Role.ADMIN, Role.HR_ADVISOR, Role.HIRING_MANAGER, Role.EMPLOYEE -> true;
				default -> false;
			};
		}

		private UserType() {}
	}

	public static final class ApiPaths {
		public static final String API_BASE = "/api";
		public static final String API_V1 = API_BASE + "/v1";
		public static final String CODES = API_V1 + "/codes";
		public static final String REQUESTS = API_V1 + "/requests";
		public static final String USERS = API_V1 + "/users";

		private ApiPaths() {}
	}

	public static final class UserFields {
		public static final String MS_ENTRA_ID = "microsoftEntraId";

		private UserFields() {}
	}

}
