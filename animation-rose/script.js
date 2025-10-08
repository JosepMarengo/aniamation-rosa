document.addEventListener('DOMContentLoaded', () => {
    const contenedor = document.getElementById('rosa-puntos');
    const boton = document.getElementById('generar-animar');
    const imgElement = document.getElementById('imagen-rosa');
    const canvas = document.getElementById('canvas-procesamiento');
    const ctx = canvas.getContext('2d');
    const mensajeFinal = document.getElementById('mensaje-final');
    
    const audioBG = document.getElementById('bg-music'); 
    
    let puntosParaAnimar = [];
    const UMBRAL_OSCURIDAD = 50; 
    const PASO = 3; 
    const RETRASO_PUNTO = 2;

    // --- FUNCIÓN DE PROCESAMIENTO (Mismo código de extracción de puntos) ---
    function procesarImagen() {
        puntosParaAnimar = [];
        // ... (resto del código de procesarImagen permanece igual, ya que solo extrae datos)
        canvas.width = imgElement.naturalWidth;
        canvas.height = imgElement.naturalHeight;
        ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let y = 0; y < canvas.height; y += PASO) {
            for (let x = 0; x < canvas.width; x += PASO) {
                const index = (y * canvas.width + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const brillo = (r + g + b) / 3;

                if (brillo < UMBRAL_OSCURIDAD) {
                    puntosParaAnimar.push({
                        x: x,
                        y: y,
                        orden: Math.sqrt(Math.pow(x - canvas.width / 2, 2) + Math.pow(y - canvas.height / 2, 2))
                    });
                }
            }
        }
        puntosParaAnimar.sort((a, b) => a.orden - b.orden);
        console.log(`Puntos detectados para animación: ${puntosParaAnimar.length}`);
        boton.disabled = false;
        mensajeFinal.classList.remove('visible'); 
    }

    // --- FUNCIÓN DE ANIMACIÓN ACTUALIZADA CON ESCALADO RESPONSIVE ---
    function animarPuntos() {
        contenedor.innerHTML = ''; 
        mensajeFinal.classList.remove('visible');
        boton.disabled = true;
        boton.textContent = 'Dibujando Rosa... ✍️';

        const centroX = contenedor.clientWidth / 2;
        const centroY = contenedor.clientHeight / 2;

         audioBG.play().catch(error => {
            console.error("No se pudo iniciar la reproducción de la música:", error);
         })
        
        // CÁLCULO CLAVE DE ESCALADO RESPONSIVE:
        // Relación de aspecto entre el ancho de la imagen original y el ancho actual del contenedor.
        const escalaX = contenedor.clientWidth / canvas.width;
        const escalaY = contenedor.clientHeight / canvas.height;

        puntosParaAnimar.forEach((puntoData, index) => {
            const puntoDiv = document.createElement('div');
            puntoDiv.classList.add('punto');
            
            // Posición INICIAL: centro del contenedor
            puntoDiv.style.left = `${centroX}px`;
            puntoDiv.style.top = `${centroY}px`;
            contenedor.appendChild(puntoDiv);

            const delay = index * RETRASO_PUNTO;

            setTimeout(() => {
                puntoDiv.style.opacity = 1;
                
                // Mover a la posición FINAL, aplicando la escala y centrado:
                // 1. Calcular el desplazamiento desde el centro de la imagen (puntoData.x - canvas.width / 2)
                // 2. Multiplicar por el factor de escala (escalaX)
                const finalX = (puntoData.x - (canvas.width / 2)) * escalaX;
                const finalY = (puntoData.y - (canvas.height / 2)) * escalaY;
                
                puntoDiv.style.transform = `translate(${finalX}px, ${finalY}px)`;
            }, delay);
        });

        const duracionAnimacionRosa = puntosParaAnimar.length * RETRASO_PUNTO + 1500; 
        
        setTimeout(() => {
            mensajeFinal.classList.add('visible');
            setTimeout(() => {
                boton.disabled = false;
                boton.textContent = '¡Animación Completa! 🎉';
            }, 1500); 
        }, duracionAnimacionRosa);
    }
    
    // --- MANEJO DE EVENTOS (incluyendo listener de redimensionamiento) ---
    
    // Agregamos un listener de redimensionamiento para recalcular la posición de los puntos
    // (Esto es opcional si solo quieres la animación una vez, pero mejora la responsividad si se cambia el tamaño de la ventana)
    window.addEventListener('resize', () => {
        if (!boton.disabled) { // Solo si no está animando
            // Volver a procesar para recalcular las escalas
            procesarImagen(); 
        }
    });

    imgElement.onload = procesarImagen;
    if (imgElement.complete) {
        procesarImagen();
    } else {
        boton.disabled = true;
        boton.textContent = 'Cargando imagen...';
    }
    boton.addEventListener('click', animarPuntos);
});