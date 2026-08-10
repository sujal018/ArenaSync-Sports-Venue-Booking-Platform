import React, { useState, useEffect } from 'react';
import { turfApi } from '../api/turfApi';
import TurfCard from '../components/turf/TurfCard';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';

const Home = () => {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [maxPrice, setMaxPrice] = useState(5000);
  const [searchTerm, setSearchTerm] = useState('');
  const [backendMessage, setBackendMessage] = useState('');

  const popularCities = ['Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 'Delhi', 'Chennai'];

  useEffect(() => {
    fetchTurfs();
  }, []);

  const fetchTurfs = async () => {
    setLoading(true);
    setBackendMessage('');
    try {
      const data = await turfApi.getAllTurfs();
      const list = Array.isArray(data) ? data : (data?.content || data?.data || []);
      setTurfs(list);
    } catch (error) {
      console.warn('Backend API connection note:', error);
      const msg = error.response?.data?.message || 'Could not connect to Spring Boot backend.';
      setBackendMessage(msg);
      toast.info(msg);
      setTurfs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCityFilter = async (city) => {
    setSelectedCity(city);
    setBackendMessage('');
    if (!city) {
      fetchTurfs();
      return;
    }
    setLoading(true);
    try {
      const data = await turfApi.getTurfsByCity(city);
      const list = Array.isArray(data) ? data : (data?.content || data?.data || []);
      setTurfs(list);
    } catch (error) {
      console.error('City filter API error:', error);
      const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : `No Turf available for city ${city}`);
      setBackendMessage(msg);
      setTurfs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTurfs = turfs.filter((turf) => {
    const name = turf.turfName || turf.name || '';
    const city = turf.city || turf.location || '';
    const sport = turf.sportType || turf.sportsType || turf.sportCategory || '';
    const price = turf.basePrice ?? turf.pricePerHour ?? 0;
    
    // Check turf approval status AND owner status - BLOCKED owners or SUSPENDED turfs must not be visible on Home page
    const status = String(turf.status || 'APPROVED').toUpperCase();
    const isApproved = status === 'APPROVED' || status === 'ACTIVE';

    const ownerStatus = String(turf.ownerStatus || 'ACTIVE').toUpperCase();
    const isOwnerActive = ownerStatus === 'ACTIVE';

    if (!isApproved || !isOwnerActive) {
      return false;
    }

    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = !selectedSport || sport.toUpperCase().includes(selectedSport.toUpperCase());
    const matchesPrice = price <= maxPrice;
    return matchesSearch && matchesSport && matchesPrice;
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient text-white py-5 px-3 mb-5 position-relative">
        <div className="container py-4 position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <span className="badge bg-emerald bg-opacity-25 text-emerald border border-emerald mb-3 px-3 py-2 rounded-pill fw-semibold small">
                ⚡ ArenaSync: Sports Venue Booking Platform
              </span>
              
              <h1 className="display-4 fw-extrabold mb-3 leading-tight">
                Every Great Game <span className="text-emerald">Begins with the Right Venue.</span>
              </h1>
              
              <p className="lead opacity-90 mb-4 fs-5">
                Book top-rated football turfs, cricket arenas, badminton courts, and more—fast, secure, and hassle-free.
              </p>

              {/* Single Unified Rounded Pill Search Bar */}
              <div className="card border-0 p-2 shadow-lg bg-white text-dark rounded-pill mb-4" style={{ maxWidth: '620px' }}>
                <div className="row g-1 align-items-center">
                  <div className="col-md-5 col-6">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-0 text-secondary ps-3">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-0 shadow-none ps-1"
                        placeholder="Search arena, turf name, or city..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-md-4 col-6 border-start border-end">
                    <select
                      className="form-select border-0 shadow-none px-3 text-secondary"
                      value={selectedSport}
                      onChange={(e) => setSelectedSport(e.target.value)}
                    >
                      <option value="">All Sports Categories</option>
                      <option value="CRICKET">🏏 Cricket</option>
                      <option value="FOOTBALL">⚽ Football</option>
                      <option value="BADMINTON">🏸 Badminton</option>
                      <option value="TENNIS">🎾 Tennis</option>
                      <option value="BOX_CRICKET">🏟️ Box Cricket</option>
                      <option value="VOLLEYBALL">🏐 Volleyball</option>
                      <option value="MULTI_SPORT">🏆 Multi-Sport</option>
                    </select>
                  </div>

                  <div className="col-md-3 col-12">
                    <button
                      className="btn btn-emerald w-100 py-2 rounded-pill fw-bold shadow-sm"
                      onClick={() => handleCityFilter(selectedCity)}
                    >
                      Find Turfs
                    </button>
                  </div>
                </div>
              </div>

              {/* Feature Highlights Row */}
              <div className="row g-3 mb-4 text-white-50 small">
                <div className="col-6 col-sm-3 d-flex align-items-center gap-2">
                  <i className="bi bi-shield-check text-emerald fs-5"></i>
                  <span>Top Rated Venues</span>
                </div>
                <div className="col-6 col-sm-3 d-flex align-items-center gap-2">
                  <i className="bi bi-calendar-event text-emerald fs-5"></i>
                  <span>Real-time Availability</span>
                </div>
                <div className="col-6 col-sm-3 d-flex align-items-center gap-2">
                  <i className="bi bi-lock text-emerald fs-5"></i>
                  <span>Secure Bookings</span>
                </div>
                <div className="col-6 col-sm-3 d-flex align-items-center gap-2">
                  <i className="bi bi-headset text-emerald fs-5"></i>
                  <span>24/7 Support</span>
                </div>
              </div>

              {/* Popular Sports Quick Chips */}
              <div>
                <span className="small text-white-50 d-block mb-2 font-monospace">Popular Sports</span>
                <div className="d-flex flex-wrap gap-2">
                  <button
                    className={`btn btn-sm rounded-pill px-3 py-1 ${selectedSport === 'FOOTBALL' ? 'btn-emerald' : 'btn-outline-light text-white'}`}
                    onClick={() => setSelectedSport('FOOTBALL')}
                  >
                    ⚽ Football
                  </button>
                  <button
                    className={`btn btn-sm rounded-pill px-3 py-1 ${selectedSport === 'CRICKET' || selectedSport === 'BOX_CRICKET' ? 'btn-emerald' : 'btn-outline-light text-white'}`}
                    onClick={() => setSelectedSport('CRICKET')}
                  >
                    🏏 Cricket
                  </button>
                  <button
                    className={`btn btn-sm rounded-pill px-3 py-1 ${selectedSport === 'BADMINTON' ? 'btn-emerald' : 'btn-outline-light text-white'}`}
                    onClick={() => setSelectedSport('BADMINTON')}
                  >
                    🏸 Badminton
                  </button>
                  <button
                    className={`btn btn-sm rounded-pill px-3 py-1 ${!selectedSport ? 'btn-emerald' : 'btn-outline-light text-white'}`}
                    onClick={() => setSelectedSport('')}
                  >
                    <i className="bi bi-grid-fill me-1"></i> More
                  </button>
                </div>
              </div>
            </div>

            {/* Custom PLAYERS Hero Banner Image */}
            <div className="col-lg-5 d-none d-lg-block text-center">
              <img
                src="/assets/players-hero.png"
                alt="PLAYERS Sports Turf Banner"
                className="img-fluid rounded-4 shadow-lg border border-2 border-emerald"
                style={{ maxHeight: '440px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Cities Pills */}
      <div className="container mb-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="fw-bold text-dark mb-0">Popular Cities</h5>
          {selectedCity && (
            <button className="btn btn-link text-emerald btn-sm text-decoration-none" onClick={() => { setSelectedCity(''); setBackendMessage(''); fetchTurfs(); }}>
              Clear City Filter
            </button>
          )}
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button
            className={`btn rounded-pill px-3 py-2 ${!selectedCity ? 'btn-emerald' : 'btn-outline-secondary'}`}
            onClick={() => { setSelectedCity(''); setBackendMessage(''); fetchTurfs(); }}
          >
            All Cities
          </button>
          {popularCities.map((city) => (
            <button
              key={city}
              className={`btn rounded-pill px-3 py-2 ${selectedCity === city ? 'btn-emerald' : 'btn-outline-secondary'}`}
              onClick={() => handleCityFilter(city)}
            >
              <i className="bi bi-geo-alt me-1"></i> {city}
            </button>
          ))}
        </div>
      </div>

      {/* Main Turf Section */}
      <div className="container mb-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h3 className="fw-bold text-dark mb-1">Available Turf Venues ({filteredTurfs.length})</h3>
            <p className="text-muted small mb-0">Real-time turf listings fetched directly from your Spring Boot database</p>
          </div>

          {/* Price Range Filter */}
          <div className="d-flex align-items-center gap-3">
            <span className="small text-muted fw-semibold">Max Price: ₹{maxPrice}/hr</span>
            <input
              type="range"
              className="form-range"
              min="100"
              max="5000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ width: '150px' }}
            />
          </div>
        </div>

        {loading ? (
          <Loader message="Fetching turfs directly from your Spring Boot database..." />
        ) : filteredTurfs.length === 0 ? (
          <div className="text-center py-5 glass-card">
            <i className="bi bi-emoji-frown display-3 text-muted mb-3"></i>
            <h4 className="fw-bold text-dark mb-2">No Turfs Found</h4>
            <p className="text-secondary fw-semibold fs-5 mb-3 px-3">
              {backendMessage || (selectedCity ? `No Turf available for city ${selectedCity}` : 'No turfs match your current filter, or no approved turfs are listed yet.')}
            </p>
            <button
              className="btn btn-emerald px-4 py-2 rounded-pill fw-bold"
              onClick={() => { setSelectedCity(''); setSelectedSport(''); setSearchTerm(''); setMaxPrice(5000); setBackendMessage(''); fetchTurfs(); }}
            >
              Reset Filters / View All Turfs
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {filteredTurfs.map((turf) => (
              <div key={turf.id} className="col-lg-4 col-md-6">
                <TurfCard turf={turf} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
