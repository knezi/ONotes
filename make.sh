#!/bin/env sh
npm install
mkdir build -p
cp src/* build/ -R
cp node_modules/angular/angular.min.js build/js/lib/
cp node_modules/angular-route/angular-route.min.js build/js/lib
