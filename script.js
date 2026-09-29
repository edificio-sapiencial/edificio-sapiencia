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


// ==========================================
// CONTENEDOR
// ==========================================

const contenedor =
    document.getElementById("modelo-3d");

const visor =
    document.getElementById("visor-3d");


// ==========================================
// BOTONES
// ==========================================

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


// ==========================================
// ESCENA
// ==========================================

const escena =
    new THREE.Scene();


// Mantener transparente para
// mostrar el fondo de Medellín
escena.background = null;


// ==========================================
// CÁMARA
// ==========================================

const camara =
    new THREE.PerspectiveCamera(
        45,
        contenedor.clientWidth /
        contenedor.clientHeight,
        0.01,
        10000
    );


// ==========================================
// RENDERIZADOR
// ==========================================

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


// ==========================================
// ILUMINACIÓN
// ==========================================

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


// ==========================================
// CONTROLES
// ==========================================

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


// ROTACIÓN AUTOMÁTICA

controles.autoRotate =
    true;

controles.autoRotateSpeed =
    0.5;


// ==========================================
// VARIABLES
// ==========================================

let edificio = null;

let puntoPuerta = null;

let enfocandoPuerta = false;

let objetivoCamara =
    new THREE.Vector3();

let objetivoVista =
    new THREE.Vector3();


// ==========================================
// ACTUALIZAR ESTADO DEL RECORRIDO
// ==========================================

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


// ==========================================
// BOTÓN RECORRIDO
// ==========================================

if (botonRecorrido) {

    botonRecorrido.addEventListener(
        "click",
        function() {

            controles.autoRotate =
                !controles.autoRotate;

            actualizarEstadoRecorrido(
                controles.autoRotate
            );

        }
    );

}


// ==========================================
// TECLA ESPACIO
// PAUSAR / REANUDAR ROTACIÓN
// ==========================================

document.addEventListener(
    "keydown",
    function(evento) {

        if (
            evento.code !== "Space"
        ) {
            return;
        }


        // Evitar que la página
        // se desplace hacia abajo

        evento.preventDefault();


        // Pausar o continuar

        controles.autoRotate =
            !controles.autoRotate;


        // Actualizar indicador

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


// ==========================================
// BOTÓN UBICACIÓN
// ==========================================

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


// ==========================================
// CERRAR UBICACIÓN
// ==========================================

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


// ==========================================
// CERRAR UBICACIÓN AL HACER CLICK AFUERA
// ==========================================

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


// ==========================================
// PANTALLA COMPLETA
// ==========================================

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


// ==========================================
// CARGAR MODELO
// ==========================================

const loader =
    new GLTFLoader();


// ==========================================
// DRACO
// ==========================================

const dracoLoader =
    new DRACOLoader();

dracoLoader.setDecoderPath(
    "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/libs/draco/"
);

loader.setDRACOLoader(
    dracoLoader
);


// ==========================================
// CARGAR GLB
// ==========================================

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


        // ==================================
        // CONFIGURAR MODELO
        // ==================================

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


        // ==================================
        // CENTRAR EDIFICIO
        // ==================================

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


        // ==================================
        // BUSCAR PUERTA
        // ==================================

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


        // ==================================
        // MEDIDAS DEL EDIFICIO
        // ==================================

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


        // ==================================
        // CÁMARA INICIAL
        // ==================================

        const distanciaInicial =
            mayor * 0.85;


        camara.position.set(
            distanciaInicial,
            distanciaInicial * 0.38,
            distanciaInicial
        );


        // ==================================
        // OBJETIVO INICIAL
        // ==================================

        controles.target.set(
            0,
            mayor * 0.05,
            0
        );


        // ==================================
        // ZOOM MANUAL
        // ==================================

        controles.minDistance =
            mayor * 0.10;


        controles.maxDistance =
            mayor * 3;


        controles.update();


        // Actualizar indicador

        actualizarEstadoRecorrido(
            controles.autoRotate
        );


        console.log(
            "MODELO LISTO"
        );

    },


    // ==================================
    // PROGRESO
    // ==================================

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


    // ==================================
    // ERROR
    // ==================================

    function(error) {

        console.error(
            "ERROR:",
            error
        );

    }

);


// ==========================================
// DOBLE CLICK
// ==========================================

contenedor.addEventListener(
    "dblclick",
    function() {

        console.log(
            "DOBLE CLICK DETECTADO"
        );


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


// ==========================================
// ENFOCAR PUERTA
// ==========================================

function enfocarPuerta() {

    console.log(
        "ENFOCANDO PUERTA..."
    );


    // ==================================
    // DETENER ROTACIÓN AUTOMÁTICA
    // ==================================

    controles.autoRotate =
        false;


    actualizarEstadoRecorrido(
        false
    );


    // ==================================
    // CENTRO DE LA PUERTA
    // ==================================

    const cajaPuerta =
        new THREE.Box3()
            .setFromObject(
                puntoPuerta
            );


    const centroPuerta =
        cajaPuerta.getCenter(
            new THREE.Vector3()
        );


    // ==================================
    // CENTRO DEL EDIFICIO
    // ==================================

    const cajaEdificio =
        new THREE.Box3()
            .setFromObject(
                edificio
            );


    const centroEdificio =
        cajaEdificio.getCenter(
            new THREE.Vector3()
        );


    // ==================================
    // ORIENTACIÓN DE LA PUERTA
    // ==================================

    const quaternionPuerta =
        new THREE.Quaternion();


    puntoPuerta.getWorldQuaternion(
        quaternionPuerta
    );


    // ==================================
    // POSIBLES EJES DE LA PUERTA
    // ==================================

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


    // ==================================
    // DIRECCIÓN HACIA AFUERA
    // ==================================

    const haciaAfuera =
        new THREE.Vector3()
            .subVectors(
                centroPuerta,
                centroEdificio
            );


    haciaAfuera.y =
        0;


    haciaAfuera.normalize();


    // ==================================
    // ELEGIR NORMAL CORRECTA
    // ==================================

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


    // ==================================
    // ASEGURAR QUE APUNTE HACIA AFUERA
    // ==================================

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


    // ==================================
    // DISTANCIA FIJA
    // ==================================

    const distancia =
        4;


    // ==================================
    // POSICIÓN DE LA CÁMARA
    // ==================================

    objetivoCamara =
        centroPuerta.clone();


    objetivoCamara.add(
        direccionPuerta
            .clone()
            .multiplyScalar(
                distancia
            )
    );


    // ==================================
    // ALTURA
    // ==================================

    objetivoCamara.y =
        centroPuerta.y + 0.45;


    // ==================================
    // PUNTO DE MIRADA
    // ==================================

    objetivoVista =
        centroPuerta.clone();


    // ==================================
    // INICIAR MOVIMIENTO
    // ==================================

    enfocandoPuerta =
        true;


    controles.enabled =
        false;


    console.log(
        "CAMARA ENFOCANDO PUERTA"
    );

}


// ==========================================
// ANIMACIÓN
// ==========================================

function animar() {

    requestAnimationFrame(
        animar
    );


    // ==================================
    // MOVIMIENTO HACIA LA PUERTA
    // ==================================

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


        // ==================================
        // TERMINAR MOVIMIENTO
        // ==================================

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


            // ==================================
            // DEVOLVER CONTROLES
            // ==================================

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


    // ==================================
    // CONTROLES
    // ==================================

    controles.update();


    // ==================================
    // RENDER
    // ==================================

    renderizador.render(
        escena,
        camara
    );

}


animar();


// ==========================================
// REDIMENSIONAR
// ==========================================

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