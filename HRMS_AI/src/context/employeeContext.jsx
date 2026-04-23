import { createContext } from "react";

export const EmployeeContext = createContext();

export const EmployeeProvider = ({ children, value }) => {
  return <EmployeeContext.Provider value={value}>{children}</EmployeeContext.Provider>;
};