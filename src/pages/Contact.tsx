import { useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowRight } from 'lucide-react';

export function Contact() {
  const { settings, loading } = useStoreSettings();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderNumber: '',
    subject: '',
    message: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error');
      setErrorMessage('Please fill out all required fields.');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      await addDoc(collection(db, 'messages'), {
        ...formData,
        createdAt: serverTimestamp(),
        status: 'new'
      });
      setStatus('success');
      setFormData({ name: '', email: '', orderNumber: '', subject: '', message: '' });
    } catch (err) {
      console.error("Error submitting contact form", err);
      setStatus('error');
      setErrorMessage('Failed to send message. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 px-6 flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-drakn-light rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="pt-32 pb-24 min-h-screen max-w-[1600px] mx-auto px-6 md:px-12">
        <header className="mb-24 md:text-center">
          <h1 className="text-4xl md:text-6xl font-display uppercase tracking-[0.2em] text-drakn-light mb-6">
            CONTACT
          </h1>
          <p className="text-drakn-muted text-sm tracking-widest uppercase">
            Get in touch with the DRAKN team
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8">
          
          <div className="col-span-1 md:col-span-4 md:col-start-2 space-y-12">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-drakn-light mb-4 border-b border-drakn-graphite pb-4">Client Services</h3>
              <p className="text-sm text-drakn-muted leading-relaxed whitespace-pre-wrap">
                {settings?.contact?.email && <div>Email: {settings.contact.email}</div>}
                {settings?.contact?.phone && <div>Phone: {settings.contact.phone}</div>}
                {settings?.contact?.businessHours && <div>Hours: {settings.contact.businessHours}</div>}
                {!settings?.contact?.email && !settings?.contact?.phone && 'Contact information is currently being updated.'}
              </p>
            </div>
            
            {settings?.contact?.address && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-drakn-light mb-4 border-b border-drakn-graphite pb-4">Studio Location</h3>
                <p className="text-sm text-drakn-muted leading-relaxed whitespace-pre-wrap">
                  {settings.contact.address}
                </p>
              </div>
            )}
          </div>

          <div className="col-span-1 md:col-span-6 md:col-start-7">
            {status === 'success' ? (
              <div className="border border-drakn-light/20 p-12 text-center">
                <h3 className="text-lg font-display uppercase tracking-widest text-drakn-light mb-4">Message Sent</h3>
                <p className="text-sm text-drakn-muted">Our client services team will respond within 24-48 hours.</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="mt-8 border-b border-drakn-light text-xs uppercase tracking-widest text-drakn-light pb-1 hover:text-drakn-muted transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-drakn-muted mb-2">Name *</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-transparent border border-drakn-graphite p-4 text-xs uppercase tracking-widest text-drakn-light focus:border-drakn-light outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-drakn-muted mb-2">Email *</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-transparent border border-drakn-graphite p-4 text-xs uppercase tracking-widest text-drakn-light focus:border-drakn-light outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-drakn-muted mb-2">Order Number (Optional)</label>
                    <input 
                      type="text" 
                      name="orderNumber"
                      value={formData.orderNumber}
                      onChange={handleChange}
                      className="w-full bg-transparent border border-drakn-graphite p-4 text-xs uppercase tracking-widest text-drakn-light focus:border-drakn-light outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-drakn-muted mb-2">Subject *</label>
                    <select 
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full bg-transparent border border-drakn-graphite p-4 text-xs uppercase tracking-widest text-drakn-light focus:border-drakn-light outline-none transition-colors appearance-none"
                    >
                      <option value="" className="bg-drakn-base">Select a topic</option>
                      <option value="Orders" className="bg-drakn-base">Orders</option>
                      <option value="Shipping" className="bg-drakn-base">Shipping</option>
                      <option value="Returns" className="bg-drakn-base">Returns & Exchanges</option>
                      <option value="Product Information" className="bg-drakn-base">Product Information</option>
                      <option value="Other" className="bg-drakn-base">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-drakn-muted mb-2">Message *</label>
                  <textarea 
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full bg-transparent border border-drakn-graphite p-4 text-xs tracking-wide text-drakn-light focus:border-drakn-light outline-none transition-colors resize-none"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-red-500 text-[10px] uppercase tracking-widest">{errorMessage}</p>
                )}

                <button 
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full sm:w-auto bg-drakn-light text-drakn-base px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-white transition-colors disabled:opacity-50"
                >
                  {status === 'submitting' ? 'Sending...' : 'Send Message'}
                  <ArrowRight size={16} strokeWidth={2} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
