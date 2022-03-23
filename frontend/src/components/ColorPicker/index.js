import { Dialog } from "@material-ui/core";
import React, { useState } from "react";

import { GithubPicker } from "react-color";

const ColorPicker = ({ onChange, currentColor, handleClose, open }) => {
  const [selectedColor, setSelectedColor] = useState(currentColor);
  const colors = [
    "#DCDCDC",
    "#FFFAF0",
    "#FDF5E6",
    "#FAF0E6",
    "#FAEBD7",
    "#FFEFD5",
    "#FFEBCD",
    "#FFE4C4",
    "#FFDAB9",
    "#FFDEAD",
    "#FFE4B5",
    "#FFF8DC",
    "#FFFFF0",
    "#FFFACD",
    "#E6E6FA",
    "#FFE4E1",
    "#FFFFFF",
    "#000000",
    "#2F4F4F",
    "#696969",
    "#708090",
    "#778899",
    "#BEBEBE",
    "#D3D3D3",
    "#191970",
    "#000080",
    "#6495ED",
    "#483D8B",
    "#6A5ACD",
    "#7B68EE",
    "#8470FF",
    "#0000CD",
    "#4169E1",
    "#0000FF",
    "#1E90FF",
    "#00BFFF",
    "#87CEEB",
    "#87CEFA",
    "#4682B4",
    "#B0C4DE",
    "#ADD8E6",
    "#B0E0E6",
    "#AFEEEE",
    "#00CED1",
    "#48D1CC",
    "#40E0D0",
    "#00FFFF",
    "#E0FFFF",
    "#5F9EA0",
    "#66CDAA",
    "#7FFFD4",
    "#006400",
    "#556B2F",
    "#8FBC8F",
    "#2E8B57",
    "#3CB371",
    "#20B2AA",
    "#98FB98",
    "#00FF7F",
    "#7CFC00",
    "#00FF00",
    "#7FFF00",
    "#00FA9A",
    "#ADFF2F",
    "#32CD32",
    "#9ACD32",
    "#228B22",
    "#6B8E23",
    "#BDB76B",
    "#EEE8AA",
    "#FAFAD2",
    "#FFFFE0",
    "#FFFF00",
    "#FFD700",
    "#EEDD82",
    "#DAA520",
    "#B8860B",
    "#BC8F8F",
    "#CD5C5C",
    "#8B4513",
    "#A0522D",
    "#CD853F",
    "#DEB887",
    "#F5F5DC",
    "#F5DEB3",
    "#F4A460",
    "#D2B48C",
    "#D2691E",
    "#B22222",
    "#A52A2A",
    "#E9967A",
    "#FA8072",
    "#FFA07A",
    "#FFA500",
    "#FF8C00",
    "#FF7F50",
    "#F08080",
    "#FF6347",
    "#FF4500",
    "#FF0000",
    "#FF69B4",
    "#FF1493",
    "#FFC0CB",
    "#FFB6C1",
    "#DB7093",
    "#B03060",
    "#C71585",
    "#D02090",
    "#FF00FF",
    "#EE82EE",
    "#DDA0DD",
    "#DA70D6",
    "#BA55D3",
    "#9932CC",
    "#9400D3",
    "#8A2BE2",
    "#A020F0",
    "#9370DB",
    "#D8BFD8",
    "#FFFAFA",
  ];

  const handleChange = (color) => {
    setSelectedColor(color.hex);
    handleClose();
  };

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      open={open}
      maxWidth="xs"
      paperFullWidth
    >
      <GithubPicker
        width={"100%"}
        triangle="hide"
        color={selectedColor}
        colors={colors}
        onChange={handleChange}
        onChangeComplete={(color) => onChange(color.hex)}
      />
    </Dialog>
  );
};

export default ColorPicker;
