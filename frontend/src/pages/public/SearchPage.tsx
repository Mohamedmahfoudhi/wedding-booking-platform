import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
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

  // Filter states
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
  }, []);

  
  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data?.data?.categories || response.data?.categories || []);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  // Map frontend sort values to backend enum values
  const mapSortValue = (sort: string): string | undefined => {
    const sortMap: Record<string, string | undefined> = {
      'newest': 'newest',
      'price_asc': 'price',
      'price_desc': 'price',
      'rating': 'rating',
      'reviews': 'reviews',
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
    loadServices();
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
    setSortBy('popular');
    setPage(1);
    setSearchParams({});
  };

  const FilterContent = () => (
    <div className="flex flex-column gap-4">
      <div>
        <label className="block font-medium mb-2">Category</label>
        <Dropdown
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.value)}
          options={[{ label: 'All Categories', value: '' }, ...categories.map((c) => ({ label: c.name, value: c.slug }))]}
          className="w-full"
        />
      </div>

      <div>
        <label className="block font-medium mb-2">Location</label>
        <Dropdown
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.value)}
          options={[{ label: 'All Locations', value: '' }, ...locations]}
          className="w-full"
        />
      </div>

      <div>
        <label className="block font-medium mb-3">Price Range (TND)</label>
        <div className="flex align-items-center gap-2">
          <InputNumber
            value={priceRange[0]}
            onValueChange={(e) => {
              const newMin = e.value || 0;
              if (newMin < priceRange[1]) {
                setPriceRange([newMin, priceRange[1]]);
              }
            }}
            mode="decimal"
            min={0}
            max={priceRange[1] - 100}
            placeholder="Min"
            className="w-full"
            inputClassName="w-full text-center"
          />
          <span className="text-color-secondary">-</span>
          <InputNumber
            value={priceRange[1]}
            onValueChange={(e) => {
              const newMax = e.value || 50000;
              if (newMax > priceRange[0]) {
                setPriceRange([priceRange[0], newMax]);
              }
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

      <Button
        label="Apply Filters"
        icon="pi pi-check"
        onClick={() => {
          handleSearch();
          setFilterSidebarVisible(false);
        }}
        className="w-full"
      />

      <Button
        label="Clear All"
        icon="pi pi-times"
        onClick={clearFilters}
        className="p-button-outlined w-full"
      />
    </div>
  );

  return (
    <div className="surface-ground min-h-screen">
      <div className="container py-4">
        {/* Search Header */}
        <div className="surface-card p-4 border-round mb-4">
          <div className="flex flex-column md:flex-row gap-3">
            <div className="flex-grow-1">
              <span className="p-input-icon-left w-full">
                <i className="pi pi-search" />
                <InputText
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for services..."
                  className="w-full"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </span>
            </div>
            <Button
              label="Search"
              icon="pi pi-search"
              onClick={handleSearch}
            />
            <Button
              label="Filters"
              icon="pi pi-filter"
              className="p-button-outlined md:hidden"
              onClick={() => setFilterSidebarVisible(true)}
            />
          </div>
        </div>

        <div className="flex gap-4">
          {/* Desktop Filters Sidebar */}
          <div className="hidden md:block w-20rem flex-shrink-0">
            <div className="surface-card p-4 border-round sticky" style={{ top: '80px' }}>
              <h3 className="mt-0 mb-4">Filters</h3>
              <FilterContent />
            </div>
          </div>

          {/* Mobile Filter Sidebar */}
          <Sidebar
            visible={filterSidebarVisible}
            onHide={() => setFilterSidebarVisible(false)}
            className="w-full md:w-20rem"
          >
            <h3 className="mt-0 mb-4">Filters</h3>
            <FilterContent />
          </Sidebar>

          {/* Results */}
          <div className="flex-grow-1">
            {/* Results Header */}
            <div className="flex justify-content-between align-items-center mb-4">
              <p className="m-0 text-color-secondary">
                {totalRecords} services found
              </p>
              <Dropdown
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.value);
                  loadServices({ sortBy: e.value });
                }}
                options={sortOptions}
                className="w-12rem"
              />
            </div>

            {/* Results Grid */}
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
                    <i className="pi pi-search text-4xl text-color-secondary mb-3" />
                    <h3>No services found</h3>
                    <p className="text-color-secondary">
                      Try adjusting your search or filter criteria
                    </p>
                    <Button
                      label="Clear Filters"
                      icon="pi pi-times"
                      onClick={clearFilters}
                      className="p-button-outlined"
                    />
                  </Card>
                </div>
              ) : (
                services.map((service) => (
                  <div key={service.id} className="col-12 md:col-6 lg:col-4 mb-3">
                    <Link to={`/services/${service.id}`} className="no-underline block h-full">
                      <Card className="service-card h-full shadow-1">
                        <div
                          className="service-image"
                          style={{
                            backgroundImage: `url(${service.images?.[0]?.url || 'https://via.placeholder.com/400x200?text=No+Image'})`,
                            height: '180px',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                        <div className="p-3">
                          <div className="flex align-items-center gap-2 mb-2 flex-wrap">
                            {service.category?.name && (
                              <span className="text-xs bg-primary-50 text-primary border-round px-2 py-1">
                                {service.category.name}
                              </span>
                            )}
                            <span className="text-xs surface-200 border-round px-2 py-1">
                              <i className="pi pi-map-marker text-xs mr-1" />
                              {service.provider?.city || 'Tunisia'}
                            </span>
                          </div>
                          <h3 className="text-base font-semibold mb-2 text-color line-clamp-1">{service.name}</h3>
                          <p className="text-color-secondary text-sm mb-3 line-clamp-2">
                            {service.description || 'No description available'}
                          </p>
                          <div className="flex align-items-center justify-content-between pt-2 border-top-1 surface-border">
                            <div className="flex align-items-center gap-1">
                              <Rating value={service.avgRating || 0} readOnly cancel={false} stars={5} />
                              <span className="text-xs text-color-secondary">
                                ({service.reviewCount || 0})
                              </span>
                            </div>
                            <span className="font-bold text-primary text-lg">
                              {service.basePrice?.toLocaleString()} TND
                            </span>
                          </div>
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
      </div>
    </div>
  );
}
