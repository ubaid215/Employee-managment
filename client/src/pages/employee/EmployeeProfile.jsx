import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useEmployee } from "../../context/EmployeeContext";
import {
  User,
  Mail,
  Phone,
  Home,
  Calendar,
  Briefcase,
  CreditCard,
  Shield,
  Edit,
  Save,
  X,
  Image,
  Smartphone,
  Contact,
  Clock,
  Hash,
  List,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const EmployeeProfile = () => {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const {
    fetchMyDuties,
    myDuties = [],
    loading: empLoading,
    loadingStates,
    fetchDepartments,
    departments = [],
  } = useEmployee();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    cnic: "",
    emergencyContact: {
      name: "",
      relation: "",
      phone: "",
    },
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showAllDuties, setShowAllDuties] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.profile?.phone || "",
        address: user.profile?.address || "",
        cnic: user.profile?.cnic || "",
        emergencyContact: {
          name: user.profile?.emergencyContact?.name || "",
          relation: user.profile?.emergencyContact?.relation || "",
          phone: user.profile?.emergencyContact?.phone || "",
        },
      });
      setImagePreview(user.profile?.profileImage || "");
    }
  }, [user?.name, user?.email, user?.profile]);

  // Fetch initial data
  useEffect(() => {
    if (!user || initialDataLoaded) return;

    const fetchInitialData = async () => {
      try {
        if (fetchDepartments) await fetchDepartments(true);
        if (fetchMyDuties) await fetchMyDuties(true);
        setInitialDataLoaded(true);
      } catch (error) {
        console.error("Initial data fetch error:", error);
        setInitialDataLoaded(true);
      }
    };

    fetchInitialData();
  }, [user?._id, fetchMyDuties, fetchDepartments, initialDataLoaded]);

  // Generate employee ID from MongoDB ObjectId
  const employeeId = useMemo(() => {
    if (!user?._id) return "Not assigned";
    const shortId = user._id.slice(-8).toUpperCase();
    return `EMP-${shortId}`;
  }, [user?._id]);

  const displayedDuties = useMemo(() => {
    if (loadingStates?.myDuties || empLoading) {
      return [];
    }
    return showAllDuties ? myDuties : myDuties.slice(0, 3);
  }, [myDuties, showAllDuties, loadingStates?.myDuties, empLoading]);

  const departmentName = useMemo(() => {
    if (loadingStates?.departments) return "Loading...";
    if (user?.department?.name) return user.department.name;
    if (departments?.length && user?.department) {
      const foundDept = departments.find(
        (dept) => dept._id === user.department._id || dept._id === user.department
      );
      return foundDept?.name || "Not assigned";
    }
    return "Not assigned";
  }, [departments, user?.department, loadingStates?.departments]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name.includes("emergencyContact")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024 && file.type.startsWith("image/")) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!updateProfile) return;

      setUpdateLoading(true);
      try {
        await updateProfile({
          name: formData.name,
          profile: {
            phone: formData.phone,
            address: formData.address,
            cnic: formData.cnic,
            emergencyContact: formData.emergencyContact,
          },
        }, profileImage);
        setEditMode(false);
      } catch (error) {
        console.error("Profile update failed:", error);
      } finally {
        setUpdateLoading(false);
      }
    },
    [formData, profileImage, updateProfile]
  );

  const handleCancelEdit = useCallback(() => {
    setEditMode(false);
    setProfileImage(null);
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.profile?.phone || "",
        address: user.profile?.address || "",
        cnic: user.profile?.cnic || "",
        emergencyContact: {
          name: user.profile?.emergencyContact?.name || "",
          relation: user.profile?.emergencyContact?.relation || "",
          phone: user.profile?.emergencyContact?.phone || "",
        },
      });
      setImagePreview(user.profile?.profileImage || "");
    }
  }, [user]);

  const isLoading = authLoading || empLoading || !initialDataLoaded;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 size={24} className="animate-spin text-blue-600" />
          <span className="text-slate-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
              My Profile
            </h1>
            <p className="text-slate-600">Manage your personal and professional information</p>
          </div>
          
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              <Edit size={18} /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-200 to-slate-300 text-slate-800 rounded-xl shadow hover:shadow-md transition-all"
              >
                <X size={18} /> Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={updateLoading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-70"
              >
                {updateLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {updateLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200/60 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <div className="relative mb-4 group">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 shadow-md"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center border-4 border-blue-50 shadow-md">
                    <User size={48} className="text-blue-400" />
                  </div>
                )}
                {editMode && (
                  <label className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
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

              <h2 className="text-xl font-semibold text-center mb-1">
                {editMode ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="text-center bg-slate-100 rounded-lg px-4 py-2 w-full max-w-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                ) : (
                  user?.name
                )}
              </h2>
              <div className="px-4 py-1 bg-slate-100 rounded-full text-sm text-slate-600 mt-2">
                {user?.role === "admin" ? "Administrator" : "Employee"}
              </div>

              <div className="w-full mt-6 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Mail size={18} className="text-slate-500" />
                  <span className="text-slate-700 text-sm">{user?.email}</span>
                </div>

                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <List size={18} className="text-slate-500" />
                    <span className="text-slate-700 text-sm font-medium">Assigned Duties</span>
                  </div>
                  
                  {displayedDuties.length > 0 ? (
                    <ul className="space-y-2 pl-2">
                      {displayedDuties.map((duty, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                          <span className="text-slate-600 text-sm">
                            {duty.title || duty.name || "Unnamed duty"}
                            {duty.priority && (
                              <span className="ml-2 text-xs px-2 py-0.5 bg-slate-200 rounded-full">
                                {duty.priority}
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-400 text-sm pl-2">No duties assigned</p>
                  )}

                  {myDuties?.length > 3 && (
                    <button
                      onClick={() => setShowAllDuties(!showAllDuties)}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                    >
                      {showAllDuties ? (
                        <>
                          <ChevronUp size={14} /> Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown size={14} /> Show all {myDuties.length} duties
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Calendar size={18} className="text-slate-500" />
                  <span className="text-slate-700 text-sm">
                    Joined {new Date(user?.profile?.joiningDate || user?.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Info & Emergency Contact */}
          <div className="space-y-6">
            {/* Personal Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200/60 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                  <User size={20} className="text-white" />
                </div>
                <span className="text-slate-800">Personal Information</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-2">
                    Phone Number
                  </label>
                  {editMode ? (
                    <div className="flex items-center gap-3 bg-slate-100 rounded-lg px-4 py-3">
                      <Phone size={18} className="text-slate-500" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="bg-transparent w-full focus:outline-none focus:ring-0 text-slate-700"
                        placeholder="+92 300 1234567"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3">
                      <Phone size={18} className="text-slate-500" />
                      <span className="text-slate-700">
                        {user?.profile?.phone || "Not provided"}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-2">
                    Address
                  </label>
                  {editMode ? (
                    <div className="flex items-start gap-3 bg-slate-100 rounded-lg px-4 py-3">
                      <Home size={18} className="text-slate-500 mt-1" />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="bg-transparent w-full focus:outline-none focus:ring-0 text-slate-700 resize-none"
                        rows={3}
                        placeholder="Enter your full address"
                      />
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 bg-slate-50 rounded-lg px-4 py-3">
                      <Home size={18} className="text-slate-500 mt-1" />
                      <span className="text-slate-700">
                        {user?.profile?.address || "Not provided"}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-2">
                    CNIC
                  </label>
                  {editMode ? (
                    <div className="flex items-center gap-3 bg-slate-100 rounded-lg px-4 py-3">
                      <Hash size={18} className="text-slate-500" />
                      <input
                        type="text"
                        name="cnic"
                        value={formData.cnic}
                        onChange={handleChange}
                        placeholder="XXXXX-XXXXXXX-X"
                        className="bg-transparent w-full focus:outline-none focus:ring-0 text-slate-700"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3">
                      <Hash size={18} className="text-slate-500" />
                      <span className="text-slate-700">
                        {user?.profile?.cnic || "Not provided"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Emergency Contact Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200/60 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
                  <Contact size={20} className="text-white" />
                </div>
                <span className="text-slate-800">Emergency Contact</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-2">
                    Contact Name
                  </label>
                  {editMode ? (
                    <div className="flex items-center gap-3 bg-slate-100 rounded-lg px-4 py-3">
                      <User size={18} className="text-slate-500" />
                      <input
                        type="text"
                        name="emergencyContact.name"
                        value={formData.emergencyContact.name}
                        onChange={handleChange}
                        className="bg-transparent w-full focus:outline-none focus:ring-0 text-slate-700"
                        placeholder="Contact name"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3">
                      <User size={18} className="text-slate-500" />
                      <span className="text-slate-700">
                        {user?.profile?.emergencyContact?.name || "Not provided"}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-2">
                    Relationship
                  </label>
                  {editMode ? (
                    <div className="flex items-center gap-3 bg-slate-100 rounded-lg px-4 py-3">
                      <Shield size={18} className="text-slate-500" />
                      <input
                        type="text"
                        name="emergencyContact.relation"
                        value={formData.emergencyContact.relation}
                        onChange={handleChange}
                        className="bg-transparent w-full focus:outline-none focus:ring-0 text-slate-700"
                        placeholder="e.g., Father, Mother, Spouse"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3">
                      <Shield size={18} className="text-slate-500" />
                      <span className="text-slate-700">
                        {user?.profile?.emergencyContact?.relation || "Not provided"}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-2">
                    Contact Phone
                  </label>
                  {editMode ? (
                    <div className="flex items-center gap-3 bg-slate-100 rounded-lg px-4 py-3">
                      <Smartphone size={18} className="text-slate-500" />
                      <input
                        type="tel"
                        name="emergencyContact.phone"
                        value={formData.emergencyContact.phone}
                        onChange={handleChange}
                        className="bg-transparent w-full focus:outline-none focus:ring-0 text-slate-700"
                        placeholder="+92 300 1234567"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3">
                      <Smartphone size={18} className="text-slate-500" />
                      <span className="text-slate-700">
                        {user?.profile?.emergencyContact?.phone || "Not provided"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Employment Details Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200/60 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                <Briefcase size={20} className="text-white" />
              </div>
              <span className="text-slate-800">Employment Details</span>
            </h3>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-2">
                    Employee ID
                  </label>
                  <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3">
                    <CreditCard size={18} className="text-slate-500" />
                    <span className="font-mono text-slate-700">{employeeId}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-2">
                    Department
                  </label>
                  <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3">
                    <Briefcase size={18} className="text-slate-500" />
                    <span className="text-slate-700">{departmentName}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-2">
                    Joining Date
                  </label>
                  <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3">
                    <Calendar size={18} className="text-slate-500" />
                    <span className="text-slate-700">
                      {new Date(user?.profile?.joiningDate || user?.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-2">
                    Employment Status
                  </label>
                  <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3">
                    <Clock size={18} className="text-slate-500" />
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user?.status === "active"
                        ? "bg-emerald-100 text-emerald-800"
                        : user?.status === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : user?.status === "suspended"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {user?.status?.toUpperCase() || "UNKNOWN"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Employment Info Section */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                  <Shield size={16} className="text-slate-500" />
                  Account Security
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-slate-50 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-slate-500" />
                      <span className="text-slate-700 text-sm">Email Verification</span>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      Verified
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-slate-500" />
                      <span className="text-slate-700 text-sm">Phone Verification</span>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                      Pending
                    </span>
                  </div>
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