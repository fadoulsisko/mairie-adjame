// app/audiences/demander/page.jsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function DemanderAudience() {
  const [formData, setFormData] = useState({
    nomCitoyen: '',
    prenomCitoyen: '',
    email: '',
    telephone: '',
    objet: '',
    message: '',
    dateDemandee: '',
    heureDemandee: '',
  });

  const [creneaux, setCreneaux] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCreneaux = async () => {
      try {
        const mairieId = process.env.NEXT_PUBLIC_MAIRIE_ID;
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/creneaux`,
          {
            headers: { 'x-mairie-id': mairieId }
          }
        );
        setCreneaux(response.data);
      } catch (error) {
        console.error('Erreur chargement creneaux:', error);
      }
    };

    fetchCreneaux();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const mairieId = process.env.NEXT_PUBLIC_MAIRIE_ID;
      
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/audiences/submit`,
        formData,
        {
          headers: { 'x-mairie-id': mairieId }
        }
      );

      setSuccess(true);
      setFormData({
        nomCitoyen: '',
        prenomCitoyen: '',
        email: '',
        telephone: '',
        objet: '',
        message: '',
        dateDemandee: '',
        heureDemandee: '',
      });

      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      setError(
        err.response?.data?.error || 
        'Erreur lors de la soumission de la demande'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 bg-gray-50 min-h-screen">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-4xl font-bold mb-4 text-center">Demander une Audience</h1>
        <p className="text-center text-gray-600 mb-12">
          Remplissez le formulaire ci-dessous pour demander un rendez-vous avec un responsable
        </p>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="text-green-800 font-bold mb-1">✅ Demande envoyée avec succès!</h3>
            <p className="text-green-700">
              Vous recevrez une notification par email dès que votre demande aura été traitée.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-bold mb-1">❌ Erreur</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          
          {/* Identité */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900">Vos informations personnelles</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  name="nomCitoyen"
                  value={formData.nomCitoyen}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom
                </label>
                <input
                  type="text"
                  name="prenomCitoyen"
                  value={formData.prenomCitoyen}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900">Contact</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Audience Details */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900">Détails de la demande</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Objet de la demande *
              </label>
              <select
                name="objet"
                value={formData.objet}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Sélectionner --</option>
                <option value="etat-civil">État civil</option>
                <option value="permis-construction">Permis de construction</option>
                <option value="fiscal">Fiscal</option>
                <option value="urbanisme">Urbanisme</option>
                <option value="social">Social</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message supplémentaire
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Décrivez brièvement votre demande..."
              />
            </div>
          </div>

          {/* Créneau */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900">Créneau demandé</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  name="dateDemandee"
                  value={formData.dateDemandee}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heure (optionnel)
                </label>
                <input
                  type="time"
                  name="heureDemandee"
                  value={formData.heureDemandee}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {creneaux.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-2">Créneaux disponibles :</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  {creneaux.map(creneau => (
                    <li key={creneau.id}>
                      {creneau.jour}: {creneau.heureDebut} - {creneau.heureFin} 
                      ({creneau.capacite} place{creneau.capacite > 1 ? 's' : ''})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Envoi en cours...' : 'Soumettre la demande'}
            </button>
            <button
              type="reset"
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
