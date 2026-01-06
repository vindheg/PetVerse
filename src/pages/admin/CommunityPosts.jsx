// src/pages/admin/CommunityPosts.jsx - WITH REACT MODAL
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { showToast } from '../../utils/toast';
import { useAuth } from '../../contexts/AuthContext';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './admin.css';

const CommunityPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setPosts(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (postId, userName) => {
    setModalData({ postId, userName });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!modalData) return;

    const { postId, userName } = modalData;
    setShowModal(false);
    setProcessing(postId);

    try {
      const { error } = await supabase.from('community_posts').delete().eq('id', postId);
      if (error) throw error;
      showToast('Post deleted successfully!', 'success');
      loadPosts();
    } catch (e) {
      console.error(e);
      showToast('Failed to delete post: ' + e.message, 'error');
    } finally {
      setProcessing(null);
      setModalData(null);
    }
  };

  const getDisplayName = (post) => post.user_name || post.username || post.email?.split('@')[0] || 'Anonymous';
  const getPostContent = (post) => post.content || post.title || 'No content';

  return (
    <div style={{ padding: '20px', paddingTop: '100px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Community Posts</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Moderate user-generated content</p>
        </div>
        <button onClick={loadPosts} style={{ padding: '12px 24px', background: '#374151', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>
      <AdminNavbar />

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading...</p>
      ) : posts.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No posts found.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {posts.map(post => (
            <div key={post.id} style={{
              background: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb'
            }}>
              {/* Header */}
              <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#8B5FBF',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {getDisplayName(post)[0]?.toUpperCase()}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: '600' }}>{getDisplayName(post)}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
                {post.post_type && (
                  <span style={{ marginLeft: 'auto', padding: '4px 10px', background: '#E0E7FF', color: '#4338CA', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                    {post.post_type}
                  </span>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: '16px' }}>
                <p style={{ margin: 0, color: '#374151', lineHeight: '1.6' }}>{getPostContent(post)}</p>
              </div>

              {/* Image */}
              {(post.image || post.image_url) && (
                <img
                  src={post.image || post.image_url}
                  alt="Post"
                  style={{ width: '100%', maxHeight: '250px', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}

              {/* Delete Button */}
              <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
                <button
                  onClick={() => openDeleteModal(post.id, getDisplayName(post))}
                  disabled={processing === post.id}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: processing === post.id ? '#9CA3AF' : '#EF4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: processing === post.id ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {processing === post.id ? '⏳ Deleting...' : '🗑️ Delete Post'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showModal && modalData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>🗑️ Delete Post?</h2>
            <p style={{ margin: '0 0 24px 0', color: '#4b5563' }}>
              Delete this post by <strong>{modalData.userName}</strong>? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => { setShowModal(false); setModalData(null); }} style={{ padding: '12px 24px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                Cancel
              </button>
              <button onClick={confirmDelete} style={{ padding: '12px 24px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPosts;