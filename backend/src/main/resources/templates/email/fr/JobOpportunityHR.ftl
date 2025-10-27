<#assign emailSubject>
Occasion d'emploi - # de demande du SGPV ${request-number}
</#assign>

<#assign emailBody>
Titre du poste : ${position-title}
Durée des fonctions : Durée indéterminée 
Classification : ${classification}
Exigences linguistiques : ${language-requirement}
Lieu : ${location}
Exigences en matière de sécurité ${security-clearance} 


VEUILLEZ NE PAS RÉPONDRE à ce courriel. Il s'agit d'un courriel généré par le système.

Bonjour,

À la suite de la présentation de votre candidature pour l'occasion d'emploi mentionnée ci-dessus, la rétroaction suivante a été fournie par le gestionnaire d'embauche :

Rétroaction fournie : ${feedback}

Si vous désirez obtenir de l'information additionnelle concernant cette rétroaction, veuillez contacter ${submitter-name} par courriel à ${submitter-email}.

Merci
</#assign>

<!-- SUBJECT_START -->${emailSubject}<!-- SUBJECT_END -->
<!-- BODY_START -->${emailBody}<!-- BODY_END -->