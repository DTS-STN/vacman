package ca.gov.dtsstn.vacman.api.constants;

/**
 * Constants used throughout the backend codebase.
 * Organized into nested classes by domain/category.
 */
public final class AppConstants {

    private AppConstants() {}

    public static final class UserType {
        public static final String EMPLOYEE = "employee";

        private UserType() {}
    }

    public static final class CacheNames {
        public static final String CITIES = "cities";
        public static final String CLASSIFICATIONS = "classifications";
        public static final String EMPLOYMENT_EQUITIES = "employment-equities";
        public static final String EMPLOYMENT_OPPORTUNITIES = "employment-opportunities";
        public static final String EMPLOYMENT_TENURES = "employment-tenures";
        public static final String LANGUAGES = "languages";
        public static final String LANGUAGE_REFERRAL_TYPES = "language-referral-types";
        public static final String LANGUAGE_REQUIREMENTS = "language-requirements";
        public static final String NON_ADVERTISED_APPOINTMENTS = "non-advertised-appointments";
        public static final String PRIORITY_LEVELS = "priority-levels";
        public static final String PROFILE_STATUSES = "profile-statuses";
        public static final String PROVINCES = "provinces";
        public static final String REQUEST_STATUSES = "request-statuses";
        public static final String SECURITY_CLEARANCES = "security-clearances";
        public static final String SELECTION_PROCESS_TYPES = "selection-process-types";
        public static final String USER_TYPES = "user-types";
        public static final String WFA_STATUSES = "wfa-statuses";
        public static final String WORK_SCHEDULES = "work-schedules";
        public static final String WORK_UNITS = "work-units";

        private CacheNames() {}
    }

    public static final class ApiPaths {
        public static final String API_BASE = "/api";
        public static final String API_V1 = API_BASE + "/v1";
        public static final String USERS = API_V1 + "/users";
        public static final String CODES = API_V1 + "/codes";

        private ApiPaths() {}
    }

    public static final class UserFields {
        public static final String MS_ENTRA_ID = "microsoftEntraId";

        private UserFields() {}
    }
}
