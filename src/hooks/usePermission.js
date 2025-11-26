import useAuth from "./useAuth";

const usePermission = () => {
  const { user , refreshProfile } = useAuth();

  // permissions array coming from backend (we already added it in auth + user controllers)
  const permissions = user?.permissions || [];
  const role = user?.role;
  console.log("[usePermission] current role:", role, "perms:", permissions);

  const isOwner = role === "owner"; // super admin

  const can = (code) => {
    if (!code) return true;
    if (isOwner) return true; // owner can do everything

    if (!permissions || permissions.length === 0) {
      // helpful debug
      console.warn("[usePermission] No permissions on user object:", user);
      return false;
    }

    return permissions.includes(code);
  };

  const canAny = (codes = []) => {
    if (!Array.isArray(codes)) return false;
    return codes.some((c) => can(c));
  };

  return {
    can,
    canAny,
    permissions,
    role
  };
};

export default usePermission;
