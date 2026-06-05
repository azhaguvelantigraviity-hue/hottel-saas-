import React, { useState, useRef, useCallback } from 'react';
import { parseBulkImportFile, saveBulkImportItems, uploadItemImage } from '../services/bulkImportService';
import * as XLSX from 'xlsx';
import Icon from './Icon';

const CATEGORY_COLORS = {
  Breakfast: '#F59E0B',
  Starters: '#10B981',
  'Main Course': '#8B5CF6',
  Breads: '#D4A574',
  Desserts: '#EC4899',
  Beverages: '#3B82F6',
  Snacks: '#F97316',
  Custom: '#6B7280',
};

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getPlaceholderStyle(name, category) {
  const baseHue = CATEGORY_COLORS[category] || '#6B7280';
  const hash = hashCode(name + category);
  const r = parseInt(baseHue.slice(1, 3), 16);
  const g = parseInt(baseHue.slice(3, 5), 16);
  const b = parseInt(baseHue.slice(5, 7), 16);
  const offset = hash % 60;
  const r2 = Math.min(255, Math.max(0, r + offset));
  const g2 = Math.min(255, Math.max(0, g - offset * 0.5));
  const b2 = Math.min(255, Math.max(0, b + offset * 0.3));
  return {
    background: `linear-gradient(135deg, rgb(${r},${g},${b}), rgb(${r2},${g2},${b2}))`,
  };
}

