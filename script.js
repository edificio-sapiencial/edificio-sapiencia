/* =========================================================
   IMPORTACIONES
========================================================= */

import * as THREE from "three";

import {
    GLTFLoader
} from "three/addons/loaders/GLTFLoader.js";

import {
    DRACOLoader
} from "three/addons/loaders/DRACOLoader.js";

import {
    OrbitControls
} from "three/addons/controls/OrbitControls.js";


/* =========================================================
   CONTENEDOR
========================================================= */

const contenedor =
    document.getElementById("modelo-3d");

const visor =
    document.getElementById("visor-3d");


/* =========================================================
   BOTONES
========================================================= */

const botonRecorrido =
    document.getElementById("boton-recorrido") ||
    document.querySelector(".recorrido");

const estadoRecorrido =
    document.getElementById("estado-recorrido");

const botonMapa =
    document.getElementById("boton-mapa");

const ventanaUbicacion =
    document.getElementById("ventana-ubicacion");

const cerrarUbicacion =
    document.getElementById("cerrar-ubicacion");

const botonPantallaCompleta =
    document.getElementById("boton-pantalla-completa") ||
    document.querySelector(".pantalla-completa");


/* =========================================================
   BOTÓN RECORRIDO CINEMATOGRÁFICO
========================================================= */

const botonCinematico =
    document.getElementById("boton-cinematico");


/* =========================================================
   ESCENA
========================================================= */

const escena =
    new THREE.Scene();

escena.background = null;


/* =========================================================
   CÁMARA
========================================================= */

const camara =
    new THREE.PerspectiveCamera(
        45,
        contenedor.clientWidth /
        contenedor.clientHeight,
        0.01,
        10000
    );


/* =========================================================
   RENDERIZADOR
========================================================= */

const renderizador =
    new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

renderizador.setSize(
    contenedor.clientWidth,
    contenedor.clientHeight
);

renderizador.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderizador.outputColorSpace =
    THREE.SRGBColorSpace;

contenedor.appendChild(
    renderizador.domElement
);


/* =========================================================
   ILUMINACIÓN
========================================================= */

const luzAmbiente =
    new THREE.AmbientLight(
        0xffffff,
        2
    );

escena.add(
    luzAmbiente
);


const luzPrincipal =
    new THREE.DirectionalLight(
        0xffffff,
        1
    );

luzPrincipal.position.set(
    10,
    10,
    10
);

escena.add(
    luzPrincipal
);


/* =========================================================
   CONTROLES
========================================================= */

const controles =
    new OrbitControls(
        camara,
        renderizador.domElement
    );

controles.enableDamping =
    true;

controles.dampingFactor =
    0.05;

controles.enableZoom =
    true;

controles.enablePan =
    true;


/* =========================================================
   ROTACIÓN AUTOMÁTICA
========================================================= */

controles.autoRotate =
    true;

controles.autoRotateSpeed =
    0.5;


/* =========================================================
   VARIABLES
========================================================= */

let edificio = null;

let puntoPuerta = null;

let enfocandoPuerta = false;

let objetivoCamara =
    new THREE.Vector3();

let objetivoVista =
    new THREE.Vector3();


/* =========================================================
   VARIABLES DEL RECORRIDO
========================================================= */

let haciendoRecorrido =
    false;

let tiempoRecorrido =
    0;

let duracionRecorrido =
    16;

let recorridoPosiciones = [];

let recorridoObjetivos = [];


/* =========================================================
   ACTUALIZAR ESTADO DEL RECORRIDO
========================================================= */

function actualizarEstadoRecorrido(
    activo
) {

    if (estadoRecorrido) {

        estadoRecorrido.textContent =
            activo
                ? "Activado"
                : "Pausado";

    }


    if (botonRecorrido) {

        const icono =
            botonRecorrido.querySelector(
                ".icono-play"
            );

        if (icono) {

            icono.textContent =
                activo
                    ? "▶"
                    : "Ⅱ";

        }

    }

}


/* =========================================================
   BOTÓN ROTACIÓN
========================================================= */

if (botonRecorrido) {

    botonRecorrido.addEventListener(
        "click",
        function() {

            if (haciendoRecorrido) {
                return;
            }

            controles.autoRotate =
                !controles.autoRotate;

            actualizarEstadoRecorrido(
                controles.autoRotate
            );

        }
    );

}


/* =========================================================
   TECLA ESPACIO
========================================================= */

