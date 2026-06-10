# Dossier de projet — DentiLib
## CDA — Concepteur Développeur d'Applications · RNCP 37873 · Niveau 6

> Structure alignée sur le plan de dossier type CDA RNCP 37873 (sections 1 à 9 + annexes).
> Cible : corps du dossier 40–60 p. (hors page de garde, sommaire, annexes) · annexes 40 p. max.

---

## 📄 Page de garde

- **Nom & Prénom :** Abdoullah BOUGJDI
- **Nom du projet :** DentiLib
- **Entreprise :** MediLink Solutions (cadre de formation — entreprise fictive)
- **Date de soutenance :** 22 juin 2026

## 📄 Sommaire

> Les numéros de page seront générés automatiquement dans la version finale (Word / Google Docs).

- **Liste des compétences (CP) couvertes**
- **Introduction**
- **1. Présentation de l'entreprise et du service**
- **2. Cahier des charges et expression des besoins**
  - 2.1 Objectifs et périmètre du projet
  - 2.2 Acteurs du système
  - 2.3 Besoins fonctionnels
  - 2.4 Besoins non fonctionnels
  - 2.5 Backlog du produit (user stories)
  - 2.6 Contraintes techniques
  - 2.7 Livrables attendus
- **3. Gestion de projet**
  - 3.1 Méthode de travail
  - 3.2 Planning et jalons
  - 3.3 Suivi des tâches
  - 3.4 Gestion du code avec Git
  - 3.5 Objectifs qualité
- **4. Spécifications fonctionnelles**
  - 4.1 Maquettes et enchaînement des écrans
  - 4.2 Diagramme de cas d'utilisation
  - 4.3 Diagrammes de séquence
  - 4.4 Architecture logicielle multicouche et sécurité
- **5. Conception de la base de données**
  - 5.1 Modèle Conceptuel de Données (MCD)
  - 5.2 Modèle Physique de Données (MPD)
  - 5.3 Script SQL de création
  - 5.4 Droits d'accès
  - 5.5 Jeu d'essai (BDD de test)
- **6. Réalisations techniques**
  - 6.1 Environnement et mise en place
  - 6.2 Développement front-end
  - 6.3 Développement back-end
  - 6.4 Accès aux données
- **7. Sécurité de l'application et RGPD**
  - 7.1 Sécurité applicative
  - 7.2 RGPD et accessibilité
- **8. Plan de tests et jeux d'essai**
  - 8.1 Plan de tests
  - 8.2 Jeu d'essai — format 4 colonnes
  - 8.3 Tests de sécurité et tests unitaires
  - 8.4 Analyse des résultats
- **9. Veille technologique et sécurité**
  - 9.1 Sources de veille
  - 9.2 Exemple d'une difficulté ayant demandé une recherche
  - 9.3 Veille sécurité
- **Conclusion générale et perspectives**
- **Annexes**

## 📄 Liste des compétences (CP) couvertes

> ⚠️ Le jury lit cette page en premier. Tableau : CP · intitulé · preuve (section qui le démontre).

| CP | Intitulé | Preuve (section) |
|----|----------|------------------|
| CP4 | Contribuer à la gestion d'un projet informatique | §3 |
| CP5 | Analyser les besoins et maquetter une application | §2, §4.1–4.3 |
| CP6 | Définir l'architecture logicielle d'une application | §4.4 |
| CP7 | Concevoir et mettre en place une base de données relationnelle | §5 |
| CP2 | Développer des interfaces utilisateur | §6.2 |
| CP3 | Développer des composants métier | §6.3 |
| CP8 | Développer des composants d'accès aux données (SQL/NoSQL) | §6.4 |
| CP9 | Préparer et exécuter les plans de tests | §8 |

> [À AFFINER — vérifier les intitulés exacts des CP sur le référentiel officiel.]

---

# Introduction

Ce dossier présente DentiLib, une application web que j'ai réalisée dans le cadre de ma formation de Concepteur Développeur d'Applications (RNCP 37873, niveau 6).

Je viens à l'origine d'une formation économique avec une licence en économie-gestion, puis un master en management de PME, suivis d'un an et demi d'expérience dans l'accompagnement à la création d'entreprise. Je me suis ensuite reconverti vers le développement, que je découvrais. Au fil de la formation, je me suis rendu compte que c'était surtout le test et la qualité logicielle qui m'intéressaient, un domaine qui demande tout de même de comprendre comment une application est conçue et développée. C'est dans cette direction que j'ai choisi de continuer.

