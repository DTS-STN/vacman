package ca.gov.dtsstn.vacman.api.data.entity;

/**
 * Represents an entity that has a single owner.
 * <p>
 * Implement this interface on any entity or resource that should be subject to
 * ownership-based security checks. Security frameworks (such as a custom
 * {@link org.springframework.security.access.PermissionEvaluator}) can use this
 * interface to determine whether the currently authenticated user has permission
 * to perform certain actions on the resource.
 */
public interface Ownable {

	Long getOwnerId();

}