document.addEventListener(
    "keydown",
    function(evento) {

        if (
            evento.code !== "Space"
        ) {
            return;
        }

        evento.preventDefault();


        if (haciendoRecorrido) {
            return;
        }


        controles.autoRotate =
            !controles.autoRotate;


        actualizarEstadoRecorrido(
            controles.autoRotate
        );


        console.log(
            controles.autoRotate
                ? "ROTACIÓN ACTIVADA"
                : "ROTACIÓN PAUSADA"
        );

    }
);


/* =========================================================
   BOTÓN UBICACIÓN
========================================================= */

if (botonMapa) {

    botonMapa.addEventListener(
        "click",
        function() {

            if (
                ventanaUbicacion
            ) {

                ventanaUbicacion.classList.toggle(
                    "activa"
                );

            }

        }
    );

}


/* =========================================================
   CERRAR UBICACIÓN
========================================================= */

if (cerrarUbicacion) {

    cerrarUbicacion.addEventListener(
        "click",
        function() {

            if (
                ventanaUbicacion
            ) {

                ventanaUbicacion.classList.remove(
                    "activa"
                );

            }

        }
    );

}


/* =========================================================
   CERRAR UBICACIÓN AL HACER CLICK AFUERA
========================================================= */

document.addEventListener(
    "click",
    function(evento) {

        if (
            !ventanaUbicacion ||
            !botonMapa
        ) {
            return;
        }


        if (
            ventanaUbicacion.classList.contains(
                "activa"
            ) &&
            !ventanaUbicacion.contains(
                evento.target
            ) &&
            !botonMapa.contains(
                evento.target
            )
        ) {

            ventanaUbicacion.classList.remove(
                "activa"
            );

        }

    }
);


/* =========================================================
   PANTALLA COMPLETA
========================================================= */

if (
    botonPantallaCompleta
) {

    botonPantallaCompleta.addEventListener(
        "click",
        async function() {

            try {

                if (
                    !document.fullscreenElement
                ) {

                    if (
                        visor.requestFullscreen
                    ) {

                        await visor.requestFullscreen();

                    }

                    else if (
                        visor.webkitRequestFullscreen
                    ) {

                        visor.webkitRequestFullscreen();

                    }

                }

                else {

                    if (
                        document.exitFullscreen
                    ) {

                        await document.exitFullscreen();

                    }

                    else if (
                        document.webkitExitFullscreen
                    ) {

                        document.webkitExitFullscreen();

                    }

                }

            }

            catch (error) {

                console.error(
                    "Error pantalla completa:",
                    error
                );

            }

        }
    );

}


/* =========================================================
   CARGAR MODELO
========================================================= */

const loader =
    new GLTFLoader();


/* =========================================================
   DRACO
========================================================= */

const dracoLoader =
    new DRACOLoader();

dracoLoader.setDecoderPath(
    "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/libs/draco/"
);

loader.setDRACOLoader(
    dracoLoader
);


/* =========================================================
   CARGAR GLB
========================================================= */

loader.load(

    "./edificiofinal.glb",

    function(gltf) {

        console.log(
            "EDIFICIO CARGADO"
        );


        edificio =
            gltf.scene;


        escena.add(
            edificio
        );


        /* ==========================================
           CONFIGURAR MODELO
        ========================================== */

        edificio.traverse(
            function(objeto) {

                if (
                    objeto.isMesh
                ) {

                    objeto.castShadow =
                        false;

                    objeto.receiveShadow =
                        false;


                    if (
                        objeto.material
                    ) {

                        objeto.material.needsUpdate =
                            true;

                    }

                }

            }
        );


        /* ==========================================
           CENTRAR EDIFICIO
        ========================================== */

        const caja =
            new THREE.Box3()
                .setFromObject(
                    edificio
                );


        const centro =
            caja.getCenter(
                new THREE.Vector3()
            );


        edificio.position.sub(
            centro
        );


        /* ==========================================
           BUSCAR PUERTA
        ========================================== */

        edificio.traverse(
            function(objeto) {

                console.log(
                    "OBJETO:",
                    objeto.name,
                    objeto.type
                );


                if (
                    objeto.name &&
                    objeto.name
                        .trim()
                        .toUpperCase() ===
                    "PUERTA"
                ) {

                    puntoPuerta =
                        objeto;


                    console.log(
                        "PUERTA ENCONTRADA:",
                        objeto.name
                    );

                }

            }
        );


        /* ==========================================
           MEDIDAS DEL EDIFICIO
        ========================================== */

        const cajaNueva =
            new THREE.Box3()
                .setFromObject(
                    edificio
                );


        const tamaño =
            cajaNueva.getSize(
                new THREE.Vector3()
            );


        const mayor =
            Math.max(
                tamaño.x,
                tamaño.y,
                tamaño.z
            );


        /* ==========================================
           CÁMARA INICIAL
           
           ANTES:
           mayor * 0.85

           AHORA:
           mayor * 0.62
           
           Esto hace que la cámara empiece
           bastante más cerca del edificio.
        ========================================== */

        const distanciaInicial =
            mayor * 0.62;


        camara.position.set(
            distanciaInicial,
            distanciaInicial * 0.38,
            distanciaInicial
        );


        /* ==========================================
           OBJETIVO INICIAL
        ========================================== */

        controles.target.set(
            0,
            mayor * 0.05,
            0
        );


        /* ==========================================
           ZOOM MANUAL
        ========================================== */

        controles.minDistance =
            mayor * 0.10;

        controles.maxDistance =
            mayor * 3;


        controles.update();


        /* ==========================================
           CREAR RECORRIDO
        ========================================== */

        crearRecorridoCinematico(
            mayor
        );


        actualizarEstadoRecorrido(
            controles.autoRotate
        );


        console.log(
            "MODELO LISTO"
        );

    },


    /* ==========================================
       PROGRESO
    ========================================== */

    function(xhr) {

        if (
            xhr.total
        ) {

            console.log(
                "Cargando:",
                (
                    xhr.loaded /
                    xhr.total *
                    100
                ).toFixed(0) +
                "%"
            );

        }

    },


    /* ==========================================
       ERROR
    ========================================== */

    function(error) {

        console.error(
            "ERROR:",
            error
        );

    }

);


