#!/bin/bash

# NexaBank — Start All Services
echo "🏦 Starting NexaBank Microservices..."

ROOT_DIR=$(dirname "$0")

# Start Account Service
echo "▶ Starting Account Service on port 8081..."
cd "$ROOT_DIR/backend/account-service"
mvn spring-boot:run &
ACCOUNT_PID=$!

# Start Card Service
echo "▶ Starting Card Service on port 8082..."
cd "$ROOT_DIR/backend/card-service"
mvn spring-boot:run &
CARD_PID=$!

# Start Loan Service
echo "▶ Starting Loan Service on port 8083..."
cd "$ROOT_DIR/backend/loan-service"
mvn spring-boot:run &
LOAN_PID=$!

echo ""
echo "✅ All backend services starting..."
echo "   Account Service → http://localhost:8081"
echo "   Card Service    → http://localhost:8082"
echo "   Loan Service    → http://localhost:8083"
echo ""
echo "📖 Swagger UIs:"
echo "   http://localhost:8081/swagger-ui.html"
echo "   http://localhost:8082/swagger-ui.html"
echo "   http://localhost:8083/swagger-ui.html"
echo ""
echo "Press Ctrl+C to stop all services"

# Start Frontend
echo "▶ Starting React Frontend on port 3000..."
cd "$ROOT_DIR/frontend"
npm install --silent && npm start &

wait $ACCOUNT_PID $CARD_PID $LOAN_PID
