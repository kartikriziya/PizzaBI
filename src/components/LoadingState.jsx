import React from "react"
import Loader from "./Loader"

export default function LoadingState({
  loading,
  children,
  message = null,
  size = "md",
  className = "",
  minHeight = "16rem",
}) {
  if (!loading) {
    return children
  }

  return (
    <div
      className={`flex items-center justify-center rounded-xl border border-pizzabi-muted/10 bg-pizzabi-main/40 ${className}`}
      style={{ minHeight }}
    >
      <Loader size={size} message={message} fullScreen={false} />
    </div>
  )
}
