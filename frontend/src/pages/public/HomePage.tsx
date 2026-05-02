import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import { Rating } from 'primereact/rating';
import { Skeleton } from 'primereact/skeleton';
import { categoriesApi, servicesApi } from '../../api/client';
import { Category, Service } from '../../types';

export default function HomePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, servicesRes] = await Promise.all([
        categoriesApi.getAll(),
        servicesApi.getFeatured(6),
      ]);
      setCategories(categoriesRes.data?.data?.categories || categoriesRes.data?.categories || []);
      setFeaturedServices(servicesRes.data?.data?.services || servicesRes.data?.services || []);
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    navigate(`/search?${params.toString()}`);
  };

  const categoryIcons: Record<string, string> = {
    'salles-des-fetes': 'pi pi-building',
    'photographes': 'pi pi-camera',
    'voitures-de-mariage': 'pi pi-car',
    'notaires': 'pi pi-file',
    'coiffeurs': 'pi pi-star',
    'robes-costumes': 'pi pi-user',
    'bands': 'pi pi-volume-up',
    'decorations': 'pi pi-palette',
    'traiteurs': 'pi pi-shopping-cart',
    'gateaux': 'pi pi-heart',
    'fleuristes': 'pi pi-sun',
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient py-8">
        <div className="container text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Plan Your Perfect Wedding
          </h1>
          <p className="text-xl text-white opacity-80 mb-6">
            Discover the best wedding services in Tunisia. From venues to photographers,
            find everything you need for your special day.
          </p>

          {/* Search Bar */}
          <div className="surface-card p-4 border-round-lg shadow-4 max-w-4xl mx-auto">
            <div className="flex flex-column md:flex-row gap-3">
              <div className="flex-grow-1">
                <span className="p-input-icon-left w-full">
                  <i className="pi pi-search" />
                  <InputText
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for services..."
                    className="w-full"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </span>
              </div>
              <Dropdown
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.value)}
                options={categories.map((c) => ({ label: c.name, value: c.slug }))}
                placeholder="All Categories"
                className="w-full md:w-15rem"
                showClear
              />
              <Button
                label="Search"
                icon="pi pi-search"
                onClick={handleSearch}
                className="w-full md:w-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-6 surface-ground">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-5">Browse Categories</h2>
          <div className="grid">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="col-6 md:col-4 lg:col-2">
                  <Skeleton height="120px" className="border-round" />
                </div>
              ))
            ) : (
              categories.slice(0, 12).map((category) => (
                <div key={category.id} className="col-6 md:col-4 lg:col-2">
                  <Link to={`/categories/${category.slug}`} className="no-underline">
                    <Card className="text-center hover:shadow-4 transition-all transition-duration-200 cursor-pointer h-full">
                      <i
                        className={`${categoryIcons[category.slug] || 'pi pi-tag'} text-4xl text-primary mb-3`}
                      />
                      <h4 className="m-0 text-color">{category.name}</h4>
                      <p className="text-sm text-color-secondary mt-2 mb-0">
                        {category.serviceCount || 0} services
                      </p>
                    </Card>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="py-6">
        <div className="container">
          <div className="flex justify-content-between align-items-center mb-5">
            <h2 className="text-3xl font-bold m-0">Featured Services</h2>
            <Link to="/search">
              <Button label="View All" icon="pi pi-arrow-right" iconPos="right" className="p-button-text" />
            </Link>
          </div>
          <div className="grid">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="col-12 md:col-6 lg:col-4">
                  <Card>
                    <Skeleton height="200px" className="mb-3" />
                    <Skeleton width="70%" className="mb-2" />
                    <Skeleton width="50%" />
                  </Card>
                </div>
              ))
            ) : (
              featuredServices.map((service) => (
                <div key={service.id} className="col-12 md:col-6 lg:col-4">
                  <Link to={`/services/${service.id}`} className="no-underline">
                    <Card className="service-card h-full">
                      <div
                        className="service-image border-round-top"
                        style={{
                          backgroundImage: `url(${service.images?.[0]?.url || '/placeholder-service.jpg'})`,
                          height: '200px',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          margin: '-1rem -1rem 1rem -1rem',
                        }}
                      />
                      <div className="flex align-items-center gap-2 mb-2">
                        <span className="text-xs surface-200 border-round px-2 py-1">
                          {service.category?.name}
                        </span>
                        {service.featured && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 border-round px-2 py-1">
                            Featured
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-color">{service.name}</h3>
                      <p className="text-color-secondary text-sm mb-3 line-clamp-2">
                        {service.description}
                      </p>
                      <div className="flex align-items-center justify-content-between">
                        <div className="flex align-items-center gap-2">
                          <Rating value={service.avgRating || 0} readOnly cancel={false} stars={5} />
                          <span className="text-sm text-color-secondary">
                            ({service.reviewCount || 0})
                          </span>
                        </div>
                        <span className="font-bold text-primary">
                          {service.basePrice} TND
                        </span>
                      </div>
                    </Card>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-6 surface-ground">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-6">How It Works</h2>
          <div className="grid">
            <div className="col-12 md:col-4 text-center">
              <div className="w-4rem h-4rem border-circle bg-primary flex align-items-center justify-content-center mx-auto mb-4">
                <i className="pi pi-search text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Search & Discover</h3>
              <p className="text-color-secondary">
                Browse through our curated list of wedding service providers.
                Filter by category, location, price, and ratings.
              </p>
            </div>
            <div className="col-12 md:col-4 text-center">
              <div className="w-4rem h-4rem border-circle bg-primary flex align-items-center justify-content-center mx-auto mb-4">
                <i className="pi pi-calendar text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Book & Pay</h3>
              <p className="text-color-secondary">
                Check availability, select your date, and book securely.
                Pay a deposit or the full amount online.
              </p>
            </div>
            <div className="col-12 md:col-4 text-center">
              <div className="w-4rem h-4rem border-circle bg-primary flex align-items-center justify-content-center mx-auto mb-4">
                <i className="pi pi-heart text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Enjoy Your Day</h3>
              <p className="text-color-secondary">
                Relax and enjoy your wedding day knowing everything is taken care of.
                Leave reviews to help others.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-6 hero-gradient">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Are You a Wedding Service Provider?
          </h2>
          <p className="text-xl text-white opacity-80 mb-5">
            Join our marketplace and reach thousands of couples planning their wedding.
          </p>
          <Link to="/register?role=provider">
            <Button
              label="Join as a Provider"
              icon="pi pi-arrow-right"
              iconPos="right"
              className="p-button-lg p-button-secondary"
            />
          </Link>
        </div>
      </section>
    </div>
  );
}
