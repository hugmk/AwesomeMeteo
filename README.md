# Projet ProgAv : AwesomeMeteo 🌦️


### Lancer l'application
- Suivre le tuto de React Native pour mettre en place l'environnement de développement (https://reactnative.dev/docs/environment-setup), jusqu'à l'étape de création d'un projet, puisque nous allons lancer celui-ci.
- Dans un terminal, aller dans le dossier racine du projet, et lancer la commande `npm install`.
- Ouvrir le dossier `AwesomeMeteo\android` dans Android Studio, et lancer l'appli sur un appareil virtuel (appareil recommandé : Google Pixel 5).
- Dans un terminal, aller dans le dossier racine du projet, et lancer la commande `npx react-native start`.
- Dans un autre terminal, aller dans le dossier racine du projet, et lancer la commande `npx react-native run-android`.
L'application devrait alors se charger sur l'émulateur d'Android Studio précédemment lancé.


### Présentation de l'application
Dans le cadre de notre cours en programmation avanvée nous avons pour objectif la réalisation d'une application météo, notifiant l'utilisateur lors d'un changement climatique.
C'est pourquoi nous proposons l'application **Awesome Meteo**, une application Android, vous permettant de renseigner les villes de votre choix, de voir la météo actuelle pour ces villes, et de recevoir des notifications en cas de changement de condition climatique, de température, ou de vitesse du vent.


### Utilisation de l'application
1. Ajouter une ville : après une vérification, la ville est ajoutée à la liste des villes
2. Supprimer une ville : pour supprimer une ville de liste, glisser la ville vers la gauche, et confirmer la suppression
3. Recevoir les notifications : une fois l'application quitée, vous recevrez des notifications en cas de changement de météo pour les villes de votre liste


### Technologies & logiciels utilisés
Concernant la technologie utilisé, nous avons opté pour **React Native**, un framework d'applications mobiles créé par Facebook, permettant le développement d'applications iOS et Android. L'utilisation du langage JavaScript, que nous connaissions déjà, ainsi que la découverte d'un nouveau framework nous ont poussé à faire ce choix.
Nous avons d'ailleurs converti notre projet en **TypeScript** en cours de projet, afin de pouvoir ajouter plus facilement des règles sur les types des objets et sur les paramètres des fonctions, et de pouvoir également spécifier des variables optionnelles.
La possibilité de créer des applications à la fois sur les systèmes d'exploitation Android et iOS nous ont également motivé à choisir React Native, bien que nous avons finalement axé notre application pour les appareils Android.

Le développement à été réalisé à l'aide de l'éditeur de code **Visual Studio Code**, et nous avons utilisé **Android Studio** pour émuler un smartphone et tester l'application.
Le logiciel GitHub Desktop nous a également aidé à récupérer et pousser les fichiers du repository.

Pour faciliter la gestion de projet, nous avons utilisé Trello, un outil en ligne basé sur la méthode Kanban. Voici une capture d'écran de notre environnement de travail :
![trello](https://user-images.githubusercontent.com/103774810/214683170-d733966c-846d-4b05-9d30-6e38b01ee6b4.png)

Ainsi, nous créions régulièrement des nouvelles tâches en fonction de l'avancée de l'application, chaque tâche passant du statut *A faire* à *En cours* lorsque quelqu'un commençait à travailler dessus, puis vers *Terminé* lorsque la tâche était poussé vers le repository commun.


### Données 
Pour récupérer les données météorologiques, nous avons utilisé l'API [Open Weather](https://openweathermap.org/api). 
Ainsi nous récupérons pour chaque ville les données suivantes : 
- Température actuelle
- Vitesse du vent
- Description météo (ex: Ciel clair, Pluie légère) + l'icône associée


### Maquettes
- Maquette fonctionnelle (*lo-fi*) :
![maquette_v1](https://user-images.githubusercontent.com/103774810/212537857-6386f45f-feb5-4585-b3bb-0d157fd49306.png)

- Maquettes visuelles (*hi-fi*) :
![design propositions](https://user-images.githubusercontent.com/103774810/212537862-f9cc762f-8c1a-4838-a494-231589672d84.png)
La proposition de design **numéro 1** a été finalement choisie.


### Logo
![Awesome Meteo logo](https://user-images.githubusercontent.com/103774810/214693367-770b334a-b345-40d2-a423-64043d0b2e86.png =250x250)


### Difficultés rencontrées
- Au début du développement du projet, nous utilisions Expo Snack, un éditeur en ligne permettant de développer un projet en React Native sur un navigateur. La plateforme a malheureusement montré ses limites lors de l'utilisation de l'API OpenWeather : les requêtes vers l’api étaient bloquées. Nous avons alors basculé vers un mode de développement plus classique, en utilisant Android Studio, où le problème de connexion à l'API était résolus. Ce changement d'environnement nous a aussi probablement éviter d'autres problèmes dans le futur, nottament lors de l'utilisation de librairies externes, par exemple pour la gestion des notifications.

- Comme nous étions tous les trois plus à l'aise en développement de sites web, il nous a fallu un certain temps pour nous adapter au développement mobile, et au framework React Native.

- Enfin, nous ne sommes pas tous très confortables avec le développement, nous devons faire avec les niveaux et les connaissances de chacun. Nous nous sommes mutuellement aidés.  


### Bilan 
En conclusion, nous sommes satisfait du résultat de l'application, car les fonctionnalités principales de l'application fonctionnent correctement.
Nous pensons tout de même que des évolutions sont possibles sur cette application : 
- l'aspect graphique peut être améliorer, par exemple en mettant en arrière plan des villes une illustration graphique du temps qu'il fait
- les notifications peuvent être gérés par un serveur, pour ne pas avoir à lancer l'application avant de pouvoir de recevoir des notifications
- l'ajout de la compatibilité avec les appareils iOS
