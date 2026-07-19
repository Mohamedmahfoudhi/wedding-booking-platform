import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Rating } from 'primereact/rating';
import { Skeleton } from 'primereact/skeleton';
import { Paginator, PaginatorPageChangeEvent } from 'primereact/paginator';
import { Dropdown } from 'primereact/dropdown';
import { categoriesApi, servicesApi } from '../../api/client';
import { Category, Service } from '../../types';

const sortOptions = [
  { label: 'Most Popular', value: 'popular' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Newest', value: 'newest' },
];

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [rows] = useState(12);
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    if (slug) {
      loadCategory();
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      loadServices();
    }
  }, [slug, page, sortBy]);

  const loadCategory = async () => {
    try {
      const response = await categoriesApi.getBySlug(slug!);
      setCategory(response.data.data?.category || null);
    } catch (error) {
      console.error('Failed to load category', error);
    }
  };

  const mapSort = (
    value: string,
  ): { sortBy?: string; sortOrder?: 'asc' | 'desc' } => {
    switch (value) {
      case 'price_asc':
        return { sortBy: 'price', sortOrder: 'asc' };
      case 'price_desc':
        return { sortBy: 'price', sortOrder: 'desc' };
      case 'rating':
        return { sortBy: 'rating', sortOrder: 'desc' };
      case 'newest':
        return { sortBy: 'newest', sortOrder: 'desc' };
      default:
        return { sortBy: 'reviews', sortOrder: 'desc' };
    }
  };

  const loadServices = async () => {
    setLoading(true);
    try {
      const response = await servicesApi.search({
        category: slug,
        page,
        limit: rows,
        ...mapSort(sortBy),
      });
      setServices(response.data.data?.services || []);
      setTotalRecords(response.data.data?.meta?.total || 0);
    } catch (error) {
      console.error('Failed to load services', error);
    } finally {
      setLoading(false);
    }
  };

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    setPage(event.page + 1);
  };

  const categoryDescriptions: Record<string, string> = {
    'salles-des-fetes': 'Find the perfect venue for your wedding celebration. From grand ballrooms to intimate gardens.',
    'photographes': 'Capture every moment of your special day with professional wedding photographers.',
    'voitures-de-mariage': 'Arrive in style with luxury wedding cars and vintage vehicles.',
    'notaires': 'Legal services to ensure your marriage is properly documented.',
    'coiffeurs': 'Look stunning on your wedding day with professional hair styling services.',
    'robes-costumes': 'Find your dream wedding dress or the perfect suit for the big day.',
    'bands': 'Live music and entertainment to make your wedding unforgettable.',
    'decorations': 'Transform your venue with beautiful wedding decorations and flowers.',
    'traiteurs': 'Delight your guests with exceptional catering and cuisine.',
    'gateaux': 'Custom wedding cakes and desserts for your celebration.',
    'fleuristes': 'Beautiful floral arrangements and bouquets for your wedding.',
  };

  return (
    <div className="surface-ground min-h-screen">
      {/* Category Header */}
      <div className="hero-gradient py-6">
        <div className="container">
          {loading && !category ? (
            <>
              <Skeleton width="200px" height="2rem" className="mb-3" />
              <Skeleton width="400px" />
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-white mb-3">
                {category?.name || 'Category'}
              </h1>
              <p className="text-xl text-white opacity-80 m-0">
                {categoryDescriptions[slug || ''] || category?.description}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="container py-4">
        {/* Results Header */}
        <div className="flex justify-content-between align-items-center mb-4">
          <p className="m-0 text-color-secondary">
            {totalRecords} services found
          </p>
          <Dropdown
            value={sortBy}
            onChange={(e) => setSortBy(e.value)}
            options={sortOptions}
            className="w-12rem"
          />
        </div>

        {/* Services Grid */}
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
          ) : services.length === 0 ? (
            <div className="col-12">
              <Card className="text-center py-6">
                <i className="pi pi-inbox text-4xl text-color-secondary mb-3" />
                <h3>No services found</h3>
                <p className="text-color-secondary">
                  No services are currently available in this category.
                </p>
                <Link to="/search">
                  <i className="pi pi-arrow-left mr-2" />
                  Browse all services
                </Link>
              </Card>
            </div>
          ) : (
            services.map((service) => (
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
                        <i className="pi pi-map-marker text-xs mr-1" />
                        {service.location}
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

        {/* Pagination */}
        {totalRecords > rows && (
          <div className="mt-4">
            <Paginator
              first={(page - 1) * rows}
              rows={rows}
              totalRecords={totalRecords}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
