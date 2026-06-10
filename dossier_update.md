# Notes de travail — Pistes d'amélioration du dossier DentiLib

> Document de travail interne. Regroupe l'analyse de cohérence dossier ↔ code et les 5 sections techniques à intégrer au dossier (justifications + éléments techniques). À conserver comme référence.

---

## 1. Incohérences dossier ↔ code réel (à corriger en priorité)

Le dossier décrit actuellement des fonctionnalités qui ne sont pas (ou pas entièrement) dans le code. C'est le type d'écart qui peut se retourner contre nous en soutenance.

| Ce que dit le dossier | Réalité du code | Risque |
|---|---|---|
| Dentiste « ajoute des **quantités** » (§2.2) ; total calculé « selon les quantités » (§2.5) | Aucun champ `quantity`. Le modèle `WorkSheet.acts` ne stocke que `name`, `description`, `price`. Le total = somme des prix. | Le jury demandera à voir → contradiction visible |
| « Des **tableaux de bord** ont été mis en place » (§2.6) | Aucun dashboard / statistique dans le code (ni route, ni écran) | Affirmation fausse |
| « Un système de **notifications**… lors de l'envoi d'une fiche ou la création d'un compte » (§2.6) | Seul l'**email à la création de compte** existe (Nodemailer). Rien lors de l'envoi de fiche. | À nuancer |
| Facture : « **Aucune génération de fichier PDF** n'a été implémentée » (§2.5) + perspective « ajouter génération PDF » | Le PDF **EST généré** (librairie `jsPDF`, dans `worksheet.js`, bouton Facture) | On se **sous-estime** : on a fait mieux que ce qui est écrit ! |
| Admin « filtrer les dentistes / prothésistes / actes » (besoins) | Recherche texte présente côté fiches ; filtrage liste users/actes à vérifier | À nuancer |
| Dentiste/Proto « consulter les notifications » + « tableau de bord » (besoins) | Non implémenté | OK si présenté comme *besoin cible* non encore réalisé |

