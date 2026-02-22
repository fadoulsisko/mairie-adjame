// app/layout.jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import './globals.css';
import axios from 'axios';

export default function RootLayout({ children }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const mairieId = process.env.NEXT_PUBLIC_MAIRIE_ID;
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/config/public`,
          {
            headers: {
              'x-mairie-id': mairieId,
            }
          }
        );
        setConfig(response.data);
      } catch (error) {
        console.error('Erreur chargement config:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  if (loading) {
    return (
      <html>
        <body className="flex items-center justify-center h-screen bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="fr">
      <body>
        <style>{`
          :root {
            --primary-color: ${config?.primaryColor || '#1F2937'};
            --secondary-color: ${config?.secondaryColor || '#3B82F6'};
          }
        `}</style>

        {/* Header */}
        <header className="bg-white shadow-md sticky top-0 z-50">
          <nav className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {config?.logo && (
                  <img 
                    src={config.logo} 
                    alt={config.name}
                    className="h-10"
                  />
                )}
                <h1 className="text-xl font-bold text-gray-900">
                  {config?.name || 'Mairie'}
                </h1>
              </div>

              {/* Navigation menu */}
              <ul className="flex gap-6 text-sm font-medium">
                <li><Link href="/" className="hover:text-blue-600">Accueil</Link></li>
                <li><Link href="/articles" className="hover:text-blue-600">Actualités</Link></li>
                <li><Link href="/services" className="hover:text-blue-600">Services</Link></li>
                <li><Link href="/evenements" className="hover:text-blue-600">Événements</Link></li>
                <li><Link href="/galerie" className="hover:text-blue-600">Galerie</Link></li>
                <li><Link href="/contact" className="hover:text-blue-600">Contact</Link></li>
                <li>
                  <Link 
                    href="/audiences/demander" 
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Demander Audience
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </header>

        {/* Main content */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 mt-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="font-bold mb-3">Mairie</h3>
                <p className="text-gray-400 text-sm">{config?.address}</p>
                <p className="text-gray-400 text-sm mt-2">{config?.phone}</p>
                <p className="text-gray-400 text-sm">{config?.email}</p>
              </div>

              <div>
                <h3 className="font-bold mb-3">Horaires</h3>
                <p className="text-gray-400 text-sm">
                  {config?.openingHours 
                    ? JSON.stringify(config.openingHours).substring(0, 50) + '...'
                    : 'Lundi - Vendredi: 8h00 - 16h00'
                  }
                </p>
              </div>

              <div>
                <h3 className="font-bold mb-3">Liens rapides</h3>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li><Link href="/articles">Actualités</Link></li>
                  <li><Link href="/services">Services</Link></li>
                  <li><Link href="/audiences/demander">Demander Audience</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold mb-3">Réseaux sociaux</h3>
                <div className="flex gap-3">
                  {config?.socialMedia?.map(social => (
                    <a 
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white"
                    >
                      {social.plateforme}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <hr className="border-gray-700 mb-6" />

            <div className="text-center text-gray-400 text-sm">
              <p>&copy; 2024 {config?.name}. Tous droits réservés.</p>
              <p className="mt-2">Powered by Mairie Platform</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
