import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'manager' | 'admin';
  firstName?: string;
  lastName?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<boolean>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isStaff: boolean;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'electrocityAD',
  email: 'admin@electrocity.ru',
  id: 'admin-001',
  role: 'admin' as const,
  firstName: 'Александр',
  lastName: 'Дмитриев'
};

const MANAGER_CREDENTIALS = {
  username: 'manager',
  password: 'manager2025',
  email: 'manager@progressgarant.ru',
  id: 'manager-001',
  role: 'manager' as const,
  firstName: 'Менеджер',
  lastName: 'Поддержки'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Проверяем localStorage при загрузке
    const savedUser = localStorage.getItem('progressgarant_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('progressgarant_user');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Проверка администратора
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const adminUser: User = {
        id: ADMIN_CREDENTIALS.id,
        username: ADMIN_CREDENTIALS.username,
        email: ADMIN_CREDENTIALS.email,
        role: ADMIN_CREDENTIALS.role,
        firstName: ADMIN_CREDENTIALS.firstName,
        lastName: ADMIN_CREDENTIALS.lastName
      };
      setUser(adminUser);
      localStorage.setItem('progressgarant_user', JSON.stringify(adminUser));
      return true;
    }

    // Проверка менеджера
    if (username === MANAGER_CREDENTIALS.username && password === MANAGER_CREDENTIALS.password) {
      const managerUser: User = {
        id: MANAGER_CREDENTIALS.id,
        username: MANAGER_CREDENTIALS.username,
        email: MANAGER_CREDENTIALS.email,
        role: MANAGER_CREDENTIALS.role,
        firstName: MANAGER_CREDENTIALS.firstName,
        lastName: MANAGER_CREDENTIALS.lastName
      };
      setUser(managerUser);
      localStorage.setItem('progressgarant_user', JSON.stringify(managerUser));
      return true;
    }

    // Проверка обычных пользователей из localStorage
    const users = JSON.parse(localStorage.getItem('progressgarant_users') || '[]');
    const foundUser = users.find((u: any) => u.username === username && u.password === password);
    
    if (foundUser) {
      const userWithoutPassword = { ...foundUser };
      delete userWithoutPassword.password;
      setUser(userWithoutPassword);
      localStorage.setItem('progressgarant_user', JSON.stringify(userWithoutPassword));
      return true;
    }

    return false;
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('progressgarant_users') || '[]');
    
    // Проверяем, не существует ли уже пользователь с таким username или email
    if (users.some((u: any) => u.username === userData.username || u.email === userData.email)) {
      return false;
    }

    const newUser = {
      ...userData,
      id: Date.now().toString(),
      role: 'user' as const
    };

    users.push(newUser);
    localStorage.setItem('progressgarant_users', JSON.stringify(users));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('progressgarant_user');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isStaff: user?.role === 'admin' || user?.role === 'manager'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};