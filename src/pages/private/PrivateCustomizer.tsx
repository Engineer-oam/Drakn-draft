import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PageTransition } from '../../components/PageTransition';
import { OptimizedImage } from '../../components/OptimizedImage';
import { useAuth } from '../../hooks/useAuth';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function PrivateCustomizer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Customization state
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const snap = await getDoc(docRef);
        if (snap.exists() && snap.data().isPrivate) {
          setProduct({ id: snap.id, ...snap.data() });
        } else {
          // Not found or not private
          navigate('/private');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id, navigate]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) return null;

  // Build steps
  const steps = [];
  const customizationGroups = product.customizationOptions || [];
  
  if (customizationGroups.length > 0) {
    customizationGroups.forEach((group: any) => {
      steps.push({ type: 'customize', group });
    });
  }
  
  const requiredMeasurements = product.requiredMeasurements || [];
  if (requiredMeasurements.length > 0) {
    steps.push({ type: 'measurements', fields: requiredMeasurements });
  }
  
  steps.push({ type: 'review' });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate(-1);
    }
  };

  const handleSelect = (groupName: string, optionName: string) => {
    setSelections(prev => ({ ...prev, [groupName]: optionName }));
  };

  const handleMeasurementChange = (field: string, value: string) => {
    setMeasurements(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("Please sign in to submit a private request.");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'private_requests'), {
        customerId: user.uid,
        customerName: user.displayName,
        customerEmail: user.email,
        productId: product.id,
        productName: product.name,
        selections,
        measurements,
        notes,
        status: 'REQUEST RECEIVED',
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-[#050505] text-[#D4CFC9] flex items-center justify-center p-6">
          <div className="max-w-md text-center border border-[#1A1A1A] p-12">
            <h2 className="text-2xl font-display uppercase tracking-widest text-white mb-6">Request Received</h2>
            <p className="text-xs uppercase tracking-widest text-[#A39E98] leading-relaxed mb-12">
              Your commission request for the {product.name} has been securely transmitted to the DRAKN Atelier.
              A client advisor will review your specifications and prepare a formal quote.
            </p>
            <button 
              onClick={() => navigate('/account/private')}
              className="bg-white text-black px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#D4CFC9] transition-colors"
            >
              View My Requests
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  const step = steps[currentStep];
  const isReview = step?.type === 'review';
  const isMeasurements = step?.type === 'measurements';
  const isCustomize = step?.type === 'customize';

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#050505] text-[#D4CFC9] flex flex-col md:flex-row selection:bg-[#F4F0EB] selection:text-[#050505]">
        
        {/* LEFT: VISUALIZATION */}
        <div className="w-full md:w-1/2 h-[50vh] md:h-screen sticky top-0 bg-[#0A0A0A] flex flex-col justify-center items-center overflow-hidden border-b md:border-b-0 md:border-r border-[#1A1A1A]">
          {product.images?.[0] ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0.8, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.8, scale: 1.02 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="w-full h-full relative"
              >
                <OptimizedImage 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-full h-full object-cover opacity-80 mix-blend-luminosity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-[10px] uppercase tracking-widest text-[#333]">Visual Confidential</div>
          )}
          
          <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
            <div>
              <h1 className="text-xl md:text-3xl font-display uppercase tracking-widest text-white mb-2">{product.name}</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#A39E98]">{product.editionStatus || 'COMMISSION'}</p>
            </div>
          </div>
        </div>

        {/* RIGHT: CONTROLS */}
        <div className="w-full md:w-1/2 min-h-[50vh] md:h-screen overflow-y-auto scrollbar-hide pt-24 md:pt-32 px-8 md:px-16 pb-32">
          
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#A39E98] hover:text-white transition-colors mb-12"
          >
            <ChevronLeft size={14} /> {currentStep === 0 ? 'Back to Collection' : 'Previous Step'}
          </button>

          <div className="mb-16">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                {isReview ? '07 — REVIEW' : 
                 isMeasurements ? '06 — MEASUREMENTS' : 
                 `0${currentStep + 1} — ${step?.group?.name || 'CONFIGURATION'}`}
              </h2>
              <span className="text-[10px] text-[#A39E98] tracking-widest">
                STEP {currentStep + 1} OF {steps.length}
              </span>
            </div>
            <div className="w-full h-[1px] bg-[#1A1A1A] relative">
              <div 
                className="absolute top-0 left-0 h-full bg-white transition-all duration-700 ease-out"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              {/* CUSTOMIZATION STEP */}
              {isCustomize && (
                <div className="space-y-6">
                  {step.group.options?.map((opt: any, idx: number) => {
                    const isSelected = selections[step.group.name] === opt.name;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelect(step.group.name, opt.name)}
                        className={`w-full text-left p-6 border transition-all duration-500 ${
                          isSelected 
                            ? 'border-white bg-white/5' 
                            : 'border-[#1A1A1A] hover:border-[#333]'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-xs uppercase tracking-widest font-bold ${isSelected ? 'text-white' : 'text-[#A39E98]'}`}>
                            {opt.name}
                          </span>
                          {opt.additionalPrice > 0 && (
                            <span className="text-[10px] tracking-widest text-[#A39E98]">+${opt.additionalPrice}</span>
                          )}
                        </div>
                        {opt.description && (
                          <p className="text-[10px] tracking-widest text-[#666] leading-relaxed max-w-sm">
                            {opt.description}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* MEASUREMENTS STEP */}
              {isMeasurements && (
                <div className="space-y-8">
                  <p className="text-xs text-[#A39E98] uppercase tracking-widest leading-relaxed mb-8 border-b border-[#1A1A1A] pb-8">
                    Please provide exact body measurements in centimeters (CM). Do not add ease.
                  </p>
                  <div className="grid grid-cols-2 gap-8">
                    {step.fields.map((field: string) => (
                      <div key={field}>
                        <label className="block text-[10px] uppercase tracking-widest text-white mb-4">{field}</label>
                        <input
                          type="number"
                          placeholder="CM"
                          value={measurements[field] || ''}
                          onChange={(e) => handleMeasurementChange(field, e.target.value)}
                          className="w-full bg-transparent border-b border-[#1A1A1A] py-3 text-xs tracking-widest text-white placeholder:text-[#333] focus:border-white outline-none transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* REVIEW STEP */}
              {isReview && (
                <div className="space-y-12">
                  <div className="border border-[#1A1A1A] p-8">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-white mb-6 border-b border-[#1A1A1A] pb-4">Configuration Summary</h3>
                    <ul className="space-y-4">
                      {Object.entries(selections).map(([group, option]) => (
                        <li key={group} className="flex justify-between text-xs tracking-widest uppercase">
                          <span className="text-[#A39E98]">{group}</span>
                          <span className="text-white text-right">{option}</span>
                        </li>
                      ))}
                      {Object.keys(selections).length === 0 && (
                        <li className="text-xs text-[#666] uppercase tracking-widest">No configurations selected</li>
                      )}
                    </ul>
                  </div>

                  {Object.keys(measurements).length > 0 && (
                    <div className="border border-[#1A1A1A] p-8">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-white mb-6 border-b border-[#1A1A1A] pb-4">Measurements (CM)</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(measurements).map(([field, val]) => (
                          <div key={field} className="flex justify-between text-xs tracking-widest uppercase">
                            <span className="text-[#A39E98]">{field}</span>
                            <span className="text-white">{val || '-'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white mb-4">Additional Notes for the Atelier (Optional)</label>
                    <textarea 
                      rows={4}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-transparent border border-[#1A1A1A] p-4 text-xs tracking-widest text-[#A39E98] focus:border-white focus:text-white outline-none transition-colors resize-none"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-16 pt-8 border-t border-[#1A1A1A]">
            {isReview ? (
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-white text-black px-8 py-5 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-between hover:bg-[#D4CFC9] transition-colors disabled:opacity-50"
              >
                <span>{submitting ? 'Transmitting...' : 'Submit Private Request'}</span>
                <ArrowRight size={16} strokeWidth={2} />
              </button>
            ) : (
              <button 
                onClick={handleNext}
                className="w-full border border-white text-white px-8 py-5 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-between hover:bg-white hover:text-black transition-colors"
              >
                <span>Next Step</span>
                <ArrowRight size={16} strokeWidth={2} />
              </button>
            )}
            
            {isReview && (
              <p className="mt-6 text-center text-[10px] uppercase tracking-widest text-[#666]">
                Submission does not guarantee allocation. You will receive a private quote if approved.
              </p>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
