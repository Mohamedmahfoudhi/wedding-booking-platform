import { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
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

  // Stats
  const [stats, setStats] = useState({
    avgRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    loadReviews();
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
        const avg =
          filtered.reduce((sum, r) => sum + r.rating, 0) / filtered.length;
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        filtered.forEach((r) => {
          distribution[r.rating as keyof typeof distribution]++;
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
    } catch (error) {
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
      <div className="flex align-items-center gap-2 mb-2">
        <span className="w-1rem text-right">{stars}</span>
        <i className="pi pi-star-fill text-yellow-500" />
        <div
          className="flex-grow-1 h-1rem surface-200 border-round overflow-hidden"
        >
          <div
            className="h-full bg-yellow-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="w-2rem text-color-secondary text-sm">{count}</span>
      </div>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div>
        <Skeleton width="200px" height="2rem" className="mb-4" />
        <div className="grid">
          <div className="col-12 md:col-4">
            <Card>
              <Skeleton height="200px" />
            </Card>
          </div>
          <div className="col-12 md:col-8">
            <Card>
              <Skeleton height="400px" />
            </Card>
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
        {/* Stats Card */}
        <div className="col-12 lg:col-4">
          <Card className="h-full">
            <div className="text-center mb-4">
              <p className="text-5xl font-bold text-primary m-0">
                {stats.avgRating.toFixed(1)}
              </p>
              <Rating value={stats.avgRating} readOnly cancel={false} className="my-2" />
              <p className="text-color-secondary m-0">
                Based on {stats.totalReviews} reviews
              </p>
            </div>

            <div className="mt-4">
              {[5, 4, 3, 2, 1].map((stars) =>
                renderStarBar(
                  stars,
                  stats.ratingDistribution[stars as keyof typeof stats.ratingDistribution],
                  stats.totalReviews
                )
              )}
            </div>
          </Card>
        </div>

        {/* Reviews List */}
        <div className="col-12 lg:col-8">
          <Card>
            <div className="flex justify-content-between align-items-center mb-4">
              <h3 className="m-0">All Reviews</h3>
              <Dropdown
                value={selectedService}
                onChange={(e) => {
                  setSelectedService(e.value);
                  setPage(1);
                }}
                options={[
                  { label: 'All Services', value: null },
                  ...services.map((s) => ({ label: s.name, value: s.id })),
                ]}
                placeholder="Filter by service"
                className="w-15rem"
              />
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-6">
                <i className="pi pi-star text-5xl text-color-secondary mb-4" />
                <h3 className="text-xl mb-3">No reviews yet</h3>
                <p className="text-color-secondary">
                  Reviews will appear here after customers complete their bookings
                </p>
              </div>
            ) : (
              <div className="flex flex-column gap-4">
                {reviews.map((review) => (
                  <div key={review.id} className="surface-ground p-4 border-round">
                    <div className="flex justify-content-between mb-3">
                      <div className="flex align-items-center gap-3">
                        <div className="w-3rem h-3rem border-circle bg-primary flex align-items-center justify-content-center text-white font-bold">
                          {review.user?.firstName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-medium m-0">
                            {review.user?.firstName} {review.user?.lastName}
                          </p>
                          <p className="text-sm text-color-secondary m-0">
                            {review.service?.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Rating value={review.rating} readOnly cancel={false} />
                        <p className="text-xs text-color-secondary mt-1 mb-0">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <p className="line-height-3 m-0">{review.comment}</p>

                    {review.providerResponse ? (
                      <div className="mt-3 pl-4 border-left-3 border-primary">
                        <p className="text-sm font-medium mb-1">Your Response:</p>
                        <p className="text-sm m-0">{review.providerResponse}</p>
                        <Button
                          label="Edit Response"
                          icon="pi pi-pencil"
                          className="p-button-text p-button-sm mt-2"
                          onClick={() => handleOpenResponse(review)}
                        />
                      </div>
                    ) : (
                      <Button
                        label="Respond to Review"
                        icon="pi pi-reply"
                        className="p-button-outlined mt-3"
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
          </Card>
        </div>
      </div>

      {/* Response Dialog */}
      <Dialog
        header={selectedReview?.providerResponse ? 'Edit Response' : 'Respond to Review'}
        visible={responseDialogVisible}
        onHide={() => setResponseDialogVisible(false)}
        style={{ width: '500px' }}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button
              label="Cancel"
              className="p-button-text"
              onClick={() => setResponseDialogVisible(false)}
            />
            <Button
              label="Submit Response"
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
            <div className="surface-ground p-3 border-round mb-4">
              <div className="flex align-items-center gap-2 mb-2">
                <span className="font-medium">
                  {selectedReview.user?.firstName} {selectedReview.user?.lastName}
                </span>
                <Rating value={selectedReview.rating} readOnly cancel={false} />
              </div>
              <p className="text-sm m-0">{selectedReview.comment}</p>
            </div>

            <div className="field">
              <label className="block font-medium mb-2">Your Response</label>
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
