export declare enum SortBy {
    PRICE = "price",
    RATING = "rating",
    REVIEWS = "reviews",
    NEWEST = "newest"
}
export declare enum SortOrder {
    ASC = "asc",
    DESC = "desc"
}
export declare class ServiceFiltersDto {
    category?: string;
    city?: string;
    governorate?: string;
    priceMin?: number;
    priceMax?: number;
    ratingMin?: number;
    date?: string;
    capacity?: number;
    featured?: boolean;
    sortBy?: SortBy;
    sortOrder?: SortOrder;
    page?: number;
    limit?: number;
}
