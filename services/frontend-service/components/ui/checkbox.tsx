import * as React from "react";
import { Check } from "lucide-react";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, checked, onCheckedChange, ...props }, ref) => {
        const [localChecked, setLocalChecked] = React.useState(checked || false);

        React.useEffect(() => {
            if (checked !== undefined) {
                setLocalChecked(checked);
            }
        }, [checked]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const isChecked = e.target.checked;
            setLocalChecked(isChecked);
            if (onCheckedChange) {
                onCheckedChange(isChecked);
            }
        };

        return (
            <div className="flex items-center select-none">
                <input
                    type="checkbox"
                    checked={localChecked}
                    onChange={handleChange}
                    ref={ref}
                    className="sr-only"
                    {...props}
                />
                <div
                    onClick={() => {
                        const next = !localChecked;
                        setLocalChecked(next);
                        if (onCheckedChange) onCheckedChange(next);
                    }}
                    className={[
                        "flex items-center justify-center w-4 h-4 rounded border border-border/80 dark:border-gray-800 bg-background/50 transition-all duration-200 cursor-pointer",
                        localChecked
                            ? "bg-primary border-primary text-primary-foreground"
                            : "text-transparent"
                    ].join(" ")}
                >
                    {localChecked && <Check className="w-3 h-3" strokeWidth={3.5} />}
                </div>
            </div>
        );
    }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
