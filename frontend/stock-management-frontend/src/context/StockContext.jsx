import { createContext, useContext, useState } from "react";

const StockContext = createContext();

export const StockProvider  = ({ children }) => {

    const BASIC_URL = "http://localhost:4000";

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