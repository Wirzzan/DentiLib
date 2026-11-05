# DentiLib — stratégie et plan de tests

## 1. Objectif

Vérifier les parcours nécessaires à la démonstration de DentiLib avant son
déploiement : gestion des comptes, échanges de fiches entre dentistes et
prothésistes, validation des saisies et protection des données entre utilisateurs.
Ce document accompagne le bloc « Préparer le déploiement d’une application sécurisée » du CDA.

## 2. Stratégie de test

| Niveau | Outils | Objectif |
| --- | --- | --- |
| Tests API d’intégration | Jest et Supertest | Vérifier les réponses HTTP, les règles métier, les droits et les données enregistrées avec le vrai serveur et MySQL |
| Tests de bout en bout (E2E) | Cypress | Vérifier les parcours depuis le navigateur, les formulaires, les messages et les résultats visibles |
| Parcours API de référence | Collection Postman exécutée par Newman | Enchaîner les opérations complètes des trois rôles, sans navigateur |
| Contrôle des e-mails | Mailpit, vérification manuelle | Capturer et consulter les e-mails de test sans les distribuer aux destinataires réels |

Les tests prioritaires portent sur les parcours principaux, les saisies refusées,
les rôles et la confidentialité des fiches. Les tests API vérifient également les
refus lorsque le formulaire est contourné. Cypress vérifie les effets dans la liste
des comptes plutôt que les notifications temporaires de succès.

Les scénarios positifs vérifient une opération autorisée ; les scénarios négatifs
vérifient un refus ; les scénarios alternatifs vérifient notamment une annulation
ou le comportement en l’absence de prothésiste associé.

Il n’existe pas de suite unitaire distincte dans ce périmètre. Les temps de réponse
relevés par Newman ne constituent pas un test de performance ou de charge.

## 3. Environnement et données

- MySQL local : base `dentilib_test`, avec les cinq tables créées dans DBeaver.
- Base de démonstration `dentilib` conservée séparément ; `.env` principal inchangé.
- Application de test : `http://localhost:3001`, lancée avec `npm run start:test`.
- Cypress : `npm run cypress:open`, également configuré pour `dentilib_test`.
- Mailpit : SMTP `127.0.0.1:1025`, consultation `http://127.0.0.1:8025/`.
- Données fictives : comptes administrateur, dentistes, prothésistes, patients et actes de test.
- Aucun secret de production n’est nécessaire à ces essais.

La tâche de réinitialisation Cypress supprime les données de test. Elle refuse une
base différente de `dentilib_test`, un environnement autre que `test` et un hôte
MySQL non local. Ces contrôles ne remplacent pas un compte SQL limité à la base de test.

Certaines suites existantes réutilisent des e-mails fixes et dépendent des données
des scénarios précédents. Une réinitialisation est nécessaire entre les campagnes
Jest, Cypress et Newman, mais pas entre les fichiers d’un même parcours Cypress.
La nouvelle suite API de sécurité crée des comptes uniques et les supprime en fin d’exécution.

## 4. Plan API — Jest et Supertest

### Authentification : `test/userAuth.test.js` — 12 tests

| ID | Scénario | Résultat attendu |
| --- | --- | --- |
| J01 | Création d’un administrateur | 201, compte retourné |
| J02 | E-mail administrateur déjà utilisé | 409 |
| J03 | E-mail d’inscription invalide | 400 |
| J04 | Mot de passe d’inscription trop court | 400 |
| J05 | Connexion valide | 200, JWT et rôle ADMIN |
| J06 | Mot de passe incorrect | 401 |
| J07 | E-mail de connexion inexistant | 404 selon le comportement actuel |
| J08 | E-mail de connexion vide | 400 |
| J09 | Mot de passe de connexion vide | 400 |
| J10 | Suppression de son compte administrateur | 200 |
| J11 | Suppression sans JWT | 403 selon le middleware actuel |
| J12 | Suppression d’un compte déjà supprimé | 404 |

J01 décrit le fonctionnement actuel, pas une garantie de sécurité : l’inscription
publique d’un administrateur reste à fermer avant déploiement. Sa préparation dans
les tests devra alors être adaptée, sans conserver cette ouverture pour les tests.

### Administration : `test/userAdmin.test.js` — 8 tests

