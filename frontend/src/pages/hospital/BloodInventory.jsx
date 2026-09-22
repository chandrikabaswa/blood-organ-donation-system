import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export const BloodInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editUnits, setEditUnits] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hospital/inventory');
      setInventory(res.data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load blood inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleEditClick = (item) => {
    setEditingGroup(item.bloodGroup);
    setEditUnits(item.units);
    setMessage('');
    setError('');
  };

  const handleSaveUpdate = async (bloodGroup) => {
    try {
      setUpdating(true);
      setError('');
      const res = await api.put('/hospital/inventory', {
        bloodGroup,
        units: Number(editUnits),
      });

      setInventory((prev) =>
        prev.map((item) =>
          item.bloodGroup === bloodGroup ? { ...item, units: res.data.item.units } : item
        )
      );

      setMessage(`Inventory for ${bloodGroup} updated to ${res.data.item.units} unit(s).`);
      setEditingGroup(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error updating inventory:', err);
      setError(err.response?.data?.message || 'Failed to update units.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', color: '#64748b' }}>Loading blood inventory...</div>;
  }

  const totalUnits = inventory.reduce((sum, item) => sum + (item.units || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Blood Inventory</h1>
          <p className="page-subtitle">Track and update stock across all 8 standard blood groups</p>
        </div>
        <div className="card" style={{ margin: 0, padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>TOTAL UNITS IN STOCK:</span>
          <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#dc2626' }}>{totalUnits}</span>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Grid of 8 Blood Groups */}
      <div className="inventory-grid">
        {inventory.map((item) => {
          const isCurrentEditing = editingGroup === item.bloodGroup;

          return (
            <div key={item.bloodGroup} className="inventory-card">
              <div className="blood-type-badge">{item.bloodGroup}</div>

              {isCurrentEditing ? (
                <div style={{ width: '100%', marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', textAlign: 'center' }}>
                    Set Units:
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={editUnits}
                    onChange={(e) => setEditUnits(e.target.value)}
                    style={{ textAlign: 'center', fontWeight: '700' }}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem' }}>
                    <button
                      onClick={() => handleSaveUpdate(item.bloodGroup)}
                      disabled={updating}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                    >
                      {updating ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingGroup(null)}
                      disabled={updating}
                      className="btn btn-secondary btn-sm"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="inventory-units">{item.units}</div>
                  <div className="inventory-unit-label">Units Available</div>
                  <button
                    onClick={() => handleEditClick(item)}
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%' }}
                  >
                    ✏️ Update Units
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BloodInventory;
