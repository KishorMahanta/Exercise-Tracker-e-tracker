import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Plus, X, Calendar, Clock, Flame, 
  TrendingUp, Dumbbell, Heart, Zap, Edit2, Trash2, 
  CheckCircle, AlertCircle, Github, Mail, Linkedin
} from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/exercises';

function App() {
  const [exercises, setExercises] = useState([]);
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    calories: '',
    category: 'cardio',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchExercises();
    fetchStats();
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setExercises(response.data.data || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      showNotification('Backend not connected! Check server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats/summary`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const showNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const response = await axios.put(`${API_URL}/${editingId}`, formData);
        setExercises(prevExercises =>
          prevExercises.map(ex =>
            ex._id === editingId ? response.data.data : ex
          )
        );
        showNotification('Exercise updated successfully!', 'success');
      } else {
        const response = await axios.post(API_URL, formData);
        setExercises(prevExercises => [response.data.data, ...prevExercises]);
        showNotification('Exercise added successfully!', 'success');
      }
      
      fetchStats();
      resetForm();
    } catch (error) {
      console.error('Error saving exercise:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.errors?.[0] || 'Error saving exercise';
      showNotification(errorMsg, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this exercise?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setExercises(prevExercises => prevExercises.filter(ex => ex._id !== id));
        fetchStats();
        showNotification('Exercise deleted successfully!', 'success');
      } catch (error) {
        console.error('Error deleting exercise:', error);
        showNotification('Failed to delete exercise', 'error');
      }
    }
  };

  const handleEdit = (exercise) => {
    setFormData({
      name: exercise.name,
      duration: exercise.duration,
      calories: exercise.calories,
      category: exercise.category,
      notes: exercise.notes || '',
      date: new Date(exercise.date).toISOString().split('T')[0]
    });
    setEditingId(exercise._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      duration: '',
      calories: '',
      category: 'cardio',
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getCategoryIcon = (category) => {
    const iconProps = { size: 20 };
    switch (category) {
      case 'cardio': return <Heart {...iconProps} />;
      case 'strength': return <Dumbbell {...iconProps} />;
      case 'flexibility': return <Zap {...iconProps} />;
      case 'sports': return <Activity {...iconProps} />;
      default: return <Activity {...iconProps} />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'cardio': return { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' };
      case 'strength': return { bg: '#dbeafe', text: '#2563eb', border: '#93c5fd' };
      case 'flexibility': return { bg: '#d1fae5', text: '#059669', border: '#6ee7b7' };
      case 'sports': return { bg: '#e9d5ff', text: '#9333ea', border: '#d8b4fe' };
      default: return { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1' };
    }
  };

  const filteredExercises = filter === 'all' 
    ? exercises 
    : exercises.filter(ex => ex.category === filter);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Notifications */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <AnimatePresence>
          {notifications.map(notif => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              style={{
                background: 'white',
                padding: '16px 20px',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minWidth: '320px',
                maxWidth: '400px',
                borderLeft: `4px solid ${notif.type === 'success' ? '#10b981' : '#ef4444'}`
              }}
            >
              {notif.type === 'success' ? (
                <CheckCircle size={24} style={{ color: '#10b981', flexShrink: 0 }} />
              ) : (
                <AlertCircle size={24} style={{ color: '#ef4444', flexShrink: 0 }} />
              )}
              <span style={{ color: '#1e293b', fontSize: '14px', fontWeight: '500' }}>{notif.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        style={{
          background: 'white',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #1e293b 0%, #1e293b 100%)', 
              padding: '10px', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Activity size={28} style={{ color: 'white' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>E-Tracker</h1>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Fitness Journey Tracker</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #1e293b 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
          >
            <Plus size={20} />
            <span style={{ display: window.innerWidth > 640 ? 'inline' : 'none' }}>Add Exercise</span>
          </motion.button>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '40px 24px' }}>
        {/* Stats Section */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>Dashboard Overview</h2>
          
          {stats && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '20px',
              marginBottom: '32px'
            }}>
              <motion.div
                whileHover={{ y: -5 }}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ background: '#dbeafe', padding: '12px', borderRadius: '12px' }}>
                    <TrendingUp size={24} style={{ color: '#2563eb' }} />
                  </div>
                  <motion.span
                    key={stats.overall.totalExercises}
                    initial={{ scale: 1.3, color: '#2563eb' }}
                    animate={{ scale: 1, color: '#1e293b' }}
                    style={{ fontSize: '36px', fontWeight: '700' }}
                  >
                    {stats.overall.totalExercises}
                  </motion.span>
                </div>
                <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Total Workouts</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ background: '#e0e7ff', padding: '12px', borderRadius: '12px' }}>
                    <Clock size={24} style={{ color: '#6366f1' }} />
                  </div>
                  <motion.span
                    key={stats.overall.totalDuration}
                    initial={{ scale: 1.3, color: '#6366f1' }}
                    animate={{ scale: 1, color: '#1e293b' }}
                    style={{ fontSize: '36px', fontWeight: '700' }}
                  >
                    {stats.overall.totalDuration}
                  </motion.span>
                </div>
                <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Minutes Trained</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ background: '#fed7aa', padding: '12px', borderRadius: '12px' }}>
                    <Flame size={24} style={{ color: '#ea580c' }} />
                  </div>
                  <motion.span
                    key={stats.overall.totalCalories}
                    initial={{ scale: 1.3, color: '#ea580c' }}
                    animate={{ scale: 1, color: '#1e293b' }}
                    style={{ fontSize: '36px', fontWeight: '700' }}
                  >
                    {stats.overall.totalCalories}
                  </motion.span>
                </div>
                <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Calories Burned</p>
              </motion.div>
            </div>
          )}
        </div>

        {/* Filter Section */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {['all', 'cardio', 'strength', 'flexibility', 'sports'].map((cat) => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(cat)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: filter === cat ? 'none' : '2px solid #e2e8f0',
                  background: filter === cat ? 'linear-gradient(135deg, #1e293b 0%, #1e293b 100%)' : 'white',
                  color: filter === cat ? 'white' : '#64748b',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Exercise List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{ display: 'inline-block' }}
            >
              <Activity size={48} style={{ color: '#1e293b' }} />
            </motion.div>
            <p style={{ marginTop: '16px', color: '#64748b', fontSize: '16px' }}>Loading exercises...</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '20px' 
          }}>
            <AnimatePresence mode="popLayout">
              {filteredExercises.map((exercise, index) => {
                const colors = getCategoryColor(exercise.category);
                return (
                  <motion.div
                    key={exercise._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)' }}
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '20px',
                      border: `2px solid ${colors.border}`,
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{
                        background: colors.bg,
                        padding: '12px',
                        borderRadius: '12px',
                        color: colors.text
                      }}>
                        {getCategoryIcon(exercise.category)}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(exercise)}
                          style={{
                            background: '#f1f5f9',
                            border: 'none',
                            padding: '8px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Edit2 size={16} style={{ color: '#64748b' }} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(exercise._id)}
                          style={{
                            background: '#fee2e2',
                            border: 'none',
                            padding: '8px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Trash2 size={16} style={{ color: '#dc2626' }} />
                        </motion.button>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                      {exercise.name}
                    </h3>
                    <p style={{ 
                      fontSize: '12px', 
                      color: colors.text, 
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      marginBottom: '16px'
                    }}>
                      {exercise.category}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} style={{ color: '#6366f1' }} />
                        <span style={{ fontSize: '14px', color: '#64748b' }}>{exercise.duration} minutes</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Flame size={16} style={{ color: '#ea580c' }} />
                        <span style={{ fontSize: '14px', color: '#64748b' }}>{exercise.calories} calories</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={16} style={{ color: '#10b981' }} />
                        <span style={{ fontSize: '14px', color: '#64748b' }}>
                          {new Date(exercise.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {exercise.notes && (
                      <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#64748b',
                        borderLeft: `3px solid ${colors.text}`
                      }}>
                        {exercise.notes}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {filteredExercises.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '80px 20px' }}
          >
            <Activity size={64} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
            <p style={{ fontSize: '20px', color: '#64748b', fontWeight: '600' }}>No exercises found</p>
            <p style={{ color: '#94a3b8', marginTop: '8px' }}>Start tracking your fitness journey!</p>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer style={{
        background: '#1e293b',
        color: 'white',
        padding: '40px 24px',
        marginTop: 'auto'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: window.innerWidth > 768 ? 'repeat(3, 1fr)' : '1fr',
            gap: '32px',
            marginBottom: '32px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #1e293b 100%)', padding: '8px', borderRadius: '10px' }}>
                  <Activity size={24} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>E-Tracker</h3>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
                Track your fitness journey with ease. Monitor workouts, burn calories, and achieve your goals.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Quick Links</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '10px' }}>
                  <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Dashboard</a>
                </li>
                <li style={{ marginBottom: '10px' }}>
                  <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Exercises</a>
                </li>
                <li style={{ marginBottom: '10px' }}>
                  <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Statistics</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Connect</h4>
              <div style={{ display: 'flex', gap: '12px' }}>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ 
                  background: '#334155',
                  padding: '10px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s'
                }}>
                  <Github size={20} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ 
                  background: '#334155',
                  padding: '10px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s'
                }}>
                  <Linkedin size={20} />
                </a>
                <a href="mailto:kishormahanta004@gmail.com" style={{ 
                  background: '#334155',
                  padding: '10px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s'
                }}>
                  <Mail size={20} />
                </a>
              </div>
            </div>
          </div>

          <div style={{ 
            borderTop: '1px solid #334155', 
            paddingTop: '24px', 
            textAlign: 'center' 
          }}>
            <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
              © 2025 E-Tracker. Developed with ❤️ by <strong style={{ color: 'white' }}>Kishor Mahanta</strong>
            </p>
          </div>
        </div>
      </footer>

     {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                zIndex: 999
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1000,
                width: '90%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
            >
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  marginBottom: '24px' 
                }}>
                  <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                    {editingId ? 'Edit Exercise' : 'Add New Exercise'}
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={resetForm}
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <X size={20} style={{ color: '#64748b' }} />
                  </motion.button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#475569', 
                      marginBottom: '8px' 
                    }}>
                      Exercise Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.3s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#1e293b'}
                      onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                      placeholder="e.g., Morning Run"
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#475569', 
                        marginBottom: '8px' 
                      }}>
                        Duration (min) *
                      </label>
                      <input
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e2e8f0',
                          borderRadius: '10px',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border-color 0.3s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#1e293b'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        placeholder="30"
                        required
                        min="1"
                        max="600"
                      />
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#475569', 
                        marginBottom: '8px' 
                      }}>
                        Calories *
                      </label>
                      <input
                        type="number"
                        value={formData.calories}
                        onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e2e8f0',
                          borderRadius: '10px',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border-color 0.3s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#1e293b'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        placeholder="200"
                        required
                        min="0"
                        max="5000"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#475569', 
                      marginBottom: '8px' 
                    }}>
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '14px',
                        outline: 'none',
                        cursor: 'pointer',
                        background: 'white',
                        transition: 'border-color 0.3s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#1e293b'}
                      onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                      required
                    >
                      <option value="cardio">Cardio</option>
                      <option value="strength">Strength</option>
                      <option value="flexibility">Flexibility</option>
                      <option value="sports">Sports</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#475569', 
                      marginBottom: '8px' 
                    }}>
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '14px',
                        outline: 'none',
                        cursor: 'pointer',
                        transition: 'border-color 0.3s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#1e293b'}
                      onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#475569', 
                      marginBottom: '8px' 
                    }}>
                      Notes (Optional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '14px',
                        outline: 'none',
                        resize: 'vertical',
                        minHeight: '80px',
                        fontFamily: 'inherit',
                        transition: 'border-color 0.3s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#1e293b'}
                      onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                      placeholder="Add any additional notes..."
                      maxLength="500"
                    />
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                      {formData.notes.length}/500 characters
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={resetForm}
                      style={{
                        flex: 1,
                        padding: '14px',
                        border: '2px solid #e2e8f0',
                        background: 'white',
                        color: '#64748b',
                        borderRadius: '10px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      style={{
                        flex: 1,
                        padding: '14px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #1e293b 0%, #1e293b 100%)',
                        color: 'white',
                        borderRadius: '10px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                        transition: 'all 0.3s'
                      }}
                    >
                      {editingId ? 'Update Exercise' : 'Add Exercise'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;