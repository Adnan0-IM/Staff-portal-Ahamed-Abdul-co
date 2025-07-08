import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface PrivateRouteProps {
  requireAuth?: boolean;
  redirectPath?: string;
  children?: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  requireAuth = true, 
  redirectPath = "/staffportal/login",
  children 
}) => {
  const { isAuthenticated } = useAuth();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/staffportal" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute;
