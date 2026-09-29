import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


// =====================================================
// CONTENEDOR
// =====================================================

const contenedor = document.getElementById('modelo-3d');


// =====================================================
// ESCENA
// =====================================================

const escena = new THREE.Scene();


// =====================================================
// CÁMARA
// =====================================================

const camara = new THREE.PerspectiveCamera(
    45,
    contenedor.clientWidth / contenedor.clientHeight,
    0.01,
    100000
);


// =====================================================
// RENDERIZADOR
// =====================================================

const renderizador = new THREE.WebGLRenderer({
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

renderizador.shadowMap.enabled = true;

contenedor.appendChild(renderizador.domElement);


// =====================================================
// CONTROLES
// =====================================================

const controles = new OrbitControls(
    camara,
    renderizador.domElement
);

controles.enableDamping = true;
controles.dampingFactor = 0.06;

controles.enableZoom = true;
controles.zoomSpeed = 1.2;

controles.enableRotate = true;
controles.rotateSpeed = 0.8;

controles.enablePan = true;
controles.panSpeed = 0.5;

// Permitir acercarse muchísimo
controles.minDistance = 0.01;

// Evitar alejarse demasiado
controles.maxDistance = 1000;


// =====================================================
// LUCES
// =====================================================

const luzAmbiente = new THREE.HemisphereLight(
    0xffffff,
    0x777777,
    2
);

escena.add(luzAmbiente);


const luzDireccional = new THREE.DirectionalLight(
    0xffffff,
    3
);

luzDireccional.position.set(
    10,
    20,
    10
);

luzDireccional.castShadow = true;

escena.add(luzDireccional);


const luzFrontal = new THREE.DirectionalLight(
    0xffffff,
    1.5
);

luzFrontal.position.set(
    -10,
    10,
    10
);

escena.add(luzFrontal);


// =====================================================
// CARGAR ÁRBOL
// =====================================================

const cargador = new FBXLoader();

let arbol = null;


cargador.load(
    './arbol3.fbx',

    function(modelo) {

        console.log("Árbol cargado correctamente");

        arbol = modelo;

        // ---------------------------------------------
        // ESCALA INICIAL
        // ---------------------------------------------

        arbol.scale.set(
            1,
            1,
            1
        );


        // ---------------------------------------------
        // RECORRER OBJETOS
        // ---------------------------------------------

        arbol.traverse(function(objeto) {

            if (objeto.isMesh) {

                objeto.castShadow = true;
                objeto.receiveShadow = true;

                // Mostrar las texturas del FBX
                if (objeto.material) {

                    objeto.material.side = THREE.DoubleSide;

                }

            }

        });


        // ---------------------------------------------
        // AGREGAR A LA ESCENA
        // ---------------------------------------------

        escena.add(arbol);


        // ---------------------------------------------
        // CENTRAR Y ENCUADRAR AUTOMÁTICAMENTE
        // ---------------------------------------------

        encuadrarModelo(arbol);

    },


    function(progreso) {

        if (progreso.total) {

            const porcentaje =
                (progreso.loaded / progreso.total) * 100;

            console.log(
                "Cargando árbol:",
                porcentaje.toFixed(0) + "%"
            );

        }

    },


    function(error) {

        console.error(
            "Error cargando arbol3.fbx:",
            error
        );

    }
);


// =====================================================
// FUNCIÓN PARA CENTRAR Y ACERCAR EL MODELO
// =====================================================

function encuadrarModelo(modelo) {

    const caja = new THREE.Box3().setFromObject(modelo);

    const centro = new THREE.Vector3();

    caja.getCenter(centro);


    const tamaño = new THREE.Vector3();

    caja.getSize(tamaño);


    const maximo = Math.max(
        tamaño.x,
        tamaño.y,
        tamaño.z
    );


    console.log("Tamaño del árbol:", tamaño);
    console.log("Centro del árbol:", centro);


    // ---------------------------------------------
    // CENTRAR EL ÁRBOL
    // ---------------------------------------------

    modelo.position.x -= centro.x;
    modelo.position.y -= caja.min.y;
    modelo.position.z -= centro.z;


    // Volvemos a calcular el tamaño después
    // de centrarlo

    const cajaNueva =
        new THREE.Box3().setFromObject(modelo);

    const centroNuevo =
        new THREE.Vector3();

    cajaNueva.getCenter(centroNuevo);


    const tamañoNuevo =
        new THREE.Vector3();

    cajaNueva.getSize(tamañoNuevo);


    const mayor =
        Math.max(
            tamañoNuevo.x,
            tamañoNuevo.y,
            tamañoNuevo.z
        );


    // ---------------------------------------------
    // POSICIÓN DE LA CÁMARA
    // ---------------------------------------------

    const distancia =
        mayor * 1.8;


    camara.position.set(
        distancia,
        mayor * 0.7,
        distancia
    );


    // ---------------------------------------------
    // MIRAR AL ÁRBOL
    // ---------------------------------------------

    controles.target.set(
        centroNuevo.x,
        centroNuevo.y,
        centroNuevo.z
    );


    camara.lookAt(
        centroNuevo
    );


    // ---------------------------------------------
    // ACTUALIZAR CONTROLES
    // ---------------------------------------------

    controles.update();


    // ---------------------------------------------
    // LÍMITES DE ZOOM AUTOMÁTICOS
    // ---------------------------------------------

    controles.minDistance =
        mayor * 0.05;

    controles.maxDistance =
        mayor * 10;


    // ---------------------------------------------
    // ACTUALIZAR CÁMARA
    // ---------------------------------------------

    camara.near =
        Math.max(mayor * 0.001, 0.001);

    camara.far =
        Math.max(mayor * 100, 100);

    camara.updateProjectionMatrix();

}


// =====================================================
// ANIMACIÓN
// =====================================================

function animar() {

    requestAnimationFrame(animar);


    // ---------------------------------------------
    // ROTACIÓN AUTOMÁTICA
    // ---------------------------------------------

    if (arbol) {

        arbol.rotation.y += 0.002;

    }


    controles.update();


    renderizador.render(
        escena,
        camara
    );

}

animar();


// =====================================================
// CAMBIO DE TAMAÑO DE LA VENTANA
// =====================================================

window.addEventListener(
    'resize',
    function() {

        const ancho =
            contenedor.clientWidth;

        const alto =
            contenedor.clientHeight;


        camara.aspect =
            ancho / alto;

        camara.updateProjectionMatrix();


        renderizador.setSize(
            ancho,
            alto
        );

    }
);


// =====================================================
// PANTALLA COMPLETA
// =====================================================

const botonPantalla =
    document.querySelector('.pantalla-completa');


if (botonPantalla) {

    botonPantalla.addEventListener(
        'click',
        function() {

            const visor =
                document.getElementById('visor-3d');


            if (!document.fullscreenElement) {

                visor.requestFullscreen();

            } else {

                document.exitFullscreen();

            }

        }
    );

}


// =====================================================
// BOTÓN DE RECORRIDO
// =====================================================

const recorrido =
    document.querySelector('.recorrido');

let recorridoActivo = true;


if (recorrido) {

    recorrido.addEventListener(
        'click',
        function() {

            recorridoActivo =
                !recorridoActivo;


            const texto =
                recorrido.querySelector('span');


            if (texto) {

                texto.textContent =
                    recorridoActivo
                    ? 'Activado'
                    : 'Desactivado';

            }

        }
    );

}