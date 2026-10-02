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

controles.autoRotate =
    true;

controles.autoRotateSpeed =
    0.5;


/* =========================================================
   VARIABLES DEL EDIFICIO
========================================================= */

let edificio = null;

let puntoPuerta = null;


/* =========================================================
   VARIABLES DE ENFOQUE DE PUERTA
========================================================= */

let enfocandoPuerta =
    false;

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
    22;

let recorridoPosiciones = [];

let recorridoObjetivos = [];


/* =========================================================
   VARIABLES DE SEGURIDAD
========================================================= */

let tamañoEdificio =
    new THREE.Vector3();

let centroEdificio =
    new THREE.Vector3();

let distanciaMinimaEdificio =
    1;


/* =========================================================
   MOVIMIENTO WASD
========================================================= */

const teclasMovimiento = {

    w: false,
    a: false,
    s: false,
    d: false,

    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false

};


/* =========================================================
   VELOCIDAD DEL MOVIMIENTO
========================================================= */

const velocidadMaxima =
    0.055;

const aceleracion =
    0.0035;

const desaceleracion =
    0.006;


/* =========================================================
   VELOCIDAD ACTUAL
========================================================= */

const velocidadMovimiento =
    new THREE.Vector3(
        0,
        0,
        0
    );


/* =========================================================
   ESTADO RECORRIDO
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
   ESPACIO PARA ROTACIÓN
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

    }
);


/* =========================================================
   TECLAS WASD / FLECHAS
========================================================= */

document.addEventListener(
    "keydown",
    function(evento) {

        const tecla =
            evento.key.length === 1
                ? evento.key.toLowerCase()
                : evento.key;

        if (
            Object.prototype.hasOwnProperty.call(
                teclasMovimiento,
                tecla
            )
        ) {

            teclasMovimiento[tecla] =
                true;

            evento.preventDefault();

        }

    }
);


document.addEventListener(
    "keyup",
    function(evento) {

        const tecla =
            evento.key.length === 1
                ? evento.key.toLowerCase()
                : evento.key;

        if (
            Object.prototype.hasOwnProperty.call(
                teclasMovimiento,
                tecla
            )
        ) {

            teclasMovimiento[tecla] =
                false;

            evento.preventDefault();

        }

    }
);


/* =========================================================
   UBICACIÓN
========================================================= */

if (botonMapa) {

    botonMapa.addEventListener(
        "click",
        function() {

            if (ventanaUbicacion) {

                ventanaUbicacion.classList.toggle(
                    "activa"
                );

            }

        }
    );

}


if (cerrarUbicacion) {

    cerrarUbicacion.addEventListener(
        "click",
        function() {

            if (ventanaUbicacion) {

                ventanaUbicacion.classList.remove(
                    "activa"
                );

            }

        }
    );

}


/* =========================================================
   CERRAR UBICACIÓN AFUERA
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
   LOADER
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
   COLOCAR CÁMARA FRENTE A LA ENTRADA
========================================================= */