DentiLib structure les échanges entre un dentiste et un prothésiste autour d'une fiche de travaux, de sa création à sa facturation. Ce dossier en présente le contexte, l'analyse des besoins, la conception, la réalisation et les tests.

---

# 1. Présentation de l'entreprise et du service


> Ce projet a été réalisé dans un cadre de formation. L'entreprise décrite ci-dessous est **fictive** : elle sert uniquement à inscrire DentiLib dans un contexte professionnel réaliste.

DentiLib a été développé au sein de MediLink Solutions, une entreprise de services numériques (fictive) spécialisée dans les logiciels métier pour le secteur de la santé. Implantée en France [ville/région à adapter], elle compte une vingtaine de collaborateurs.

Son activité consiste à concevoir des applications sur mesure pour des structures de santé de petite et moyenne taille : cabinets, laboratoires et centres de soins. Ces structures disposent rarement d'outils informatiques adaptés à leurs échanges quotidiens et s'appuient encore beaucoup sur le papier, le téléphone ou des tableurs. MediLink Solutions les accompagne dans la digitalisation de ces processus, avec des outils simples et accessibles, pensés pour des utilisateurs qui ne sont pas spécialistes de l'informatique.


Le projet s'inscrit dans l'équipe « développement applicatif », chargée de concevoir et de maintenir les applications web de l'entreprise. J'y suis intervenu comme développeur et j'ai pris en charge DentiLib de bout en bout : analyse du besoin, conception, développement et tests. Ce périmètre large m'a amené à intervenir sur toutes les étapes du projet, de la compréhension du besoin métier jusqu'à la vérification du bon fonctionnement de l'application.


À l'origine de DentiLib, un dentiste et un prothésiste partenaires ont fait remonter une difficulté récurrente dans le suivi de leurs travaux communs. Leurs échanges — demandes de travaux, suivi de l'avancement, facturation — reposaient sur des supports dispersés et peu fiables. Ce besoin concret, représentatif de ce que vivent beaucoup de petites structures, a conduit MediLink Solutions à lancer le développement d'un outil centralisé, destiné aux dentistes, aux prothésistes et à un administrateur chargé de la gestion des comptes.

---

# 2. Cahier des charges et expression des besoins — CP5

Cette partie précise ce que l'application doit faire. Elle part de l'expression de besoin fournie, identifie les acteurs et leurs besoins, puis formalise le périmètre sous forme de backlog.

## 2.1 Objectifs et périmètre du projet

Dans le domaine dentaire, la réalisation d'une prothèse ou d'un appareil fait intervenir deux professionnels complémentaires. Le dentiste examine le patient, prépare le travail et transmet une demande au prothésiste. Le prothésiste réalise la pièce en laboratoire, suit son avancement et facture sa prestation. Cette collaboration repose sur des échanges réguliers et précis, qui portent sur la description des actes à réaliser, les informations relatives au patient, les délais, les prix et le suivi du paiement.

Aujourd'hui, ces échanges s'appuient souvent sur des méthodes peu structurées, comme les fiches papier, les tableurs, les appels téléphoniques ou les messages. Chaque professionnel tient ses informations de son côté, sans outil commun. Cette organisation présente plusieurs limites :

- les données ne sont pas centralisées et l'information est difficile à retrouver
- le suivi de l'avancement des fiches manque de visibilité pour les deux parties
- l'historique des travaux d'un patient est difficile à reconstituer
- la facturation, reconstituée à partir d'informations dispersées, prend du temps et expose à des erreurs
- la communication informelle augmente le risque d'oubli ou de malentendu

DentiLib est la réponse proposée à ces limites. Il s'agit d'une application web, c'est-à-dire d'un logiciel accessible depuis un navigateur sans installation, qui réunit au même endroit les informations des fiches de travaux : les données du patient, les actes réalisés et la facturation associée. Les deux professionnels travaillent ainsi sur une base commune et partagée, ce qui réduit les ressaisies et donne une vision claire de l'avancement.

Le projet poursuit plusieurs objectifs principaux :

- regrouper les données des fiches patients et des travaux dentaires
- faciliter la création, le suivi et la mise à jour des fiches de travaux
- améliorer la traçabilité et l'historique des interventions
- simplifier la gestion administrative et la facturation
- proposer une solution évolutive, capable d'accueillir de nouvelles fonctionnalités par la suite