**Recommandation :** garder les besoins fonctionnels « larges » (c'est un cahier des charges cible, légitime), mais dans le **chapitre 3 (Réalisation)**, ne décrire que ce qui existe réellement, et basculer le reste en « Perspectives ». Et **revendiquer le PDF** : c'est une vraie réussite technique.

---

## 2. À insérer — Justification technique du besoin (Chapitre 1, §3)

> **Pourquoi une application web (et non un logiciel installé) ?**
> Le besoin implique deux acteurs travaillant dans des locaux distincts (cabinet dentaire et laboratoire de prothèse) qui doivent accéder à une information **commune et synchronisée**. Une application web centralisée répond directement à ce besoin : une **source de données unique** côté serveur, accessible depuis n'importe quel navigateur, sans installation ni synchronisation manuelle de fichiers. Cela élimine les principales limites de l'existant (données dispersées, absence de temps réel, ressaisies).
>
> **Pourquoi une architecture client-serveur avec API REST ?**
> Séparer l'interface (client) de la logique métier (serveur) permet (1) de **centraliser les règles de gestion et la sécurité** au même endroit, (2) de faire évoluer l'interface indépendamment, et (3) d'ouvrir la voie à de futurs clients (application mobile, par exemple) consommant la même API.

---

## 3. À insérer — Justification des choix technologiques (Chapitre 3, §1)

> **JavaScript de bout en bout (Node.js + front).** Utiliser un langage unique côté serveur et côté navigateur réduit la charge cognitive, évite les changements de contexte et permet de partager certaines logiques (ex. validation d'email par expression régulière, présente à la fois côté client et côté serveur). Ce choix favorise la productivité sur un projet mené par un développeur unique en temps contraint.
>
> **Node.js / Express.** Node.js repose sur un modèle **asynchrone non bloquant**, particulièrement adapté à une application orientée entrées/sorties (accès base de données, envoi d'e-mails) plutôt qu'au calcul intensif. Express a été retenu pour sa légèreté et sa simplicité : il fournit le strict nécessaire (routage, middlewares) sans imposer de structure lourde, ce qui laisse la liberté d'organiser le code selon une architecture MVC maîtrisée.
>
> **MongoDB (NoSQL) plutôt qu'une base relationnelle (SQL).** Ce choix se justifie par trois raisons :
> 1. **Adéquation au modèle de données.** L'objet métier central — la fiche de travaux — est naturellement un **document imbriqué** : une fiche contient la liste de ses actes, les informations patient et les données de suivi. MongoDB stocke ce document tel quel, alors qu'en SQL il faudrait l'éclater sur plusieurs tables reliées par des jointures.
> 2. **Cohérence avec la stack.** Les documents MongoDB sont des objets JSON, manipulés directement en JavaScript sans couche de correspondance objet-relationnel.
> 3. **Souplesse d'évolution.** Le schéma pouvant évoluer sans migration lourde, MongoDB est adapté à un développement **itératif** où le modèle se précise au fil du projet.
>
> *Contrepartie assumée :* MongoDB n'impose pas nativement l'intégrité référentielle ni les transactions multi-documents. Pour un projet de cette envergure, l'intégrité est gérée au niveau applicatif (vérifications dans les contrôleurs), ce qui reste acceptable. L'usage de **Mongoose** apporte par ailleurs une couche de schéma et de validation par-dessus MongoDB, conciliant flexibilité et rigueur.
>
> **JWT (JSON Web Token) pour l'authentification.** Un jeton signé est **sans état** : le serveur n'a pas à stocker de session, ce qui simplifie l'architecture et facilite la montée en charge. Le jeton transporte l'identifiant et le **rôle** de l'utilisateur, exploités par les middlewares pour le contrôle d'accès. Pour limiter le risque lié à l'impossibilité de révoquer un jeton, une **durée de validité courte (2 h)** a été retenue.
>
> **bcrypt pour les mots de passe.** Les mots de passe ne sont jamais stockés en clair : ils sont hachés avec bcrypt, algorithme à **sel intégré** et coût configurable, conçu pour résister aux attaques par force brute.
>
> **Nodemailer / jsPDF.** Nodemailer assure l'envoi d'e-mails (confirmation de création de compte). La génération de la facture est réalisée côté client avec **jsPDF**, ce qui produit le document directement dans le navigateur sans surcharger le serveur.
>
> **Postman, Newman et Cypress pour les tests.** Cette combinaison couvre plusieurs niveaux : tests manuels et automatisés de l'API (Postman/Newman) et tests fonctionnels de bout en bout simulant l'utilisateur réel (Cypress).

---

## 4. À insérer — Justification des choix de conception (Chapitre 2, §2)

> **Architecture en couches (MVC).** Le code est organisé en `routes` (points d'entrée), `controllers` (logique métier), `models` (structures de données) et `middlewares` (sécurité transverse). Cette séparation des responsabilités améliore la lisibilité, facilite les tests unitaires et évite un code monolithique.
>
> **Trois modèles plutôt qu'un modèle exhaustif.** La modélisation a été volontairement resserrée autour de trois entités : `User` (utilisateur polymorphe selon son rôle), `Acte` (catalogue) et `WorkSheet` (fiche de travaux). Les entités *Patient*, *Facture* et *Catalogue* du diagramme de classes n'ont pas été créées comme collections distinctes :
> - le **patient** est embarqué dans la fiche (il n'existe pas de besoin de le réutiliser entre plusieurs fiches dans cette version) ;
> - la **facture** est **dérivée** de la fiche (calcul à la volée + génération PDF), et non stockée comme entité propre ;
> - le **catalogue** est représenté par le sous-document `listActs` de chaque prothésiste (acte + prix unitaire).
>
> Ce choix illustre l'écart entre **conception logique** (UML, orienté objet) et **implémentation NoSQL** (orientée document), où l'imbrication remplace certaines associations.
>
> **Relation dentiste–prothésiste en 1↔1 dans un premier temps.** Le besoin réel autorise un dentiste à travailler avec plusieurs prothésistes (et inversement), soit une relation *plusieurs-à-plusieurs*. Le choix délibéré de commencer par une relation **un-à-un** (champ `associatedUser`) vise à :
> - livrer rapidement le **flux métier complet** (création → envoi → suivi → facture) sans se disperser ;
> - réduire la complexité (pas de table d'association ni de gestion de cardinalité multiple dans l'interface) ;
> - valider l'architecture avant de la généraliser.
>
> Le modèle a été pensé pour évoluer : passer à une relation multiple consistera à remplacer le champ unique par une liste de références. Ce choix relève d'une démarche **MVP** (produit minimum viable) assumée.
>
> **Cycle de vie de la fiche par machine à états.** Le statut de la fiche est contraint à une liste de valeurs (`BROUILLON`, `EN_ATTENTE`, `EN_COURS`, `TERMINE`, `EN_ATTENTE_PAIEMENT`, `PAYE`). Modéliser le workflow ainsi rend les transitions explicites, fiabilise le suivi et conditionne l'affichage de l'interface (par exemple, le bouton « Envoyer » n'apparaît qu'au statut `BROUILLON`).

---

## 5. À insérer — Éléments techniques concrets (Chapitre 3)

Illustrer avec ces extraits réels du code (cela crédibilise énormément le dossier) :

**Sécurisation d'une route par double middleware (authentification + rôle)** — `routes/adminRoutes.js` :

```js
router.use(authMiddleware);
router.use(roleMiddleware(["ADMIN"]));

router.get("/user/allUsers", adminController.getAllUsers);
router.get("/user/allUsers/noAdmin", adminController.getAllUsersWithoutAdmin);
router.get("/user/dentistes", adminController.getAllDentistes);
router.get("/user/dentistes/notAssociated", adminController.getDentistesNotAssociated);
router.post("/user/createAccount", adminController.createAccount);
router.put("/user/updateAccount/:userId", adminController.updateAccount);
router.delete("/user/deleteAccount/:userId", adminController.deleteAccount);
router.get("/user/:userId", adminController.getUserById);
```

**Contrôle de propriété d'une ressource** (un dentiste ne peut accéder qu'à ses propres fiches) — `controllers/dentistController.js` :

```js
if (workSheet.idUser.toString() !== req.user.id) {
  return res.status(403).json({ message: "Accès refusé" });
}
```

**Vérification du jeton JWT** — `middlewares/authMiddleware.js` :

```js
const token = authHeader.split(' ')[1]

const decoded = jwt.verify(token, process.env.JWT_SECRET)
req.user = decoded
next()
```

À mentionner également :
- Le **hachage bcrypt** (`bcrypt.hash(password, 10)`) à la création de compte.
- La **génération automatique du numéro de fiche** (recherche du dernier `numFiche` + 1).
- La **machine à états** des statuts (l'`enum` du modèle `WorkSheet`).

---

## Pistes de suite possibles

- Corriger directement les incohérences du chapitre 3 (quantités, dashboards, notifications, PDF) en réécrivant les paragraphes concernés.
- Implémenter réellement la quantité d'actes dans le code pour que le dossier soit exact.
- Aider sur les diagrammes UML (cas d'utilisation, classes, séquence) cohérents avec le code réel.
- Rédiger la partie compétences (ce que chaque choix technique démontre comme compétence).
