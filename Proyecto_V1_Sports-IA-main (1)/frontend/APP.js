import { auth } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM para autenticación
    const authModal = document.getElementById('authModal');
    const loginButton = document.getElementById('loginButton');
    const registerButton = document.getElementById('registerButton');
    const logoutButton = document.getElementById('logoutButton');
    const closeAuth = document.getElementById('closeAuth');
    const authTitle = document.getElementById('authTitle');
    const registerFields = document.getElementById('registerFields');
    const authForm = document.getElementById('authForm');
    const toggleAuth = document.getElementById('toggleAuth');
    const authFeedback = document.getElementById('authFeedback');

    // Elementos del DOM para manejo de archivos
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const clearPreview = document.getElementById('clearPreview');
    const dropZone = document.getElementById('dropZone');
    const fileInfo = document.getElementById('fileInfo');
    const classifyButton = document.getElementById('classifyButton');
    const result = document.getElementById('result');
    let myFile

    // Variables de estado
    let isLoginMode = true;
    let selectedFile = null;

    // Crear elemento para mostrar el correo del usuario
    const userDisplay = document.createElement('span');
    userDisplay.id = 'userDisplay';
    document.querySelector('.auth-buttons').prepend(userDisplay);

    // Observador de estado de autenticación
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Usuario logueado
            loginButton.classList.add('hidden');
            registerButton.classList.add('hidden');
            logoutButton.classList.remove('hidden');
            userDisplay.textContent = user.email;
            userDisplay.title = user.email;
            console.log('Usuario logueado:', user.email);

            localStorage.setItem('isLoggedIn', 'true');
        } else {
            // Usuario no logueado
            loginButton.classList.remove('hidden');
            registerButton.classList.remove('hidden');
            logoutButton.classList.add('hidden');
            userDisplay.textContent = '';
            console.log('Usuario no logueado');

            localStorage.removeItem('isLoggedIn');
        }
    });

    // Verificar sesión al cargar
    const savedAuth = localStorage.getItem('isLoggedIn');
    if (savedAuth === 'true') {
        onAuthStateChanged(auth, (user) => {
            if (!user) {
                localStorage.removeItem('isLoggedIn');
            }
        });
    }

    // Manejo de autenticación
    function toggleAuthMode() {
        isLoginMode = !isLoginMode;
        authTitle.textContent = isLoginMode ? 'Iniciar Sesión' : 'Registrarse';
        registerFields.classList.toggle('hidden', isLoginMode);
        toggleAuth.textContent = isLoginMode ? 'Regístrate' : 'Inicia sesión';
        authFeedback.textContent = '';
    }

    // Event Listeners para autenticación
    loginButton.addEventListener('click', () => {
        authModal.style.display = 'flex';
        if (!isLoginMode) toggleAuthMode();
    });

    registerButton.addEventListener('click', () => {
        authModal.style.display = 'flex';
        if (isLoginMode) toggleAuthMode();
    });

    logoutButton.addEventListener('click', () => {
        signOut(auth).then(() => {
            showFeedback('Sesión cerrada correctamente', 'success');
        }).catch((error) => {
            handleAuthError(error);
        });
    });

    closeAuth.addEventListener('click', () => {
        authModal.style.display = 'none';
        authForm.reset();
        authFeedback.textContent = '';
    });

    toggleAuth.addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthMode();
    });

    authForm.addEventListener('submit', async(e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const name = isLoginMode ? null : document.getElementById('name').value;

        if (!email || !password) {
            showFeedback('Email y contraseña son requeridos', 'error');
            return;
        }

        if (!isLoginMode && !name) {
            showFeedback('El nombre es requerido para registrarse', 'error');
            return;
        }

        try {
            showFeedback('Procesando...', 'info');

            if (isLoginMode) {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                showFeedback(`Bienvenido ${userCredential.user.email}`, 'success');
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, {
                    displayName: name
                });
                showFeedback(`Cuenta creada para ${name}`, 'success');
            }

            setTimeout(() => {
                authModal.style.display = 'none';
                authForm.reset();
            }, 1500);
        } catch (error) {
            console.error('Error de autenticación:', error);
            handleAuthError(error);
        }
    });

    // Funciones auxiliares para autenticación
    function handleAuthError(error) {
        let message = 'Error al autenticar. Intenta nuevamente.';

        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'Este email ya está registrado';
                break;
            case 'auth/invalid-email':
                message = 'Email inválido';
                break;
            case 'auth/weak-password':
                message = 'La contraseña debe tener al menos 6 caracteres';
                break;
            case 'auth/user-not-found':
                message = 'Usuario no encontrado';
                break;
            case 'auth/wrong-password':
                message = 'Contraseña incorrecta';
                break;
            case 'auth/too-many-requests':
                message = 'Demasiados intentos. Intenta más tarde';
                break;
        }

        showFeedback(message, 'error');
    }

    function showFeedback(message, type) {
        authFeedback.textContent = message;
        authFeedback.className = 'feedback';
        authFeedback.classList.add(type);
    }

    // Manejo de archivos
    function handleFileSelection(file) {
        if (!file.type.match('image.*')) {
            showFileFeedback('Por favor selecciona un archivo de imagen válido', 'error');
            return;
        }

        selectedFile = file;
        fileInfo.textContent = `${file.name} (${formatFileSize(file.size)})`;

        const reader = new FileReader();
        reader.onload = function(e) {
            const imgElement = document.getElementById("imagePreview");
            imgElement.src = e.target.result;
            imgElement.style.display = "block";
        };

        myFile = file
        reader.readAsDataURL(file);
        console.log("asdasd")
        classifyButton.disabled = false;
    }

    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFileSelection(e.target.files[0]);
        }
    });

    // Drag and drop
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        dropZone.classList.add('highlight');
    }

    function unhighlight() {
        dropZone.classList.remove('highlight');
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        if (file) handleFileSelection(file);
    });

    // Limpiar vista previa
    clearPreview.addEventListener('click', () => {
        imagePreview.src = '';
        imagePreview.style.display = 'none';
        clearPreview.style.display = 'none';
        classifyButton.disabled = true;
        fileInfo.textContent = '';
        selectedFile = null;
        imageInput.value = '';
        dropZone.classList.remove('hidden');
        result.innerHTML = '<div class="placeholder"><i class="fas fa-image"></i><p>Sube una imagen para identificar el deporte</p><p class="small-text">Ejemplos: fútbol, baloncesto, tenis, natación</p></div>';
    });

    async function sendData() {
        const formData = new FormData();
        formData.append("image", myFile);

        const response = await fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            body: formData // No necesitamos especificar el Content-Type, FormData lo maneja automáticamente
        });

        const data = await response.json();
        return data.resultado;
    }

    // Clasificar imagen
    classifyButton.addEventListener('click', async() => {
        if (!selectedFile) return;

        result.innerHTML = `
            <div class="result-card">
                <div class="loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Analizando imagen...</p>
                </div>
            </div>
        `;

        sendData().then(resultado => {
            result.innerHTML = `
                <div class="result-card fade-in">
                    <h3 class="result-title">Resultado:</h3>
                    <p>El deporte identificado es <strong>${resultado}</strong></p>
                </div>
            `;
        });
    });

    // Funciones auxiliares para archivos
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function showFileFeedback(message, type) {
        fileInfo.textContent = message;
        fileInfo.style.color = type === 'error' ? 'var(--error-color)' : 'var(--gray-color)';
    }

    // Consulta a Wikipedia
    async function fetchWikipediaInfo(sportName) {
        try {
            const searchUrl = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(sportName)}&format=json&origin=*`;

            const searchResponse = await fetch(searchUrl);
            const searchData = await searchResponse.json();

            if (searchData.query.search.length === 0) {
                return null;
            }

            const pageTitle = searchData.query.search[0].title;

            const contentUrl = `https://es.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro=true&explaintext=true&pithumbsize=300&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;

            const contentResponse = await fetch(contentUrl);
            const contentData = await contentResponse.json();

            const pageId = Object.keys(contentData.query.pages)[0];
            const page = contentData.query.pages[pageId];

            if (page.missing) {
                return null;
            }

            return {
                title: page.title,
                extract: page.extract,
                thumbnail: page.thumbnail ? page.thumbnail.source : null,
                url: `https://es.wikipedia.org/wiki/${encodeURIComponent(page.title)}`
            };
        } catch (error) {
            console.error("Error fetching Wikipedia data:", error);
            return null;
        }
    }
});