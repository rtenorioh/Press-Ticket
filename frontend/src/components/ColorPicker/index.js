import { Dialog } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { ChromePicker } from "react-color";

const ColorPicker = ({ onChange, currentColor, handleClose, open, theme }) => {
  const [selectedColor, setSelectedColor] = useState(currentColor);

  useEffect(() => {
    setSelectedColor(currentColor);
  }, [currentColor]);

  const handleChange = (color) => {
    setSelectedColor(color.hex);
    onChange(color.hex);
  };

  const handleSave = () => {
    handleClose();
  };

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="color-picker-dialog"
      open={open}
      maxWidth="xs"
    >
      <div
        style={{
          padding: 16,
          backgroundColor: theme?.palette?.background?.default || "#f5f5f5",
          borderRadius: 8,
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "100%" }}>
          <ChromePicker
            color={selectedColor}
            onChange={handleChange}
            disableAlpha={false}
            styles={{
              default: {
                picker: {
                  boxShadow: "none",
                  borderRadius: "4px",
                },
              },
            }}
          />
        </div>
        <div style={{ marginTop: 16 }}>
          <button
            onClick={handleSave}
            style={{
              padding: "10px 20px",
              border: "none",
              backgroundColor: theme?.palette?.primary?.main || "#4caf50",
              color: "#ffffff",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "bold",
              textTransform: "uppercase",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor =
                theme?.palette?.primary?.dark || "#388e3c";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor =
                theme?.palette?.primary?.main || "#4caf50";
            }}
          >
            Salvar
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default ColorPicker;