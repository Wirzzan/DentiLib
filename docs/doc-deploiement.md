# Documentation du déploiement — jury CDA

## 1. Tests

La stratégie, les cas de test, les prérequis, les commandes et les limites sont
formalisés dans le [plan de tests DentiLib](plan-tests.md).

### Évaluation de la couverture et des anomalies

**Fonctionnalités couvertes**

| Fonctionnalité | Vérifications réalisées |
| --- | --- |
| Authentification | Connexion valide, mauvais mot de passe, champs vides, e-mail invalide ou inexistant, accès sans JWT ou avec JWT invalide |
| Comptes utilisateurs | Création, association dentiste/prothésiste, modification, suppression, annulation de suppression et persistance d’une modification après rechargement |
| Droits et confidentialité | Refus de la liste des utilisateurs aux dentistes et prothésistes ; refus d’accès à la fiche d’un autre utilisateur ; absence de modification après une tentative interdite |
| Fiches de travaux | Création, champs obligatoires, envoi, réception et passage à EN_COURS ; envoi bloqué sans prothésiste associé |
| Catalogue des actes | Parcours de création, modification et suppression ; refus d’un doublon avec un message français |
| E-mails | Réception vérifiée manuellement dans Mailpit, sans distribution réelle des messages de test |

**Limites**

La couverture est évaluée par fonctionnalités et scénarios ; aucun pourcentage
de couverture du code n’a été mesuré. Les résultats locaux ont été validés en
plusieurs exécutions : le rapport final complet reste à conserver.
Les tests ne couvrent pas toutes les transitions de statut, la persistance du tarif
prothésiste, le PDF, les JWT expirés, la charge ou tous les navigateurs.
La réception dans Mailpit ne prouve pas la délivrabilité par le SMTP de production.
L’absence du mot de passe dans les nouveaux e-mails reste à vérifier spécifiquement.
La CI, le déploiement et la restauration ne sont pas validés par ces tests locaux.

**Échecs réellement rencontrés et corrections**

| Anomalie observée | Analyse et correction | État |
| --- | --- | --- |
| Créations de comptes en HTTP 201, mais assertion sur `#addUserMessage` vide | Le test attendait un ancien affichage. L’application utilise une notification et ferme automatiquement le formulaire. Les tests vérifient désormais la ligne du compte | Retest confirmé réussi par l’utilisateur |
| Échec sur `AliceMod` introuvable lors de la suppression | Conséquence de l’arrêt du test précédent avant la modification du prénom | Parcours confirmé réussi après correction des assertions |
| Notification de succès signalée comme recouverte lors de la création du dentiste B | Échec du contrôle de visibilité du toast ; cause graphique exacte non démontrée. Remplacement par une vérification du résultat métier dans le tableau, sans prétendre avoir corrigé un défaut CSS | Retest confirmé réussi par l’utilisateur |
| Doublon d’acte : test attendant « Erreur création acte », interface affichant « Acte already exists » | Refus HTTP 409 correct, mais message affiché et assertion incohérents. Message français choisi côté interface et assertion alignée ; API inchangée | Retest confirmé réussi par l’utilisateur |

Aucun nouvel échec n’a été signalé dans les derniers résultats transmis. Cela
ne signifie pas qu’aucune anomalie n’existe : l’inscription administrateur publique
et les routes d’écriture des actes non protégées restent des points de sécurité
identifiés à corriger et à tester. L’avertissement Newman `fs.F_OK` est une
dépréciation technique, pas un échec d’assertion.

### Ce qui fonctionne

- L’application démarre sur le Mac avec MySQL.
- Les cinq tables et les données de démonstration ont été importées.
- La connexion administrateur a été vérifiée manuellement.

### Séparation des données

- Séparer les données de démonstration (`dentilib`) des données de test (`dentilib_test`).
- Les cinq tables de la base de test ont été créées manuellement dans DBeaver.
- L’application et Cypress utilisent la base de test lors du lancement des tests.
- Tous les tests Cypress sont passés au vert, selon les résultats confirmés par l’utilisateur après la mise en place de Mailpit et les correctifs.

### Résultats Cypress

La suite contient désormais **23 tests dans 5 fichiers** :

| Fichier | Nombre de tests |
| --- | ---: |
| Réinitialisation de la base | 1 |
| Parcours administrateur et actes | 9 |
| Parcours dentiste | 5 |
| Parcours prothésiste | 4 |
| Messages d’erreur | 4 |
| **Total** | **23** |

