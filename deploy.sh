#!/usr/bin/env bash

set -Eeuo pipefail

PROJECT_DIR="/home/ubuntu/minhazul-portfolio"
SERVICE_NAME="minhazul-portfolio.service"

echo "Starting deployment..."

cd "$PROJECT_DIR"

echo "Pulling latest code..."
git pull --ff-only

echo "Installing dependencies..."
npm ci

echo "Running database deployment..."
npm run db:deploy

echo "Building the application..."
npm run build

echo "Preparing Next.js standalone build..."
mkdir -p .next/standalone/.next

if [ -d "public" ]; then
    rm -rf .next/standalone/public
    cp -a public .next/standalone/
fi

rm -rf .next/standalone/.next/static
cp -a .next/static .next/standalone/.next/

echo "Restarting application service..."
sudo systemctl restart "$SERVICE_NAME"

echo "Checking application service..."
sudo systemctl status "$SERVICE_NAME" --no-pager

echo "Deployment completed successfully."