/* =========================================================
   CREAR RECORRIDO CINEMATOGRÁFICO
========================================================= */

function crearRecorridoCinematico(
    mayor
) {

    const altura =
        mayor * 0.32;

    const distancia =
        mayor * 0.72;


    recorridoPosiciones = [

        /* PUNTO 1 */
        new THREE.Vector3(
            distancia,
            altura,
            distancia
        ),

        /* PUNTO 2 */
        new THREE.Vector3(
            -distancia,
            altura * 0.9,
            distancia * 0.8
        ),

        /* PUNTO 3 */
        new THREE.Vector3(
            -distancia * 0.95,
            altura * 1.45,
            -distancia * 0.65
        ),

        /* PUNTO 4 */
        new THREE.Vector3(
            distancia * 0.75,
            altura * 1.15,
            -distancia
        ),

        /* PUNTO 5 */
        new THREE.Vector3(
            distancia,
            altura,
            distancia
        )

    ];


    recorridoObjetivos = [

        /* MIRADA 1 */
        new THREE.Vector3(
            0,
            mayor * 0.05,
            0
        ),

        /* MIRADA 2 */
        new THREE.Vector3(
            0,
            mayor * 0.12,
            0
        ),

        /* MIRADA 3 */
        new THREE.Vector3(
            0,
            mayor * 0.18,
            0
        ),

        /* MIRADA 4 */
        new THREE.Vector3(
            0,
            mayor * 0.10,
            0
        ),

        /* MIRADA FINAL */
        new THREE.Vector3(
            0,
            mayor * 0.05,
            0
        )

    ];

}


/* =========================================================
   BOTÓN RECORRIDO CINEMATOGRÁFICO
========================================================= */

if (botonCinematico) {

    botonCinematico.addEventListener(
        "click",
        function() {

            if (haciendoRecorrido) {

                detenerRecorridoCinematico();

            }

            else {

                iniciarRecorridoCinematico();

            }

        }
    );

}


/* =========================================================
   INICIAR RECORRIDO
========================================================= */

function iniciarRecorridoCinematico() {

    if (
        !edificio
    ) {

        console.log(
            "El edificio todavía no está cargado."
        );

        return;

    }


    if (
        haciendoRecorrido
    ) {

        return;

    }


    if (
        recorridoPosiciones.length === 0
    ) {

        console.log(
            "El recorrido todavía no está preparado."
        );

        return;

    }


    console.log(
        "INICIANDO RECORRIDO CINEMATOGRÁFICO"
    );


    controles.autoRotate =
        false;

    actualizarEstadoRecorrido(
        false
    );


    enfocandoPuerta =
        false;


    controles.enabled =
        false;


    haciendoRecorrido =
        true;


    tiempoRecorrido =
        0;


    if (botonCinematico) {

        botonCinematico.textContent =
            "⏹ Detener recorrido";

    }

}


/* =========================================================
   DETENER RECORRIDO
========================================================= */

