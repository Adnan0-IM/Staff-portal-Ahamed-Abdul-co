import React, { createContext, useContext, useState, useEffect } from "react";

export interface Staff {
  id: string;
  email: string;
  name: string;
  role: "Administrator" | "Staff" | "Managing Partner";
  dateAssigned: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPartner: boolean;
  currentUser: Staff | null;
  staffList: Staff[];
  login: (
    email: string,
    password: string,
    remember?: boolean
  ) => Promise<boolean>;
  logout: () => void;
  assignStaff: (staff: Omit<Staff, "id" | "dateAssigned">) => void;
  removeStaff: (id: string) => void;
  updateProfile: (
    staffId: string,
    updatedData: Partial<Omit<Staff, "id" | "role" | "dateAssigned">>
  ) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_CREDENTIALS = {
  email: "admin@ahmedabdul.com",
  password: "admin123",
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPartner, setIsPartner] = useState(false);
  const [currentUser, setCurrentUser] = useState<Staff | null>(null);
  const [staffList, setStaffList] = useState<Staff[]>(() => {
    const saved = localStorage.getItem("staffList");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    // Check both localStorage and sessionStorage for auth tokens
    const localToken = localStorage.getItem("authToken");
    const localUserJson = localStorage.getItem("currentUser");
    const sessionToken = sessionStorage.getItem("authToken");
    const sessionUserJson = sessionStorage.getItem("currentUser");

    // Use localStorage token if available, otherwise try sessionStorage
    const token = localToken || sessionToken;
    const userJson = localUserJson || sessionUserJson;

    if (token && userJson) {
      const user = JSON.parse(userJson);
      setIsAuthenticated(true);
      setCurrentUser(user);
      setIsAdmin(user.email === ADMIN_CREDENTIALS.email);
      setIsPartner(user.role === "Managing Partner"); // Set partner status
    }
  }, []);

  useEffect(() => {
    // Save staff list to localStorage whenever it changes
    localStorage.setItem("staffList", JSON.stringify(staffList));
  }, [staffList]);

  const login = async (
    email: string,
    password: string,
    remember: boolean = false
  ) => {
    try {
      // Check for admin login
      if (
        email === ADMIN_CREDENTIALS.email &&
        password === ADMIN_CREDENTIALS.password
      ) {
        const adminUser: Staff = {
          id: "admin",
          email: ADMIN_CREDENTIALS.email,
          name: "Admin",
          role: "Administrator",
          dateAssigned: new Date().toISOString(),
        };

        // Store token and user in either localStorage (remember) or sessionStorage (session-only)
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem("authToken", "admin-token");
        storage.setItem("currentUser", JSON.stringify(adminUser));

        setIsAuthenticated(true);
        setIsAdmin(true);
        setCurrentUser(adminUser);
        return true;
      }

      // Check for staff login
      const staff = staffList.find((s) => s.email === email);
      if (staff && password === "password123") {
        // In production, you'd verify against hashed passwords
        // Store token and user in either localStorage (remember) or sessionStorage (session-only)
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem("authToken", "staff-token");
        storage.setItem("currentUser", JSON.stringify(staff));

        setIsAuthenticated(true);
        setIsAdmin(false);
        setIsPartner(staff.role === "Managing Partner");
        setCurrentUser(staff);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    // Clear auth data from both localStorage and sessionStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("currentUser");

    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsPartner(false);
    setCurrentUser(null);
  };

  const assignStaff = (staffData: Omit<Staff, "id" | "dateAssigned">) => {
    if (!isAdmin) return;

    const newStaff: Staff = {
      ...staffData,
      id: Date.now().toString(),
      dateAssigned: new Date().toISOString(),
    };

    setStaffList((prev) => [...prev, newStaff]);
  };

  const removeStaff = (id: string) => {
    if (!isAdmin) return;
    setStaffList((prev) => prev.filter((staff) => staff.id !== id));
  };

  const updateProfile = (
    staffId: string,
    updatedData: Partial<Omit<Staff, "id" | "role" | "dateAssigned">>
  ) => {
    // Find the staff member to update
    const staffToUpdate = staffList.find((staff) => staff.id === staffId);
    const isCurrentUser = currentUser?.id === staffId;

    // Check if user exists and has permission to update
    if (!staffToUpdate || (!isAdmin && !isCurrentUser)) {
      return false;
    }

    // Update the staff member
    const updatedStaff = { ...staffToUpdate, ...updatedData };

    // Update staffList
    setStaffList((prev) =>
      prev.map((staff) => (staff.id === staffId ? updatedStaff : staff))
    );

    // If updating current user, also update currentUser state and localStorage
    if (isCurrentUser) {
      setCurrentUser(updatedStaff);
      localStorage.setItem("currentUser", JSON.stringify(updatedStaff));
    }

    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAdmin,
        isPartner,
        currentUser,
        staffList,
        login,
        logout,
        assignStaff,
        removeStaff,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