La campagne initiale de **20 tests** a été confirmée réussie par l’utilisateur.
Les **3 compléments** ont ensuite été confirmés réussis : modification conservée
après rechargement, annulation de suppression et envoi bloqué sans prothésiste.
L’inventaire actuel comprend un test de préparation et 22 tests de parcours ou de validation.
Le bilan unique de la campagne complète à 23 tests reste à conserver.

Cette validation intervient après l’ajout de Mailpit, le remplacement des
assertions sur les notifications par des vérifications des comptes dans le tableau,
et l’alignement du message français de doublon d’acte avec son assertion Cypress.
Une capture ou un rapport de cette exécution reste à conserver pour le jury.

### Résultats API — Jest et Supertest

Les tests appellent directement l’API sur `http://localhost:3001`, connectée
à `dentilib_test`, avec Mailpit actif.

```bash
TEST_URL=http://localhost:3001 npm test -- --runInBand
```

Résultat du terminal transmis par l’utilisateur : **2 suites réussies sur 2,
18 tests réussis sur 18**, en **1,348 seconde**, avant les compléments de sécurité.

- `test/userAuth.test.js` : inscription, connexion et suppression de compte administrateur, avec des cas d’erreur.
- `test/userAdmin.test.js` : création des comptes et validation des rôles et associations.
- Deux contrôles JWT ajoutés à `test/userAdmin.test.js` : absence de JWT et JWT invalide,
  validés par une exécution filtrée (2 réussis, 6 ignorés).
- `test/securityAccess.test.js` : 7 nouveaux tests sur les rôles, la confidentialité
  des fiches, les doublons d’e-mail et les champs obligatoires ; réussite confirmée par l’utilisateur.

L’inventaire actuel est donc de **27 tests dans 3 fichiers**, validés en plusieurs
exécutions. Le bilan unique d’une campagne complète à 27 tests reste à conserver.

### Résultats API — collection Postman avec Newman

Newman exécute la collection Postman depuis le terminal, sur le même serveur de test :

```bash
npx --no-install newman run DentiLib.postman_collection.json \
  -e dentilibEnv.postman_environment.json \
  --env-var "BASE-URL=http://localhost:3001"
```

Résultat du terminal transmis par l’utilisateur :

- **1 itération, 17 requêtes et 31 assertions : aucun échec.**
- 17 scripts de test et 1 script de préparation exécutés sans échec.
- Durée totale : **712 ms** ; temps de réponse moyen : **29 ms** (minimum 2 ms, maximum 93 ms).
- Parcours couvert : comptes administrateur, dentiste et prothésiste ; catalogue des actes ; création, envoi et suivi d’une fiche ; suppression du compte administrateur.

L’avertissement de dépréciation `fs.F_OK` n’a pas empêché l’exécution.
Les temps mesurés sont ceux de cette exécution locale, pas un test de charge.

### Bilan des exécutions locales

| Ensemble | Résultat |
| --- | --- |
| Cypress | 20 tests initiaux + 3 compléments confirmés réussis ; inventaire de 23 tests |
| Jest / Supertest | 18 tests initiaux + 2 contrôles JWT + 7 compléments validés ; inventaire de 27 tests |
| Postman via Newman | 31 assertions réussies sur 31, pour 17 requêtes |

Ces chiffres décrivent des mesures différentes et ne sont pas additionnés.
Les sorties Jest et Newman ont été transmises dans la conversation ; les captures
ou rapports restent à conserver dans les pièces de présentation.
Ces résultats valident les scénarios exécutés, sans attester une couverture complète
ni la correction des failles de sécurité encore identifiées.

### Séparation des lancements

Les commandes `start:test` et `cypress:open` ont été ajoutées dans `package.json`
pour utiliser `dentilib_test`, sans changer le `.env` de l’application principale.
Le serveur de test utilise le port 3001, contre 3000 pour l’application habituelle.
Un contrôle refuse la suppression des données si Cypress ne cible pas
`dentilib_test` en environnement de test sur un serveur MySQL local.

### Vérification des comptes

Les tests vérifient les lignes du tableau : présence du compte créé, nom modifié
et absence du compte supprimé. Ils ne dépendent plus des notifications temporaires.
La base de test doit être réinitialisée avant le parcours pour vérifier les créations.

### Mailpit — réception vérifiée

Mailpit capture les e-mails des tests sans les envoyer aux véritables destinataires.
Ils sont consultables à l’adresse `http://127.0.0.1:8025/`.
Seul le lancement de test utilise Mailpit ; le SMTP habituel reste inchangé.
L’utilisateur a confirmé la réception des e-mails de test dans Mailpit.

### Ordre de lancement des tests

