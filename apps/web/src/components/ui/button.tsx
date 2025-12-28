import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, asChild: _asChild = false, ...props }, ref) => {
  return (
    <button
      className={className}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