function detenerRecorridoCinematico() {

    haciendoRecorrido =
        false;


    controles.enabled =
        true;


    controles.autoRotate =
        false;


    actualizarEstadoRecorrido(
        false
    );


    if (botonCinematico) {

        botonCinematico.textContent =
            "🎬 Recorrido";

    }


    controles.update();


    console.log(
        "RECORRIDO DETENIDO"
    );

}


/* =========================================================
   DOBLE CLICK
========================================================= */

contenedor.addEventListener(
    "dblclick",
    function() {

        console.log(
            "DOBLE CLICK DETECTADO"
        );


        if (
            haciendoRecorrido
        ) {

            return;

        }


        if (
            !edificio
        ) {

            console.log(
                "El edificio todavía no está cargado."
            );

            return;

        }


        if (
            !puntoPuerta
        ) {

            console.log(
                "No se encontró PUERTA."
            );

            return;

        }


        enfocarPuerta();

    }
);


/* =========================================================
   ENFOCAR PUERTA
========================================================= */

function enfocarPuerta() {

    console.log(
        "ENFOCANDO PUERTA..."
    );


    controles.autoRotate =
        false;


    actualizarEstadoRecorrido(
        false
    );


    /* ==========================================
       CENTRO DE LA PUERTA
    ========================================== */

    const cajaPuerta =
        new THREE.Box3()
            .setFromObject(
                puntoPuerta
            );


    const centroPuerta =
        cajaPuerta.getCenter(
            new THREE.Vector3()
        );


    /* ==========================================
       CENTRO DEL EDIFICIO
    ========================================== */

    const cajaEdificio =
        new THREE.Box3()
            .setFromObject(
                edificio
            );


    const centroEdificio =
        cajaEdificio.getCenter(
            new THREE.Vector3()
        );


    /* ==========================================
       ORIENTACIÓN DE LA PUERTA
    ========================================== */

    const quaternionPuerta =
        new THREE.Quaternion();


    puntoPuerta.getWorldQuaternion(
        quaternionPuerta
    );


    /* ==========================================
       POSIBLES EJES
    ========================================== */

    const normalX =
        new THREE.Vector3(
            1,
            0,
            0
        )
            .applyQuaternion(
                quaternionPuerta
            )
            .normalize();


    const normalZ =
        new THREE.Vector3(
            0,
            0,
            1
        )
            .applyQuaternion(
                quaternionPuerta
            )
            .normalize();


    /* ==========================================
       DIRECCIÓN HACIA AFUERA
    ========================================== */

    const haciaAfuera =
        new THREE.Vector3()
            .subVectors(
                centroPuerta,
                centroEdificio
            );


    haciaAfuera.y =
        0;


    haciaAfuera.normalize();


    /* ==========================================
       ELEGIR NORMAL
    ========================================== */

    let direccionPuerta;


    if (
        Math.abs(
            normalX.dot(
                haciaAfuera
            )
        )
        >
        Math.abs(
            normalZ.dot(
                haciaAfuera
            )
        )
    ) {

        direccionPuerta =
            normalX.clone();

    }

    else {

        direccionPuerta =
            normalZ.clone();

    }


    /* ==========================================
       ASEGURAR DIRECCIÓN
    ========================================== */

    if (
        direccionPuerta.dot(
            haciaAfuera
        ) < 0
    ) {

        direccionPuerta.negate();

    }


    direccionPuerta.y =
        0;


    direccionPuerta.normalize();


    /* ==========================================
       DISTANCIA A LA PUERTA
    ========================================== */

    const distancia =
        4;


    /* ==========================================
       POSICIÓN CÁMARA
    ========================================== */

    objetivoCamara =
        centroPuerta.clone();


    objetivoCamara.add(
        direccionPuerta
            .clone()
            .multiplyScalar(
                distancia
            )
    );


    /* ==========================================
       ALTURA
    ========================================== */

    objetivoCamara.y =
        centroPuerta.y + 0.45;


    /* ==========================================
       PUNTO DE MIRADA
    ========================================== */

    objetivoVista =
        centroPuerta.clone();


    /* ==========================================
       INICIAR MOVIMIENTO
    ========================================== */

    enfocandoPuerta =
        true;


    controles.enabled =
        false;


    console.log(
        "CAMARA ENFOCANDO PUERTA"
    );

}


/* =========================================================
   INTERPOLACIÓN SUAVE
========================================================= */

function suavizar(
    valor
) {

    return (
        valor *
        valor *
        (
            3 -
            2 *
            valor
        )
    );

}


/* =========================================================
   ANIMACIÓN DEL RECORRIDO
========================================================= */

