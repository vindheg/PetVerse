import React from 'react';
import './SkeletonCard.css';

// Skeleton Card for Pet listings
export const SkeletonCard = () => {
    return (
        <div className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
                <div className="skeleton-tags">
                    <div className="skeleton-tag"></div>
                    <div className="skeleton-tag"></div>
                </div>
                <div className="skeleton-button"></div>
            </div>
        </div>
    );
};

// Multiple skeleton cards for loading grid
export const SkeletonGrid = ({ count = 6 }) => {
    return (
        <div className="skeleton-grid">
            {[...Array(count)].map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
};

// Skeleton for profile/details page
export const SkeletonProfile = () => {
    return (
        <div className="skeleton-profile">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-info">
                <div className="skeleton-title"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
            </div>
        </div>
    );
};

// Skeleton for list items
export const SkeletonList = ({ count = 5 }) => {
    return (
        <div className="skeleton-list">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="skeleton-list-item">
                    <div className="skeleton-list-avatar"></div>
                    <div className="skeleton-list-content">
                        <div className="skeleton-text"></div>
                        <div className="skeleton-text short"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SkeletonCard;
