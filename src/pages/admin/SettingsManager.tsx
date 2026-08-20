import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Save } from 'lucide-react';

export function SettingsManager() {
  const [settings, setSettings] = useState<any>({
    social: { instagram: '', twitter: '', facebook: '' },
    contact: { email: '', phone: '', address: '', businessHours: '' },
    about: { shortDescription: '' }
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'settings', 'store');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setSettings((prev: any) => ({ ...prev, ...snap.data() }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'store'), settings);
      alert('Settings saved successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (category: string, field: string, value: string) => {
    setSettings({
      ...settings,
      [category]: {
        ...(settings[category] || {}),
        [field]: value
      }
    });
  };

  if (loading) {
    return <div className="p-8 text-drakn-muted uppercase tracking-widest text-xs">Loading settings...</div>;
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-2xl font-display uppercase tracking-widest text-drakn-light">Store Settings</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-drakn-light text-drakn-base px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="space-y-12">
        
        {/* Contact Info */}
        <section className="bg-drakn-graphite/20 border border-drakn-graphite p-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-drakn-light mb-6 border-b border-drakn-graphite pb-4">Client Services / Contact</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-drakn-muted mb-2">Support Email</label>
              <input 
                type="email" 
                value={settings.contact.email}
                onChange={e => updateField('contact', 'email', e.target.value)}
                className="w-full bg-drakn-base border border-drakn-graphite p-3 text-xs text-drakn-light focus:border-drakn-light outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-drakn-muted mb-2">Support Phone</label>
              <input 
                type="text" 
                value={settings.contact.phone}
                onChange={e => updateField('contact', 'phone', e.target.value)}
                className="w-full bg-drakn-base border border-drakn-graphite p-3 text-xs text-drakn-light focus:border-drakn-light outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] uppercase tracking-widest text-drakn-muted mb-2">Business Hours</label>
              <input 
                type="text" 
                value={settings.contact.businessHours}
                onChange={e => updateField('contact', 'businessHours', e.target.value)}
                placeholder="e.g. Monday - Friday, 9am - 6pm EST"
                className="w-full bg-drakn-base border border-drakn-graphite p-3 text-xs text-drakn-light focus:border-drakn-light outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] uppercase tracking-widest text-drakn-muted mb-2">Studio Address</label>
              <textarea 
                rows={3}
                value={settings.contact.address}
                onChange={e => updateField('contact', 'address', e.target.value)}
                className="w-full bg-drakn-base border border-drakn-graphite p-3 text-xs text-drakn-light focus:border-drakn-light outline-none resize-none"
              />
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section className="bg-drakn-graphite/20 border border-drakn-graphite p-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-drakn-light mb-6 border-b border-drakn-graphite pb-4">Social Media</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-drakn-muted mb-2">Instagram URL</label>
              <input 
                type="url" 
                value={settings.social.instagram}
                onChange={e => updateField('social', 'instagram', e.target.value)}
                className="w-full bg-drakn-base border border-drakn-graphite p-3 text-xs text-drakn-light focus:border-drakn-light outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-drakn-muted mb-2">Twitter / X URL</label>
              <input 
                type="url" 
                value={settings.social.twitter}
                onChange={e => updateField('social', 'twitter', e.target.value)}
                className="w-full bg-drakn-base border border-drakn-graphite p-3 text-xs text-drakn-light focus:border-drakn-light outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-drakn-muted mb-2">Facebook URL</label>
              <input 
                type="url" 
                value={settings.social.facebook}
                onChange={e => updateField('social', 'facebook', e.target.value)}
                className="w-full bg-drakn-base border border-drakn-graphite p-3 text-xs text-drakn-light focus:border-drakn-light outline-none"
              />
            </div>
          </div>
        </section>

        {/* Footer About */}
        <section className="bg-drakn-graphite/20 border border-drakn-graphite p-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-drakn-light mb-6 border-b border-drakn-graphite pb-4">Footer Content</h2>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-drakn-muted mb-2">Short Description (Appears under DRAKN logo in footer)</label>
            <textarea 
              rows={3}
              value={settings.about.shortDescription}
              onChange={e => updateField('about', 'shortDescription', e.target.value)}
              className="w-full bg-drakn-base border border-drakn-graphite p-3 text-xs text-drakn-light focus:border-drakn-light outline-none resize-none"
            />
          </div>
        </section>

      </div>
    </div>
  );
}