function colocarCamaraEnEntrada(
    mayor
) {

    /* =====================================================
       SI NO SE ENCUENTRA LA PUERTA
    ===================================================== */

    if (!puntoPuerta) {

        console.warn(
            "No se encontró el objeto PUERTA. Se usará una cámara alternativa."
        );

        const distanciaInicial =
            mayor * 0.40;


        camara.position.set(
            -mayor * 0.08,
            mayor * 0.20,
            distanciaInicial
        );


        controles.target.set(
            0,
            mayor * 0.08,
            0
        );


        controles.update();

        return;

    }


    /* =====================================================
       CAJA DE LA PUERTA
    ===================================================== */

    const cajaPuerta =
        new THREE.Box3()
            .setFromObject(
                puntoPuerta
            );


    const centroPuerta =
        cajaPuerta.getCenter(
            new THREE.Vector3()
        );


    const tamañoPuerta =
        cajaPuerta.getSize(
            new THREE.Vector3()
        );


    /* =====================================================
       CENTRO DEL EDIFICIO
    ===================================================== */

    const cajaEdificio =
        new THREE.Box3()
            .setFromObject(
                edificio
            );


    const centro =
        cajaEdificio.getCenter(
            new THREE.Vector3()
        );


    /* =====================================================
       ROTACIÓN DE LA PUERTA
    ===================================================== */

    const quaternionPuerta =
        new THREE.Quaternion();


    puntoPuerta.getWorldQuaternion(
        quaternionPuerta
    );


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


    /* =====================================================
       DIRECCIÓN HACIA AFUERA
    ===================================================== */

    const haciaAfuera =
        new THREE.Vector3()
            .subVectors(
                centroPuerta,
                centro
            );


    haciaAfuera.y =
        0;


    if (
        haciaAfuera.lengthSq() >
        0.0001
    ) {

        haciaAfuera.normalize();

    }

    else {

        haciaAfuera.set(
            0,
            0,
            1
        );

    }


    /* =====================================================
       DETERMINAR FRENTE DE PUERTA
    ===================================================== */

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


    /* =====================================================
       ASEGURAR QUE APUNTE HACIA AFUERA
    ===================================================== */

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


    /* =====================================================
       DISTANCIA DE LA CÁMARA
    ===================================================== */

    /*
       Distancia suficiente para que se vea
       la entrada completa.
    */

    const distanciaPorPuerta =
        Math.max(
            tamañoPuerta.x,
            tamañoPuerta.z
        ) * 4.0;


    const distanciaPorEdificio =
        mayor * 0.25;


    let distanciaEntrada =
        Math.max(
            distanciaPorPuerta,
            distanciaPorEdificio
        );


    distanciaEntrada =
        Math.min(
            distanciaEntrada,
            mayor * 0.40
        );


    distanciaEntrada =
        Math.max(
            distanciaEntrada,
            mayor * 0.18
        );


    /* =====================================================
       POSICIÓN BASE
    ===================================================== */

    const posicionCamara =
        centroPuerta.clone();


    posicionCamara.add(
        direccionPuerta
            .clone()
            .multiplyScalar(
                distanciaEntrada
            )
    );


    /* =====================================================
       DESPLAZAMIENTO LATERAL
       
       Cámara ligeramente hacia la izquierda.
    ===================================================== */

    const lateral =
        new THREE.Vector3(
            -direccionPuerta.z,
            0,
            direccionPuerta.x
        );


    lateral.normalize();


    posicionCamara.add(
        lateral.multiplyScalar(
            mayor * 0.10
        )
    );


    /* =====================================================
       ALTURA

       Ángulo picado suave.
    ===================================================== */

    posicionCamara.y =
        centroPuerta.y +
        mayor * 0.18;


    /* =====================================================
       OBJETIVO DE LA CÁMARA
    ===================================================== */

    const objetivo =
        centroPuerta.clone();


    objetivo.y =
        centroPuerta.y +
        mayor * 0.02;


    /* =====================================================
       COLOCAR CÁMARA
    ===================================================== */

    camara.position.copy(
        posicionCamara
    );


    controles.target.copy(
        objetivo
    );


    controles.update();


    console.log(
        "CÁMARA INICIAL: FRONTAL + DIAGONAL IZQUIERDA + PICADO SUAVE"
    );


    console.log(
        "Posición:",
        camara.position
    );


    console.log(
        "Objetivo:",
        controles.target
    );

}


/* =========================================================
   CARGAR EDIFICIO
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
           CONFIGURAR MALLAS
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
           NUEVA CAJA
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


        tamañoEdificio =
            tamaño.clone();


        centroEdificio =
            cajaNueva.getCenter(
                new THREE.Vector3()
            );


        const mayor =
            Math.max(
                tamaño.x,
                tamaño.y,
                tamaño.z
            );


        /* ==========================================
           DISTANCIA MÍNIMA
        ========================================== */

        distanciaMinimaEdificio =
            Math.max(
                mayor * 0.18,
                0.5
            );


        /* ==========================================
           CÁMARA INICIAL
        ========================================== */

        /*
           La cámara ya no comienza desde
           una esquina general del edificio.

           Ahora comienza directamente frente
           a la entrada.
        */

        colocarCamaraEnEntrada(
            mayor
        );


        /* ==========================================
           DISTANCIAS ORBIT CONTROLS
        ========================================== */

        controles.minDistance =
            Math.max(
                mayor * 0.10,
                distanciaMinimaEdificio
            );


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


    function(error) {

        console.error(
            "ERROR CARGANDO EDIFICIO:",
            error
        );

    }

);


/* =========================================================
   CREAR RECORRIDO
========================================================= */

