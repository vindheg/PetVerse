import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, SearchIcon, PawIcon } from '../../components/common/Icons';
import './NotFound.css';

const NotFound = () => {
    return (
        <div className="not-found-page">
            <div className="not-found-content">
                {/* Animated Lost Puppy Illustration */}
                <div className="lost-pet-illustration">
                    <div className="pet-face">
                        <div className="pet-ear left"></div>
                        <div className="pet-ear right"></div>
                        <div className="pet-head">
                            <div className="pet-eyes">
                                <div className="eye left">
                                    <div className="pupil"></div>
                                </div>
                                <div className="eye right">
                                    <div className="pupil"></div>
                                </div>
                            </div>
                            <div className="pet-nose"></div>
                            <div className="pet-mouth"></div>
                        </div>
                    </div>
                    <div className="question-marks">
                        <span className="q-mark q1">?</span>
                        <span className="q-mark q2">?</span>
                        <span className="q-mark q3">?</span>
                    </div>
                </div>

                {/* Error Text */}
                <div className="error-code">
                    <span className="digit">4</span>
                    <div className="paw-digit">
                        <PawIcon size={80} color="var(--primary)" />
                    </div>
                    <span className="digit">4</span>
                </div>

                <h1 className="not-found-title">Oops! Page Not Found</h1>
                <p className="not-found-desc">
                    Looks like this page has gone for a walk and hasn't come back yet.
                    Don't worry, our furry friends are still here to help you find your way!
                </p>

                {/* Action Buttons */}
                <div className="not-found-actions">
                    <Link to="/" className="btn-primary-notfound">
                        <HomeIcon size={20} />
                        <span>Back to Home</span>
                    </Link>
                    <Link to="/adopt" className="btn-secondary-notfound">
                        <SearchIcon size={20} />
                        <span>Find Pets</span>
                    </Link>
                </div>

                {/* Floating Paws Decoration */}
                <div className="floating-paws-404">
                    <div className="paw-float p1"><PawIcon size={24} color="rgba(139, 95, 191, 0.2)" /></div>
                    <div className="paw-float p2"><PawIcon size={20} color="rgba(42, 157, 143, 0.2)" /></div>
                    <div className="paw-float p3"><PawIcon size={28} color="rgba(231, 111, 81, 0.2)" /></div>
                    <div className="paw-float p4"><PawIcon size={22} color="rgba(139, 95, 191, 0.15)" /></div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