Au-delà de l'outil lui-même, l'enjeu est de faire gagner du temps aux professionnels et de fiabiliser leurs échanges, afin qu'ils se concentrent sur leur travail plutôt que sur la gestion administrative.

Pour cette première version, le périmètre a été volontairement délimité, de manière à livrer d'abord un parcours complet et fonctionnel. La solution couvre la gestion des comptes par un administrateur, la création et le suivi des fiches de travaux, le catalogue d'actes, le calcul des montants et la génération d'une facture. En revanche, le paiement en ligne, la gestion des rendez-vous et la relation multi-prothésistes restent en dehors de ce périmètre, un dentiste étant ici associé à un seul prothésiste. Ces éléments ont été identifiés comme des évolutions possibles, et la conception a été pensée pour pouvoir les intégrer plus tard.

## 2.2 Acteurs du système

L'application fait intervenir trois acteurs, chacun avec ses responsabilités.

L'**administrateur** gère l'application de façon globale : il configure le système et gère les comptes (création, modification, suppression, consultation) des dentistes et des prothésistes.

Le **dentiste** est l'utilisateur côté cabinet. Il crée et gère les fiches de travaux, choisit les actes à réaliser, suit l'avancement et consulte l'historique des interventions de ses patients.

Le **prothésiste** reçoit les demandes envoyées par les dentistes. Il consulte et met à jour les fiches au fil de leur évolution, gère son catalogue d'actes, met à jour les statuts et participe à la facturation.

| Acteur | Rôle | Responsabilités principales |
|---|---|---|
| Administrateur | Gestion globale | Créer, modifier, supprimer et consulter les comptes dentistes et prothésistes, configurer l'application |
| Dentiste | Côté cabinet | Créer et gérer les fiches de travaux, choisir les actes, suivre l'avancement, consulter l'historique |
| Prothésiste | Côté laboratoire | Recevoir et suivre les fiches, mettre à jour les statuts, gérer son catalogue d'actes, participer à la facturation |

## 2.3 Besoins fonctionnels

Les besoins fonctionnels décrivent les fonctionnalités attendues par profil. Ils correspondent au périmètre cible issu de l'analyse. La section 6 précise ensuite lesquels ont été réalisés dans cette première version.

**Administrateur**
- S'authentifier à l'application.
- Gérer les comptes des dentistes (afficher, ajouter, modifier, supprimer, filtrer).
- Gérer les comptes des prothésistes (afficher, ajouter, modifier, supprimer, filtrer).
- Gérer le catalogue d'actes de référence (afficher, ajouter, modifier, supprimer, filtrer).

**Dentiste**
- S'authentifier à l'application.
- Gérer les fiches de travaux (afficher, ajouter, modifier, supprimer, filtrer).
- Attribuer des actes à une fiche.
- Envoyer une fiche de travaux au prothésiste.
- Consulter l'historique de ses fiches.
- Consulter les notifications.
- Consulter un tableau de bord présentant une vue synthétique de son activité.

**Prothésiste**
- S'authentifier à l'application.
- Gérer les fiches de travaux reçues (afficher la liste, consulter le détail, rechercher et filtrer, mettre à jour la partie prothésiste et le statut).
- Gérer son catalogue d'actes (afficher, ajouter, modifier, supprimer, modifier le prix).
- Générer une facture à partir d'une fiche de travaux.
- Consulter les notifications.
- Consulter un tableau de bord synthétique.

## 2.4 Besoins non fonctionnels

Les besoins non fonctionnels décrivent les contraintes et critères de qualité de l'application.

- **Sécurité** : l'accès est protégé par une authentification. Les droits dépendent du rôle, et chaque utilisateur n'accède qu'aux données qui le concernent. Les informations sensibles, comme les mots de passe, ne sont jamais stockées en clair.
- **Fiabilité et gestion des erreurs** : l'application réagit correctement en cas d'erreur (saisie invalide, accès non autorisé, ressource introuvable) en renvoyant un message clair, sans interrompre son fonctionnement.
- **Performance** : l'affichage et le traitement des requêtes restent rapides, même quand le volume de données augmente.
- **Ergonomie** : l'interface est simple et intuitive, car les utilisateurs ne sont pas forcément à l'aise avec l'informatique.
- **Maintenabilité et évolutivité** : l'architecture permet d'ajouter de nouvelles fonctionnalités sans tout remettre en cause.
- **Disponibilité** : l'application est accessible depuis un navigateur et utilisable sur différents supports.