function crearRecorridoCinematico(
    mayor
) {

    const altura =
        mayor * 0.30;


    const ancho =
        Math.max(
            tamañoEdificio.x,
            mayor * 0.6
        );


    const profundidad =
        Math.max(
            tamañoEdificio.z,
            mayor * 0.6
        );


    const margen =
        mayor * 0.32;


    const x =
        ancho / 2 +
        margen;


    const z =
        profundidad / 2 +
        margen;


    recorridoPosiciones = [

        /* Frente derecho */

        new THREE.Vector3(
            x,
            altura,
            z * 0.35
        ),


        /* Frente */

        new THREE.Vector3(
            x * 0.55,
            altura,
            z
        ),


        /* Frente izquierdo */

        new THREE.Vector3(
            0,
            altura * 1.02,
            z
        ),


        /* Esquina izquierda */

        new THREE.Vector3(
            -x * 0.55,
            altura,
            z
        ),


        /* Lateral izquierdo */

        new THREE.Vector3(
            -x,
            altura * 0.95,
            z * 0.45
        ),


        /* Lateral izquierdo medio */

        new THREE.Vector3(
            -x,
            altura * 1.05,
            0
        ),


        /* Parte trasera izquierda */

        new THREE.Vector3(
            -x,
            altura * 1.15,
            -z * 0.45
        ),


        /* Parte trasera */

        new THREE.Vector3(
            -x * 0.50,
            altura * 1.20,
            -z
        ),


        /* Parte trasera centro */

        new THREE.Vector3(
            0,
            altura * 1.25,
            -z
        ),


        /* Parte trasera derecha */

        new THREE.Vector3(
            x * 0.50,
            altura * 1.15,
            -z
        ),


        /* Lateral derecho */

        new THREE.Vector3(
            x,
            altura * 1.05,
            -z * 0.45
        ),


        /* Lateral derecho medio */

        new THREE.Vector3(
            x,
            altura * 0.95,
            0
        ),


        /* Regreso */

        new THREE.Vector3(
            x,
            altura,
            z * 0.35
        )

    ];


    /* =====================================================
       OBJETIVOS
    ===================================================== */

    recorridoObjetivos = [];


    for (
        let i = 0;
        i < recorridoPosiciones.length;
        i++
    ) {

        const porcentaje =
            i /
            (
                recorridoPosiciones.length - 1
            );


        const objetivo =
            new THREE.Vector3(
                0,
                mayor *
                (
                    0.05 +
                    porcentaje * 0.08
                ),
                0
            );


        recorridoObjetivos.push(
            objetivo
        );

    }

}


/* =========================================================
   BOTÓN RECORRIDO CINEMATOGRÁFICO
========================================================= */

