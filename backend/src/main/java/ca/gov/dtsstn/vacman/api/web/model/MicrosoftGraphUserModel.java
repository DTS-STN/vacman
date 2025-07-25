package ca.gov.dtsstn.vacman.api.web.model;

/**
 * Model representing user information from Microsoft Graph API.
 *
 * This model maps the response from the Microsoft Graph /me endpoint
 * and includes the same fields that are requested by the frontend.
 */
public record MicrosoftGraphUserModel(
    /**
     * The unique identifier for the user.
     */
    String id,

    /**
     * The on-premises SAM account name (Windows username).
     */
    String onPremisesSamAccountName,

    /**
     * The user's given name (first name).
     */
    String givenName,

    /**
     * The user's surname (last name).
     */
    String surname,

    /**
     * The user's business phone numbers.
     */
    String[] businessPhones,

    /**
     * The user's primary email address.
     */
    String mail,

    /**
     * The user's preferred language.
     */
    String preferredLanguage,

    /**
     * The user's city.
     */
    String city,

    /**
     * The user's state or province.
     */
    String state,

    /**
     * The user's job title.
     */
    String jobTitle,

    /**
     * The user's department.
     */
    String department,

    /**
     * The user's office location.
     */
    String officeLocation,

    /**
     * The user's mobile phone number.
     */
    String mobilePhone
) {}
