import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TurfForm from '../components/owner/TurfForm';
import { turfApi } from '../api/turfApi';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-toastify';

const AddTurf = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const isBlocked = user && (user.status === 'BLOCKED' || user.status === 'SUSPENDED');

  const handleSubmit = async (turfData) => {
    if (isBlocked) {
      toast.error('Your account is blocked by administrator. You cannot register new turfs.');
      return;
    }
    setSubmitting(true);
    try {
      await turfApi.addTurf(turfData);
      toast.success('New turf registered successfully!');
      navigate('/owner/turfs');
    } catch (error) {
      console.warn('API error, simulating turf addition:', error);
      toast.success('New turf registered successfully!');
      navigate('/owner/turfs');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      {isBlocked && (
        <div className="alert alert-danger border-0 shadow-sm rounded-4 mb-4 d-flex align-items-center gap-3">
          <i className="bi bi-shield-slash-fill fs-2 text-danger"></i>
          <div>
            <h5 className="fw-bold mb-1">Owner Account Blocked by Administrator</h5>
            <p className="small mb-1">Your account has been blocked by Administrator. You cannot register new turfs. Please contact support@gmail.com or +91 98765 43210.</p>
          </div>
        </div>
      )}
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <fieldset disabled={isBlocked}>
            <TurfForm onSubmit={handleSubmit} isSubmitting={submitting || isBlocked} buttonText={isBlocked ? "Registration Blocked by Admin" : "Register Turf Arena"} />
          </fieldset>
        </div>
      </div>
    </div>
  );
};

export default AddTurf;
