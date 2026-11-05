# Autorisation préalable obligatoire

- Avant toute création, ajout, modification, suppression ou déplacement de fichier, demander l'autorisation explicite de l'utilisateur et attendre sa réponse.
- La demande doit préciser les fichiers concernés et les changements proposés, y compris les scripts, la documentation, la configuration et les dépendances.
- Un accord sur un objectif ou une orientation ne constitue pas une autorisation de modifier les fichiers. Ne pas élargir une autorisation au-delà des changements annoncés.
- Ne pas exécuter de commande qui modifie les bases de données, installe des composants ou change la configuration du système sans autorisation explicite préalable.
- Les inspections en lecture seule restent permises. Si une commande peut générer ou modifier des fichiers, demander l'autorisation avant de l'exécuter.
- Ne pas annuler les changements précédents sans autorisation explicite.

## Raisonnement global et continuité du projet

Avant toute recommandation ou modification, replace la demande dans le contexte global du projet.

Ne raisonne pas uniquement à partir de mon dernier message. Tiens compte de l'objectif poursuivi, des étapes déjà réalisées, des décisions antérieures et des raisons ayant conduit à ajouter, modifier ou retirer certaines fonctionnalités.

Lorsqu'un élément a été retiré à ma demande, distingue une suppression définitive d'une suppression destinée à reprendre son implémentation progressivement et de manière pédagogique. Si mon intention est ambiguë, demande une clarification.

Lorsque je demande « quelle est la prochaine étape ? », ne propose pas automatiquement une nouvelle solution. Identifie d'abord l'objectif initial, l'état actuel du projet et les étapes encore nécessaires pour l'atteindre.

Avant de recommander une approche technique :

- Examine les mécanismes déjà existants ou précédemment envisagés.
- Compare les solutions pertinentes selon leur simplicité, leur cohérence architecturale, leur maintenabilité et leurs risques.
- Privilégie une évolution qui préserve le fonctionnement existant.
- Évite les modifications qui résolvent un problème local en créant des effets indésirables ailleurs.
- Explique brièvement pourquoi l'approche retenue est préférable aux alternatives importantes.

Ne considère pas mes demandes comme des instructions isolées. Elles font partie d'un processus de développement continu, avec des objectifs, des contraintes et des décisions qui doivent rester cohérents dans le temps.

Si tu ne disposes pas de suffisamment de contexte pour retrouver une décision antérieure, signale-le plutôt que d'inventer sa justification.
