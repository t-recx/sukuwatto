#!/bin/sh

rm -rf www/frontend/*

mkdir -p www/frontend

cp -a dist/frontend/* www/frontend/