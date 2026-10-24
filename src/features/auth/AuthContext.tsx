/**
 * Lazuardi Security Management System (LSMS)
 * Authentication & RBAC Context
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../../types';
import { LSMSStorage, INITIAL_USERS } from '../../lib/storage-adapter';

interface AuthContextType {
  currentUser: UserProfile;
  switchRole: (role: UserRole) => void;
  canMutateData: boolean;
  isAdmin: boolean;
  isSupervisor: boolean;
  isOfficer: boolean;
  isManagement: boolean;
  availableUsers: UserProfile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<UserProfile>(() => LSMSStorage.getCurrentUser());

  useEffect(() => {
    const user = LSMSStorage.getCurrentUser();
    setCurrentUserState(user);
  }, []);

  const switchRole = (role: UserRole) => {
    const targetUser = INITIAL_USERS.find((u) => u.role === role) || {
      id: `u-${role}`,
      email: `${role}@lazuardi.sch.id`,
      fullName: `Akun ${role.toUpperCase()}`,
      role,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    LSMSStorage.setCurrentUser(targetUser);
    setCurrentUserState(targetUser);
  };

  // RBAC permissions helper
  const canMutateData = currentUser.role !== 'management'; // Management is STRICT READ-ONLY
  const isAdmin = currentUser.role === 'admin';
  const isSupervisor = currentUser.role === 'supervisor' || currentUser.role === 'admin';
  const isOfficer = currentUser.role === 'officer';
  const isManagement = currentUser.role === 'management';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        switchRole,
        canMutateData,
        isAdmin,
        isSupervisor,
        isOfficer,
        isManagement,
        availableUsers: INITIAL_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
