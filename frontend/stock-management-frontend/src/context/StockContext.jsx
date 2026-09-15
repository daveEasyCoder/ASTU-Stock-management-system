import { createContext, useContext, useState } from "react";

const StockContext = createContext();

export const StockProvider  = ({ children }) => {

    const BASIC_URL = "https://stock-management-system-voxc.onrender.com";

    return (
        <StockContext.Provider
            value={{
                BASIC_URL
            }}
        >
            {children}
        </StockContext.Provider>
    );
};

export const useStock = () => {
    return useContext(StockContext);
};