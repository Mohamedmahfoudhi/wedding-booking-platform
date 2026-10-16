import { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Rating } from 'primereact/rating';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Skeleton } from 'primereact/skeleton';
import { Paginator, PaginatorPageChangeEvent } from 'primereact/paginator';
import { reviewsApi, providerServicesApi } from '../../api/client';
import { Review, Service } from '../../types';

export default function ProviderReviews() {
  const toast = useRef<Toast>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [rows] = useState(10);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseDialogVisible, setResponseDialogVisible] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [saving, setSaving] = useState(false);

  const [stats, setStats] = useState({
    avgRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>,
  });

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedService]);

  const loadServices = async () => {
    try {
      const response = await providerServicesApi.getAll();
      setServices(response.data.data?.services || []);
    } catch (error) {
      console.error('Failed to load services', error);
    }
  };

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewsApi.getProviderReviews(page, rows);
      const wrapped = response.data.data || {};
      const allReviews: Review[] = wrapped.reviews || [];
      const filtered = selectedService
        ? allReviews.filter((r) => r.service?.id === selectedService)
        : allReviews;
      setReviews(filtered);
      setTotalRecords(wrapped.meta?.total ?? filtered.length);

      if (filtered.length > 0) {
        const avg = filtered.reduce((sum, r) => sum + r.rating, 0) / filtered.length;
        const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        filtered.forEach((r) => {
          distribution[r.rating] = (distribution[r.rating] || 0) + 1;
        });
        setStats({
          avgRating: Math.round(avg * 10) / 10,
          totalReviews: filtered.length,
          ratingDistribution: distribution,
        });
      } else {
        setStats({
          avgRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        });
      }
    } catch (error) {
      console.error('Failed to load reviews', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResponse = (review: Review) => {
    setSelectedReview(review);
    setResponseText(review.providerResponse || '');
    setResponseDialogVisible(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedReview || !responseText.trim()) return;

    setSaving(true);
    try {
      await reviewsApi.respond(selectedReview.id, responseText);
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Response submitted successfully',
      });
      setResponseDialogVisible(false);
      loadReviews();
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to submit response',
      });
    } finally {
      setSaving(false);
    }
  };

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    setPage(event.page + 1);
  };

  const renderStarBar = (stars: number, count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div key={stars} className="rating-bar-row">
        <span className="rating-bar-star">
          {stars} <i className="pi pi-star-fill" />
        </span>
        <div className="rating-bar-track">
          <div className="rating-bar-fill" style={{ width: `${percentage}%` }} />
        </div>
        <span className="rating-bar-count">{count}</span>
      </div>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div>
        <Skeleton width="180px" height="1.75rem" className="mb-4" />
        <div className="grid">
          <div className="col-12 lg:col-4">
            <Skeleton height="320px" style={{ borderRadius: 14 }} />
          </div>
          <div className="col-12 lg:col-8">
            <Skeleton height="420px" style={{ borderRadius: 14 }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Toast ref={toast} />

      <h2 className="text-2xl font-bold mb-4">Reviews</h2>

      <div className="grid">
        {/* Rating overview */}
        <div className="col-12 lg:col-4">
          <div className="dashboard-panel reviews-stat-panel">
            <div className="reviews-stat-head">
              <p className="reviews-stat-avg">{stats.avgRating.toFixed(1)}</p>
              <Rating value={stats.avgRating} readOnly cancel={false} />
              <p className="reviews-stat-count">
                Based on {stats.totalReviews} review{stats.totalReviews === 1 ? '' : 's'}
              </p>
            </div>
            <div className="reviews-stat-bars">
              {[5, 4, 3, 2, 1].map((stars) =>
                renderStarBar(stars, stats.ratingDistribution[stars] || 0, stats.totalReviews),
              )}
            </div>
          </div>
        </div>

        {/* Reviews list */}
        <div className="col-12 lg:col-8">
          <div className="dashboard-panel">
            <div className="dashboard-panel-head">
              <h2 className="dashboard-panel-title">All reviews</h2>
              <Dropdown
                value={selectedService}
                onChange={(e) => {
                  setSelectedService(e.value);
                  setPage(1);
                }}
                options={[
                  { label: 'All services', value: null },
                  ...services.map((s) => ({ label: s.name, value: s.id })),
                ]}
                placeholder="Filter by service"
                className="w-15rem"
              />
            </div>

            {reviews.length === 0 ? (
              <div className="dashboard-empty" style={{ padding: '3rem 1rem' }}>
                <div className="dashboard-empty-icon">
                  <i className="pi pi-star" />
                </div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>
                  No reviews yet
                </h3>
                <p>Reviews will appear here once customers complete their bookings.</p>
              </div>
            ) : (
              <div>
                {reviews.map((review) => (
                  <div key={review.id} className="service-review">
                    <div className="service-review-head">
                      <div className="service-review-user">
                        <div className="service-review-avatar">
                          {review.client?.firstName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="service-review-name">
                            {review.client?.firstName} {review.client?.lastName}
                          </div>
                          <span className="service-review-date">
                            {review.service?.name && `${review.service.name} · `}
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Rating value={review.rating} readOnly cancel={false} />
                    </div>
                    {review.comment && (
                      <p className="service-review-comment">{review.comment}</p>
                    )}

                    {review.providerResponse ? (
                      <div className="service-review-response">
                        <span className="service-review-response-label">Your response</span>
                        <p>{review.providerResponse}</p>
                        <Button
                          label="Edit response"
                          icon="pi pi-pencil"
                          className="p-button-text p-button-sm mt-2"
                          onClick={() => handleOpenResponse(review)}
                        />
                      </div>
                    ) : (
                      <Button
                        label="Respond to review"
                        icon="pi pi-reply"
                        className="p-button-outlined p-button-sm mt-3"
                        onClick={() => handleOpenResponse(review)}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {totalRecords > rows && (
              <Paginator
                first={(page - 1) * rows}
                rows={rows}
                totalRecords={totalRecords}
                onPageChange={onPageChange}
                className="mt-4"
              />
            )}
          </div>
        </div>
      </div>

      {/* Response Dialog */}
      <Dialog
        header={selectedReview?.providerResponse ? 'Edit response' : 'Respond to review'}
        visible={responseDialogVisible}
        onHide={() => setResponseDialogVisible(false)}
        style={{ width: '540px' }}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button
              label="Cancel"
              className="p-button-text"
              onClick={() => setResponseDialogVisible(false)}
            />
            <Button
              label="Submit response"
              icon="pi pi-check"
              onClick={handleSubmitResponse}
              loading={saving}
              disabled={!responseText.trim()}
            />
          </div>
        }
      >
        {selectedReview && (
          <div>
            <div className="service-review" style={{ marginBottom: '1rem' }}>
              <div className="service-review-head">
                <div className="service-review-user">
                  <div className="service-review-avatar">
                    {selectedReview.client?.firstName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="service-review-name">
                      {selectedReview.client?.firstName} {selectedReview.client?.lastName}
                    </div>
                    <span className="service-review-date">
                      {new Date(selectedReview.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Rating value={selectedReview.rating} readOnly cancel={false} />
              </div>
              {selectedReview.comment && (
                <p className="service-review-comment">{selectedReview.comment}</p>
              )}
            </div>

            <div className="field">
              <label className="block font-medium mb-2">Your response</label>
              <InputTextarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={4}
                className="w-full"
                placeholder="Write your response..."
              />
              <small className="text-color-secondary block mt-2">
                Be professional and courteous. Your response will be visible to all users.
              </small>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
