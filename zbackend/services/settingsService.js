const fs = require('fs/promises');
const path = require('path');

const SETTINGS_PATH = path.join(__dirname, '..', 'config', 'system-settings.json');

const DEFAULT_SETTINGS = {
    lab_name: '',
    organization: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    operating_hours: {
        monday: { open: '08:00', close: '18:00', closed: false },
        tuesday: { open: '08:00', close: '18:00', closed: false },
        wednesday: { open: '08:00', close: '18:00', closed: false },
        thursday: { open: '08:00', close: '18:00', closed: false },
        friday: { open: '08:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '15:00', closed: false },
        sunday: { open: '09:00', close: '15:00', closed: true }
    },
    booking_rules: {
        max_booking_duration: 8,
        advance_booking_days: 30,
        cancellation_hours: 24,
        auto_approve_bookings: false,
        require_approval_for_equipment: true
    },
    notification_settings: {
        email_notifications: true,
        booking_confirmations: true,
        maintenance_reminders: true,
        incident_alerts: true,
        daily_digest: false
    },
    maintenance_settings: {
        default_maintenance_interval: 30,
        require_maintenance_approval: true,
        auto_schedule_maintenance: false,
        maintenance_buffer_days: 3
    },
    security_settings: {
        session_timeout: 60,
        require_2fa: false,
        password_expiry_days: 90,
        max_login_attempts: 5
    }
};

class SettingsService {
    async getSettings() {
        try {
            const raw = await fs.readFile(SETTINGS_PATH, 'utf8');
            const parsed = JSON.parse(raw);
            return { ...DEFAULT_SETTINGS, ...parsed };
        } catch {
            return DEFAULT_SETTINGS;
        }
    }

    async saveSettings(settings) {
        const normalized = { ...DEFAULT_SETTINGS, ...(settings || {}) };
        await fs.mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
        await fs.writeFile(SETTINGS_PATH, JSON.stringify(normalized, null, 2), 'utf8');
        return normalized;
    }
}

module.exports = new SettingsService();
