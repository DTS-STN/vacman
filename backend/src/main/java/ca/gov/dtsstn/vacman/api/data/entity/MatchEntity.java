package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;
import java.util.Optional;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity(name = "Match")
@Table(name = "[MATCH]")
public class MatchEntity extends AbstractBaseEntity implements Ownable {

	public static MatchEntityBuilder builder() {
		return new MatchEntityBuilder();
	}

	@ManyToOne
	@JoinColumn(name = "[PROFILE_ID]", nullable = false)
	private ProfileEntity profile;

	@ManyToOne
	@JoinColumn(name = "[REQUEST_ID]", nullable = false)
	private RequestEntity request;

	@ManyToOne
	@JoinColumn(name = "[MATCH_STATUS_ID]", nullable = false)
	private MatchStatusEntity matchStatus;

	@ManyToOne
	@JoinColumn(name = "[MATCH_FEEDBACK_ID]")
	private MatchFeedbackEntity matchFeedback;

	@Column(name = "[HIRING_MANAGER_COMMENT]", length = 100)
	private String hiringManagerComment;

	@Column(name = "[HR_ADVISOR_COMMENT]", length = 100)
	private String hrAdvisorComment;

	public MatchEntity() {
		super();
	}

	@Builder.Constructor
	public MatchEntity(
			@Nullable Long id,
			@Nullable ProfileEntity profile,
			@Nullable RequestEntity request,
			@Nullable MatchStatusEntity matchStatus,
			@Nullable MatchFeedbackEntity matchFeedback,
			@Nullable String hiringManagerComment,
			@Nullable String hrAdvisorComment,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.profile = profile;
		this.request = request;
		this.matchStatus = matchStatus;
		this.matchFeedback = matchFeedback;
		this.hiringManagerComment = hiringManagerComment;
		this.hrAdvisorComment = hrAdvisorComment;
	}

	public ProfileEntity getProfile() {
		return profile;
	}

	public void setProfile(ProfileEntity profile) {
		this.profile = profile;
	}

	public RequestEntity getRequest() {
		return request;
	}

	public void setRequest(RequestEntity request) {
		this.request = request;
	}

	public MatchStatusEntity getMatchStatus() {
		return matchStatus;
	}

	public void setMatchStatus(MatchStatusEntity matchStatus) {
		this.matchStatus = matchStatus;
	}

	public MatchFeedbackEntity getMatchFeedback() {
		return matchFeedback;
	}

	public void setMatchFeedback(MatchFeedbackEntity matchFeedback) {
		this.matchFeedback = matchFeedback;
	}

	public String getHiringManagerComment() {
		return hiringManagerComment;
	}

	public void setHiringManagerComment(String hiringManagerComment) {
		this.hiringManagerComment = hiringManagerComment;
	}

	public String getHrAdvisorComment() {
		return hrAdvisorComment;
	}

	public void setHrAdvisorComment(String hrAdvisorComment) {
		this.hrAdvisorComment = hrAdvisorComment;
	}

	@Override
	public Optional<Long> getOwnerId() {
		return Optional.ofNullable(request)
			.map(RequestEntity::getHiringManager)
			.map(UserEntity::getId);
	}

	@Override
	public String toString() {
		return new ToStringCreator(this).append("super", super.toString())
			.append("profile.id", Optional.ofNullable(profile).map(AbstractBaseEntity::getId).orElse(null))
			.append("request.id", Optional.ofNullable(request).map(AbstractBaseEntity::getId).orElse(null))
			.append("matchStatus.code", Optional.ofNullable(matchStatus).map(AbstractCodeEntity::getCode).orElse(null))
			.append("matchFeedback.code", Optional.ofNullable(matchFeedback).map(AbstractCodeEntity::getCode).orElse(null))
			.append("hiringManagerComment", hiringManagerComment)
			.append("hrAdvisorComment", hrAdvisorComment)
			.toString();
	}

}
