import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tpeAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const TPEForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    service_name: '',
    shop_id: '',
    regisseur_prenom: '',
    regisseur_nom: '',
    regisseur_telephone: '',
    regisseurs_suppleants: '',
    merchant_cards: [],
    tpe_model: '',
    number_of_tpe: 1,
    connection_ethernet: false,
    connection_4g5g: false,
    network_ip_address: '',
    network_mask: '',
    network_gateway: '',
    backoffice_active: false,
    backoffice_email: '',
  });

  useEffect(() => {
    if (isEdit) {
      loadTPE();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  const loadTPE = async () => {
    setLoading(true);
    try {
      const data = await tpeAPI.getById(id);
      setFormData(data);
    } catch (error) {
      toast.error('Failed to load TPE data');
      navigate('/tpe');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleMerchantCardChange = (index, field, value) => {
    const newCards = [...formData.merchant_cards];
    newCards[index] = {
      ...newCards[index],
      [field]: value,
    };
    setFormData(prev => ({
      ...prev,
      merchant_cards: newCards,
    }));
  };

  const addMerchantCard = () => {
    if (formData.merchant_cards.length >= 8) {
      toast.warning('Maximum 8 merchant cards allowed');
      return;
    }
    setFormData(prev => ({
      ...prev,
      merchant_cards: [...prev.merchant_cards, { numero: '', numero_serie_tpe: '' }],
    }));
  };

  const removeMerchantCard = (index) => {
    setFormData(prev => ({
      ...prev,
      merchant_cards: prev.merchant_cards.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Préparer les données
      const submitData = {
        ...formData,
        number_of_tpe: parseInt(formData.number_of_tpe),
      };

      // Retirer les champs vides optionnels
      if (!submitData.shop_id) delete submitData.shop_id;
      if (!submitData.regisseur_prenom) delete submitData.regisseur_prenom;
      if (!submitData.regisseur_nom) delete submitData.regisseur_nom;
      if (!submitData.regisseur_telephone) delete submitData.regisseur_telephone;
      if (!submitData.regisseurs_suppleants) delete submitData.regisseurs_suppleants;
      if (!submitData.tpe_model) delete submitData.tpe_model;
      if (!submitData.backoffice_email) delete submitData.backoffice_email;
      
      // Retirer config réseau si Ethernet non sélectionné
      if (!submitData.connection_ethernet) {
        delete submitData.network_ip_address;
        delete submitData.network_mask;
        delete submitData.network_gateway;
      }

      if (isEdit) {
        await tpeAPI.update(id, submitData);
        toast.success('TPE updated successfully');
      } else {
        await tpeAPI.create(submitData);
        toast.success('TPE created successfully');
      }
      
      navigate('/tpe');
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Operation failed';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">{isEdit ? 'Edit TPE' : 'Add New TPE'}</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/tpe')}>
          <FaTimes className="me-1" />
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Informations de base */}
        <div className="card mb-3">
          <div className="card-header">
            <h5 className="mb-0">Basic Information</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Service Name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="service_name"
                  value={formData.service_name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="col-md-6">
                <label className="form-label">ShopID</label>
                <input
                  type="text"
                  className="form-control"
                  name="shop_id"
                  value={formData.shop_id}
                  onChange={handleChange}
                  placeholder="Auto-generated if empty"
                />
                <small className="text-muted">Leave empty for auto-generation</small>
              </div>
            </div>
          </div>
        </div>

        {/* Régisseur */}
        <div className="card mb-3">
          <div className="card-header">
            <h5 className="mb-0">Manager (Régisseur)</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">First Name (Prénom)</label>
                <input
                  type="text"
                  className="form-control"
                  name="regisseur_prenom"
                  value={formData.regisseur_prenom}
                  onChange={handleChange}
                />
              </div>
              
              <div className="col-md-4">
                <label className="form-label">Last Name (Nom)</label>
                <input
                  type="text"
                  className="form-control"
                  name="regisseur_nom"
                  value={formData.regisseur_nom}
                  onChange={handleChange}
                />
              </div>
              
              <div className="col-md-4">
                <label className="form-label">Phone (Téléphone)</label>
                <input
                  type="tel"
                  className="form-control"
                  name="regisseur_telephone"
                  value={formData.regisseur_telephone}
                  onChange={handleChange}
                />
              </div>
              
              <div className="col-12">
                <label className="form-label">Alternate Managers (Régisseurs Suppléants)</label>
                <textarea
                  className="form-control"
                  name="regisseurs_suppleants"
                  value={formData.regisseurs_suppleants}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Optional: List alternate managers"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cartes commerçants */}
        <div className="card mb-3">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Merchant Cards (Max 8)</h5>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={addMerchantCard}
              disabled={formData.merchant_cards.length >= 8}
            >
              <FaPlus className="me-1" />
              Add Card
            </button>
          </div>
          <div className="card-body">
            {formData.merchant_cards.length === 0 ? (
              <p className="text-muted text-center">No merchant cards added</p>
            ) : (
              formData.merchant_cards.map((card, index) => (
                <div key={index} className="row g-2 mb-2 align-items-end">
                  <div className="col-md-5">
                    <label className="form-label">Card Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={card.numero}
                      onChange={(e) => handleMerchantCardChange(index, 'numero', e.target.value)}
                      placeholder="Card number"
                    />
                  </div>
                  <div className="col-md-5">
                    <label className="form-label">TPE Serial Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={card.numero_serie_tpe}
                      onChange={(e) => handleMerchantCardChange(index, 'numero_serie_tpe', e.target.value)}
                      placeholder="Serial number"
                    />
                  </div>
                  <div className="col-md-2">
                    <button
                      type="button"
                      className="btn btn-danger w-100"
                      onClick={() => removeMerchantCard(index)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Configuration TPE */}
        <div className="card mb-3">
          <div className="card-header">
            <h5 className="mb-0">TPE Configuration</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">TPE Model</label>
                <select
                  className="form-select"
                  name="tpe_model"
                  value={formData.tpe_model}
                  onChange={handleChange}
                >
                  <option value="">Select a model</option>
                  <option value="Ingenico Desk 5000">Ingenico Desk 5000</option>
                  <option value="Ingenico Move 5000">Ingenico Move 5000</option>
                </select>
              </div>
              
              <div className="col-md-6">
                <label className="form-label">Number of TPE</label>
                <input
                  type="number"
                  className="form-control"
                  name="number_of_tpe"
                  value={formData.number_of_tpe}
                  onChange={handleChange}
                  min="1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Connexion */}
        <div className="card mb-3">
          <div className="card-header">
            <h5 className="mb-0">Connection Types</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="connection_ethernet"
                    name="connection_ethernet"
                    checked={formData.connection_ethernet}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="connection_ethernet">
                    Ethernet Connection
                  </label>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="connection_4g5g"
                    name="connection_4g5g"
                    checked={formData.connection_4g5g}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="connection_4g5g">
                    4G/5G Connection
                  </label>
                </div>
              </div>
            </div>

            {/* Configuration réseau (visible uniquement si Ethernet) */}
            {formData.connection_ethernet && (
              <div className="mt-3">
                <hr />
                <h6 className="mb-3">Network Configuration</h6>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">IP Address</label>
                    <input
                      type="text"
                      className="form-control"
                      name="network_ip_address"
                      value={formData.network_ip_address}
                      onChange={handleChange}
                      placeholder="192.168.1.100"
                    />
                  </div>
                  
                  <div className="col-md-4">
                    <label className="form-label">Subnet Mask</label>
                    <input
                      type="text"
                      className="form-control"
                      name="network_mask"
                      value={formData.network_mask}
                      onChange={handleChange}
                      placeholder="255.255.255.0"
                    />
                  </div>
                  
                  <div className="col-md-4">
                    <label className="form-label">Gateway</label>
                    <input
                      type="text"
                      className="form-control"
                      name="network_gateway"
                      value={formData.network_gateway}
                      onChange={handleChange}
                      placeholder="192.168.1.1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Backoffice */}
        <div className="card mb-3">
          <div className="card-header">
            <h5 className="mb-0">Backoffice Access</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="backoffice_active"
                    name="backoffice_active"
                    checked={formData.backoffice_active}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="backoffice_active">
                    Backoffice Active
                  </label>
                </div>
              </div>
              
              {formData.backoffice_active && (
                <div className="col-md-6">
                  <label className="form-label">Backoffice Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="backoffice_email"
                    value={formData.backoffice_email}
                    onChange={handleChange}
                    placeholder="backoffice@example.com"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="d-flex gap-2 justify-content-end">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/tpe')}
          >
            <FaTimes className="me-1" />
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            <FaSave className="me-1" />
            {loading ? 'Saving...' : isEdit ? 'Update TPE' : 'Create TPE'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TPEForm;