function animarRecorrido(
    delta
) {

    if (
        !haciendoRecorrido
    ) {

        return;

    }


    tiempoRecorrido +=
        delta;


    /* ==========================================
       CALCULAR PROGRESO
    ========================================== */

    let progreso =
        tiempoRecorrido /
        duracionRecorrido;


    if (
        progreso >= 1
    ) {

        progreso =
            1;

    }


    /* ==========================================
       CANTIDAD DE TRAMOS
    ========================================== */

    const cantidadTramos =
        recorridoPosiciones.length -
        1;


    const progresoTotal =
        progreso *
        cantidadTramos;


    let tramo =
        Math.floor(
            progresoTotal
        );


    if (
        tramo >= cantidadTramos
    ) {

        tramo =
            cantidadTramos - 1;

    }


    let progresoTramo =
        progresoTotal -
        tramo;


    progresoTramo =
        suavizar(
            progresoTramo
        );


    /* ==========================================
       POSICIÓN
    ========================================== */

    const posicionA =
        recorridoPosiciones[
            tramo
        ];


    const posicionB =
        recorridoPosiciones[
            tramo + 1
        ];


    const nuevaPosicion =
        new THREE.Vector3();


    nuevaPosicion.lerpVectors(
        posicionA,
        posicionB,
        progresoTramo
    );


    camara.position.copy(
        nuevaPosicion
    );


    /* ==========================================
       OBJETIVO
    ========================================== */

    const objetivoA =
        recorridoObjetivos[
            tramo
        ];


    const objetivoB =
        recorridoObjetivos[
            tramo + 1
        ];


    const nuevoObjetivo =
        new THREE.Vector3();


    nuevoObjetivo.lerpVectors(
        objetivoA,
        objetivoB,
        progresoTramo
    );


    controles.target.copy(
        nuevoObjetivo
    );


    controles.update();


    /* ==========================================
       FINALIZAR
    ========================================== */

    if (
        progreso >= 1
    ) {

        haciendoRecorrido =
            false;


        controles.enabled =
            true;


        controles.autoRotate =
            false;


        actualizarEstadoRecorrido(
            false
        );


        if (botonCinematico) {

            botonCinematico.textContent =
                "🎬 Recorrido";

        }


        console.log(
            "RECORRIDO CINEMATOGRÁFICO TERMINADO"
        );

    }

}


/* =========================================================
   RELOJ
========================================================= */

const reloj =
    new THREE.Clock();


/* =========================================================
   ANIMACIÓN PRINCIPAL
========================================================= */

function animar() {

    requestAnimationFrame(
        animar
    );


    const delta =
        reloj.getDelta();


    /* ==========================================
       RECORRIDO CINEMATOGRÁFICO
    ========================================== */

    if (
        haciendoRecorrido
    ) {

        animarRecorrido(
            delta
        );

    }


    /* ==========================================
       MOVIMIENTO HACIA LA PUERTA
    ========================================== */

    if (
        enfocandoPuerta
    ) {

        camara.position.lerp(
            objetivoCamara,
            0.035
        );


        controles.target.lerp(
            objetivoVista,
            0.035
        );


        const distanciaCamara =
            camara.position.distanceTo(
                objetivoCamara
            );


        const distanciaObjetivo =
            controles.target.distanceTo(
                objetivoVista
            );


        /* ==========================================
           TERMINAR MOVIMIENTO
        ========================================== */

        if (
            distanciaCamara < 0.03 &&
            distanciaObjetivo < 0.03
        ) {

            camara.position.copy(
                objetivoCamara
            );


            controles.target.copy(
                objetivoVista
            );


            enfocandoPuerta =
                false;


            controles.enabled =
                true;


            controles.autoRotate =
                false;


            actualizarEstadoRecorrido(
                false
            );


            controles.update();


            console.log(
                "PUERTA ENFOCADA - CONTROLES ACTIVADOS"
            );

        }

    }


    /* ==========================================
       CONTROLES
    ========================================== */

    controles.update();


    /* ==========================================
       RENDER
    ========================================== */

    renderizador.render(
        escena,
        camara
    );

}


animar();


/* =========================================================
   REDIMENSIONAR
========================================================= */

window.addEventListener(
    "resize",
    function() {

        const ancho =
            contenedor.clientWidth;


        const alto =
            contenedor.clientHeight;


        if (
            alto === 0
        ) {

            return;

        }


        camara.aspect =
            ancho / alto;


        camara.updateProjectionMatrix();


        renderizador.setSize(
            ancho,
            alto
        );

    }
);