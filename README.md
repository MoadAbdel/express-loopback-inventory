# Mini-Cas Pratique : Intégration Frontend Express + Microservice LoopBack 4 + MongoDB

## Architecture

```
frontend/     # Express (express-generator), route /inventory (port 8080)
lb4-service/  # Microservice REST LoopBack 4 + MongoDB (port 3000)
```

Le frontend Express sert la page `/inventory` (liste + formulaire "Add Book").
A la soumission du formulaire, il fait un `POST /books` vers l'API LoopBack 4,
puis redirige vers `/inventory` (nouveau `GET`), ce qui rafraîchit la liste et
réinitialise le formulaire.

## Prérequis

- Node.js
- MongoDB (via Docker, ou une instance locale)

## 1. Démarrer MongoDB

```bash
docker run -d --name inventory-mongo -p 27017:27017 mongo:7
```

## 2. Démarrer le microservice LoopBack 4

```bash
cd lb4-service
npm install
npm run build
MONGO_URL="mongodb://localhost:27017/inventory" PORT=3000 npm start
```

Endpoints exposés :
- `POST http://localhost:3000/books` — crée un livre `{ "title": "...", "author": "..." }`
- `GET http://localhost:3000/books` — liste les livres
- Explorateur OpenAPI : `http://localhost:3000/explorer`

## 3. Démarrer le frontend Express

```bash
cd frontend
npm install
LB4_API_URL="http://localhost:3000" PORT=8080 npm start
```

Ouvrir : [http://localhost:8080/inventory](http://localhost:8080/inventory)

## Comportement attendu

1. La page `/inventory` affiche la liste des livres sous forme `Titre - Auteur`
   et un formulaire "Add Book:" (champs Title, Author, bouton Submit).
2. A la soumission, le livre est inséré dans MongoDB via l'API LoopBack 4.
3. La page se rafraîchit automatiquement, affiche le nouveau livre dans la
   liste et le formulaire repart vide.

## Vérifier la persistance directement dans MongoDB

```bash
docker exec -it inventory-mongo mongosh inventory --eval "db.Book.find().pretty()"
```
