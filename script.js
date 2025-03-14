// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzuJ1VfxoUkvBbLBG0pAm00i2vwaeVBP8",
  authDomain: "recordatorio-medicamento-6dd71.firebaseapp.com",
  projectId: "recordatorio-medicamento-6dd71",
  storageBucket: "recordatorio-medicamento-6dd71.firebasestorage.app",
  messagingSenderId: "222522412748",
  appId: "1:222522412748:web:6d4f05b4443f93b4137c69",
  measurementId: "G-0Z5QNJYBL4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

// Solicitar permisos para enviar notificaciones
function requestPermission() {
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      console.log('Permiso para notificaciones concedido.');
      getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' }).then((currentToken) => {
        if (currentToken) {
          console.log('Token:', currentToken);
          // Envía el token a tu servidor y guárdalo para enviar notificaciones más tarde
        } else {
          console.log('No hay token de registro disponible. Solicita permisos para generar uno.');
        }
      }).catch((err) => {
        console.log('Error al recuperar el token. ', err);
      });
    } else {
      console.log('No se pudo obtener permiso para notificaciones.');
    }
  });
}

// Manejar mensajes entrantes
onMessage(messaging, (payload) => {
  console.log('Mensaje recibido: ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon
  };

  new Notification(notificationTitle, notificationOptions);
});

// Función para activar/desactivar notificaciones
function toggleNotifications() {
  const notificationsSelect = document.getElementById('notifications');
  if (notificationsSelect.value === 'yes') {
    requestPermission();
  } else {
    console.log('Notificaciones desactivadas.');
    // Aquí puedes agregar lógica adicional para desactivar notificaciones en tu servidor
  }
}

// Resto de tu código
let medicationToDelete = null;

document.addEventListener('DOMContentLoaded', () => {
  loadStoredMedications();
});

function addReminder() {
    event.preventDefault();

    const nameInput = document.getElementById('medication-name');
    const dosageInput = document.getElementById('medication-dosage');
    const intervalInput = document.getElementById('reminder-interval');
    const startTimeInput = document.getElementById('start-time');
    const typeInput = document.getElementById('medication-type');
    const durationInput = document.getElementById('medication-duration');

    const medicationName = nameInput.value.trim();
    const medicationDosage = dosageInput.value.trim();
    const reminderInterval = intervalInput.value.trim();
    const startTime = startTimeInput.value.trim();
    const medicationType = typeInput.value;
    const medicationDuration = durationInput.value.trim();

    if (medicationName && medicationDosage && reminderInterval && startTime) {
        const medication = {
            name: medicationName,
            dosage: medicationDosage,
            interval: reminderInterval,
            startTime,
            type: medicationType,
            duration: medicationDuration
        };
        
        addMedicationToList(medication);
        storeMedication(medication);
        resetForm();
    } else {
        alert('Por favor, completa todos los campos.');
    }
}

function addMedicationToList(medication) {
    const listId = medication.type === 'cronic' ? 'chronic-medications-list' : 'occasional-medications-list';
    const listElement = document.getElementById(listId);

    const newReminder = document.createElement('li');
    newReminder.textContent = `${medication.name} - ${medication.dosage} cada ${medication.interval} horas, comenzando a las ${medication.startTime} (${medication.type === 'cronic' ? 'Crónico' : 'Ocasional por ' + medication.duration + ' días'})`;

    // Agregar evento de clic para eliminar el recordatorio
    newReminder.addEventListener('click', function() {
        medicationToDelete = newReminder;
        openModal();
    });

    listElement.appendChild(newReminder);

    if (medication.type === 'occasional') {
        // Configurar la expiración del medicamento ocasional
        const expirationTime = Date.now() + medication.duration * 24 * 60 * 60 * 1000; // Convertir días a milisegundos
        setTimeout(() => newReminder.remove(), expirationTime);
    }

    scheduleNotification(medication.name, medication.dosage, medication.interval, medication.startTime);
}

function storeMedication(medication) {
    const medications = JSON.parse(localStorage.getItem('medications')) || [];
    medications.push(medication);
    localStorage.setItem('medications', JSON.stringify(medications));
}

function loadStoredMedications() {
    const medications = JSON.parse(localStorage.getItem('medications')) || [];
    medications.forEach(medication => addMedicationToList(medication));
}

function resetForm() {
    document.getElementById('medication-name').value = '';
    document.getElementById('medication-dosage').value = '';
    document.getElementById('reminder-interval').value = '';
    document.getElementById('start-time').value = '';
    if (document.getElementById('medication-type').value === 'occasional') {
        document.getElementById('medication-duration').value = '';
    }
}

function scheduleNotification(name, dosage, interval, startTime) {
    const intervalMs = interval * 60 * 60 * 1000; // Convertir horas a milisegundos
    const startTimeMs = new Date(`1970-01-01T${startTime}:00Z`).getTime();
    const now = new Date().getTime();
    const delay = startTimeMs - (now % (24 * 60 * 60 * 1000)); // Tiempo hasta la primera notificación

    setTimeout(function notify() {
        alert(`Es hora de tomar ${name} - ${dosage}`);
        setInterval(() => alert(`Es hora de tomar ${name} - ${dosage}`), intervalMs);
    }, delay);
}

function openModal() {
    document.getElementById('confirmation-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('confirmation-modal').style.display = 'none';
    medicationToDelete = null;
}

function confirmDeletion() {
    if (medicationToDelete) {
        medicationToDelete.remove();
        medicationToDelete = null;
        closeModal();
    }
}

function toggleDurationField() {
    const typeInput = document.getElementById('medication-type');
    const durationGroup = document.getElementById('duration-group');
    if (typeInput.value === 'occasional') {
        durationGroup.style.display = 'block';
    } else {
        durationGroup.style.display = 'none';
    }
}