`npm run db:test:reset` permet de vider uniquement la base de test `dentilib_test`.
`npm run test:newman` lance Newman et génère ses rapports ; `npm run test:api` lance Jest/Supertest. Ces deux commandes réinitialisent automatiquement la base avant les tests, avec Mailpit et le serveur de test déjà actifs.
La réinitialisation est centralisée dans la fonction `resetTestDatabase()`, dans le nouveau fichier `test/resetDatabase.js`.
Cypress l’appelle via `00-reset-db.cy.js` ; les commandes Newman et Jest/Supertest l’exécutent avant leur campagne.
Les trois ensembles réutilisent ainsi la même fonction protégée pour vider les données de `dentilib_test`, sans supprimer les tables ni toucher à `dentilib`.

MySQL doit être démarré. Garder les trois terminaux suivants ouverts :

1. Démarrer Mailpit :
   ```bash
   "$HOME/Documents/Projects_dev/Outils/mailpit/mailpit" --listen 127.0.0.1:8025 --smtp 127.0.0.1:1025
   ```
2. Dans le dossier DentiLib : `npm run start:test`.
3. Dans un autre terminal, dans le même dossier : `npm run cypress:open`.

Dans Cypress, lancer `00-reset-db.cy.js`, puis les scénarios métier.
Inutile de redémarrer un service déjà actif.

### Comment l’expliquer au jury

« Mes tests peuvent supprimer et recréer des données. J’ai donc créé une base séparée pour les exécuter sans effacer les données de démonstration. »

« En environnement de test, l’application utilise un serveur SMTP local de capture afin d’éviter l’envoi d’e-mails réels. »

### Points d’amélioration

**Création des comptes et remise du mot de passe**

- Réalisé : le mot de passe a été retiré des deux e-mails de création de compte.
  L’e-mail conserve l’identifiant et propose un lien pour contacter l’administrateur.
- Fonctionnement actuel : l’administrateur définit le mot de passe initial et doit
  le communiquer par un canal distinct de l’e-mail. Le lien de contact n’active pas le compte.
- Amélioration prévue : envoyer un lien sécurisé, temporaire et à usage unique,
  permettant à l’utilisateur de choisir son mot de passe et d’activer son compte.
- Vérification à compléter : contrôler les nouveaux messages dans Mailpit et ajouter
  un test confirmant qu’ils ne contiennent pas le mot de passe. Pour l’activation future,
  tester aussi les liens expirés, invalides et déjà utilisés.

Pour le jury : « L’envoi du mot de passe par e-mail a été supprimé. La remise des
accès reste manuelle ; l’activation autonome par lien sécurisé est un point d’amélioration prévu. »

### Suite prévue

1. Conserver les captures ou rapports des trois ensembles de tests.
2. Rejouer les campagnes complètes après les derniers changements et tester les futurs correctifs de sécurité.

Ne présenter comme réussis que les tests réellement exécutés et vérifiés.

## 2. Déploiement

### Architecture retenue

- Render héberge le serveur Node.js/Express et les pages de DentiLib.
- Aiven héberge MySQL, la base relationnelle utilisée par Sequelize.
- Le développement reste sur `dentilib` en local et les tests sur `dentilib_test`.
- La base distante est nommée **`dentilib_prod`** pour distinguer clairement son usage.

Trajet prévu : navigateur → HTTPS → DentiLib sur Render → TLS → MySQL sur Aiven.
Cette architecture cible n’est pas encore entièrement raccordée ni vérifiée en ligne.

### Render — état constaté

