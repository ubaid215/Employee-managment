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

  // Fetch initial data with enhanced debugging
  useEffect(() => {
    if (!user || initialDataLoaded) return;

    const fetchInitialData = async () => {
      try {
        console.log("🔄 Starting initial data fetch for user:", user._id);
        console.log("🔧 Available functions:", {
          fetchDepartments: typeof fetchDepartments,
          fetchMyDuties: typeof fetchMyDuties,
        });

        // Fetch departments
        if (fetchDepartments) {
          try {
            console.log("🔄 Fetching departments...");
            const deptResult = await fetchDepartments(true);
            console.log(
              "✅ Departments fetched successfully:",
              deptResult?.length || "unknown"
            );
          } catch (error) {
            console.error("❌ Department fetch failed:", error);
            console.error("❌ Department error details:", {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
              url: error.config?.url,
            });
          }
        }

        // Small delay to prevent rate limiting
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Fetch duties with enhanced debugging
        if (fetchMyDuties) {
          try {
            console.log("🔄 Fetching duties for user:", user._id);
            const duties = await fetchMyDuties(true);
            console.log("✅ Duties fetch completed");
            console.log("📊 Duties result:", {
              type: typeof duties,
              isArray: Array.isArray(duties),
              length: duties?.length,
              data: duties,
            });

            // Check context state after fetch
            setTimeout(() => {
              console.log("🔍 Context state after duties fetch:", {
                myDuties: myDuties,
                myDutiesLength: myDuties?.length,
                loadingStates: loadingStates,
              });
            }, 100);
          } catch (error) {
            console.error("❌ Duties fetch failed:", error);
            console.error("❌ Duties error details:", {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
              url: error.config?.url,
              stack: error.stack,
            });
          }
        } else {
          console.error("❌ fetchMyDuties function not available!");
        }

        setInitialDataLoaded(true);
      } catch (error) {
        console.error("❌ Initial data fetch error:", error);
        setInitialDataLoaded(true);
      }
    };

    const timeoutId = setTimeout(fetchInitialData, 500);
    return () => clearTimeout(timeoutId);
  }, [user?._id, fetchMyDuties, fetchDepartments, initialDataLoaded]);

  // Generate employee ID from MongoDB ObjectId
  const employeeId = useMemo(() => {
    if (!user?._id) return "Not assigned";
    const shortId = user._id.slice(-8).toUpperCase();
    return `EMP-${shortId}`;
  }, [user?._id]);

  
  const displayedDuties = useMemo(() => {
    if (loadingStates?.myDuties || empLoading) {
      return "Loading duties...";
    }

    if (myDuties && myDuties.length > 0) {
      const dutiesToShow = showAllDuties ? myDuties : myDuties.slice(0, 3);

      // Fixed: Use both title and name fields for compatibility
      return dutiesToShow
        .map((duty) => {
          const dutyName = duty.title || duty.name || "Unnamed duty";
          const priority = duty.priority ? ` (${duty.priority})` : "";
          return dutyName + priority;
        })
        .join(", ");
    }

    // Fallback for unpopulated duties
    if (user?.duties && user.duties.length > 0) {
      return `${user.duties.length} duties assigned (fetching details...)`;
    }

    return "No duties assigned";
  }, [
    myDuties,
    showAllDuties,
    loadingStates?.myDuties,
    empLoading,
    user?.duties,
  ]);

  // Fixed: Department name resolution
  const departmentName = useMemo(() => {
    if (loadingStates?.departments) {
      return "Loading department...";
    }

    // First check if department is already populated in user object
    if (
      user?.department &&
      typeof user.department === "object" &&
      user.department.name
    ) {
      return user.department.name;
    }

    // Then check if we have departments loaded and can find the match
    if (departments && departments.length > 0 && user?.department) {
      const departmentId =
        typeof user.department === "string"
          ? user.department
          : user.department._id || user.department.$oid;

      const foundDept = departments.find(
        (dept) =>
          dept._id === departmentId ||
          dept._id.toString() === departmentId.toString()
      );

      if (foundDept) {
        return foundDept.name;
      }
    }

    // If we have a department ID but departments aren't loaded yet
    if (
      user?.department &&
      !departments?.length &&
      !loadingStates?.departments
    ) {
      return "Department info pending...";
    }

    return "Not assigned";
  }, [departments, user?.department, loadingStates?.departments]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    if (name.includes("emergencyContact")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }

      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!updateProfile || typeof updateProfile !== "function") {
        console.error("updateProfile function is not available");
        alert(
          "Profile update is not available. Please check the authentication setup."
        );
        return;
      }

      setUpdateLoading(true);

      try {
        const updatedData = {
          name: formData.name,
          profile: {
            phone: formData.phone,
            address: formData.address,
            cnic: formData.cnic,
            emergencyContact: formData.emergencyContact,
          },
        };

        await updateProfile(updatedData, profileImage);
        setEditMode(false);
        setProfileImage(null);
        alert("Profile updated successfully!");
      } catch (error) {
        console.error("Profile update failed:", error);
        alert("Failed to update profile. Please try again.");
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

  // Combined loading state
  const isLoading = authLoading || empLoading || !initialDataLoaded;

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 size={24} className="animate-spin text-blue-600" />
          <span className="text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

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
                onClick={handleCancelEdit}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X size={18} /> Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={updateLoading || authLoading || !updateProfile}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
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

        {/* Enhanced Debug Info */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs">
          <details>
            <summary className="cursor-pointer text-blue-800 font-medium">
              Debug Info
            </summary>
            <div className="mt-2 space-y-1 text-blue-700">
              <p>
                <strong>Employee ID:</strong> {employeeId}
              </p>
              <p>
                <strong>Department:</strong> {departmentName}
              </p>
              <p>
                <strong>Duties:</strong> {myDuties?.length || 0} loaded
              </p>
              <p>
                <strong>MyDuties Data:</strong>{" "}
                {JSON.stringify(myDuties?.slice(0, 2), null, 2)}
              </p>
              <p>
                <strong>User Duties Raw:</strong> {user?.duties?.length || 0} in
                user object
              </p>
              <p>
                <strong>Loading States:</strong> Departments:{" "}
                {String(loadingStates?.departments)}, Duties:{" "}
                {String(loadingStates?.myDuties)}
              </p>
              <p>
                <strong>Context Functions:</strong> fetchDepartments:{" "}
                {typeof fetchDepartments}, fetchMyDuties: {typeof fetchMyDuties}
              </p>
              <p>
                <strong>Initial Data Loaded:</strong>{" "}
                {String(initialDataLoaded)}
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={async () => {
                    console.log("🔄 Manual departments retry...");
                    try {
                      const result = await fetchDepartments?.(true);
                      console.log("✅ Manual departments result:", result);
                    } catch (error) {
                      console.error("❌ Manual departments error:", error);
                    }
                  }}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                  disabled={loadingStates?.departments}
                >
                  {loadingStates?.departments
                    ? "Loading..."
                    : "Retry Departments"}
                </button>
                <button
                  onClick={async () => {
                    console.log("🔄 Manual duties retry...");
                    try {
                      const result = await fetchMyDuties?.(true);
                      console.log("✅ Manual duties result:", result);
                      console.log(
                        "🔍 Context myDuties after manual fetch:",
                        myDuties
                      );
                    } catch (error) {
                      console.error("❌ Manual duties error:", error);
                    }
                  }}
                  className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                  disabled={loadingStates?.myDuties}
                >
                  {loadingStates?.myDuties ? "Loading..." : "Retry Duties"}
                </button>
                <button
                  onClick={() => {
                    console.log("🔄 Full context state:", {
                      myDuties,
                      departments,
                      loadingStates,
                      user: user?._id,
                    });
                  }}
                  className="px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                >
                  Log Context
                </button>
              </div>

              {/* Network check */}
              <div className="mt-2">
                <button
                  onClick={async () => {
                    console.log("🌐 Testing direct API call...");
                    try {
                      // You'll need to import your API instance or use fetch
                      const response = await fetch("/api/employee/my-duties", {
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem(
                            "token"
                          )}`, // Adjust as needed
                          "Content-Type": "application/json",
                        },
                      });
                      const data = await response.json();
                      console.log("🌐 Direct API response:", {
                        status: response.status,
                        data: data,
                      });
                    } catch (error) {
                      console.error("🌐 Direct API error:", error);
                    }
                  }}
                  className="px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
                >
                  Test Direct API
                </button>
              </div>
            </div>
          </details>
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
                    required
                  />
                ) : (
                  user?.name
                )}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {user?.role === "admin" ? "Admin" : "Employee"}
              </p>

              <div className="w-full mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-400" />
                  <span className="text-gray-700 text-sm">{user?.email}</span>
                </div>

                <div className="flex items-start gap-3">
                  <List size={18} className="text-gray-400 mt-0.5" />
                  <div className="text-gray-700 text-sm">
                    <div className="break-words">{displayedDuties}</div>
                    {myDuties?.length > 3 && !loadingStates?.myDuties && (
                      <button
                        onClick={() => setShowAllDuties(!showAllDuties)}
                        className="mt-1 text-blue-600 hover:underline text-xs"
                      >
                        {showAllDuties
                          ? "Show less"
                          : `Show all ${myDuties.length} duties`}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-gray-400" />
                  <span className="text-gray-700 text-sm">
                    Joined{" "}
                    {user?.profile?.joiningDate
                      ? new Date(user.profile.joiningDate).toLocaleDateString()
                      : user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
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
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Phone
                </label>
                {editMode ? (
                  <div className="flex items-center gap-2">
                    <Phone size={18} className="text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="bg-gray-100 rounded px-3 py-2 w-full text-sm"
                      placeholder="Enter phone number"
                    />
                  </div>
                ) : (
                  <p className="flex items-center gap-2">
                    <Phone size={18} className="text-gray-400" />
                    <span className="text-sm">
                      {user?.profile?.phone || "Not provided"}
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Address
                </label>
                {editMode ? (
                  <div className="flex items-start gap-2">
                    <Home size={18} className="text-gray-400 mt-2" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="bg-gray-100 rounded px-3 py-2 w-full text-sm"
                      rows={3}
                      placeholder="Enter address"
                    />
                  </div>
                ) : (
                  <p className="flex items-start gap-2">
                    <Home size={18} className="text-gray-400 mt-0.5" />
                    <span className="text-sm">
                      {user?.profile?.address || "Not provided"}
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  CNIC
                </label>
                {editMode ? (
                  <div className="flex items-center gap-2">
                    <Hash size={18} className="text-gray-400" />
                    <input
                      type="text"
                      name="cnic"
                      value={formData.cnic}
                      onChange={handleChange}
                      placeholder="XXXXX-XXXXXXX-X"
                      className="bg-gray-100 rounded px-3 py-2 w-full text-sm"
                    />
                  </div>
                ) : (
                  <p className="flex items-center gap-2">
                    <Hash size={18} className="text-gray-400" />
                    <span className="text-sm">
                      {user?.profile?.cnic || "Not provided"}
                    </span>
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
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Name
                </label>
                {editMode ? (
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-gray-400" />
                    <input
                      type="text"
                      name="emergencyContact.name"
                      value={formData.emergencyContact.name}
                      onChange={handleChange}
                      className="bg-gray-100 rounded px-3 py-2 w-full text-sm"
                      placeholder="Contact name"
                    />
                  </div>
                ) : (
                  <p className="flex items-center gap-2">
                    <User size={18} className="text-gray-400" />
                    <span className="text-sm">
                      {user?.profile?.emergencyContact?.name || "Not provided"}
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Relation
                </label>
                {editMode ? (
                  <div className="flex items-center gap-2">
                    <Shield size={18} className="text-gray-400" />
                    <input
                      type="text"
                      name="emergencyContact.relation"
                      value={formData.emergencyContact.relation}
                      onChange={handleChange}
                      className="bg-gray-100 rounded px-3 py-2 w-full text-sm"
                      placeholder="e.g., Father, Mother, Spouse"
                    />
                  </div>
                ) : (
                  <p className="flex items-center gap-2">
                    <Shield size={18} className="text-gray-400" />
                    <span className="text-sm">
                      {user?.profile?.emergencyContact?.relation ||
                        "Not provided"}
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Phone
                </label>
                {editMode ? (
                  <div className="flex items-center gap-2">
                    <Smartphone size={18} className="text-gray-400" />
                    <input
                      type="tel"
                      name="emergencyContact.phone"
                      value={formData.emergencyContact.phone}
                      onChange={handleChange}
                      className="bg-gray-100 rounded px-3 py-2 w-full text-sm"
                      placeholder="Contact phone"
                    />
                  </div>
                ) : (
                  <p className="flex items-center gap-2">
                    <Smartphone size={18} className="text-gray-400" />
                    <span className="text-sm">
                      {user?.profile?.emergencyContact?.phone || "Not provided"}
                    </span>
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
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Employee ID
                  </label>
                  <p className="flex items-center gap-2">
                    <CreditCard size={18} className="text-gray-400" />
                    <span className="text-sm font-mono">{employeeId}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Department
                  </label>
                  <p className="flex items-center gap-2">
                    <Briefcase size={18} className="text-gray-400" />
                    <span className="text-sm">{departmentName}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Joining Date
                  </label>
                  <p className="flex items-center gap-2">
                    <Calendar size={18} className="text-gray-400" />
                    <span className="text-sm">
                      {user?.profile?.joiningDate
                        ? new Date(
                            user.profile.joiningDate
                          ).toLocaleDateString()
                        : user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "Not available"}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Status
                  </label>
                  <p className="flex items-center gap-2">
                    <Clock size={18} className="text-gray-400" />
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user?.status === "active"
                          ? "bg-green-100 text-green-800"
                          : user?.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : user?.status === "suspended"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user?.status
                        ? user.status.replace("_", " ").toUpperCase()
                        : "Unknown"}
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
