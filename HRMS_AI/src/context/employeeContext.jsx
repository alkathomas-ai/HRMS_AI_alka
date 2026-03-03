import { createContext, useMemo } from "react";

export const EmployeeContext = createContext();

export const EmployeeProvider = ({ children, value }) => {
  const memoizedValue = useMemo(() => value, [value.searchResult]);
  return <EmployeeContext.Provider value={memoizedValue}>{children}</EmployeeContext.Provider>;
};