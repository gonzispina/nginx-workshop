#!/bin/bash

## Image buildings
currentDir=$PWD
echo -e "\e[33m-------- Building NGINX+ image --------\e[0m"
cd $currentDir/nginx
docker image build . -t scaler-nginx:1.0.0
echo -e "\e[1m\e[34m-------- NGINX backend image built succesfuly --------\e[0m"
echo ""

echo -e "\e[33m-------- Building python service image --------\e[0m"
cd $currentDir/backend
docker image build . -t python-backend:1.0.0
echo -e "\e[1m\e[34m-------- Python backend image built succesfuly --------\e[0m"
echo ""

cd $currentDir

## Init the swarm
echo -e "\e[33m-------- Initializing Swarm --------\e[0m"
docker swarm leave -f
docker swarm init
echo -e "\e[1m\e[34m-------- Swarm started --------\e[0m"
echo ""

## Create the network
echo -e "\e[33m-------- Creating overlay network --------\e[0m"
docker network rm pynet
docker network create -d overlay pynet
echo -e "\e[1m\e[34m-------- Network created --------\e[0m"
echo ""

## Services creation
echo -e "\e[33m-------- Initializing services --------\e[0m"
docker service create --name backend-service --replicas 5 --network pynet --endpoint-mode dnsrr python-backend:1.0.0

docker service create --name scaler-nginx --replicas 1 -p 80:80 -p 443:443 -p 8080:8080 -p 2379:2379 --network pynet scaler-nginx:1.0.0
echo -e "\e[1m\e[34m-------- Services Started --------\e[0m"
echo ""
