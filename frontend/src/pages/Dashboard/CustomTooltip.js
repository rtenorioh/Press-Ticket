import React from 'react';

const CustomTooltip = ({ payload, label, active }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ backgroundColor: "#333", borderRadius: "4px", outline: "none", padding: "10px" }}>
                <div style={{ color: "white", fontWeight: "600", fontSize: "13px" }}>{label}</div>
                <div style={{ color: "white", fontWeight: "400", fontSize: "13px" }}>{`${payload[0].name}: ${payload[0].value}`}</div>
            </div>
        );
    }
    return null;
};

export default CustomTooltip;
