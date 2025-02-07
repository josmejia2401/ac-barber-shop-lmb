#!/bin/bash

echo "INASTALACIÓN DE COMPONENTES EN PROD"

BASEDIR=${PWD}
echo "Script location: ${BASEDIR}"

echo "Listado de carpetas node_modules a eliminar"
find . -name 'node_modules' -type d -prune

echo "Iniciando eliminación"
find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +

echo "############ Iniciando instalacion lambdas/auth ############"
for i in $(ls -d lambdas/auth/*); do 
    echo "Entrando a ${i%%/}"
    cd ${i%%/}
    echo "Instanando en ${i%%/}"
    npm install
    echo "Regresando a $BASEDIR"
    cd $BASEDIR
done

echo "############ Iniciando instalacion lambdas/core ############"
for i in $(ls -d lambdas/core/*); do 
    echo "Entrando a ${i%%/}"
    cd ${i%%/}
    echo "Instanando en ${i%%/}"
    npm install
    echo "Regresando a $BASEDIR"
    cd $BASEDIR
done

echo "############ fin ##############"
