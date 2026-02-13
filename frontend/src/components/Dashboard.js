import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tpeAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaServer, FaDesktop, FaMobileAlt, FaNetworkWired, FaSignal, FaEnvelope } from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await tpeAPI.getStats();
      setStats(data);
    } catch (error) {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: 'Total TPE',
      value: stats?.total || 0,
      icon: <FaServer size={32} />,
      color: 'primary',
      bgColor: 'bg-primary',
    },
    {
      title: 'Ingenico Desk 5000',
      value: stats?.desk_count || 0,
      icon: <FaDesktop size={32} />,
      color: 'info',
      bgColor: 'bg-info',
    },
    {
      title: 'Ingenico Move 5000',
      value: stats?.move_count || 0,
      icon: <FaMobileAlt size={32} />,
      color: 'success',
      bgColor: 'bg-success',
    },
    {
      title: 'Ethernet Connection',
      value: stats?.ethernet_count || 0,
      icon: <FaNetworkWired size={32} />,
      color: 'warning',
      bgColor: 'bg-warning',
    },
    {
      title: '4G/5G Connection',
      value: stats?.mobile_count || 0,
      icon: <FaSignal size={32} />,
      color: 'secondary',
      bgColor: 'bg-secondary',
    },
    {
      title: 'Backoffice Active',
      value: stats?.backoffice_active_count || 0,
      icon: <FaEnvelope size={32} />,
      color: 'danger',
      bgColor: 'bg-danger',
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Dashboard</h2>
        <Link to="/tpe/new" className="btn btn-primary">
          Add New TPE
        </Link>
      </div>

      <div className="row g-4">
        {cards.map((card, index) => (
          <div key={index} className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1">{card.title}</p>
                    <h3 className="mb-0 fw-bold">{card.value}</h3>
                  </div>
                  <div className={`${card.bgColor} text-white p-3 rounded`}>
                    {card.icon}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Quick Actions</h5>
              <div className="d-flex gap-2 flex-wrap">
                <Link to="/tpe" className="btn btn-outline-primary">
                  View All TPE
                </Link>
                <Link to="/tpe/new" className="btn btn-outline-success">
                  Add New TPE
                </Link>
                <button 
                  className="btn btn-outline-info"
                  onClick={async () => {
                    try {
                      const blob = await tpeAPI.exportExcel();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `tpe_export_${new Date().getTime()}.xlsx`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      toast.success('Export successful!');
                    } catch (error) {
                      toast.error('Export failed');
                    }
                  }}
                >
                  Export to Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
