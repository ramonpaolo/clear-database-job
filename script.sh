if [ "$1" = "down" ]; then
    docker-compose -f docker-compose.yml down
else
    docker-compose -f docker-compose.yml down &&
    docker-compose -f docker-compose.yml build $1 &&
    docker-compose --compatibility -f docker-compose.yml up -d $1 mongo
fi
