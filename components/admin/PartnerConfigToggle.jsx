'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PartnerConfigToggle() {
    const [isEnabled, setIsEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function fetchConfig() {
            try {
                const res = await fetch('/api/admin/content?collection=partners-config&slug=config');
                if (res.ok) {
                    const data = await res.json();
                    // data could be null if singleton entry doesn't exist yet
                    if (data && data.data) {
                        setIsEnabled(!!data.data.enablePartnersSlider);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch partner config', error);
            } finally {
                setLoading(false);
            }
        }
        fetchConfig();
    }, []);

    const handleToggle = async (newValue) => {
        setSaving(true);
        // Optimistic update
        setIsEnabled(newValue);

        try {
            // First, get the entry to know if we need to create or update (and get ID)
            const getRes = await fetch('/api/admin/content?collection=partners-config&slug=config');
            let entryId = null;
            let existingData = {};

            if (getRes.ok) {
                const entry = await getRes.json();
                if (entry) {
                    entryId = entry.id;
                    existingData = entry.data || {};
                }
            }

            const payload = {
                collection: 'partners-config',
                slug: 'config',
                title: 'Config Partenaires',
                status: 'published',
                data: {
                    ...existingData,
                    enablePartnersSlider: newValue,
                },
            };

            const method = entryId ? 'PATCH' : 'POST';
            const url = entryId ? `/api/admin/content/${entryId}` : '/api/admin/content';

            const saveRes = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!saveRes.ok) {
                throw new Error('Failed to save config');
            }

            router.refresh(); // Refresh to update any server components if needed
        } catch (error) {
            console.error('Error saving partner config:', error);
            // Revert on error
            setIsEnabled(!newValue);
            alert('Erreur lors de la sauvegarde de la configuration.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="card shadow-sm border-0 mb-4 bg-primary-subtle">
            <div className="card-body d-flex align-items-center justify-content-between">
                <div>
                    <h2 className="h6 fw-bold text-primary mb-1">
                        <i className="ri-settings-3-line me-2"></i>
                        Affichage des partenaires
                    </h2>
                    <p className="small text-secondary mb-0">
                        {loading ? 'Chargement de la configuration...' : 'Activez le mode "Slider" pour faire défiler les logos.'}
                    </p>
                </div>
                <div className="form-check form-switch">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="partnerSliderToggle"
                        style={{ width: '3em', height: '1.5em', cursor: 'pointer' }}
                        checked={isEnabled}
                        disabled={saving}
                        onChange={(e) => handleToggle(e.target.checked)}
                    />
                    <label className="form-check-label fw-bold ms-2" htmlFor="partnerSliderToggle" style={{ cursor: 'pointer' }}>
                        {isEnabled ? 'Slider activé' : 'Grille statique'}
                    </label>
                </div>
            </div>
        </div>
    );
}
