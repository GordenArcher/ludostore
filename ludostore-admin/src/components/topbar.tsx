import { useAuthStore } from "../store/authStore";
import { getUserInitials } from "../utils/helper/initials";

const Topbar = () => {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 border-b border-gray-800 bg-black">
      <div className="flex items-center justify-end h-16 px-6">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-white">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-400">
              {getUserInitials(user?.first_name, user?.last_name, user?.email)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
