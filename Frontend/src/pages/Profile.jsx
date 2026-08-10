import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { authApi } from '../api/authApi';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || user?.name?.split(' ')[0] || '',
    lastName: user?.lastName || user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || user?.phone || '',
    profileImage: user?.profileImage || '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.email) {
      authApi.getUserByEmail(user.email)
        .then((profileData) => {
          if (profileData) {
            setFormData({
              firstName: profileData.firstName || '',
              lastName: profileData.lastName || '',
              email: profileData.email || user.email,
              phoneNumber: profileData.phoneNumber || '',
              profileImage: profileData.profileImage || '',
            });
            updateUserProfile(profileData);
          }
        })
        .catch((err) => console.warn('Could not fetch user profile details:', err));
    }
  }, []);

  const formatImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:8080${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleUploadImage = async () => {
    if (!imageFile) {
      toast.info('Please select an image file first');
      return;
    }

    setUploadingImage(true);
    try {
      const response = await authApi.uploadProfileImage(imageFile);
      // Response expected: String image URL or User object
      const newImageUrl = typeof response === 'string' ? response : (response.profileImage || response.imageUrl);
      setFormData((prev) => ({ ...prev, profileImage: newImageUrl }));
      updateUserProfile({ profileImage: newImageUrl });
      toast.success('Profile picture updated successfully!');
      setImageFile(null);
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      toast.error(error.response?.data?.message || 'Failed to upload profile picture.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.updateUser(user.email, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        profileImage: formData.profileImage,
      });
      updateUserProfile({
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
      });
      toast.success('Profile details updated successfully!');
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile details.');
    } finally {
      setLoading(false);
    }
  };

  const fullName = `${formData.firstName} ${formData.lastName}`.trim() || user?.email;
  const avatarUrl = formatImageUrl(formData.profileImage);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card border-0 shadow-lg glass-card p-4 p-md-5">
            {/* User Header with Optional Profile Avatar */}
            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
              <div className="position-relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="rounded-circle object-fit-cover shadow-sm border border-emerald border-2"
                    style={{ width: '72px', height: '72px' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="bg-emerald text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-2" style={{ width: '72px', height: '72px' }}>
                    {formData.firstName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>

              <div>
                <h4 className="fw-bold text-dark mb-0">{fullName}</h4>
                <p className="text-muted small mb-0">{user?.email}</p>
                <span className="badge bg-emerald text-uppercase mt-1" style={{ fontSize: '0.7rem' }}>
                  {user?.role?.replace('ROLE_', '')} Account
                </span>
              </div>
            </div>

            {/* Optional Profile Image Uploader */}
            <div className="card bg-light border-0 p-3 mb-4 rounded-3">
              <label className="form-label fw-semibold text-dark small mb-2">
                <i className="bi bi-camera me-1 text-emerald"></i> Update Profile Picture (Optional)
              </label>
              <div className="input-group">
                <input
                  type="file"
                  className="form-control form-control-sm"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageChange}
                />
                <button
                  type="button"
                  className="btn btn-emerald btn-sm px-3"
                  onClick={handleUploadImage}
                  disabled={!imageFile || uploadingImage}
                >
                  {uploadingImage ? 'Uploading...' : 'Upload Avatar'}
                </button>
              </div>
              <small className="text-muted mt-1 d-block" style={{ fontSize: '0.75rem' }}>
                Supports JPG, JPEG, and PNG formats.
              </small>
            </div>

            {/* Main Form */}
            <form onSubmit={handleProfileSubmit}>
              <h5 className="fw-bold text-dark mb-3">Account Information</h5>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.firstName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.lastName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Email Address (Read-only)</label>
                <input type="email" className="form-control bg-light" value={formData.email} disabled />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                />
              </div>

              <button type="submit" className="btn btn-emerald w-100 py-3 rounded-3 fw-bold" disabled={loading}>
                {loading ? 'Saving Changes...' : 'Update Profile Details'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
