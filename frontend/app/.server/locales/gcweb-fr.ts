import type gcwebEn from '~/.server/locales/gcweb-en';

export default {
  'language': 'Français',
  'app': {
    form: 'Forme',
    logout: 'Déconnexion',
    profile: 'Profil',
    title: 'VacMan',
  },
  'nav': {
    'skip-to-content': 'Passer au contenu principal',
    'skip-to-about': 'Passer à «\u00a0À propos de ce site\u00a0»',
  },
  'header': {
    'language-selection': 'Sélection de la langue',
    'govt-of-canada.text': 'Gouvernement du Canada',
  },
  'footer': {
    'about-site': 'À propos de ce site',
    'terms-conditions': {
      text: 'Avis',
      href: 'https://www.canada.ca/fr/transparence/avis.html',
    },
    'gc-symbol': 'Symbole du gouvernement du Canada',
  },
  'language-switcher': {
    'alt-lang': 'English',
  },
  'page-details': {
    'page-details': 'Détails de la page',
    'date-modfied': 'Date de modification\u00a0:',
    'screen-id': "Identificateur d'écran\u00a0:",
    'version': 'Version\u00a0:',
  },
  'date-picker': {
    day: {
      label: 'Jour (JJ)',
    },
    month: {
      label: 'Mois',
      placeholder: 'Sélectionnez le mois',
    },
    year: {
      label: 'Année (AAAA)',
    },
  },
  'dialog': {
    close: 'Fermer',
  },
  'not-found': {
    'page-title': 'Nous ne pouvons trouver cette page',
    'page-subtitle': '(Erreur 404)',
    'page-message':
      "Nous sommes désolés que vous ayez abouti ici. Il arrive parfois qu'une page ait été déplacée ou supprimée. Heureusement, nous pouvons vous aider à trouver ce que vous cherchez.",
  },
  'session-timeout': {
    'continue-session': 'Continuer la session',
    'description':
      'Votre session expirera automatiquement dans {{timeRemaining}}. Sélectionnez «\u00a0Continuer la session\u00a0» pour prolonger votre session.',
    'end-session': 'Mettre fin à la session',
    'header': "Avertissement d'expiration de la session",
  },
  'server-error': {
    'page-title': 'Nous éprouvons des difficultés avec cette page',
    'page-subtitle': '(Erreur {{statusCode}})',
    'page-message':
      "Nous espérons résoudre le problème sous peu. Il ne s'agit pas d'un problème avec votre ordinateur ou Internet, mais plutôt avec le serveur de notre site Web.",
    'correlation-id': '<strong>ID de corrélation\u00a0:</strong> <span>{{correlationId}}</span>',
    'error-code': "<strong>Code d'erreur\u00a0:</strong> <span>{{errorCode}}</span>",
  },
  'screen-reader': {
    'new-tab': "s'ouvre dans un nouvel onglet",
  },
  'input': {
    'required': 'obligatoire',
    'input-items-selected': '{{count}} éléments sélectionnés',
  },
  'input-file': {
    'choose-file': 'Choisir un fichier',
    'no-file': 'Aucun fichier choisi',
  },
  'input-option': {
    yes: 'Oui',
    no: 'Non',
  },
  'error-summary': {
    header_one: "L'erreur suivante a été trouvée dans le formulaire\u00a0:",
    header_other: 'Les {{count}} erreurs suivantes ont été trouvées dans le formulaire\u00a0:',
  },
  'data-table': {
    'zero-records': 'Aucune entrée correspondante trouvée',
    'pagination': {
      'info_zero': 'Affichage de 0 à 0 sur 0 entrées',
      'info_one': 'Affichage de {{start}} à {{end}} sur {{count}} entré',
      'info_other': 'Affichage de {{start}} à {{end}} sur {{count}} entrées',
      'page-size': 'Entrées par page',
      'page-info': 'Page {{index}} de {{count}}',
      'first-page': 'Aller à la première page',
      'previous-page': 'Aller à la page précédente',
      'next-page': 'Aller à la page suivante',
      'last-page': 'Aller à la dernière page',
    },
  },
  'search-bar': {
    search: 'Rechercher',
  },
  'choice-tag': {
    'clear-all': 'Tout effacer',
    'clear-group': 'Effacer le groupe',
    'clear-group-label': "Effacer le groupe {{groupName}} d'éléments {{items}}",
    'choice-tag-added-aria-label': '{{item}} sélectionné ajouté!: {{choice}}, Activez pour supprimer l{{item}} sélectionné.',
    'clear-all-sr-message': 'tous les {{item}} sélectionnés ont été supprimés.',
    'removed-choice-tag-sr-message': '{{item}} sélectionné retiré: {{choice}}',
  },
  'acronym': {
    esdc: {
      abbreviation: 'EDSC',
      text: 'Emploi et Développement social Canada',
    },
    hr: {
      abbreviation: 'RH',
      text: 'Ressources humaines',
    },
    hrsb: {
      abbreviation: 'DGSRH',
      text: 'Direction générale des services de ressources humaines',
    },
    pib: {
      abbreviation: 'FRP',
      text: 'Fichier de renseignements personnels',
    },
    tbs: {
      abbreviation: 'SCT',
      text: 'Secrétariat du Conseil du Trésor du Canada',
    },
    vms: {
      abbreviation: 'SGPV',
      text: 'Système de gestion des postes vacants',
    },
  },
} satisfies typeof gcwebEn;
