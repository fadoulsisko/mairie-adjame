// src/pages/Audiences.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export default function Audiences({ token, user }) {
  const [audiences, setAudiences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState(null);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchAudiences();
  }, [page, filter]);

  const fetchAudiences = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/audiences?page=${page}`;
      if (filter) url += `&status=${filter}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAudiences(response.data.audiences);
      setTotal(response.data.pagination.total);
    } catch (error) {
      console.error('Erreur chargement audiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (audienceId, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/audiences/${audienceId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAudiences();
      setSelectedAudience(null);
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      EN_ATTENTE: 'bg-yellow-100 text-yellow-800',
      CONFIRMEE: 'bg-green-100 text-green-800',
      REFUSEE: 'bg-red-100 text-red-800',
      REPORTEE: 'bg-blue-100 text-blue-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || ''}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold mb-4">Filtres</h3>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Toutes les demandes</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="CONFIRMEE">Confirmée</option>
          <option value="REFUSEE">Refusée</option>
          <option value="REPORTEE">Reportée</option>
        </select>
      </div>

      {/* Tableau audiences */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Citoyen</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Objet</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date demandée</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Statut</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {audiences.map(audience => (
              <tr key={audience.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{audience.nomCitoyen} {audience.prenomCitoyen}</p>
                  <p className="text-sm text-gray-600">{audience.email}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{audience.objet}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(audience.dateDemandee).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={audience.status} />
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setSelectedAudience(audience)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                  >
                    Voir détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: Math.ceil(total / 20) }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 rounded ${
              page === i + 1
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Modal détails */}
      {selectedAudience && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Détails audience</h2>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600">Nom</p>
                <p className="font-semibold text-gray-900">{selectedAudience.nomCitoyen} {selectedAudience.prenomCitoyen}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{selectedAudience.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Téléphone</p>
                <p className="font-semibold text-gray-900">{selectedAudience.telephone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Objet</p>
                <p className="font-semibold text-gray-900">{selectedAudience.objet}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date demandée</p>
                <p className="font-semibold text-gray-900">
                  {new Date(selectedAudience.dateDemandee).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Heure</p>
                <p className="font-semibold text-gray-900">{selectedAudience.heureDemandee || 'Non spécifiée'}</p>
              </div>
            </div>

            {selectedAudience.message && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Message</p>
                <p className="p-3 bg-gray-50 rounded text-gray-900">{selectedAudience.message}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => handleUpdateStatus(selectedAudience.id, 'CONFIRMEE')}
                className="flex-1 bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700 transition"
              >
                ✅ Confirmer
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedAudience.id, 'REFUSEE')}
                className="flex-1 bg-red-600 text-white py-2 rounded font-medium hover:bg-red-700 transition"
              >
                ❌ Refuser
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedAudience.id, 'REPORTEE')}
                className="flex-1 bg-yellow-600 text-white py-2 rounded font-medium hover:bg-yellow-700 transition"
              >
                📅 Reporter
              </button>
            </div>

            <button
              onClick={() => setSelectedAudience(null)}
              className="w-full bg-gray-300 text-gray-900 py-2 rounded font-medium hover:bg-gray-400 transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
