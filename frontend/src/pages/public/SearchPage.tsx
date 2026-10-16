import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Rating } from 'primereact/rating';
import { Paginator, PaginatorPageChangeEvent } from 'primereact/paginator';
import { Skeleton } from 'primereact/skeleton';
import { Sidebar } from 'primereact/sidebar';
import { servicesApi, categoriesApi } from '../../api/client';
import { Service, Category } from '../../types';

const locations = [
  { label: 'Tunis', value: 'tunis' },
  { label: 'Sousse', value: 'sousse' },
  { label: 'Sfax', value: 'sfax' },
  { label: 'Monastir', value: 'monastir' },
  { label: 'Bizerte', value: 'bizerte' },
  { label: 'Nabeul', value: 'nabeul' },
  { label: 'Hammamet', value: 'hammamet' },
  { label: 'Djerba', value: 'djerba' },
];

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Most Reviews', value: 'reviews' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterSidebarVisible, setFilterSidebarVisible] = useState(false);

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [rows] = useState(12);

  useEffect(() => {
    loadCategories();
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data?.data?.categories || response.data?.categories || []);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const mapSortValue = (sort: string): string | undefined => {
    const sortMap: Record<string, string | undefined> = {
      newest: 'newest',
      price_asc: 'price',
      price_desc: 'price',
      rating: 'rating',
      reviews: 'reviews',
    };
    return sortMap[sort];
  };

  const loadServices = async (overrides?: { sortBy?: string; page?: number }) => {
    setLoading(true);
    try {
      const currentSort = overrides?.sortBy || sortBy;
      const response = await servicesApi.search({
        page: overrides?.page || page,
        limit: rows,
        category: selectedCategory || undefined,
        city: selectedLocation || undefined,
        priceMin: priceRange[0] > 0 ? priceRange[0] : undefined,
        priceMax: priceRange[1] < 50000 ? priceRange[1] : undefined,
        sortBy: mapSortValue(currentSort),
        sortOrder: currentSort === 'price_asc' ? 'asc' : 'desc',
      });
      const data = response.data?.data || response.data;
      setServices(data?.services || []);
      setTotalRecords(data?.meta?.total || data?.total || 0);
    } catch (error) {
      console.error('Failed to load services', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    updateSearchParams();
    loadServices({ page: 1 });
  };

  const updateSearchParams = () => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedLocation) params.set('location', selectedLocation);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (page > 1) params.set('page', page.toString());
    setSearchParams(params);
  };

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    const newPage = event.page + 1;
    setPage(newPage);
    loadServices({ page: newPage });
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedCategory('');
    setSelectedLocation('');
    setPriceRange([0, 50000]);
    setSortBy('newest');
    setPage(1);
    setSearchParams({});
    loadServices({ page: 1, sortBy: 'newest' });
  };

  const FilterContent = () => (
    <>
      <div className="provider-sidebar-section">
        <p className="provider-sidebar-title">Category</p>
        <Dropdown
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.value)}
          options={[
            { label: 'All Categories', value: '' },
            ...categories.map((c) => ({ label: c.name, value: c.slug })),
          ]}
          className="w-full"
        />
      </div>

      <div className="provider-sidebar-section">
        <p className="provider-sidebar-title">Location</p>
        <Dropdown
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.value)}
          options={[{ label: 'All Locations', value: '' }, ...locations]}
          className="w-full"
        />
      </div>

      <div className="provider-sidebar-section">
        <p className="provider-sidebar-title">Price Range (TND)</p>
        <div className="flex align-items-center gap-2">
          <InputNumber
            value={priceRange[0]}
            onValueChange={(e) => {
              const newMin = e.value || 0;
              if (newMin < priceRange[1]) setPriceRange([newMin, priceRange[1]]);
            }}
            mode="decimal"
            min={0}
            max={priceRange[1] - 100}
            placeholder="Min"
            className="w-full"
            inputClassName="w-full text-center"
          />
          <span className="text-color-secondary">—</span>
          <InputNumber
            value={priceRange[1]}
            onValueChange={(e) => {
              const newMax = e.value || 50000;
              if (newMax > priceRange[0]) setPriceRange([priceRange[0], newMax]);
            }}
            mode="decimal"
            min={priceRange[0] + 100}
            max={50000}
            placeholder="Max"
            className="w-full"
            inputClassName="w-full text-center"
          />
        </div>
      </div>

      <div className="provider-sidebar-section">
        <Button
          label="Apply filters"
          icon="pi pi-check"
          onClick={() => {
            handleSearch();
            setFilterSidebarVisible(false);
          }}
          className="w-full mb-2"
        />
        <Button
          label="Clear all"
          icon="pi pi-times"
          onClick={clearFilters}
          className="p-button-outlined w-full"
        />
      </div>
    </>
  );

  return (
    <div className="surface-ground min-h-screen">
      <div className="dashboard-hero dashboard-hero--compact">
        <div className="container">
          <p className="dashboard-hero-greeting">Discover</p>
          <h1 className="dashboard-hero-title">Find your perfect service</h1>
          <p className="dashboard-hero-subtitle">
            Browse venues, photographers, caterers and more across Tunisia.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="search-toolbar">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search venues, photographers, caterers..."
              className="w-full"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </span>
          <Button label="Search" icon="pi pi-search" onClick={handleSearch} />
          <Button
            label="Filters"
            icon="pi pi-filter"
            className="p-button-outlined md:hidden"
            onClick={() => setFilterSidebarVisible(true)}
          />
        </div>

        <div className="grid dashboard-content pb-4">
          {/* Desktop filters */}
          <div className="col-12 md:col-4 lg:col-3 hidden md:block">
            <div className="provider-sidebar">
              <FilterContent />
            </div>
          </div>

          {/* Mobile filters */}
          <Sidebar
            visible={filterSidebarVisible}
            onHide={() => setFilterSidebarVisible(false)}
            className="w-full md:w-20rem"
            header={<span className="font-semibold text-lg">Filters</span>}
          >
            <FilterContent />
          </Sidebar>

          {/* Results */}
          <div className="col-12 md:col-8 lg:col-9">
            <div className="search-sort-row">
              <p className="search-sort-count">
                <strong>{totalRecords}</strong> service{totalRecords === 1 ? '' : 's'} found
              </p>
              <Dropdown
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.value);
                  loadServices({ sortBy: e.value });
                }}
                options={sortOptions}
              />
            </div>

            <div className="grid">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="col-12 md:col-6 lg:col-4">
                    <Skeleton height="280px" style={{ borderRadius: 12 }} />
                  </div>
                ))
              ) : services.length === 0 ? (
                <div className="col-12">
                  <div className="dashboard-panel">
                    <div className="dashboard-empty" style={{ padding: '3rem 1rem' }}>
                      <div className="dashboard-empty-icon">
                        <i className="pi pi-search" />
                      </div>
                      <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>
                        No services found
                      </h3>
                      <p>Try adjusting your search or filter criteria.</p>
                      <Button
                        label="Clear filters"
                        icon="pi pi-times"
                        onClick={clearFilters}
                        className="p-button-outlined"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                services.map((service) => (
                  <div key={service.id} className="col-12 md:col-6 lg:col-4 mb-3">
                    <Link to={`/services/${service.id}`} className="provider-service-card">
                      <div
                        className="provider-service-image"
                        style={
                          service.images?.[0]?.url
                            ? { backgroundImage: `url(${service.images[0].url})` }
                            : undefined
                        }
                      >
                        {!service.images?.[0]?.url && (
                          <div className="provider-service-image-empty">
                            <i className="pi pi-image" />
                          </div>
                        )}
                      </div>
                      <div className="provider-service-body">
                        <div
                          className="flex align-items-center gap-2 mb-2 flex-wrap"
                          style={{ rowGap: '0.25rem' }}
                        >
                          {service.category?.name && (
                            <span className="provider-service-chip">
                              {service.category.name}
                            </span>
                          )}
                          {service.provider?.city && (
                            <span className="text-xs text-color-secondary">
                              <i className="pi pi-map-marker mr-1" />
                              {service.provider.city}
                            </span>
                          )}
                        </div>
                        <h4 className="provider-service-name">{service.name}</h4>
                        <div className="provider-service-footer">
                          <span className="provider-service-rating">
                            <Rating
                              value={Number(service.avgRating) || 0}
                              readOnly
                              cancel={false}
                              stars={5}
                            />
                            ({service.reviewCount || 0})
                          </span>
                          <span className="provider-service-price">
                            {Number(service.basePrice ?? 0).toLocaleString()} TND
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </div>

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
      </div>
    </div>
  );
}
