// app/page.jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [services, setServices] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mairieId = process.env.NEXT_PUBLIC_MAIRIE_ID;
        const headers = { 'x-mairie-id': mairieId };

        const [articlesRes, servicesRes, evenementsRes, configRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/articles`, { headers }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/services`, { headers }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/evenements`, { headers }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/config/public`, { headers }),
        ]);

        setArticles(articlesRes.data.slice(0, 3));
        setServices(servicesRes.data.slice(0, 6));
        setEvenements(evenementsRes.data.slice(0, 3));
        setConfig(configRes.data);
      } catch (error) {
        console.error('Erreur chargement données:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 px-4 text-center" style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}>
        <div className="container mx-auto">
          <h1 className="text-5xl font-bold mb-4">Bienvenue à {config?.name || 'la Mairie'}</h1>
          <p className="text-xl text-gray-100 mb-8">{config?.description}</p>
          <Link 
            href="/audiences/demander"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100"
          >
            Demander une audience
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Nos Services</h2>
          <div className="grid grid-cols-3 gap-8">
            {services.map(service => (
              <div key={service.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                {service.imageUrl && (
                  <img src={service.imageUrl} alt={service.nom} className="w-full h-40 object-cover rounded mb-4" />
                )}
                <h3 className="text-xl font-bold mb-2">{service.nom}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{service.description}</p>
                <Link 
                  href={`/services/${service.slug}`}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  En savoir plus →
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link 
              href="/services"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700"
            >
              Voir tous les services
            </Link>
          </div>
        </div>
      </section>

      {/* Actualités Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Dernières Actualités</h2>
          <div className="grid grid-cols-3 gap-8">
            {articles.map(article => (
              <div key={article.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
                {article.imageUrl && (
                  <img src={article.imageUrl} alt={article.titre} className="w-full h-48 object-cover" />
                )}
                <div className="p-6">
                  <p className="text-gray-500 text-sm mb-2">
                    {new Date(article.publishedAt).toLocaleDateString('fr-FR')}
                  </p>
                  <h3 className="text-xl font-bold mb-3">{article.titre}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>
                  <Link 
                    href={`/articles/${article.slug}`}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Lire plus →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link 
              href="/articles"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700"
            >
              Voir toutes les actualités
            </Link>
          </div>
        </div>
      </section>

      {/* Événements Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Prochains Événements</h2>
          <div className="space-y-6">
            {evenements.map(event => (
              <div key={event.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition flex gap-6">
                {event.imageUrl && (
                  <img src={event.imageUrl} alt={event.titre} className="w-32 h-32 object-cover rounded" />
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{event.titre}</h3>
                  <p className="text-gray-600 mb-3">{event.description.substring(0, 150)}...</p>
                  <div className="flex gap-4 text-sm text-gray-500 mb-4">
                    <span>📅 {new Date(event.dateStart).toLocaleDateString('fr-FR')}</span>
                    {event.timeStart && <span>🕒 {event.timeStart}</span>}
                    {event.lieu && <span>📍 {event.lieu}</span>}
                  </div>
                  <Link 
                    href={`/evenements/${event.slug}`}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Plus de détails →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center" style={{ backgroundColor: 'var(--secondary-color)', color: 'white' }}>
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold mb-4">Avez besoin de rencontrer un responsable?</h2>
          <p className="text-xl text-gray-100 mb-8">Demandez une audience en ligne, simple et rapide</p>
          <Link 
            href="/audiences/demander"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100"
          >
            Demander une audience
          </Link>
        </div>
      </section>
    </div>
  );
}
