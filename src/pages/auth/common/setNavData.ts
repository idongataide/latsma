interface iData {
    data?: {
      token?: string;
      email?: string;
      username?: string;
      refresh?: string;
      role?: string;
      first_name?: string;
      avatar?: string;
      last_name?: string;
      is_email_verified?: boolean;
      has_complete_profile?: boolean;
    };
  }
  
  interface iNavPath {
    setNavPath: (path: string) => void;
    setEmail: (email: string) => void;
    setToken: (token: string) => void;
    setRole: (role: string) => void;
    setAvatar: (avatar: string) => void;
    setUserName: (userName: string) => void;
    setFirstName: (firstName: string) => void;
    setLastName: (lastName: string) => void;
    setIsVerified: (isVerified: boolean) => void;
    setIsCompleted: (isCompleted: boolean) => void;
  }
  
  export const setNavData = (
    navPath: iNavPath,
    email: string,
    res: iData,
    screenPath: string = "",
  ) => {
    if (!res?.data) return;
  
    navPath.setNavPath(screenPath);
    navPath.setEmail(email || ""); 
    navPath.setAvatar(res.data.avatar || "");
    navPath.setToken(res.data.token || "");
    navPath.setRole(res.data.role || "");
    navPath.setUserName(res.data.username || "");
    navPath.setFirstName(res.data.first_name || "");
    navPath.setLastName(res.data.last_name || "");
    navPath.setIsCompleted(res.data.has_complete_profile || false);
    navPath.setIsVerified(res.data.is_email_verified || false);
  };
  