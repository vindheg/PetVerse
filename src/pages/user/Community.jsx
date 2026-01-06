import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { showToast } from '../../utils/toast';
import DotsLoader from '../../components/common/DotsLoader';
import './Community.css';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [lostPets, setLostPets] = useState([]);
  const [postContent, setPostContent] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      // Fetch alerts (Visible to all)
      const { data: lostPetsData } = await supabase
        .from('lost_found_pets')
        .select('*')
        .or('verified_status.eq.approved,status.eq.approved')
        .order('created_at', { ascending: false });

      // Fetch posts (Visible to all)
      const { data: postsData } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      setLostPets(lostPetsData || []);
      setPosts(postsData || []);
    } catch (error) {
      showToast('Failed to load community feed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user) {
      showToast('Login required to post', 'error');
      return;
    }
    if (!postContent.trim()) return;

    try {
      const { error } = await supabase
        .from('community_posts')
        .insert([{
          user_id: user.id,
          user_name: user.email?.split('@')[0] || 'Anonymous',
          content: postContent.trim(),
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      showToast('Posted!', 'success');
      setPostContent('');
      await loadCommunityData();
    } catch (error) {
      showToast('Error posting', 'error');
    }
  };

  const getLostImage = (post) => {
    const fields = ['image', 'image_url', 'photo', 'pet_image'];
    for (const f of fields) { if (post[f]) return post[f]; }
    return null;
  };

  if (loading) {
    return (
      <div className="page-container">
        <DotsLoader />
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="community-hero-simple">
        <h1>PetVerse Community</h1>
        <p>Public feed and urgent alerts.</p>
      </header>

      <div className="community-main-layout">
        {/* POSTING AREA - login guard */}
        <div className="create-post-wrapper">
          {user ? (
            <div className="create-post-card">
              <h3>Share an update 🐾</h3>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Share a story or ask for advice..."
                className="whiskers-textarea"
                rows="3"
              />
              <button onClick={handleCreatePost} className="whiskers-btn-primary" disabled={!postContent.trim()}>Post Message</button>
            </div>
          ) : (
            <div className="login-prompt-card-modern">
              <h3>Join the Conversation!</h3>
              <p>You must log in to post or interact with the community.</p>
              <a href="/login" className="login-btn-purple">Login</a>
            </div>
          )}
        </div>

        {/* ALERTS - visible to all */}
        {lostPets.length > 0 && (
          <section className="lost-pets-section">
            <h2 className="section-title">🔎 Lost Pet Alerts</h2>
            <div className="lost-pets-grid">
              {lostPets.map((pet) => {
                const imageUrl = getLostImage(pet);
                return (
                  <div key={pet.id} className="lost-pet-card-modern">
                    <div className="lost-badge">LOST PET ALERT</div>
                    <div className="lost-card-content">
                      <h4>{pet.pet_name || 'Pet'}</h4>
                      <p><strong>Type:</strong> {pet.pet_type}</p>
                      <p><strong>Location:</strong> {pet.location}</p>
                      {imageUrl && <img src={imageUrl} alt="Lost" className="lost-img-preview" />}
                      <a
                        href={`/lost-found?foundPetId=${pet.id}`}
                        className="found-btn"
                        style={{
                          display: 'inline-block',
                          marginTop: '1rem',
                          padding: '0.5rem 1rem',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: 'white',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: '600',
                          textAlign: 'center',
                          fontSize: '0.9rem',
                          transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                      >
                        I Found This Pet
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* DISCUSSION - visible to all */}
        <section className="community-posts-section">
          <h2 className="section-title">💬 Recent Discussions</h2>
          <div className="posts-feed-list">
            {posts.map((post) => (
              <div key={post.id} className="discussion-card">
                <div className="discussion-header">
                  <div className="avatar-circle">{(post.user_name || '?')[0].toUpperCase()}</div>
                  <div className="discussion-meta">
                    <span className="discussion-author">{post.user_name}</span>
                    <span className="discussion-time">{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="discussion-body">{post.content}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Community;