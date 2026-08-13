import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Reports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/reports')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.reports)) {
          setReports(data.reports);
        }
      })
      .catch(() => setReports([]));
  }, []);

  const handleResolve = (id, action) => {
    setReports(prev => prev.map(r => r._id === id ? { ...r, status: action } : r));
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Reports & Disputes Queue</h2>
        <p style={{ fontSize: '13px', color: '#9CA3AF' }}>Review flag complaints submitted by buyers and sellers</p>
      </div>

      {reports.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px' }}>
          <AlertTriangle size={36} color="#818CF8" style={{ marginBottom: '12px' }} />
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>No Pending Dispute Reports</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>Showing live database records only. Platform reports will appear here when filed.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reports.map(rep => (
            <div key={rep._id} className="glass-panel" style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '12px', borderRadius: '12px' }}>
                  <AlertTriangle size={20} color="#EF4444" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="badge badge-flagged" style={{ textTransform: 'capitalize' }}>{rep.targetType || 'Item'} Report</span>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{rep.targetTitle || 'Reported Content'}</h3>
                  </div>
                  <div style={{ fontSize: '13px', color: '#FBBF24', fontWeight: 600, marginTop: '4px' }}>Reason: {rep.reason}</div>
                  <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>"{rep.description}"</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {rep.status === 'pending' ? (
                  <>
                    <button className="glass-btn btn-success" onClick={() => handleResolve(rep._id, 'action_taken')}>
                      <ShieldCheck size={14} /> Action Taken
                    </button>
                    <button className="glass-btn" onClick={() => handleResolve(rep._id, 'dismissed')}>
                      Dismiss
                    </button>
                  </>
                ) : (
                  <span className="badge badge-active">{rep.status}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