## 2.5 Backlog du produit (user stories)

Le backlog est la liste priorisée des fonctionnalités attendues, exprimées sous forme de *user stories*. Une user story décrit un besoin du point de vue de l'utilisateur, selon le format : « En tant que `<acteur>`, je veux `<action>` afin de `<objectif>` ».

> **[ICI — tableau du backlog produit (28 user stories, PB-01 à PB-28)]**

Pour organiser le développement, ces user stories ont été regroupées par module fonctionnel :

- **Gestion des comptes (administrateur)** : authentification, CRUD des dentistes et prothésistes, catalogue d'actes de référence (PB-01 à PB-12).
- **Gestion des fiches (dentiste)** : authentification, création et suivi des fiches, attribution à un prothésiste (PB-13 à PB-19).
- **Suivi et facturation (prothésiste)** : authentification, consultation et mise à jour des fiches reçues, gestion du statut, catalogue d'actes, génération de facture (PB-20 à PB-28).

Les stories ont ensuite été priorisées pour décider de l'ordre de réalisation. La priorité « haute » correspond au périmètre essentiel (MVP), c'est-à-dire le minimum pour que le parcours fonctionne de bout en bout.

- **Priorité haute (cœur du projet)** : authentification, création des comptes, création et attribution d'une fiche, consultation et suivi côté prothésiste, catalogue d'actes.
- **Priorité moyenne (compléments)** : modification et suppression des comptes et des fiches, recherche avancée, génération de la facture.
- **Priorité basse (confort)** : les fonctions de filtrage, utiles mais non bloquantes.

## 2.6 Contraintes techniques

L'expression de besoin n'imposait pas de technologies précises. Les contraintes retenues sont les suivantes :

- une application web accessible depuis un navigateur, sans installation
- un développement en JavaScript, côté client comme côté serveur
- un serveur Node.js avec le framework Express
- une base de données relationnelle (les choix techniques sont justifiés à la section 5)
- une utilisation possible sur différents postes (cabinet et laboratoire)

## 2.7 Livrables attendus

- l'application web fonctionnelle (front-end et back-end)
- la base de données et son script de création
- les jeux de tests (API et fonctionnels)
- le présent dossier de projet et le diaporama de soutenance

---

# 3. Gestion de projet — CP4

## 3.1 Méthode de travail

Le projet a été mené seul, dans le cadre de ma formation. J'ai adopté une démarche **itérative et incrémentale**, inspirée de l'agilité. Plutôt que de tout spécifier puis tout développer en une seule fois (approche séquentielle, dite en cascade), j'ai découpé le besoin en fonctionnalités, je les ai priorisées dans un backlog, puis réalisées par petits lots en commençant par le cœur du projet (le MVP).

Pour piloter cet avancement, je me suis appuyé sur un **tableau Kanban**. Le Kanban est une méthode visuelle de gestion du travail : chaque tâche est représentée par une carte, et les colonnes correspondent aux étapes d'un flux (à faire, en cours, terminé). La carte progresse de gauche à droite au fur et à mesure de sa réalisation. J'ai organisé mon tableau en quatre colonnes : *Backlog*, *À faire*, *En cours* et *Terminé*, chaque user story du backlog devenant une carte.

Comme je travaillais seul, je m'imposais de terminer une carte avant d'en commencer une autre, c'est-à-dire une seule tâche « en cours » à la fois. C'est ce qu'on appelle une **limite WIP** (*Work In Progress*, travail en cours) fixée à 1 : elle évite de se disperser et garantit qu'une fonctionnalité est réellement finie et vérifiée avant de passer à la suivante.

Ce choix se justifie pour un projet d'apprentissage : il permet de livrer rapidement un parcours fonctionnel, de l'enrichir progressivement et de corriger au fur et à mesure plutôt que de découvrir les problèmes à la fin. Je n'ai volontairement pas appliqué un cadre Scrum complet (sprints à durée fixe, cérémonies, rôles de Product Owner et de Scrum Master), qui n'a pas de sens pour un développeur seul. J'ai retenu de l'agilité ce qui était utile à mon contexte : un backlog priorisé et un flux Kanban.

## 3.2 Planning et jalons