const BulkImportModal = ({ onClose, onComplete }) => {
  const [step, setStep] = useState('upload');
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [imageOverrides, setImageOverrides] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const [itemEdits, setItemEdits] = useState({});

  const fileInputRef = useRef(null);

  const handleFileSelect = useCallback(async (selectedFile) => {
    const valid = ['.xlsx', '.xls', '.csv'].some(ext => selectedFile.name.toLowerCase().endsWith(ext));
    if (!valid) {
      alert('Please select an Excel (.xlsx, .xls) or CSV file');
      return;
    }
    setFile(selectedFile);
    setStep('parsing');
    setLoading(true);
    setUploadProgress(0);
    try {
      const res = await parseBulkImportFile(selectedFile, setUploadProgress);
      if (res.success && res.data) {
        setParsedData(res.data);
        setStep('preview');
      } else {
        alert('Failed to parse file');
        setStep('upload');
      }
    } catch (err) {
      alert(err.message || 'Error parsing file');
      setStep('upload');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  }, [handleFileSelect]);

  const handleDragOver = (e) => e.preventDefault();

  const handleImageReplace = async (itemName, file) => {
    if (!file) return;
    try {
      const res = await uploadItemImage(file);
      if (res.success && res.data) {
        setImageOverrides(prev => ({ ...prev, [itemName]: res.data.url }));
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageOverrides(prev => ({ ...prev, [itemName]: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = (itemName) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      if (e.target.files[0]) handleImageReplace(itemName, e.target.files[0]);
    };
    input.click();
  };

  const handleItemEdit = (tempId, field, value) => {
    setItemEdits(prev => ({ ...prev, [tempId]: { ...prev[tempId], [field]: value } }));
  };

  const getItemValue = (item, field) => {
    if (itemEdits[item._tempId] && itemEdits[item._tempId][field] !== undefined) {
      return itemEdits[item._tempId][field];
    }
    return item[field];
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const finalItems = parsedData.items.map(item => ({
        ...item,
        ...(itemEdits[item._tempId] || {}),
      }));
      const res = await saveBulkImportItems(finalItems, imageOverrides);
      if (res.success) {
        onComplete(res.data);
        onClose();
      }
    } catch (err) {
      alert(err.message || 'Error saving items');
    } finally {
      setSaving(false);
    }
  };

  const btnStyle = {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
    fontFamily: 'Inter, sans-serif',
  };

  const downloadSample = () => {
    const ws = XLSX.utils.json_to_sheet([
      { 'Item Name': 'Masala Dosa', Category: 'Breakfast', Price: 120, Stock: 50, Description: 'Crispy dosa with potato filling', 'Image URL': 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4', Status: 'Available' },
      { 'Item Name': 'Paneer Tikka', Category: 'Starters', Price: 250, Stock: 20, Description: 'Grilled cottage cheese', 'Image URL': '', Status: 'Available' }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Menu Items');
    XLSX.writeFile(wb, 'Sample_Menu_Upload.xlsx');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontFamily: 'Poppins,sans-serif', fontSize: '20px', marginBottom: '4px' }}>Upload Food Items via Excel</h2>
            <p style={{ fontSize: '13px', color: 'var(--text3)' }}>
              {step === 'upload' ? 'Upload an Excel (.xlsx) file with your menu items' :
               step === 'parsing' ? 'Parsing file...' :
               `Review ${parsedData?.valid || 0} items before saving`}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Icon name="x" size={20} color="var(--text3)" />
          </button>
        </div>

        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {step === 'upload' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border)',
                  borderRadius: '12px',
                  padding: '60px 40px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: 'var(--surface)',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📄</div>
                <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px' }}>
                  Drag & drop your Excel file here
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '16px' }}>
                  or click to browse files
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', background: 'var(--void)', display: 'inline-block', padding: '6px 14px', borderRadius: '6px' }}>
                  Supported: .xlsx, .xls, .csv (max 5MB)
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  style={{ display: 'none' }}
                  onChange={e => e.target.files[0] && handleFileSelect(e.target.files[0])}
                />
              </div>
              <div style={{ textAlign: 'center' }}>
                <button 
                  onClick={downloadSample}
                  style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)', cursor: 'pointer', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}
                >
                  Download Sample Excel
                </button>
              </div>
            </div>
          )}

          {step === 'parsing' && (
            <div style={{ textAlign: 'center', padding: '60px 40px' }}>
              <div style={{
                width: '48px', height: '48px', border: '3px solid var(--gold)',
                borderTopColor: 'transparent', borderRadius: '50%',
                margin: '0 auto 16px', animation: 'spin 0.8s linear infinite'
              }} />
              <div style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '8px' }}>Parsing and analyzing file...</div>
              <div style={{ width: '200px', margin: '0 auto', background: 'var(--border)', borderRadius: '10px', overflow: 'hidden', height: '6px' }}>
                <div style={{ width: `${uploadProgress}%`, background: 'var(--gold)', height: '100%', borderRadius: '10px', transition: 'width 0.3s' }} />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '6px' }}>{uploadProgress}%</div>
            </div>
          )}

          {step === 'preview' && parsedData && (
            <div>
              {parsedData.errors && parsedData.errors.length > 0 && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#EF4444', marginBottom: '6px' }}>
                    ⚠ {parsedData.errors.length} row(s) with errors were skipped
                  </div>
                  {parsedData.errors.map((err, i) => (
                    <div key={i} style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '2px' }}>
                      Row {err.row}: <strong>{err.name || 'Unnamed'}</strong> — {err.errors.join(', ')}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ padding: '8px 14px', background: 'rgba(52,211,153,0.1)', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--green)' }}>
                  ✅ {parsedData.valid} valid items
                </div>
                {parsedData.invalid > 0 && (
                  <div style={{ padding: '8px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#EF4444' }}>
                    ❌ {parsedData.invalid} invalid rows
                  </div>
                )}
                <div style={{ padding: '8px 14px', background: 'var(--surface)', borderRadius: '8px', fontSize: '12px', color: 'var(--text3)' }}>
                  Total rows: {parsedData.total}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '14px' }}>
                {parsedData.items.map(item => {
                  const imgSrc = imageOverrides[item.name] || item.image;
                  const imgFailed = imageErrors[item._tempId];
                  return (
                    <div key={item._tempId} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div
                        onClick={() => handleImageClick(item.name)}
                        style={{
                          width: '100%', height: '140px', cursor: 'pointer', position: 'relative',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          overflow: 'hidden',
                          ...(imgFailed || !imgSrc ? getPlaceholderStyle(item.name, item.category) : {}),
                        }}
                      >
                        {imgSrc && !imgFailed ? (
                          <img
                            src={imgSrc}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={() => setImageErrors(prev => ({ ...prev, [item._tempId]: true }))}
                          />
                        ) : (
                          <div style={{ color: '#fff', fontSize: '16px', fontWeight: '700', textAlign: 'center', padding: '10px', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                            {item.name}
                          </div>
                        )}
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                        >
                          <div style={{ color: '#fff', fontSize: '13px', fontWeight: '600', background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: '6px' }}>
                            {imageOverrides[item.name] ? 'Change Image' : 'Click to set image'}
                          </div>
                        </div>
                      </div>

                      <div style={{ padding: '12px' }}>
                        <input
                          value={getItemValue(item, 'name')}
                          onChange={e => handleItemEdit(item._tempId, 'name', e.target.value)}
                          style={{
                            width: '100%', padding: '4px 6px', background: 'transparent', border: 'none',
                            borderBottom: '1px solid var(--border)', color: 'var(--text)', fontSize: '14px',
                            fontWeight: '700', outline: 'none', fontFamily: 'Inter, sans-serif', marginBottom: '6px',
                          }}
                        />
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                          <div style={{ flex: 1 }}>
                            <select
                              value={getItemValue(item, 'category')}
                              onChange={e => handleItemEdit(item._tempId, 'category', e.target.value)}
                              style={{ width: '100%', padding: '3px 4px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)', fontSize: '11px', outline: 'none' }}
                            >
                              {['Breakfast','Starters','Main Course','Breads','Desserts','Beverages','Snacks','Custom'].map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                          <input
                            type="number"
                            value={getItemValue(item, 'price')}
                            onChange={e => handleItemEdit(item._tempId, 'price', parseFloat(e.target.value) || 0)}
                            style={{ width: '70px', padding: '3px 4px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--gold)', fontSize: '12px', fontWeight: '700', textAlign: 'right', outline: 'none' }}
                          />
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text3)', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Stock: {getItemValue(item, 'stock') || '∞'}</span>
                          <span>{getItemValue(item, 'available') ? 'Available' : 'Unavailable'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {parsedData.items.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
                  No valid items found in the file.
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            {step === 'preview' && (
              <button onClick={() => { setStep('upload'); setFile(null); setParsedData(null); }} style={{ ...btnStyle, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)' }}>
                ← Back to Upload
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onClose} style={{ ...btnStyle, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)' }}>
              Cancel
            </button>
            {step === 'preview' && parsedData && parsedData.valid > 0 && (
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  ...btnStyle,
                  background: saving ? 'var(--border)' : 'linear-gradient(135deg,#C9A84C,#8A6F2E)',
                  color: saving ? 'var(--text3)' : '#fff',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  boxShadow: saving ? 'none' : '0 4px 12px rgba(201,168,76,0.2)',
                }}
              >
                {saving ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Saving...
                  </span>
                ) : (
                  `Import ${parsedData.valid} Item${parsedData.valid > 1 ? 's' : ''}`
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;
