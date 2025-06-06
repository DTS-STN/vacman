package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;

import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity(name = "Document")
@Table(name = "[DOCUMENT]")
@AttributeOverride(name = "id", column = @Column(name = "[DOCUMENT_ID]"))
public class DocumentEntity extends AbstractEntity {

	@Lob
	@Column(name = "[DOCUMENT_TEXT]", nullable = false)
	private Byte[] data;

	@ManyToOne
	@JoinColumn(name = "[DOCUMENT_TYPE_ID]", nullable = false)
	private DocumentTypeEntity documentType;

	public DocumentEntity() {
		super();
	}

	public DocumentEntity(
			@Nullable Long id,
			@Nullable Byte[] data,
			@Nullable DocumentTypeEntity documentType,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.documentType = documentType;
	}

	public Byte[] getData() {
		return data;
	}

	public void setData(Byte[] data) {
		this.data = data;
	}

	public DocumentTypeEntity getDocumentType() {
		return documentType;
	}

	public void setDocumentType(DocumentTypeEntity documentType) {
		this.documentType = documentType;
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("data.length", data.length)
			.append("documentType", documentType)
			.toString();
	}

}