| ID | Scénario | Résultat attendu |
| --- | --- | --- |
| J13 | Création d’un dentiste par l’administrateur | 201, rôle DENTISTE |
| J14 | Création d’un prothésiste associé | 201, rôle et association corrects |
| J15 | Prothésiste sans dentisteId | 400 |
| J16 | Dentiste associé inexistant | 404 |
| J17 | Association à un administrateur au lieu d’un dentiste | 404 |
| J18 | Rôle non autorisé à la création | 400 |
| J19 | Liste des utilisateurs sans JWT | 403, aucune liste transmise |
| J20 | Liste des utilisateurs avec JWT invalide | 401, aucune liste transmise |

### Sécurité : `test/securityAccess.test.js` — 7 tests

| ID | Scénario | Résultat attendu |
| --- | --- | --- |
| J21 | Dentiste connecté demandant la liste des utilisateurs | 403 |
| J22 | Prothésiste connecté demandant la liste des utilisateurs | 403 |
| J23 | Dentiste lisant la fiche d’un autre | 403, contenu non transmis |
| J24 | Dentiste modifiant la fiche d’un autre | 403, fiche identique avant et après la tentative |
| J25 | Prothésiste lisant une fiche attribuée à un autre | 403 |
| J26 | Création avec e-mail déjà utilisé | 409, nombre de comptes inchangé et une seule occurrence de l’e-mail |
| J27 | Création directe d’une fiche incomplète via l’API | 400, liste des fiches inchangée |

## 5. Plan E2E — Cypress

| Fichier | Scénarios et résultats attendus | Nombre |
| --- | --- | ---: |
| `00-reset-db.cy.js` | E00 : suppression des données de la base de test avant le parcours | 1 |
| `admin-users.cy.js` | E01 : créer le dentiste A ; E02 : créer son prothésiste ; E03 : créer et modifier le dentiste B. Comptes et modification visibles dans le tableau | 3 |
| `admin-users.cy.js` | E04 : modification de B conservée après rechargement ; E05 : annulation de suppression, compte conservé après rechargement ; E06 : suppression de B, e-mail absent du tableau | 3 |
| `admin-users.cy.js` | E07 : créer six actes, modifier puis supprimer le sixième ; E08 : retour au tableau de bord ; E09 : déconnexion vers la page de connexion | 3 |
| `dentist-worksheet.cy.js` | E10 : champs obligatoires vides refusés ; E11 : e-mail patient invalide refusé | 2 |
| `dentist-worksheet.cy.js` | E12 : création et envoi d’une fiche, statut EN_ATTENTE et bouton d’envoi masqué ; E13 : fiche présente à l’accueil et déconnexion | 2 |
| `dentist-worksheet.cy.js` | E14 : sans prothésiste, bouton d’envoi désactivé, explication affichée ; après rechargement, fiche toujours BROUILLON et sans destinataire | 1 |
| `prothesist-worksheet.cy.js` | E15 : fiche reçue affichée ; E16 : statut mis à jour vers EN_COURS ; E17 : mauvais mot de passe refusé ; E18 : accès à la gestion des actes et saisie d’un tarif | 4 |
| `error-messages.cy.js` | E19 : connexion vide refusée ; E20 : e-mail invalide refusé ; E21 : formulaire utilisateur incomplet refusé ; E22 : doublon d’acte signalé par « Un acte portant ce nom existe déjà » | 4 |
| **Total** | **1 préparation et 22 tests de parcours ou de validation** | **23** |

Le test E07 réalise plusieurs actions mais ne comporte pas une assertion explicite
de persistance pour chaque action sur les actes. E18 ne prouve pas à lui seul la
persistance du tarif saisi. Ces limites évitent de présenter une couverture plus
large que celle effectivement vérifiée.

## 6. Plan du parcours Postman / Newman

Collection : `DentiLib.postman_collection.json` ; environnement :
`dentilibEnv.postman_environment.json`, avec `BASE-URL=http://localhost:3001`.

| Étape | Opérations | Requêtes |
| --- | --- | ---: |
| Authentification | Création et connexion administrateur | 2 |
| Administration | Création dentiste et prothésiste, liste des utilisateurs, modification du dentiste | 4 |
| Catalogue | Création et liste des actes | 2 |
| Dentiste | Connexion, création et liste des fiches, envoi au prothésiste | 4 |
| Prothésiste | Connexion, liste et détail des fiches reçues, passage à EN_COURS | 4 |
| Nettoyage | Suppression du compte administrateur | 1 |
| **Total** | **31 assertions** | **17** |

Certaines assertions acceptent 201 ou 409 à la création : pour démontrer une
nouvelle création, exécuter la collection sur la base de test réinitialisée.
La dernière requête ne supprime pas tous les comptes et fiches créés : réinitialiser
la base de test avant une nouvelle campagne indépendante.

