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

À compléter : configuration Render et MySQL, secrets, HTTPS, vérification après
mise en ligne, sauvegarde et retour à la version précédente. L’état du déploiement
existant reste à vérifier.

## 3. DevOps

À préparer : une pipeline qui exécute les tests avant le déploiement et conserve
leurs résultats. Sa mise en place et son exécution restent à vérifier.
