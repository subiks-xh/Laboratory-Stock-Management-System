const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const settingsService = require('../services/settingsService');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const settings = await settingsService.getSettings();
        res.json({
            success: true,
            settings
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch settings',
            error: error.message
        });
    }
});

router.put('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const payload = req.body?.settings;
        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid settings payload'
            });
        }

        const settings = await settingsService.saveSettings(payload);
        return res.json({
            success: true,
            message: 'Settings updated successfully',
            settings
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update settings',
            error: error.message
        });
    }
});

module.exports = router;