Le service existant est accessible à l’adresse
[dentilib-d50z.onrender.com](https://dentilib-d50z.onrender.com).
L’utilisateur a confirmé dans Render le statut **Live**, le dépôt GitHub DentiLib
et la branche de déploiement **`main`**.

Au premier contrôle, la seule variable d’environnement signalée était `DB_URL`, qui référence
l’ancienne base MongoDB utilisée au début du projet. Le code actuel repose sur
MySQL et lit les variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` et `DB_PASSWORD`.
Le statut Live ne prouve donc pas le fonctionnement de la version MySQL actuelle.

Une branche **`prep-deploiement`** a été créée pour préparer les changements avant
leur intégration à la branche déployée. Le port du serveur lit déjà `process.env.PORT`.
Les paramètres MySQL, JWT et SMTP ont ensuite été renseignés dans Render par l’utilisateur,
comme détaillé ci-dessous. Leur utilisation par une nouvelle version déployée reste à vérifier.

### Aiven — création et préparation de MySQL

1. Création d’un service MySQL avec l’offre gratuite Aiven.
2. Attente de sa construction, puis utilisation des paramètres de connexion fournis
   par Aiven : hôte, port, utilisateur et mot de passe.
3. Création d’une connexion MySQL distincte dans DBeaver, sans modifier la connexion locale.
4. Ajout du certificat CA Aiven dans la configuration SSL de DBeaver et activation
   des options de vérification présentées pendant la configuration.
5. Test de connexion DBeaver réussi et confirmé par l’utilisateur.
6. Création de `dentilib_prod` sur le même serveur Aiven, puis sélection comme base
   par défaut dans DBeaver. La suppression de `defaultdb` a été envisagée, mais
   son exécution n’a pas été confirmée.

Les identifiants Aiven ne sont pas consignés dans ce document.

### Initialisation de la base distante

Dans un éditeur SQL utilisant la connexion Aiven :

- Exécution d’une copie de `sql/create_tables.sql`, avec `CREATE DATABASE` et `USE`
  ciblant `dentilib_prod`. Les cinq tables ont été confirmées créées.
- Exécution d’une copie de `sql/jeu_essai.sql`, avec `USE dentilib_prod`, pour importer
  les données fictives de démonstration.
- Vérification confirmée des trois comptes : administrateur, Marie Martin et Paul Durand.

Les fichiers SQL d’origine peuvent conserver leur cible locale `dentilib`.
Les copies adaptées à Aiven sont exécutées avec **Execute SQL Script** pour respecter
l’ordre des instructions. Le script de création contient des suppressions de tables :
il a servi à l’initialisation d’une base vide et ne doit pas être rejoué comme mise à jour.
Le jeu d’essai n’est pas à réimporter à chaque déploiement.

La base distante et la base locale sont indépendantes : il n’existe pas de synchronisation
automatique entre leurs données. Seules des données fictives sont destinées à cette démonstration.

### TLS et certificat CA

TLS chiffre les échanges et protège leur intégrité. Le certificat CA permet de vérifier
le certificat du serveur ; la vérification du nom d’hôte permet de vérifier le serveur attendu.
L’onglet DBeaver est nommé SSL, mais la connexion utilise le protocole moderne TLS.

La connexion DBeaver à Aiven a été configurée avec le certificat et testée avec succès.
La version TLS et les paramètres négociés n’ont pas été relevés séparément.
La configuration DBeaver ne s’applique pas automatiquement à Sequelize : une
configuration TLS a donc été ajoutée dans `config/sequelize.js`.
Le HTTPS du navigateur et le TLS vers MySQL protègent deux connexions différentes.

### Vérification de Sequelize vers Aiven depuis le Mac

- Ajout de la lecture du certificat CA via `DB_SSL_CA_PATH`, avec
  `rejectUnauthorized: true` et `verifyIdentity: true` pour vérifier le certificat et le nom du serveur.
- En environnement `production`, le certificat est obligatoire. La configuration
  locale reste inchangée en l’absence de cette variable hors production.
- Test ponctuel de `sequelize.authenticate()` vers `dentilib_prod`, avec les paramètres
  Aiven fournis pour cette commande uniquement, sans modifier le `.env` local.
- Le mot de passe a été saisi de manière invisible dans une variable temporaire du
  terminal. Il n’a pas été inscrit en clair dans la commande ; il peut être effacé avec
  `unset AIVEN_PASSWORD` après le test.
- Résultat transmis par l’utilisateur : **« Connexion MySQL avec vérification TLS réussie. »**

Cette vérification confirme le trajet **Mac → Aiven** sans modifier les données.
Elle ne confirme pas encore le trajet **Render → Aiven**, qui sera testé après configuration et déploiement.

### Variables et certificat préparés dans Render

Le certificat CA a été ajouté dans **Environment → Secret Files**, sous le nom
`aiven-ca.pem`. Son emplacement attendu à l’exécution est `/etc/secrets/aiven-ca.pem`.
L’utilisateur a confirmé avoir renseigné les variables suivantes ; leurs valeurs
secrètes ne sont pas reproduites dans le dépôt.

| Variable | Valeur ou rôle |
| --- | --- |
| `NODE_ENV` | `production` |
| `DB_HOST` | Hôte MySQL fourni par Aiven |
| `DB_PORT` | Port fourni par Aiven |
| `DB_NAME` | `dentilib_prod` |
| `DB_USER` / `DB_PASSWORD` | Identifiants Aiven |
| `DB_SYNC` | `false` : tables initialisées explicitement, sans synchronisation automatique au démarrage |
| `DB_SSL_CA_PATH` | `/etc/secrets/aiven-ca.pem` |
| `CORS_ORIGIN` | `https://dentilib-d50z.onrender.com` |
| `JWT_SECRET` | Secret aléatoire distinct du secret local |
| `SMTP_HOST` | `smtp-relay.brevo.com` |
| `SMTP_PORT` | `2525` |
| `SMTP_USER` / `SMTP_PASS` | Identifiant SMTP et clé SMTP Brevo |
| `EMAIL_FROM` | Adresse d’expédition validée dans Brevo |

Render fournit `PORT` ; `DB_SOCKET` n’est pas utilisé pour la connexion distante.
Le `.env` local reste inchangé et n’est pas stocké dans Git. Le certificat CA est
un certificat de confiance, pas une clé privée. Les mots de passe et clés restent privés.

### Signature JWT en production

Un secret de production a été généré avec `openssl rand -hex 32`, puis ajouté dans Render.
Cette commande produit 32 octets aléatoires, représentés par 64 caractères hexadécimaux.
Le secret permet de signer et vérifier les JWT : une modification du jeton est détectée.
Il ne chiffre pas leur contenu et ne doit pas être publié.

### E-mails de production — Brevo et STARTTLS

Render Free bloque les ports SMTP 25, 465 et 587 : le SMTP Gmail local sur 587 ne
convient donc pas à ce déploiement. Un compte Brevo a été créé, l’expéditeur a été
validé et une clé SMTP a été générée. Brevo accepte le port 2525 choisi pour Render.

- Local habituel : Gmail, configuration existante du `.env`.
- Tests : Mailpit local, sans distribution réelle.
- Démonstration déployée : relais SMTP Brevo, configuré dans Render.

Dans `utils/mailer.js`, `requireTLS: true` a été ajouté uniquement au transport SMTP
hors tests. Avec `secure: false`, la connexion passe au chiffrement par STARTTLS ;
`requireTLS` rend ce passage obligatoire avant authentification et envoi.
Le transport Mailpit reste inchangé.

Un test `transporter.verify()` a été exécuté depuis le Mac avec les paramètres
Brevo et la clé saisie dans une variable temporaire. Résultat confirmé :
**« Connexion Brevo, STARTTLS et authentification réussis. »**
Ce test n’envoie aucun e-mail : l’autorisation effective de l’expéditeur et la
réception d’un message depuis Render restent à vérifier.

Le bouton Brevo de blocage des IP non autorisées est une protection supplémentaire,
distincte de la clé SMTP. Son activation n’a pas été confirmée ; elle nécessite de
préparer les autorisations des adresses IP sortantes de Render.

### Démarrage conditionné à MySQL

Deux modifications ont été réalisées :

- `config/sequelize.js` transmet l’échec de connexion avec `throw error`, après journalisation.
- `server.js` attend `connectSequelize()` avant d’exécuter `app.listen()`.

En cas d’échec, le message est :

```text
Démarrage annulé : MySQL est inaccessible ou son initialisation a échoué.
```

Le processus s’arrête avec le code **1**, qui signale un échec de démarrage ; ce n’est
pas un statut HTTP, puisque le serveur n’écoute pas encore. La syntaxe des fichiers
a été vérifiée. Les essais de démarrage réel avec et sans MySQL restent à exécuter.
Ce mécanisme contrôle la disponibilité au démarrage, sans assurer une surveillance continue.

### HTTPS de l’application

Render assure la terminaison TLS et la gestion du certificat de l’adresse publique.
Express conserve son serveur HTTP interne ; aucun certificat HTTPS n’a été ajouté
au code Node.js. Après déploiement, vérifier l’accès HTTPS, la validité du certificat
et la redirection HTTP vers HTTPS. Ces contrôles restent à réaliser sur la nouvelle version.

### Prochaines étapes et preuves à conserver

1. Tester le démarrage avec MySQL disponible et indisponible, puis terminer les
   correctifs d’accès identifiés dans la partie Tests.
2. Envoyer la version préparée sur GitHub et vérifier la branche et le commit sélectionnés dans Render.
3. Déployer puis contrôler les journaux, Render → Aiven, Render → Brevo avec réception
   réelle d’un e-mail de démonstration, HTTPS et les parcours des trois rôles.
4. Documenter la sauvegarde et la restauration MySQL, ainsi que le retour à une version
   applicative précédente en tenant compte de la compatibilité du schéma.

Conserver des captures sans secrets : service Aiven, connexion DBeaver, cinq tables,
journaux de démarrage Render, commit déployé et résultats des vérifications en ligne.
L’intégration Render → Aiven, la nouvelle mise en ligne, la sauvegarde et le retour
arrière ne sont pas présentés comme exécutés à ce stade.

## 3. DevOps

À préparer : une pipeline qui exécute les tests avant le déploiement et conserve
leurs résultats. Sa mise en place et son exécution restent à vérifier.
