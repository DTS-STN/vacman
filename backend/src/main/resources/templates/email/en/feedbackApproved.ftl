<#assign emailSubject>
Feedback approved – VMS Request # ${request-number}
</#assign>

<#assign emailBody>
PLEASE DO NOT REPLY to this email. This is a system-generated email.

Hello, 

Thank you for submitting the referral feedback for all referred ESDC priorities. 

Your feedback has been approved, and the following clearance number has been issued: 

Departmental Clearance Number: ${clearance-number}

As a PSC priority clearance is not required in this situation, you may now proceed with your proposed staffing action.

If you have any questions, please contact the HR Advisor assigned to your request.

Thank you.
</#assign>

<!-- SUBJECT_START -->${emailSubject}<!-- SUBJECT_END -->
<!-- BODY_START -->${emailBody}<!-- BODY_END -->