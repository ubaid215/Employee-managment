import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useEmployee } from '../../context/EmployeeContext';
import { 
  User, Mail, Phone, Home, Calendar, Briefcase, 
  CreditCard, Shield, Edit, Save, X, Image, 
  Smartphone, Contact, Clock, Hash,
  Loader2
} from 'lucide-react';

const EmployeeProfile = () => {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const { fetchDepartments, departments, loading: empLoading } = useEmployee();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    cnic: '',
    emergencyContact: {
      name: '',
      relation: '',
      phone: ''
    }
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        address: user.profile?.address || '',
        cnic: user.profile?.cnic || '',
        emergencyContact: {
          name: user.profile?.emergencyContact?.name || '',
          relation: user.profile?.emergencyContact?.relation || '',
          phone: user.profile?.emergencyContact?.phone || ''
        }
      });
      setImagePreview(user.profile?.profileImage || '');
    }
    fetchDepartments();
  }, [user, fetchDepartments]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('emergencyContact')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        name: formData.name,
        profile: {
          phone: formData.phone,
          address: formData.address,
          cnic: formData.cnic,
          emergencyContact: formData.emergencyContact
        }
      };

      await updateProfile(updatedData, profileImage);
      setEditMode(false);
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  const loading = authLoading || empLoading;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          {!editMode ? (
            <button 
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit size={18} /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={() => setEditMode(false)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X size={18} /> Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 md:col-span-1 border border-gray-100">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-blue-100">
                    <User size={48} className="text-gray-400" />
                  </div>
                )}
                {editMode && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Image size={18} />
                  </label>
                )}
              </div>
              
              <h2 className="text-xl font-semibold text-center">
                {editMode ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="text-center bg-gray-100 rounded px-3 py-1 w-full max-w-xs"
                  />
                ) : (
                  user?.name
                )}
              </h2>
              <p className="text-gray-500 text-sm mt-1">{user?.role === 'admin' ? 'Admin' : 'Employee'}</p>
              
              <div className="w-full mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-400" />
                  <span className="text-gray-700">{user?.email}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Briefcase size={18} className="text-gray-400" />
                  <span className="text-gray-700">
                    {departments.find(d => d._id === user?.department)?.name || 'Not assigned'}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-gray-400" />
                  <span className="text-gray-700">
                    Joined {new Date(user?.profile?.joiningDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Info Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User size={20} className="text-blue-500" />
              Personal Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                {editMode ? (
                  <div className="flex items-center gap-2">
                    <Phone size={18} className="text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="bg-gray-100 rounded px-3 py-2 w-full"
                    />
                  </div>
                ) : (
                  <p className="flex items-center gap-2">
                    <Phone size={18} className="text-gray-400" />
                    {user?.profile?.phone || 'Not provided'}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                {editMode ? (
                  <div className="flex items-start gap-2">
                    <Home size={18} className="text-gray-400 mt-2" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="bg-gray-100 rounded px-3 py-2 w-full"
                      rows={3}
                    />
                  </div>
                ) : (
                  <p className="flex items-start gap-2">
                    <Home size={18} className="text-gray-400 mt-0.5" />
                    {user?.profile?.address || 'Not provided'}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">CNIC</label>
                {editMode ? (
                  <div className="flex items-center gap-2">
                    <Hash size={18} className="text-gray-400" />
                    <input
                      type="text"
                      name="cnic"
                      value={formData.cnic}
                      onChange={handleChange}
                      placeholder="XXXXX-XXXXXXX-X"
                      className="bg-gray-100 rounded px-3 py-2 w-full"
                    />
                  </div>
                ) : (
                  <p className="flex items-center gap-2">
                    <Hash size={18} className="text-gray-400" />
                    {user?.profile?.cnic || 'Not provided'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contact Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Contact size={20} className="text-red-500" />
              Emergency Contact
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                {editMode ? (
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-gray-400" />
                    <input
                      type="text"
                      name="emergencyContact.name"
                      value={formData.emergencyContact.name}
                      onChange={handleChange}
                      className="bg-gray-100 rounded px-3 py-2 w-full"
                    />
                  </div>
                ) : (
                  <p className="flex items-center gap-2">
                    <User size={18} className="text-gray-400" />
                    {user?.profile?.emergencyContact?.name || 'Not provided'}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Relation</label>
                {editMode ? (
                  <div className="flex items-center gap-2">
                    <Shield size={18} className="text-gray-400" />
                    <input
                      type="text"
                      name="emergencyContact.relation"
                      value={formData.emergencyContact.relation}
                      onChange={handleChange}
                      className="bg-gray-100 rounded px-3 py-2 w-full"
                    />
                  </div>
                ) : (
                  <p className="flex items-center gap-2">
                    <Shield size={18} className="text-gray-400" />
                    {user?.profile?.emergencyContact?.relation || 'Not provided'}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                {editMode ? (
                  <div className="flex items-center gap-2">
                    <Smartphone size={18} className="text-gray-400" />
                    <input
                      type="tel"
                      name="emergencyContact.phone"
                      value={formData.emergencyContact.phone}
                      onChange={handleChange}
                      className="bg-gray-100 rounded px-3 py-2 w-full"
                    />
                  </div>
                ) : (
                  <p className="flex items-center gap-2">
                    <Smartphone size={18} className="text-gray-400" />
                    {user?.profile?.emergencyContact?.phone || 'Not provided'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Employment Details Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Briefcase size={20} className="text-green-500" />
              Employment Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Employee ID</label>
                  <p className="flex items-center gap-2">
                    <CreditCard size={18} className="text-gray-400" />
                    {user?.employeeId || 'Not assigned'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Department</label>
                  <p className="flex items-center gap-2">
                    <Briefcase size={18} className="text-gray-400" />
                    {departments.find(d => d._id === user?.department)?.name || 'Not assigned'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Joining Date</label>
                  <p className="flex items-center gap-2">
                    <Calendar size={18} className="text-gray-400" />
                    {user?.profile?.joiningDate ? new Date(user.profile.joiningDate).toLocaleDateString() : 'Not available'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <p className="flex items-center gap-2">
                    <Clock size={18} className="text-gray-400" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user?.status === 'active' ? 'bg-green-100 text-green-800' :
                      user?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      user?.status === 'suspended' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {user?.status ? user.status.replace('_', ' ') : 'Unknown'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;