package ca.gov.dtsstn.vacman.api.web.model;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collector;
import java.util.stream.Collectors;

/**
 * A simple REST model that wraps a collection of items in a consistent structure.
 * <p>
 * This model is useful for REST API responses where a list of resources should be returned under a common property (for
 * example, {@code "content"}). Using this wrapper allows clients to consume a predictable response format and makes it easier
 * to extend the model later (e.g., by adding pagination metadata).
 */
public record CollectionModel<T>(List<T> content) {

	/**
	 * Creates a new {@code CollectionModel} from the given list.
	 * <p>
	 * The provided list is defensively copied using {@link List#copyOf(Collection)}, ensuring the internal list is immutable
	 * and cannot be modified after construction.
	 */
	public CollectionModel(List<T> content) {
		this.content = List.copyOf(content);
	}

	/**
	 * Creates a new {@code CollectionModel} from the given collection.
	 * <p>
	 * The provided collection is defensively copied using {@link List#copyOf(Collection)}, ensuring the internal list is
	 * immutable and cannot be modified after construction.
	 */
	public CollectionModel(Collection<T> content) {
		this(List.copyOf(content));
	}

	/**
	 * Factory method to create a new {@code CollectionModel} from the given collection.
	 * <p>
	 * This is a convenience method equivalent to calling {@code new CollectionModel<>(collection)}.
	 */
	public static <T> CollectionModel<T> of(Collection<T> content) {
		return new CollectionModel<T>(content);
	}

	/**
	 * Factory method to create a new {@code CollectionModel} from the given elements.
	 * <p>
	 * This is a convenience method for quickly creating a {@code CollectionModel} without needing to construct an intermediate
	 * collection.
	 */
	@SuppressWarnings({ "unchecked" })
	public static <T> CollectionModel<T> of(T... items) {
		return new CollectionModel<>(List.of(items));
	}

	/**
	 * Returns a {@link Collector} that accumulates the input elements into a {@link CollectionModel}.
	 * <p>
	 * This collector is a convenient way to wrap the result of a stream pipeline directly into a {@code CollectionModel}.
	 */
	public static <T> Collector<T, ?, CollectionModel<T>> toCollectionModel() {
		return Collectors.collectingAndThen(Collectors.toList(), CollectionModel::new);
	}

}
