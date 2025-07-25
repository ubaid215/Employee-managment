import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

/**
 * Checks if the user has the required role to access a resource.
 * @param {string|string[]} requiredRole - The role(s) required to access the resource.
 * @param {string} [redirectPath='/'] - Path to redirect if unauthorized.
 * @returns {boolean} hasAccess - Indicates if the user has the required role.
 */
const useRoleAccess = (requiredRole, redirectPath = '/') => {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const hasAccess = user && roles.includes(user.role);

  useEffect(() => {
    if (!loading && !hasAccess) {
      navigate(redirectPath, { replace: true });
    }
  }, [hasAccess, loading, navigate, redirectPath]);

  return { hasAccess, loading };
};

export default useRoleAccess;