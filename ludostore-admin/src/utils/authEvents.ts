const AUTH_EXPIRED_EVENT = "admin-auth:expired";

export const emitAuthExpired = () => {
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
};

export const onAuthExpired = (handler: () => void) => {
  window.addEventListener(AUTH_EXPIRED_EVENT, handler);
  return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handler);
};
