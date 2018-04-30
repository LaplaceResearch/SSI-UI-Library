#!/bin/bash

CDN=deployer@165.227.146.133
PROJECT=laplaceresearch/ssi-ui-library

CDFOLDER="cd /home/deployer/cdn/$PROJECT"
PULL="git pull"
NGINX="sudo service nginx reload"


if [ "$1" = "pack" ]; then
    ssh -t $CDN "$CDFOLDER && $PULL"
fi

if [ "$1" = "nginx" ]; then
    ssh -t $CDN "$CDFOLDER && $PULL && $NGINX"
fi

if [ -z "$1" ]; then
    echo
    echo "Usage: "
    echo
    echo "./deploy.sh pack                      Deploy whole package."
    echo "./deploy.sh nginx                     Deploy whole package and reload nginx."
    echo
fi