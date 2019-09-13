#!/bin/bash

## Image buildings
currentDir=$PWD
echo -e "\e[33m-------- Building NGINX+ image --------\e[0m"
cd $currentDir/nginx
docker image build . -t ddos-mitigation-nginx:1.0.0
echo -e "\e[1m\e[34m-------- NGINX backend image built succesfuly --------\e[0m"
echo ""

echo -e "\e[33m-------- Building python service image --------\e[0m"
cd $currentDir/backend
docker image build . -t python-backend:1.0.0
echo -e "\e[1m\e[34m-------- Python backend image built succesfuly --------\e[0m"
echo ""

echo -e "\e[33m-------- Building zombie image --------\e[0m"
cd $currentDir/zombie
docker image build . -t zombie:1.0.0
echo -e "\e[1m\e[34m-------- Zombie image built succesfuly --------\e[0m"
echo ""

cd $currentDir

docker-compose up

#docker container run --name zombie2 --network ddos-nginx-net zombie:1.0.0
