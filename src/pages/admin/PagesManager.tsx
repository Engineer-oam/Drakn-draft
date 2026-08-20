import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Save, Plus, Trash2 } from 'lucide-react';

const PAGE_TEMPLATES = [
  { id: 'about', title: 'About DRAKN' },
  { id: 'customer-care', title: 'Customer Care' },
  { id: 'shipping', title: 'Shipping' },
  { id: 'returns', title: 'Returns & Exchanges' },
  { id: 'privacy', title: 'Privacy Policy' },
  { id: 'terms', title: 'Terms & Conditions' }
];

export function PagesManager() {
  const [selectedPage, setSelectedPage] = useState(PAGE_TEMPLATES[0].id);
  const [pageData, setPageData] = useState<any>({ title: '', subtitle: '', sections: [] });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPage(selectedPage);
  }, [selectedPage]);

  const fetchPage = async (pageId: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'pages', pageId);
      const snap = await getDoc(docRef); // oh wait, getDoc is not imported, let's just use getDoc from firestore
      if (snap.exists()) {
        setPageData(snap.data());
      } else {
        const template = PAGE_TEMPLATES.find(t => t.id === pageId);
        setPageData({ title: template?.title || '', subtitle: '', sections: [] });
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
      await setDoc(doc(db, 'pages', selectedPage), {
        ...pageData,
        updatedAt: new Date()
      });
      alert('Page saved successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    setPageData((prev: any) => ({
      ...prev,
      sections: [...(prev.sections || []), { heading: '', body: '' }]
    }));
  };

  const updateSection = (index: number, field: string, value: string) => {
    const newSections = [...(pageData.sections || [])];
    newSections[index] = { ...newSections[index], [field]: value };
    setPageData({ ...pageData, sections: newSections });
  };

  const removeSection = (index: number) => {
    const newSections = [...(pageData.sections || [])];
    newSections.splice(index, 1);
    setPageData({ ...pageData, sections: newSections });
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-display uppercase tracking-widest text-drakn-light">Page Content Management</h1>
        <button 
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 bg-drakn-light text-drakn-base px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-3 space-y-2">
          {PAGE_TEMPLATES.map(page => (
            <button
              key={page.id}
              onClick={() => setSelectedPage(page.id)}
              className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest border transition-colors ${selectedPage === page.id ? 'border-drakn-light text-drakn-light bg-drakn-light/5' : 'border-transparent text-drakn-muted hover:bg-drakn-graphite/50'}`}
            >
              {page.title}
            </button>
          ))}
        </div>

        <div className="col-span-9 bg-drakn-graphite/20 border border-drakn-graphite p-8">
          {loading ? (
            <div className="text-drakn-muted text-xs uppercase tracking-widest">Loading...</div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-drakn-muted mb-2">Page Title</label>
                  <input 
                    type="text" 
                    value={pageData.title || ''}
                    onChange={e => setPageData({ ...pageData, title: e.target.value })}
                    className="w-full bg-drakn-base border border-drakn-graphite p-3 text-xs text-drakn-light focus:border-drakn-light outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-drakn-muted mb-2">Subtitle (Optional)</label>
                  <input 
                    type="text" 
                    value={pageData.subtitle || ''}
                    onChange={e => setPageData({ ...pageData, subtitle: e.target.value })}
                    className="w-full bg-drakn-base border border-drakn-graphite p-3 text-xs text-drakn-light focus:border-drakn-light outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-drakn-graphite pt-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-drakn-light">Content Sections</h3>
                  <button onClick={addSection} className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-drakn-muted hover:text-drakn-light transition-colors">
                    <Plus size={14} /> Add Section
                  </button>
                </div>

                <div className="space-y-6">
                  {(pageData.sections || []).map((section: any, idx: number) => (
                    <div key={idx} className="border border-drakn-graphite p-6 relative group">
                      <button 
                        onClick={() => removeSection(idx)}
                        className="absolute top-4 right-4 text-drakn-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="mb-4 pr-8">
                        <label className="block text-[10px] uppercase tracking-widest text-drakn-muted mb-2">Section Heading (Optional)</label>
                        <input 
                          type="text" 
                          value={section.heading || ''}
                          onChange={e => updateSection(idx, 'heading', e.target.value)}
                          className="w-full bg-drakn-base border border-drakn-graphite p-3 text-xs text-drakn-light focus:border-drakn-light outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-drakn-muted mb-2">Body Text (HTML Supported)</label>
                        <textarea 
                          rows={6}
                          value={section.body || ''}
                          onChange={e => updateSection(idx, 'body', e.target.value)}
                          className="w-full bg-drakn-base border border-drakn-graphite p-3 text-xs text-drakn-light focus:border-drakn-light outline-none resize-none font-mono"
                        />
                      </div>
                    </div>
                  ))}
                  {(!pageData.sections || pageData.sections.length === 0) && (
                    <div className="text-center p-8 border border-dashed border-drakn-graphite text-drakn-muted text-xs uppercase tracking-widest">
                      No sections added yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
