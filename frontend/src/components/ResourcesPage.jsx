import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/ResourcesPage.css';
import axios from 'axios';
import toast from 'react-hot-toast';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    company: '',
    role: ''
  });
  const [expandedCard, setExpandedCard] = useState(null);
  const navigate = useNavigate();

  // ✅ Fetch resources with token
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const local = localStorage.getItem('IntelliPrepUser');
        const user = local ? JSON.parse(local) : null;
        const token = user?.accessToken;

        const response = await axios.get(`${BACKEND_URL}/api/v1/resources/`);

        const data = response.data.data;
        console.log(data.data);
        setResources(data);
        setFilteredResources(data);
      } catch (error) {
        console.error('Error fetching resources:', error);
        toast.error('Failed to load resources.');
      }
    };

    fetchResources();
  }, []);

  // ✅ Apply filters when filters/resources change
  useEffect(() => {
    let results = resources;

    if (filters.type) {
      results = results.filter(res => res.type === filters.type);
    }
    if (filters.company) {
      results = results.filter(res => res.company === filters.company);
    }
    if (filters.role) {
      results = results.filter(res => res.role === filters.role);
    }

    setFilteredResources(results);
  }, [filters, resources]);

  const companies = [...new Set(resources.map(res => res.company).filter(Boolean))];
  const roles = [...new Set(resources.map(res => res.role).filter(Boolean))];

  const toggleCard = (type) => {
    setExpandedCard(expandedCard === type ? null : type);
  };

  return (
    <div className="resources-container">
      {/* Sidebar */}
      <div className="filters-sidebar">
        <h2>Filters</h2>

        <div className="filter-group">
          
        </div>

        <div className="filter-group">
          <label>Company</label>
          <select
            value={filters.company}
            onChange={(e) => setFilters({ ...filters, company: e.target.value })}
          >
            <option value="">All Companies</option>
            {companies.map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Role</label>
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          >
            <option value="">All Roles</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <button
          className="clear-filters"
          onClick={() => setFilters({ type: '', company: '', role: '' })}
        >
          Clear All Filters
        </button>
      </div>

      {/* Cards */}
      <div className="resources-content">
        {['DSA', 'InterviewQuestion', 'Guide'].map(type => (
          <div
            key={type}
            className={`resource-card ${expandedCard === type ? 'expanded' : ''}`}
            onClick={() => toggleCard(type)}
          >
            <div className="card-header">
              <h3>{type === 'DSA' ? 'DSA Problems' : type === 'InterviewQuestion' ? 'Interview Questions' : 'Guides'}</h3>
              <span>{filteredResources.filter(r => r.type === type).length} items</span>
            </div>

            {expandedCard === type && (
              <div className="card-content">
                {filteredResources
                  .filter(r => r.type === type)
                  .map(resource => (
                    <div key={resource._id} className="resource-item">
                      <h4>{resource.title}</h4>
                      {resource.company && <p className="company">{resource.company}</p>}
                      <p className="content-preview">
                        {resource.content}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourcesPage;
