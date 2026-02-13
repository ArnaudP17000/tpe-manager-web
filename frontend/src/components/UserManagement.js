import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaUserShield, FaUser } from 'react-icons/fa';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    is_active: true,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await usersAPI.getAll();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'user',
      is_active: true,
    });
    setEditingUser(null);
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email || '',
        password: '',
        role: user.role,
        is_active: user.is_active,
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const submitData = { ...formData };
      
      // Supprimer le mot de passe vide pour les mises à jour
      if (editingUser && !submitData.password) {
        delete submitData.password;
      }
      
      // Supprimer l'email vide
      if (!submitData.email) {
        delete submitData.email;
      }

      if (editingUser) {
        // Ne pas envoyer le username lors de la mise à jour
        delete submitData.username;
        await usersAPI.update(editingUser.id, submitData);
        toast.success('User updated successfully');
      } else {
        await usersAPI.create(submitData);
        toast.success('User created successfully');
      }

      handleCloseModal();
      loadUsers();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Operation failed';
      toast.error(errorMsg);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await usersAPI.delete(userId);
        toast.success('User deleted successfully');
        loadUsers();
      } catch (error) {
        const errorMsg = error.response?.data?.detail || 'Failed to delete user';
        toast.error(errorMsg);
      }
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">User Management</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <FaPlus className="me-1" />
          Add User
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.username}</strong>
                    </td>
                    <td>{user.email || 'N/A'}</td>
                    <td>
                      {user.role === 'admin' ? (
                        <span className="badge bg-warning text-dark">
                          <FaUserShield className="me-1" />
                          Admin
                        </span>
                      ) : (
                        <span className="badge bg-secondary">
                          <FaUser className="me-1" />
                          User
                        </span>
                      )}
                    </td>
                    <td>
                      {user.is_active ? (
                        <span className="badge bg-success">Active</span>
                      ) : (
                        <span className="badge bg-danger">Inactive</span>
                      )}
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleOpenModal(user)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(user.id)}
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
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Username *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        disabled={editingUser}
                      />
                      {editingUser && (
                        <small className="text-muted">Username cannot be changed</small>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Password {editingUser ? '' : '*'}
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required={!editingUser}
                        minLength="6"
                      />
                      {editingUser && (
                        <small className="text-muted">Leave empty to keep current password</small>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Role *</label>
                      <select
                        className="form-select"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="is_active"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="is_active">
                          Active
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingUser ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}
    </div>
  );
};

export default UserManagement;
