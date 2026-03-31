import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  Edit2,
  X,
  Check,
  Loader,
  MapPin,
  Plus,
  Trash2,
  Star,
  Package,
  CreditCard,
  Home,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useProfileStore } from "../../store/profileStore";
import { useAddressStore } from "../../store/addressStore";
import { AddressModal } from "../../components/modals/AddressModal";
import { ConfirmationModal } from "../../components/modals/ConfirmationModal";
import ProfileSkeleton from "../../components/loading/profileSkeleton";

const Profile = () => {
  const { user, fetchUser } = useAuthStore();
  const {
    profile,
    isLoading,
    isUpdating,
    fetchProfile,
    updateProfile,
    changePassword,
  } = useProfileStore();
  const {
    addresses,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefault,
  } = useAddressStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(
    null,
  );

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  );
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (profile || user) {
      setFormData({
        first_name: profile?.first_name || user?.first_name || "",
        last_name: profile?.last_name || user?.last_name || "",
        phone_number: profile?.phone_number || "",
      });
    }
  }, [profile, user]);

  const handleUpdateProfile = async () => {
    const success = await updateProfile(formData);
    if (success) {
      await fetchUser();
      setIsEditing(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    }
  };

  const handleChangePassword = async () => {
    setPasswordErrors({});

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordErrors({ confirm_password: "Passwords do not match" });
      return;
    }

    if (passwordData.new_password.length < 6) {
      setPasswordErrors({
        new_password: "Password must be at least 6 characters",
      });
      return;
    }

    const success = await changePassword({
      current_password: passwordData.current_password,
      new_password: passwordData.new_password,
      confirm_password: passwordData.confirm_password,
    });

    if (success) {
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setIsChangingPassword(false);
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
  };

  const handleSaveAddress = async (data: any) => {
    if (editingAddress) {
      return await updateAddress(editingAddress.id, data);
    }
    return await addAddress(data);
  };

  const handleDeleteAddress = async () => {
    if (deletingAddressId) {
      const success = await deleteAddress(deletingAddressId);
      if (success) setDeletingAddressId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    await setDefault(id);
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  const displayName =
    `${formData.first_name} ${formData.last_name}`.trim() || "User";

  return (
    <div className="min-h-screen bg-[rgb(48,48,48)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-8">
          My Profile
        </h1>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-linear-to-r from-yellow-500/5 to-transparent rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center text-gray-900 font-bold text-xl">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-white text-xl font-semibold">
                  {displayName}
                </h2>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-[#1e1e1e] rounded-xl border border-white/10 overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-yellow-500" />
                <h2 className="text-white font-semibold text-lg">
                  Personal Information
                </h2>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-colors text-sm cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-white rounded-lg transition-colors text-sm cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              )}
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 text-gray-400 w-32">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">Email</span>
                </div>
                <div className="flex-1">
                  <p className="text-white">{user?.email}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 text-gray-400 w-32">
                  <User className="w-4 h-4" />
                  <span className="text-sm">First Name</span>
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                      className="w-full bg-[#2a2a2a] border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                    />
                  ) : (
                    <p className="text-white">
                      {formData.first_name || "Not set"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 text-gray-400 w-32">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Last Name</span>
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      className="w-full bg-[#2a2a2a] border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                    />
                  ) : (
                    <p className="text-white">
                      {formData.last_name || "Not set"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 text-gray-400 w-32">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">Phone Number</span>
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone_number: e.target.value,
                        })
                      }
                      placeholder="+233 XX XXX XXXX"
                      className="w-full bg-[#2a2a2a] border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                    />
                  ) : (
                    <p className="text-white">
                      {formData.phone_number || "Not set"}
                    </p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleUpdateProfile}
                    disabled={isUpdating}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg font-medium transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isUpdating ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}

              <AnimatePresence>
                {updateSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm"
                  >
                    <Check className="w-4 h-4" />
                    Profile updated successfully!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1e1e1e] rounded-xl border border-white/10 overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-yellow-500" />
                <h2 className="text-white font-semibold text-lg">
                  Saved Addresses
                </h2>
              </div>
              <button
                onClick={() => {
                  setEditingAddress(null);
                  setShowAddressModal(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg transition-colors text-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Address
              </button>
            </div>

            <div className="p-6">
              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No saved addresses</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Add your first address for faster checkout
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="border border-white/10 rounded-lg p-4 hover:border-yellow-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {address.address_type === "shipping" && (
                              <Package className="w-4 h-4 text-blue-500" />
                            )}
                            {address.address_type === "billing" && (
                              <CreditCard className="w-4 h-4 text-green-500" />
                            )}
                            {address.address_type === "both" && (
                              <Home className="w-4 h-4 text-purple-500" />
                            )}
                            <span className="text-white font-medium">
                              {address.recipient_name}
                            </span>
                            {address.is_default && (
                              <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">
                            {address.street_address}
                          </p>
                          {address.apartment && (
                            <p className="text-gray-400 text-sm">
                              {address.apartment}
                            </p>
                          )}
                          <p className="text-gray-400 text-sm">
                            {address.city}, {address.state}{" "}
                            {address.postal_code}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {address.country}
                          </p>
                          <p className="text-gray-500 text-sm mt-1">
                            {address.phone_number}
                          </p>
                        </div>
                        <div className="flex gap-1 ml-4">
                          {!address.is_default && (
                            <button
                              onClick={() => handleSetDefault(address.id)}
                              className="p-2 text-gray-400 hover:text-yellow-500 transition-colors cursor-pointer"
                              title="Set as default"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingAddress(address);
                              setShowAddressModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-yellow-500 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingAddressId(address.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[#1e1e1e] rounded-xl border border-white/10 overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-yellow-500" />
                <h2 className="text-white font-semibold text-lg">
                  Change Password
                </h2>
              </div>
              {!isChangingPassword ? (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-colors text-sm cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                  Change
                </button>
              ) : (
                <button
                  onClick={() => setIsChangingPassword(false)}
                  className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-white rounded-lg transition-colors text-sm cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              )}
            </div>

            <div className="p-6">
              {isChangingPassword ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          current_password: e.target.value,
                        })
                      }
                      className="w-full bg-[#2a2a2a] border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          new_password: e.target.value,
                        })
                      }
                      className="w-full bg-[#2a2a2a] border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                    />
                    {passwordErrors.new_password && (
                      <p className="mt-1 text-red-400 text-xs">
                        {passwordErrors.new_password}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirm_password: e.target.value,
                        })
                      }
                      className="w-full bg-[#2a2a2a] border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                    />
                    {passwordErrors.confirm_password && (
                      <p className="mt-1 text-red-400 text-xs">
                        {passwordErrors.confirm_password}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleChangePassword}
                      disabled={isUpdating}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg font-medium transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isUpdating ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />{" "}
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" /> Update Password
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">
                  Change your password to keep your account secure.
                </p>
              )}

              <AnimatePresence>
                {passwordSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm"
                  >
                    <Check className="w-4 h-4" />
                    Password changed successfully!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1e1e1e] rounded-xl border border-white/10 overflow-hidden"
          >
            <div className="p-6">
              <h2 className="text-white font-semibold text-lg mb-4">
                Account Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400 text-sm">Account Created</span>
                  <span className="text-white text-sm">
                    {user?.date_joined
                      ? new Date(user.date_joined).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-400 text-sm">Account Status</span>
                  <span className="text-green-500 text-sm flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Active
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <AddressModal
        isOpen={showAddressModal}
        onClose={() => {
          setShowAddressModal(false);
          setEditingAddress(null);
        }}
        onSave={handleSaveAddress}
        address={editingAddress}
        title={editingAddress ? "Edit Address" : "Add New Address"}
      />

      <ConfirmationModal
        isOpen={!!deletingAddressId}
        onClose={() => setDeletingAddressId(null)}
        onConfirm={handleDeleteAddress}
        title="Delete Address"
        message="Are you sure you want to delete this address? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Profile;