if (botonCinematico) {

    botonCinematico.addEventListener(
        "click",
        function() {

            if (
                haciendoRecorrido
            ) {

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

        return;

    }


    if (
        recorridoPosiciones.length === 0
    ) {

        return;

    }


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

}


/* =========================================================
   DOBLE CLICK EN EDIFICIO
========================================================= */

contenedor.addEventListener(
    "dblclick",
    function() {

        if (
            haciendoRecorrido
        ) {

            return;

        }


        if (
            !edificio
        ) {

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


    const centroActual =
        cajaEdificio.getCenter(
            new THREE.Vector3()
        );


    /* ==========================================
       ROTACIÓN DE LA PUERTA
    ========================================== */

    const quaternionPuerta =
        new THREE.Quaternion();


    puntoPuerta.getWorldQuaternion(
        quaternionPuerta
    );


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
                centroActual
            );


    haciaAfuera.y =
        0;


    haciaAfuera.normalize();


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
       DISTANCIA
    ========================================== */

    const distancia =
        4;


    /* ==========================================
       POSICIÓN OBJETIVO
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


    objetivoCamara.y =
        centroPuerta.y +
        0.45;


    /* ==========================================
       MIRADA
    ========================================== */

    objetivoVista =
        centroPuerta.clone();


    /* ==========================================
       ACTIVAR ANIMACIÓN
    ========================================== */

    enfocandoPuerta =
        true;


    controles.enabled =
        false;

}


/* =========================================================
   SUAVIZADO
========================================================= */

function suavizar(
    valor
) {

    return (
        valor *
        valor *
        (
            3 -
            2 * valor
        )
    );

}


/* =========================================================
   PROTEGER CÁMARA
========================================================= */

function protegerCamara() {

    if (
        !edificio
    ) {

        return;

    }


    const posicion =
        camara.position.clone();


    posicion.sub(
        centroEdificio
    );


    const distanciaHorizontal =
        Math.sqrt(
            posicion.x *
            posicion.x
            +
            posicion.z *
            posicion.z
        );


    const radioX =
        tamañoEdificio.x / 2;


    const radioZ =
        tamañoEdificio.z / 2;


    const angulo =
        Math.atan2(
            posicion.z,
            posicion.x
        );


    const coseno =
        Math.abs(
            Math.cos(
                angulo
            )
        );


    const seno =
        Math.abs(
            Math.sin(
                angulo
            )
        );


    let radioSeguro;


    if (
        coseno > 0.001 ||
        seno > 0.001
    ) {

        radioSeguro =
            1 /
            (
                coseno /
                Math.max(
                    radioX,
                    0.001
                )
                +
                seno /
                Math.max(
                    radioZ,
                    0.001
                )
            );

    }

    else {

        radioSeguro =
            Math.max(
                radioX,
                radioZ
            );

    }


    /* =====================================================
       MARGEN
    ===================================================== */

    radioSeguro +=
        Math.max(
            tamañoEdificio.x,
            tamañoEdificio.z
        ) *
        0.035;


    /* =====================================================
       SACAR CÁMARA DEL EDIFICIO
    ===================================================== */

    if (
        distanciaHorizontal <
        radioSeguro
    ) {

        const nuevaDistancia =
            radioSeguro;


        if (
            distanciaHorizontal >
            0.001
        ) {

            const factor =
                nuevaDistancia /
                distanciaHorizontal;


            camara.position.x =
                centroEdificio.x +
                posicion.x *
                factor;


            camara.position.z =
                centroEdificio.z +
                posicion.z *
                factor;

        }

        else {

            camara.position.x =
                centroEdificio.x +
                radioSeguro;


            camara.position.z =
                centroEdificio.z;

        }

    }

}


/* =========================================================
   MOVIMIENTO SUAVE WASD
========================================================= */

function moverCamara() {

    if (
        !edificio ||
        haciendoRecorrido ||
        enfocandoPuerta
    ) {

        velocidadMovimiento.multiplyScalar(
            0.80
        );

        return;

    }


    /* ==========================================
       DIRECCIÓN DE LA CÁMARA
    ========================================== */

    const direccion =
        new THREE.Vector3();


    camara.getWorldDirection(
        direccion
    );


    direccion.y =
        0;


    if (
        direccion.lengthSq() >
        0
    ) {

        direccion.normalize();

    }


    /* ==========================================
       DIRECCIÓN LATERAL
    ========================================== */

    const lateral =
        new THREE.Vector3();


    lateral.crossVectors(
        direccion,
        camara.up
    );


    lateral.normalize();


    /* ==========================================
       DIRECCIÓN DESEADA
    ========================================== */

    const direccionDeseada =
        new THREE.Vector3();


    let hayMovimiento =
        false;


    /* ==========================================
       ADELANTE
    ========================================== */

    if (
        teclasMovimiento.w ||
        teclasMovimiento.ArrowUp
    ) {

        direccionDeseada.add(
            direccion
        );

        hayMovimiento =
            true;

    }


    /* ==========================================
       ATRÁS
    ========================================== */

    if (
        teclasMovimiento.s ||
        teclasMovimiento.ArrowDown
    ) {

        direccionDeseada.sub(
            direccion
        );

        hayMovimiento =
            true;

    }


    /* ==========================================
       IZQUIERDA
    ========================================== */

    if (
        teclasMovimiento.a ||
        teclasMovimiento.ArrowLeft
    ) {

        direccionDeseada.sub(
            lateral
        );

        hayMovimiento =
            true;

    }


    /* ==========================================
       DERECHA
    ========================================== */

    if (
        teclasMovimiento.d ||
        teclasMovimiento.ArrowRight
    ) {

        direccionDeseada.add(
            lateral
        );

        hayMovimiento =
            true;

    }


    /* ==========================================
       NORMALIZAR
    ========================================== */

    if (
        hayMovimiento &&
        direccionDeseada.lengthSq() > 0
    ) {

        direccionDeseada.normalize();


        velocidadMovimiento.lerp(
            direccionDeseada.multiplyScalar(
                velocidadMaxima
            ),
            aceleracion
        );

    }

    else {

        velocidadMovimiento.lerp(
            new THREE.Vector3(
                0,
                0,
                0
            ),
            desaceleracion
        );

    }


    /* ==========================================
       APLICAR MOVIMIENTO
    ========================================== */

    const movimiento =
        velocidadMovimiento.clone();


    camara.position.add(
        movimiento
    );


    controles.target.add(
        movimiento
    );


    /* ==========================================
       PROTEGER EDIFICIO
    ========================================== */

    protegerCamara();

}


/* =========================================================
   ANIMAR RECORRIDO
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
       PROGRESO
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
       TRAMOS
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
       MIRADA
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


    /* ==========================================
       PROTEGER
    ========================================== */

    protegerCamara();


    controles.update();


    /* ==========================================
       TERMINAR
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
       WASD / FLECHAS
    ========================================== */

    moverCamara();


    /* ==========================================
       RECORRIDO
    ========================================== */

    if (
        haciendoRecorrido
    ) {

        animarRecorrido(
            delta
        );

    }


    /* ==========================================
       ENFOQUE DE PUERTA
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


        protegerCamara();


        const distanciaCamara =
            camara.position.distanceTo(
                objetivoCamara
            );


        const distanciaObjetivo =
            controles.target.distanceTo(
                objetivoVista
            );


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


            protegerCamara();


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

        }

    }


    /* ==========================================
       PROTECCIÓN NORMAL
    ========================================== */

    if (
        !enfocandoPuerta &&
        !haciendoRecorrido
    ) {

        protegerCamara();

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
