import { Medicine, Appointment, NotificationSettings, TranslationSet } from '../types';

// This array holds all active notification timers.
const notificationTimers: ReturnType<typeof setTimeout>[] = [];

/**
 * Clears all scheduled notification timers.
 */
const clearAllNotifications = () => {
    notificationTimers.forEach(clearTimeout);
    notificationTimers.length = 0; // Efficiently clear the array
};

/**
 * Schedules all necessary notifications for medicines and appointments for the current day.
 * @param medicines List of all medicines.
 * @param appointments List of all appointments.
 * @param settings The user's current notification preferences.
 * @param t The translation set for the current language.
 * @returns A cleanup function to be called when the component unmounts or dependencies change.
 */
export const scheduleNotifications = (
    medicines: Medicine[],
    appointments: Appointment[],
    settings: NotificationSettings,
    t: TranslationSet
): (() => void) => {
    
    clearAllNotifications();

    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
        return () => {}; // Return an empty cleanup function if notifications aren't supported or allowed.
    }

    const today = new Date();

    // Schedule medicine notifications
    medicines.forEach(med => {
        const [hours, minutes] = med.time.split(':').map(Number);
        const medTime = new Date();
        medTime.setHours(hours, minutes, 0, 0);

        if (medTime > today) {
            const timeout = medTime.getTime() - today.getTime();
            const timer = setTimeout(() => {
                const vibrationPattern = settings.medicineVibration === 'pulse' ? [200, 100, 200] : (settings.medicineVibration === 'none' ? [] : [100]);
                new Notification(t.nextMedication, {
                    body: t.notificationMedicineBody.replace('{medicationName}', med.name).replace('{time}', med.time),
                    vibrate: vibrationPattern,
                    tag: `med-${med.id}-${med.time}`
                } as NotificationOptions); // Cast to allow 'vibrate' property
            }, timeout);
            notificationTimers.push(timer);
        }
    });

    // Schedule appointment notifications based on user's preferred interval
    appointments.forEach(app => {
        const todayStr = today.toISOString().split('T')[0];
        // 1. Filter for appointments scheduled for the current day.
        if (app.date === todayStr) {
            const [hours, minutes] = app.time.split(':').map(Number);
            const appTime = new Date();
            appTime.setHours(hours, minutes, 0, 0);
            
            // 2. Calculate the exact reminder time by subtracting the user-configured interval (in minutes) from the appointment time.
            const reminderTime = new Date(appTime.getTime() - settings.appointmentInterval * 60000);

            // 3. Only schedule the notification if the reminder time is in the future.
            if (reminderTime > today) {
                const timeout = reminderTime.getTime() - today.getTime();
                const timer = setTimeout(() => {
                    // 4. Apply the user's chosen vibration pattern for the notification.
                    // Note: Custom sounds are not consistently supported by the Web Notification API, so the system default is used.
                    const vibrationPattern = settings.appointmentVibration === 'pulse' ? [200, 100, 200] : (settings.appointmentVibration === 'none' ? [] : [100]);
                    
                    // 5. Create and display the notification.
                    new Notification(t.todaysAppointments, {
                       body: t.notificationAppointmentBody.replace('{doctorName}', app.doctor).replace('{time}', app.time),
                       vibrate: vibrationPattern,
                       tag: `app-${app.id}-${app.time}`
                    } as NotificationOptions); // Cast to allow 'vibrate' property
                }, timeout);
                notificationTimers.push(timer);
            }
        }
    });

    // Return the cleanup function
    return clearAllNotifications;
};