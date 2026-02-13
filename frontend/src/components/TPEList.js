import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tpeAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaFileExcel, FaSearch } from 'react-icons/fa';

const TPEList = () => {
  const [tpes, setTpes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Filtres
  const [search, setSearch] = useState('');
  const [tpeModel, setTpeModel] = useState('');
  const [connectionType, setConnectionType] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    loadTpes();
  }, [page, search, tpeModel, connectionType]);

  const loadTpes = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize,
      };
      
      if (search) params.search = search;
      if (tpeModel) params.tpe_model = tpeModel;
      if (connectionType) params.connection_type = connectionType;
      
      const data = await tpeAPI.getAll(params);
      setTpes(data.items);
      setTotalPages(data.total_pages);
      setTotal(data.total);
    } catch (error) {
      toast.error('Failed to load TPE list');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this TPE?')) {
      try {
        await tpeAPI.delete(id);
        toast.success('TPE deleted successfully');
        loadTpes();
      } catch (error) {
        toast.error('Failed to delete TPE');
      }
    }
  };

  const handleExport = async () => {
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
  };

  const resetFilters = () => {
    setSearch('');
    setTpeModel('');
    setConnectionType('');
    setPage(1);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">TPE List</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-success" onClick={handleExport}>
            <FaFileExcel className="me-1" />
            Export Excel
          </button>
          <Link to="/tpe/new" className="btn btn-primary">
            <FaPlus className="me-1" />
            Add TPE
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Search</label>
              <div className="input-group">
                <span className="input-group-text">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Service name or ShopID..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
            
            <div className="col-md-3">
              <label className="form-label">TPE Model</label>
              <select
                className="form-select"
                value={tpeModel}
                onChange={(e) => {
                  setTpeModel(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Models</option>
                <option value="Ingenico Desk 5000">Ingenico Desk 5000</option>
                <option value="Ingenico Move 5000">Ingenico Move 5000</option>
              </select>
            </div>
            
            <div className="col-md-3">
              <label className="form-label">Connection Type</label>
              <select
                className="form-select"
                value={connectionType}
                onChange={(e) => {
                  setConnectionType(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Types</option>
                <option value="ethernet">Ethernet</option>
                <option value="4g5g">4G/5G</option>
              </select>
            </div>
            
            <div className="col-md-2 d-flex align-items-end">
              <button className="btn btn-secondary w-100" onClick={resetFilters}>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : tpes.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p>No TPE found</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ShopID</th>
                      <th>Service Name</th>
                      <th>Régisseur</th>
                      <th>Model</th>
                      <th>Nb TPE</th>
                      <th>Connection</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tpes.map((tpe) => (
                      <tr key={tpe.id}>
                        <td>
                          <strong>{tpe.shop_id}</strong>
                        </td>
                        <td>{tpe.service_name}</td>
                        <td>
                          {tpe.regisseur_prenom} {tpe.regisseur_nom}
                        </td>
                        <td>
                          <span className={`badge ${tpe.tpe_model === 'Ingenico Desk 5000' ? 'bg-info' : 'bg-success'}`}>
                            {tpe.tpe_model || 'N/A'}
                          </span>
                        </td>
                        <td>{tpe.number_of_tpe}</td>
                        <td>
                          {tpe.connection_ethernet && (
                            <span className="badge bg-warning text-dark me-1">Ethernet</span>
                          )}
                          {tpe.connection_4g5g && (
                            <span className="badge bg-secondary">4G/5G</span>
                          )}
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => navigate(`/tpe/${tpe.id}`)}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(tpe.id)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted">
                  Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} entries
                </div>
                <nav>
                  <ul className="pagination mb-0">
                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        Previous
                      </button>
                    </li>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    
                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TPEList;
