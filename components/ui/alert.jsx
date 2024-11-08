import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const alertVariants = cva(
    "relative w-full rounded-lg border p-4",
    {
        variants: {
            variant: {
                default: "bg-background text-foreground",
                destructive:
                    "border-destructive/50 bg-red-100 text-red-800 dark:border-destructive",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
    <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
    />
))
Alert.displayName = "Alert"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("text-sm [&_p]:leading-relaxed", className)}
        {...props}
    />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertDescription }