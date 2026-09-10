# Bookstore microservices : LoopBack 4, API Gateway, Docker

## Architecture

```
bookstore-web-app/   # Frontend Express (port 8082) — vues /inventory, /orders, /payments
gateway/             # API Gateway Express (port 9001), proxy vers les 3 microservices
lb4-inventory/       # Microservice LoopBack 4 "Book" (port 3000)
lb4-order/           # Microservice LoopBack 4 "Order" (port 3001)
lb4-payment/         # Microservice LoopBack 4 "Payment" (port 3002)
docker-compose.yml   # Orchestration de l'ensemble + un seul container MongoDB partagé
```

```
Navigateur ──▶ bookstore-web-app (8082) ──▶ gateway (9001) ──▶ inventory (3000) ─┐
                                                             ├─▶ order (3001)     ├─▶ mongo (27017)
                                                             └─▶ payment (3002) ──┘
```

Le gateway route :
- `/api/inventory/*` → `inventory:3000`
- `/api/order/*` → `order:3001`
- `/api/payment/*` → `payment:3002`

Chaque microservice LoopBack 4 a son propre model/datasource/controller/repository,
mais tous pointent vers le **même container MongoDB** (`mongo:latest`), chacun
dans sa propre base (`inventorydb`, `orderdb`, `paymentdb`) — comme suggéré par
l'énoncé pour simplifier.

## Lancer avec Docker Compose (recommandé)

```bash
docker-compose up -d --build
```

Cela construit et démarre les 6 containers : `mongo`, `inventory`, `order`,
`payment`, `gateway`, `bookstore-web-app`.

Tester :
- Frontend : http://localhost:8082/inventory, /orders, /payments
- Gateway direct : `curl http://localhost:9001/api/inventory/books`,
  `.../api/order/orders`, `.../api/payment/payments`

Arrêter :

```bash
docker-compose down
```

## Lancer en local sans Docker (dev)

Prérequis : MongoDB (`docker run -d --name mongo -p 27017:27017 mongo:latest`).

```bash
# chaque microservice LoopBack 4
cd lb4-inventory && npm install && npm run build && MONGO_URL="mongodb://localhost:27017/inventorydb" PORT=3000 npm start
cd lb4-order     && npm install && npm run build && MONGO_URL="mongodb://localhost:27017/orderdb"     PORT=3001 npm start
cd lb4-payment   && npm install && npm run build && MONGO_URL="mongodb://localhost:27017/paymentdb"   PORT=3002 npm start

# gateway
cd gateway && npm install && \
  INVENTORY_URL="http://localhost:3000" ORDER_URL="http://localhost:3001" PAYMENT_URL="http://localhost:3002" \
  PORT=9001 npm start

# frontend
cd bookstore-web-app && npm install && GATEWAY_URL="http://localhost:9001" PORT=8082 npm start
```

Ouvrir [http://localhost:8082/inventory](http://localhost:8082/inventory).

## Vérifier la persistance dans MongoDB

```bash
docker exec -it mongo mongosh --eval "
  db.getSiblingDB('inventorydb').Book.find().pretty();
  db.getSiblingDB('orderdb').Order.find().pretty();
  db.getSiblingDB('paymentdb').Payment.find().pretty();
"
```
