// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export default function Dashboard({ token, user }) {
  const [dashboard, setDashboard] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, trendsRes] = await Promise.all([
          axios.get(`${API_URL}/analytics/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/analytics/audiences/trends`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setDashboard(dashRes.data);
        setTrends(trendsRes.data);
      } catch (error) {
        console.error('Erreur chargement dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return <div className="text-center py-12">Chargement du dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Statistiques clés */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard
          title="Audiences en attente"
          value={dashboard?.audiences?.pending || 0}
          icon="📋"
          color="bg-yellow-50"
        />
        <StatCard
          title="Confirmées aujourd'hui"
          value={dashboard?.audiences?.confirmedToday || 0}
          icon="✅"
          color="bg-green-50"
        />
        <StatCard
          title="Articles"
          value={dashboard?.content?.recentArticles?.length || 0}
          icon="📝"
          color="bg-blue-50"
        />
        <StatCard
          title="Événements"
          value={dashboard?.content?.upcomingEvents?.length || 0}
          icon="📅"
          color="bg-purple-50"
        />
      </div>

      {/* Audiences VIP */}
      {dashboard?.audiences?.vip?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-red-900 mb-4">🚨 Audiences VIP/Urgentes</h3>
          <div className="space-y-2">
            {dashboard.audiences.vip.map(audience => (
              <div key={audience.id} className="flex justify-between items-center p-2 bg-white rounded">
                <div>
                  <p className="font-semibold text-gray-900">{audience.nomCitoyen}</p>
                  <p className="text-sm text-gray-600">{audience.objet}</p>
                </div>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  {audience.priorite}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Graphique tendances */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold mb-6">Tendance des demandes d'audience</h3>
        {trends.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="demandes" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Répartition */}
      <div className="grid grid-cols-2 gap-6">
        {/* Articles récents */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4">Articles récents</h3>
          <div className="space-y-3">
            {dashboard?.content?.recentArticles?.map(article => (
              <div key={article.id} className="flex justify-between items-start border-b pb-2">
                <p className="font-medium text-gray-900">{article.titre}</p>
                <span className="text-xs text-gray-500">
                  {new Date(article.publishedAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Événements à venir */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4">Événements à venir</h3>
          <div className="space-y-3">
            {dashboard?.content?.upcomingEvents?.map(event => (
              <div key={event.id} className="flex justify-between items-start border-b pb-2">
                <div>
                  <p className="font-medium text-gray-900">{event.titre}</p>
                  <p className="text-xs text-gray-500">{event.lieu}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className={`${color} rounded-lg p-6 border-l-4 border-blue-600`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}