Le développement a été mené sur une période resserrée d'environ six semaines. Je l'ai organisé en **jalons successifs**, dont l'enchaînement est dicté par les **dépendances techniques** entre les étapes : chaque jalon ne pouvait réellement débuter qu'une fois le précédent suffisamment avancé. Cette logique de séquencement prolonge la démarche itérative décrite plus haut, qui consiste à livrer d'abord un socle stable avant de construire le métier par-dessus.

Le projet a commencé par une phase d'**analyse**, consacrée à la compréhension de l'expression de besoin et à la rédaction du backlog priorisé, qui a ensuite servi de fil conducteur pour tout le développement. A suivi une phase de **conception** : modèle de données, diagrammes UML et maquettes des écrans réalisées avec l'outil Miro, de manière à fixer les choix structurants avant d'écrire le code.

Le **développement** a été mené de façon incrémentale. J'ai d'abord traité le **socle applicatif**, c'est-à-dire l'authentification et la gestion des comptes, en commençant par l'espace administrateur : c'est lui qui crée les comptes des dentistes et des prothésistes, sans quoi les autres parcours ne pouvaient pas être testés. Une fois ce socle en place, j'ai développé le **cœur métier** : la création et le suivi des fiches de travaux, le catalogue d'actes et la facturation.

Le projet s'est achevé par une phase de **tests et de corrections**, avec des tests d'API et des tests fonctionnels menés notamment à l'aide de Postman, Newman et Cypress, afin de vérifier le bon fonctionnement des parcours et de corriger les anomalies détectées.

