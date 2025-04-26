import { Skeleton } from "@mui/material";
import React from "react";

const WithSkeleton = ({ loading, children, fullWidth }) => {
  return (
    <>
      {loading ? (
        <Skeleton width={fullWidth ? "100%" : undefined}>{children}</Skeleton>
      ) : (
        <>{children}</>
      )}
    </>
  );
};

export default WithSkeleton;
