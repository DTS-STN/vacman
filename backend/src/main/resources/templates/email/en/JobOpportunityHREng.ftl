<#assign emailSubject>
Job Opportunity - VMS Request # ${request-number}
</#assign>

<#assign emailBody>
Position Title: ${position-title}
Position Tenure: Indeterminate
Classification: ${classification}
Language Requirements: ${language-requirement}
Location: ${location}
Security clearance requirements: ${security-clearance}

PLEASE DO NOT REPLY to this email. This is a system-generated email.

Hello, 

Further to your referral to the above-noted job opportunity, the following feedback was provided by the hiring manager. 

Feedback provided: ${feedback}

If you wish to seek additional information regarding this feedback, please contact ${submitter-name} by email at ${submitter-email}.

Thank you
</#assign>

<!-- SUBJECT_START -->${emailSubject}<!-- SUBJECT_END -->
<!-- BODY_START -->${emailBody}<!-- BODY_END -->