## 7. Procédure d’exécution

1. Vérifier que MySQL fonctionne et que `dentilib_test` contient les cinq tables.
2. Démarrer Mailpit ; conserver son terminal ouvert.
3. Démarrer l’application avec `npm run start:test` ; vérifier la connexion MySQL.
4. Ouvrir Cypress avec `npm run cypress:open` dans un autre terminal.
5. Pour la campagne Cypress : exécuter E00, puis administrateur, dentiste,
   prothésiste et messages d’erreur. Ne pas réinitialiser entre ces fichiers.
6. Pour Jest : réinitialiser avec E00, puis exécuter dans le terminal :

   ```bash
   TEST_URL=http://localhost:3001 npm test -- --runInBand
   ```

7. Pour Newman : réinitialiser avec E00, puis exécuter :

   ```bash
   npx --no-install newman run DentiLib.postman_collection.json \
     -e dentilibEnv.postman_environment.json \
     --env-var "BASE-URL=http://localhost:3001"
   ```

8. Consulter les e-mails capturés dans Mailpit. Ne pas tester ces campagnes sur
   la base de démonstration ou une base de production.

Ne pas utiliser `npm start` pour ces campagnes : il cible la configuration habituelle.
La variable `TEST_URL` est indispensable pour Jest, dont l’URL par défaut reste le port 3000.
En cas d’échec, conserver le message, déterminer s’il s’agit d’un défaut de code,
de données ou d’assertion, puis corriger et rejouer le scénario ainsi que le parcours concerné.

## 8. Résultats disponibles et preuves

| Ensemble | Résultat disponible | Origine de la preuve |
| --- | --- | --- |
| Cypress initial | 20 tests confirmés réussis | Confirmation de l’utilisateur après exécution locale |
| Compléments Cypress | 3 nouveaux tests confirmés réussis | Confirmation de l’utilisateur |
| Jest initial | 18/18 dans 2 fichiers, 1,348 s | Sortie terminal transmise |
| Contrôles JWT | 2/2, 6 autres tests ignorés par le filtre | Sortie terminal transmise ; tests ignorés non comptés comme réussis |
| Compléments API | 7 nouveaux tests confirmés réussis | Confirmation de l’utilisateur |
| Newman | 17 requêtes et 31/31 assertions, aucun échec, 712 ms | Sortie terminal transmise |
| Mailpit | Réception locale des messages confirmée | Vérification manuelle de l’utilisateur |

L’inventaire actuel est de **27 tests Jest dans 3 fichiers et 23 tests Cypress
dans 5 fichiers**. Leur validation a été obtenue en plusieurs exécutions ; un bilan
unique complet après les derniers changements n’a pas été fourni.
Les 31 assertions Newman ne sont pas additionnées aux nombres de tests Jest et Cypress.

Pour le dossier, conserver les captures ou rapports avec la date, le commit testé,
la commande, l’environnement et les nombres réussis/échoués/ignorés. Ne pas joindre
les secrets du `.env`, des JWT réutilisables ou des données personnelles réelles.
Les anciens rapports présents dans le dépôt ne prouvent pas la validité de cette version.

Critère de validation d’une campagne finale : aucun échec, aucun scénario prévu
omis, cible de test confirmée et résultats conservés. L’accord de déploiement doit
aussi tenir compte des défauts de sécurité connus ; une suite verte ne suffit pas.

## 9. Limites et suites prévues

- Ajouter les tests de fermeture de l’inscription administrateur et de protection
  des routes d’écriture des actes lors de leurs correctifs. Ces protections ne sont
  pas validées par les résultats actuels.
- Le mot de passe a été retiré des e-mails dans le code ; ajouter le contrôle
  automatisé de son absence et vérifier le nouveau contenu dans Mailpit.
- L’activation par lien, le jeton JWT expiré et les autres transitions de statut
  ne sont pas couverts par les nouveaux tests décrits ici.
- Les tests locaux ne constituent ni un audit de sécurité, ni une preuve de bon
  fonctionnement sur Render. La CI et la vérification après déploiement restent distinctes.

Pour le jury : « J’ai combiné les parcours navigateur et les tests API pour vérifier
les opérations autorisées, les erreurs de saisie et les refus d’accès. Les données
et les e-mails de test sont isolés. Je distingue les tests exécutés, les preuves
disponibles et les vérifications encore prévues. »