Le planning prévisionnel et son déroulement réel sont représentés sur le diagramme ci-dessous. Les phases se sont enchaînées les unes après les autres, sans recouvrement, puisque le projet a été mené seul. Plusieurs étapes se sont révélées plus longues que prévu : le **socle**, puis surtout le **cœur métier** (gestion des actes et facturation plus complexe qu'estimé au départ) et enfin les **tests**. Ces écarts, identifiés au fur et à mesure, ont décalé l'ensemble du planning d'environ une semaine, mais ont été absorbés sans remettre en cause le périmètre essentiel : les fonctionnalités prioritaires ont toutes été livrées.

![Diagramme de Gantt — planning du développement de DentiLib (planifié vs réalisé)](gantt-dentilib.png)

*Figure — Diagramme de Gantt : planning du développement de DentiLib (planifié vs réalisé).*

En synthèse, les jalons se sont enchaînés ainsi :

1. Analyse du besoin et rédaction du backlog priorisé
2. Conception : modèle de données, diagrammes UML et maquettes (Miro)
3. Développement du socle : authentification et gestion des comptes (administrateur en premier)
4. Développement du cœur métier : fiches de travaux, catalogue d'actes et facturation
5. Tests et corrections (Postman, Newman, Cypress)

## 3.3 Suivi des tâches

Pour suivre l'avancement au quotidien, j'ai utilisé **MeisterTask**, un gestionnaire de tâches en ligne fonctionnant sur le principe du tableau Kanban. Chaque user story du backlog y est représentée par une carte, à laquelle est associée une **étiquette de priorité** (haute, moyenne ou basse). La carte porte l'énoncé de la user story et progresse d'une colonne à l'autre au fil de sa réalisation.

Le tableau est organisé en quatre colonnes correspondant aux étapes du flux de travail :

- **Backlog** : les fonctionnalités identifiées mais non encore planifiées, ainsi que les évolutions envisagées pour une version ultérieure
- **À faire** : les tâches retenues pour être traitées prochainement
- **En cours** : la tâche en cours de réalisation, une seule à la fois conformément à la limite WIP évoquée plus haut
- **Terminé** : les fonctionnalités développées et vérifiées

Concrètement, je prenais les cartes dans l'ordre de priorité, je les faisais passer en « En cours » pendant leur développement, puis en « Terminé » une fois la fonctionnalité réalisée et testée. À l'issue du projet, les fonctionnalités livrées figurent en « Terminé », les besoins cibles non implémentés dans cette version restent en « À faire », et les évolutions envisagées sont rangées dans le « Backlog ». Cette organisation donne une vision immédiate de l'état d'avancement et distingue clairement ce qui a été livré de ce qui relève des perspectives. La figure ci-dessous présente l'état du tableau à l'issue de cette première version.

> [INSÉRER ICI — capture d'écran du tableau Kanban (MeisterTask) du projet DentiLib.]
>
> *Figure — Tableau Kanban du projet DentiLib à l'issue de la première version livrée (MeisterTask).*

## 3.4 Gestion du code avec Git

Le code est versionné avec **Git**, le dépôt étant hébergé sur GitHub. Chaque évolution fait l'objet d'un commit accompagné d'un message explicite décrivant le changement, ce qui permet de suivre l'historique du projet et de revenir à un état antérieur en cas de problème.

J'ai adopté une **stratégie de branches par fonctionnalité** (*feature branches*). La branche principale `main` est conservée stable : elle ne reçoit que du code fonctionnel. Chaque nouvelle fonctionnalité est développée sur une branche dédiée, créée à partir de `main` : par exemple `DBconfig` pour la configuration de la base, `authModule` pour l'authentification, `manageActes` pour la gestion des actes, ou encore `branchDentist` et `branchProto` pour les parcours dentiste et prothésiste. Une fois la fonctionnalité terminée et vérifiée, la branche est intégrée à `main` au moyen d'une **pull request** (demande de fusion), avant d'être refermée.

Cette organisation présente plusieurs avantages, même pour un développeur seul : elle **isole** chaque fonctionnalité en cours de développement sans perturber le reste de l'application, elle garde la branche principale toujours **fonctionnelle**, et le passage par des pull requests offre un **point de relecture** du code avant son intégration. Le projet a ainsi été construit au fil de huit pull requests successives, dont l'enchaînement reflète directement les jalons de développement (configuration et modèles de données, puis socle d'authentification et espace administrateur, puis cœur métier et enfin corrections).

![Historique Git de DentiLib — branches de fonctionnalité fusionnées dans main par pull requests](git-history-dentilib.png)

*Figure — Historique Git du projet : branches de fonctionnalité fusionnées dans `main` par pull requests.*

## 3.5 Objectifs qualité

Plusieurs règles ont été suivies pour garder un code lisible et maintenable :

- une organisation modulaire du code (séparation routes / contrôleurs / modèles / middlewares)
- des conventions de nommage cohérentes et des noms explicites
- la validation des données reçues et la gestion des erreurs côté serveur
- des tests automatisés (Jest et Supertest pour les API, Cypress pour le parcours fonctionnel)

---

# 4. Spécifications fonctionnelles — CP5 / CP6

## 4.1 Maquettes et enchaînement des écrans — CP5

[À ADAPTER — maquettes (authentification, admin, dentiste, prothésiste) + schéma des transitions entre écrans.]

## 4.2 Diagramme de cas d'utilisation — CP5

[À ADAPTER — sous-parties Admin / Dentiste / Prothésiste (déjà rédigées dans dossier.md).]

## 4.3 Diagrammes de séquence — CP5

[À ADAPTER — 2-3 cas significatifs minimum (déjà rédigés dans dossier.md).]

## 4.4 Architecture logicielle multicouche et sécurité — CP6

- **Schéma d'architecture multicouche** : couche présentation / couche métier / couche données
- Rôle de chaque couche
- Technologies par couche (Express, Mongoose…)
- Stratégie de sécurité (JWT, CORS, hachage…)

[À RÉDIGER — produire le schéma multicouche ; reprendre la description d'architecture existante.]

---

# 5. Conception de la base de données — CP7

La base de données de DentiLib est présentée à travers son modèle conceptuel (MCD), puis son modèle physique (MPD), avant le script de création et un jeu d'essai.

## 5.1 Modèle Conceptuel de Données (MCD)

> **[INSÉRER ICI — Schéma du MCD (à modéliser) : entités, attributs, associations et cardinalités.]**

## 5.2 Modèle Physique de Données (MPD)

> **[INSÉRER ICI — Schéma du MPD (à modéliser) : tables, clés primaires et clés étrangères.]**

## 5.3 Script SQL de création

> **[À INSÉRER — script SQL de création (CREATE TABLE + contraintes). Le script complet figure en annexe A7.]**

## 5.4 Droits d'accès

> **[À RÉDIGER — comptes de la base de données et permissions associées.]**

## 5.5 Jeu d'essai (BDD de test)

> **[À INSÉRER — jeu d'essai : données de test cohérentes.]**

---

# 6. Réalisations techniques — CP2 / CP3 / CP8

## 6.1 Environnement et mise en place

[À RÉDIGER — environnement logiciel, installation, dépôt Git.]

## 6.2 Développement front-end — CP2

- 2+ captures d'écran annotées
- Extraits de code HTML/CSS/JS correspondants
- Responsive design
- Validation des entrées côté client
- Accessibilité (RGAA) mentionnée

[À ADAPTER depuis les modules du chapitre 3 de dossier.md + ajouter captures et extraits.]

## 6.3 Développement back-end — CP3

- Extraits de code back-end (contrôleurs, méthodes)
- Style défensif démontré
- Gestion des exceptions

[À ADAPTER — auth, fiches, actes, facturation.]

## 6.4 Accès aux données — CP8

- CRUD sécurisé (SQL paramétré)
- Prévention des injections
- Accès NoSQL (modèles Mongoose, requêtes MongoDB)

[À ADAPTER.]

---

# 7. Sécurité de l'application et RGPD

## 7.1 Sécurité applicative

- **OWASP Top 10** : failles traitées
- Recommandations **ANSSI** appliquées
- Authentification : JWT, hachage bcrypt
- Vulnérabilités identifiées + corrections apportées

[À RÉDIGER.]

## 7.2 RGPD et accessibilité

- Données personnelles traitées identifiées
- Base légale du traitement
- Durée de conservation
- Droits des personnes (accès, rectification, suppression)
- Mentions légales / politique de confidentialité
- Conformité RGAA

[À RÉDIGER.]

---

# 8. Plan de tests et jeux d'essai — CP9

## 8.1 Plan de tests

- Liste des fonctionnalités testées × type (unitaire / intégration / sécurité)
- Environnement de test (outils, configuration)

[À RÉDIGER.]

## 8.2 Jeu d'essai — format 4 colonnes

> Sur la fonctionnalité la plus représentative.

| Données en ENTRÉE | Données ATTENDUES | Données OBTENUES | Analyse des ÉCARTS |
|-------------------|-------------------|------------------|--------------------|
| [exemple] | | | |

[À RÉDIGER.]

## 8.3 Tests de sécurité et tests unitaires

- Tests de sécurité (injection, OWASP…)
- Tests unitaires par composant (Jest)
- Tests d'intégration (Supertest), E2E (Cypress), Newman

[À ADAPTER depuis l'existant.]

## 8.4 Analyse des résultats

[À COMPLÉTER — nombre de tests, taux de réussite, anomalies détectées puis corrigées.]

---

# 9. Veille technologique et sécurité

## 9.1 Sources de veille

[À RÉDIGER — ANSSI, OWASP, CVE, blogs tech… avec sources citées.]

## 9.2 Exemple d'une difficulté ayant demandé une recherche

[À RÉDIGER.]

## 9.3 Veille sécurité

[À RÉDIGER — vulnérabilités sur les technologies utilisées, évolutions suivies.]

---

# Conclusion générale et perspectives

[À RÉDIGER — bilan + perspectives, dont bascule SQL et déploiement.]

---

# Annexes (40 p. max)

- **A1** — Maquettes complètes de la fonctionnalité représentative ✅
- **A2** — Captures d'écran + code complet des interfaces (fonctionnalité principale) ✅
- **A3** — Code complet des composants métier significatifs ✅
- **A4** — Code complet des composants d'accès aux données ✅
- **A5** — Code contrôleurs, utilitaires, middlewares significatifs ⬜
- **A6** — Intégralité des jeux de tests (unitaires + intégration + sécurité) ✅
- **A7** — Script SQL complet de création de la BDD ✅
- **A8** — Extraits de logs ou rapports de tests ⬜

---

## ✅ Checklist finale (avant envoi jury)

- [ ] Corps du dossier : 40–60 pages
- [ ] Annexes : 40 pages max
- [ ] Page 1 : liste des CP couvertes avec preuves
- [ ] Section sécurité OWASP/ANSSI présente
- [ ] Section RGPD : mentions légales, droits des personnes
- [ ] Plan de tests + jeux d'essai (4 colonnes) complets
- [ ] Veille sécurité avec sources citées
- [ ] Captures UI + code correspondant (min. 2 interfaces)
- [ ] MCD + MPD + script SQL
- [ ] Schéma d'architecture multicouche
- [ ] Diagramme cas d'usage + diagrammes de séquence
- [ ] Annexes : code complet des composants significatifs
- [ ] Diaporama 13 slides chronométré à 40 min
- [ ] Dossier imprimé + relié (envoi jury avant 17/06)
