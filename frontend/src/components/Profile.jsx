import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Profile.css'; // Create this CSS file for styling

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const local = localStorage.getItem('IntelliPrepUser');
                const user = local ? JSON.parse(local) : null;
                const token = user?.accessToken; // Access token from the parsed object
                const response = await fetch(`${BACKEND_URL}/api/v1/users/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user details');
                }

                const data = await response.json();
                setUser(data.data); // Assuming your ApiResponse wraps data in a data property
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, []);

    const handleLogout = () => {
        // Call your logout endpoint
        fetch(`${BACKEND_URL}/api/users/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        })
            .then(() => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('IntelliPrepUser');
                navigate('/login');
            })
            .catch(err => console.error('Logout failed:', err));
    };

    if (loading) return <div className="profile-loading">Loading...</div>;
    if (error) return <div className="profile-error">Error: {error}</div>;

    return (
        <div className="profile-container">
            <h1>User Profile</h1>

            {user && (
                <div className="profile-details">
                    <div className="profile-field">
                        <span className="field-label">Username:</span>
                        <span className="field-value">{user.username}</span>
                    </div>

                    <div className="profile-field">
                        <span className="field-label">Email:</span>
                        <span className="field-value">{user.email}</span>
                    </div>

                    <div className="profile-field">
                        <span className="field-label">Account Created:</span>
                        <span className="field-value">
                            {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            )}

            <button
                onClick={handleLogout}
                className="logout-button"
            >
                Logout
            </button>
        </div>
    );
};

export default Profile;